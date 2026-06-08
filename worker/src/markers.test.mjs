// Round-trip every Phase 1 + Phase 2 form type through buildInsertions
// + applyInsertions + removeBySubmissionId against the real data.js,
// then verify the file returns to its original text.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  buildInsertions,
  applyInsertions,
  removeBySubmissionId,
  countEntriesFor,
} from "./markers.js";

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(here, "../../data.js");
const original = readFileSync(dataPath, "utf-8");

let failed = 0;
function test(name, fn) {
  try { fn(); console.log("✓", name); }
  catch (e) { failed++; console.error("✗", name, "\n  ", e.stack?.split("\n").slice(0, 4).join("\n   ") || e.message); }
}
function assertEq(a, b, msg) {
  if (a !== b) throw new Error(`${msg || "assertEq"}\n  expected: ${JSON.stringify(b)?.slice(0,160)}\n  actual:   ${JSON.stringify(a)?.slice(0,160)}`);
}
function assertNotEq(a, b, msg) { if (a === b) throw new Error(msg || "values were equal"); }
function assertTrue(v, msg) { if (!v) throw new Error(msg || "expected truthy"); }

function roundTripCase({ name, id, sub, expectPlans, expectMarkers, marker }) {
  // expectMarkers defaults to expectPlans (single-line case); the
  // multi-line createNew entry has more markers than plans.
  const wantMarkers = expectMarkers ?? expectPlans;
  test(name, () => {
    const insertions = buildInsertions(sub);
    assertEq(insertions.length, expectPlans, "plan count");

    const inserted = applyInsertions(original, insertions);
    assertNotEq(inserted, original, "insert must change text");
    assertEq(countEntriesFor(inserted, id), wantMarkers, "// sub:id marker count");

    if (marker) {
      assertTrue(inserted.includes(marker), `inserted entry contains marker text: ${marker}`);
    }

    const removed = removeBySubmissionId(inserted, id);
    assertEq(countEntriesFor(removed, id), 0, "all entries removed");
    assertEq(removed, original, "round-trip insert+remove returns to original");
  });
}

// ─── Student (Phase 1 — marker insertions) ─────────────────────────
roundTripCase({
  name: "student: marker insertions for students + powers",
  id: "stu00001",
  sub: {
    id: "stu00001", type: "student",
    form: {
      char: "Stu Test", alias: "STU", house: "Saberis", year: "Freshman",
      track: "Heroes", tier: "B-List",
      power: "X", powerExpression: "Y", drawbacks: "Z",
      rpcLink: "https://example/x",
    },
  },
  expectPlans: 2,
});

// Fully-human student gets only the students[] line, not powers.
roundTripCase({
  name: "student: fully human → no powers insertion",
  id: "stuhuman",
  sub: {
    id: "stuhuman", type: "student",
    form: {
      char: "Human Test", alias: "", house: "Orenne", year: "Junior",
      track: "Sidekicks", tier: "C-List", fullyHuman: true,
      rpcLink: "https://example/h",
    },
  },
  expectPlans: 1,
});

// Student with an Optional Gov Seat — the seat must land in
// studentGov[<section>].seats too, not just students[] + powers[].
// Regression test for the original bug: the student form sends
// optGovSeat/optGovSection but buildStudent used to ignore them.
roundTripCase({
  name: "student: optional gov seat → studentGov[<section>].seats",
  id: "stuoptgv",
  sub: {
    id: "stuoptgv", type: "student",
    form: {
      char: "Opt Gov Test", alias: "OGT", house: "Grimere", year: "Sophomore",
      track: "Sidekicks", tier: "B-List",
      power: "P", powerExpression: "PE", drawbacks: "D",
      rpcLink: "https://example/og",
      optGovSeat: "Treasurer",
      optGovSection: "OFFICE OF THE PRESIDENT",
    },
  },
  // students + powers + gov seat = 3 insertions, 3 // sub: markers.
  expectPlans: 3,
});

