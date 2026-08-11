// Tests for quota.js: per-pool per-tier per-writer caps grouped by OOC.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  extractRpcUsername,
  getCharsByPoolTierAndOoc,
  getOocCharsAtPoolTier,
  getOocForForm,
  getTierLimits,
  checkTierQuota,
  checkGovSeatQuota,
  isCappedGovSeat,
  checkClubQuota,
  isCappedClubSubmission,
  clubQuotaMessage,
  clubQuotaUsage,
  findDuplicatePowerballCaptains,
  findWritersWithMultipleHounds,
  checkHoundQuota,
  isHoundSubmission,
  getHoundsLimit,
  checkUnsanctionedQuota,
  getUnsanctionedCharsByOoc,
  getUnsanctionedLimit,
  submissionIsUnsanctioned,
  submissionPool,
} from "./quota.js";
import { lookupOocByRpc, normalize, KNOWN_OOC_NAMES } from "./writers.js";

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(here, "../../data.js");
const data = readFileSync(dataPath, "utf-8");

let failed = 0;
function test(name, fn) {
  try { fn(); console.log("✓", name); }
  catch (e) { failed++; console.error("✗", name, "\n  ", e.message); }
}
function assertEq(a, b, msg) {
  if (a !== b) throw new Error(`${msg||"assertEq"}\n  expected: ${JSON.stringify(b)}\n  actual:   ${JSON.stringify(a)}`);
}
function assertTrue(v, msg) { if (!v) throw new Error(msg || "expected truthy"); }
function assertFalse(v, msg) { if (v) throw new Error(msg || "expected falsy"); }

// ─── writers.js ────────────────────────────────────────────────────────
test("writers: normalize + Star account lookup", () => {
  assertEq(normalize("Black+Mass"), "black mass");
  assertEq(lookupOocByRpc("Crown."), "Star");
  assertEq(lookupOocByRpc("nocturne."), "Star");
});
test("writers: BLACK+VEIN is Tyler", () => {
  assertEq(lookupOocByRpc("BLACK+VEIN"), "Tyler");
});
test("writers: KNOWN_OOC_NAMES is sorted + populated", () => {
  assertTrue(KNOWN_OOC_NAMES.includes("Star"));
  const sorted = [...KNOWN_OOC_NAMES].sort();
  assertEq(KNOWN_OOC_NAMES.join(","), sorted.join(","));
});

// ─── extractRpcUsername ────────────────────────────────────────────────
test("extractRpcUsername: standard URL", () => {
  assertEq(extractRpcUsername("https://roleplay.chat/profile.php?user=upchuck"), "upchuck");
});
test("extractRpcUsername: preserves +", () => {
  assertEq(extractRpcUsername("https://roleplay.chat/profile.php?user=blood+eagle"), "blood+eagle");
});
test("extractRpcUsername: /u/ path form", () => {
  assertEq(extractRpcUsername("https://www.roleplay.chat/u/Zephyr"), "Zephyr");
});
test("extractRpcUsername: /p/ path form", () => {
  assertEq(extractRpcUsername("https://www.roleplay.chat/p/Princeton"), "Princeton");
});
test("extractRpcUsername: /users/ path form", () => {
  assertEq(extractRpcUsername("https://roleplay.chat/users/Foo"), "Foo");
});
test("extractRpcUsername: /u/ stops at trailing slash", () => {
  assertEq(extractRpcUsername("https://roleplay.chat/u/Bar/"), "Bar");
});
test("extractRpcUsername: /u/ stops at ? and #", () => {
  assertEq(extractRpcUsername("https://roleplay.chat/u/Baz?ref=x"), "Baz");
  assertEq(extractRpcUsername("https://roleplay.chat/u/Qux#frag"), "Qux");
});
test("extractRpcUsername: ?user= wins when both forms present", () => {
  // Hypothetical mixed URL — query-string is the canonical form so
  // it takes precedence over the path segment.
  assertEq(extractRpcUsername("https://roleplay.chat/u/PathName?user=QueryName"), "QueryName");
});
test("extractRpcUsername: path form preserves + (URL-safe space)", () => {
  assertEq(extractRpcUsername("https://www.roleplay.chat/u/Some+Name"), "Some+Name");
});
test("extractRpcUsername: no recognised pattern → null", () => {
  assertEq(extractRpcUsername("https://example.com/profile/123"), null);
});

// ─── getTierLimits ────────────────────────────────────────────────────
test("getTierLimits: defaults when env unset — every tier hard-capped", () => {
  const l = getTierLimits({});
  assertEq(l["A-List"], 6);
  assertEq(l["B-List"], 9);
  assertEq(l["C-List"], 11);
  assertEq(l["D-List"], 12);
});
test("getTierLimits: env overrides parse as ints", () => {
  const l = getTierLimits({
    A_LIST_LIMIT_PER_WRITER: "3",
    B_LIST_LIMIT_PER_WRITER: "7",
    C_LIST_LIMIT_PER_WRITER: "15",
    D_LIST_LIMIT_PER_WRITER: "20",
  });
  assertEq(l["A-List"], 3);
  assertEq(l["B-List"], 7);
  assertEq(l["C-List"], 15);
  assertEq(l["D-List"], 20);
});

// ─── submissionPool ────────────────────────────────────────────────────
test("submissionPool: student form → student pool", () => {
  assertEq(submissionPool({ type: "student", form: {} }), "student");
});
test("submissionPool: strata → adult", () => {
  assertEq(submissionPool({ type: "strata", form: {} }), "adult");
});
test("submissionPool: outside → adult", () => {
  assertEq(submissionPool({ type: "outside", form: {} }), "adult");
});
test("submissionPool: collective → adult", () => {
  assertEq(submissionPool({ type: "collective", form: {} }), "adult");
});
test("submissionPool: unknown type → adult", () => {
  assertEq(submissionPool({ type: "anything-else", form: {} }), "adult");
});

