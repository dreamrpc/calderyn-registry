// Tests for quota.js: OOC-grouped A-List quota check.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  extractRpcUsername,
  getALitersByOoc,
  getOocALiters,
  getOocForForm,
  checkALitQuota,
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
test("writers: normalize handles + and case", () => {
  assertEq(normalize("Black+Mass"), "black mass");
  assertEq(normalize("BLACK+VEIN"), "black vein");
  assertEq(normalize("Crown."), "crown.");
});
test("writers: lookupOocByRpc resolves Star's accounts", () => {
  assertEq(lookupOocByRpc("Crown."),    "Star");
  assertEq(lookupOocByRpc("Black+Mass"), "Star");
  assertEq(lookupOocByRpc("crown."),    "Star"); // lowercase matches too
  assertEq(lookupOocByRpc("nocturne."), "Star");
});
test("writers: lookupOocByRpc distinguishes Tyler from Star (BLACK+VEIN)", () => {
  assertEq(lookupOocByRpc("BLACK+VEIN"), "Tyler");
  assertEq(lookupOocByRpc("black+vein"), "Tyler");
});
test("writers: unknown username → null", () => {
  assertEq(lookupOocByRpc("not-a-real-writer"), null);
  assertEq(lookupOocByRpc(""), null);
  assertEq(lookupOocByRpc(null), null);
});
test("writers: KNOWN_OOC_NAMES exposes unique values sorted", () => {
  assertTrue(KNOWN_OOC_NAMES.includes("Star"));
  assertTrue(KNOWN_OOC_NAMES.includes("Wilder"));
  assertTrue(KNOWN_OOC_NAMES.includes("Tyler"));
  // Sorted
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
test("extractRpcUsername: missing → null", () => {
  assertEq(extractRpcUsername("https://example/?id=1"), null);
  assertEq(extractRpcUsername(null), null);
});

// ─── Grouping by OOC against real data.js ─────────────────────────────
test("getALitersByOoc: Star's three new A-Listers + Sven group together", () => {
  // Recent additions in main: Tatiana (Nocturne. → Star), Vittoria (Crown. → Star),
  // Princeton (desirable → Wilder), plus Sven (blood+eagle → Dream).
  // Star's three Hopper/etc accounts had no A-Listers prior to those.
  const byOoc = getALitersByOoc(data);
  const star = byOoc.get("Star") || new Set();
  assertTrue(star.has("Tatiana Morozova"), `Star set: ${[...star].join(", ")}`);
  assertTrue(star.has("Vittoria Delphine Malik"), `Star set: ${[...star].join(", ")}`);
});
test("getALitersByOoc: Dream owns Sven (blood+eagle)", () => {
  const dream = getALitersByOoc(data).get("Dream") || new Set();
  assertTrue(dream.has("Sven Skarsen"), `Dream set: ${[...dream].join(", ")}`);
});
test("getALitersByOoc: Wilder owns Princeton (desirable)", () => {
  const wilder = getALitersByOoc(data).get("Wilder") || new Set();
  assertTrue(wilder.has("Princeton Ambrose"), `Wilder set: ${[...wilder].join(", ")}`);
});
test("getOocALiters: unknown OOC → empty set", () => {
  assertEq(getOocALiters(data, "Nobody").size, 0);
  assertEq(getOocALiters(data, null).size, 0);
});

// ─── getOocForForm: form.ooc wins; rpcLink is fallback ────────────────
test("getOocForForm: form.ooc takes precedence", () => {
  assertEq(getOocForForm({
    ooc: "Star",
    rpcLink: "https://x?user=upchuck", // would map to Dream
  }), "Star");
});
test("getOocForForm: rpcLink fallback when no ooc", () => {
  assertEq(getOocForForm({
    rpcLink: "https://x?user=upchuck",
  }), "Dream");
});
test("getOocForForm: blank ooc falls back to rpcLink", () => {
  assertEq(getOocForForm({
    ooc: "   ",
    rpcLink: "https://x?user=Crown.",
  }), "Star");
});
test("getOocForForm: returns null when neither resolves", () => {
  assertEq(getOocForForm({ ooc: "", rpcLink: "https://x?user=unknown" }), null);
  assertEq(getOocForForm({}), null);
});

// ─── checkALitQuota verdicts ──────────────────────────────────────────
test("checkALitQuota: non-A-List submission always allowed", () => {
  const v = checkALitQuota(data, {
    form: { tier: "B-List", char: "X", ooc: "Star" },
  }, 5);
  assertEq(v.allowed, true);
});

test("checkALitQuota: Star at limit 1 → blocked for a new char", () => {
  // Star already owns ≥1 A-List; limit 1 means new char blocks.
  const v = checkALitQuota(data, {
    form: { tier: "A-List", char: "Brand New", ooc: "Star" },
  }, 1);
  assertEq(v.allowed, false);
  assertTrue(v.count >= 1, `count was ${v.count}`);
  assertEq(v.newCount, v.count + 1);
  assertEq(v.limit, 1);
});

test("checkALitQuota: Star adding a new role for existing A-Lister → allowed", () => {
  // Tatiana is already Star's A-Lister. Adding e.g. a Club position for
  // Tatiana shouldn't bump the count.
  const v = checkALitQuota(data, {
    form: { tier: "A-List", char: "Tatiana Morozova", ooc: "Star" },
  }, 1);
  assertEq(v.allowed, true);
});

test("checkALitQuota: cross-account counting — submit via Hopper, blocked by Star's other accounts", () => {
  // Hopper (Star's account) submits a new A-Lister. Counting Star's
  // existing A-Listers across ALL accounts should block at limit 1.
  const v = checkALitQuota(data, {
    form: {
      tier: "A-List",
      char: "From Hopper",
      // No explicit ooc field — rely on the rpcLink → mapping fallback.
      rpcLink: "https://roleplay.chat/profile.php?user=Hopper",
    },
  }, 1);
  assertEq(v.allowed, false, "expected block; verdict was " + JSON.stringify(v));
});

test("checkALitQuota: under limit → allowed", () => {
  const v = checkALitQuota(data, {
    form: { tier: "A-List", char: "New", ooc: "Star" },
  }, 100);
  assertEq(v.allowed, true);
});

test("checkALitQuota: unmapped writer, no ooc → allowed with warning", () => {
  const v = checkALitQuota(data, {
    form: {
      tier: "A-List",
      char: "Unmapped",
      rpcLink: "https://x?user=someone-unmapped",
    },
  }, 5);
  assertEq(v.allowed, true);
  assertEq(v.warning, "no_ooc_identifier");
});

test("checkALitQuota: PRIVACY — verdict has no character list field", () => {
  const v = checkALitQuota(data, {
    form: { tier: "A-List", char: "New", ooc: "Star" },
  }, 1);
  assertFalse("existingChars" in v, "verdict must not include existingChars (would leak OOC mapping when surfaced in Discord)");
});

if (failed) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log("\nquota.test.mjs — all green");
