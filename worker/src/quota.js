// Per-writer per-pool tier-cap quota check.
//
// Rule: each OOC writer has TWO independent character pools — students
// and adults — and each pool gets its own tier caps:
//
//       A-List → max 5    A_LIST_LIMIT_PER_WRITER
//       B-List → max 8    B_LIST_LIMIT_PER_WRITER
//       C-List → max 10   C_LIST_LIMIT_PER_WRITER
//       D-List → uncapped
//
// Pool determination for an existing character:
//   powers[].status === "student"  → student pool
//   everything else                → adult pool
// heroLists slot entries default to "adult" unless the same character
// also has a powers[] row with status="student", in which case the
// student-pool classification wins (a student who's also a sponsored
// STRATA hero stays a student; their heroLists slot doesn't promote
// them).
//
// Pool determination for a new submission:
//   sub.type === "student"         → student pool
//   everything else (strata,
//     outside, collective-join,
//     anything else with a tier)   → adult pool
//
// Faculty / Club / Gov / Collective-Create-New forms have no tier and
// so don't trigger any quota check; they bypass this module entirely.
//
// Writers are grouped across all of their RPC accounts via
// worker/src/writers.js so a writer with multiple accounts contributes
// a single combined count per (pool, tier).
//
// PRIVACY: the OOC name never leaves the Worker. Verdicts return only
// pool / tier / counts — listing a writer's other characters next to a
// blocked submission would leak the RPC-account → OOC mapping to anyone
// watching the channel.

import { forEachArrayObject } from "./scanner.js";
import { lookupOocByRpc } from "./writers.js";

const DEFAULT_LIMITS = {
  "A-List": 5,
  "B-List": 8,
  "C-List": 10,
};

export function getTierLimits(env) {
  return {
    "A-List": readInt(env?.A_LIST_LIMIT_PER_WRITER, DEFAULT_LIMITS["A-List"]),
    "B-List": readInt(env?.B_LIST_LIMIT_PER_WRITER, DEFAULT_LIMITS["B-List"]),
    "C-List": readInt(env?.C_LIST_LIMIT_PER_WRITER, DEFAULT_LIMITS["C-List"]),
  };
}

// Per-writer cap on unsanctioned-status characters (rogue / collective /
// outside operators with no STRATA contract), counted across all of a
// writer's accounts regardless of tier. Env-configurable; default 5.
export function getUnsanctionedLimit(env) {
  return readInt(env?.UNSANCTIONED_LIMIT_PER_WRITER, 5);
}

