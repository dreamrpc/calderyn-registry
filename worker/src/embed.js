// Build the Discord application embed from a raw form submission.
// Mirrors what app.jsx used to build client-side, just moved server-side
// so the client doesn't need to know Discord's payload shape.

const FIELD_VALUE_MAX = 1024;
const FIELDS_PER_EMBED_MAX = 25;

const TYPE_NAMES = {
  student:    "Student",
  faculty:    "Faculty",
  strata:     "STRATA Hero",
  club:       "Club Position",
  gov:        "Student Gov",
  collective: "Collective",
  outside:    "Outside Calderyn",
};

export function buildEmbed(type, form, opts = {}) {
  const typeName = TYPE_NAMES[type] || type;
  const fields = [];

  push(fields, "Type",         typeName, true);
  push(fields, "Character",    form.char || "—", true);
  push(fields, "RPC Profile",  form.rpcLink || "—", false);
  push(fields, "Stage Name / Alias", form.alias, true);
  push(fields, "House",        form.house, true);
  push(fields, "Year",         form.year, true);
  push(fields, "Track",        form.track, true);
  push(fields, "Tier",         form.tier, true);

  if (form.facultyRole)  push(fields, "Faculty Role",  `${form.facultyRole} (${form.facultySection || "?"})`, false);
  if (form.clubPosition) push(fields, "Club Position", `${form.clubName || "?"} — ${form.clubPosition}${form.clubTeam ? ` (${form.clubTeam})` : ""}`, false);
  if (form.govSeat)      push(fields, "Gov Seat",      `${form.govSeat} (${form.govSection || "?"})`, false);

  if (type === "collective" && form.collectiveFlow) {
    const flow = form.collectiveFlow;
    const label =
      flow === "joinHero"    ? "Join (Hero-side)"      :
      flow === "createNew"   ? "Create New Collective" : flow;
    push(fields, "Collective Flow", label, true);

    if (flow === "joinHero") {
      push(fields, "Faction",    "Hero", true);
      push(fields, "Collective", `${form.collectiveName || "?"} — ${form.collectiveRole || "?"}`, false);
    } else if (flow === "createNew") {
      push(fields, "Faction",        "Hero", true);
      push(fields, "New Collective", form.newCollectiveName || "—", true);
      push(fields, "Kind",           form.newCollectiveType, true);
      push(fields, "Colour",         form.newCollectiveColor, true);
      push(fields, "Banner",         form.newCollectiveBanner, false);
      pushSplit(fields, "Description", form.newCollectiveDesc);
      const founding = (form.newCollectiveMembers || [])
        .filter(m => m && (m.alias || "").trim() && (m.char || "").trim() && (m.role || "").trim())
        .map((m, i) => `${i + 1}. ${m.alias} — ${m.role} (${m.char})`)
        .join("\n");
      pushSplit(fields, "Founding Members", founding);
    }
  } else if (form.collectiveRole) {
    push(fields, "Collective", `${form.collectiveName || "?"} — ${form.collectiveRole}`, false);
  }

  if (form.outsideRole) push(fields, "Outside Role", `${form.outsideOrg || "?"} — ${form.outsideRole}`, false);
  if (form.outsideStatus) push(fields, "Registry Status", form.outsideStatus, true);

  if (form.fullyHuman) {
    push(fields, "Powers", "Fully human — no powers.", false);
  } else {
    if (form.power) push(fields, "Power / Ability", form.power, true);
    pushSplit(fields, "Power Expression", form.powerExpression);
    pushSplit(fields, "Drawbacks", form.drawbacks);
  }

  if (form.optClubPosition) push(fields, "Optional Club", `${form.optClubName || "?"} — ${form.optClubPosition}${form.optClubTeam ? ` (${form.optClubTeam})` : ""}`, false);
  if (form.optGovSeat)      push(fields, "Optional Gov Seat", `${form.optGovSeat} (${form.optGovSection || "?"})`, false);

  pushSplit(fields, "Additional Notes", form.notes);
  push(fields, "Rules Acknowledged", form.rulesAgree ? "✅ Confirmed read & agreed" : "✗ Not confirmed", false);

  return {
    title: `New Application · ${typeName}`,
    description:
      type === "collective" && form.collectiveFlow === "createNew"
        ? `Proposing **${form.newCollectiveName || "(unnamed collective)"}** — hero-side · submitted by ${form.char || "(unknown)"}`
        : `**${form.char}**${form.alias ? ` — *${form.alias}*` : ""}`,
    color:
      opts.color ?? 0xe31b23,
    fields: capFields(fields),
    footer: { text: opts.footer || "Calderyn College · Central Registry · 2026" },
    timestamp: new Date().toISOString(),
  };
}

// Same logic as the old client-side splitField — word-aware split of any
// value over 1024 chars into "Field (1/N)" parts.
export function pushSplit(fields, name, value, inline = false) {
  if (!value) return;
  const v = String(value);
  if (v.length <= FIELD_VALUE_MAX) {
    fields.push({ name, value: v, inline });
    return;
  }
  const parts = [];
  let rest = v;
  while (rest.length > FIELD_VALUE_MAX) {
    let cut = rest.lastIndexOf("\n", FIELD_VALUE_MAX);
    if (cut < 600) cut = rest.lastIndexOf(" ", FIELD_VALUE_MAX);
    if (cut < 600) cut = FIELD_VALUE_MAX;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) parts.push(rest);
  parts.forEach((chunk, i) => {
    fields.push({
      name: parts.length > 1 ? `${name} (${i + 1}/${parts.length})` : name,
      value: chunk,
      inline,
    });
  });
}

function push(fields, name, value, inline) {
  if (!value) return;
  fields.push({ name, value: String(value), inline });
}

function capFields(fields) {
  if (fields.length <= FIELDS_PER_EMBED_MAX) return fields;
  const keep = fields.slice(0, FIELDS_PER_EMBED_MAX - 1);
  const droppedNames = fields
    .slice(FIELDS_PER_EMBED_MAX - 1)
    .map(f => f.name)
    .join(", ")
    .slice(0, FIELD_VALUE_MAX - 80);
  keep.push({
    name: "More (truncated)",
    value: "Additional fields didn't fit Discord's 25-field limit: " + droppedNames,
    inline: false,
  });
  return keep;
}