// ─── getCharsByPoolTierAndOoc against real data.js ────────────────────
test("getCharsByPoolTierAndOoc: Star's student A-Listers land in student pool", () => {
  const star = getCharsByPoolTierAndOoc(data).get("student")?.get("A-List")?.get("Star") || new Set();
  // Tatiana is a student with tier A → student pool.
  assertTrue(star.has("Tatiana Morozova"), `Star student A-List: ${[...star].join(", ")}`);
});

test("getCharsByPoolTierAndOoc: Wilder's Princeton is in student pool", () => {
  const wilderStudent = getCharsByPoolTierAndOoc(data).get("student")?.get("A-List")?.get("Wilder") || new Set();
  assertTrue(wilderStudent.has("Princeton Ambrose"), `Wilder student A-List: ${[...wilderStudent].join(", ")}`);
});

test("getCharsByPoolTierAndOoc: same writer's student + adult buckets stay separate", () => {
  const byPool = getCharsByPoolTierAndOoc(data);
  for (const ooc of new Set([...byPool.values()].flatMap(byTier =>
    [...byTier.values()].flatMap(byOoc => [...byOoc.keys()])
  ))) {
    const studentChars = new Set();
    const adultChars = new Set();
    for (const [tier, byOoc] of (byPool.get("student") || new Map())) {
      for (const c of (byOoc.get(ooc) || new Set())) studentChars.add(c);
    }
    for (const [tier, byOoc] of (byPool.get("adult") || new Map())) {
      for (const c of (byOoc.get(ooc) || new Set())) adultChars.add(c);
    }
    // The same character should NEVER appear in both pools for the
    // same writer — pool classification is character-level, not
    // entry-level.
    for (const c of studentChars) {
      assertFalse(adultChars.has(c), `${ooc}: ${c} appears in both pools`);
    }
  }
});

// ─── getOocCharsAtPoolTier ────────────────────────────────────────────
test("getOocCharsAtPoolTier: unknown ooc → empty", () => {
  assertEq(getOocCharsAtPoolTier(data, "Nobody", "student", "A-List").size, 0);
  assertEq(getOocCharsAtPoolTier(data, null, "student", "A-List").size, 0);
});
test("getOocCharsAtPoolTier: 'A' and 'A-List' tier input give the same set", () => {
  const a = getOocCharsAtPoolTier(data, "Star", "student", "A");
  const b = getOocCharsAtPoolTier(data, "Star", "student", "A-List");
  assertEq([...a].sort().join(","), [...b].sort().join(","));
});

// ─── getOocForForm ────────────────────────────────────────────────────
test("getOocForForm: form.ooc takes precedence over rpcLink", () => {
  assertEq(getOocForForm({
    ooc: "Wilder",
    rpcLink: "https://x?user=Crown.", // would map to Star
  }), "Wilder");
});
test("getOocForForm: rpcLink fallback when no ooc", () => {
  assertEq(getOocForForm({ rpcLink: "https://x?user=upchuck" }), "Dream");
});
test("getOocForForm: null when neither resolves", () => {
  assertEq(getOocForForm({ ooc: "", rpcLink: "https://x?user=unknown" }), null);
});

// ─── checkTierQuota: student pool ─────────────────────────────────────
test("checkTierQuota: student A-List blocked at cap for a new char", () => {
  const v = checkTierQuota(data, {
    type: "student",
    form: { tier: "A-List", char: "Brand New", ooc: "Star" },
  }, { "A-List": 1, "B-List": 99, "C-List": 99 });
  assertEq(v.allowed, false);
  assertEq(v.pool, "student");
  assertEq(v.tier, "A-List");
});

test("checkTierQuota: student A-List existing-char → allowed at limit 1", () => {
  // Tatiana is already in Star's student A-List set, so adding another
  // Tatiana entry shouldn't grow the set.
  const v = checkTierQuota(data, {
    type: "student",
    form: { tier: "A-List", char: "Tatiana Morozova", ooc: "Star" },
  }, { "A-List": 1, "B-List": 99, "C-List": 99 });
  assertEq(v.allowed, true);
  assertEq(v.pool, "student");
});

// ─── checkTierQuota: pool independence ────────────────────────────────
test("checkTierQuota: student cap doesn't bleed into adult submissions", () => {
  // A writer maxed out on student A-Listers should still be able to
  // submit an adult-pool A-Lister (e.g. an outside character).
  const v = checkTierQuota(data, {
    type: "outside",
    form: { tier: "A-List", char: "New Adult", ooc: "Star" },
  }, { "A-List": 1, "B-List": 99, "C-List": 99 });
  // Even with limit 1 and Star's student A-List bucket > 1, the adult
  // pool is independent — if Star's adult A-List bucket fits, allowed.
  // (At time of writing she has no adult A-Listers in data.js.)
  assertEq(v.allowed, true, `verdict: ${JSON.stringify(v)}`);
  assertEq(v.pool, "adult");
});

test("checkTierQuota: adult cap doesn't bleed into student submissions", () => {
  // Verify the symmetric case using a synthetic-ish test against the
  // real data. Nothing in current data.js has Star at an adult tier,
  // so this is essentially a passthrough — but it confirms the pool
  // routing.
  const v = checkTierQuota(data, {
    type: "student",
    form: { tier: "A-List", char: "Another Student", ooc: "Star" },
  }, { "A-List": 99, "B-List": 99, "C-List": 99 });
  assertEq(v.allowed, true);
  assertEq(v.pool, "student");
});