// Student with an Optional Club position — same field-name mismatch
// fix on the club side.
roundTripCase({
  name: "student: optional club position → clubs[<club>].positions",
  id: "stuoptcb",
  sub: {
    id: "stuoptcb", type: "student",
    form: {
      char: "Opt Club Test", alias: "OCT", house: "Valaris", year: "Junior",
      track: "Heroes", tier: "C-List",
      power: "P", powerExpression: "PE", drawbacks: "D",
      rpcLink: "https://example/oc",
      optClubName: "Powerball",
      optClubTeam: "Valaris",
      optClubPosition: "Defence",
    },
  },
  expectPlans: 3,
});

// ─── Faculty (Phase 2 — path insertion + powers[] for non-human) ────
roundTripCase({
  name: "faculty: path into faculty[<section>].rows + powers entry",
  id: "fac00001",
  sub: {
    id: "fac00001", type: "faculty",
    form: {
      facultySection: "OFFICE OF THE DEAN",
      facultyRole: "Director of Admissions",
      char: "Fac Test", alias: "DEAN-ELECT",
      tier: "A-List",
      power: "P", powerExpression: "PE", drawbacks: "D",
      rpcLink: "https://example/f",
    },
  },
  // Two plans now: a faculty[].rows insertion AND a powers[] entry so
  // the quota scanner can count this character.
  expectPlans: 2,
});

roundTripCase({
  name: "faculty: fully human → only faculty[].rows, no powers entry",
  id: "fachuman",
  sub: {
    id: "fachuman", type: "faculty",
    form: {
      facultySection: "OFFICE OF THE DEAN",
      facultyRole: "Registrar",
      char: "Human Faculty", alias: "REG",
      tier: "D-List", fullyHuman: true,
      rpcLink: "https://example/h",
    },
  },
  expectPlans: 1,
});

// ─── STRATA hero list (Phase 2) ─────────────────────────────────────
roundTripCase({
  name: "strata: path into heroLists[<tier>].slots",
  id: "str00001",
  sub: {
    id: "str00001", type: "strata",
    form: {
      tier: "A-List", alias: "TESTHERO", char: "Strata Test",
      power: "P", powerExpression: "PE", drawbacks: "D",
      rpcLink: "https://example/s",
    },
  },
  expectPlans: 1,
});

// ─── Club (Phase 2 — with team) ─────────────────────────────────────
roundTripCase({
  name: "club: with team → clubs[<club>].teams[<team>].positions",
  id: "clb00001",
  sub: {
    id: "clb00001", type: "club",
    form: {
      clubName: "Powerball", clubTeam: "Valaris", clubPosition: "Defence",
      char: "Club Test",
      power: "P", powerExpression: "PE", drawbacks: "D",
      rpcLink: "https://example/c",
    },
  },
  expectPlans: 1,
});

// ─── Student Gov (Phase 2) ──────────────────────────────────────────
roundTripCase({
  name: "gov: path into studentGov[<section>].seats",
  id: "gov00001",
  sub: {
    id: "gov00001", type: "gov",
    form: {
      govSection: "OFFICE OF THE PRESIDENT",
      govSeat: "Treasurer", govTerm: "2026-27",
      char: "Gov Test",
      power: "P", powerExpression: "PE", drawbacks: "D",
      rpcLink: "https://example/g",
    },
  },
  expectPlans: 1,
});

// ─── Collective — Create New ────────────────────────────────────────
roundTripCase({
  name: "collective createNew: multi-line group appended to groups[]",
  id: "colcrtnw",
  sub: {
    id: "colcrtnw", type: "collective",
    form: {
      collectiveFlow: "createNew",
      newCollectiveName: "Test Collective",
      newCollectiveType: "Vigilante Cell",
      newCollectiveDesc: "A test collective.",
      newCollectiveColor: "#1234ab",
      newCollectiveBanner: "https://example/banner.png",
      newCollectiveMembers: [
        { alias: "A1", role: "Lead",  char: "C1" },
        { alias: "A2", role: "Wheel", char: "C2" },
      ],
    },
  },
  expectPlans: 1,
  // Collectives are hero-side only, so faction is hardcoded to "hero".
  // 1 wrapper line + 5 properties (name/type/status/faction/desc) +
  // color + banner + members: [ + 2 member lines + ], + }, = 13 lines.
  expectMarkers: 13,
});

