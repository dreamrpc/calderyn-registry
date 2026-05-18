// Auto-update worker/src/writers.js when an admin approves a
// submission from a writer / RPC-account we haven't mapped yet.
//
// Detection runs in interactions.js right before the data.js commit:
//   - Submission has form.ooc (the Writer Tag dropdown is mandatory).
//   - extractRpcUsername(form.rpcLink) is non-null.
//   - The Worker's *built-in* mapping (from the deployed bundle)
//     doesn't already include that RPC username.
//
// If all three hold, ensureWriterMapping reads the live writers.js
// from GitHub, inserts the new entry just above the
//   // AUTO-INSERT:writers
// marker, and commits. updateFile() in github.js handles SHA-conflict
// retries so two concurrent approvals don't race each other.
//
// The check inside the mutation closure is intentional: by the time
// the GitHub PUT actually lands, the file may already include the
// mapping (e.g. a previous approval added it between our build-time
// snapshot and this commit). In that case we return the text
// unchanged and updateFile no-ops.

const WRITERS_PATH = "worker/src/writers.js";
const MARKER_RE = /^[ \t]*\/\/\s*AUTO-INSERT:writers\b.*$/m;

import { updateFile } from "./github.js";

// Commit-safe: returns { committed: bool, reason: string }. Never
// throws — the caller logs and proceeds with the data.js commit
// either way, so a transient writers.js write failure doesn't block
// the approval.
export async function ensureWriterMapping(env, rpcUsername, oocName) {
  if (!rpcUsername || !oocName) {
    return { committed: false, reason: "missing-args" };
  }
  const username = String(rpcUsername).trim();
  const ooc = String(oocName).trim();
  if (!username || !ooc) {
    return { committed: false, reason: "blank-args" };
  }

  try {
    const res = await updateFile(
      env,
      WRITERS_PATH,
      `Map new writer: ${safeCommitMessage(username)} → ${safeCommitMessage(ooc)}`,
      (current) => insertMapping(current, username, ooc)
    );
    if (res.unchanged) return { committed: false, reason: "already-mapped" };
    return { committed: true, sha: res.commitSha };
  } catch (err) {
    console.error("ensureWriterMapping failed:", err.message);
    return { committed: false, reason: "error", error: err.message };
  }
}

// Pure helper, exported for tests. Insert `username → ooc` just above
// the AUTO-INSERT:writers marker. Returns the original text unchanged
// if the username is already present (any value) — we never overwrite
// an existing mapping.
export function insertMapping(text, username, ooc) {
  if (!MARKER_RE.test(text)) {
    throw new Error("writers.js missing AUTO-INSERT:writers marker");
  }
  // Already mapped? Match the key exactly as-typed; mapping keys are
  // case-sensitive in the source file, and writers.js's normalize()
  // handles case folding at lookup time so we don't need to dedup
  // case variants here.
  const keyEscaped = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const existingRe = new RegExp(`^[ \\t]*"${keyEscaped}"\\s*:`, "m");
  if (existingRe.test(text)) return text;

  // Detect indent from the marker's line so we match the existing
  // style (typically two spaces).
  const markerLine = text.match(MARKER_RE)[0];
  const indent = markerLine.match(/^[ \t]*/)[0];
  const line = `${indent}${jsString(username)}: ${jsString(ooc)},`;
  return text.replace(MARKER_RE, (m) => `${line}\n${m}`);
}

// JS-string serialiser — double-quoted, with \ " and newlines escaped.
function jsString(v) {
  return `"${String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\r\n]/g, " ")}"`;
}

// Strip newlines and clamp length so the commit message stays on a
// single line.
function safeCommitMessage(s) {
  return String(s).replace(/[\r\n]/g, " ").slice(0, 80);
}