// ─── checkTierQuota: B-List + C-List + D-List ─────────────────────────
test("checkTierQuota: B-List under cap → allowed", () => {
  const v = checkTierQuota(data, {
    type: "student",
    form: { tier: "B-List", char: "Whoever", ooc: "Star" },
  }, { "A-List": 5, "B-List": 99, "C-List": 99 });
  assertEq(v.allowed, true);
  assertEq(v.tier, "B-List");
});
test("checkTierQuota: D-List under cap → allowed (D is hard-capped now)", () => {
  // Star has 1 student D-Lister; default cap is 12.
  const v = checkTierQuota(data, {
    type: "student",
    form: { tier: "D-List", char: "Whoever", ooc: "Star" },
  }, getTierLimits({}));
  assertEq(v.allowed, true);
  assertEq(v.tier, "D-List");
});
test("checkTierQuota: D-List blocked at cap", () => {
  const v = checkTierQuota(data, {
    type: "student",
    form: { tier: "D-List", char: "One Too Many", ooc: "Star" },
  }, { "A-List": 99, "B-List": 99, "C-List": 99, "D-List": 1 });
  assertEq(v.allowed, false);
  assertEq(v.tier, "D-List");
  assertEq(v.limit, 1);
});
test("checkTierQuota: new default caps against real data (Star)", () => {
  // Star (student pool) sits at A 5, B 9, C 8 today. Under the new
  // 6 / 9 / 11 / 12 caps: one more A fits, B is full at exactly the
  // cap, one more C fits.
  const a = checkTierQuota(data, {
    type: "student", form: { tier: "A-List", char: "Sixth A", ooc: "Star" },
  }, getTierLimits({}));
  assertEq(a.allowed, true, `A verdict: ${JSON.stringify(a)}`);

  const b = checkTierQuota(data, {
    type: "student", form: { tier: "B-List", char: "Tenth B", ooc: "Star" },
  }, getTierLimits({}));
  assertEq(b.allowed, false, `B verdict: ${JSON.stringify(b)}`);
  assertEq(b.count, 9);
  assertEq(b.limit, 9);

  const c = checkTierQuota(data, {
    type: "student", form: { tier: "C-List", char: "Ninth C", ooc: "Star" },
  }, getTierLimits({}));
  assertEq(c.allowed, true, `C verdict: ${JSON.stringify(c)}`);
});

// ─── checkTierQuota: edge cases ───────────────────────────────────────
test("checkTierQuota: no tier on submission → allowed", () => {
  const v = checkTierQuota(data, {
    type: "faculty",
    form: { char: "Faculty char", ooc: "Star" },
  }, getTierLimits({}));
  assertEq(v.allowed, true);
});
test("checkTierQuota: unmapped writer, no ooc → allowed with warning", () => {
  const v = checkTierQuota(data, {
    type: "student",
    form: { tier: "A-List", char: "X", rpcLink: "https://x?user=unknown" },
  }, getTierLimits({}));
  assertEq(v.allowed, true);
  assertEq(v.warning, "no_ooc_identifier");
});
test("checkTierQuota: cross-account counting via rpcLink fallback", () => {
  // Submit via Hopper (one of Star's accounts). Student pool count
  // should include Star's other accounts' students.
  const v = checkTierQuota(data, {
    type: "student",
    form: {
      tier: "A-List",
      char: "From Hopper",
      rpcLink: "https://roleplay.chat/profile.php?user=Hopper",
    },
  }, { "A-List": 1, "B-List": 99, "C-List": 99 });
  assertEq(v.allowed, false);
  assertEq(v.pool, "student");
});
test("checkTierQuota: PRIVACY — verdict has no character list field", () => {
  const v = checkTierQuota(data, {
    type: "student",
    form: { tier: "A-List", char: "X", ooc: "Star" },
  }, { "A-List": 1, "B-List": 99, "C-List": 99 });
  assertFalse("existingChars" in v, "verdict must not include existingChars");
  assertFalse("chars" in v, "verdict must not include chars");
});

// ─── Per-section gov-seat caps ────────────────────────────────────────
const RA_SECTION = "STUDENT COUNCIL — RESIDENT ASSISTANTS";

test("isCappedGovSeat: true for capped sections, false otherwise", () => {
  assertTrue(isCappedGovSeat({ govSection: RA_SECTION }));
  assertTrue(isCappedGovSeat({ govSection: "EVENT COMMITTEE" }));
  assertTrue(isCappedGovSeat({ optGovSection: "EVENT COMMITTEE" }));
  assertFalse(isCappedGovSeat({ govSection: "OFFICE OF THE PRESIDENT" }));
  assertFalse(isCappedGovSeat({}));
  assertFalse(isCappedGovSeat(null));
});

// Senior RA — limit 1, against real data.js (also proves the cap's
// section name matches the em-dash in data.js: a mismatch would find no
// seats and this block assertion would fail).
test("checkGovSeatQuota: a writer with an RA is blocked from a second (real data)", () => {
  // Storm already holds the Orenne Senior RA (Jason McTavish).
  const v = checkGovSeatQuota(data, {
    type: "gov",
    form: {
      govSection: RA_SECTION,
      govSeat: "Grimere Rep · Senior RA",
      char: "Damian Hollister",
      rpcLink: "https://roleplay.chat/profile.php?user=Silverweave", // → Storm
    },
  });
  assertEq(v.allowed, false, JSON.stringify(v));
  assertEq(v.kind, "gov-seat");
  assertEq(v.label, "Senior RA");
  assertEq(v.count, 1);
  assertEq(v.limit, 1);
});

