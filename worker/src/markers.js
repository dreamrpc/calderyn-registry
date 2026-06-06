// Insert/remove logic for data.js.
//
// Two insertion mechanisms coexist:
//
//   Phase 1 — "marker" insertions for the Student form. A
//   `// AUTO-INSERT:<key>` comment lives in data.js above the closing
//   `]` of `students` and `powers`; new entries are inserted on the
//   line above that comment.
//
//   Phase 2 — "path" insertions for the remaining six forms. A JS-aware
//   scanner walks a path like
//     ["faculty", { section: "OFFICE OF THE DEAN" }, "rows"]
//   to find the closing `]` of the targeted leaf array. The new entry
//   is inserted on the line directly above that closing bracket, using
//   the array's existing indentation.
//
// Both insertion kinds end with `// sub:<id>` so a reject toggle can
// find and remove every line that belongs to a submission with one
// regex sweep.

import { locateArrayInsertPos, detectIndent } from "./scanner.js";

// Build the insertion plan for a submission. Each entry is either:
//   { kind: "marker", marker: "students", line: "  { ... } // sub:<id>" }
//   { kind: "path",   path: ["faculty", {...}, "rows"], lines: ["…", "…"] }
// `lines` for path inserts is an array so multi-line entries (the
// Collective createNew group object) can be supplied directly.
export function buildInsertions(submission) {
  const { type, form, id } = submission;
  switch (type) {
    case "student":    return buildStudent(form, id);
    case "faculty":    return buildFaculty(form, id);
    case "strata":     return buildStrata(form, id);
    case "club":       return buildClub(form, id);
    case "gov":        return buildGov(form, id);
    case "collective": return buildCollective(form, id);
    case "outside":    return buildOutside(form, id);
    default:           return [];
  }
}

// Apply every insertion in order. Marker inserts use a regex sweep;
// path inserts call into the scanner. Returns the new text.
export function applyInsertions(text, insertions) {
  let next = text;
  for (const ins of insertions) {
    if (ins.kind === "marker") {
      const re = markerRegex(ins.marker);
      if (!re.test(next)) {
        throw new Error(`marker not found in data.js: AUTO-INSERT:${ins.marker}`);
      }
      next = next.replace(re, (line) => `${ins.line}\n${line}`);
    } else if (ins.kind === "path") {
      const closeIdx = locateArrayInsertPos(next, ins.path);
      const closeIndent = detectIndent(next, closeIdx);
      const entryIndent = closeIndent + "  ";
      // Insert at the *start* of the line containing `]`, not at the
      // `]` itself. Otherwise the existing leading spaces of the `]`
      // line end up prepended to our new entry, leaving `]` at column 0
      // after a later remove — which breaks round-trip equivalence.
      let lineStart = closeIdx;
      while (lineStart > 0 && next[lineStart - 1] !== "\n") lineStart--;
      const block = ins.lines
        .map((l, i) => (i === 0 ? entryIndent + l : l))
        .join("\n");
      next = next.slice(0, lineStart) + block + "\n" + next.slice(lineStart);
    } else {
      throw new Error(`unknown insertion kind: ${ins.kind}`);
    }
  }
  return next;
}

// Remove every line that ends with `// sub:<id>`. Used for the toggle-
// back path: clicking ❌ on a previously-approved submission rolls back
// every entry that was added on approval, regardless of which form
// type or which leaf array each entry lives in.
export function removeBySubmissionId(text, id) {
  const safeId = id.replace(/[^a-z0-9]/gi, "");
  if (!safeId) return text;
  const re = new RegExp(`^.*//\\s*sub:${safeId}\\s*$\\n?`, "gm");
  return text.replace(re, "");
}

export function countEntriesFor(text, id) {
  const safeId = id.replace(/[^a-z0-9]/gi, "");
  if (!safeId) return 0;
  const re = new RegExp(`//\\s*sub:${safeId}\\b`, "gm");
  return (text.match(re) || []).length;
}

function markerRegex(key) {
  const safe = key.replace(/[^a-zA-Z0-9_.\[\]]/g, "");
  return new RegExp(`^[ \\t]*//\\s*AUTO-INSERT:${safe}\\b.*$`, "m");
}

// ─── per-form-type builders ──────────────────────────────────────────

