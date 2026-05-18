// Marker-based insert/remove for data.js.
//
// Conventions:
//   Each writable section in data.js has a line like
//     // AUTO-INSERT:<key> — ...
//   directly above its closing `],`. New entries get inserted on a fresh
//   line *above* that marker, with a trailing `// sub:<id>` comment so
//   we can find and remove them later, no matter what else changed.
//
// Phase 1 supports the Student form, which writes two entries:
//   - `students` (always)
//   - `powers`   (unless form.fullyHuman)

// Build the routing plan for a submission: which marker keys to insert
// into, and what JS source line to insert at each. Returns [] for any
// form type we don't auto-route yet (Phase 2).
export function buildInsertions(submission) {
  const { type, form, id } = submission;
  if (type !== "student") return [];

  const s = jsString;
  const trackVal = ((form.track || "").toLowerCase()
    .replace(/^heroes$/, "hero")
    .replace(/^sidekicks$/, "sidekick"));
  const linkFrag = form.rpcLink ? `, link: ${s(form.rpcLink)}` : "";
  const humanFrag = form.fullyHuman ? `, human: true` : "";
  const powerFrag = form.fullyHuman ? "" :
    `, power: ${s(form.power)}, expression: ${s(form.powerExpression)}, drawbacks: ${s(form.drawbacks)}`;

  const studentLine =
    `  { char: ${s(form.char)}, alias: ${s(form.alias) || '""'}, house: ${s((form.house || "").toLowerCase())}, year: ${s(form.year)}, track: ${s(trackVal)}, tier: ${s(form.tier)}${powerFrag}${humanFrag}${linkFrag} }, // sub:${id}`;

  const out = [{ marker: "students", line: studentLine }];

  if (!form.fullyHuman) {
    const aliasFrag = form.alias ? `, alias: ${s(form.alias)}` : "";
    const tierLetter = form.tier ? form.tier.replace("-List", "") : "";
    const tierFrag = tierLetter ? `, tier: ${s(tierLetter)}` : "";
    const powersLine =
      `  { char: ${s(form.char)}${aliasFrag}, status: "student"${tierFrag}, power: ${s(form.power)}, expression: ${s(form.powerExpression)}, drawbacks: ${s(form.drawbacks)}${linkFrag} }, // sub:${id}`;
    out.push({ marker: "powers", line: powersLine });
  }
  return out;
}

// Apply all insertions to data.js text. Each insertion adds a new line
// immediately above the matching `// AUTO-INSERT:<marker>` line.
export function applyInsertions(text, insertions) {
  let next = text;
  for (const ins of insertions) {
    const re = markerRegex(ins.marker);
    if (!re.test(next)) {
      throw new Error(`marker not found in data.js: AUTO-INSERT:${ins.marker}`);
    }
    next = next.replace(re, (markerLine) => `${ins.line}\n${markerLine}`);
  }
  return next;
}

// Remove every line that ends with `// sub:<id>` (any whitespace before).
// Single regex sweep — safe because `sub:<id>` is unique per submission.
export function removeBySubmissionId(text, id) {
  const safeId = id.replace(/[^a-z0-9]/gi, "");
  if (!safeId) return text;
  // Match the entire line including its trailing newline.
  const re = new RegExp(`^.*//\\s*sub:${safeId}\\s*$\\n?`, "gm");
  return text.replace(re, "");
}

// Quick lookup: how many lines currently belong to a given submission id?
// Used so we can short-circuit a no-op remove and detect double-clicks.
export function countEntriesFor(text, id) {
  const safeId = id.replace(/[^a-z0-9]/gi, "");
  if (!safeId) return 0;
  const re = new RegExp(`//\\s*sub:${safeId}\\b`, "gm");
  return (text.match(re) || []).length;
}

function markerRegex(key) {
  // Match the whole marker line (including leading indentation), no
  // trailing newline — the replace adds one. The key is anchored so a
  // `// AUTO-INSERT:students_archive` line wouldn't match `students`.
  const safe = key.replace(/[^a-zA-Z0-9_.\[\]]/g, "");
  return new RegExp(`^[ \\t]*//\\s*AUTO-INSERT:${safe}\\b.*$`, "m");
}

// JS-string serialiser matching what the form snippet used to produce:
// double-quoted, only " and \ escaped. Inputs are short user-facing
// strings; no need for full JSON.
function jsString(v) {
  if (!v) return "";
  return `"${String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
}
