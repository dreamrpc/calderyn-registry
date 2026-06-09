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
  findDuplicatePowerballCaptains,
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

// ─── getTierLimits ────────────────────────────────────────────────────
test("getTierLimits: defaults when env unset", () => {
  const l = getTierLimits({});
  assertEq(l["A-List"], 5);
  assertEq(l["B-List"], 8);
  assertEq(l["C-List"], 10);
  assertFalse("D-List" in l, "D-List intentionally absent → uncapped");
});
test("getTierLimits: env overrides parse as ints", () => {
  const l = getTierLimits({
    A_LIST_LIMIT_PER_WRITER: "3",
    B_LIST_LIMIT_PER_WRITER: "7",
    C_LIST_LIMIT_PER_WRITER: "15",
  });
  assertEq(l["A-List"], 3);
  assertEq(l["B-List"], 7);
  assertEq(l["C-List"], 15);
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
test("checkTierQuota: D-List always allowed", () => {
  const v = checkTierQuota(data, {
    type: "student",
    form: { tier: "D-List", char: "Whoever", ooc: "Star" },
  }, getTierLimits({}));
  assertEq(v.allowed, true);
  assertEq(v.tier, "D-List");
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

if (failed) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log("\nquota.test.mjs — all green");