// ─── Collective — Join existing ─────────────────────────────────────
roundTripCase({
  name: "collective join: appended to groups[<name>].members + powers",
  id: "coljoin1",
  sub: {
    id: "coljoin1", type: "collective",
    form: {
      collectiveFlow: "joinHero",
      collectiveName: "VANGUARD",
      collectiveRole: "Initiate",
      char: "Join Test", alias: "JOIN",
      tier: "B-List",
      power: "P", powerExpression: "PE", drawbacks: "D",
      rpcLink: "https://example/j",
    },
  },
  expectPlans: 2,
});

// ─── Outside ────────────────────────────────────────────────────────
roundTripCase({
  name: "outside: appended to outside[<section>].orgs[<org>].roles + powers",
  id: "out00001",
  sub: {
    id: "out00001", type: "outside",
    form: {
      outsideSection: "GOVERNMENT & CIVIC",
      outsideOrg: "Royal Borough of Greenwich",
      outsideRole: "Test Adviser",
      outsideStatus: "unsanctioned",
      tier: "C-List",
      char: "Out Test", alias: "OUT",
      power: "P", powerExpression: "PE", drawbacks: "D",
      rpcLink: "https://example/o",
    },
  },
  expectPlans: 2,
});

// ─── Idempotency: count-based short-circuit holds for both kinds ────
test("idempotency: applying twice doubles entries without short-circuit", () => {
  const sub = {
    id: "idemxxx1", type: "student",
    form: {
      char: "Idem", alias: "I", house: "Valaris", year: "Senior",
      track: "Heroes", tier: "A-List",
      power: "P", powerExpression: "PE", drawbacks: "D",
      rpcLink: "https://example/i",
    },
  };
  const ins = buildInsertions(sub);
  const once = applyInsertions(original, ins);
  const twice = applyInsertions(once, ins);
  assertEq(countEntriesFor(twice, sub.id), 4, "no built-in dedup — caller must guard via countEntriesFor");
});

// ─── Regression: club/gov rows must never emit empty power fields ─────
// A club or gov submission for an existing character carries no power
// info; the builders used to emit `power: , expression: , drawbacks: ,`,
// which is invalid JS — when it landed in data.js it blanked the entire
// site. The row must be pos/char(/term)/link only and parse as JS.
function assertValidObjectLine(line, label) {
  assertTrue(!/\bpower\s*:/.test(line), `${label}: must not emit power fields → ${line}`);
  const objText = line.replace(/\s*\/\/\s*sub:.*$/, "").replace(/,\s*$/, "");
  let obj;
  try { obj = eval(`(${objText})`); }
  catch (e) { throw new Error(`${label}: line is not valid JS → ${line}\n   ${e.message}`); }
  assertTrue(obj && typeof obj === "object", `${label}: did not parse to an object → ${line}`);
}

test("club: empty power → valid pos/char/link line (no `power: ,`)", () => {
  const [ins] = buildInsertions({
    id: "clubreg1", type: "club",
    form: { clubName: "Symphony & Choir", clubPosition: "Concertmaster", char: "Reg Club", rpcLink: "https://example/c" },
  });
  assertValidObjectLine(ins.lines[0], "club");
});

test("gov: empty power → valid pos/char/term/link line (no `power: ,`)", () => {
  const [ins] = buildInsertions({
    id: "govreg1", type: "gov",
    form: { govSection: "EVENT COMMITTEE", govSeat: "Committee Member", char: "Reg Gov", rpcLink: "https://example/g" },
  });
  assertValidObjectLine(ins.lines[0], "gov");
});

if (failed) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log("\nmarkers.test.mjs — all green");
