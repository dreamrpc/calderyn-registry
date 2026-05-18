// Tests for quota.js: per-tier per-writer caps grouped by OOC.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  extractRpcUsername,
  getCharsByTierAndOoc,
  getOocCharsAtTier,
  getOocForForm,
  getTierLimits,
  checkTierQuota,
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
});
test("writers: lookupOocByRpc resolves Star's accounts", () => {
  assertEq(lookupOocByRpc("Crown."),    "Star");
  assertEq(lookupOocByRpc("Black+Mass"), "Star");
  assertEq(lookupOocByRpc("nocturne."), "Star");
});
test("writers: BLACK+VEIN is Tyler, not Star", () => {
  assertEq(lookupOocByRpc("BLACK+VEIN"), "Tyler");
});
test("writers: unknown username → null", () => {
  assertEq(lookupOocByRpc("not-a-real-writer"), null);
  assertEq(lookupOocByRpc(null), null);
});
test("writers: KNOWN_OOC_NAMES sorted + populated", () => {
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
test("extractRpcUsername: missing → null", () => {
  assertEq(extractRpcUsername(null), null);
});

// ─── getTierLimits ────────────────────────────────────────────────────
test("getTierLimits: defaults when env unset", () => {
  const l = getTierLimits({});
  assertEq(l["A-List"], 5);
  assertEq(l["B-List"], 8);
  assertEq(l["C-List"], 10);
  assertFalse("D-List" in l, "D-List must not appear in limits (uncapped)");
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
test("getTierLimits: garbage env → falls back to defaults", () => {
  const l = getTierLimits({ A_LIST_LIMIT_PER_WRITER: "nope", B_LIST_LIMIT_PER_WRITER: "0" });
  assertEq(l["A-List"], 5);
  assertEq(l["B-List"], 8);
});

// ─── getCharsByTierAndOoc against real data.js ────────────────────────
test("getCharsByTierAndOoc: Star A-List bucket contains Tatiana and Vittoria", () => {
  const star = getCharsByTierAndOoc(data).get("A-List")?.get("Star") || new Set();
  assertTrue(star.has("Tatiana Morozova"), `Star A-List: ${[...star].join(", ")}`);
  assertTrue(star.has("Vittoria Delphine Malik"), `Star A-List: ${[...star].join(", ")}`);
});
test("getCharsByTierAndOoc: Wilder owns Princeton at A-List", () => {
  const wilder = getCharsByTierAndOoc(data).get("A-List")?.get("Wilder") || new Set();
  assertTrue(wilder.has("Princeton Ambrose"), `Wilder A-List: ${[...wilder].join(", ")}`);
});
test("getCharsByTierAndOoc: B-List + C-List buckets exist and are independent", () => {
  const all = getCharsByTierAndOoc(data);
  assertTrue(all.has("B-List"), "B-List bucket present");
  assertTrue(all.has("C-List"), "C-List bucket present");
  // A B-List char must not appear in the A-List bucket for the same writer.
  for (const [ooc, chars] of (all.get("B-List") || new Map())) {
    const aChars = all.get("A-List")?.get(ooc) || new Set();
    for (const c of chars) assertFalse(aChars.has(c), `${c} appears in both A and B for ${ooc}`);
  }
});

// ─── getOocCharsAtTier ────────────────────────────────────────────────
test("getOocCharsAtTier: unknown ooc → empty", () => {
  assertEq(getOocCharsAtTier(data, "Nobody", "A-List").size, 0);
  assertEq(getOocCharsAtTier(data, null, "A-List").size, 0);
});
test("getOocCharsAtTier: 'A' and 'A-List' input give same set", () => {
  const a = getOocCharsAtTier(data, "Star", "A");
  const b = getOocCharsAtTier(data, "Star", "A-List");
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

// ─── checkTierQuota: A-List ───────────────────────────────────────────
test("checkTierQuota: A-List blocked at cap for a new char", () => {
  const v = checkTierQuota(data, {
    form: { tier: "A-List", char: "Brand New", ooc: "Star" },
  }, { "A-List": 1, "B-List": 99, "C-List": 99 });
  assertEq(v.allowed, false);
  assertEq(v.tier, "A-List");
  assertEq(v.limit, 1);
  assertTrue(v.count >= 1);
});
test("checkTierQuota: A-List same-char (existing) → allowed at limit 1", () => {
  const v = checkTierQuota(data, {
    form: { tier: "A-List", char: "Tatiana Morozova", ooc: "Star" },
  }, { "A-List": 1, "B-List": 99, "C-List": 99 });
  assertEq(v.allowed, true);
});

// ─── checkTierQuota: B-List ───────────────────────────────────────────
test("checkTierQuota: B-List under cap → allowed", () => {
  const v = checkTierQuota(data, {
    form: { tier: "B-List", char: "Whoever", ooc: "Star" },
  }, { "A-List": 5, "B-List": 99, "C-List": 99 });
  assertEq(v.allowed, true);
  assertEq(v.tier, "B-List");
});
test("checkTierQuota: B-List blocked at limit 0 for a writer who has any B-Listers", () => {
  // Pick a writer who actually has B-Listers in current data.js.
  // Look at Star's B-List bucket; if non-empty, limit 0 blocks.
  const starB = getOocCharsAtTier(data, "Star", "B-List");
  if (starB.size === 0) {
    // No fixture available — skip rather than fail.
    console.log("  (skip: Star has no B-Listers in current data.js)");
    return;
  }
  const v = checkTierQuota(data, {
    form: { tier: "B-List", char: "Fresh B-Lister", ooc: "Star" },
  }, { "A-List": 99, "B-List": 0, "C-List": 99 });
  assertEq(v.allowed, false);
  assertEq(v.tier, "B-List");
  assertEq(v.limit, 0);
});

// ─── checkTierQuota: C-List ───────────────────────────────────────────
test("checkTierQuota: C-List uses its own limit, not A's", () => {
  const v = checkTierQuota(data, {
    form: { tier: "C-List", char: "C-Tier Char", ooc: "Star" },
  }, { "A-List": 0, "B-List": 0, "C-List": 99 });
  // A-List cap of 0 doesn't apply because the submission is C-List.
  assertEq(v.allowed, true);
  assertEq(v.tier, "C-List");
});

// ─── checkTierQuota: D-List uncapped ──────────────────────────────────
test("checkTierQuota: D-List always allowed (no limit entry)", () => {
  const v = checkTierQuota(data, {
    form: { tier: "D-List", char: "Whoever", ooc: "Star" },
  }, getTierLimits({}));
  assertEq(v.allowed, true);
  assertEq(v.tier, "D-List");
});

// ─── checkTierQuota: edge cases ───────────────────────────────────────
test("checkTierQuota: no tier on submission → allowed", () => {
  const v = checkTierQuota(data, {
    form: { char: "Faculty char", ooc: "Star" },
  }, getTierLimits({}));
  assertEq(v.allowed, true);
});
test("checkTierQuota: unmapped writer, no ooc → allowed with warning", () => {
  const v = checkTierQuota(data, {
    form: { tier: "A-List", char: "X", rpcLink: "https://x?user=unknown" },
  }, getTierLimits({}));
  assertEq(v.allowed, true);
  assertEq(v.warning, "no_ooc_identifier");
});
test("checkTierQuota: cross-account counting via rpcLink fallback", () => {
  // Submit via one of Star's accounts (Hopper). Counting Star's A-List
  // chars across ALL her accounts should block at limit 1.
  const v = checkTierQuota(data, {
    form: {
      tier: "A-List",
      char: "From Hopper",
      rpcLink: "https://roleplay.chat/profile.php?user=Hopper",
    },
  }, { "A-List": 1, "B-List": 99, "C-List": 99 });
  assertEq(v.allowed, false);
});
test("checkTierQuota: PRIVACY — verdict has no existingChars / ooc-leaking field", () => {
  const v = checkTierQuota(data, {
    form: { tier: "A-List", char: "X", ooc: "Star" },
  }, { "A-List": 1, "B-List": 99, "C-List": 99 });
  assertFalse("existingChars" in v, "verdict must not include existingChars");
  // `ooc` is in the verdict for server-side logging — that's intentional.
  // The interaction handler must not put it into any Discord message.
});

if (failed) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log("\nquota.test.mjs — all green");
