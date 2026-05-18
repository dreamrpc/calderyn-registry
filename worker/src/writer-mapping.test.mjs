// Pure-text tests for the writers.js mutator. The GitHub-side path
// is exercised indirectly by interactions.js — here we just verify
// the source-text manipulation does the right thing.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { insertMapping } from "./writer-mapping.js";

const here = dirname(fileURLToPath(import.meta.url));
const writersPath = resolve(here, "./writers.js");
const original = readFileSync(writersPath, "utf-8");

let failed = 0;
function test(name, fn) {
  try { fn(); console.log("✓", name); }
  catch (e) { failed++; console.error("✗", name, "\n  ", e.message); }
}
function assertEq(a, b, msg) { if (a !== b) throw new Error(`${msg||"assertEq"}\n  expected: ${JSON.stringify(b)?.slice(0,200)}\n  actual:   ${JSON.stringify(a)?.slice(0,200)}`); }
function assertTrue(v, msg) { if (!v) throw new Error(msg || "expected truthy"); }
function assertThrows(fn, msg) {
  try { fn(); } catch { return; }
  throw new Error(msg || "expected throw");
}

test("inserts a new mapping above the AUTO-INSERT marker", () => {
  const next = insertMapping(original, "Stella+RP", "Stella");
  assertTrue(next.includes(`"Stella+RP": "Stella",`), "inserted entry present");
  // Position check: the inserted line must precede the marker line in
  // the file, with no characters between them other than the newline.
  const marker = next.match(/^[ \t]*\/\/\s*AUTO-INSERT:writers\b.*$/m);
  const idx = next.indexOf(`"Stella+RP": "Stella",`);
  assertTrue(idx >= 0 && idx < next.indexOf(marker[0]), "inserted entry is above marker");
});

test("no-op when the username is already mapped (any value)", () => {
  // Crown. is already in the file as a Star account.
  const next = insertMapping(original, "Crown.", "Star");
  assertEq(next, original, "must not duplicate existing mapping");
});

test("no-op even if existing mapping has a different OOC value", () => {
  // Defensive: never overwrite. Pretend someone mapped Crown. → "Other"
  // — we still leave the existing line alone.
  const next = insertMapping(original, "Crown.", "AnyoneElse");
  assertEq(next, original);
});

test("escapes double quotes inside username and ooc", () => {
  const next = insertMapping(original, `weird"user`, `Star"Pseudonym`);
  // Both fields are double-quoted; quotes inside are escaped.
  assertTrue(next.includes(`"weird\\"user": "Star\\"Pseudonym",`), "escaped quotes");
});

test("strips newlines so a single line is inserted", () => {
  const next = insertMapping(original, "weird\nusername", "Bad\nName");
  assertTrue(next.includes(`"weird username": "Bad Name",`), "newlines replaced with spaces");
});

test("throws if the file is missing the AUTO-INSERT marker", () => {
  assertThrows(
    () => insertMapping('export const RPC_TO_OOC_RAW = { "foo": "bar" };', "x", "y"),
    "expected throw on missing marker"
  );
});

test("preserves marker indentation", () => {
  const next = insertMapping(original, "FreshAccount", "Fresh");
  // The existing marker is indented with two spaces (matching the
  // surrounding entries). The inserted line should sit at the same
  // indent.
  assertTrue(/^  "FreshAccount": "Fresh",$/m.test(next), "indent matches surrounding lines");
});

test("integration: handleSubmit accepts ctx so ctx.waitUntil doesn't crash", async () => {
  // Regression guard for the bug where submit.js called `ctx.waitUntil(...)`
  // but the function signature was `handleSubmit(request, env)` — ctx was
  // undefined at runtime, and the line would have thrown a ReferenceError
  // on every submission that triggered the auto-map branch.
  const fs = await import("node:fs");
  const path = await import("node:path");
  const srcDir = path.dirname(new URL(import.meta.url).pathname);
  const submitText = fs.readFileSync(path.join(srcDir, "submit.js"), "utf-8");
  // Find the export declaration and make sure ctx is in the parameter list.
  const m = /export\s+async\s+function\s+handleSubmit\s*\(([^)]*)\)/.exec(submitText);
  if (!m) throw new Error("handleSubmit declaration not found in submit.js");
  const params = m[1].split(",").map(s => s.trim());
  if (!params.includes("ctx")) {
    throw new Error(
      `handleSubmit must accept ctx as a parameter (currently: ${m[1]}). ` +
      `submit.js calls ctx.waitUntil(...) — without ctx in the signature, ` +
      `that line crashes the moment a new writer submits.`
    );
  }
});

test("integration: every admin-action call site invokes ensureWriterMapping", async () => {
  // Guard against the previous bug where ensureWriterMapping was
  // only wired into the approved-not-blocked branch of finalizeAction
  // — meaning rejected submissions never got their mapping written.
  // We grep the worker source for the call to make sure submit.js
  // (submission time) and interactions.js (every admin action) both
  // hook it up.
  const fs = await import("node:fs");
  const path = await import("node:path");
  const srcDir = path.dirname(new URL(import.meta.url).pathname);

  const submitText = fs.readFileSync(path.join(srcDir, "submit.js"), "utf-8");
  if (!submitText.includes("ensureWriterMapping")) {
    throw new Error("submit.js no longer calls ensureWriterMapping — submission-time mapping is broken");
  }

  const interactionsText = fs.readFileSync(path.join(srcDir, "interactions.js"), "utf-8");
  if (!interactionsText.includes("ensureWriterMapping")) {
    throw new Error("interactions.js no longer calls ensureWriterMapping — admin-click mapping is broken");
  }
  // The call must sit OUTSIDE the `if (!blocked)` and `if (toState === "approved")` branches
  // so it fires for rejections and quota-blocked approvals too. We
  // check this by finding the call's position relative to those
  // conditionals.
  const callIdx = interactionsText.indexOf("ensureWriterMapping(env, writerUser, writerOoc)");
  const approvedIfIdx = interactionsText.indexOf('if (toState === "approved")');
  if (callIdx < 0 || approvedIfIdx < 0) {
    throw new Error("expected call sites not found in interactions.js");
  }
  if (callIdx > approvedIfIdx) {
    throw new Error(
      "ensureWriterMapping is still inside the approved branch — rejections won't trigger it.\n  " +
      "Move it to the top of finalizeAction so it fires on every admin action."
    );
  }
});

test("round-trip: original file still parses as JS after insert", async () => {
  const next = insertMapping(original, "RoundTrip", "RT");
  // Eval through dynamic import via data URI. Replace export keyword
  // (Node ESM happy) — writers.js uses `export const` already.
  const url = "data:text/javascript;base64," + Buffer.from(next).toString("base64");
  const mod = await import(url);
  assertTrue(typeof mod.lookupOocByRpc === "function", "module loaded");
  assertEq(mod.lookupOocByRpc("RoundTrip"), "RT", "new mapping is queryable");
  // Existing mappings unaffected.
  assertEq(mod.lookupOocByRpc("Crown."), "Star");
});

if (failed) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log("\nwriter-mapping.test.mjs — all green");
