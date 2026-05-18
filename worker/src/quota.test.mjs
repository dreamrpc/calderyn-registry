// Tests for quota.js against the real data.js. We just committed seven
// new students, three of which are A-List, so the writer-set lookups
// have predictable answers.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  extractWriter,
  linkBelongsToWriter,
  getWriterALitersFromText,
  checkALitQuota,
} from "./quota.js";

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(here, "../../data.js");
const data = readFileSync(dataPath, "utf-8");

let failed = 0;
function test(name, fn) {
  try { fn(); console.log("✓", name); }
  catch (e) { failed++; console.error("✗", name, "\n  ", e.message); }
}
function assertEq(a, b, msg) { if (a !== b) throw new Error(`${msg||"assertEq"}\n  expected: ${JSON.stringify(b)}\n  actual:   ${JSON.stringify(a)}`); }
function assertTrue(v, msg) { if (!v) throw new Error(msg || "expected truthy"); }
function assertFalse(v, msg) { if (v) throw new Error(msg || "expected falsy"); }

test("extractWriter: standard URL", () => {
  assertEq(extractWriter("https://roleplay.chat/profile.php?user=upchuck"), "upchuck");
});
test("extractWriter: + decodes to space", () => {
  assertEq(extractWriter("https://roleplay.chat/profile.php?user=blood+eagle"), "blood eagle");
});
test("extractWriter: %20 decodes too", () => {
  assertEq(extractWriter("https://example.com/x?user=foo%20bar"), "foo bar");
});
test("extractWriter: missing user param → null", () => {
  assertEq(extractWriter("https://roleplay.chat/profile.php?id=42"), null);
});
test("extractWriter: empty/null", () => {
  assertEq(extractWriter(""), null);
  assertEq(extractWriter(null), null);
});

test("linkBelongsToWriter: case-insensitive match", () => {
  assertTrue(linkBelongsToWriter(
    "https://roleplay.chat/profile.php?user=Crown.",
    "crown."
  ));
});
test("linkBelongsToWriter: different user → false", () => {
  assertFalse(linkBelongsToWriter(
    "https://roleplay.chat/profile.php?user=Crown.",
    "upchuck"
  ));
});

// ── Against real data.js ──────────────────────────────────────────────
test("getWriterALitersFromText: known A-Lister Tatiana (Nocturne)", () => {
  const owned = getWriterALitersFromText(data, "Nocturne.");
  // We just added Tatiana as A-List for user=Nocturne. — link literal.
  assertTrue(owned.has("Tatiana Morozova"), `expected Tatiana, got ${[...owned].join(", ")}`);
  assertEq(owned.size, 1);
});

test("getWriterALitersFromText: B-Lister Hopper is not counted", () => {
  const owned = getWriterALitersFromText(data, "Hopper");
  assertEq(owned.size, 0);
});

test("getWriterALitersFromText: unknown writer returns empty set", () => {
  const owned = getWriterALitersFromText(data, "someone-who-doesnt-exist");
  assertEq(owned.size, 0);
});

test("getWriterALitersFromText: blood+eagle is A-List (Sven)", () => {
  // Sven's link uses + in the URL (blood+eagle). The query for the
  // writer should match regardless.
  const owned = getWriterALitersFromText(data, "blood eagle");
  assertTrue(owned.has("Sven Skarsen"), `got ${[...owned].join(", ")}`);
});

// ── checkALitQuota ────────────────────────────────────────────────────
test("checkALitQuota: non-A-List submission always allowed", () => {
  const verdict = checkALitQuota(data, {
    form: { tier: "B-List", char: "Anyone", rpcLink: "https://x?user=Nocturne." },
  }, 5);
  assertEq(verdict.allowed, true);
});

test("checkALitQuota: writer at limit, new A-List char → blocked", () => {
  // Limit 1 — Nocturne writer already owns Tatiana (A). Trying to add a
  // SECOND A-List character should block.
  const verdict = checkALitQuota(data, {
    form: { tier: "A-List", char: "Second Char", rpcLink: "https://x?user=Nocturne." },
  }, 1);
  assertEq(verdict.allowed, false);
  assertEq(verdict.count, 1);
  assertEq(verdict.newCount, 2);
  assertEq(verdict.limit, 1);
});

test("checkALitQuota: writer at limit, *same* char → allowed", () => {
  // Same writer, same character that's already on the registry —
  // adding another role for an existing A-Lister shouldn't bump the
  // count.
  const verdict = checkALitQuota(data, {
    form: { tier: "A-List", char: "Tatiana Morozova", rpcLink: "https://x?user=Nocturne." },
  }, 1);
  assertEq(verdict.allowed, true);
});

test("checkALitQuota: under limit, new A-List char → allowed", () => {
  const verdict = checkALitQuota(data, {
    form: { tier: "A-List", char: "Another", rpcLink: "https://x?user=Nocturne." },
  }, 5);
  assertEq(verdict.allowed, true);
  assertEq(verdict.count, 1);
});

test("checkALitQuota: no link → allowed with warning", () => {
  const verdict = checkALitQuota(data, {
    form: { tier: "A-List", char: "Mystery" },
  }, 5);
  assertEq(verdict.allowed, true);
  assertEq(verdict.warning, "no_writer_from_link");
});

if (failed) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log("\nquota.test.mjs — all green");