test("checkGovSeatQuota: re-approving the writer's existing RA char is allowed", () => {
  const v = checkGovSeatQuota(data, {
    type: "gov",
    form: {
      govSection: RA_SECTION,
      govSeat: "Orenne Rep · Senior RA",
      char: "Jason McTavish",
      rpcLink: "https://roleplay.chat/profile.php?user=stormcaller", // → Storm
    },
  });
  assertEq(v.allowed, true, JSON.stringify(v));
});

test("checkGovSeatQuota: a writer with no RA can take one", () => {
  const v = checkGovSeatQuota(data, {
    type: "gov",
    form: { govSection: RA_SECTION, govSeat: "Grimere Rep · Senior RA", char: "Someone New", ooc: "Wilder" },
  });
  assertEq(v.allowed, true, JSON.stringify(v));
  assertEq(v.count, 0);
});

// Event Committee — limit 2, against synthetic data with controlled OOC
// (Crown. and nocturne. both map to Star).
const EC_TWO = `window.CALDERYN = {
studentGov: [
  { section: "EVENT COMMITTEE", type: "appointed", note: "x", seats: [
    { pos: "Committee Chair", char: "EC One", link: "https://r?user=Crown." },
    { pos: "Committee Chair", char: "EC Two", link: "https://r?user=nocturne." },
    { pos: "Committee Chair" },
  ] },
],
};`;

test("checkGovSeatQuota: Event Committee blocks a third seat for one writer", () => {
  const v = checkGovSeatQuota(EC_TWO, {
    type: "gov",
    form: { govSection: "EVENT COMMITTEE", govSeat: "Committee Chair", char: "EC Three", ooc: "Star" },
  });
  assertEq(v.allowed, false, JSON.stringify(v));
  assertEq(v.label, "Event Committee");
  assertEq(v.count, 2);
  assertEq(v.limit, 2);
});

const EC_ONE = `window.CALDERYN = {
studentGov: [
  { section: "EVENT COMMITTEE", seats: [
    { pos: "Committee Chair", char: "EC One", link: "https://r?user=Crown." },
    { pos: "Committee Chair" },
  ] },
],
};`;

test("checkGovSeatQuota: Event Committee allows a second seat for one writer", () => {
  const v = checkGovSeatQuota(EC_ONE, {
    type: "gov",
    form: { govSection: "EVENT COMMITTEE", govSeat: "Committee Chair", char: "EC Two", ooc: "Star" },
  });
  assertEq(v.allowed, true, JSON.stringify(v));
  assertEq(v.count, 1);
});

test("checkGovSeatQuota: uncapped gov section bypasses the check", () => {
  const v = checkGovSeatQuota(data, {
    type: "gov",
    form: { govSection: "OFFICE OF THE PRESIDENT", govSeat: "Treasurer", char: "X", ooc: "Storm" },
  });
  assertEq(v.allowed, true);
  assertFalse("kind" in v, "uncapped section should short-circuit");
});

test("checkGovSeatQuota: unmapped writer → allowed with warning", () => {
  const v = checkGovSeatQuota(data, {
    type: "gov",
    form: { govSection: RA_SECTION, govSeat: "Grimere Rep · Senior RA", char: "X", rpcLink: "https://x?user=unknown" },
  });
  assertEq(v.allowed, true);
  assertEq(v.warning, "no_ooc_identifier");
});

test("checkGovSeatQuota: PRIVACY — verdict carries no character list", () => {
  const v = checkGovSeatQuota(data, {
    type: "gov",
    form: {
      govSection: RA_SECTION,
      govSeat: "Grimere Rep · Senior RA",
      char: "Damian Hollister",
      rpcLink: "https://roleplay.chat/profile.php?user=Silverweave",
    },
  });
  assertFalse("chars" in v, "verdict must not include chars");
  assertFalse("owned" in v, "verdict must not include owned set");
});

// ─── Powerball captaincy invariant ────────────────────────────────────
test("findDuplicatePowerballCaptains: real data.js has none", () => {
  const dups = findDuplicatePowerballCaptains(data);
  assertEq(dups.length, 0, JSON.stringify(dups));
});

test("findDuplicatePowerballCaptains: flags a writer captaining two teams", () => {
  // Crown. and nocturne. both map to Star.
  const dup = `window.CALDERYN = {
clubs: [ { name: "Powerball", teams: [
  { house: "Valaris", positions: [ { pos: "Goalkeeper", captain: true, char: "Cap A", link: "https://r?user=Crown." } ] },
  { house: "Orenne", positions: [ { pos: "Playmaker", captain: true, char: "Cap B", link: "https://r?user=nocturne." } ] },
] } ],
};`;
  const dups = findDuplicatePowerballCaptains(dup);
  assertEq(dups.length, 1, JSON.stringify(dups));
  assertEq(dups[0].ooc, "Star");
});

// ─── H.O.U.N.D.S. one-seat-per-writer invariant ──────────────────────
test("findWritersWithMultipleHounds: real data.js has none", () => {
  const dups = findWritersWithMultipleHounds(data);
  assertEq(dups.length, 0, JSON.stringify(dups));
});

test("findWritersWithMultipleHounds: flags a writer holding two Hound seats", () => {
  // Crown. and nocturne. both map to Star — two accounts, one writer.
  const dup = `window.CALDERYN = {
faculty: [ { section: "H.O.U.N.D.S.", rows: [
  { role: "Founder · Handler", char: "Nathan Maddock", link: "https://r?user=Gauging+The+Room" },
  { role: "Hound", char: "Hound A", link: "https://r?user=Crown." },
  { role: "Hound", char: "Hound B", link: "https://r?user=nocturne." },
] } ],
};`;
  const dups = findWritersWithMultipleHounds(dup);
  assertEq(dups.length, 1, JSON.stringify(dups));
  assertEq(dups[0].ooc, "Star");
});

