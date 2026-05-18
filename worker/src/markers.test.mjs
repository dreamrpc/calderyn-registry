// Standalone smoke test for markers.js. Run with:
//   node worker/src/markers.test.mjs
// Reads the real data.js, simulates an insert + remove of a sample
// Student submission, and verifies the file returns to its original
// text. Catches marker/regex regressions before they hit production.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { buildInsertions, applyInsertions, removeBySubmissionId, countEntriesFor } from "./markers.js";

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(here, "../../data.js");
const original = readFileSync(dataPath, "utf-8");

const sub = {
  id: "test1234",
  type: "student",
  form: {
    char: "Test Student",
    alias: "TEST ALIAS",
    house: "Saberis",
    year: "Freshman",
    track: "Heroes",
    tier: "B-List",
    power: "Test power · with middle dot",
    powerExpression: "Multi-line\nexpression with \"quotes\".",
    drawbacks: "Some drawbacks here.",
    rpcLink: "https://roleplay.chat/profile.php?user=test",
    fullyHuman: false,
  },
};

const insertions = buildInsertions(sub);
assertEq(insertions.length, 2, "student + powers insertion expected");
assertEq(insertions[0].marker, "students", "first insertion targets students");
assertEq(insertions[1].marker, "powers",   "second insertion targets powers");

const inserted = applyInsertions(original, insertions);
assertNotEq(inserted, original, "insert should change the file");
assertEq(countEntriesFor(inserted, sub.id), 2, "two // sub:id lines expected");

// Marker lines must still be present after insertion.
assertTrue(/\/\/\s*AUTO-INSERT:students\b/.test(inserted), "students marker preserved");
assertTrue(/\/\/\s*AUTO-INSERT:powers\b/.test(inserted),   "powers marker preserved");

// Inserted entries must sit immediately above the marker.
const studentMarkerLine = inserted.split("\n").findIndex(l => /\/\/\s*AUTO-INSERT:students\b/.test(l));
const beforeStudents    = inserted.split("\n")[studentMarkerLine - 1];
assertTrue(beforeStudents.includes(`// sub:${sub.id}`), "student entry sits above students marker");

const removed = removeBySubmissionId(inserted, sub.id);
assertEq(countEntriesFor(removed, sub.id), 0, "all sub:id lines removed");
assertEq(removed, original, "round-trip insert+remove returns original text");

// Idempotency: removing again is a no-op.
assertEq(removeBySubmissionId(removed, sub.id), removed, "second remove is a no-op");

// Approving twice (idempotent insert) shouldn't double up if the caller
// short-circuits on countEntriesFor — that's the contract used by
// interactions.js. Verify the count check returns the right number.
const doubleInserted = applyInsertions(inserted, insertions);
assertEq(countEntriesFor(doubleInserted, sub.id), 4, "without short-circuit count doubles — caller must guard");

// Fully-human student: skip powers insertion.
const humanSub = { ...sub, id: "human567", form: { ...sub.form, fullyHuman: true } };
const humanIns = buildInsertions(humanSub);
assertEq(humanIns.length, 1, "fully-human student inserts only into students");
assertEq(humanIns[0].marker, "students", "human-only goes to students marker");

console.log("✓ markers.test.mjs — all assertions passed");

function assertEq(a, b, msg) {
  if (a !== b) {
    console.error(`FAIL: ${msg}\n  expected: ${JSON.stringify(b)}\n  actual:   ${JSON.stringify(a)?.slice(0, 200)}`);
    process.exit(1);
  }
}
function assertNotEq(a, b, msg) {
  if (a === b) {
    console.error(`FAIL: ${msg} (values were equal)`);
    process.exit(1);
  }
}
function assertTrue(v, msg) {
  if (!v) {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  }
}
