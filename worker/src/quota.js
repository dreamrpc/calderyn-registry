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
