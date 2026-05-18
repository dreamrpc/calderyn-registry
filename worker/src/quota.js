// A-List quota check.
//
// Rule: each *OOC writer* may have at most A_LIST_LIMIT_PER_WRITER
// A-List characters across the entire registry. Writers are grouped
// across all of their RPC accounts via worker/src/writers.js — so a
// writer with three RPC accounts contributes a single combined count,
// not three independent ones.
//
// A character is A-List for a writer iff there exists at least one
// committed entry in data.js where:
//   - the entry's `link` field points to one of that writer's RPC
//     usernames (resolved via the OOC mapping), AND
//   - the entry sits in either:
//        powers[]                       with tier "A" or "A-List", OR
//        heroLists[<tier=A>].slots[]
// Multiple entries for the same character (e.g. a Student row in
// `students[]` and the matching `powers[]` row, or also a club
// position) count as ONE character. Uniqueness is by `char` value.
//
// PRIVACY: the OOC name never leaves the Worker. Verdicts return
// counts but not character lists — listing a writer's other A-Listers
// next to a blocked submission would leak the RPC-account → OOC
// mapping to anyone watching the channel.

import { forEachArrayObject } from "./scanner.js";
import { lookupOocByRpc } from "./writers.js";

// Extract the RPC username from a profile URL (rules.chat / similar).
// Returns the username as it appears in the URL (with `+`/`%xx` intact)
// — callers that need to compare should funnel through writers.js's
// `normalize` for case/encoding-insensitive matches.
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
// Returns null if the link's RPC username isn't in the mapping —
// such an entry doesn't contribute to anyone's quota count.
function entryOoc(objText) {
  const link = pickStringField(objText, "link");
  if (!link) return null;
  const username = extractRpcUsername(link);
  return lookupOocByRpc(username);
}

// Map<oocName, Set<charName>> of every A-List character in data.js,
// grouped by their OOC writer.
export function getALitersByOoc(text) {
  const byOoc = new Map();
  const add = (ooc, char) => {
    if (!ooc || !char) return;
    if (!byOoc.has(ooc)) byOoc.set(ooc, new Set());
    byOoc.get(ooc).add(char);
  };

  // 1) powers[] with tier "A" or "A-List".
  try {
    forEachArrayObject(text, ["powers"], (obj) => {
      const tier = pickStringField(obj, "tier");
      if (tier !== "A" && tier !== "A-List") return;
      add(entryOoc(obj), pickStringField(obj, "char"));
    });
  } catch (err) {
    console.error("quota: powers scan failed:", err.message);
  }

  // 2) heroLists[<tier=A>].slots[] — slot rows don't carry a tier of
  //    their own; the parent's tier is the source of truth.
  try {
    forEachArrayObject(text, ["heroLists", { tier: "A" }, "slots"], (obj) => {
      add(entryOoc(obj), pickStringField(obj, "char"));
    });
  } catch (err) {
    console.error("quota: heroLists scan failed:", err.message);
  }

  return byOoc;
}

// Get the A-List character set for one OOC writer.
export function getOocALiters(text, ooc) {
  if (!ooc) return new Set();
  return getALitersByOoc(text).get(ooc) || new Set();
}

// Pick the OOC writer for a fresh submission. The form's `ooc` field
// (declared by the submitter via the Writer Tag dropdown) is the
// primary source; fall back to the rpcLink → mapping lookup so that
// legacy / API submissions without an `ooc` field still resolve when
// the submitter is in the mapping.
export function getOocForForm(form) {
  if (!form) return null;
  if (form.ooc && String(form.ooc).trim()) return String(form.ooc).trim();
  return lookupOocByRpc(extractRpcUsername(form.rpcLink));
}

// Decide whether approving `sub` is allowed under the quota. Returns
//   { allowed: true,  ...meta }                  → proceed
//   { allowed: false, count, newCount, limit }   → block (privacy:
//      character list is NOT included on purpose)
export function checkALitQuota(text, sub, limit) {
  const form = sub.form || {};
  if (form.tier !== "A-List") return { allowed: true };

  const ooc = getOocForForm(form);
  if (!ooc) {
    return { allowed: true, warning: "no_ooc_identifier" };
  }

  const owned = getOocALiters(text, ooc);
  // Adding a new role for a character already in the writer's A-List
  // set doesn't grow the set, so it never bumps anyone over the limit
  // — allow even if the writer is currently above the cap (which can
  // happen for grandfathered early-supporter cases). Only block when
  // approval would introduce a brand-new A-List character above the
  // cap.
  const isNewCharacter = form.char ? !owned.has(form.char) : true;
  if (isNewCharacter && (owned.size + 1) > limit) {
    return {
      allowed: false,
      // `ooc` is included so the interaction handler can log it for
      // server-side debugging — it must NOT be put in any Discord
      // message body.
      ooc,
      count: owned.size,
      newCount: owned.size + 1,
      limit,
    };
  }
  return { allowed: true, ooc, count: owned.size, limit };
}