function buildStudent(form, id) {
  const trackVal = (form.track || "").toLowerCase()
    .replace(/^heroes$/, "hero")
    .replace(/^sidekicks$/, "sidekick");
  const linkFrag  = form.rpcLink     ? `, link: ${q(form.rpcLink)}`       : "";
  const humanFrag = form.fullyHuman  ? `, human: true`                    : "";
  const powerFrag = form.fullyHuman  ? ""
    : `, power: ${q(form.power)}, expression: ${q(form.powerExpression)}, drawbacks: ${q(form.drawbacks)}`;

  const studentLine =
    `  { char: ${q(form.char)}, alias: ${q(form.alias) || '""'}, house: ${q((form.house || "").toLowerCase())}, year: ${q(form.year)}, track: ${q(trackVal)}, tier: ${q(form.tier)}${powerFrag}${humanFrag}${linkFrag} }, // sub:${id}`;

  const out = [{ kind: "marker", marker: "students", line: studentLine }];

  if (!form.fullyHuman) {
    out.push({
      kind: "marker",
      marker: "powers",
      line: powersLine(form, id, "student"),
    });
  }

  // Optional gov seat — student form sends optGovSeat/optGovSection
  // (not the standalone-Gov form's govSeat/govSection). Without this
  // path the student got approved into students/powers but the seat
  // they ticked stayed empty. The seat line stays minimal — char/pos/
  // term/link only, no power info — because the power is already
  // sitting in the powers[] registry from the marker insert above.
  if (form.optGovSeat && form.optGovSection) {
    const term = form.optGovTerm || "2026–27";
    const govLine = `{ pos: ${q(form.optGovSeat)}, term: ${q(term)}, char: ${q(form.char)}${linkFrag} }, // sub:${id}`;
    out.push({
      kind: "path",
      path: ["studentGov", { section: form.optGovSection }, "seats"],
      lines: [govLine],
    });
  }

  // Optional club position — same field-name mismatch with the
  // standalone-Club form (which uses clubName/clubPosition/clubTeam).
  if (form.optClubName && form.optClubPosition) {
    const clubLine = `{ pos: ${q(form.optClubPosition)}, char: ${q(form.char)}${linkFrag} }, // sub:${id}`;
    const path = form.optClubTeam
      ? ["clubs", { name: form.optClubName }, "teams", { house: form.optClubTeam }, "positions"]
      : ["clubs", { name: form.optClubName }, "positions"];
    out.push({ kind: "path", path, lines: [clubLine] });
  }

  return out;
}

// Code → dept.id map for the 8 academic departments. Used to route
// faculty submissions whose facultySection looks like "COM · Combat"
// into the auxFaculty[] sidecar table instead of the legacy FACULTY[]
// rows array (departments[] head/staff/instructional don't take inline
// appends — the renderer merges aux entries by deptId + role).
const DEPT_CODE_TO_ID = {
  COM: "combat",
  MDA: "media-arts",
  SCI: "sciences",
  ENG: "engineering",
  HIS: "history-doctrine",
  ATH: "athletics",
  HUM: "humanities",
  POL: "politics",
};

function resolveDeptSlot(form){
  // facultySection: "COM · Combat" | "OFFICE OF THE DEAN" | "SUPPORT STAFF"
  const sec = String(form?.facultySection || "");
  const m = sec.match(/^([A-Z]{3,4})\s*·\s*/);
  if (!m) return null; // not a dept-prefixed section
  const deptId = DEPT_CODE_TO_ID[m[1]];
  if (!deptId) return null;

  // facultyRole patterns from getOpenFacultyRoles:
  //   "Head of <Dept Name>"
  //   "Prof. N — <subject>"           (em-dash separator)
  //   "<other instructional role>"    (e.g. "TA · Combat (Heroes lane)",
  //                                    "Workshop Technician",
  //                                    "House Trainer · Valaris")
  const role = String(form?.facultyRole || "").trim();
  if (/^Head of /i.test(role)) {
    return { deptId, slotKind: "head", role };
  }
  if (/^Prof\.\s*\d/i.test(role)) {
    return { deptId, slotKind: "staff", role };
  }
  return { deptId, slotKind: "instructional", role };
}