// ─── H.O.U.N.D.S. applyable per-writer cap ────────────────────────────
test("isHoundSubmission: true only for the Hounds section", () => {
  assertTrue(isHoundSubmission({ facultySection: "H.O.U.N.D.S." }));
  assertFalse(isHoundSubmission({ facultySection: "SUPPORT STAFF" }));
  assertFalse(isHoundSubmission({}));
});

test("getHoundsLimit: default 1, env override", () => {
  assertEq(getHoundsLimit({}), 1);
  assertEq(getHoundsLimit({ HOUNDS_LIMIT_PER_WRITER: "2" }), 2);
});

test("checkHoundQuota: a writer with a hound is blocked from a second", () => {
  // Crown. and nocturne. both map to Star — two accounts, one writer.
  const text = `window.CALDERYN = {
faculty: [ { section: "H.O.U.N.D.S.", rows: [
  { role: "Hound", char: "Hound A", link: "https://r?user=Crown." },
] } ],
};`;
  const v = checkHoundQuota(text, {
    type: "faculty",
    form: { facultySection: "H.O.U.N.D.S.", facultyRole: "Hound", char: "Hound B", rpcLink: "https://r?user=nocturne." },
  }, 1);
  assertFalse(v.allowed);
  assertEq(v.kind, "hound");
  assertEq(v.count, 1);
});

test("checkHoundQuota: a writer with no hound can take one", () => {
  const text = `window.CALDERYN = { faculty: [ { section: "H.O.U.N.D.S.", rows: [] } ] };`;
  const v = checkHoundQuota(text, {
    type: "faculty",
    form: { facultySection: "H.O.U.N.D.S.", char: "New Hound", rpcLink: "https://r?user=Crown." },
  }, 1);
  assertTrue(v.allowed);
});

test("checkHoundQuota: re-approving the writer's existing hound is allowed", () => {
  const text = `window.CALDERYN = {
faculty: [ { section: "H.O.U.N.D.S.", rows: [
  { role: "Hound", char: "Hound A", link: "https://r?user=Crown." },
] } ],
};`;
  const v = checkHoundQuota(text, {
    type: "faculty",
    form: { facultySection: "H.O.U.N.D.S.", char: "Hound A", rpcLink: "https://r?user=nocturne." },
  }, 1);
  assertTrue(v.allowed);
});

test("checkHoundQuota: non-hound faculty submission bypasses the check", () => {
  const v = checkHoundQuota(data, {
    type: "faculty",
    form: { facultySection: "SUPPORT STAFF", char: "X", rpcLink: "https://r?user=Crown." },
  }, 1);
  assertTrue(v.allowed);
});

test("checkHoundQuota: PRIVACY — verdict carries no character list", () => {
  const text = `window.CALDERYN = {
faculty: [ { section: "H.O.U.N.D.S.", rows: [
  { role: "Hound", char: "Hound A", link: "https://r?user=Crown." },
] } ],
};`;
  const v = checkHoundQuota(text, {
    type: "faculty",
    form: { facultySection: "H.O.U.N.D.S.", char: "Hound B", rpcLink: "https://r?user=nocturne." },
  }, 1);
  assertFalse("chars" in v, "verdict must not include chars");
  assertFalse("owned" in v, "verdict must not include owned set");
});

// ─── Unsanctioned-character cap ──────────────────────────────────────
test("getUnsanctionedLimit: default 5, env override", () => {
  assertEq(getUnsanctionedLimit({}), 5);
  assertEq(getUnsanctionedLimit({ UNSANCTIONED_LIMIT_PER_WRITER: "3" }), 3);
});

test("submissionIsUnsanctioned: collective-join + outside-unsanctioned only", () => {
  assertTrue(submissionIsUnsanctioned({ type: "collective", form: { collectiveFlow: "joinHero" } }));
  assertFalse(submissionIsUnsanctioned({ type: "collective", form: { collectiveFlow: "createNew" } }));
  assertTrue(submissionIsUnsanctioned({ type: "outside", form: { outsideStatus: "unsanctioned" } }));
  assertFalse(submissionIsUnsanctioned({ type: "outside", form: { outsideStatus: "inactive" } }));
  assertFalse(submissionIsUnsanctioned({ type: "student", form: { tier: "A-List" } }));
});

test("getUnsanctionedCharsByOoc: real data groups unsanctioned chars by writer", () => {
  const m = getUnsanctionedCharsByOoc(data);
  assertTrue((m.get("Star")   || new Set()).has("Briar Musgraves"), `Star: ${[...(m.get("Star")||[])].join(", ")}`);
  assertTrue((m.get("Wilder") || new Set()).has("Eirik Aslund"),    "Wilder has Eirik");
  assertTrue((m.get("Storm")  || new Set()).has("August Marlowe"),  "Storm has August");
});

// Synthetic — Crown. and nocturne. both map to Star → Star has 2 unsanctioned.
const UNSANC = `window.CALDERYN = {
powers: [
  { char: "Rogue One", status: "unsanctioned", power: "p", link: "https://r?user=Crown." },
  { char: "Rogue Two", status: "unsanctioned", power: "p", link: "https://r?user=nocturne." },
],
};`;

test("checkUnsanctionedQuota: blocked at cap for a new char", () => {
  const v = checkUnsanctionedQuota(UNSANC, {
    type: "collective", form: { collectiveFlow: "joinHero", char: "Rogue Three", ooc: "Star" },
  }, 2);
  assertEq(v.allowed, false, JSON.stringify(v));
  assertEq(v.kind, "unsanctioned");
  assertEq(v.count, 2);
  assertEq(v.limit, 2);
});