function readInt(raw, fallback) {
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function extractRpcUsername(url) {
  if (!url) return null;
  const m = /[?&]user=([^&"]+)/.exec(String(url));
  if (!m) return null;
  return m[1];
}

function pickStringField(objText, key) {
  const re = new RegExp(`\\b${key}\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
  const m = re.exec(objText);
  if (!m) return null;
  return m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}

function entryOoc(objText) {
  const link = pickStringField(objText, "link");
  if (!link) return null;
  return lookupOocByRpc(extractRpcUsername(link));
}

export function getOocForForm(form) {
  if (!form) return null;
  if (form.ooc && String(form.ooc).trim()) return String(form.ooc).trim();
  return lookupOocByRpc(extractRpcUsername(form.rpcLink));
}

function canonicalTier(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  if (s === "A" || s === "A-List") return "A-List";
  if (s === "B" || s === "B-List") return "B-List";
  if (s === "C" || s === "C-List") return "C-List";
  if (s === "D" || s === "D-List") return "D-List";
  return null;
}

// Pool ID for a new submission. Student form → student pool; anything
// else with a tier → adult pool.
export function submissionPool(sub) {
  return sub?.type === "student" ? "student" : "adult";
}

// Build char-name → pool ID by scanning powers[]. A character without
// a powers[] entry is implicitly "adult" (no student status anywhere);
// callers default-fill that case.
function buildCharPools(text) {
  const pools = new Map();
  try {
    forEachArrayObject(text, ["powers"], (obj) => {
      const char = pickStringField(obj, "char");
      if (!char) return;
      const status = pickStringField(obj, "status");
      // First write wins. If two rows disagree, we prefer "student"
      // because the student form is the canonical record for students.
      if (pools.get(char) === "student") return;
      pools.set(char, status === "student" ? "student" : "adult");
    });
  } catch (err) {
    console.error("quota: char-pool scan failed:", err.message);
  }
  return pools;
}

// Map<pool, Map<tier, Map<ooc, Set<char>>>>. A character is counted in
// exactly one pool — their powers[].status decides, with a default of
// "adult" for entries seen only in heroLists.
export function getCharsByPoolTierAndOoc(text) {
  const charPools = buildCharPools(text);
  const out = new Map();
  const add = (pool, tier, ooc, char) => {
    if (!pool || !tier || !ooc || !char) return;
    if (!out.has(pool)) out.set(pool, new Map());
    const byTier = out.get(pool);
    if (!byTier.has(tier)) byTier.set(tier, new Map());
    const byOoc = byTier.get(tier);
    if (!byOoc.has(ooc)) byOoc.set(ooc, new Set());
    byOoc.get(ooc).add(char);
  };

  // powers[] — every tiered character should appear here.
  try {
    forEachArrayObject(text, ["powers"], (obj) => {
      const tier = canonicalTier(pickStringField(obj, "tier"));
      if (!tier) return;
      const char = pickStringField(obj, "char");
      const ooc = entryOoc(obj);
      const pool = charPools.get(char) || "adult";
      add(pool, tier, ooc, char);
    });
  } catch (err) {
    console.error("quota: powers scan failed:", err.message);
  }

  // heroLists slot rows: parent's tier is the source of truth; pool
  // inherits from the character's powers[] status when known
  // (student-overrides-heroLists), else defaults to "adult".
  for (const letter of ["A", "B", "C", "D"]) {
    try {
      forEachArrayObject(text, ["heroLists", { tier: letter }, "slots"], (obj) => {
        const char = pickStringField(obj, "char");
        const ooc = entryOoc(obj);
        const pool = charPools.get(char) || "adult";
        add(pool, canonicalTier(letter), ooc, char);
      });
    } catch (err) {
      if (!/no object matching/.test(err.message)) {
        console.error(`quota: heroLists[${letter}] scan failed:`, err.message);
      }
    }
  }

  return out;
}

// Set<char> for one (pool, ooc, tier) triple.
export function getOocCharsAtPoolTier(text, ooc, pool, tier) {
  const t = canonicalTier(tier);
  if (!ooc || !t || !pool) return new Set();
  return getCharsByPoolTierAndOoc(text).get(pool)?.get(t)?.get(ooc) || new Set();
}

// Verdict shape:
//   { allowed: true,  pool, tier, count, limit }
//   { allowed: false, pool, tier, count, newCount, limit, ooc }
//     (privacy: no character list, no OOC name in any
//     Discord-bound field)
export function checkTierQuota(text, sub, limits) {
  const form = sub.form || {};
  const tier = canonicalTier(form.tier);
  if (!tier) return { allowed: true };

  const limit = limits?.[tier];
  if (limit == null) return { allowed: true, tier };

  const ooc = getOocForForm(form);
  if (!ooc) return { allowed: true, tier, warning: "no_ooc_identifier" };

  const pool = submissionPool(sub);
  const owned = getOocCharsAtPoolTier(text, ooc, pool, tier);
  const isNewCharacter = form.char ? !owned.has(form.char) : true;
  if (isNewCharacter && (owned.size + 1) > limit) {
    return {
      allowed: false,
      ooc,
      pool,
      tier,
      count: owned.size,
      newCount: owned.size + 1,
      limit,
    };
  }
  return { allowed: true, ooc, pool, tier, count: owned.size, limit };
}

// ── Per-section gov-seat caps ────────────────────────────────────────
// Some Student-Government sections limit how many of their seats a single
// writer may hold, counted across all of the writer's RPC accounts (same
// OOC grouping as the tier quota). House Reps double as each house's
// senior Resident Assistant, so the RA council is capped at one per
// writer; the Event Committee is capped at two. Caps apply to the
// standalone Gov form (form.govSection) and to a Student form that also
// requests a gov seat (form.optGovSection).
//
// PRIVACY: like the tier quota, the verdict carries no character list
// and no OOC name in any Discord-bound field.
const GOV_SECTION_CAPS = {
  "STUDENT COUNCIL — RESIDENT ASSISTANTS": { limit: 1, label: "Senior RA" },
  "EVENT COMMITTEE":                       { limit: 2, label: "Event Committee" },
};

// The studentGov section a submission is asking to join, if any.
function requestedGovSection(form) {
  return (form && (form.govSection || form.optGovSection)) || null;
}

// True when a submission targets a capped gov section.
export function isCappedGovSeat(form) {
  const section = requestedGovSection(form);
  return !!section && Object.prototype.hasOwnProperty.call(GOV_SECTION_CAPS, section);
}

// Set<char> of the seats this writer already holds in `section`.
function getOocSeatsInSection(text, section, ooc) {
  const chars = new Set();
  if (!section || !ooc) return chars;
  try {
    forEachArrayObject(text, ["studentGov", { section }, "seats"], (obj) => {
      const char = pickStringField(obj, "char");
      if (!char) return;
      if (entryOoc(obj) === ooc) chars.add(char);
    });
  } catch (err) {
    // Fail-open: a scan failure must never block an approval.
    if (!/no object matching|key not found/.test(err.message)) {
      console.error("gov-seat scan failed:", err.message);
    }
  }
  return chars;
}

// Verdict shape mirrors checkTierQuota:
//   { allowed: true,  kind: "gov-seat", ... }
//   { allowed: false, kind: "gov-seat", section, label, count, limit }
export function checkGovSeatQuota(text, sub) {
  const form = sub?.form || {};
  const section = requestedGovSection(form);
  const cap = section ? GOV_SECTION_CAPS[section] : null;
  if (!cap) return { allowed: true };

  const ooc = getOocForForm(form);
  if (!ooc) return { allowed: true, kind: "gov-seat", warning: "no_ooc_identifier" };

  const owned = getOocSeatsInSection(text, section, ooc);
  // Re-approving a seat for a character the writer already holds one for
  // doesn't grow the set — allow it (mirrors the tier-quota rule for
  // adding a new role to an existing character).
  const isNewSeat = form.char ? !owned.has(form.char) : true;
  if (isNewSeat && owned.size + 1 > cap.limit) {
    return { allowed: false, kind: "gov-seat", section, label: cap.label, count: owned.size, limit: cap.limit };
  }
  return { allowed: true, kind: "gov-seat", section, label: cap.label, count: owned.size, limit: cap.limit };
}

// ── Powerball captaincy invariant ────────────────────────────────────
// A writer may captain at most one Powerball team. Captaincy is a manual
// `captain: true` flag on a team position — it is never set through a
// form, so it can't be blocked at approval time. This data-integrity
// helper lets the test suite (and any pre-deploy validation) catch a
// writer who ends up holding the C for two houses.
const POWERBALL_HOUSES = ["Valaris", "Orenne", "Saberis", "Grimere"];

// Map<ooc, Set<house>> of every filled captain seat, grouped by writer.
export function getPowerballCaptainsByOoc(text) {
  const byOoc = new Map();
  for (const house of POWERBALL_HOUSES) {
    try {
      forEachArrayObject(text, ["clubs", { name: "Powerball" }, "teams", { house }, "positions"], (obj) => {
        if (!/\bcaptain\s*:\s*true\b/.test(obj)) return;
        const char = pickStringField(obj, "char");
        if (!char) return;
        const ooc = entryOoc(obj);
        if (!ooc) return;
        if (!byOoc.has(ooc)) byOoc.set(ooc, new Set());
        byOoc.get(ooc).add(house);
      });
    } catch (err) {
      if (!/no object matching|key not found/.test(err.message)) {
        console.error(`powerball captain scan failed [${house}]:`, err.message);
      }
    }
  }
  return byOoc;
}

// Array of { ooc, houses } for any writer captaining more than one team.
export function findDuplicatePowerballCaptains(text) {
  const out = [];
  for (const [ooc, houses] of getPowerballCaptainsByOoc(text)) {
    if (houses.size > 1) out.push({ ooc, houses: [...houses] });
  }
  return out;
}

// ── Per-writer club caps ─────────────────────────────────────────────
// Keeps club rosters from being monopolised so there's room for new
// writers — caps rise as the room grows. Counted per OOC writer across
// all of their RPC accounts (same grouping as the tier quota):
//
//   Powerball        — 1 main-team spot + 1 reserve spot, across all
//                      four house teams (league staff is uncapped)
//   Cheer Squad      — 2 main-squad spots + 2 reserve (Alternate) spots
//   Symphony & Choir — 3 positions total, at most 1 of them a lead
//                      role (anything other than "Member")
//   Debate Club      — 2 positions total
//   Drama Society    — 2 positions total
//   Swim Team        — 2 positions total
//   Engineering Club — 2 positions total
//
// Caps fire twice: at submit time (handleSubmit returns a friendly
// explanation the form shows the writer before anything is posted)
// and again at approve time (belt-and-suspenders for submissions that
// were already pending when a cap landed, or stale payloads).
//
// PRIVACY: like the other quotas, verdicts carry counts only — no
// character list and no OOC name in any Discord-bound field.
const CLUB_CAPS = {
  "Powerball":        { main: 1, reserve: 1, teamsOnly: true },
  "Cheer Squad":      { main: 2, reserve: 2 },
  "Symphony & Choir": { total: 3, lead: 1 },
  "Debate Club":      { total: 2 },
  "Drama Society":    { total: 2 },
  "Swim Team":        { total: 2 },
  "Engineering Club": { total: 2 },
};

// Reserve-bench positions: Powerball uses "Reserve · X", Cheer Squad
// uses "Alternate X".
function isReservePos(pos) {
  return /^(reserve|alternate)\b/i.test(String(pos || "").trim());
}

// The club a submission is asking to join, if any. Covers the
// standalone Club form (clubName) and the Student form's optional
// club position (optClubName).
function requestedClub(form) {
  return (form && (form.clubName || form.optClubName)) || null;
}

// True when a submission targets a capped club.
export function isCappedClubSubmission(form) {
  const club = requestedClub(form);
  return !!club && Object.prototype.hasOwnProperty.call(CLUB_CAPS, club);
}

// Sets of this writer's characters in `clubName`, bucketed for the cap
// checks. For Powerball only the four house-team rosters count — the
// club-level positions array is league staff, not players.
function getOocClubPositions(text, clubName, ooc) {
  const out = { all: new Set(), main: new Set(), reserve: new Set(), lead: new Set() };
  if (!clubName || !ooc) return out;
  const tally = (obj) => {
    const char = pickStringField(obj, "char");
    if (!char) return;
    if (entryOoc(obj) !== ooc) return;
    const pos = pickStringField(obj, "pos") || "";
    out.all.add(char);
    if (isReservePos(pos)) out.reserve.add(char);
    else out.main.add(char);
    if (pos && pos !== "Member") out.lead.add(char);
  };
  const paths = CLUB_CAPS[clubName]?.teamsOnly
    ? POWERBALL_HOUSES.map(h => ["clubs", { name: clubName }, "teams", { house: h }, "positions"])
    : [["clubs", { name: clubName }, "positions"]];
  for (const path of paths) {
    try {
      forEachArrayObject(text, path, tally);
    } catch (err) {
      // Fail-open: a scan failure must never block an approval.
      if (!/no object matching|key not found/.test(err.message)) {
        console.error(`club quota scan failed [${clubName}]:`, err.message);
      }
    }
  }
  return out;
}

// Verdict shape mirrors checkGovSeatQuota:
//   { allowed: true,  kind: "club", ... }
//   { allowed: false, kind: "club", club, scope, count, limit }
// `scope` is display copy for the bucket that's full ("positions",
// "lead roles", "main-roster spots", "reserve spots").
export function checkClubQuota(text, sub) {
  const form = sub?.form || {};
  const club = requestedClub(form);
  const cap = club ? CLUB_CAPS[club] : null;
  if (!cap) return { allowed: true };

  // Powerball league-staff applications (no team) aren't player slots.
  const team = form.clubTeam || form.optClubTeam || "";
  if (cap.teamsOnly && !team) return { allowed: true, kind: "club", club };

  const ooc = getOocForForm(form);
  if (!ooc) return { allowed: true, kind: "club", warning: "no_ooc_identifier" };

  const pos = String(form.clubPosition || form.optClubPosition || "");
  const owned = getOocClubPositions(text, club, ooc);
  const char = form.char || "";
  // Re-approving a position for a character already counted in a
  // bucket doesn't grow that bucket — allow it (mirrors the gov-seat
  // rule for toggling an existing approval).
  const grows = (set) => (char ? !set.has(char) : true);

  if (cap.total != null && grows(owned.all) && owned.all.size + 1 > cap.total) {
    return { allowed: false, kind: "club", club, scope: "positions", count: owned.all.size, limit: cap.total };
  }
  const wantsLead = !!pos && pos !== "Member";
  if (cap.lead != null && wantsLead && grows(owned.lead) && owned.lead.size + 1 > cap.lead) {
    return { allowed: false, kind: "club", club, scope: "lead roles", count: owned.lead.size, limit: cap.lead };
  }
  const wantsReserve = isReservePos(pos);
  if (cap.main != null && !wantsReserve && grows(owned.main) && owned.main.size + 1 > cap.main) {
    return { allowed: false, kind: "club", club, scope: "main-roster spots", count: owned.main.size, limit: cap.main };
  }
  if (cap.reserve != null && wantsReserve && grows(owned.reserve) && owned.reserve.size + 1 > cap.reserve) {
    return { allowed: false, kind: "club", club, scope: "reserve spots", count: owned.reserve.size, limit: cap.reserve };
  }
  return { allowed: true, kind: "club", club, count: owned.all.size };
}

// Shared copy for the submit-time block and the form hint: why caps
// exist. Discord's blocked embed builds its own variant inline.
export function clubQuotaMessage(verdict) {
  return (
    `${verdict.club} is at its per-writer cap for you: each writer may hold at most ` +
    `${verdict.limit} ${verdict.scope} there, counted across all of their characters ` +
    `and accounts, and you're at ${verdict.count}. To make sure there's enough room ` +
    `for new writers in the room, there are caps on how many characters you can have ` +
    `in a club — the caps will increase as the room grows.`
  );
}

// ── Unsanctioned-character cap ────────────────────────────────────────
// At most N unsanctioned-status characters per writer, counted across all
// of the writer's accounts (same OOC grouping as the tier quota). Unlike
// the tier caps, this counts by *status*, so it catches the typically
// tierless rogue / collective / outside characters that otherwise slip
// past A/B/C/D. Fires on approval of any submission that writes an
// unsanctioned powers[] row: a Collective "join" submission (the relay
// stamps those unsanctioned) or an Outside submission whose status is
// "unsanctioned".
//
// PRIVACY: verdict carries no character list or OOC name in any
// Discord-bound field.
export function submissionIsUnsanctioned(sub) {
  const form = sub?.form || {};
  if (sub?.type === "collective" && form.collectiveFlow !== "createNew") return true;
  if (sub?.type === "outside" && form.outsideStatus === "unsanctioned") return true;
  return false;
}

// Map<ooc, Set<char>> of every unsanctioned-status character.
export function getUnsanctionedCharsByOoc(text) {
  const out = new Map();
  try {
    forEachArrayObject(text, ["powers"], (obj) => {
      if (pickStringField(obj, "status") !== "unsanctioned") return;
      const char = pickStringField(obj, "char");
      const ooc = entryOoc(obj);
      if (!char || !ooc) return;
      if (!out.has(ooc)) out.set(ooc, new Set());
      out.get(ooc).add(char);
    });
  } catch (err) {
    console.error("unsanctioned scan failed:", err.message);
  }
  return out;
}

// Verdict shape mirrors checkTierQuota:
//   { allowed: true,  kind: "unsanctioned", ... }
//   { allowed: false, kind: "unsanctioned", ooc, count, limit }
export function checkUnsanctionedQuota(text, sub, limit) {
  if (limit == null) return { allowed: true };
  if (!submissionIsUnsanctioned(sub)) return { allowed: true };

  const ooc = getOocForForm(sub.form || {});
  if (!ooc) return { allowed: true, kind: "unsanctioned", warning: "no_ooc_identifier" };

  const owned = getUnsanctionedCharsByOoc(text).get(ooc) || new Set();
  const char = (sub.form || {}).char;
  const isNewChar = char ? !owned.has(char) : true;
  if (isNewChar && owned.size + 1 > limit) {
    return { allowed: false, kind: "unsanctioned", ooc, count: owned.size, limit };
  }
  return { allowed: true, kind: "unsanctioned", ooc, count: owned.size, limit };
}