function buildFaculty(form, id) {
  const linkFrag  = form.rpcLink    ? `, link: ${q(form.rpcLink)}`    : "";
  const humanFrag = form.fullyHuman ? `, human: true`                 : "";
  const powerFrag = form.fullyHuman ? ""
    : `, power: ${q(form.power)}, expression: ${q(form.powerExpression)}, drawbacks: ${q(form.drawbacks)}`;
  const stageFrag = form.alias ? q(form.alias) : '""';

  // Dept-slot submission → sidecar auxFaculty[] (marker insert). The
  // render path merges entries onto matching dept head/staff/instruct
  // rows by deptId + role. Tier letter (A/B/C/D) is stripped from
  // "A-List" to match the powers[] convention.
  const deptSlot = resolveDeptSlot(form);
  if (deptSlot) {
    const tierLetter = (form.tier || "").replace(/-List$/, "");
    const tierFrag = tierLetter ? `, tier: ${q(tierLetter)}` : "";
    const aliasFrag = form.alias ? `, alias: ${q(form.alias)}` : "";
    const auxLine =
      `  { deptId: ${q(deptSlot.deptId)}, slotKind: ${q(deptSlot.slotKind)}, role: ${q(deptSlot.role)}, char: ${q(form.char)}${aliasFrag}${tierFrag}${powerFrag}${humanFrag}${linkFrag} }, // sub:${id}`;
    const out = [{ kind: "marker", marker: "auxFaculty", line: auxLine }];
    if (!form.fullyHuman) {
      out.push({
        kind: "marker",
        marker: "powers",
        line: powersLine(form, id, "faculty"),
      });
    }
    return out;
  }

  // Legacy Dean / Support Staff section → FACULTY[].rows path insert.
  const facultyLine = `{ role: ${q(form.facultyRole)}, char: ${q(form.char)}, stage: ${stageFrag}${powerFrag}${humanFrag}${linkFrag} }, // sub:${id}`;
  const out = [{
    kind: "path",
    path: ["faculty", { section: form.facultySection }, "rows"],
    lines: [facultyLine],
  }];

  // Also write a powers[] entry so the quota scanner can see this
  // character — the powers[] array is the canonical place per-pool
  // per-tier counting reads from. Skip for fully-human applicants
  // (no power, expression, drawbacks to record).
  if (!form.fullyHuman) {
    out.push({
      kind: "marker",
      marker: "powers",
      line: powersLine(form, id, "faculty"),
    });
  }
  return out;
}

function buildStrata(form, id) {
  // STRATA form = hero-list application. Routes into heroLists[<tier>].
  // Form's `tier` is "A-List"/"B-List"/"C-List"; data.js stores just "A"/"B"/"C".
  const tierLetter = (form.tier || "").replace(/-List$/, "");
  const linkFrag  = form.rpcLink    ? `, link: ${q(form.rpcLink)}`    : "";
  const humanFrag = form.fullyHuman ? `, human: true`                 : "";
  const powerFrag = form.fullyHuman ? ""
    : `, power: ${q(form.power)}, expression: ${q(form.powerExpression)}, drawbacks: ${q(form.drawbacks)}`;
  const line = `{ alias: ${q(form.alias)}, char: ${q(form.char)}${powerFrag}${humanFrag}${linkFrag} }, // sub:${id}`;
  return [{
    kind: "path",
    path: ["heroLists", { tier: tierLetter }, "slots"],
    lines: [line],
  }];
}

function buildClub(form, id) {
  const linkFrag  = form.rpcLink    ? `, link: ${q(form.rpcLink)}`    : "";
  const humanFrag = form.fullyHuman ? `, human: true`                 : "";
  const powerFrag = form.fullyHuman ? ""
    : `, power: ${q(form.power)}, expression: ${q(form.powerExpression)}, drawbacks: ${q(form.drawbacks)}`;
  const line = `{ pos: ${q(form.clubPosition)}, char: ${q(form.char)}${powerFrag}${humanFrag}${linkFrag} }, // sub:${id}`;
  const path = form.clubTeam
    ? ["clubs", { name: form.clubName }, "teams", { house: form.clubTeam }, "positions"]
    : ["clubs", { name: form.clubName }, "positions"];
  return [{ kind: "path", path, lines: [line] }];
}

function buildGov(form, id) {
  const linkFrag  = form.rpcLink    ? `, link: ${q(form.rpcLink)}`    : "";
  const humanFrag = form.fullyHuman ? `, human: true`                 : "";
  const powerFrag = form.fullyHuman ? ""
    : `, power: ${q(form.power)}, expression: ${q(form.powerExpression)}, drawbacks: ${q(form.drawbacks)}`;
  const term = form.govTerm || "2026-27";
  const line = `{ pos: ${q(form.govSeat)}, char: ${q(form.char)}, term: ${q(term)}${powerFrag}${humanFrag}${linkFrag} }, // sub:${id}`;
  return [{
    kind: "path",
    path: ["studentGov", { section: form.govSection }, "seats"],
    lines: [line],
  }];
}