test("checkUnsanctionedQuota: under cap allowed", () => {
  const v = checkUnsanctionedQuota(UNSANC, {
    type: "collective", form: { collectiveFlow: "joinHero", char: "Rogue Three", ooc: "Star" },
  }, 5);
  assertEq(v.allowed, true, JSON.stringify(v));
  assertEq(v.count, 2);
});

test("checkUnsanctionedQuota: re-approving an existing char is allowed", () => {
  const v = checkUnsanctionedQuota(UNSANC, {
    type: "collective", form: { collectiveFlow: "joinHero", char: "Rogue One", ooc: "Star" },
  }, 2);
  assertEq(v.allowed, true, JSON.stringify(v));
});

test("checkUnsanctionedQuota: non-unsanctioned submission bypasses", () => {
  const v = checkUnsanctionedQuota(UNSANC, {
    type: "student", form: { tier: "A-List", char: "X", ooc: "Star" },
  }, 1);
  assertEq(v.allowed, true);
  assertFalse("kind" in v, "non-unsanctioned submission should short-circuit");
});

test("checkUnsanctionedQuota: PRIVACY — verdict carries no character list", () => {
  const v = checkUnsanctionedQuota(UNSANC, {
    type: "collective", form: { collectiveFlow: "joinHero", char: "Rogue Three", ooc: "Star" },
  }, 2);
  assertFalse("chars" in v, "no chars");
  assertFalse("owned" in v, "no owned set");
});

// ─── per-writer club caps ──────────────────────────────────────────────
// Ground truth in the real data.js at the time these were written:
//   Star    — Powerball mains {Enzo, Ariana} reserves {Roan};
//             Cheer mains {Velora, Nina} reserves {Emery, Daphne};
//             S&C {Nina (Soprano Lead), Eira (Member)};
//             Debate {Lucrecia, Eira}; Drama {Velora}
//   Katniss — Powerball mains {Katniss Saunders}, no reserves
//   Dream   — Cheer mains {Stella (Captain), Tina}
//   Sin     — Cheer mains {Layla}

test("isCappedClubSubmission: capped clubs on both form shapes", () => {
  assertTrue(isCappedClubSubmission({ clubName: "Powerball" }), "club form");
  assertTrue(isCappedClubSubmission({ optClubName: "Debate Club" }), "student optional club");
  assertFalse(isCappedClubSubmission({ clubName: "Cape & Dagger" }), "uncapped club");
  assertFalse(isCappedClubSubmission({}), "no club");
});

test("club: Powerball — Star blocked from another main-team spot", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Powerball", clubTeam: "Saberis", clubPosition: "Defence", char: "Brand New", ooc: "Star" },
  });
  assertEq(v.allowed, false, JSON.stringify(v));
  assertEq(v.scope, "main-roster spots");
  assertEq(v.count, 2);
  assertEq(v.limit, 1);
});

test("club: Powerball — Star blocked from another reserve spot", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Powerball", clubTeam: "Grimere", clubPosition: "Reserve · Defence", char: "Brand New", ooc: "Star" },
  });
  assertEq(v.allowed, false, JSON.stringify(v));
  assertEq(v.scope, "reserve spots");
  assertEq(v.count, 1);
  assertEq(v.limit, 1);
});

test("club: Powerball — writer with a main but no reserve can take a reserve", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Powerball", clubTeam: "Orenne", clubPosition: "Reserve · Attack", char: "New Kid", ooc: "Katniss" },
  });
  assertEq(v.allowed, true, JSON.stringify(v));
});

test("club: Powerball — league staff (no team) is uncapped", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Powerball", clubPosition: "Head Coach", char: "Coach Char", ooc: "Star" },
  });
  assertEq(v.allowed, true, JSON.stringify(v));
});

test("club: Cheer Squad — Star blocked from a third main spot", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Cheer Squad", clubPosition: "Tumbler", char: "Brand New", ooc: "Star" },
  });
  assertEq(v.allowed, false, JSON.stringify(v));
  assertEq(v.scope, "main-roster spots");
  assertEq(v.count, 2);
  assertEq(v.limit, 2);
});

test("club: Cheer Squad — Star blocked from a third reserve spot", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Cheer Squad", clubPosition: "Alternate Base", char: "Brand New", ooc: "Star" },
  });
  assertEq(v.allowed, false, JSON.stringify(v));
  assertEq(v.scope, "reserve spots");
});

test("club: Cheer Squad — caps apply to everyone (Dream at 2 mains)", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Cheer Squad", clubPosition: "Flyer", char: "New Char", ooc: "Dream" },
  });
  assertEq(v.allowed, false, JSON.stringify(v));
});

test("club: Cheer Squad — writer under the cap can join", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Cheer Squad", clubPosition: "Base", char: "Second Char", ooc: "Sin" },
  });
  assertEq(v.allowed, true, JSON.stringify(v));
});

test("club: S&C — Star can still take a third non-lead Member slot", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Symphony & Choir", clubPosition: "Member", char: "Third Char", ooc: "Star" },
  });
  assertEq(v.allowed, true, JSON.stringify(v));
});

test("club: S&C — Star blocked from a second lead role", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Symphony & Choir", clubPosition: "Alto Lead", char: "Third Char", ooc: "Star" },
  });
  assertEq(v.allowed, false, JSON.stringify(v));
  assertEq(v.scope, "lead roles");
  assertEq(v.count, 1);
  assertEq(v.limit, 1);
});

