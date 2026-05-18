// A-List quota check.
//
// Rule: each writer (identified by their RPC username — the `user=foo`
// segment in their roleplay.chat profile URL) may have at most N
// A-List characters across the registry. Default N = 5.
//
// A character is A-List for a writer iff there exists at least one
// committed entry in data.js where:
//   - the entry's `link` field points to that writer's profile, AND
//   - the entry sits in either:
//        powers[]                       with tier "A" or "A-List", OR
//        heroLists[<tier=A>].slots[]
// Multiple entries for the same character (e.g. a Student row in
// `students[]` and the matching `powers[]` row, or also a club
// position) count as ONE character. Uniqueness is by `char` value.

import { forEachArrayObject } from "./scanner.js";

// Extract the username from a roleplay.chat (or similar) profile URL.
// Decodes URL-encoded values so `user=blood+eagle` matches the same
// writer as `user=blood eagle`.
export function extractWriter(url) {
  if (!url) return null;
  const m = /[?&]user=([^&"]+)/.exec(String(url));
  if (!m) return null;
  try {
    return decodeURIComponent(m[1].replace(/\+/g, " "));
  } catch {
    return m[1];
  }
}

export function linkBelongsToWriter(link, writer) {
  const found = extractWriter(link);
  if (!found || !writer) return false;
  return found.toLowerCase() === writer.toLowerCase();
}

// Pull a top-level string field out of an object's source text.
function pickStringField(objText, key) {
  // Match `key:` then a double-quoted value. `\b` on the left so
  // `othername:` doesn't match `name:`. Escapes inside the string are
  // captured verbatim — we'll only use this for short, well-formed
  // fields (char, alias, tier, status, link).
  const re = new RegExp(`\\b${key}\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
  const m = re.exec(objText);
  if (!m) return null;
  return m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}

// Set<char> of A-List characters belonging to `writer`, derived from
// the current data.js text.
export function getWriterALitersFromText(text, writer) {
  const out = new Set();
  if (!writer) return out;

  // 1) powers[] with tier "A" or "A-List".
  try {
    forEachArrayObject(text, ["powers"], (obj) => {
      const link = pickStringField(obj, "link");
      if (!linkBelongsToWriter(link, writer)) return;
      const tier = pickStringField(obj, "tier");
      if (tier !== "A" && tier !== "A-List") return;
      const char = pickStringField(obj, "char");
      if (char) out.add(char);
    });
  } catch (err) {
    // If the powers[] array isn't found we just skip — leave the heroLists
    // scan a chance, and don't take the whole approval down with us.
    console.error("quota: powers scan failed:", err.message);
  }

  // 2) heroLists[<tier=A>].slots[] — slot rows don't carry a tier field
  //    of their own; the parent's tier is the source of truth.
  try {
    forEachArrayObject(text, ["heroLists", { tier: "A" }, "slots"], (obj) => {
      const link = pickStringField(obj, "link");
      if (!linkBelongsToWriter(link, writer)) return;
      const char = pickStringField(obj, "char");
      if (char) out.add(char);
    });
  } catch (err) {
    console.error("quota: heroLists scan failed:", err.message);
  }

  return out;
}

// Decide whether approving `sub` is allowed under the quota. Returns
//   { allowed: true }                                      → proceed
//   { allowed: false, reason: "...", count, limit, writer } → block
export function checkALitQuota(text, sub, limit) {
  const form = sub.form || {};
  if (form.tier !== "A-List") return { allowed: true };

  const writer = extractWriter(form.rpcLink);
  if (!writer) {
    // No usable link — can't enforce the rule. Let it through but flag
    // it; admin can sort by hand if needed.
    return { allowed: true, warning: "no_writer_from_link" };
  }

  const owned = getWriterALitersFromText(text, writer);
  // Adding the new character only counts if they're not already in the
  // writer's A-List set (e.g. a writer's A-Lister taking on a new role
  // doesn't increase their A-List count).
  const wouldOwn = new Set(owned);
  if (form.char) wouldOwn.add(form.char);

  if (wouldOwn.size > limit) {
    return {
      allowed: false,
      writer,
      count: owned.size,
      newCount: wouldOwn.size,
      limit,
      existingChars: [...owned],
      newChar: form.char,
    };
  }
  return { allowed: true, writer, count: owned.size, limit };
}