function buildCollective(form, id) {
  const flow = form.collectiveFlow;

  if (flow === "createNew") {
    // Collectives are hero-side only; villain orgs go through the Outside
    // form. Faction is fixed so a stale/hand-crafted payload can't seed a
    // villain group here.
    const fac = "hero";
    // Build flat lines so we can tag every one with `// sub:<id>` —
    // that way the same single-pass removal regex used for the simple
    // forms can sweep all of them on toggle-back.
    const raw = [];
    raw.push(`{`);
    raw.push(`    name: ${q(form.newCollectiveName)},`);
    raw.push(`    type: ${q(form.newCollectiveType)},`);
    raw.push(`    status: "Concept",`);
    raw.push(`    faction: ${q(fac)},`);
    raw.push(`    desc: ${q(form.newCollectiveDesc)},`);
    if (form.newCollectiveColor)  raw.push(`    color: ${q(form.newCollectiveColor)},`);
    if (form.newCollectiveBanner) raw.push(`    banner: ${q(form.newCollectiveBanner)},`);
    raw.push(`    members: [`);
    for (const m of (form.newCollectiveMembers || [])) {
      if (!m || !(m.alias || "").trim() || !(m.char || "").trim() || !(m.role || "").trim()) continue;
      raw.push(`      { alias: ${q(m.alias)}, role: ${q(m.role)}, char: ${q(m.char)} },`);
    }
    raw.push(`    ],`);
    raw.push(`  },`);

    const lines = raw.map(l => `${l} // sub:${id}`);
    return [{ kind: "path", path: ["groups"], lines }];
  }

  // joinHero — append a member to the named group.
  const linkFrag  = form.rpcLink    ? `, link: ${q(form.rpcLink)}`    : "";
  const humanFrag = form.fullyHuman ? `, human: true`                 : "";
  const powerFrag = form.fullyHuman ? ""
    : `, power: ${q(form.power)}, expression: ${q(form.powerExpression)}, drawbacks: ${q(form.drawbacks)}`;
  const memberLine = `{ alias: ${q(form.alias)}, role: ${q(form.collectiveRole)}, char: ${q(form.char)}${powerFrag}${humanFrag}${linkFrag} }, // sub:${id}`;
  const out = [{
    kind: "path",
    path: ["groups", { name: form.collectiveName }, "members"],
    lines: [memberLine],
  }];

  if (!form.fullyHuman) {
    out.push({
      kind: "marker",
      marker: "powers",
      line: powersLine(form, id, "unsanctioned"),
    });
  }
  return out;
}

function buildOutside(form, id) {
  const linkFrag  = form.rpcLink    ? `, link: ${q(form.rpcLink)}`    : "";
  const humanFrag = form.fullyHuman ? `, human: true`                 : "";
  const powerFrag = form.fullyHuman ? ""
    : `, power: ${q(form.power)}, expression: ${q(form.powerExpression)}, drawbacks: ${q(form.drawbacks)}`;
  const line = `{ role: ${q(form.outsideRole)}, char: ${q(form.char)}${powerFrag}${humanFrag}${linkFrag} }, // sub:${id}`;
  const out = [{
    kind: "path",
    path: ["outside", { section: form.outsideSection }, "orgs", { name: form.outsideOrg }, "roles"],
    lines: [line],
  }];

  if (!form.fullyHuman) {
    const aliasFrag  = form.alias        ? `, alias: ${q(form.alias)}`        : "";
    const statusFrag = form.outsideStatus ? `, status: ${q(form.outsideStatus)}` : "";
    const tierVal    = form.tier && form.tier !== "N/A" ? form.tier.replace("-List", "") : "";
    const tierFrag   = tierVal ? `, tier: ${q(tierVal)}` : "";
    const powersLineOutside =
      `  { char: ${q(form.char)}${aliasFrag}${statusFrag}${tierFrag}, power: ${q(form.power)}, expression: ${q(form.powerExpression)}, drawbacks: ${q(form.drawbacks)}${linkFrag} }, // sub:${id}`;
    out.push({ kind: "marker", marker: "powers", line: powersLineOutside });
  }
  return out;
}

// Helper used by student + collective-join + outside (when powered).
function powersLine(form, id, status) {
  const aliasFrag = form.alias ? `, alias: ${q(form.alias)}` : "";
  const linkFrag  = form.rpcLink ? `, link: ${q(form.rpcLink)}` : "";
  let tierFrag = "";
  if (status === "student") {
    const t = form.tier ? form.tier.replace("-List", "") : "";
    if (t) tierFrag = `, tier: ${q(t)}`;
  } else if (status === "unsanctioned") {
    const t = form.tier && form.tier !== "N/A" ? form.tier.replace("-List", "") : "";
    if (t) tierFrag = `, tier: ${q(t)}`;
  }
  return `  { char: ${q(form.char)}${aliasFrag}, status: ${q(status)}${tierFrag}, power: ${q(form.power)}, expression: ${q(form.powerExpression)}, drawbacks: ${q(form.drawbacks)}${linkFrag} }, // sub:${id}`;
}

// JS-string serialiser: double-quoted, with \, ", and newlines escaped.
// Matches what the original snippet generated.
function q(v) {
  if (!v && v !== 0) return "";
  return `"${String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "")}"`;
}