test("club: S&C — re-approving the existing lead char is allowed", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Symphony & Choir", clubPosition: "Soprano Lead", char: "Nina Sterling Evergreen", ooc: "Star" },
  });
  assertEq(v.allowed, true, JSON.stringify(v));
});

test("club: Debate Club — Star at 2/2 is blocked", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Debate Club", clubPosition: "Novice", char: "Brand New", ooc: "Star" },
  });
  assertEq(v.allowed, false, JSON.stringify(v));
  assertEq(v.scope, "positions");
  assertEq(v.count, 2);
  assertEq(v.limit, 2);
});

test("club: Debate Club — re-approving an existing char is allowed", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Debate Club", clubPosition: "Novice", char: "Eira Skarsen", ooc: "Star" },
  });
  assertEq(v.allowed, true, JSON.stringify(v));
});

test("club: Drama Society — Star at 1/2 can take one more", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Drama Society", clubPosition: "Actor", char: "Second Char", ooc: "Star" },
  });
  assertEq(v.allowed, true, JSON.stringify(v));
});

test("club: Student form's optional club position is capped too", () => {
  const v = checkClubQuota(data, {
    type: "student",
    form: { tier: "C-List", char: "New Student", ooc: "Star", optClubName: "Debate Club", optClubPosition: "Novice" },
  });
  assertEq(v.allowed, false, JSON.stringify(v));
  assertEq(v.club, "Debate Club");
});

test("club: unknown writer passes with a warning (fail-open)", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Debate Club", clubPosition: "Novice", char: "X", rpcLink: "https://x?user=totally-unknown" },
  });
  assertEq(v.allowed, true, JSON.stringify(v));
  assertEq(v.warning, "no_ooc_identifier");
});

test("club: uncapped club short-circuits", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Cape & Dagger", clubPosition: "Reporter", char: "X", ooc: "Star" },
  });
  assertEq(v.allowed, true);
  assertFalse("kind" in v, "uncapped club should short-circuit");
});

test("club: PRIVACY — verdict carries no character list or OOC name", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Debate Club", clubPosition: "Novice", char: "Brand New", ooc: "Star" },
  });
  assertFalse("chars" in v, "no chars");
  assertFalse("owned" in v, "no owned set");
  assertFalse("ooc" in v, "no ooc on club verdicts");
});

test("club: Swim Team + Engineering Club are capped clubs", () => {
  assertTrue(isCappedClubSubmission({ clubName: "Swim Team" }), "swim team capped");
  assertTrue(isCappedClubSubmission({ optClubName: "Engineering Club" }), "engineering club capped");
});

test("club: Swim Team — fresh roster, any writer can join (real data)", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Swim Team", clubPosition: "Freestyle", char: "New Swimmer", ooc: "Star" },
  });
  assertEq(v.allowed, true, JSON.stringify(v));
  assertEq(v.count, 0);
});

test("club: Engineering Club — fresh roster, any writer can join (real data)", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Engineering Club", clubPosition: "Member", char: "New Builder", ooc: "Skully" },
  });
  assertEq(v.allowed, true, JSON.stringify(v));
  assertEq(v.count, 0);
});

// Synthetic roster: one writer (Star, via two of her RPC accounts)
// already holding 2 positions — the third is blocked at the 2-cap.
const SWIM_AT_CAP = `window.CALDERYN = {
clubs: [
  {
    name: "Swim Team",
    positions: [
      { pos: "Captain", char: "Swimmer One", link: "https://roleplay.chat/profile.php?user=Crown." },
      { pos: "Butterfly", char: "Swimmer Two", link: "https://roleplay.chat/profile.php?user=Svalinn" },
      { pos: "Freestyle" },
    ],
  },
  {
    name: "Engineering Club",
    positions: [
      { pos: "President", char: "Builder One", link: "https://roleplay.chat/profile.php?user=Crown." },
      { pos: "Software", char: "Builder Two", link: "https://roleplay.chat/profile.php?user=Svalinn" },
      { pos: "Member" },
    ],
  },
],
};`;

test("club: Swim Team — writer at 2/2 is blocked (synthetic)", () => {
  const v = checkClubQuota(SWIM_AT_CAP, {
    type: "club",
    form: { clubName: "Swim Team", clubPosition: "Freestyle", char: "Swimmer Three", ooc: "Star" },
  });
  assertEq(v.allowed, false, JSON.stringify(v));
  assertEq(v.scope, "positions");
  assertEq(v.count, 2);
  assertEq(v.limit, 2);
});

test("club: Swim Team — re-approving an existing char is allowed (synthetic)", () => {
  const v = checkClubQuota(SWIM_AT_CAP, {
    type: "club",
    form: { clubName: "Swim Team", clubPosition: "Freestyle", char: "Swimmer One", ooc: "Star" },
  });
  assertEq(v.allowed, true, JSON.stringify(v));
});

test("club: Engineering Club — writer at 2/2 is blocked (synthetic)", () => {
  const v = checkClubQuota(SWIM_AT_CAP, {
    type: "club",
    form: { clubName: "Engineering Club", clubPosition: "Member", char: "Builder Three", ooc: "Star" },
  });
  assertEq(v.allowed, false, JSON.stringify(v));
  assertEq(v.count, 2);
  assertEq(v.limit, 2);
});

test("club: athletics / cooking / chess / Supebrawl are capped clubs", () => {
  for (const c of ["Supe Athletics", "Cooking Club", "Chess Club", "Supebrawl"]) {
    assertTrue(isCappedClubSubmission({ clubName: c }), `${c} should be capped`);
  }
});

