// Standalone test for scanner.js — runs against synthetic snippets
// plus the real data.js.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { findMatchingBracket, locateArrayInsertPos, detectIndent } from "./scanner.js";

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(here, "../../data.js");
const data = readFileSync(dataPath, "utf-8");

let failed = 0;
function test(name, fn) {
  try { fn(); console.log("✓", name); }
  catch (e) { failed++; console.error("✗", name, "\n  ", e.message); }
}
function assertEq(a, b, msg) {
  if (a !== b) throw new Error(`${msg || "assertEq"}\n  expected: ${JSON.stringify(b)}\n  actual:   ${JSON.stringify(a)?.slice(0,120)}`);
}

// --- synthetic ---
test("findMatchingBracket: simple", () => {
  const s = "x = [1, 2, [3, 4], 5];";
  const open = s.indexOf("[");
  assertEq(findMatchingBracket(s, open), s.indexOf("];"), "outer ]");
});

test("findMatchingBracket: ignores brackets in strings", () => {
  const s = `x = ["]", "[", "][[]]"];`;
  const open = s.indexOf("[");
  assertEq(findMatchingBracket(s, open), s.length - 2);
});

test("findMatchingBracket: ignores brackets in line comments", () => {
  const s = "x = [1, // ] ] ]\n 2];";
  const open = s.indexOf("[");
  assertEq(findMatchingBracket(s, open), s.length - 2);
});

test("findMatchingBracket: ignores brackets in block comments", () => {
  const s = "x = [1, /* ]]] */ 2];";
  const open = s.indexOf("[");
  assertEq(findMatchingBracket(s, open), s.length - 2);
});

test("findMatchingBracket: braces", () => {
  const s = `{ a: { b: 1 }, c: "{" }`;
  assertEq(findMatchingBracket(s, 0), s.length - 1);
});

// --- against real data.js ---
test("data.js: students closing ]", () => {
  // students is at the top level inside window.CALDERYN = { ... students: [ ... ], ... }
  const pos = locateArrayInsertPos(data, ["students"]);
  // Insert position should be at a `]` character.
  assertEq(data[pos], "]", "expected ] at insert pos for students");
});

test("data.js: groups (createNew append point)", () => {
  const pos = locateArrayInsertPos(data, ["groups"]);
  assertEq(data[pos], "]");
});

test("data.js: faculty[OFFICE OF THE DEAN].rows", () => {
  const pos = locateArrayInsertPos(data, ["faculty", { section: "OFFICE OF THE DEAN" }, "rows"]);
  assertEq(data[pos], "]");
  // Indent of the ] line should be 4 spaces (rows are nested 2 levels deep
  // inside the top-level object `window.CALDERYN = { faculty: [ { rows: [ ] ] ] }`)
  const indent = detectIndent(data, pos);
  assertEq(indent, "    ", "expected 4-space indent for rows closing");
});

test("data.js: groups[VANGUARD].members", () => {
  const pos = locateArrayInsertPos(data, ["groups", { name: "VANGUARD" }, "members"]);
  assertEq(data[pos], "]");
});

test("data.js: heroLists[A].slots", () => {
  const pos = locateArrayInsertPos(data, ["heroLists", { tier: "A" }, "slots"]);
  assertEq(data[pos], "]");
});

test("data.js: outside[GOVERNMENT & CIVIC].orgs[Royal Borough of Greenwich].roles", () => {
  const pos = locateArrayInsertPos(data, ["outside", { section: "GOVERNMENT & CIVIC" }, "orgs", { name: "Royal Borough of Greenwich" }, "roles"]);
  assertEq(data[pos], "]");
});

test("data.js: clubs[Powerball].teams[Valaris].positions", () => {
  const pos = locateArrayInsertPos(data, ["clubs", { name: "Powerball" }, "teams", { house: "Valaris" }, "positions"]);
  assertEq(data[pos], "]");
});

test("data.js: studentGov[OFFICE OF THE PRESIDENT].seats", () => {
  const pos = locateArrayInsertPos(data, ["studentGov", { section: "OFFICE OF THE PRESIDENT" }, "seats"]);
  assertEq(data[pos], "]");
});

test("data.js: missing section throws", () => {
  try {
    locateArrayInsertPos(data, ["faculty", { section: "NOPE" }, "rows"]);
    throw new Error("expected throw");
  } catch (e) {
    if (!/no object matching/.test(e.message)) throw new Error("wrong error: " + e.message);
  }
});

if (failed) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log("\nscanner.test.mjs — all green");
