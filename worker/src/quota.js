// Per-writer tier-cap quota check.
//
// Rule: each OOC writer is limited per tier:
//   A-List → A_LIST_LIMIT_PER_WRITER (default 5)
//   B-List → B_LIST_LIMIT_PER_WRITER (default 8)
//   C-List → C_LIST_LIMIT_PER_WRITER (default 10)
//   D-List → uncapped
// Writers are grouped across all of their RPC accounts via
// worker/src/writers.js so a writer with multiple accounts contributes
// a single combined count per tier.
//
// A character is counted at a tier for a writer iff a committed entry
// in data.js says so:
//   - powers[]                       row with tier == "<X>" or "<X>-List"
//   - heroLists[<tier=X>].slots[]    slot row (parent's tier is the truth)
// Multiple entries for the same character at the same tier (e.g. a
// Student row plus its matching powers[] row) count as ONE character.
//
// PRIVACY: the OOC name never leaves the Worker. Verdicts return only
// the tier and counts — listing a writer's other characters next to a
// blocked submission would leak the RPC-account → OOC mapping to anyone
// watching the channel.

import { forEachArrayObject } from "./scanner.js";
import { lookupOocByRpc } from "./writers.js";

// ── Built-in defaults ────────────────────────────────────────────────
// Mirrors the defaults documented in worker/wrangler.toml. Anything not
// present here is treated as uncapped (D-List + anything we don't ship
// a rule for yet).
const DEFAULT_LIMITS = {
  "A-List": 5,
  "B-List": 8,
  "C-List": 10,
};

// Resolve the per-tier limit map from env vars, falling back to the
// defaults. Returns the same object shape regardless of env state.
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

// ── Helpers ──────────────────────────────────────────────────────────

// Extract the RPC username from a profile URL. Returns the username as
// it appears in the URL (with `+`/`%xx` intact); callers compare via
// writers.js's normalize().
export function extractRpcUsername(url) {
  if (!url) return null;
  const m = /[?&]user=([^&"]+)/.exec(String(url));
  if (!m) return null;
  return m[1];
}

// Pull a top-level string field out of an object's source text.
function pickStringField(objText, key) {
  const re = new RegExp(`\\b${key}\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
  const m = re.exec(objText);
  if (!m) return null;
  return m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}

// Determine the OOC writer for an entry by reading its link field.
function entryOoc(objText) {
  const link = pickStringField(objText, "link");
  if (!link) return null;
  return lookupOocByRpc(extractRpcUsername(link));
}

// Pick the OOC writer for a fresh submission. The form's `ooc` field
// (declared via the Writer Tag dropdown) is the primary source; fall
// back to the rpcLink → mapping lookup for legacy / API submissions.
export function getOocForForm(form) {
  if (!form) return null;
  if (form.ooc && String(form.ooc).trim()) return String(form.ooc).trim();
  return lookupOocByRpc(extractRpcUsername(form.rpcLink));
}

// Convert any form-style tier ("A-List") or stored letter ("A") to the
// canonical "A-List" form. Returns null for unrecognised inputs.
function canonicalTier(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  if (s === "A" || s === "A-List") return "A-List";
  if (s === "B" || s === "B-List") return "B-List";
  if (s === "C" || s === "C-List") return "C-List";
  if (s === "D" || s === "D-List") return "D-List";
  return null;
}

// ── Reading the registry ─────────────────────────────────────────────

// Walk every relevant array in `text` and return
// Map<canonical-tier, Map<ooc-name, Set<char>>>. Entries with an
// unknown OOC writer or a tier outside A/B/C/D are skipped.
export function getCharsByTierAndOoc(text) {
  const tiers = new Map();
  const add = (tier, ooc, char) => {
    if (!tier || !ooc || !char) return;
    if (!tiers.has(tier)) tiers.set(tier, new Map());
    const inner = tiers.get(tier);
    if (!inner.has(ooc)) inner.set(ooc, new Set());
    inner.get(ooc).add(char);
  };

  // powers[] — the comprehensive source for tier ownership.
  try {
    forEachArrayObject(text, ["powers"], (obj) => {
      const tier = canonicalTier(pickStringField(obj, "tier"));
      if (!tier) return;
      add(tier, entryOoc(obj), pickStringField(obj, "char"));
    });
  } catch (err) {
    console.error("quota: powers scan failed:", err.message);
  }

  // heroLists[<tier=X>].slots[] — slot rows don't carry their own
  // tier; the parent's `tier: "X"` is the source of truth. We walk
  // each known tier separately so the scoping query knows which
  // bucket to look in.
  for (const letter of ["A", "B", "C", "D"]) {
    try {
      forEachArrayObject(text, ["heroLists", { tier: letter }, "slots"], (obj) => {
        add(canonicalTier(letter), entryOoc(obj), pickStringField(obj, "char"));
      });
    } catch (err) {
      // Missing tier sections are normal (e.g. there's no D-List bucket
      // in data.js right now). Don't log those as errors.
      if (!/no object matching/.test(err.message)) {
        console.error(`quota: heroLists[${letter}] scan failed:`, err.message);
      }
    }
  }

  return tiers;
}

// Set<char> of all characters at `tier` owned by `ooc`.
export function getOocCharsAtTier(text, ooc, tier) {
  const t = canonicalTier(tier);
  if (!ooc || !t) return new Set();
  return getCharsByTierAndOoc(text).get(t)?.get(ooc) || new Set();
}

// ── Verdict ──────────────────────────────────────────────────────────

// Decide whether approving `sub` is allowed under the configured tier
// caps. Returns
//   { allowed: true,  ...meta }                          → proceed
//   { allowed: false, tier, count, newCount, limit }     → block
//     (privacy: no OOC name, no character list)
export function checkTierQuota(text, sub, limits) {
  const form = sub.form || {};
  const tier = canonicalTier(form.tier);
  if (!tier) return { allowed: true };

  const limit = limits?.[tier];
  if (limit == null) {
    // Tier is recognised but uncapped (D-List).
    return { allowed: true, tier };
  }

  const ooc = getOocForForm(form);
  if (!ooc) {
    return { allowed: true, tier, warning: "no_ooc_identifier" };
  }

  const owned = getOocCharsAtTier(text, ooc, tier);
  // Adding a new role for a character already in the writer's set at
  // this tier doesn't grow the set — allow even when the writer is
  // currently above the cap (grandfathered early supporters).
  const isNewCharacter = form.char ? !owned.has(form.char) : true;
  if (isNewCharacter && (owned.size + 1) > limit) {
    return {
      allowed: false,
      // `ooc` included for server-side logging; must NOT appear in any
      // Discord message body.
      ooc,
      tier,
      count: owned.size,
      newCount: owned.size + 1,
      limit,
    };
  }
  return { allowed: true, ooc, tier, count: owned.size, limit };
}