test("club: fresh rosters — athletics, cooking, chess allow first joins (real data)", () => {
  for (const c of ["Supe Athletics", "Cooking Club", "Chess Club"]) {
    const v = checkClubQuota(data, {
      type: "club",
      form: { clubName: c, clubPosition: "Member", char: "New Char", ooc: "Star" },
    });
    assertEq(v.allowed, true, `${c}: ${JSON.stringify(v)}`);
    assertEq(v.count, 0, `${c} count`);
  }
});

test("club: Supebrawl — one slot per writer (real data)", () => {
  // Dream seeds the ring with both Sven (Ringrunner) and Cesare
  // (Contender) — already over the 1-cap, so any further Dream entry
  // is blocked. Star holds Anton's contender slot — at cap, blocked.
  // A writer with no one in the ring can take a slot (after the in-RP
  // invite, which the form + submit gate enforce).
  const dream = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Supebrawl", clubPosition: "Contender", char: "Second Fighter", ooc: "Dream" },
  });
  assertEq(dream.allowed, false, JSON.stringify(dream));
  assertEq(dream.count, 2);
  assertEq(dream.limit, 1);

  const star = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Supebrawl", clubPosition: "Contender", char: "Challenger", ooc: "Star" },
  });
  assertEq(star.allowed, false, JSON.stringify(star));
  assertEq(star.count, 1);

  const wilder = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Supebrawl", clubPosition: "Contender", char: "New Blood", ooc: "Wilder" },
  });
  assertEq(wilder.allowed, true, JSON.stringify(wilder));
});

// ─── Dance Club — per-team + team-lead caps ───────────────────────────
// Seeds (all Dream's): Tina (Latin Coach), Stella (Ballet Dancer +
// Latin Dancer). Latin team holds 2 Dream chars; Tina is Dream's one
// team-lead. Gymnastics is its own club now (Sylvia captains it).

test("club: dance — third character on one team is blocked (perTeam 2)", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Dance Club", clubTeam: "Latin Dance", clubPosition: "Dancer", char: "Third Latin", ooc: "Dream" },
  });
  assertEq(v.allowed, false, JSON.stringify(v));
  assertEq(v.count, 2);
  assertEq(v.limit, 2);
  assertTrue(/Latin Dance team/.test(v.scope), v.scope);
});

test("club: dance — same writer fine on a different team (cross-team membership)", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Dance Club", clubTeam: "Ballet", clubPosition: "Dancer", char: "Second Ballet", ooc: "Dream" },
  });
  assertEq(v.allowed, true, JSON.stringify(v));
});

test("club: dance — second team-lead role is blocked (lead 1)", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Dance Club", clubTeam: "Contemporary", clubPosition: "Coach", char: "New Coach", ooc: "Dream" },
  });
  assertEq(v.allowed, false, JSON.stringify(v));
  assertEq(v.scope, "team-lead roles");
  assertEq(v.count, 1);
  assertEq(v.limit, 1);
});

test("club: dance — fresh writer can join and can lead", () => {
  const join = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Dance Club", clubTeam: "Street & Hip-Hop", clubPosition: "Dancer", char: "New Dancer", ooc: "Star" },
  });
  assertEq(join.allowed, true, JSON.stringify(join));
  const lead = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Dance Club", clubTeam: "Ballet", clubPosition: "Coach", char: "New Coach", ooc: "Star" },
  });
  assertEq(lead.allowed, true, JSON.stringify(lead));
});

test("club: clubQuotaUsage — live counts for the form readout", () => {
  const u = clubQuotaUsage(data, {
    ooc: "Dream", clubName: "Dance Club", clubTeam: "Latin Dance", clubPosition: "Dancer",
  });
  assertEq(u.club, "Dance Club");
  const team = u.buckets.find(b => /Latin Dance/.test(b.label));
  assertTrue(team, "has a Latin Dance bucket");
  assertEq(team.count, 2);
  assertEq(team.limit, 2);
  // Over-cap visibility: Dream already holds 2 ring entries vs cap 1.
  const sb = clubQuotaUsage(data, { ooc: "Dream", clubName: "Supebrawl", clubPosition: "Contender" });
  const tot = sb.buckets.find(b => b.label === "positions");
  assertEq(tot.count, 2);
  assertEq(tot.limit, 1);
  // Uncapped club → null (form shows nothing).
  assertEq(clubQuotaUsage(data, { ooc: "Dream", clubName: "Cape & Dagger", clubPosition: "Columnist" }), null);
});

test("club: Gymnastics — standalone club, capped at 2 total", () => {
  assertTrue(isCappedClubSubmission({ clubName: "Gymnastics" }), "gymnastics capped");
  // Dream holds Sylvia (Captain) — one of two slots used.
  const second = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Gymnastics", clubPosition: "Gymnast", char: "Second Gym Char", ooc: "Dream" },
  });
  assertEq(second.allowed, true, JSON.stringify(second));
  assertEq(second.count, 1);
  const fresh = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Gymnastics", clubPosition: "Gymnast", char: "New Gymnast", ooc: "Star" },
  });
  assertEq(fresh.allowed, true, JSON.stringify(fresh));
});

test("club: clubQuotaMessage explains the room-growth rationale", () => {
  const v = checkClubQuota(data, {
    type: "club",
    form: { clubName: "Debate Club", clubPosition: "Novice", char: "Brand New", ooc: "Star" },
  });
  const msg = clubQuotaMessage(v);
  assertTrue(/room for new writers/i.test(msg), "mentions room for new writers");
  assertTrue(/increase as the room grows/i.test(msg), "mentions caps growing");
  assertTrue(msg.includes("Debate Club"), "names the club");
});

if (failed) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log("\nquota.test.mjs — all green");
