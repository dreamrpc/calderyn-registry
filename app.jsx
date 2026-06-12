/* ════════════════════════════════════════════════════════════════════════
   CALDERYN COLLEGE — APPLICATION CODE
   ════════════════════════════════════════════════════════════════════════

   FILE LAYOUT  ──────────────────────────────────────────────────────────
   This is the main React app. It's a single Babel-standalone file
   (no build step). For maintainability the file is split into named
   sections — search by the section banner to jump:

     CONSTANTS               worker URLs, fallback lists, React import
     REUSABLE COMPONENTS     CLink, Chip, HouseTag, TierChip, PageHead
     HOME                    HomeTab + sub-components
     RULES                   RulesTab
     LORE / HOUSES           HousesTab
     CAMPUS MAP              MapTab
     FACULTY                 FacultyTab
     STUDENTS                StudentsTab + filter logic
     CLUBS                   ClubsTab + ClubDetail
     STRATA                  StrataTab + directory
     OUTSIDE                 OutsideTab
     POWERS                  PowersTab
     JOIN                    JoinTab + JoinFieldset + Field utils
     APP SHELL               App + masthead + tabs nav + tab dispatch
     MOUNT                   ReactDOM.createRoot at the bottom

   WHERE TO EDIT  ────────────────────────────────────────────────────────
     - Add a character / club / power → data.js
     - Add an icon → src/icons.jsx
     - Adjust home-page Vanguard or form-wizard pages → src/configs.jsx
     - Change a tab's content → this file, jump to that section banner

   Application submissions route through a Cloudflare Worker proxy so
   webhook URLs are never exposed in client code.
   ════════════════════════════════════════════════════════════════════════ */

const WORKER_BASE       = "https://calderyn-registry-relay.dreamroleplaywriter.workers.dev";
const WORKER_URL        = WORKER_BASE + "/submit";
const QUOTA_URL         = WORKER_BASE + "/quota-stats";
const WRITER_TAGS_URL   = WORKER_BASE + "/writer-tags";
const STATUS_URL        = WORKER_BASE + "/status";

// LocalStorage key for the writer's most recent submission receipt.
// Survives refresh so a pending review still shows the receipt screen,
// and the polling loop picks up the approve/reject state change once
// the admin clicks the Discord button.
const SUBMISSION_LS_KEY = "calderyn:lastSubmission";

// Fallback Writer Tag list used until the live fetch from /writer-tags
// returns (or if it fails). Keep it roughly in sync with the values
// currently in worker/src/writers.js — the live fetch supersedes it
// the moment it arrives.
const WRITER_TAGS_FALLBACK = ["Dream", "Katniss", "Skully", "Star", "Star King", "Storm", "Tyler", "Wilder"];

const {useState, useMemo, useEffect, useCallback, useRef} = React;

/* ════════════════════════════════════════════════════════════════════════
   ICONS · HOME · WIZARD CONFIGS
   ════════════════════════════════════════════════════════════════════════
   Previously split into src/icons.jsx + src/configs.jsx, but Cloudflare
   Pages serves index.html for any /src/* path on this project, which
   broke the in-browser Babel loader. Inlined here so the app boots
   from one script (data.js + app.jsx). Editing surface remains
   identical — search by these banners to find each block.

   ADDING AN ICON
     1. Find the icon on https://lucide.dev/icons
     2. Add a row to ICON_PATHS below, keyed by name. Keep alphabetical.
     3. <Icon name="your-icon" size={16}/> available everywhere.

   ADDING A WIZARD PAGE
     1. Append an entry to the relevant type's array in JOIN_WIZARD
     2. Wrap the JSX in JoinFieldset with {onPage("your-id") && ...}

   ADDING A VANGUARD CARD
     1. Append a row to HOME_VANGUARD. Home page picks it up.
   ════════════════════════════════════════════════════════════════════════ */

/* ─── Lucide SVG path defs ──────────────────────────────────────────── */
const ICON_PATHS = {
  "alert-triangle": <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>,
  "arrow-left":     <><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></>,
  "arrow-right":    <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
  "arrow-up-right": <><path d="M7 7h10v10"/><path d="M7 17 17 7"/></>,
  "book-open":      <><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></>,
  "check":          <><path d="M20 6 9 17l-5-5"/></>,
  "chevron-down":   <><path d="m6 9 6 6 6-6"/></>,
  "chevron-right":  <><path d="m9 18 6-6-6-6"/></>,
  "chevron-up":     <><path d="m18 15-6-6-6 6"/></>,
  "cloud":          <><path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.78A7 7 0 0 0 3 11.5a4.5 4.5 0 0 0 4.5 4.5h10"/></>,
  "cloud-drizzle":  <><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 19v1"/><path d="M8 14v1"/><path d="M16 19v1"/><path d="M16 14v1"/><path d="M12 21v1"/><path d="M12 16v1"/></>,
  "cloud-fog":      <><path d="M17.5 17a4.5 4.5 0 1 0-1.4-8.78A7 7 0 0 0 3 9.5h2.5"/><path d="M5 16h17"/><path d="M2 19h20"/></>,
  "cloud-lightning":<><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/></>,
  "cloud-rain":     <><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></>,
  "cloud-snow":     <><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 15h.01"/><path d="M8 19h.01"/><path d="M12 17h.01"/><path d="M12 21h.01"/><path d="M16 15h.01"/><path d="M16 19h.01"/></>,
  "cloud-sun":      <><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/></>,
  "crosshair":      <><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></>,
  "sun":            <><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></>,
  "external-link":  <><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M21 14v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/></>,
  "file-text":      <><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></>,
  "flag":           <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></>,
  "info":           <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>,
  "map":            <><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></>,
  "menu":           <><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></>,
  "scroll-text":    <><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></>,
  "search":         <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>,
  "shield":         <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></>,
  "trophy":         <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></>,
  "sparkles":       <><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></>,
  "users":          <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  "x":              <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
};

/* ─── <Icon name="..."/> component ─────────────────────────────────── */
function Icon({ name, size = 16, stroke = 1.5, className = "", style }){
  const paths = ICON_PATHS[name];
  if (!paths) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={"icon " + className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {paths}
    </svg>
  );
}

/* ─── Home page Vanguard quartet ───────────────────────────────────── */
const HOME_VANGUARD = [
  {
    alias: "PARAGON",
    name:  "Adrian Valaris",
    age:   45,
    house: "valaris",
    color: "#e31b23",
    portrait: "https://i.ibb.co/Tx8LND9D/884dff81-b7c4-448a-be91-1d79b440f8e3.png",
    power: "Solar metabolism. Uncapped strength. Flight. Heat vision.",
    tag:   "The symbol.",
    hook:  "Britain's most-watched man. Britain's most-wanted man.",
  },
  {
    alias: "VIGIL",
    name:  "Caius Saberis",
    age:   42,
    house: "saberis",
    color: "#15803d",
    portrait: "https://i.ibb.co/SDY1sLN8/2377bc73-8c3f-40c6-951d-7f0365013c2a.png",
    power: "Ninety-second precognition. Folded-steel longsword.",
    tag:   "The strategist.",
    hook:  "Already saw you reading this. Picked the version where you applied.",
  },
  {
    alias: "AEGIS",
    name:  "Margery Orenne",
    age:   39,
    house: "orenne",
    color: "#d4901a",
    portrait: "https://i.ibb.co/fKV1tKH/ccf8e712-87c2-4da0-af44-d290385a7e8c.png",
    power: "Damage resistance. Flight. Six-times healing. Indecent endurance.",
    tag:   "The rescuer.",
    hook:  "Three hundred miles an hour. Skips the queue.",
  },
  {
    alias: "SWITCHBOARD",
    name:  "Iris Grimere",
    age:   35,
    house: "grimere",
    color: "#3b82f6",
    portrait: "https://i.ibb.co/LzyQcRcL/a18a925b-91f4-45d8-b2e3-66821aaf9661.png",
    power: "Technokinesis. Owns your phone. Probably owns your gear.",
    tag:   "The architect.",
    hook:  "Baseline body. Three cats. The deadliest of them.",
  },
];

/* ─── Join-form multi-page wizard config ──────────────────────────── */
const JOIN_WIZARD = {
  student: [
    { id: "profile", title: "Profile",     subtitle: "Who's writing, who they're playing.", required: ["char", "rpcLink", "ooc"] },
    { id: "role",    title: "Enrollment",  subtitle: "Where in Calderyn they sit.",         required: ["house", "year", "track", "tier"] },
    { id: "power",   title: "Power",       subtitle: "What they can do, and what it costs.", required: (f) => f.fullyHuman ? [] : ["power", "powerExpression", "drawbacks"] },
    { id: "submit",  title: "Confirm",     subtitle: "Read the line, sign the line.",       required: ["rulesAgree"] },
  ],
  faculty: [
    { id: "profile", title: "Profile",     subtitle: "Who's writing, who they're playing.", required: ["char", "rpcLink", "ooc"] },
    { id: "role",    title: "Position",    subtitle: "What they teach, run, or oversee.",   required: ["facultyRole", "tier"] },
    { id: "power",   title: "Power",       subtitle: "What they can do, and what it costs.", required: (f) => f.fullyHuman ? [] : ["power", "powerExpression", "drawbacks"] },
    { id: "submit",  title: "Confirm",     subtitle: "Read the line, sign the line.",       required: ["rulesAgree"] },
  ],
  strata: [
    { id: "profile", title: "Profile",     subtitle: "Who's writing, who they're playing.", required: ["char", "rpcLink", "ooc"] },
    { id: "role",    title: "Position",    subtitle: "Where they sit inside STRATA.",       required: (f) => f.strataRole === "corporate" ? ["strataRole", "strataDept", "strataTitle"] : ["strataRole", "alias", "tier"] },
    { id: "power",   title: "Power",       subtitle: "What they can do, and what it costs.", required: (f) => f.fullyHuman ? [] : ["power", "powerExpression", "drawbacks"] },
    { id: "submit",  title: "Confirm",     subtitle: "Read the line, sign the line.",       required: ["rulesAgree"] },
  ],
  club: [
    { id: "profile", title: "Profile",     subtitle: "Who's writing, who they're playing.", required: ["char", "rpcLink", "ooc"] },
    { id: "role",    title: "Position",    subtitle: "Pick from the open club roster.",     required: (f) => f.clubName === "Supebrawl" ? ["clubPosition", "supebrawlInvite"] : ["clubPosition"] },
    { id: "submit",  title: "Confirm",     subtitle: "Read the line, sign the line.",       required: ["rulesAgree"] },
  ],
  gov: [
    { id: "profile", title: "Profile",     subtitle: "Who's writing, who they're playing.", required: ["char", "rpcLink", "ooc"] },
    { id: "role",    title: "Seat",        subtitle: "Which student-government office.",    required: ["govSeat"] },
    { id: "submit",  title: "Confirm",     subtitle: "Read the line, sign the line.",       required: ["rulesAgree"] },
  ],
  collective: [
    { id: "profile", title: "Profile",     subtitle: "Who's writing, who they're playing.", required: ["char", "rpcLink", "ooc"] },
    { id: "role",    title: "Affiliation", subtitle: "Pick a collective to join, or propose a brand-new one.", required: (f) => {
      if (f.collectiveFlow === "createNew") {
        return ["collectiveFlow", "newCollectiveName", "newCollectiveType", "newCollectiveDesc"];
      }
      if (f.collectiveFlow === "joinHero") {
        return ["collectiveFlow", "alias", "collectiveName", "collectiveRole", "tier"];
      }
      return ["collectiveFlow"];
    } },
    { id: "power",   title: "Power",       subtitle: "What they can do, and what it costs.", required: (f) => {
      // Create-new flow doesn't require power — the founder may not be a member themselves.
      if (f.collectiveFlow === "createNew") return [];
      return f.fullyHuman ? [] : ["power", "powerExpression", "drawbacks"];
    } },
    { id: "submit",  title: "Confirm",     subtitle: "Read the line, sign the line.",       required: ["rulesAgree"] },
  ],
  outside: [
    { id: "profile", title: "Profile",     subtitle: "Who's writing, who they're playing.", required: ["char", "rpcLink", "ooc"] },
    { id: "role",    title: "Affiliation", subtitle: "Where they operate outside Calderyn.", required: ["outsideOrg", "outsideRole", "outsideStatus", "tier"] },
    { id: "power",   title: "Power",       subtitle: "What they can do, and what it costs.", required: (f) => f.fullyHuman ? [] : ["power", "powerExpression", "drawbacks"] },
    { id: "submit",  title: "Confirm",     subtitle: "Read the line, sign the line.",       required: ["rulesAgree"] },
  ],
};

/* Per-type display title used by the form master header — overrides the
   APPLICATION_TYPES name when "<Name> Application" reads awkwardly. */
const JOIN_FORM_TITLES = {
  student:    "Student Application",
  faculty:    "Faculty Application",
  strata:     "STRATA Application",
  club:       "Club Position Application",
  gov:        "Student Government Application",
  collective: "Collective Application",
  outside:    "Outside Operator Application",
};
const D = window.CALDERYN;

/* DATA BINDINGS ─────────────────────────────────────────────────────────── */
const HC             = D.houseColors;
const HC_PRIMARY     = Object.fromEntries(
  Object.entries(D.houseColors).map(([k, v]) => [k, v.primary])
);
const HOUSES         = D.houses;
const TIER_C          = {"A-List":"#e31b23","B-List":"#1e40af","C-List":"#15803d","D-List":"#54545c","Unclassified":"#555"};
const STUDENTS       = D.students;

// Collapse relay-Worker slot fills onto their open placeholder rows.
// Approved faculty / club / gov / strata / outside applications are
// APPENDED to the target array by the Worker — the original open-slot
// row stays put so the Discord reject toggle can roll back by deleting
// `// sub:<id>` lines alone (see worker/src/markers.js). At load time,
// each appended filled row takes over the first still-open row ABOVE it
// with the same `key` value ("role" / "pos"; pass null when any open
// row is a match, e.g. hero-list slots): slot fields the fill doesn't
// carry (group, term, …) are kept from the placeholder, and the
// appended duplicate row is dropped — so rosters, OPEN dropdowns,
// counts, and search all see one row per slot. Rows hand-merged into
// their slot are safe: their open twins sit at or after them, and only
// rows ABOVE a fill can be consumed.
function collapseSlotRows(rows, key){
  const out = [...rows];
  for (let j = 1; j < out.length; j++){
    const f = out[j];
    if (!f || !f.char) continue;
    const fk = key ? String(f[key] ?? "") : null;
    if (key && !fk) continue;
    for (let i = 0; i < j; i++){
      const o = out[i];
      if (!o || o.char || o.clf) continue;
      if (key && String(o[key] ?? "") !== fk) continue;
      out[i] = { ...o, ...f };
      out.splice(j, 1);
      j--;
      break;
    }
  }
  return out;
}

const FACULTY        = D.faculty.map(sec =>
  ({ ...sec, rows: collapseSlotRows(sec.rows || [], "role") }));
const AUX_FACULTY    = D.auxFaculty || [];
// Forward declaration so applyAuxFaculty can be defined below and
// still reference AUX_FACULTY. DEPARTMENTS is initialised after the
// helper exists. Every D.departments read in the app should use
// DEPARTMENTS instead so approved-via-form profs render everywhere.
let DEPARTMENTS = [];

// Merge approved-via-form profs from auxFaculty[] onto a department's
// head / staff / instructional slots. Match by deptId + role; the
// first OPEN slot (no char) for the matching role gets filled with
// the aux entry's person data. Pure (returns a new dept object).
function applyAuxFaculty(dept){
  if (!dept || !AUX_FACULTY.length) return dept;
  const mine = AUX_FACULTY.filter(a => a && a.deptId === dept.id);
  if (mine.length === 0) return dept;

  let head = dept.head;
  const staff = (dept.staff || []).map(s => ({...s}));
  const instructional = (dept.instructional || []).map(p => ({...p}));

  for (const a of mine) {
    const fields = {
      char: a.char,
      link: a.link,
      alias: a.alias,
      tier: a.tier,
      power: a.power,
      npc: a.npc,
    };
    if (a.slotKind === "head") {
      if (head && !head.char) head = { ...head, ...fields };
    } else if (a.slotKind === "staff") {
      // Match by Prof slot number when present, otherwise by role text.
      const profMatch = String(a.role || "").match(/Prof\.\s*(\d)/i);
      const idx = profMatch
        ? staff.findIndex(s => s.slot && String(s.slot).match(new RegExp("Prof\\.\\s*" + profMatch[1])) && !s.char)
        : staff.findIndex(s => !s.char && (s.role || "") === a.role);
      if (idx >= 0) staff[idx] = { ...staff[idx], ...fields };
    } else if (a.slotKind === "instructional") {
      const idx = instructional.findIndex(p => !p.char && (p.role || "") === a.role);
      if (idx >= 0) instructional[idx] = { ...instructional[idx], ...fields };
    }
  }
  return { ...dept, head, staff, instructional };
}

// Initialise the merged departments list. Use this everywhere instead
// of `D.departments` so approved-via-form profs show in the Faculty
// Registry, dropdowns, and global search.
DEPARTMENTS = (D.departments || []).map(applyAuxFaculty);
const STRATA         = D.strata;
const OUTSIDE        = D.outside.map(sec => ({
  ...sec,
  orgs: (sec.orgs || []).map(org =>
    ({ ...org, roles: collapseSlotRows(org.roles || [], "role") })),
}));
const POWERS         = D.powers;
const POWER_STATUSES    = D.powerStatuses;
const BANNED_POWERS     = D.bannedPowers;
const RESTRICTED_POWERS = D.restrictedPowers || [];
const POWER_TIERS    = D.powerTiers;
const CLUBS          = D.clubs.map(c => ({
  ...c,
  positions: c.positions ? collapseSlotRows(c.positions, "pos") : c.positions,
  teams: c.teams
    ? c.teams.map(t => ({ ...t, positions: collapseSlotRows(t.positions || [], "pos") }))
    : c.teams,
}));
const STUDENT_GOV    = D.studentGov.map(sec =>
  ({ ...sec, seats: collapseSlotRows(sec.seats || [], "pos") }));
const HERO_LISTS     = D.heroLists.map(list =>
  ({ ...list, slots: collapseSlotRows(list.slots || [], null) }));
const GROUPS         = D.groups;
const TABS           = D.tabs;
const TIER_COLOR     = {A:"#e31b23", B:"#1e40af", C:"#d4a843", D:"#54545c", E:"#6b3a3a"};

/* RegistryContext — used by global search to deep-link into subviewed tabs */
const RegContext = React.createContext({
  targetSubview: null,
  consumeSubview: () => {},
});

/* REUSABLE COMPONENTS ───────────────────────────────────────────────────── */

function CLink({name, link, cls}){
  if(!name) return null;
  const cn = "clink" + (cls ? " " + cls : "");
  return link
    ? <a className={cn} href={link} target="_blank" rel="noopener noreferrer">{name}</a>
    : <span className={"cname" + (cls ? " " + cls : "")}>{name}</span>;
}

function EmptyState({label = "open"}){
  return <span className="empty">{label}</span>;
}

function NpcBadge(){
  return <span className="npc-badge" title="Non-player character">NPC</span>;
}

function Chip({variant = "ghost", children}){
  return <span className={"chip chip-" + variant}>{children}</span>;
}

function HouseTag({house}){
  if(!house) return null;
  const c = HC_PRIMARY[house.toLowerCase()];
  return (
    <span className="house-cell">
      {c && <span className="hdot" style={{background:c}} aria-hidden="true"/>}
      <span className="house-cell-name">{house}</span>
    </span>
  );
}

function hay(...parts){
  return parts.filter(Boolean).join(" ").toLowerCase();
}

/* GLOBAL SEARCH INDEX ─────────────────────────────────────────────────── */
const SEARCH_INDEX = (() => {
  const out = [];
  const push = (i) => out.push(i);

  STUDENTS.forEach(s => {
    push({
      kind: "Student",
      label: s.char,
      sub: [s.alias && `"${s.alias}"`, s.house, s.year, s.tier].filter(Boolean).join(" · "),
      tab: "students",
      subview: (s.track || "").toLowerCase() === "sidekick" ? "sidekicks" : "heroes",
      link: s.link || null,
      keys: hay(s.char, s.alias, s.house, s.year, s.power, s.tier, s.track),
    });
  });

  FACULTY.forEach(sec => {
    // Skip the legacy 8 dept sections (now sourced from D.departments).
    if (!/office of the dean|support staff/i.test(sec.section)) return;
    sec.rows.forEach(r => {
      if (r.clf) return;
      push({
        kind: "Faculty",
        label: r.char || r.role,
        sub: r.char ? r.role : `${sec.section} · open`,
        tab: "faculty",
        link: r.link || null,
        keys: hay(r.role, r.char, sec.section),
      });
    });
  });

  // Dept staff (head + numbered profs + instructional) — single source
  // of truth for departmental faculty.
  DEPARTMENTS.forEach(dept => {
    const sectionLabel = `${dept.code} · ${dept.name}`;
    const addRow = (r, defaultRole) => {
      if (!r) return;
      const role = r.role || defaultRole;
      push({
        kind: "Faculty",
        label: r.char || role,
        sub: r.char ? role : `${sectionLabel} · open`,
        tab: "faculty",
        link: r.link || null,
        keys: hay(role, r.char, sectionLabel),
      });
    };
    addRow(dept.head, "Head of Department");
    (dept.staff || []).forEach(s => addRow(s, "Faculty"));
    (dept.instructional || []).forEach(p => addRow(p, "Instructional Staff"));
  });

  STRATA.forEach(sec => sec.rows.forEach(r => {
    if (r.clf) return;
    push({
      kind: "STRATA",
      label: r.char || r.role,
      sub: r.char ? r.role : `${sec.section} · open`,
      tab: "strata",
      subview: "corporate",
      link: r.link || null,
      keys: hay(r.role, r.char, sec.section),
    });
  }));

  HERO_LISTS.forEach(list => list.slots.forEach(s => {
    push({
      kind: list.tier === "E" ? "Expendable" : "Hero",
      label: s.char || s.alias,
      sub: s.char ? `${s.alias} · ${list.label}` : `${list.label} · open`,
      tab: "strata",
      subview: "talent",
      link: s.link || null,
      keys: hay(s.alias, s.char, list.label, s.role, s.power),
    });
  }));

  GROUPS.forEach(g => {
    push({
      kind: "Group",
      label: g.name,
      sub: `${g.type} · ${g.status}`,
      tab: "strata",
      subview: "groups",
      link: null,
      keys: hay(g.name, g.type, g.status, g.desc),
    });
    g.members.forEach(m => push({
      kind: "Group Member",
      label: m.char || m.alias,
      sub: m.char ? `${m.alias} · ${g.name}` : `${g.name} · open`,
      tab: "strata",
      subview: "groups",
      link: m.link || null,
      keys: hay(m.alias, m.char, m.role, g.name),
    }));
  });

  OUTSIDE.forEach(sec => (sec.orgs || []).forEach(org => (org.roles || []).forEach(r => {
    if (r.clf) return;
    push({
      kind: "Outside",
      label: r.char || `${r.role} · ${org.name}`,
      sub: r.char ? `${r.role} · ${org.name}` : `${org.name} · open`,
      tab: "outside",
      link: r.link || null,
      keys: hay(r.role, r.char, org.name, org.type, sec.section),
    });
  })));

  CLUBS.forEach(c => {
    push({
      kind: "Club",
      label: c.name,
      sub: `${c.access || ""}`.trim() || "Club",
      tab: "clubs",
      link: null,
      keys: hay(c.name, c.tag, c.access, c.desc),
    });
    (c.positions || []).forEach(p => push({
      kind: "Club Role",
      label: p.char || p.pos,
      sub: p.char ? `${p.pos} · ${c.name}` : `${c.name} · ${p.pos} · open`,
      tab: "clubs",
      link: p.link || null,
      keys: hay(p.pos, p.char, c.name),
    }));
    (c.teams || []).forEach(t => t.positions.forEach(p => push({
      kind: "Team Player",
      label: p.char || p.pos,
      sub: p.char
        ? `${p.pos} · ${t.house} · ${c.name}`
        : `${t.house} ${c.name} · ${p.pos} · open`,
      tab: "clubs",
      link: p.link || null,
      keys: hay(p.pos, p.char, t.house, c.name),
    })));
  });

  STUDENT_GOV.forEach(sec => sec.seats.forEach(s => {
    push({
      kind: "Govt",
      label: s.char || s.pos,
      sub: s.char ? `${s.pos} · ${sec.section}` : `${sec.section} · open`,
      tab: "students",
      subview: "govt",
      link: s.link || null,
      keys: hay(s.pos, s.char, sec.section, s.term),
    });
  }));

  POWERS.forEach(p => push({
    kind: "Power",
    label: p.char || p.alias,
    sub: [p.alias && `"${p.alias}"`, p.power, p.tier && `${p.tier}-List`].filter(Boolean).join(" · "),
    tab: "powers",
    subview: "registry",
    link: p.link || null,
    keys: hay(p.power, p.char, p.alias, p.expression, p.tier, p.status),
  }));

  return out;
})();

function TierChip({tier}){
  if(!tier) return <EmptyState label="N/A"/>;
  return (
    <span className="tier-pill" style={{background:TIER_COLOR[tier]||"#555"}}>
      {tier === "E" ? "Expendable" : `${tier}-List`}
    </span>
  );
}

/* ─── PageHead ─────────────────────────────────────────────────────────
   New cinematic layout: page-number registration mark top-right,
   crosshair top-left, prestige stamp + serif headline + italic body. */
function PageHead({stamp, title, body, note, noteVariant, pageNum}){
  return (
    <div className="pg-hd" data-pg={pageNum || ""}>
      <div className="pg-hd-inner">
        <div className="pg-hd-title">
          {stamp && (
            <div className="pg-hd-stamp">
              <span className="pg-hd-stamp-mark">█</span>
              <span className="pg-hd-stamp-text">{stamp}</span>
              <span className="pg-hd-stamp-spacer">·</span>
              <span className="pg-hd-stamp-status">ARCHIVE</span>
            </div>
          )}
          <h2>{title}</h2>
          {body && <p>{body}</p>}
        </div>
        {note && (
          <div className={"pg-hd-note" + (noteVariant === "warn" ? " warn" : "")}>
            {note}
          </div>
        )}
      </div>
    </div>
  );
}


function SectionedTable({data, positionHeader = "Position", mode = "default"}){
  const isFaculty = mode === "faculty";
  return (
    <div className="tw">
      <table>
        <thead><tr>
          <th style={{width: isFaculty ? 200 : 240}}>{positionHeader}</th>
          {isFaculty && <th style={{width:130}}>Tracks</th>}
          <th>{isFaculty ? "Subjects Taught" : "Character"}</th>
          {!isFaculty && <th style={{width:240}}>Power / Ability</th>}
          {isFaculty && <th style={{width:170}}>Character</th>}
          {isFaculty && <th style={{width:130}}>Stage Name</th>}
        </tr></thead>
        <tbody>
          {data.map((sec, si) => {
            const colSpan = isFaculty ? 5 : 3;
            return (
              <React.Fragment key={si}>
                <tr className="sec-row"><td colSpan={colSpan}>{sec.section}</td></tr>
                {sec.note && <tr className="sub-row"><td colSpan={colSpan}>{sec.note}</td></tr>}
                {sec.rows.map((r, ri) => (
                  <tr key={`${si}-${ri}`}>
                    <td style={{fontWeight:600, fontSize:13}}>{r.role}</td>
                    {isFaculty && (
                      <td>
                        {r.tracks && r.tracks.length > 0
                          ? <span className="track-tags">
                              {r.tracks.includes("hero") && <span className="track-tag track-tag-hero">Heroes</span>}
                              {r.tracks.includes("sidekick") && <span className="track-tag track-tag-sidekick">Sidekicks</span>}
                            </span>
                          : <span className="track-tag-empty">—</span>}
                      </td>
                    )}
                    {isFaculty ? (
                      <td>
                        {r.subjects && r.subjects.length > 0
                          ? <ul className="subject-list">
                              {r.subjects.map((s, sj) => {
                                const isObj = typeof s === "object";
                                const year  = isObj ? s.year  : (s.match(/^(FR|SO|JR|SR)/) || [])[1];
                                const title = isObj ? s.title : s.replace(/^(FR|SO|JR|SR)\s*·\s*/, "");
                                const desc  = isObj ? s.desc  : null;
                                return (
                                  <li key={sj}>
                                    <span className="subject-line">{year} · {title}</span>
                                    {desc && <span className="subject-desc">{desc}</span>}
                                  </li>
                                );
                              })}
                            </ul>
                          : <span className="subject-list-empty">—</span>}
                      </td>
                    ) : (
                      <td>
                        {r.clf
                          ? <Chip variant="classified">■ CLASSIFIED</Chip>
                          : r.char
                            ? <><CLink name={r.char} link={r.link||null}/>{r.npc && <NpcBadge/>}</>
                            : <EmptyState/>}
                      </td>
                    )}
                    {isFaculty ? (
                      <>
                        <td>
                          {r.clf
                            ? <Chip variant="classified">■ CLASSIFIED</Chip>
                            : r.char
                              ? <><CLink name={r.char} link={r.link||null}/>{r.npc && <NpcBadge/>}</>
                              : <EmptyState/>}
                        </td>
                        <td>
                          {r.clf
                            ? <span className="stage-empty">—</span>
                            : r.stage
                              ? <span className="stage-name">{r.stage}</span>
                              : <span className="stage-na">N/A</span>}
                        </td>
                      </>
                    ) : (
                      <td style={{fontSize:13, color: r.power ? "var(--char)" : "var(--faint)"}}>
                        {r.clf ? <span style={{color:"var(--faint)", fontFamily:"var(--mono)", fontSize:11, letterSpacing:"1px"}}>—</span> : (r.power || <span style={{fontFamily:"var(--mono)", fontSize:11, letterSpacing:"1.2px", textTransform:"uppercase"}}>N/A</span>)}
                      </td>
                    )}
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOME — landing page with the Vanguard hero, lore reveal, and a leaked
   dorm-policy memo. First tab in the nav; this is what visitors hit at
   calderyncollege.uk before deciding to dig deeper.
═══════════════════════════════════════════════════════════════════════════ */

// useInView — IntersectionObserver hook. Returns [ref, inView]. Toggles
// true the first time the element crosses ~25% into the viewport and
// stays true (no re-trigger on scroll back). Used to drive the
// scroll-reveal CSS class on sections below the hero.
function useInView(threshold = 0.25){
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ──────────────────────────────────────────────────────────────────────
   Weather — open-meteo (free, no key, CORS-enabled) for Greenwich,
   London. Refreshes every 15 minutes. Returns null on failure so the
   UI falls back to a graceful "—".
   ──────────────────────────────────────────────────────────────────── */
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast"
  + "?latitude=51.4825&longitude=0.0076"
  + "&current=temperature_2m,weather_code,wind_speed_10m"
  + "&timezone=GMT";

// WMO weather-code → { icon, label } mapping. Matches the Lucide
// weather icons added to ICON_PATHS above. Default falls through
// to "cloud" / "Conditions unknown".
const WEATHER_BY_CODE = {
  0:  { icon: "sun",             label: "Clear" },
  1:  { icon: "cloud-sun",       label: "Mostly clear" },
  2:  { icon: "cloud-sun",       label: "Partly cloudy" },
  3:  { icon: "cloud",           label: "Overcast" },
  45: { icon: "cloud-fog",       label: "Fog" },
  48: { icon: "cloud-fog",       label: "Freezing fog" },
  51: { icon: "cloud-drizzle",   label: "Light drizzle" },
  53: { icon: "cloud-drizzle",   label: "Drizzle" },
  55: { icon: "cloud-drizzle",   label: "Heavy drizzle" },
  56: { icon: "cloud-drizzle",   label: "Freezing drizzle" },
  57: { icon: "cloud-drizzle",   label: "Freezing drizzle" },
  61: { icon: "cloud-rain",      label: "Light rain" },
  63: { icon: "cloud-rain",      label: "Rain" },
  65: { icon: "cloud-rain",      label: "Heavy rain" },
  66: { icon: "cloud-rain",      label: "Freezing rain" },
  67: { icon: "cloud-rain",      label: "Freezing rain" },
  71: { icon: "cloud-snow",      label: "Light snow" },
  73: { icon: "cloud-snow",      label: "Snow" },
  75: { icon: "cloud-snow",      label: "Heavy snow" },
  77: { icon: "cloud-snow",      label: "Snow grains" },
  80: { icon: "cloud-rain",      label: "Rain showers" },
  81: { icon: "cloud-rain",      label: "Rain showers" },
  82: { icon: "cloud-rain",      label: "Violent rain" },
  85: { icon: "cloud-snow",      label: "Snow showers" },
  86: { icon: "cloud-snow",      label: "Snow showers" },
  95: { icon: "cloud-lightning", label: "Thunderstorm" },
  96: { icon: "cloud-lightning", label: "Thunderstorm" },
  99: { icon: "cloud-lightning", label: "Storm w/ hail" },
};

function useWeather(){
  const [w, setW] = useState(null);
  useEffect(() => {
    let cancelled = false;
    async function fetchNow(){
      try {
        const res = await fetch(WEATHER_URL);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled || !data || !data.current) return;
        const c = data.current;
        setW({
          temp:  Math.round(c.temperature_2m),
          wind:  Math.round(c.wind_speed_10m),
          code:  c.weather_code,
          meta:  WEATHER_BY_CODE[c.weather_code] || { icon: "cloud", label: "Conditions unknown" },
          when:  Date.now(),
        });
      } catch { /* network/CORS error — leave null, UI shows fallback */ }
    }
    fetchNow();
    const id = setInterval(fetchNow, 15 * 60 * 1000); // refresh every 15 min
    return () => { cancelled = true; clearInterval(id); };
  }, []);
  return w;
}

function HomeTab({setTab}){
  return (
    <div className="home-page">
      <HomeScrollNav/>
      <HomeHero setTab={setTab}/>
      <HomeVillainNotice/>
      <HomeVanguard/>
      <HomeToday/>
      <HomePowerball setTab={setTab}/>
      <HomeProgramme/>
      <HomeDormNotice/>
      <HomeCTA setTab={setTab}/>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   HOME · CALDERYN TODAY
   Status bar (date / location / weather) + by-the-numbers stats grid
   + upcoming events list. Roots the school in the UK setting; reads
   like the masthead of a college admissions page.
   ──────────────────────────────────────────────────────────────────── */
function HomeToday(){
  const [ref, inView] = useInView(0.15);
  const weather = useWeather();
  // Live "now" — re-evaluates per render so the date stays current.
  const today = new Date();
  const fmtDate = today.toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  const stats = [
    { num: "3%",      label: "Acceptance",      sub: "of 14,200 applicants this cycle" },
    { num: "£45K",    label: "Annual tuition",  sub: "STRATA-subsidised after Y1" },
    { num: "412",     label: "Active students", sub: "across four houses" },
    { num: "1965",    label: "Founded",         sub: "Greenwich, defence-funded" },
  ];

  return (
    <section id="home-today" ref={ref} className={"home-section home-today " + (inView ? "is-in" : "")}>
      <div className="home-section-head">
        <div className="home-section-stamp">DOSSIER · 02 · BY THE NUMBERS</div>
        <h2 className="home-section-title">CALDERYN <span className="home-section-title-accent">TODAY</span></h2>
        <p className="home-section-lede">
          A snapshot of the school as it stood at last roll-call. Selective by
          design, quietly subsidised, and rarely far from the news cycle.
        </p>
      </div>

      {/* Status strip — UK setting indicators. Date refreshes per
          render. Weather pulled live from open-meteo (Greenwich) and
          refreshed every 15 min via useWeather. */}
      <div className="home-today-status">
        <div className="home-today-status-cell">
          <div className="home-today-status-lbl">Date · London</div>
          <div className="home-today-status-val">{fmtDate}</div>
        </div>
        <div className="home-today-status-cell home-today-status-weather">
          <div className="home-today-status-lbl">Greenwich · SE10 · Live</div>
          <div className="home-today-status-val">
            {weather ? (
              <>
                <span className="home-today-weather-icon" aria-hidden="true">
                  <Icon name={weather.meta.icon} size={20}/>
                </span>
                <span className="home-today-weather-temp">{weather.temp}°C</span>
                <span className="home-today-weather-sep">·</span>
                <span className="home-today-weather-label">{weather.meta.label}</span>
                <span className="home-today-weather-sep">·</span>
                <span className="home-today-weather-wind">{weather.wind} km/h</span>
              </>
            ) : (
              <span className="home-today-weather-loading">Fetching live conditions…</span>
            )}
          </div>
        </div>
        <div className="home-today-status-cell">
          <div className="home-today-status-lbl">Cycle status</div>
          <div className="home-today-status-val">
            <span className="home-today-pulse" aria-hidden="true"/>
            {(() => {
              // Derived live from the academic calendar — no
              // hardcoded "Term 2 · 2026" string to drift out of date.
              const t = calderynTerm(today);
              if (t.inSession) {
                return `INTAKE OPEN · ${t.name} TERM · WK ${String(t.week).padStart(2, "0")} / ${t.totalWeeks}`;
              }
              return `INTAKE OPEN · ${t.name}${t.nextTerm ? ` · ${t.nextTerm} TERM NEXT` : ""}`;
            })()}
          </div>
        </div>
      </div>

      {/* By the numbers — 4 stat cells */}
      <div className="home-today-numbers">
        {stats.map((s, i) => (
          <div key={i} className="home-today-num-cell">
            <div className="home-today-num">{s.num}</div>
            <div className="home-today-num-label">{s.label}</div>
            <div className="home-today-num-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Campus calendar — live month-view grid keyed off the current
          UTC date. Today's cell highlights. Future cells with scheduled
          events get a marker; empty months show an empty-state line
          beneath the grid so the section reads as "calendar exists,
          nothing on it yet" rather than absent. */}
      <HomeCalendar/>

    </section>
  );
}

// Month-view calendar widget. Renders the current month with today
// highlighted. Scheduled events are passed in via the EVENTS const
// (none yet — admin / Student Body President will populate this as
// term moves on). Each event lives at { date: "YYYY-MM-DD", title,
// tag, link? }.
// Auto-generated term boundary + break events for a given academic
// year (academic year starts in September of `startYear`). Used to
// pin the start/end of each term and the break boundaries on the
// campus calendar so writers can see when school is in session
// without leaving the home page.
function termEventsForYear(startYear){
  const y = startYear;
  const next = startYear + 1;
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (yr, mo, dy) => `${yr}-${pad(mo)}-${pad(dy)}`;
  return [
    { date: iso(y, 9, 1),    title: "Autumn term begins",   tag: "TERM · START",  kind: "term-start",   auto: true },
    { date: iso(y, 12, 19),  title: "Autumn term ends · Christmas break begins", tag: "TERM · END",    kind: "term-end",     auto: true },
    { date: iso(next, 1, 6), title: "Spring term begins",   tag: "TERM · START",  kind: "term-start",   auto: true },
    { date: iso(next, 4, 9), title: "Spring term ends · Easter break begins",    tag: "TERM · END",    kind: "term-end",     auto: true },
    { date: iso(next, 4, 18),title: "Summer term begins",   tag: "TERM · START",  kind: "term-start",   auto: true },
    { date: iso(next, 6, 30),title: "Summer term ends · Summer break begins",    tag: "TERM · END",    kind: "term-end",     auto: true },
  ];
}

// Range of academic years to surface term events for — covers the
// last full year + the next few so the calendar's navigation can
// roam back to January and forward without losing context.
const TERM_BOUNDARY_EVENTS = (() => {
  const years = [2024, 2025, 2026, 2027];
  const out = [];
  for (const y of years) out.push(...termEventsForYear(y));
  return out;
})();

// Campus events. Each entry's `start` is an ISO UTC timestamp — the
// canonical source of truth — and the calendar renders it in the
// viewer's local timezone via toLocaleString. `date` (YYYY-MM-DD)
// keys the grid marker. Add { date, start, title, tag, host?,
// hostLink?, location?, link? } entries to publish a new event.
const HOME_USER_EVENTS = [
  {
    date:  "2026-06-14",
    // 12:00 noon US Eastern, Sunday June 14 2026. June is in DST so
    // Eastern resolves to UTC-4 (EDT) on that date → 16:00 UTC.
    start: "2026-06-14T16:00:00Z",
    title: "Great Ormond Street Hospital · ward visit",
    tag:   "OUTREACH · POWERBALL + CHEER",
    host:  "Celestia \"Stella\" Starkov",
    hostLink: "https://roleplay.chat/profile.php?user=illuminate",
    location: "Great Ormond Street Hospital · London WC1N",
    desc: "Stella leads a Sunday delegation to GOSH's powered-paediatric ward. Members of the Powerball squads and the Cheer team are riding along — signatures, photos, and a short cheer routine in the atrium for the kids who can't come down. Campus shuttle leaves the West Gate at 09:00 local time.",
  },
];

// Combined event source for the calendar — user-published events
// plus the auto-generated term boundaries (so term starts/ends and
// break boundaries show up as markers in the grid).
const HOME_EVENTS = [...HOME_USER_EVENTS, ...TERM_BOUNDARY_EVENTS];

// Is the given Date inside an out-of-term break? Mirrors the term
// windows from calderynTerm — Sep 1 → Dec 19 (autumn), Jan 6 → Apr 9
// (spring), Apr 18 → Jun 30 (summer). Any date outside those is a
// break. Used to tint break cells in the calendar grid.
function isInBreak(year, month, day){
  const t = Date.UTC(year, month, day);
  // Walk through every academic year that could contain this date.
  const yrs = [year - 1, year];
  for (const startY of yrs) {
    const next = startY + 1;
    const inAutumn = t >= Date.UTC(startY, 8, 1)  && t <= Date.UTC(startY, 11, 19);
    const inSpring = t >= Date.UTC(next, 0, 6)    && t <= Date.UTC(next, 3, 9);
    const inSummer = t >= Date.UTC(next, 3, 18)   && t <= Date.UTC(next, 5, 30);
    if (inAutumn || inSpring || inSummer) return false;
  }
  return true;
}

// Which kind of break is this date in? Used for cell labelling.
// Returns "christmas" | "easter" | "summer" | null.
function breakKindFor(year, month, day){
  const t = Date.UTC(year, month, day);
  // Christmas window: Dec 20 → Jan 5 (crosses year boundary).
  if (t >= Date.UTC(year, 11, 20) || t <= Date.UTC(year, 0, 5)) return "christmas";
  // Easter window: Apr 10 → Apr 17.
  if (t >= Date.UTC(year, 3, 10) && t <= Date.UTC(year, 3, 17)) return "easter";
  // Summer window: Jul 1 → Aug 31.
  if (t >= Date.UTC(year, 6, 1) && t <= Date.UTC(year, 7, 31)) return "summer";
  return null;
}

// Format an event's start time for the viewer's local timezone.
// "Sun, 14 Jun · 12:00 PM EDT" / "Sun, 14 Jun · 5:00 PM BST" depending
// on where the viewer is. Falls back to the raw date if start is
// missing or unparseable.
function formatEventTime(ev, opts = {}){
  if (!ev) return "";
  if (!ev.start) {
    try {
      const d = new Date(ev.date + "T12:00:00Z");
      return d.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });
    } catch { return ev.date || ""; }
  }
  try {
    const d = new Date(ev.start);
    return d.toLocaleString(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "short",
      ...(opts.includeYear ? { year: "numeric" } : {}),
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch { return ev.date || ""; }
}

function HomeCalendar(){
  const months = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
  const dows = ["MON","TUE","WED","THU","FRI","SAT","SUN"];

  // Anchor on wall-clock today for the "is this cell today?" check.
  const now = new Date();
  const todayY = now.getUTCFullYear();
  const todayM = now.getUTCMonth();
  const todayD = now.getUTCDate();

  // Viewed month — starts on today's month, advances via prev/next.
  const [viewYear, setViewYear] = useState(todayY);
  const [viewMonth, setViewMonth] = useState(todayM);

  // Calendar navigation bounds: can roam back to Jan 2026 (start of
  // the publication year) and forward 18 months past today so writers
  // can plan for next term + the term after, without an unbounded
  // back-button that goes nowhere useful.
  const MIN_YEAR = 2026;
  const MIN_MONTH = 0;
  const maxDate = new Date(Date.UTC(todayY, todayM + 18, 1));
  const MAX_YEAR = maxDate.getUTCFullYear();
  const MAX_MONTH = maxDate.getUTCMonth();
  const canGoPrev = viewYear > MIN_YEAR || (viewYear === MIN_YEAR && viewMonth > MIN_MONTH);
  const canGoNext = viewYear < MAX_YEAR || (viewYear === MAX_YEAR && viewMonth < MAX_MONTH);

  const goPrev = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goNext = () => {
    if (!canGoNext) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const goToday = () => { setViewYear(todayY); setViewMonth(todayM); };
  const isViewingThisMonth = (viewYear === todayY && viewMonth === todayM);

  // First day of the viewed month (Mon=0..Sun=6 — UK convention).
  const firstDow = (() => {
    const d = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay(); // 0=Sun
    return (d + 6) % 7; // shift so Monday is 0
  })();
  const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();

  // Build the cells.
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // Index events by day-of-month for the viewed month.
  const eventsByDay = useMemo(() => {
    const map = {};
    for (const ev of HOME_EVENTS) {
      try {
        const d = new Date(ev.date + "T12:00:00Z");
        if (d.getUTCFullYear() === viewYear && d.getUTCMonth() === viewMonth) {
          const day = d.getUTCDate();
          if (!map[day]) map[day] = [];
          map[day].push(ev);
        }
      } catch {}
    }
    return map;
  }, [viewYear, viewMonth]);

  // Sorted list of this month's events (for the listing below the grid).
  const monthEvents = useMemo(() => {
    const all = [];
    for (const day in eventsByDay) {
      for (const ev of eventsByDay[day]) all.push({ day: parseInt(day, 10), ...ev });
    }
    return all.sort((a, b) => a.day - b.day);
  }, [eventsByDay]);

  // Upcoming events — limited to today + the remainder of this month
  // + the entire next calendar month. So in late May the list shows
  // through end of June, then on June 1 it extends through end of
  // July, etc. Prevents the rollup from trailing off into term
  // boundaries many months away.
  const upcoming = useMemo(() => {
    const ms = Date.now();
    const horizon = Date.UTC(todayY, todayM + 2, 1); // first day of month-after-next
    return HOME_EVENTS
      .map(ev => {
        const t = ev.start ? Date.parse(ev.start) : Date.parse(ev.date + "T12:00:00Z");
        return { ...ev, _t: t };
      })
      .filter(ev => Number.isFinite(ev._t) && ev._t >= ms - (1000 * 60 * 60 * 24) && ev._t < horizon)
      .sort((a, b) => a._t - b._t)
      .slice(0, 5);
  }, [todayY, todayM]);

  return (
    <div className="home-today-events">
      <header className="home-today-events-head">
        <div className="home-today-events-tag">CAMPUS CALENDAR</div>
        <h3 className="home-today-events-title">Scheduled events</h3>
      </header>

      {/* Month navigation strip */}
      <div className="cal-nav" role="group" aria-label="Calendar month navigation">
        <button
          type="button"
          className="cal-nav-btn"
          onClick={goPrev}
          disabled={!canGoPrev}
          aria-label="Previous month"
        >
          <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
        </button>
        <div className="cal-nav-title">
          <span className="cal-nav-month">{months[viewMonth]}</span>
          <span className="cal-nav-year">{viewYear}</span>
        </div>
        <div className="cal-nav-right">
          {!isViewingThisMonth && (
            <button
              type="button"
              className="cal-nav-today"
              onClick={goToday}
            >
              Today
            </button>
          )}
          <button
            type="button"
            className="cal-nav-btn"
            onClick={goNext}
            disabled={!canGoNext}
            aria-label="Next month"
          >
            <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div className="cal">
        <div className="cal-dow-row" role="row">
          {dows.map(d => <div key={d} className="cal-dow" role="columnheader">{d}</div>)}
        </div>
        <div className="cal-grid">
          {cells.map((d, i) => {
            if (d === null) return <div key={"e" + i} className="cal-cell is-blank"/>;
            const isToday = (d === todayD && viewMonth === todayM && viewYear === todayY);
            const events = eventsByDay[d];
            const hasEvents = !!(events && events.length);
            const inBreak = isInBreak(viewYear, viewMonth, d);
            const brk = inBreak ? breakKindFor(viewYear, viewMonth, d) : null;
            // If any of this cell's events is a term boundary (auto),
            // mark the cell so the marker styling pops.
            const hasTermBoundary = hasEvents && events.some(ev => ev.kind === "term-start" || ev.kind === "term-end");
            const cls =
              "cal-cell"
              + (isToday ? " is-today" : "")
              + (hasEvents ? " has-events" : "")
              + (inBreak ? " is-break" : " is-term")
              + (brk ? " is-break-" + brk : "")
              + (hasTermBoundary ? " has-term-boundary" : "");
            return (
              <div
                key={d}
                className={cls}
                role="gridcell"
                aria-label={
                  `${d} ${months[viewMonth]} ${viewYear}`
                  + (hasEvents ? `, ${events.length} event${events.length > 1 ? "s" : ""}` : "")
                  + (isToday ? ", today" : "")
                  + (inBreak ? `, ${brk || "school"} break` : ", term in session")
                }
              >
                <div className="cal-cell-head">
                  <span className="cal-cell-num">{d}</span>
                  {isToday && <span className="cal-cell-today-dot" aria-hidden="true"/>}
                </div>
                {hasEvents && (
                  <div className="cal-cell-events" aria-hidden="true">
                    {events.slice(0, 2).map((ev, j) => {
                      const isBoundary = ev.kind === "term-start" || ev.kind === "term-end";
                      // Compact label for the cell — full title would
                      // never fit. Sentence-case, short noun phrase,
                      // no aggressive truncation since the chip text
                      // is readable now.
                      const label = (() => {
                        if (isBoundary) {
                          if (ev.kind === "term-start") return ev.title.replace(/ term begins.*/i, " starts");
                          return ev.title.replace(/ term ends.*/i, " ends");
                        }
                        // User events — first noun phrase up to ~24
                        // chars, kept in sentence case.
                        const t = (ev.title || "").split(/[·:]/)[0].trim();
                        return t.length > 24 ? t.slice(0, 23).trim() + "…" : t;
                      })();
                      return (
                        <span
                          key={j}
                          className={"cal-event-chip" + (isBoundary ? " is-boundary" : " is-user")}
                          title={ev.title}
                        >
                          {label}
                        </span>
                      );
                    })}
                    {events.length > 2 && (
                      <span className="cal-event-chip is-more">
                        +{events.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend strip — explains the break tint + term-boundary
            marker so the visual treatment isn't a mystery. */}
        <div className="cal-legend" aria-hidden="true">
          <span className="cal-legend-item">
            <span className="cal-legend-sw is-term"/>In session
          </span>
          <span className="cal-legend-item">
            <span className="cal-legend-sw is-break"/>On break
          </span>
          <span className="cal-legend-item">
            <span className="cal-legend-sw is-today"/>Today
          </span>
          <span className="cal-legend-item">
            <span className="cal-legend-dot is-term-marker"/>Term boundary
          </span>
          <span className="cal-legend-item">
            <span className="cal-legend-dot"/>Event
          </span>
        </div>
      </div>

      {/* Events in the viewed month */}
      {monthEvents.length > 0 ? (
        <ul className="cal-list">
          {monthEvents.map((ev, i) => <CalEventRow key={i} ev={ev} month={months[viewMonth]}/>)}
        </ul>
      ) : (
        <div className="cal-empty">
          <i className="fa-regular fa-calendar cal-empty-icon" aria-hidden="true"></i>
          <div className="cal-empty-body">
            <div className="cal-empty-title">Nothing on the calendar yet for {months[viewMonth]} {viewYear}.</div>
            <div className="cal-empty-sub">
              When admin or the Student Body President posts something — practicals,
              Vanguard appearances, inter-house matches, Powerball fixtures — it
              appears here.
            </div>
          </div>
        </div>
      )}

      {/* Upcoming events from any future month — so writers see what's
          coming even when they're viewing a month with no events. */}
      {upcoming.length > 0 && (
        <div className="cal-upcoming">
          <header className="cal-upcoming-head">
            <span className="cal-upcoming-tag">
              <i className="fa-solid fa-arrow-trend-up" aria-hidden="true"></i> UPCOMING
            </span>
            <span className="cal-upcoming-sub">Times shown in your local timezone.</span>
          </header>
          <ul className="cal-upcoming-list">
            {upcoming.map((ev, i) => <CalEventRow key={i} ev={ev} upcoming/>)}
          </ul>
        </div>
      )}
    </div>
  );
}

// Single event row — used in the month listing AND the upcoming
// rollup. Renders the date tile, tag, title, host link, location,
// and the time in the viewer's local timezone.
function CalEventRow({ ev, month, upcoming }){
  const monthsShort = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  // Figure out the day + month label for the tile.
  let tileDay = ev.day;
  let tileMon = month ? month.slice(0, 3) : "";
  if (!tileDay) {
    try {
      const d = new Date((ev.start || ev.date + "T12:00:00Z"));
      tileDay = d.getUTCDate();
      tileMon = monthsShort[d.getUTCMonth()];
    } catch {}
  }
  const localTime = formatEventTime(ev, { includeYear: !!upcoming });
  return (
    <li className={"cal-list-item" + (upcoming ? " is-upcoming-row" : "")}>
      <div className="cal-list-date">
        <div className="cal-list-day">{String(tileDay).padStart(2, "0")}</div>
        <div className="cal-list-mon">{tileMon}</div>
      </div>
      <div className="cal-list-body">
        {ev.tag && <div className="cal-list-tag">{ev.tag}</div>}
        <div className="cal-list-title">
          {ev.link ? (
            <a href={ev.link} target="_blank" rel="noopener noreferrer">
              {ev.title}
              <i className="fa-solid fa-arrow-up-right-from-square cal-list-icon" aria-hidden="true"></i>
            </a>
          ) : ev.title}
        </div>
        <div className="cal-list-meta">
          <span className="cal-list-time">
            <i className="fa-regular fa-clock cal-list-meta-icon" aria-hidden="true"></i>
            {localTime}
          </span>
          {ev.location && (
            <span className="cal-list-loc">
              <i className="fa-solid fa-location-dot cal-list-meta-icon" aria-hidden="true"></i>
              {ev.location}
            </span>
          )}
          {ev.host && (
            <span className="cal-list-host">
              <i className="fa-regular fa-user cal-list-meta-icon" aria-hidden="true"></i>
              Hosted by{" "}
              {ev.hostLink ? (
                <a href={ev.hostLink} target="_blank" rel="noopener noreferrer">
                  {ev.host}
                  <i className="fa-solid fa-arrow-up-right-from-square cal-list-icon" aria-hidden="true"></i>
                </a>
              ) : ev.host}
            </span>
          )}
        </div>
        {ev.desc && <p className="cal-list-desc">{ev.desc}</p>}
      </div>
    </li>
  );
}

// Standalone home-page section: Powerball Cup season status. Lives
// at the top level of the home page so the side-rail can scroll
// here. Editorial-comic layout — no nested cards; content flows
// freely between section breaks (red stripe + tag + label) that
// match the rest of the home page's typographic chrome.
function HomePowerball({setTab}){
  const [ref, inView] = useInView(0.15);
  const powerball = useMemo(() => (D.clubs || []).find(c => c && c.name === "Powerball"), []);
  if (!powerball || !powerball.schedule) return null;
  const sch = powerball.schedule;
  const standings = useMemo(() => computeStandings(sch), [sch]);
  const upcoming = nextGame(sch);
  const recent = lastGame(sch);
  const leader = standings[0];
  const pastGames = (sch.games || []).filter(g => g.status === "played").reverse();

  return (
    <section id="home-powerball" ref={ref} className={"home-section home-powerball " + (inView ? "is-in" : "")}>
      <div className="home-section-head">
        <div className="home-section-stamp">DOSSIER · 03 · INTER-HOUSE LEAGUE</div>
        <h2 className="home-section-title">POWERBALL <span className="home-section-title-accent">CUP</span></h2>
        <p className="home-section-lede">
          Calderyn's marquee sport — six-game round-robin between the four houses,
          capped by the cup final. Current season <strong>{sch.season}</strong>.
          {leader && leader.gp > 0 && (
            <> Current leader <strong style={{color: houseColor(leader.id)}}>{houseName(leader.id)}</strong>.</>
          )}
        </p>
      </div>

      {/* ── HERO · the next match, full-bleed comic spread ────────── */}
      {upcoming && <PowerballHero game={upcoming} standings={standings} schedule={sch}/>}

      {/* ── THE TABLE ─────────────────────────────────────────────── */}
      <PowerballBreak
        n="01"
        tag="STANDINGS"
        title="The Table"
        sub="3 pts for a win · 1 for a draw · 0 for a loss"
      />
      <LeagueTable schedule={sch}/>

      {/* ── LATEST RESULT ─────────────────────────────────────────── */}
      {recent && (
        <>
          <PowerballBreak
            n="02"
            tag="LAST OUT"
            title="Latest Result"
            sub={(() => {
              try {
                const d = new Date(recent.date + "T12:00:00Z");
                const days = Math.round((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
                return days <= 0 ? "Earlier today" : days + " days ago";
              } catch { return ""; }
            })()}
          />
          <PowerballGameCard game={recent} highlight/>
        </>
      )}

      {/* ── SEASON ARCHIVE ────────────────────────────────────────── */}
      {pastGames.length > 0 && (
        <>
          <PowerballBreak
            n="03"
            tag={`${pastGames.length} PLAYED · ${sch.games.length - pastGames.length} LEFT`}
            title="Season So Far"
            sub="Every result on the table, newest first"
          />
          <ol className="pb-archive">
            {pastGames.map(g => (
              <li key={g.id}><PowerballGameCard game={g}/></li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}

// Comic-editorial section divider. Red angled stripe, eyebrow tag
// in mono caps, big Druk title, optional sub line. Used between
// the Powerball section's beats so the page reads like a magazine
// spread instead of a stack of cards.
function PowerballBreak({ n, tag, title, sub }){
  return (
    <div className="pb-break" role="separator">
      <div className="pb-break-stripe" aria-hidden="true"/>
      <div className="pb-break-body">
        <div className="pb-break-row">
          {n && <span className="pb-break-n">{n}</span>}
          <span className="pb-break-tag">{tag}</span>
        </div>
        <h3 className="pb-break-title">{title}</h3>
        {sub && <div className="pb-break-sub">{sub}</div>}
      </div>
    </div>
  );
}

// Compute the last N played games for a given house, returning a
// W/D/L tag per game so the hero can render a recent-form streak.
function recentForm(schedule, houseId, n = 3){
  if (!schedule || !Array.isArray(schedule.games)) return [];
  const out = [];
  for (const g of schedule.games) {
    if (g.status !== "played") continue;
    if (g.home !== houseId && g.away !== houseId) continue;
    const isHome = g.home === houseId;
    const ours = isHome ? g.home_score : g.away_score;
    const theirs = isHome ? g.away_score : g.home_score;
    let r = "D";
    if (ours > theirs) r = "W";
    else if (ours < theirs) r = "L";
    out.push({ id: g.id, r, ours, theirs });
  }
  return out.slice(-n);
}

// Hero block for the next match. Two-tone diagonal split using the
// home and away house colours, massive Druk team names with rank
// chips + recent-form streaks, a centred VS treatment with
// date/time and venue, and the season note beneath. Cup finals
// get a TITLE DECIDER badge and an animated action-line accent
// behind the VS.
function PowerballHero({ game, standings, schedule }){
  const homeStand = standings.find(s => s.id === game.home);
  const awayStand = standings.find(s => s.id === game.away);
  const homeColor = houseColor(game.home);
  const awayColor = houseColor(game.away);
  const homeRank = standings.findIndex(s => s.id === game.home) + 1;
  const awayRank = standings.findIndex(s => s.id === game.away) + 1;
  const homeForm = useMemo(() => recentForm(schedule, game.home), [schedule, game.home]);
  const awayForm = useMemo(() => recentForm(schedule, game.away), [schedule, game.away]);
  const isFinal = /CUP FINAL/i.test(game.venue || "");

  const fmtDate = (() => {
    try {
      const d = new Date(game.date + "T12:00:00Z");
      const day = String(d.getUTCDate()).padStart(2, "0");
      const mons = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
      const dows = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
      return { full: day + " " + mons[d.getUTCMonth()] + " " + d.getUTCFullYear(), dow: dows[d.getUTCDay()] };
    } catch { return { full: game.date, dow: "" }; }
  })();

  const ordSuffix = (n) => {
    const v = n % 100;
    if (v >= 11 && v <= 13) return "TH";
    switch (n % 10) { case 1: return "ST"; case 2: return "ND"; case 3: return "RD"; default: return "TH"; }
  };

  const renderForm = (form, side) => (
    <div className={"pb-hero-form pb-hero-form-" + side} aria-label="Recent form">
      <span className="pb-hero-form-lbl">FORM</span>
      <div className="pb-hero-form-row">
        {form.length === 0 && <span className="pb-hero-form-empty">—</span>}
        {form.map((f, i) => (
          <span
            key={f.id}
            className={"pb-hero-form-pip is-" + f.r.toLowerCase()}
            title={`${f.r} · ${f.ours}-${f.theirs}`}
          >
            {f.r}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={"pb-hero" + (isFinal ? " is-final" : "")}
      style={{
        "--pb-hero-home": homeColor,
        "--pb-hero-away": awayColor,
      }}
    >
      <div className="pb-hero-bg" aria-hidden="true">
        <div className="pb-hero-bg-home"/>
        <div className="pb-hero-bg-away"/>
        <div className="pb-hero-bg-halftone"/>
        <div className="pb-hero-bg-grain"/>
        <div className="pb-hero-bg-slash"/>
      </div>

      <div className="pb-hero-corner pb-hero-corner-tl" aria-hidden="true">№ {String(game.id).padStart(2, "0")}</div>
      <div className="pb-hero-corner pb-hero-corner-tr" aria-hidden="true">
        <span className="pb-hero-corner-pulse"/>
        {isFinal ? "TITLE DECIDER" : "UPCOMING"}
      </div>

      <div className="pb-hero-eyebrow">
        {isFinal ? "Cup Final · 2025-26" : "Next Match"}
      </div>

      <div className="pb-hero-matchup">
        <div className="pb-hero-side pb-hero-side-home">
          <HouseCrest id={game.home} size={96} className="pb-hero-side-crest"/>
          <div className="pb-hero-side-head">
            <span className="pb-hero-side-tag">HOME</span>
            {homeRank > 0 && (
              <span className="pb-hero-side-rank">
                <span className="pb-hero-side-rank-n">{homeRank}</span>
                <span className="pb-hero-side-rank-ord">{ordSuffix(homeRank)}</span>
              </span>
            )}
          </div>
          <div className="pb-hero-side-name">{houseName(game.home)}</div>
          <div className="pb-hero-side-record">{homeStand ? `${homeStand.w}-${homeStand.d}-${homeStand.l} · ${homeStand.pts} pts` : "—"}</div>
          {renderForm(homeForm, "home")}
        </div>

        <div className="pb-hero-center">
          <div className="pb-hero-center-actionlines" aria-hidden="true"/>
          <div className="pb-hero-center-date">
            <span className="pb-hero-center-dow">{fmtDate.dow}</span>
            <span className="pb-hero-center-full">{fmtDate.full}</span>
          </div>
          <div className="pb-hero-center-vs" aria-hidden="true">
            <span className="pb-hero-center-vs-shadow">VS</span>
            <span className="pb-hero-center-vs-fg">VS</span>
          </div>
          <div className="pb-hero-center-time">{game.time || ""}</div>
        </div>

        <div className="pb-hero-side pb-hero-side-away">
          <HouseCrest id={game.away} size={96} className="pb-hero-side-crest"/>
          <div className="pb-hero-side-head pb-hero-side-head-away">
            {awayRank > 0 && (
              <span className="pb-hero-side-rank">
                <span className="pb-hero-side-rank-n">{awayRank}</span>
                <span className="pb-hero-side-rank-ord">{ordSuffix(awayRank)}</span>
              </span>
            )}
            <span className="pb-hero-side-tag">AWAY</span>
          </div>
          <div className="pb-hero-side-name">{houseName(game.away)}</div>
          <div className="pb-hero-side-record">{awayStand ? `${awayStand.w}-${awayStand.d}-${awayStand.l} · ${awayStand.pts} pts` : "—"}</div>
          {renderForm(awayForm, "away")}
        </div>
      </div>

      <div className="pb-hero-footer">
        {game.venue && <div className="pb-hero-venue">{game.venue}</div>}
        {game.note && <p className="pb-hero-note">{game.note}</p>}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   HOME · SIDE SCROLL NAV
   Vertical sticky dot-rail anchored to the right side of the viewport.
   Each dot maps to a home section; click smooth-scrolls to that
   section; IntersectionObserver updates the active dot as the writer
   scrolls.
   ──────────────────────────────────────────────────────────────────── */
const HOME_SECTIONS = [
  { id: "home-hero",     label: "Hero",      icon: "flag" },
  { id: "home-vanguard", label: "Vanguard",  icon: "shield" },
  { id: "home-today",    label: "Today",     icon: "sun" },
  { id: "home-powerball",label: "Powerball", icon: "trophy" },
  { id: "home-programme",label: "Programme", icon: "book-open" },
  { id: "home-dorm",     label: "Dorms",     icon: "map" },
  { id: "home-cta",      label: "Apply",     icon: "sparkles" },
];

function HomeScrollNav(){
  const [active, setActive] = useState(HOME_SECTIONS[0].id);
  useEffect(() => {
    const els = HOME_SECTIONS
      .map(s => document.getElementById(s.id))
      .filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter(e => e.isIntersecting);
      if (!vis.length) return;
      const top = vis.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      setActive(top.target.id);
    }, { rootMargin: "-30% 0px -30% 0px", threshold: 0 });
    els.forEach(el => io.observe(el));

    // Edge case: the last section (CTA) often can't reach the
    // observer's active band because there's no scroll-room below
    // it. Watch for near-bottom scroll and force-set the last
    // section as active in that state.
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY
        >= document.documentElement.scrollHeight - 80;
      if (nearBottom) setActive(HOME_SECTIONS[HOME_SECTIONS.length - 1].id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const goTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  return (
    <nav className="home-scrollnav" aria-label="Home page sections">
      <ol className="home-scrollnav-list">
        {HOME_SECTIONS.map((s, i) => (
          <li key={s.id} className={"home-scrollnav-item" + (active === s.id ? " is-active" : "")}>
            <button
              type="button"
              className="home-scrollnav-btn"
              onClick={() => goTo(s.id)}
              aria-current={active === s.id ? "true" : undefined}
              aria-label={`Jump to ${s.label}`}
              data-label={s.label}
            >
              <span className="home-scrollnav-icon" aria-hidden="true">
                <Icon name={s.icon} size={18} stroke={1.8}/>
              </span>
              <span className="home-scrollnav-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <span className="home-scrollnav-label">{s.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function HomeHero({setTab}){
  // Title words split into individual spans so each gets its own
  // animation-delay — produces the cinematic word-by-word reveal.
  const lines = [
    ["Born", "powered."],
    ["Built", "dangerous."],
    ["Class", "is", "in", "session."],
  ];
  let i = 0;
  return (
    <section id="home-hero" className="home-hero">
      {/* Inline SVG filter defs — ink-bleed warps the focal type's
          edges via a subtle displacement map. Inlined here so we don't
          rely on an external SVG file. Hidden visually but present in
          the DOM so the CSS filter: url(#...) reference resolves. */}
      <svg className="home-hero-svg-defs" aria-hidden="true" focusable="false" width="0" height="0">
        <defs>
          <filter id="hero-ink-bleed" x="-2%" y="-2%" width="104%" height="104%">
            <feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="2" seed="3"/>
            <feDisplacementMap in="SourceGraphic" scale="1.6"/>
          </filter>
        </defs>
      </svg>

      <div className="home-hero-bg" aria-hidden="true">
        <div className="home-hero-emberfield"/>
        <div className="home-hero-halftone"/>
        <div className="home-hero-grain"/>
        <div className="home-hero-spotlight"/>
        <div className="home-hero-vignette"/>
      </div>

      <div className="home-hero-inner">
        {/* Comic-panel frame — four corner brackets that don't fully
            close, gives the editorial / handcrafted feel without
            visually fencing in the content. Pure pseudo-elements via
            CSS — see polish.css. */}
        <div className="home-hero-frame" aria-hidden="true"/>

        <div className="home-hero-content">
          <div className="home-hero-stamp">
            <span className="home-hero-stamp-dot" aria-hidden="true"/>
            INTAKE OPEN · 2026 · CALDERYN COLLEGE
          </div>
          <h1 className="home-hero-title">
            {lines.map((words, li) => (
              <span key={li} className={"home-hero-line home-hero-line-" + (li + 1)}>
                {words.map((w, wi) => {
                  const delay = 0.4 + (i++) * 0.18;
                  return (
                    <span key={wi} className="home-hero-word" style={{animationDelay: `${delay}s`}}>
                      {w}{wi < words.length - 1 ? " " : ""}
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>
          <p className="home-hero-sub" style={{animationDelay: "1.9s"}}>
            The United Kingdom's only sanctioned training facility for powered operators.
            Three Cradles. Four houses. One Vanguard. A roster that runs in the front of
            the paper and the back of the morgue, sometimes in the same week.
          </p>
          <div className="home-hero-cta-row" style={{animationDelay: "2.3s"}}>
            <button
              type="button"
              className="home-hero-cta home-hero-cta-primary"
              onClick={() => setTab && setTab("join")}
            >
              <span>Apply to Calderyn</span>
              <Icon name="arrow-right" size={16}/>
            </button>
            <button
              type="button"
              className="home-hero-cta home-hero-cta-ghost"
              onClick={() => setTab && setTab("lore")}
            >
              <span>Read the lore</span>
            </button>
          </div>
        </div>

        <div className="home-hero-scrollhint" aria-hidden="true">SCROLL</div>
      </div>
    </section>
  );
}

function HomeVanguard(){
  const [ref, inView] = useInView(0.15);
  const [hovered, setHovered] = useState(null);
  // Sound-effect text dropped on each panel — comic-book SFX language.
  // Distinct per Vanguard member matching their power vibe.
  const SFX = ["KRRSH", "SHRRK", "WHAM", "BZZZT"];
  return (
    <section id="home-vanguard" ref={ref} className={"home-section home-vg-section " + (inView ? "is-in" : "")}>
      <div className="home-section-head">
        <div className="home-section-stamp">ISSUE · 01 · ACTIVE ROSTER</div>
        <h2 className="home-section-title">THE <span className="home-section-title-accent">VANGUARD</span></h2>
        <p className="home-section-lede">
          Four people stand between this country and the kinds of incidents the news
          decides not to run. Their contracts are classified. Their faces are not.
        </p>
      </div>

      {/* CHAMPION SELECT — 4 equal columns, tall portraits, side-by-side
          cinematic. Each panel is full-bleed portrait with comic
          overlays (SFX, halftone, name plate). Hover dims the others
          and brings the hovered to the foreground. */}
      <div className={"home-vg-cs" + (hovered != null ? " has-focus" : "")}>
        {HOME_VANGUARD.map((v, i) => (
          <article
            key={v.alias}
            className={"home-vg-cs-panel" + (hovered === i ? " is-focus" : "")}
            style={{"--vg-color": v.color, "--vg-i": i}}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* PORTRAIT — full-bleed background, parallax-tilt on hover */}
            <div className="home-vg-cs-img">
              <img src={v.portrait} alt={v.alias} loading="lazy"/>
              <div className="home-vg-cs-halftone" aria-hidden="true"/>
              <div className="home-vg-cs-glow" aria-hidden="true"/>
              <div className="home-vg-cs-scan" aria-hidden="true"/>
            </div>

            {/* SFX — comic SFX text overlaid, always visible */}
            <div className="home-vg-cs-sfx" aria-hidden="true">{SFX[i] || "POW"}!</div>

            {/* ISSUE BADGE — top-left, like a comic-cover stamp */}
            <div className="home-vg-cs-issue" aria-hidden="true">
              ISSUE · {String(i + 1).padStart(2, "0")}
            </div>

            {/* NAME PLATE — cinematic name reveal at bottom, like champion-select */}
            <div className="home-vg-cs-plate">
              <div className="home-vg-cs-tag">{v.tag.replace(/\.$/, "")}</div>
              <h3 className="home-vg-cs-alias">{v.alias}</h3>
              <div className="home-vg-cs-name">{v.name} · {v.age}</div>
              <div className="home-vg-cs-power">{v.power}</div>
              <div className="home-vg-cs-hook">&ldquo;{v.hook}&rdquo;</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function HomeProgramme(){
  const [ref, inView] = useInView(0.2);
  const lines = [
    "Calderyn does not produce heroes.",
    "Heroes are what STRATA calls the ones it kept.",
    "We produce candidates.",
    "What the world does with them after graduation is, mostly, paperwork.",
  ];
  return (
    <section id="home-programme" ref={ref} className={"home-section home-programme " + (inView ? "is-in" : "")}>
      {/* Splash-page treatment — diagonal red slash through the
          background, halftone field, the quote rendered as comic-book
          interior monologue inside a black-bordered caption box. */}
      <div className="home-programme-slash" aria-hidden="true"/>
      <div className="home-programme-halftone" aria-hidden="true"/>
      <div className="home-programme-card">
        <div className="home-programme-stamp">EXCERPT · THE PROGRAMME · CLASSIFIED LEVEL 2</div>
        <blockquote className="home-programme-quote">
          {lines.map((l, i) => (
            <p key={i} className="home-programme-line" style={{transitionDelay: `${0.15 + i * 0.18}s`}}>{l}</p>
          ))}
        </blockquote>
        <div className="home-programme-sig">— Dr. Devika Ravindrakumar, Dean of Calderyn</div>
      </div>
    </section>
  );
}

function HomeDormNotice(){
  const [ref, inView] = useInView(0.25);
  return (
    <section id="home-dorm" ref={ref} className={"home-section home-dorm " + (inView ? "is-in" : "")}>
      {/* Comic-panel treatment — heavy black border, halftone bg field,
          red EYES-ONLY stamp at the corner, mono caps caption strip
          across the top. Replaces the v1 cream letterhead which read
          "70s memo" instead of "leaked transmission". */}
      <div className="home-dorm-panel">
        <div className="home-dorm-halftone" aria-hidden="true"/>
        <div className="home-dorm-eyes-stamp" aria-hidden="true">EYES ONLY</div>
        <div className="home-dorm-caption">
          <span className="home-dorm-caption-doc">DOC · 14 · DORM POLICY</span>
          <span className="home-dorm-caption-sep">/</span>
          <span className="home-dorm-caption-class">CLASSIFIED · INTERNAL · 2026</span>
        </div>
        <h3 className="home-dorm-title">POWER COMPATIBILITY <span>&amp;</span> COHABITATION</h3>
        <div className="home-dorm-body-stack">
          <p className="home-dorm-body">
            The Diagnostic Wing requests, again, that powered students disclose to
            their partners before turning the lights off. Fire-based, explosive, and
            telepathic abilities are not <em>moods.</em> The wards on Valaris and
            Saberis dorms are calibrated for ambient power signatures only —
            anything more energetic should be conducted off-campus.
          </p>
          <p className="home-dorm-body">
            Heat-vision is not foreplay. Telekinesis is not consent. Pheromone
            control is, expressly, never consent. Aegis-tier durability does not
            translate to your partner. Switchboard does not appreciate the WiFi
            requests on Saturday nights.
          </p>
          <p className="home-dorm-body home-dorm-footer">
            The medical wing has stopped issuing burn-treatment kits to Valaris
            dorm without prior request. Please respect their time.
          </p>
        </div>
        <div className="home-dorm-signoff">— Faculty memorandum, second printing, 2026</div>
      </div>
    </section>
  );
}

function HomeCTA({setTab}){
  const [ref, inView] = useInView(0.4);
  return (
    <section id="home-cta" ref={ref} className={"home-section home-cta " + (inView ? "is-in" : "")}>
      <div className="home-cta-stamp"><Icon name="flag" size={12}/> APPLICATIONS OPEN</div>
      <h2 className="home-cta-title">Enter the Registry.</h2>
      <p className="home-cta-sub">
        Read the rules. Read the lore. Then apply. We review in the order we get
        them and we ask harder questions than the brochure implies.
      </p>
      <div className="home-cta-buttons">
        <button className="home-cta-btn primary" onClick={() => setTab && setTab("join")}>
          APPLY TO CALDERYN
        </button>
        <button className="home-cta-btn ghost"   onClick={() => setTab && setTab("lore")}>
          READ THE LORE
        </button>
        <button className="home-cta-btn ghost"   onClick={() => setTab && setTab("rules")}>
          READ THE RULES
        </button>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   RULES
═══════════════════════════════════════════════════════════════════════════ */
function RulesTab(){
  return (
    <div>
      <PageHead
        stamp="DOC · 01 · NON-NEGOTIABLE"
        title={<>Rules &amp; conduct</>}
        body="Read these before you apply. Short. Non-negotiable. If something isn't covered, use common sense — when in doubt, ask admin first."
        pageNum="P. 001 / VIII"
      />
      <div className="rules-grid">
        {D.rules.map((r,i) => (
          <div key={i} className="rule">
            <div className="rule-num">{r.n}</div>
            <div className="rule-body">
              <div className="rule-title">{r.title}</div>
              <div className="rule-text">{r.body}</div>
            </div>
          </div>
        ))}
      </div>

      <section className="about-bay">
        <div className="about-bay-stamp">About This RP</div>
        <p className="about-bay-text">
          Calderyn is an original world drawn from the parts of capes-and-cowls fiction we love, recombined into something new. STRATA, the Vanguard, the houses, the curriculum — all original. Any resemblance to existing characters or storylines is influence, not a port of canon.
        </p>
        <p className="about-bay-text about-bay-text-quiet">
          A fan-made roleplay setting for collaborative storytelling. No infringement of any existing intellectual property is intended.
        </p>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CURRICULUM · Freshman/Sophomore/Junior/Senior · eight-department model
═══════════════════════════════════════════════════════════════════════════ */
const YEAR_KEY  = { FRESHMAN: 0, SOPHOMORE: 1, JUNIOR: 2, SENIOR: 3 };
const YEAR_TABS = [
  { idx: 0, key: "FRESHMAN",  label: "FRESHMAN",  long: "Year One · Freshman"  },
  { idx: 1, key: "SOPHOMORE", label: "SOPHOMORE", long: "Year Two · Sophomore" },
  { idx: 2, key: "JUNIOR",    label: "JUNIOR",    long: "Year Three · Junior"  },
  { idx: 3, key: "SENIOR",    label: "SENIOR",    long: "Year Four · Senior"   },
];

const DESIG_COLORS = { hero: "#c41a1a", sidekick: "#1e40af" };

/* Resolve a department class's faculty using the new staff[] model.
   taughtBy = "HoD" → dept.head. "Prof. 1/2/3" → dept.staff[0..2]. */
function resolveCourseFaculty(dept, cls){
  if (!dept) return null;
  const t = (cls?.taughtBy || "").toLowerCase();
  if (t === "hod" || t.startsWith("head")) return dept.head;
  const m = t.match(/prof\.?\s*([123])/);
  if (m) return (dept.staff || [])[parseInt(m[1], 10) - 1];
  return dept.head;
}

function profLabel(fac){
  if (!fac) return null;
  return fac.char || fac.role || null;
}

/* Gather every class in the curriculum into a single flat array.
   Pulls from departments[].classes + designationModules + sharedCoreExtra.
   Each entry: {code, year, kind, title, desc, designation?, dept?, ...} */
function gatherCurriculumClasses(){
  const out = [];
  DEPARTMENTS.forEach(dept => {
    (dept.classes || []).forEach(cls => {
      const fac = resolveCourseFaculty(dept, cls);
      out.push({
        code: cls.code,
        year: cls.year,
        kind: cls.kind,
        title: cls.title,
        desc: cls.desc,
        taughtBy: cls.taughtBy || null,
        designation: cls.designation || null,
        dept: dept.id,
        deptName: dept.name,
        deptCode: dept.code,
        deptColor: dept.color,
        faculty: fac ? {
          char:  fac.char || null,
          role:  fac.role || (typeof cls.taughtBy === "string" ? cls.taughtBy : null),
          link:  fac.link || null,
          npc:   !!fac.npc,
        } : null,
      });
    });
  });
  (D.designationModules || []).forEach(cls => {
    out.push({
      code: cls.code,
      year: cls.year,
      kind: "designation",
      title: cls.title,
      desc: cls.desc,
      designation: cls.designation,
      dept: null,
      deptName: cls.designation === "hero" ? "Heroes Track" : "Sidekicks Track",
      deptCode: cls.designation === "hero" ? "HRO" : "SDK",
      deptColor: DESIG_COLORS[cls.designation] || "#d4a84a",
      faculty: null,
    });
  });
  (D.sharedCoreExtra || []).forEach(cls => {
    out.push({
      code: cls.code,
      year: cls.year,
      kind: cls.kind || "shared-core",
      title: cls.title,
      desc: cls.desc,
      taughtBy: cls.taughtBy || null,
      designation: null,
      dept: null,
      deptName: "Tutorial System",
      deptCode: "TUT",
      deptColor: "#d4a84a",
      faculty: null,
    });
  });
  return out;
}

/* Single class card · streamlined. Code chip + Druk title up top, short
   desc, single kind tag at the bottom-left, faculty + dept chip on the
   bottom-right. Designation cards get a red/blue accent corner. */
/* Derive a single path tag for a class.
   Returns one of: "hero" | "sidekick" | "both" | "elective".
   • Shared-core modules → both (every student, every designation).
   • Explicitly designated modules → hero / sidekick.
   • Anything else (literacy pools, specialism options) → elective. */
function classPath(cls){
  if (!cls) return "elective";
  if (cls.path) return cls.path; // explicit override on the data object
  if (cls.designation === "hero") return "hero";
  if (cls.designation === "sidekick") return "sidekick";
  if (cls.kind === "shared-core") return "both";
  return "elective";
}

/* Departments that every student takes regardless of designation —
   Combat Training, Media & Arts, History & Doctrine. Everything
   else (Sciences, Engineering, Athletics, Humanities, Politics) is
   an elective pool. Used to label dept blocks on the curriculum
   page and tag individual class cards. */
const REQUIRED_DEPT_IDS = new Set(["combat", "media-arts", "history-doctrine"]);
const isRequiredDept = (deptId) => REQUIRED_DEPT_IDS.has(deptId);

function ClassCard({cls}){
  const fac = cls.faculty;
  const facName = fac?.char || null;
  const facRole = fac?.role || cls.taughtBy || null;
  const facOpen = !facName;
  const accentColor = cls.designation
    ? (DESIG_COLORS[cls.designation] || "#d4a84a")
    : (cls.deptColor || "#d4a84a");

  const kindLabel =
      cls.kind === "shared-core" ? "Shared Core"
    : cls.kind === "designation" ? "Designation"
    : cls.kind === "capstone"    ? "Capstone"
    : "Elective"; // literacy / specialism / required all collapse to Elective

  const path = classPath(cls);
  const pathLabel = path === "hero" ? "Hero Path"
                  : path === "sidekick" ? "Sidekick Path"
                  : path === "both" ? "Both Paths"
                  : "Elective";

  return (
    <article
      className={"curr-class" + (cls.designation ? " is-designation t-" + cls.designation : "") + " path-" + path}
      style={{ "--class-c": accentColor }}
    >
      <header className="curr-class-hd">
        <span className="curr-class-code">{cls.code}</span>
        <span className="curr-class-kind">{kindLabel}</span>
        <span className={"curr-class-path p-" + path}>{pathLabel}</span>
      </header>
      <h5 className="curr-class-title">{cls.title}</h5>
      {cls.desc && <p className="curr-class-desc">{cls.desc}</p>}
      <footer className="curr-class-foot">
        <div className="curr-class-fac">
          {facOpen ? (
            <span className="curr-class-fac-open">Open · {facRole || "unassigned"}</span>
          ) : (
            <>
              <span className="curr-class-fac-lbl">Taught by</span>
              <span className="curr-class-fac-val">
                {fac.link
                  ? <CLink name={facName} link={fac.link}/>
                  : <span>{facName}</span>}
                {fac.npc && <NpcBadge/>}
              </span>
            </>
          )}
        </div>
        {cls.deptName && (
          <span className="curr-class-dept">{cls.deptName}</span>
        )}
      </footer>
    </article>
  );
}

/* Single staff card · used inside the department triad grid */
function DeptStaffCard({person, slot, isHead, deptColor}){
  const filled = !!person?.char;
  return (
    <div
      className={"curr-staff" + (isHead ? " is-head" : "") + (filled ? " is-filled" : " is-open")}
      style={{ "--dept-c": deptColor || "#d4a84a" }}
    >
      <div className="curr-staff-slot">{slot}</div>
      {filled ? (
        <>
          <div className="curr-staff-name">
            {person.link
              ? <CLink name={person.char} link={person.link}/>
              : <span>{person.char}</span>}
            {person.npc && <NpcBadge/>}
          </div>
          {person.stage && <div className="curr-staff-stage">{person.stage}</div>}
          <div className="curr-staff-role">{person.role}</div>
        </>
      ) : (
        <>
          <div className="curr-staff-name">
            <span className="curr-staff-open">OPEN</span>
          </div>
          {person?.role && <div className="curr-staff-role">{person.role}</div>}
        </>
      )}
    </div>
  );
}

function CurriculumView(){
  const [activeYear, setActiveYear] = useState("FRESHMAN");
  const [filterDesig, setFilterDesig] = useState("all"); // all | hero | sidekick
  const [q, setQ] = useState("");
  const ql = q.trim().toLowerCase();

  const allClasses = gatherCurriculumClasses();

  // Designation filter shows MANDATORY classes only for the chosen
  // path: hero-locked + both-path (shared core). Electives are
  // dropped because they're optional, not required for the
  // designation. Same mirror for sidekick. "All" shows everything.
  // Search query (q) filters by class code/title/desc — case-
  // insensitive substring match.
  const filterMatch = (c) => {
    if (filterDesig !== "all") {
      const p = classPath(c);
      if (p !== "both" && p !== filterDesig) return false;
    }
    if (ql) {
      const hay = [c.code, c.title, c.desc, c.deptName].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(ql)) return false;
    }
    return true;
  };
  const byYear = (y) => allClasses.filter(c => c.year === y && filterMatch(c));

  // Freshman splits: shared core (all departments + TUT-101) + Freshman designation modules
  const y1Shared = byYear("FRESHMAN").filter(c => c.kind === "shared-core")
    .sort((a, b) => (a.code || "").localeCompare(b.code || ""));
  const y1Desig = byYear("FRESHMAN").filter(c => c.kind === "designation")
    .sort((a, b) => (a.code || "").localeCompare(b.code || ""));

  // Y2/Y3 grouped by department + designation modules at the bottom
  const groupYearByDept = (y) => {
    const list = byYear(y).filter(c => c.kind !== "designation");
    const groups = DEPARTMENTS.map(dept => ({
      dept,
      classes: list.filter(c => c.dept === dept.id)
        .sort((a, b) => (a.code || "").localeCompare(b.code || "")),
    })).filter(g => g.classes.length > 0);
    const designation = byYear(y).filter(c => c.kind === "designation")
      .sort((a, b) => (a.code || "").localeCompare(b.code || ""));
    return { groups, designation };
  };
  const y2 = groupYearByDept("SOPHOMORE");
  const y3 = groupYearByDept("JUNIOR");
  const ySR = groupYearByDept("SENIOR");

  // Year tabs are state-driven now — only the active year renders, so
  // a new member sees one focused page at a time instead of scrolling
  // through four stacked years of content.
  const switchYear = (key) => {
    setActiveYear(key);
    // Scroll back to the top of the curriculum main so the new year
    // appears at a clean baseline.
    requestAnimationFrame(() => {
      const main = document.querySelector(".curr-main");
      if (main) main.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="curr">
      {/* Single sticky bar — Search + Year tabs + Designation filter pills */}
      <nav className="lore-nav curr-nav" aria-label="Curriculum filters">
        <div className="sfilter-search curr-nav-search">
          <span className="sfilter-search-icon" aria-hidden="true">⌕</span>
          <input
            type="text"
            className="sfilter-input"
            placeholder="Search class code or title…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search classes"
          />
          {q && (
            <button type="button" className="sfilter-clear" onClick={() => setQ("")} aria-label="Clear search">×</button>
          )}
        </div>
        <span className="curr-nav-sep" aria-hidden="true"/>
        <ol className="lore-nav-list">
          {YEAR_TABS.map(yt => (
            <li key={yt.idx} className={"lore-nav-item" + (yt.key === activeYear ? " is-active" : "")}>
              <button
                type="button"
                className="lore-nav-btn"
                onClick={() => switchYear(yt.key)}
                aria-current={yt.key === activeYear ? "page" : undefined}
              >
                <span className="lore-nav-icon" aria-hidden="true">
                  <Icon name="book-open" size={14} stroke={1.7}/>
                </span>
                <span className="lore-nav-label">{yt.label}</span>
              </button>
            </li>
          ))}
        </ol>

        <span className="curr-nav-sep" aria-hidden="true"/>

        <div className="curr-nav-filter" role="group" aria-label="Filter by designation">
          <button type="button"
            className={"curr-filter-pill" + (filterDesig === "all" ? " is-active" : "")}
            onClick={() => setFilterDesig("all")}
            aria-pressed={filterDesig === "all"}
          >All Tracks</button>
          <button type="button"
            className={"curr-filter-pill t-hero" + (filterDesig === "hero" ? " is-active" : "")}
            onClick={() => setFilterDesig("hero")}
            aria-pressed={filterDesig === "hero"}
          >Heroes</button>
          <button type="button"
            className={"curr-filter-pill t-sidekick" + (filterDesig === "sidekick" ? " is-active" : "")}
            onClick={() => setFilterDesig("sidekick")}
            aria-pressed={filterDesig === "sidekick"}
          >Sidekicks</button>
        </div>

        <span className="curr-nav-count">
          {allClasses.filter(filterMatch).length} classes
        </span>
      </nav>

      <main className="curr-main">

        {/* OVERVIEW PRIMER · what to read first */}
        <section className="curr-primer">
          <div className="curr-primer-l">
            <span className="curr-primer-tag">How the curriculum works</span>
            <h3 className="curr-primer-title">Four years, eight departments.</h3>
            <p className="curr-primer-body">
              Freshman year is unified — every student takes the same shared core. Sophomore year declares a Home Department and specialisation begins. Junior and Senior years are deep specialisation, capstone modules, and field placement. STRATA contract conversations start in the spring of Senior year.
            </p>
            <p className="curr-primer-body curr-primer-body-quiet">
              Heroes and Sidekicks designations run alongside the academic track. Designation modules (HRO- / SDK-) are flagged on each card. To see the full faculty roster, head to the <strong>Faculty Registry</strong> tab.
            </p>
          </div>
          <div className="curr-primer-r">
            <ul className="curr-primer-list">
              <li><span className="curr-primer-list-k">Freshman</span><span className="curr-primer-list-v">Shared core. No specialisation yet.</span></li>
              <li><span className="curr-primer-list-k">Sophomore</span><span className="curr-primer-list-v">Home Department declared. Specialisation begins.</span></li>
              <li><span className="curr-primer-list-k">Junior</span><span className="curr-primer-list-v">Deep specialisation. Field placement begins.</span></li>
              <li><span className="curr-primer-list-k">Senior</span><span className="curr-primer-list-v">Capstones. Final placements. Contract talks.</span></li>
            </ul>
          </div>
        </section>

        {/* Year sections render below — designation filter is in the
            sticky nav above */}

        {/* Freshman · Shared Core */}
        {activeYear === "FRESHMAN" && (
        <section id="curr-year-FRESHMAN" className="curr-year">
          <header className="curr-year-hd">
            <div className="curr-year-hd-l">
              <div className="curr-year-tag">Freshman · Foundation</div>
              <h3 className="curr-year-title">Shared core. Everyone takes everything.</h3>
              <p className="curr-year-blurb">
                Freshman year is unified. Every student takes the shared-core literacy floor — Combat, Media, Sciences, Humanities, Doctrine, Athletics — regardless of intended department or assigned designation. Designation is issued at end of orientation; the HRO-/SDK- modules begin in Freshman year alongside the core.
              </p>
            </div>
            <div className="curr-year-hd-r">
              <span className="curr-year-count">{y1Shared.length + y1Desig.length} classes</span>
            </div>
          </header>

          <div className="curr-block">
            <header className="curr-block-hd">
              <span className="curr-block-tag">Shared Core</span>
              <span className="curr-block-count">{y1Shared.length}</span>
            </header>
            <div className="curr-class-grid">
              {y1Shared.map((c, i) => <ClassCard key={i} cls={c}/>)}
            </div>
          </div>

          {y1Desig.length > 0 && (
            <div className="curr-block">
              <header className="curr-block-hd">
                <span className="curr-block-tag">Designation Modules</span>
                <span className="curr-block-sublbl">Designation Module</span>
                <span className="curr-block-count">{y1Desig.length}</span>
              </header>
              <div className="curr-class-grid">
                {y1Desig.map((c, i) => <ClassCard key={i} cls={c}/>)}
              </div>
            </div>
          )}
        </section>
        )}

        {/* Sophomore · Specialisation begins */}
        {activeYear === "SOPHOMORE" && (
        <section id="curr-year-SOPHOMORE" className="curr-year">
          <header className="curr-year-hd">
            <div className="curr-year-hd-l">
              <div className="curr-year-tag">Sophomore · Specialisation</div>
              <h3 className="curr-year-title">Home Department declared.</h3>
              <p className="curr-year-blurb">
                Sophomore year is when departments matter. Three tracks are mandatory for every student regardless of designation — Combat Training, Media &amp; Arts, and History &amp; Doctrine. The remaining five departments — Sciences, Engineering, Athletics, Humanities, Politics — run as elective pools; students pick from them based on interest and intended specialism. Required Track blocks are marked below.
              </p>
            </div>
            <div className="curr-year-hd-r">
              <span className="curr-year-count">
                {y2.groups.reduce((n, g) => n + g.classes.length, 0) + y2.designation.length} classes
              </span>
            </div>
          </header>

          {y2.groups.map(g => (
            <div key={g.dept.id} className={"curr-block" + (isRequiredDept(g.dept.id) ? " is-required-dept" : " is-elective-dept")} style={{"--dept-c": g.dept.color || "#d4a84a"}}>
              <header className="curr-block-hd is-dept">
                <span className="curr-block-marker"/>
                <span className="curr-block-tag">{g.dept.code} · {g.dept.name}</span>
                <span className="curr-block-sublbl">{isRequiredDept(g.dept.id) ? "Required Track" : "Elective Pool"}</span>
                <span className="curr-block-count">{g.classes.length}</span>
              </header>
              <div className="curr-class-grid">
                {g.classes.map((c, i) => <ClassCard key={i} cls={c}/>)}
              </div>
            </div>
          ))}

          {y2.designation.length > 0 && (
            <div className="curr-block">
              <header className="curr-block-hd">
                <span className="curr-block-tag">Designation Modules</span>
                <span className="curr-block-sublbl">Designation Module</span>
                <span className="curr-block-count">{y2.designation.length}</span>
              </header>
              <div className="curr-class-grid">
                {y2.designation.map((c, i) => <ClassCard key={i} cls={c}/>)}
              </div>
            </div>
          )}
        </section>
        )}

        {/* Junior · Deep specialisation */}
        {activeYear === "JUNIOR" && (
        <section id="curr-year-JUNIOR" className="curr-year">
          <header className="curr-year-hd">
            <div className="curr-year-hd-l">
              <div className="curr-year-tag">Junior · Specialisation</div>
              <h3 className="curr-year-title">Deep specialisation, the first field placements.</h3>
              <p className="curr-year-blurb">
                Junior year. The three required tracks — Combat, Media &amp; Arts, History &amp; Doctrine — keep running across the cohort. Inside the elective departments students go deeper into their chosen specialism and run their first supervised field placements. What you pick this year decides what you defend in your Senior capstone.
              </p>
            </div>
            <div className="curr-year-hd-r">
              <span className="curr-year-count">
                {y3.groups.reduce((n, g) => n + g.classes.length, 0) + y3.designation.length} classes
              </span>
            </div>
          </header>

          {y3.groups.map(g => (
            <div key={g.dept.id} className={"curr-block" + (isRequiredDept(g.dept.id) ? " is-required-dept" : " is-elective-dept")} style={{"--dept-c": g.dept.color || "#d4a84a"}}>
              <header className="curr-block-hd is-dept">
                <span className="curr-block-marker"/>
                <span className="curr-block-tag">{g.dept.code} · {g.dept.name}</span>
                <span className="curr-block-sublbl">{isRequiredDept(g.dept.id) ? "Required Track" : "Elective Pool"}</span>
                <span className="curr-block-count">{g.classes.length}</span>
              </header>
              <div className="curr-class-grid">
                {g.classes.map((c, i) => <ClassCard key={i} cls={c}/>)}
              </div>
            </div>
          ))}

          {y3.designation.length > 0 && (
            <div className="curr-block">
              <header className="curr-block-hd">
                <span className="curr-block-tag">Designation Modules</span>
                <span className="curr-block-sublbl">Designation Module</span>
                <span className="curr-block-count">{y3.designation.length}</span>
              </header>
              <div className="curr-class-grid">
                {y3.designation.map((c, i) => <ClassCard key={i} cls={c}/>)}
              </div>
            </div>
          )}
        </section>
        )}

        {/* Senior · capstone year */}
        {activeYear === "SENIOR" && (
        <section id="curr-year-SENIOR" className="curr-year">
          <header className="curr-year-hd">
            <div className="curr-year-hd-l">
              <div className="curr-year-tag">Senior · Capstone</div>
              <h3 className="curr-year-title">Final year. Department capstones and field placement.</h3>
              <p className="curr-year-blurb">
                Senior year is the final year of the programme. Department capstones, field placement, the institution's most morally serious modules — COM-303 Field Command, HIS-303, the senior policy capstone. Students finish here as standard practitioners and start STRATA contract conversations in the spring.
              </p>
            </div>
            <div className="curr-year-hd-r">
              <span className="curr-year-count">
                {ySR.groups.reduce((n, g) => n + g.classes.length, 0) + ySR.designation.length} classes
              </span>
            </div>
          </header>

          {ySR.groups.map(g => (
            <div key={g.dept.id} className={"curr-block" + (isRequiredDept(g.dept.id) ? " is-required-dept" : " is-elective-dept")} style={{"--dept-c": g.dept.color || "#d4a84a"}}>
              <header className="curr-block-hd is-dept">
                <span className="curr-block-marker"/>
                <span className="curr-block-tag">{g.dept.code} · {g.dept.name}</span>
                <span className="curr-block-sublbl">{isRequiredDept(g.dept.id) ? "Required Track" : "Elective Pool"}</span>
                <span className="curr-block-count">{g.classes.length}</span>
              </header>
              <div className="curr-class-grid">
                {g.classes.map((c, i) => <ClassCard key={i} cls={c}/>)}
              </div>
            </div>
          ))}

          {ySR.designation.length > 0 && (
            <div className="curr-block">
              <header className="curr-block-hd">
                <span className="curr-block-tag">Designation Modules</span>
                <span className="curr-block-sublbl">Designation Module</span>
                <span className="curr-block-count">{ySR.designation.length}</span>
              </header>
              <div className="curr-class-grid">
                {ySR.designation.map((c, i) => <ClassCard key={i} cls={c}/>)}
              </div>
            </div>
          )}
        </section>
        )}
      </main>
    </div>
  );
}

/* Department triad — head of department + two track TAs + the year's
   classes laid out so the chain of command is legible. */
function DeptPerson({faculty, label, isHead, color, deptId}){
  const isOpen = !faculty?.char;
  return (
    <div className={"curr-dept-person" + (isHead ? " is-head" : "") + (isOpen ? " is-open" : "")} style={{"--dept-c": color}} data-dept-id={deptId}>
      <div className="curr-dept-person-tag">{label}</div>
      <div className="curr-dept-person-name">
        {faculty?.char
          ? <CLink name={faculty.char} link={faculty.link || null}/>
          : <span className="curr-dept-person-open">OPEN POSITION</span>}
      </div>
      <div className="curr-dept-person-role">{faculty?.role || "—"}</div>
      {faculty?.stage && (
        <div className="curr-dept-person-stage">{faculty.stage}</div>
      )}
    </div>
  );
}

/* DepartmentTriad / ClassRow components removed — CurriculumView now
   renders triads inline via DeptPerson + ClassCard directly. */

/* ═══════════════════════════════════════════════════════════════════════════
   POWERS
═══════════════════════════════════════════════════════════════════════════ */
function PowersGuide(){
  return (
    <div className="pg-guide">
      <section className="intro-bay">
        <header className="bay-hd">
          <div className="bay-hd-tag">00 / Read First</div>
          <h3 className="bay-hd-title">How the Registry Works</h3>
          <p className="bay-hd-blurb">One tier · One status · One expression</p>
        </header>
        <div className="intro-bay-body">
          <div className="intro-bay-col intro-bay-col-main">
            <div className="intro-bay-eyebrow">The Core Rule</div>
            <p className="intro-bay-text">
              Every powered person on record gets <strong>one tier</strong> (A–D) and <strong>one status</strong>. Tier answers <em>how marketable are you.</em> Status answers <em>whose payroll are you on.</em>
            </p>
            <p className="intro-bay-text">
              Two characters can share the same broad power — pyrokinesis, telepathy, technokinesis — but each character's <strong>specific expression</strong> of that power must be unique. No duplicates. That's how the registry works.
            </p>
          </div>
          <div className="intro-bay-col intro-bay-col-canon">
            <div className="intro-bay-eyebrow">World Ground Rules</div>
            <ul className="intro-bay-rules">
              <li><span className="intro-bay-rule-key">Registration</span><span className="intro-bay-rule-val">Mandatory worldwide for any documented ability.</span></li>
              <li><span className="intro-bay-rule-key">Geneva 2009</span><span className="intro-bay-rule-val">Supes barred from active wartime deployment. Civilian and law-enforcement work unaffected.</span></li>
              <li><span className="intro-bay-rule-key">Concealment</span><span className="intro-bay-rule-val">Hiding a registered ability is a Class III violation.</span></li>
              <li><span className="intro-bay-rule-key">If Registered</span><span className="intro-bay-rule-val">Civilian status by default. Hero contracts are opt-in.</span></li>
              <li><span className="intro-bay-rule-key">If Unregistered</span><span className="intro-bay-rule-val">Unsanctioned. Tracked, not protected.</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="tier-bay">
        <header className="bay-hd">
          <div className="bay-hd-tag">01 / Tiers</div>
          <h3 className="bay-hd-title">A-List → Expendable · Market Value</h3>
          <p className="bay-hd-blurb">Not raw strength. How sellable you are.</p>
        </header>
        <div className="tier-ladder">
          {POWER_TIERS.map(t => (
            <article key={t.id} className="tier-card" style={{borderTopColor:t.color}}>
              <div className="tier-card-top">
                <span className="tier-card-letter" style={{color:t.color}}>{t.tier}</span>
                {!t.hideList && <span className="tier-card-list">List</span>}
              </div>
              <div className="tier-card-bracket">{t.bracket}</div>
              <div className="tier-card-tagline" style={{color:t.color}}>"{t.tagline}"</div>
              <div className="tier-card-deployment">{t.deployment}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="status-bay">
        <header className="bay-hd">
          <div className="bay-hd-tag">02 / Statuses</div>
          <h3 className="bay-hd-title">Seven Roles · Same Spectrum</h3>
          <p className="bay-hd-blurb">Tier is what you are. Status is what you're doing about it.</p>
        </header>
        <div className="status-cards">
          {POWER_STATUSES.map((s, i) => (
            <article key={s.id} className="status-card">
              <div className="status-card-num">{String(i+1).padStart(2,"0")}</div>
              <div className="status-card-tag" style={{background:s.bg, color:s.text}}>
                <span>{s.label}</span>
              </div>
              <div className="status-card-desc">{s.desc}</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── Banned tab · table format, matches Powers Registry chrome ── */
function PowersBanned(){
  // Split each "{ability} — {reason}" entry into two columns; entries
  // without an em-dash are name-only.
  const rows = (BANNED_POWERS || []).map(b => {
    const sep = b.indexOf(" — ");
    if (sep > -1) return { name: b.slice(0, sep).trim(), reason: b.slice(sep + 3).trim() };
    return { name: b.trim(), reason: "" };
  });

  return (
    <div className="pbanned">
      <div className="pbanned-intro">
        <div className="pbanned-intro-eyebrow">Banned · No Appeal</div>
        <p className="pbanned-intro-body">
          Powers the registry will not accept. Applications including any of the entries below are rejected at first review — no appeal, no exceptions.
        </p>
        <div className="pbanned-intro-meta">
          <span className="pbanned-intro-meta-k">Entries</span>
          <span className="pbanned-intro-meta-v">{rows.length}</span>
        </div>
      </div>
      <div className="tw pbanned-tw">
        <table>
          <thead>
            <tr>
              <th className="rn">#</th>
              <th>Banned Ability</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="pbanned-row">
                <td className="rn">{String(i+1).padStart(2, "0")}</td>
                <td className="pbanned-name">{r.name}</td>
                <td className="pbanned-reason">
                  {r.reason
                    ? r.reason
                    : <span className="pbanned-reason-default">Exceeds registry design.</span>}
                </td>
                <td className="pbanned-status">
                  <span className="pbanned-tag">REJECTED</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {RESTRICTED_POWERS.length > 0 && (
        <div className="pbanned-restricted-wrap">
          <div className="pbanned-intro">
            <div className="pbanned-intro-eyebrow" style={{color:"#d4901a"}}>Restricted · Conditional</div>
            <p className="pbanned-intro-body">
              Powers on file but prohibited from operational use. These abilities are registered for monitoring purposes only. Holders may not deploy them in field, combat, or unsupervised contexts without explicit clearance.
            </p>
            <div className="pbanned-intro-meta">
              <span className="pbanned-intro-meta-k">Entries</span>
              <span className="pbanned-intro-meta-v">{RESTRICTED_POWERS.length}</span>
            </div>
          </div>
          <div className="tw pbanned-tw">
            <table>
              <thead>
                <tr>
                  <th className="rn">#</th>
                  <th>Restricted Ability</th>
                  <th>Holder</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {RESTRICTED_POWERS.map((r, i) => (
                  <tr key={i} className="pbanned-row">
                    <td className="rn">{String(i+1).padStart(2, "0")}</td>
                    <td className="pbanned-name">{r.name}</td>
                    <td className="pbanned-holder">{r.holder || <span className="pbanned-reason-default">—</span>}</td>
                    <td className="pbanned-reason">{r.reason || <span className="pbanned-reason-default">Operational deployment prohibited.</span>}</td>
                    <td className="pbanned-status">
                      <span className="pbanned-tag" style={{background:"#d4901a", color:"#1a0e00"}}>RESTRICTED</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function PowersRegistry(){
  const [status, setStatus] = useState("all");
  const [tier,   setTier]   = useState("all");
  const [q, setQ] = useState("");
  const [openIdx, setOpenIdx] = useState({});
  const toggleRow = (key) => setOpenIdx(prev => ({...prev, [key]: !prev[key]}));

  // Master filtered list
  const rows = useMemo(() => POWERS.filter(p => {
    if (status !== "all" && p.status !== status) return false;
    if (tier   !== "all" && (p.tier || "").toUpperCase() !== tier) return false;
    if (q){
      const hay = [p.power, p.char, p.alias, p.expression].join(" ").toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [status, tier, q]);

  const statusOf = (id) => POWER_STATUSES.find(s => s.id === id) || null;
  const sortByName = (a, b) =>
    (a.char || a.alias || "").localeCompare(b.char || b.alias || "", undefined, { sensitivity: "base" });

  // Grouping mode:
  //   "all"      — flat table when no Status/Tier filter active
  //   "by-tier"  — Status filter active: sub-sections by tier (A-LIST, B-LIST...)
  //   "by-status"— Tier filter active: sub-sections by status
  const groupingMode =
    status !== "all" ? "by-tier" :
    tier   !== "all" ? "by-status" :
    "all";

  const sections = useMemo(() => {
    if (groupingMode === "all") {
      return [{ key: "all", label: null, list: rows.slice().sort(sortByName) }];
    }
    if (groupingMode === "by-tier") {
      return ["A", "B", "C", "D", "E"]
        .map(t => ({
          key: t,
          label: t === "E" ? "EXPENDABLE" : `${t}-LIST`,
          list: rows.filter(p => (p.tier || "").toUpperCase() === t).sort(sortByName),
        }))
        .filter(g => g.list.length > 0);
    }
    // by-status
    return POWER_STATUSES
      .map(s => ({
        key: s.id,
        label: s.label.toUpperCase(),
        list: rows.filter(p => p.status === s.id).sort(sortByName),
      }))
      .filter(g => g.list.length > 0);
  }, [groupingMode, rows]);

  // Row renderer (reused inside every section so we don't duplicate JSX).
  const renderRow = (p, i, sectionKey) => {
    const s = statusOf(p.status);
    const rowKey = `${sectionKey}-${i}`;
    const isOpen = !!openIdx[rowKey];
    const hasMore = !!p.power || !!p.expression || !!p.drawbacks;
    const linkAttr = (e) => {
      // Don't toggle when the user clicks the character link itself
      if (e.target.closest("a")) return;
      if (hasMore) toggleRow(rowKey);
    };
    return (
      <React.Fragment key={i}>
        <tr
          className={"preg-row student-row" + (isOpen ? " is-open" : "") + (hasMore ? " is-clickable" : "")}
          style={{boxShadow: "inset 4px 0 0 #c41a1a", cursor: hasMore ? "pointer" : "default"}}
          onClick={linkAttr}
        >
          <td className="rn">{String(i + 1).padStart(2, "0")}</td>
          <td>
            <CLink name={p.char} link={p.link || null}/>
            {p.npc && <NpcBadge/>}
          </td>
          <td>
            <span
              ref={el => { if (el) el.style.setProperty("color", "#d4a843", "important"); }}
              style={{
                color: "#d4a843",
                fontFamily: "Söhne Mono, ui-monospace, monospace",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontStyle: "normal",
              }}
            >{p.alias || "—"}</span>
          </td>
          <td><TierChip tier={p.tier}/></td>
          <td>
            {s && (
              <span className="preg-status-chip" style={{background: s.bg, color: s.text}}>
                {s.label}
              </span>
            )}
          </td>
          <td className="preg-col-power" style={{color: "#888"}}>
            <span className="preg-power-text">{p.power || "—"}</span>
            {hasMore && (
              <span className="preg-power-chev" aria-hidden="true">
                <Icon name={isOpen ? "chevron-up" : "chevron-down"} size={12}/>
              </span>
            )}
          </td>
        </tr>
        {isOpen && hasMore && (
          <tr className="preg-detail-row">
            <td colSpan={6}>
              <div className="preg-detail">
                {p.power && (
                  <>
                    <span className="preg-detail-label">Power / Ability</span>
                    <p className="preg-detail-text">{p.power}</p>
                  </>
                )}
                {p.expression && (
                  <>
                    <span className="preg-detail-label">Expression</span>
                    {p.expression.split(/\n{2,}/).map((para, i) => (
                      <p key={i} className="preg-detail-text">{para.trim()}</p>
                    ))}
                  </>
                )}
                {p.drawbacks && (
                  <>
                    <span className="preg-detail-label">Drawbacks / Limits</span>
                    {p.drawbacks.split(/\n{2,}/).map((para, i) => (
                      <p key={i} className="preg-detail-text">{para.trim()}</p>
                    ))}
                  </>
                )}
                {p.note && (
                  <>
                    <span className="preg-detail-label preg-detail-label--note">Admin Note</span>
                    <p className="preg-detail-text preg-detail-note">{p.note}</p>
                  </>
                )}
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="preg">
      {/* Students-style single sticky filter bar */}
      <div className="sfilter preg-sfilter" role="search">
        <div className="sfilter-search">
          <span className="sfilter-search-icon" aria-hidden="true">⌕</span>
          <input
            type="text"
            className="sfilter-input"
            placeholder="Search name, alias, or power…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search powers"
          />
          {q && (
            <button type="button" className="sfilter-clear" onClick={() => setQ("")} aria-label="Clear search">×</button>
          )}
        </div>

        <div className="sfilter-group">
          <span className="sfilter-lbl">Status</span>
          <button type="button"
            className={"sf-pill" + (status === "all" ? " on" : "")}
            onClick={() => setStatus("all")}
            aria-pressed={status === "all"}
          >All</button>
          {POWER_STATUSES.map(s => (
            <button key={s.id} type="button"
              className={"sf-pill" + (status === s.id ? " on" : "")}
              onClick={() => setStatus(status === s.id ? "all" : s.id)}
              aria-pressed={status === s.id}
              style={status === s.id ? {background: s.bg, color: s.text, borderColor: s.bg} : {}}
            >{s.label}</button>
          ))}
        </div>

        <div className="sfilter-group">
          <span className="sfilter-lbl">Tier</span>
          <button type="button"
            className={"sf-pill" + (tier === "all" ? " on" : "")}
            onClick={() => setTier("all")}
            aria-pressed={tier === "all"}
          >All</button>
          {["A", "B", "C", "D", "E"].map(t => (
            <button key={t} type="button"
              className={"sf-pill" + (tier === t ? " on" : "")}
              onClick={() => setTier(tier === t ? "all" : t)}
              aria-pressed={tier === t}
            >{t}</button>
          ))}
        </div>

        <div className="sfilter-count">{rows.length} entr{rows.length === 1 ? "y" : "ies"}</div>
      </div>

      {rows.length === 0 && (
        <div className="preg-empty">
          {POWERS.length === 0
            ? "No powers registered yet"
            : "No records match the current filter"}
        </div>
      )}

      {sections.map(sec => (
        <div key={sec.key} className="preg-section">
          {sec.label && (
            <div className="preg-section-hd">
              <span className="preg-section-name">{sec.label}</span>
              <span className="preg-section-count">{sec.list.length} {sec.list.length === 1 ? "record" : "records"}</span>
            </div>
          )}
          <div className="tw preg-tw">
            <table>
              <thead>
                <tr>
                  <th className="rn">#</th>
                  <th>Character</th>
                  <th>Stage Name</th>
                  <th>Tier</th>
                  <th>Status</th>
                  <th>Power / Ability</th>
                </tr>
              </thead>
              <tbody>
                {sec.list.map((p, i) => renderRow(p, i, sec.key))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function PowersTab(){
  const ctx = React.useContext(RegContext);
  const [view, setView] = useState("guide");
  useEffect(() => {
    if (ctx.targetSubview && ["guide","registry","banned"].includes(ctx.targetSubview)){
      setView(ctx.targetSubview);
      ctx.consumeSubview();
    }
  }, [ctx]);
  return (
    <div className="subnav-host">
      <PageHead
        stamp="DOC · 08 · POWER REGISTRY"
        title={<>The powered</>}
        body={<>One tier system (A–E). Seven statuses. Read the <strong>Guide</strong> first; the <strong>Registry</strong> is the cast; the <strong>Banned</strong> list is what the registry refuses.</>}
        note={<>{POWERS.length} on file<br/>Same type is fine — same expression is not</>}
        pageNum="P. 008 / VIII"
      />
      <div className="subnav">
        <div className="subnav-inner">
          {[
            ["guide",    "Guide",    "How powers work"],
            ["registry", "Registry", "Who has what"],
            ["banned",   "Banned",   "What the registry refuses"],
          ].map(([id, lbl, sub]) => (
            <button
              key={id}
              className={"subnav-btn" + (view === id ? " on" : "")}
              onClick={() => setView(id)}
              aria-pressed={view === id}
            >
              {lbl.toUpperCase()}
              <span className="sn-sub">{sub}</span>
            </button>
          ))}
        </div>
      </div>
      {view === "guide"    && <PowersGuide/>}
      {view === "registry" && <PowersRegistry/>}
      {view === "banned"   && <PowersBanned/>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STUDENTS
═══════════════════════════════════════════════════════════════════════════ */
function StudentRosterFull(){
  // Normalize power-signature separators so the column reads consistently:
  // commas, em-dashes, en-dashes, semicolons, and " & " all collapse to " · ".
  // Then Title-Case each segment so casing is uniform across rows.
  const SMALL_WORDS = new Set(["a","an","and","as","at","but","by","for","in","of","on","or","the","to","via","with","vs","v"]);
  const titleSegment = (seg) => {
    const words = seg.trim().split(/\s+/);
    return words.map((w, i) => {
      // Preserve all-caps acronyms (3+ letters all uppercase) and hyphenated forms
      if (/^[A-Z0-9]{2,}$/.test(w)) return w;
      const parts = w.split("-").map((p, pi) => {
        const low = p.toLowerCase();
        if (i > 0 && pi === 0 && SMALL_WORDS.has(low)) return low;
        return low.charAt(0).toUpperCase() + low.slice(1);
      });
      return parts.join("-");
    }).join(" ");
  };
  const normalizePower = (s) => {
    if (!s) return s;
    const collapsed = s
      .replace(/\s*[—–]\s*/g, " · ")
      .replace(/\s+-\s+/g, " · ")
      .replace(/\s*,\s*&\s*/g, " · ")
      .replace(/\s+&\s+/g, " · ")
      .replace(/\s*,\s*/g, " · ")
      .replace(/\s*;\s*/g, " · ")
      .replace(/\s*·\s*·\s*/g, " · ")
      .replace(/\s+/g, " ")
      .trim();
    return collapsed.split(" · ").map(titleSegment).join(" · ");
  };

  // Designation is the canonical field. Sourced from s.track (hero/sidekick).
  const desigOf = (s) => (s.track || "").toLowerCase() || null;

  const [q, setQ] = useState("");
  const [house, setHouse] = useState("all");
  const [tier, setTier]   = useState("all");
  const [designation, setDesignation] = useState("all");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return STUDENTS.filter(s => {
      if (house !== "all" && (s.house || "").toLowerCase() !== house) return false;
      if (designation !== "all" && desigOf(s) !== designation) return false;
      if (tier !== "all") {
        const t = (s.tier || "").toUpperCase();
        const letter = t[0] || "";
        if (letter !== tier) return false;
      }
      if (ql) {
        const hay = [s.char, s.alias, s.power, s.house, s.year, s.track].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    }).sort((a, b) => (a.char || "").localeCompare(b.char || "", undefined, { sensitivity: "base" }));
  }, [q, house, tier, designation]);

  const Pill = ({active, onClick, children}) => (
    <button
      type="button"
      className={"sf-pill" + (active ? " on" : "")}
      onClick={onClick}
      aria-pressed={active}
    >{children}</button>
  );

  return (
    <div>
      <div className="sfilter" role="search">
        <div className="sfilter-search">
          <span className="sfilter-search-icon" aria-hidden="true">⌕</span>
          <input
            type="text"
            className="sfilter-input"
            placeholder="Search by name, alias, or power…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search students"
          />
          {q && (
            <button type="button" className="sfilter-clear" onClick={() => setQ("")} aria-label="Clear search">×</button>
          )}
        </div>

        <div className="sfilter-group">
          <span className="sfilter-lbl">House</span>
          <Pill active={house === "all"}     onClick={() => setHouse("all")}>All</Pill>
          <Pill active={house === "valaris"} onClick={() => setHouse("valaris")}>Valaris</Pill>
          <Pill active={house === "orenne"}  onClick={() => setHouse("orenne")}>Orenne</Pill>
          <Pill active={house === "saberis"} onClick={() => setHouse("saberis")}>Saberis</Pill>
          <Pill active={house === "grimere"} onClick={() => setHouse("grimere")}>Grimere</Pill>
        </div>

        <div className="sfilter-group">
          <span className="sfilter-lbl">Tier</span>
          <Pill active={tier === "all"} onClick={() => setTier("all")}>All</Pill>
          <Pill active={tier === "A"}   onClick={() => setTier("A")}>A</Pill>
          <Pill active={tier === "B"}   onClick={() => setTier("B")}>B</Pill>
          <Pill active={tier === "C"}   onClick={() => setTier("C")}>C</Pill>
          <Pill active={tier === "D"}   onClick={() => setTier("D")}>D</Pill>
        </div>

        <div className="sfilter-group">
          <span className="sfilter-lbl">Designation</span>
          <Pill active={designation === "all"}      onClick={() => setDesignation("all")}>All</Pill>
          <Pill active={designation === "hero"}     onClick={() => setDesignation("hero")}>Hero</Pill>
          <Pill active={designation === "sidekick"} onClick={() => setDesignation("sidekick")}>Sidekick</Pill>
        </div>

        <div className="sfilter-count">{filtered.length} entr{filtered.length === 1 ? "y" : "ies"}</div>
      </div>

      <div className="sfilter-reset-row">
        {(q || house !== "all" || tier !== "all" || designation !== "all") && (
          <button
            type="button"
            className="sfilter-reset"
            onClick={() => { setQ(""); setHouse("all"); setTier("all"); setDesignation("all"); }}
          >Reset filters</button>
        )}
      </div>

      <div className="tw">
        <table>
          <thead><tr>
            <th className="rn">#</th>
            <th>Character</th>
            <th>Stage Name</th>
            <th>House</th>
            <th>Year</th>
            <th>Designation</th>
            <th>Power / Ability</th>
            <th>Tier</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{padding:"60px 16px", textAlign:"center"}}>
                  <div className="empty-state-block">
                    <EmptyState label="No characters match these filters"/>
                    <button type="button" className="empty-cta" onClick={() => {setQ(""); setHouse("all"); setTier("all"); setDesignation("all");}}>Reset filters</button>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map((s, i) => {
              const houseCol = s.house ? HC_PRIMARY[s.house.toLowerCase()] : null;
              const d = desigOf(s);
              const desigLbl = d === "hero" ? "Hero" : d === "sidekick" ? "Sidekick" : "—";
              return (
                <tr key={i} className="student-row" style={houseCol ? {boxShadow:`inset 4px 0 0 ${houseCol}`} : null}>
                  <td className="rn">{i+1}</td>
                  <td><CLink name={s.char} link={s.link}/></td>
                  <td><span className="stage-name">{s.alias}</span></td>
                  <td><HouseTag house={s.house}/></td>
                  <td style={{textTransform:"capitalize", fontSize:13, color:"var(--muted)", fontStyle:"italic"}}>{s.year}</td>
                  <td>
                    {d
                      ? <span className={"desig-chip desig-chip-" + d}>{desigLbl}</span>
                      : <span className="desig-chip-empty">—</span>}
                  </td>
                  <td className="student-col-power" style={{fontSize:13}}>{normalizePower(s.power)}</td>
                  <td>
                    <span className="tier-pill" style={{background:TIER_C[s.tier] || "#555"}}>{s.tier}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentRoster({track}){
  const list = useMemo(() => {
    const arr = STUDENTS.filter(s => (s.track || "").toLowerCase() === track);
    return arr.sort((a, b) => a.char.split(" ").pop().localeCompare(b.char.split(" ").pop()));
  }, [track]);
  return (
    <div className="tw">
      <table>
        <thead><tr>
          <th className="rn">#</th>
          <th>Character</th>
          <th>Stage Name</th>
          <th>House</th>
          <th>Year</th>
          <th>Power / Ability</th>
          <th>Tier</th>
        </tr></thead>
        <tbody>
          {list.length === 0 && (
            <tr>
              <td colSpan={7} style={{padding:"60px 16px", textAlign:"center"}}>
                <div className="empty-state-block">
                  <EmptyState label={`No ${track === "hero" ? "heroes" : "sidekicks"} on file yet`}/>
                  <a href="#join" className="empty-cta">+ Apply as a {track === "hero" ? "hero" : "sidekick"}</a>
                </div>
              </td>
            </tr>
          )}
          {list.map((s, i) => {
            const houseCol = s.house ? HC_PRIMARY[s.house.toLowerCase()] : null;
            return (
            <tr key={i} className="student-row" style={houseCol ? {boxShadow:`inset 4px 0 0 ${houseCol}`} : null}>
              <td className="rn">{i+1}</td>
              <td><CLink name={s.char} link={s.link}/></td>
              <td>
                <span className="stage-name">{s.alias}</span>
              </td>
              <td><HouseTag house={s.house}/></td>
              <td style={{textTransform:"capitalize", fontSize:13, color:"var(--muted)", fontStyle:"italic"}}>{s.year}</td>
              <td className="student-col-power" style={{fontSize:13}}>{s.power}</td>
              <td>
                <span className="tier-pill" style={{background:TIER_C[s.tier] || "#555"}}>
                  {s.tier}
                </span>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StudentsTab(){
  const ctx = React.useContext(RegContext);
  const [view, setView] = useState("roster");
  useEffect(() => {
    if (ctx.targetSubview) {
      if (ctx.targetSubview === "govt") setView("govt");
      else if (["heroes","sidekicks","roster"].includes(ctx.targetSubview)) setView("roster");
      ctx.consumeSubview();
    }
  }, [ctx]);

  return (
    <div className="subnav-host">
      <PageHead
        stamp="DOC · 04 · STUDENTS"
        title={<>Student registry</>}
        body="Every powered student currently enrolled. Filter by house, tier, or track — search anything. Click any character name to visit their profile."
        note={<>No cap on student numbers<br/>New characters always welcome</>}
        pageNum="P. 004 / VIII"
      />
      <div className="subnav">
        <div className="subnav-inner">
          {[
            ["roster", "Roster",           "All students · filter & search"],
            ["govt",   "Student Govt.",    "Elected & appointed"],
          ].map(([id, lbl, sub]) => (
            <button
              key={id}
              className={"subnav-btn" + (view === id ? " on" : "")}
              onClick={() => setView(id)}
              aria-pressed={view === id}
            >
              {lbl.toUpperCase()}
              <span className="sn-sub">{sub}</span>
            </button>
          ))}
        </div>
      </div>
      {view === "roster" && <StudentRosterFull/>}
      {view === "govt"   && <StudentGovInner/>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FACULTY
═══════════════════════════════════════════════════════════════════════════ */
function FacultyTab(){
  const ctx = React.useContext(RegContext);
  const [view, setView] = useState("curriculum");
  useEffect(() => {
    if (ctx.targetSubview && ["curriculum", "registry"].includes(ctx.targetSubview)){
      setView(ctx.targetSubview);
      ctx.consumeSubview();
    }
  }, [ctx]);

  const titleMap = {
    curriculum: <>The curriculum</>,
    registry: <>Faculty registry</>,
  };
  const bodyMap = {
    curriculum: "Two tracks. One meat grinder. Every student at Calderyn is sorted into one of the two, and both of them serve the same machine. There is no third option. There is no neutral enrolment. Pick your poison.",
    registry: "All institutional staff. Calderyn College is run by Dean Ravindrakumar — every department reports through her. Unfilled positions run as background NPCs until claimed.",
  };

  return (
    <div className="subnav-host">
      <PageHead
        stamp="DOC · 03 · FACULTY"
        title={titleMap[view]}
        body={bodyMap[view]}
        pageNum="P. 003 / VIII"
      />
      <div className="subnav">
        <div className="subnav-inner">
          {[
            ["curriculum", "Curriculum",       "Eight departments · Four years"],
            ["registry",   "Faculty Registry", "Subjects · People"],
          ].map(([id, lbl, sub]) => (
            <button
              key={id}
              className={"subnav-btn" + (view === id ? " on" : "")}
              onClick={() => setView(id)}
              aria-pressed={view === id}
            >
              {lbl.toUpperCase()}
              <span className="sn-sub">{sub}</span>
            </button>
          ))}
        </div>
      </div>
      {view === "curriculum" && <CurriculumView/>}
      {view === "registry" && <FacultyRegistryView/>}
    </div>
  );
}

// Short department label for the faculty registry's Department column.
/* Map a faculty row's department slot to the slot label.
   Used to label HoD vs Prof. 1/2/3 in the staff grid. */
function slotLabelFor(deptSlot){
  if (deptSlot === "head") return "Head of Department";
  if (deptSlot === "prof1") return "Prof. 1";
  if (deptSlot === "prof2") return "Prof. 2";
  if (deptSlot === "prof3") return "Prof. 3";
  return null;
}

/* Single staff card — used inside dept sections for HoD + 3 profs */
function StaffSlotCard({person, slot, isHead, deptColor}){
  const filled = !!person?.char;
  const reserved = !filled && !!person?.reserved;
  return (
    <div
      className={"freg-slot" + (isHead ? " is-head" : "") + (filled ? " is-filled" : (reserved ? " is-reserved" : " is-open"))}
      style={{ "--dept-c": deptColor || "#d4a84a" }}
    >
      <div className="freg-slot-tag">{slot}</div>
      {filled ? (
        <>
          <div className="freg-slot-name">
            {person.link
              ? <CLink name={person.char} link={person.link}/>
              : <span>{person.char}</span>}
            {person.npc && <NpcBadge/>}
          </div>
          {person.alias && person.alias.toLowerCase() !== "n/a" && person.alias.toLowerCase() !== (person.char || "").toLowerCase() && (
            <div className="freg-slot-callsign">
              <i className="fa-solid fa-id-badge" aria-hidden="true"></i>
              <span className="freg-slot-callsign-lbl">Callsign</span>
              <span className="freg-slot-callsign-val">{person.alias}</span>
            </div>
          )}
          {person.tier
            ? <div className="freg-slot-tier"><TierChip tier={person.tier}/></div>
            : (person.stage && person.stage.toLowerCase() !== (person.char || "").toLowerCase()
                ? <div className="freg-slot-stage">{person.stage}</div>
                : null)}
          <div className="freg-slot-role">{person.role}</div>
          {person.power && <div className="freg-slot-power"><span>Power</span> {person.power}</div>}
        </>
      ) : reserved ? (
        <>
          <div className="freg-slot-name">
            <span className="freg-slot-reserved">RESERVED</span>
          </div>
          <div className="freg-slot-reserved-note">{person.reserved}</div>
          <div className="freg-slot-role">{person.role || "Reserved position"}</div>
        </>
      ) : (
        <>
          <div className="freg-slot-name">
            <span className="freg-slot-open">OPEN</span>
          </div>
          <div className="freg-slot-role">{person?.role || "Open position"}</div>
        </>
      )}
    </div>
  );
}

/* One department section — staff grid + expandable class catalogue */
function DepartmentSection({dept}){
  const headChar = dept.head?.char;
  const staffCount = 1 + (dept.staff?.length || 0) + (dept.instructional?.length || 0);
  const classCount = (dept.classes || []).length;

  return (
    <section className="freg-dept-section is-expanded" style={{"--dept-c": dept.color || "#d4a84a"}}>
      <div className="freg-dept-section-hd">
        <div className="freg-dept-section-hd-l">
          <span className="freg-dept-section-eyebrow">{dept.code} · Department</span>
          <h3 className="freg-dept-section-name">{dept.name}</h3>
          <span className="freg-dept-section-head-line">
            <span className="freg-dept-section-head-lbl">HoD</span>
            {headChar
              ? <span className="freg-dept-section-head-name">{headChar}</span>
              : <span className="freg-dept-section-head-open">Open</span>}
          </span>
        </div>
        <div className="freg-dept-section-hd-r">
          <span className="freg-dept-section-staff-count">{staffCount} roles</span>
          <span className="freg-dept-section-class-count">{classCount} classes</span>
        </div>
      </div>

      <div className="freg-dept-section-body">
        {dept.blurb && <p className="freg-dept-section-blurb">{dept.blurb}</p>}

        {/* Staff grid · HoD + 3 profs */}
        <div className="freg-dept-staff">
          <StaffSlotCard person={dept.head} slot="Head of Department" isHead deptColor={dept.color}/>
          {(dept.staff || []).map((p, i) => (
            <StaffSlotCard key={i} person={p} slot={p.slot || ("Prof. " + (i+1))} deptColor={dept.color}/>
          ))}
        </div>

        {/* Instructional Staff (TAs, technicians, house trainers) */}
        {(dept.instructional && dept.instructional.length > 0) && (
          <div className="freg-dept-aux">
            <span className="freg-dept-aux-lbl">Instructional Staff</span>
            <ul className="freg-dept-aux-list">
              {dept.instructional.map((p, i) => (
                <li key={i} className={"freg-dept-aux-item" + (p.char ? " is-filled" : " is-open")}>
                  {p.char ? (
                    <>
                      {p.link
                        ? <CLink name={p.char} link={p.link}/>
                        : <span>{p.char}</span>}
                      {p.alias && p.alias.toLowerCase() !== "n/a" && p.alias.toLowerCase() !== (p.char || "").toLowerCase() && (
                        <span className="freg-dept-aux-callsign">
                          <i className="fa-solid fa-id-badge" aria-hidden="true"></i>
                          {p.alias}
                        </span>
                      )}
                      <span className="freg-dept-aux-role">· {p.role}</span>
                      {p.tier && <TierChip tier={p.tier}/>}
                      {p.npc && <NpcBadge/>}
                    </>
                  ) : (
                    <span className="freg-dept-aux-open">OPEN · {p.role}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Class catalogue */}
        {classCount > 0 && (
          <div className="freg-classes">
            <header className="freg-classes-hd">
              <span className="freg-classes-hd-lbl">Class Catalogue</span>
              <span className="freg-classes-hd-count">{classCount}</span>
            </header>
            <ol className="freg-classes-list">
              {dept.classes.map((cls, i) => (
                <li key={i} className="freg-classes-item">
                  <span className="freg-classes-code">{cls.code}</span>
                  <span className="freg-classes-year">{cls.year}</span>
                  <span className="freg-classes-title">{cls.title}</span>
                  <span className="freg-classes-by">{cls.taughtBy || "—"}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {dept.facilities && (
          <div className="freg-dept-facilities">
            <span className="freg-dept-facilities-lbl">Facilities</span>
            <p>{dept.facilities}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function FacultyRegistryView(){
  const [filterDesig, setFilterDesig] = useState("all"); // all | hero | sidekick
  const [filterDept, setFilterDept]   = useState("all"); // all | dept.id
  const [q, setQ] = useState("");
  const ql = q.trim().toLowerCase();

  // Match a dept against the search query. Looks at dept name, code,
  // head/staff/instructional names + roles, and class codes/titles.
  const deptMatchesSearch = (dept) => {
    if (!ql) return true;
    const haystack = [
      dept.name, dept.code,
      dept.head?.char, dept.head?.role,
      ...(dept.staff || []).flatMap(s => [s.char, s.role]),
      ...(dept.instructional || []).flatMap(p => [p.char, p.role]),
      ...(dept.classes || []).flatMap(c => [c.code, c.title]),
    ].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(ql);
  };

  // Combined dept-level filter: search query + selected dept pill.
  const deptMatches = (dept) =>
    deptMatchesSearch(dept) && (filterDept === "all" || dept.id === filterDept);

  // Filter a dept's classes + instructional staff by selected
  // designation. Classes without a designation tag are visible
  // regardless (shared / required modules). Instructional rows
  // that mention the opposite lane in their role get hidden.
  const filteredDept = (dept) => {
    if (filterDesig === "all") return dept;
    // Mandatory-only: shared (both) + designation-locked. Electives
    // are optional and drop out of the filtered view.
    const classes = (dept.classes || []).filter(c => {
      const p = classPath(c);
      return p === "both" || p === filterDesig;
    });
    const otherLane = filterDesig === "hero" ? "sidekicks lane" : "heroes lane";
    const instructional = (dept.instructional || []).filter(p => {
      const role = (p.role || "").toLowerCase();
      return !role.includes(otherLane);
    });
    return { ...dept, classes, instructional };
  };

  // Find the dean — first row in the Office of the Dean section, role === "Dean"
  const deanSection = FACULTY.find(s => /office of the dean/i.test(s.section));
  const deanRow = deanSection ? deanSection.rows.find(r => /^dean$/i.test(r.role) && r.char) : null;
  const deanOtherRows = deanSection ? deanSection.rows.filter(r => !(deanRow && r === deanRow)) : [];

  // Find Support Staff section
  const supportSection = FACULTY.find(s => /support staff/i.test(s.section));

  return (
    <div className="freg">
      <div className="freg-hint">
        Eight departments. All staff, class catalogues, and facilities visible inline — scroll to read.
      </div>

      {/* Designation filter — same chrome as the Students roster filter
          so the two pages read as siblings. Filters classes + off-lane
          instructional staff inside each department's catalogue. */}
      <div className="sfilter freg-sfilter" role="search" aria-label="Filter faculty by designation">
        <div className="sfilter-search">
          <span className="sfilter-search-icon" aria-hidden="true">⌕</span>
          <input
            type="text"
            className="sfilter-input"
            placeholder="Search by name, role, or department…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search faculty"
          />
          {q && (
            <button type="button" className="sfilter-clear" onClick={() => setQ("")} aria-label="Clear search">×</button>
          )}
        </div>
        <div className="sfilter-group">
          <span className="sfilter-lbl">Department</span>
          <button type="button"
            className={"sf-pill" + (filterDept === "all" ? " on" : "")}
            onClick={() => setFilterDept("all")}
            aria-pressed={filterDept === "all"}
          >All</button>
          {DEPARTMENTS.map(d => (
            <button key={d.id} type="button"
              className={"sf-pill" + (filterDept === d.id ? " on" : "")}
              onClick={() => setFilterDept(filterDept === d.id ? "all" : d.id)}
              aria-pressed={filterDept === d.id}
              style={filterDept === d.id ? {borderColor: d.color, color: d.color} : {}}
              title={d.name}
            >{d.code}</button>
          ))}
        </div>
        <div className="sfilter-group">
          <span className="sfilter-lbl">Designation</span>
          <button type="button"
            className={"sf-pill" + (filterDesig === "all" ? " on" : "")}
            onClick={() => setFilterDesig("all")}
            aria-pressed={filterDesig === "all"}
          >All</button>
          <button type="button"
            className={"sf-pill" + (filterDesig === "hero" ? " on" : "")}
            onClick={() => setFilterDesig("hero")}
            aria-pressed={filterDesig === "hero"}
          >Hero</button>
          <button type="button"
            className={"sf-pill" + (filterDesig === "sidekick" ? " on" : "")}
            onClick={() => setFilterDesig("sidekick")}
            aria-pressed={filterDesig === "sidekick"}
          >Sidekick</button>
        </div>
        <div className="sfilter-count">
          {(() => {
            const n = DEPARTMENTS.filter(deptMatches).length;
            return `${n} ${n === 1 ? "department" : "departments"}`;
          })()}
        </div>
      </div>

      {/* DEAN · the existing portrait-card treatment stays */}
      {deanRow && (
        <div className="dean-card">
          <div className="dean-card-portrait">
            <img src="https://i.ibb.co/3mt7Ny2n/136a0506-3ef1-457a-a7dc-ae03bf182303.png" alt="Dr. Devika Ravindrakumar" loading="lazy"/>
          </div>
          <div className="dean-card-text">
            <div className="dean-card-eyebrow">Office of the Dean</div>
            <div className="dean-card-name">
              <CLink name={deanRow.char} link={deanRow.link||null}/>
              {deanRow.tier && <span className="dean-card-tier"><TierChip tier={deanRow.tier}/></span>}
            </div>
            {deanRow.alias && deanRow.alias.toLowerCase() !== "n/a" && (
              <div className="dean-card-callsign">
                <i className="fa-solid fa-id-badge" aria-hidden="true"></i>
                <span className="dean-card-callsign-lbl">Callsign</span>
                <span className="dean-card-callsign-val">{deanRow.alias}</span>
              </div>
            )}
            {deanRow.tier
              ? null
              : (
                <div className="dean-card-stage">
                  {deanRow.stage ? deanRow.stage : "STAGE NAME · N/A"}
                </div>
              )}
            {deanRow.power && (
              <div className="dean-card-power">
                <span className="dean-card-power-tag">Power</span>
                <span>{deanRow.power}</span>
              </div>
            )}
            {deanSection.note && (
              <div className="dean-card-bio">
                {deanSection.note}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Office of the Dean · other roles (Admissions, Registrar, Fellowship Coordinator) */}
      {deanOtherRows.length > 0 && (
        <section className="freg-dean-staff">
          <header className="freg-dean-staff-hd">
            <span className="freg-dean-staff-eyebrow">Office of the Dean</span>
            <span className="freg-dean-staff-name">Administrative Staff</span>
          </header>
          <ul className="freg-dean-staff-list">
            {deanOtherRows.map((r, i) => (
              <li key={i} className={"freg-dean-staff-item" + (r.char ? " is-filled" : " is-open")}>
                <span className="freg-dean-staff-role">{r.role}</span>
                <span className="freg-dean-staff-who">
                  {r.char
                    ? <>
                        {r.link
                          ? <CLink name={r.char} link={r.link}/>
                          : <span>{r.char}</span>}
                        {r.tier && <TierChip tier={r.tier}/>}
                        {r.npc && <NpcBadge/>}
                      </>
                    : <span className="freg-dean-staff-open">OPEN</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 8 DEPARTMENT SECTIONS — always expanded, class catalogues filtered by designation */}
      {DEPARTMENTS.filter(deptMatches).map(dept => (
        <DepartmentSection key={dept.id} dept={filteredDept(dept)}/>
      ))}

      {/* SUPPORT STAFF · Switchboards stays here per canon */}
      {supportSection && (
        <section className="freg-support">
          <header className="freg-support-hd">
            <div className="freg-support-hd-l">
              <span className="freg-support-eyebrow">Non-Teaching</span>
              <h3 className="freg-support-name">{supportSection.section}</h3>
            </div>
            <span className="freg-support-count">{supportSection.rows.length} roles</span>
          </header>
          {supportSection.note && (
            <p className="freg-support-note">{supportSection.note}</p>
          )}
          <div className="tw freg-support-tw">
            <table>
              <thead>
                <tr>
                  <th className="rn">#</th>
                  <th>Role</th>
                  <th>Callsign</th>
                  <th>Name</th>
                  <th>Tier</th>
                  <th>Power / Ability</th>
                </tr>
              </thead>
              <tbody>
                {supportSection.rows.map((r, i) => (
                  <tr key={i} className={"support-row" + (r.char ? " is-filled" : " is-open")}>
                    <td className="rn">{String(i + 1).padStart(2, "0")}</td>
                    <td className="support-col-role">{r.role}</td>
                    <td className="support-col-stage">{(r.alias && r.alias.toLowerCase() !== "n/a") ? <span className="support-stage">{r.alias}</span> : r.stage ? <span className="support-stage">{r.stage}</span> : <span className="support-na">—</span>}</td>
                    <td className="support-col-name">
                      {r.char ? (
                        <>
                          {r.link
                            ? <CLink name={r.char} link={r.link}/>
                            : <span>{r.char}</span>}
                          {r.npc && <NpcBadge/>}
                        </>
                      ) : (
                        <span className="support-open">OPEN</span>
                      )}
                    </td>
                    <td>{r.tier ? <TierChip tier={r.tier}/> : <span className="support-na">—</span>}</td>
                    <td className="support-col-power">{r.power || <span className="support-na">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LORE TABS
═══════════════════════════════════════════════════════════════════════════ */
const LORE_TABS = [
  { id: "world",     label: "World",     icon: "map"            },
  { id: "history",   label: "Programme", icon: "scroll-text"    },
  { id: "vanguard",  label: "Vanguard",  icon: "shield"         },
  { id: "houses",    label: "Houses",    icon: "flag"           },
  { id: "dean",      label: "Dean",      icon: "users"          },
  { id: "hounds",    label: "Hounds",    icon: "crosshair"      },
  { id: "incidents", label: "Cassandra", icon: "alert-triangle" },
];

function HousesTab(){
  const ctx = React.useContext(RegContext);
  // active = which section the sidebar should highlight. Defaults
  // to the first; updated by the IntersectionObserver as the writer
  // scrolls and by sidebar-click optimistic updates.
  const [active, setActive] = useState(LORE_TABS[0]?.id || "world");

  // Honour deep-link hashes like #lore/vanguard on mount by scrolling
  // to that anchor.
  useEffect(() => {
    if (ctx.targetSubview && LORE_TABS.find(t => t.id === ctx.targetSubview)){
      const el = document.getElementById("lore-" + ctx.targetSubview);
      if (el) {
        // Defer to next frame so the section has mounted
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "instant", block: "start" });
        });
      }
      setActive(ctx.targetSubview);
      ctx.consumeSubview();
    }
  }, [ctx]);

  // SCROLL-SPY — compute the active section on scroll directly off
  // each section's bounding rect. This is more reliable than
  // IntersectionObserver for long sections where the previous one's
  // tail can still overlap the active band when the new one's head
  // is visible. We pick the section whose TOP is just above the
  // 25% line of the viewport — the one the reader is "reading".
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const trigger = window.innerHeight * 0.25;
      const sections = LORE_TABS
        .map(t => ({ id: t.id, el: document.getElementById("lore-" + t.id) }))
        .filter(s => s.el);
      if (!sections.length) return;
      let current = sections[0].id;
      for (const s of sections) {
        const top = s.el.getBoundingClientRect().top;
        if (top - trigger <= 0) current = s.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const goTo = (id) => {
    const el = document.getElementById("lore-" + id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  return (
    <div className="subnav-host">
      <PageHead
        stamp="DOC · 02 · LORE"
        title={<>The <em>lore</em></>}
        body="Seven sections. Read in order or jump to whichever you need. The dot rail on the right tracks where you are."
        note={<>Public record · IC-visible<br/>Plot-locked content lives elsewhere</>}
        pageNum="P. 002 / VIII"
      />

      {/* Top sticky chapter nav — horizontal strip, icons + always-
          visible labels. Replaces the previous floating right-rail
          which cascaded off-screen on tall content. */}
      <nav className="lore-nav" aria-label="Lore chapters">
        <ol className="lore-nav-list">
          {LORE_TABS.map((t, i) => (
            <li key={t.id} className={"lore-nav-item" + (active === t.id ? " is-active" : "")}>
              <button
                type="button"
                className="lore-nav-btn"
                onClick={() => goTo(t.id)}
                aria-current={active === t.id ? "true" : undefined}
                aria-label={`Jump to ${t.label}`}
              >
                <span className="lore-nav-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="lore-nav-icon" aria-hidden="true">
                  <Icon name={t.icon} size={16} stroke={1.7}/>
                </span>
                <span className="lore-nav-label">{t.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="lore-page">
        <section id="lore-world"     className="lore-section"><LoreWorld/></section>
        <section id="lore-history"   className="lore-section"><LoreHistory/></section>
        <section id="lore-vanguard"  className="lore-section"><LoreVanguard/></section>
        <section id="lore-houses"    className="lore-section"><LoreHouses/></section>
        <section id="lore-dean"      className="lore-section"><LoreDean/></section>
        <section id="lore-hounds"    className="lore-section"><LoreHounds/></section>
        <section id="lore-incidents" className="lore-section"><LoreIncidents/></section>
      </div>
    </div>
  );
}

function LoreStart({onJump}){
  const houses = D.houses;
  const READ_ORDER = [
    { id: "world",     n: "01", title: "The World",            blurb: "How supes went public. STRATA. The Convention. 2026." },
    { id: "history",   n: "02", title: "The Programme",        blurb: "Sixty years of preparation. Project Cradle. The pipeline." },
    { id: "vanguard",  n: "03", title: "The Vanguard",         blurb: "Paragon, Vigil, Aegis, Switchboard. The four." },
    { id: "houses",    n: "04", title: "The Houses",           blurb: "Valaris, Orenne, Saberis, Grimere. Pick yours." },
    { id: "dean",      n: "05", title: "The Dean",             blurb: "Dr. Devika Ravindrakumar. Fifteen metres. The line." },
    { id: "hounds",    n: "06", title: "H.O.U.N.D.S.",         blurb: "Campus security — and the unit behind the uniform." },
    { id: "incidents", n: "07", title: "Cassandra",            blurb: "August 2023. The press cycle no one survived." },
  ];

  return (
    <div className="lore lore-start">
      <section className="lore-block lore-start-grid">
        <div className="ls-col ls-col-read">
          <div className="lore-eyebrow">Seven pages, in order &middot; click any to read</div>
          <h3 className="lore-h">Read in <span className="accent">order.</span></h3>
          <ol className="ls-read">
            {READ_ORDER.map(r => (
              <li key={r.id}>
                <button className="ls-read-item" onClick={() => onJump(r.id)}>
                  <span className="ls-read-n">{r.n}</span>
                  <span className="ls-read-text">
                    <strong>{r.title}</strong>
                    <em>{r.blurb}</em>
                  </span>
                  <span className="ls-read-go">&rarr;</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="ls-col ls-col-pitch">
          <div className="lore-eyebrow">If you have 30 seconds</div>
          <h3 className="lore-h">The <span className="accent">pitch.</span></h3>
          <p className="ls-pitch">
            It is 2026. About two thousand registered superhumans live in the UK, owned in one sense or another by <strong>STRATA International</strong>. The four most famous are the <strong>Vanguard</strong>. Most came out of <strong>Calderyn College</strong> in Greenwich. You&rsquo;re about to play a student, a faculty member, or someone in the world around the school. Everyone is in the registry. That&rsquo;s the room.
          </p>

          <div className="lore-eyebrow" style={{marginTop:"24px"}}>Glossary &middot; the essentials</div>
          <dl className="ls-gloss">
            <div><dt>STRATA</dt><dd>UK&rsquo;s chartered authority over powered citizens. Owns the contracts.</dd></div>
            <div><dt>Vanguard</dt><dd>The capped four-person flagship unit. Household names.</dd></div>
            <div><dt>Cradle</dt><dd>A generation of supes. Cradle I (1968) &middot; II (1988) &middot; III (2008 &mdash; current students).</dd></div>
            <div><dt>A&ndash;D List</dt><dd>STRATA&rsquo;s tier rating. A is primetime; D is regional. Locked in sophomore year.</dd></div>
            <div><dt>Heroes / Sidekicks</dt><dd>The two academic tracks. Camera-facing weapon class vs partnered support class.</dd></div>
          </dl>
        </div>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">Pick a house &middot; quick look</div>
        <h3 className="lore-h">Four houses, four <span className="accent">virtues.</span></h3>
        <div className="ls-houses">
          {houses.map(h => (
            <button key={h.id} className="ls-house" onClick={() => onJump("houses")} style={{"--hc": h.bg}}>
              <img src={h.crest} alt={h.name + " crest"} loading="lazy"/>
              <div className="ls-house-text">
                <div className="ls-house-virtue">House of {h.virtue}</div>
                <div className="ls-house-name">{h.name}</div>
                <div className="ls-house-motto">&ldquo;{h.motto}&rdquo;</div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function LoreWorld(){
  return (
    <div className="lore">
      <section className="lore-block lore-intro">
        <div className="lore-intro-stamp">PUBLIC RECORD · ORIENTATION READING</div>
        <h2 className="lore-intro-title">It is 2026, and there are <span className="accent">gods</span> walking around.</h2>
        <p className="lore-lead">
          Nobody calls them gods, of course. They are called superhumans, or supes, or — if
          the papers are feeling poetic — the powered. But people pray to them. There are
          letters that begin <em>we prayed for someone like you</em>, and small shrines in
          suburban hallways with their photographs in them, and the distinction between a
          god and a thing-people-pray-to has always been thinner than theologians like to
          admit.
        </p>
        <p className="lore-lead">
          This is new. Eleven years ago, the world's first public hero team walked out onto
          a stage in west London, and the world has not been quite the same since. Before
          that, supes existed only as rumour and classified file. After, they existed on
          lunchboxes.
        </p>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">STRATA International</div>
        <h3 className="lore-h">Your school. Your <span className="accent">agent</span>. Your government.</h3>
        <p className="lore-p">
          The company that arranged this is called <strong>STRATA International</strong>.
          The acronym stands for Superhuman Talent Regulation, Advancement, Training, and
          Administration, though the people who chose the word chose it for the way it
          sounded and built the meaning afterwards. The marketing department has not had to
          spell it out in twenty years. The acronym is more valuable than the words inside
          it.
        </p>
        <p className="lore-p">
          STRATA is chaired by <strong>Silas Strathe</strong>, who is seventy-eight and tired,
          and run, publicly, by his son <strong>Felix</strong>, who is fifty-three and is
          not. Between them they own, in one sense or another, almost every working
          superhuman in the Western world. If you are powered in Britain, STRATA is your
          school and your agent and your employer and your liaison to the government, often
          in the same week.
        </p>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">The Calderyn Institute, 1965</div>
        <h3 className="lore-h">Greenwich. Sixty-one years on.</h3>
        <p className="lore-p">
          The Calderyn Institute was founded in 1965, in Greenwich, as a defence-funded
          medical research compound. It became <strong>Calderyn College for the Powered</strong> as
          STRATA grew around it, and it sits today on the same Greenwich campus the Institute
          has occupied for sixty-one years. It teaches powered young adults between the ages
          of eighteen and twenty-two. The brochures say <em>excellence, responsibility,
          legacy, service</em>, in that order, in a serif font.
        </p>
        <p className="lore-p">
          Calderyn does not fail students. It <em>reassigns</em> them. Some graduate into
          heroes. Some graduate into sidekicks. Some are quietly rerouted into STRATA's
          private divisions and never appear in a press release again. Some are told, gently,
          that their abilities are unstable, or unattractive, or insufficiently insurable, and
          offered other careers. Final-years have all noticed which classmates have stopped
          appearing in the cohort photographs. None of them say so out loud.
        </p>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">Geneva, 2009</div>
        <h3 className="lore-h">The pipeline closed before it ever <span className="accent">opened</span>.</h3>
        <p className="lore-p">
          For sixty years, Calderyn's reason to exist was a war that never came. Powered
          persons were prepared for armed conflict — trained, conditioned, classified into
          tiers, slotted into doctrine — but no signatory state ever actually deployed one.
          The Cold War ended without the call coming. The post-Soviet decades produced
          incidents, never mobilisations. By 2009, the world's governments looked at what
          had been quietly built and signed the <strong>Geneva Powered Persons
          Convention</strong>, which forbade superhumans from fighting in wars before the
          first one had fought in one.
        </p>
        <p className="lore-p">
          Heroes do civilian work now — disasters, hostage situations, the rescue of cats
          from particularly tall trees. <em>Officially</em> is doing a great deal of work
          in that sentence. What the Convention closed was a <em>future</em>, not a past.
          The supes Calderyn had been making for sixty years had been made for a use that
          was now illegal before they had ever been used for it.
        </p>
      </section>
    </div>
  );
}

const LORE_VG_ROSTER = [
  {
    key: "paragon", alias: "PARAGON", name: "Adrian Valaris", age: 45,
    tag: "The symbol", color: "#c41a1a", sfx: "KRRSH",
    portrait: "https://i.ibb.co/Tx8LND9D/884dff81-b7c4-448a-be91-1d79b440f8e3.png",
  },
  {
    key: "vigil", alias: "VIGIL", name: "Caius Saberis", age: 42,
    tag: "The strategist", color: "#15803d", sfx: "SHRRK",
    portrait: "https://i.ibb.co/SDY1sLN8/2377bc73-8c3f-40c6-951d-7f0365013c2a.png",
  },
  {
    key: "aegis", alias: "AEGIS", name: "Margery Orenne", age: 39,
    tag: "The rescuer", color: "#d4901a", sfx: "WHAM",
    portrait: "https://i.ibb.co/fKV1tKH/ccf8e712-87c2-4da0-af44-d290385a7e8c.png",
  },
  {
    key: "switchboard", alias: "SWITCHBOARD", name: "Iris Grimere", age: 35,
    tag: "The architect", color: "#1e40af", sfx: "BZZZT",
    portrait: "https://i.ibb.co/LzyQcRcL/a18a925b-91f4-45d8-b2e3-66821aaf9661.png",
  },
];

function LoreVgDossierBody({k}){
  switch(k){
    case "paragon": return <>
      <p className="lore-vg-dossier-p">The sun feeds him. Nothing measurable runs him down. His strength has no documented ceiling. His flight is officially uncatalogued because the equipment that tries to clock him fails when he reaches full speed. Heat vision in coherent ranged beams, calibrated by something the medical wing has elected to call <em>intent</em> because no one has come up with a better word. His senses run well beyond baseline — he can pick a single conversation out of a crowded street from above, read a license plate at altitude, hear a heartbeat through a wall. Whether that's a separate ability or simply what comes with the rest of him, the medical wing has stopped trying to settle.</p>
      <p className="lore-vg-dossier-p">In person he is quiet, unfailingly polite, and stands up when you walk into a room. He is the most beloved man in Britain.</p>
    </>;
    case "vigil": return <>
      <p className="lore-vg-dossier-p">Precognition, in a window ninety seconds wide and roughly thirty metres deep. He sees every branch of every possible action laid out around him with the clarity of sheet music. The bullet leaving the barrel. The door opening. The word leaving the mouth. He picks the branch he wants. The other branches collapse and are not.</p>
      <p className="lore-vg-dossier-p">Fights with a folded-steel longsword that Switchboard made him in 2018, and which he has never named. <em>Naming weapons</em>, he said in one of his rare interviews, <em>is something young men do.</em> The cost is migraines. He has been wrong twice in eleven years.</p>
    </>;
    case "aegis": return <>
      <p className="lore-vg-dossier-p">Her body does not break the way bodies break. Blades go in. Bullets go in. The damage simply does not propagate outward through her the way damage is supposed to. She bleeds, but the bleeding stops sooner than it ought. She heals six times faster than is decent.</p>
      <p className="lore-vg-dossier-p">Cruises at three hundred miles an hour, holds position indefinitely, lifts roughly four hundred kilograms without breaking a sweat. Paragon saves the world. Aegis saves the people in it. Her record under field conditions is fifty-one hours. She broke nine bones during it and did not notice until the third day.</p>
    </>;
    case "switchboard": return <>
      <p className="lore-vg-dossier-p">Technokinesis. She speaks to electronics, by thought, in a range that has no precise edge but seems to extend as far as she can perceive a device. She does not need to touch them. She does not need to see them. They listen.</p>
      <p className="lore-vg-dossier-p">Not physically superhuman. Strength, durability, and reflexes are baseline human, and her health is, if anything, slightly under, because she forgets to eat. Every piece of gear the Vanguard uses is hers. Vigil's sword. Aegis's flight harness. Paragon's gauntlets. Three cats, named after pre-Socratic philosophers.</p>
    </>;
  }
  return null;
}

function LoreVanguard(){
  const [hovered, setHovered] = useState(null);
  return (
    <div className="lore">
      <section className="lore-block lore-intro">
        <div className="lore-intro-stamp">PUBLIC RECORD · ACTIVE ROSTER</div>
        <h2 className="lore-intro-title">The <span className="accent">Vanguard.</span></h2>
        <p className="lore-lead">
          There are four of them. They have been a team since March 2015, and by every public
          measurement anyone has dared take, they are the four most powerful superhumans
          alive.
        </p>
      </section>

      {/* CHAMPION SELECT strip — full-bleed portraits, comic chrome,
          click jumps to the dossier below. */}
      <section className="lore-block lore-vg-strip-block">
        <div className={"lore-vgcs" + (hovered != null ? " has-focus" : "")}>
          {LORE_VG_ROSTER.map((v, i) => (
            <a
              key={v.key}
              href={"#vg-" + v.key}
              className={"lore-vgcs-panel" + (hovered === i ? " is-focus" : "")}
              style={{"--vg-color": v.color, "--vg-i": i}}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("vg-" + v.key);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <div className="lore-vgcs-img">
                <img src={v.portrait} alt={v.alias} loading="lazy"/>
                <div className="lore-vgcs-halftone" aria-hidden="true"/>
                <div className="lore-vgcs-glow" aria-hidden="true"/>
                <div className="lore-vgcs-scan" aria-hidden="true"/>
              </div>
              <div className="lore-vgcs-sfx" aria-hidden="true">{v.sfx}!</div>
              <div className="lore-vgcs-issue" aria-hidden="true">NO. {String(i + 1).padStart(2, "0")}</div>
              <div className="lore-vgcs-plate">
                <div className="lore-vgcs-tag">{v.tag}</div>
                <h3 className="lore-vgcs-alias">{v.alias}</h3>
                <div className="lore-vgcs-name">{v.name} · {v.age}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* DOSSIERS — readable long-form profiles, one per operator */}
      {LORE_VG_ROSTER.map((v, i) => (
        <section
          key={v.key}
          id={"vg-" + v.key}
          className="lore-block lore-vg-dossier"
          style={{"--vg-color": v.color}}
        >
          <header className="lore-vg-dossier-head">
            <span className="lore-vg-dossier-no">№ {String(i + 1).padStart(2, "0")}</span>
            <span className="lore-vg-dossier-stamp">DOSSIER</span>
            <span className="lore-vg-dossier-rule" aria-hidden="true"/>
            <span className="lore-vg-dossier-tag">{v.tag}</span>
          </header>
          <h3 className="lore-vg-dossier-alias">{v.alias}</h3>
          <div className="lore-vg-dossier-name">{v.name} · {v.age}</div>
          <LoreVgDossierBody k={v.key}/>
        </section>
      ))}
    </div>
  );
}

function LoreHouses(){
  const houseById = {};
  D.houses.forEach(h => { houseById[h.id] = h; });

  return (
    <div className="lore">
      <section className="lore-block lore-intro">
        <div className="lore-intro-stamp">PUBLIC RECORD · ORIENTATION READING</div>
        <h2 className="lore-intro-title">The <span className="accent">Houses.</span></h2>
        <p className="lore-lead">
          There are four of them, named in 2020 after the four members of the Vanguard.
          STRATA presents this as ancient tradition, and the gold leaf in the dining hall
          is very convincing, but the names are six years old. The students will tell you
          the rivalries are real anyway, because eighteen-year-olds will make a rivalry out
          of weather.
        </p>
        <p className="lore-lead">
          Three of the four namesakes attended Calderyn as students. The fourth did not.
        </p>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">2020 · Branding Initiative</div>
        <h3 className="lore-h">Older than your <span className="accent">memory</span> of them. Younger than the <span className="accent">school.</span></h3>
        <p className="lore-p">
          Calderyn did not have houses before 2020. The house system was created after the
          Vanguard became the most famous heroes in the world — partly as a student-organisation
          framework the institution genuinely needed, and partly as STRATA propaganda. Each
          house was named after one member of the Vanguard, turning four <strong>living
          corporate assets</strong> into campus tradition almost overnight.
        </p>
        <p className="lore-p">
          The houses are not ancient. They are <em>brand architecture.</em> STRATA looked at the
          four people who sold the most merchandise, the most magazine covers, and the most
          rolling-news minutes in the country, and decided the students should live inside
          their mythology. The crests were commissioned, the dining-hall banners were aged
          chemically, and the colours were licensed back to STRATA's apparel division in the
          same calendar year.
        </p>
        <p className="lore-p">
          The students don't care. Six years is enough. The rivalries are real. The pride is
          real. The branding worked exactly as intended — which is, perhaps, the most STRATA
          thing about the entire system.
        </p>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">House at a Glance</div>
        <div className="house-glance">
          <table className="house-glance-tbl">
            <thead>
              <tr>
                <th>House</th>
                <th>Virtue</th>
                <th>Mascot</th>
                <th>Known For</th>
                <th>Rivalry</th>
              </tr>
            </thead>
            <tbody>
              {D.houses.map((h) => {
                const rivalName = h.rival && houseById[h.rival] ? houseById[h.rival].name : "N/A";
                return (
                  <tr key={h.id}>
                    <td>
                      <span className="house-glance-name" style={{color: h.bg}}>{h.name}</span>
                    </td>
                    <td>
                      <span className="house-glance-virtue">{h.virtue}</span>
                    </td>
                    <td>
                      <span className="house-glance-mascot">{h.animal}</span>
                    </td>
                    <td>
                      <span className="house-glance-traits">
                        {h.traits.join(" · ")}
                      </span>
                    </td>
                    <td>
                      <span className="house-glance-rival">vs {rivalName}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="lore-block lore-houses-grid">
        <div className="lore-house-placement-note">
          <strong>House placement is not a choice — it is an assignment.</strong> Every student undergoes a battery of mental and physical assessments before arriving on campus. The results determine your house, and your house is printed on your acceptance letter. You know before you arrive. The college does not sort by preference; it sorts by fit. Your power, your instincts, and what the assessors read in how you handle pressure all go into that decision.
        </div>
        <article className="lore-house" style={{borderTopColor: "#c41a1a"}}>
          <div className="lore-house-hd">
            <img src="https://i.ibb.co/G4q9m34x/Valaris.png" alt="Valaris crest" className="lore-house-crest" loading="lazy"/>
            <div>
              <div className="lore-house-virtue">House of Justice</div>
              <h3 className="lore-house-name">VALARIS</h3>
              <div className="lore-house-namesake">Adrian Valaris · Paragon</div>
            </div>
          </div>
          <p className="lore-house-desc">
            There is a story they tell about the first Valaris student — or maybe the
            hundredth, the stories blur in the retelling — who walked into a situation
            that everyone else had quietly decided was someone else's problem. They went
            in anyway. They did not walk back out the same. Valaris students move toward
            the thing. Not because they are fearless, but because watching someone else
            do nothing turns out to be the thing they cannot stand. Saberis, across the
            quad, has already mapped a route around the problem. Valaris has already
            gone through the door.
          </p>
          <p className="lore-house-desc">
            Adrian Valaris never attended this school as a student. There is no portrait
            of him as a teenager here because <em>no such portrait exists.</em> The college
            has been asked about this, once, and did not answer the question. The Valaris
            students have made their peace with it. They have also, quietly, decided it
            means they had to earn the name themselves.
          </p>
        </article>

        <article className="lore-house" style={{borderTopColor: "#15803d"}}>
          <div className="lore-house-hd">
            <img src="https://i.ibb.co/qMry0fF2/Saberis.png" alt="Saberis crest" className="lore-house-crest" loading="lazy"/>
            <div>
              <div className="lore-house-virtue">House of Prudence</div>
              <h3 className="lore-house-name">SABERIS</h3>
              <div className="lore-house-namesake">Caius Saberis · Vigil</div>
            </div>
          </div>
          <p className="lore-house-desc">
            Saberis students already know how this ends. They do not walk into a room
            — they arrive in one, which is a different thing entirely. Patience here
            is not a virtue. It is a tool, precise and quiet, unsheathed only when the
            moment has been chosen rather than stumbled into. This makes them
            exceptional operators. It also makes them difficult to fully trust —
            Valaris included, which Saberis students consider Valaris's problem, not
            theirs. They are not unfriendly. They are simply three moves into a
            conversation while everyone else is still deciding whether to sit down.
          </p>
          <p className="lore-house-desc">
            Caius Saberis kept his trophies in storage. The college moved them to the
            fencing salle after he graduated, and Saberis students are expected to know
            which year he won each one. He has never come back to see them. The Saberis
            students consider this the most Saberis thing about him, and they mean it
            as a compliment.
          </p>
        </article>

        <article className="lore-house" style={{borderTopColor: "#d4901a"}}>
          <div className="lore-house-hd">
            <img src="https://i.ibb.co/0RQXNgXg/Orenne.png" alt="Orenne crest" className="lore-house-crest" loading="lazy"/>
            <div>
              <div className="lore-house-virtue">House of Fortitude</div>
              <h3 className="lore-house-name">ORENNE</h3>
              <div className="lore-house-namesake">Margery Orenne · Aegis</div>
            </div>
          </div>
          <p className="lore-house-desc">
            What people get wrong about Orenne is that they confuse warmth for
            softness, and these are not the same thing. Orenne students remember your
            name in the second week. They show up — to the training session nobody
            organised, to the match nobody came to, to the quiet crisis you mentioned
            once in passing and assumed no one had heard. The kitchen in their common
            room is better than anywhere else at Calderyn. This is not an accident.
            Grimere's common room looks like a controlled explosion. Orenne's looks
            like somewhere you would actually want to be.
          </p>
          <p className="lore-house-desc">
            Margery Orenne was here from 2005 to 2009, and she comes back every
            September — gives the welcome address, then stays for hours talking to
            whoever wants to. She is the only Vanguard member the students call by
            first name. The Orenne students are quietly proud of this in a way they
            would never say out loud, which is also very Orenne.
          </p>
        </article>

        <article className="lore-house" style={{borderTopColor: "#1e40af"}}>
          <div className="lore-house-hd">
            <img src="https://i.ibb.co/PGhrJBBm/Grimere.png" alt="Grimere crest" className="lore-house-crest" loading="lazy"/>
            <div>
              <div className="lore-house-virtue">House of Temperance</div>
              <h3 className="lore-house-name">GRIMERE</h3>
              <div className="lore-house-namesake">Iris Grimere · Switchboard</div>
            </div>
          </div>
          <p className="lore-house-desc">
            There is a light on in the Grimere labs at three in the morning. There is
            almost always a light on in the Grimere labs at three in the morning. The
            engineers, the artists, the theorists, the people whose power arrived
            without a manual — this is where they ended up. If you cannot explain what
            you do in a single sentence, Grimere has a room for you. Orenne finds them
            inconsistent. Valaris finds them impractical. Saberis finds them
            fascinating and would never say so. Grimere students are largely
            unbothered. They have things to build.
          </p>
          <p className="lore-house-desc">
            Iris Grimere was here from 2009 to 2013, and never quite left — she runs
            the diagnostic wing now, which has, by the most conservative count, saved
            four hundred student lives. She is the only Vanguard member with an active
            office at a college she attended. She shows up. She answers emails. The
            Grimere students are insufferable about it in a way that is entirely earned.
          </p>
        </article>
      </section>
    </div>
  );
}

function LoreDean(){
  return (
    <div className="lore">
      <section className="lore-block lore-intro lore-intro-portrait">
        <div className="lore-intro-portrait-wrap">
          <div className="lore-intro-portrait-text">
            <div className="lore-intro-stamp">PUBLIC RECORD · ORIENTATION READING</div>
            <h2 className="lore-intro-title">The <span className="accent">Dean.</span></h2>
            <p className="lore-lead">
              Her name is <strong>Dr. Devika Ravindrakumar</strong>. She is fifty-three, born in
              Manchester, and her power, when she chooses to use it, is to switch other powers
              off.
            </p>
          </div>
          <figure className="lore-intro-portrait-fig">
            <img src="https://i.ibb.co/3mt7Ny2n/136a0506-3ef1-457a-a7dc-ae03bf182303.png" alt="Dr. Devika Ravindrakumar — Dean of Calderyn" loading="lazy"/>
            <figcaption>
              <span className="lore-intro-portrait-cap">Dean</span>
              <span className="lore-intro-portrait-name">Devika Ravindrakumar</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">Power · Field Nullification</div>
        <h3 className="lore-h">Within fifteen metres, the line is <span className="accent">drawn</span>.</h3>
        <p className="lore-p">
          Within fifteen metres of her, when she projects the field, no superhuman ability
          functions. There is no fading. There is no warning. The line between powered and
          not is a line, and she draws it.
        </p>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">Method</div>
        <h3 className="lore-h">She places her hands flat on the desk.</h3>
        <p className="lore-p">
          Students are afraid of her before they meet her, and more afraid afterwards. She
          does not raise her voice. She places her hands flat on the desk before she speaks,
          and the room becomes quiet in a way it had not previously known it could become.
          She knows, from her own life, what it is to be helpless, and she gives that
          knowledge to other people, surgically, when she needs something from them. She has
          made a final-year cry by switching the field on for half a second and then off
          again, simply to remind him the option was on the table.
        </p>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">2014 — The Vanguard Shortlist</div>
        <h3 className="lore-h">Rejected by <span className="accent">marketing.</span></h3>
        <p className="lore-p">
          She was on the shortlist for the Vanguard in 2014. The marketing team rejected
          her. <em>A hero whose power was taking other heroes' powers away</em>, they said,
          was a difficult sell. She has never said, in any interview, whether she regrets
          it.
        </p>
      </section>
    </div>
  );
}

function LoreHounds(){
  return (
    <div className="lore">
      <section className="lore-block lore-intro">
        <div className="lore-intro-stamp">PARTIAL RECORD · SECURITY ADDENDUM</div>
        <h2 className="lore-intro-title">The <span className="accent">Hounds.</span></h2>
        <p className="lore-lead">
          Calderyn doesn't keep a security team so much as a campus police force —
          pressed navy, patrol routes that never quite repeat, checkpoints at the gates,
          incident reports filed on time and read by people above the school. They are
          not cruel and they are not friendly. They are police: courteous when courtesy
          is efficient, cold the rest of the time, and loyal to exactly two things —
          STRATA, and the Dean. The force is run by a calm, unhurried man
          named <strong><a href="https://roleplay.chat/profile.php?user=Gauging+The+Room" target="_blank" rel="noopener noreferrer">Nathan Maddock</a></strong> — Security
          Chief, listed in the faculty registry between the Chief Medical Officer and the
          Head Groundskeeper, as ordinary as a man can be made to look on paper.
        </p>
        <p className="lore-lead">
          The paper is doing a lot of work.
        </p>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">The Acronym</div>
        <h3 className="lore-h">Hostile Operations Unit for <span className="accent">Neutralizing</span> Dangerous Superhumans.</h3>
        <p className="lore-p">
          STRATA solves most powered problems the company way: a contract, a containment
          order, a reassignment, a door in the STRATA wing that nobody photographs. The
          H.O.U.N.D.S. exist for the remainder — the small, carefully unpublished list of
          superhumans who cannot be contained, cannot be bought, and cannot be left where
          they are. The unit's name says <em>neutralizing</em> because a lawyer chose the
          word, and the lawyer chose well: it is accurate, and it sounds like paperwork.
          When the Hounds are sent, every other option has already been tried, or already
          been ruled out, and the file that comes back is short.
        </p>
        <p className="lore-p">
          Maddock founded the unit and still leads it. The campus security post is not a
          cover story so much as a second, true job — the school gets a genuinely
          first-rate security chief, and STRATA gets its best tracker living inside the
          densest concentration of young powered talent in Europe. Neither party considers
          this a coincidence. Neither party puts it in writing.
        </p>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">The Founder · GAUGE</div>
        <h3 className="lore-h">He reads what you are. Then he reads what you'll <span className="accent">become.</span></h3>
        <p className="lore-p">
          On the registry, Maddock — callsign <strong>Gauge</strong> — is a C-List aura
          analyst, and the rating is honest about the wrong thing. He cannot level a city
          block. What he can do is look at a person and read the make and model: what the
          power is, how strong it runs, where it fails, and — the part that matters to his
          employers — how strong it is going to get. He tracks an aura signature for a
          mile. He reads the trace a person leaves in a room for a day after they've left
          it. A C-List threat assessment with A-List consequences, walking the quad twice
          a morning, nodding at nobody, reading everyone.
        </p>
        <p className="lore-p">
          Old injuries flare when the weather turns, and crowds run loud for him — a
          campus full of untrained auras is, by his own account, like living over a
          nightclub. He has never once filed a complaint about it. The Hounds' founder
          considers the noise useful.
        </p>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">The Other Leash</div>
        <h3 className="lore-h">Not every hunt ends with a <span className="accent">body.</span></h3>
        <p className="lore-p">
          Some hunts end with an enrolment. When a power profile crosses the right desk —
          a manifestation in a country with no programme, a talent the board wants inside
          the wall before a competitor or a cause finds it — the Hounds are the ones sent
          to bring the subject in. The school calls it recruitment outreach. The
          prospectus calls it scouting. The students it happens to mostly don't know it
          happened to them, and the ones who do know tend to be the quietest people in
          the room about it.
        </p>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">What Is On Record</div>
        <h3 className="lore-h">A payroll line and a kennel nobody <span className="accent">tours.</span></h3>
        <p className="lore-p">
          On record: Calderyn College employs a campus security office, headed by
          N. Maddock, budgeted through facilities. Not on record: the second budget line,
          routed through STRATA internal operations; the strength of the unit; where it
          kennels between deployments; or how many times it has deployed since Geneva.
          Students who ask are told campus security exists to keep them safe, which is
          true. Students who keep asking are brought in for a conversation with the
          Security Chief — short, exact, nothing in it you could file a complaint about
          — and read, top to bottom, current and projected, on the walk to the door.
          The Hounds wear Calderyn colours, but the leash runs to STRATA, and on this
          campus the hand on it is the Dean's. Nobody else's name opens their doors.
        </p>
      </section>
    </div>
  );
}

function LoreHistory(){
  return (
    <div className="lore">
      <section className="lore-block lore-intro">
        <div className="lore-intro-stamp">PUBLIC RECORD · ORIENTATION READING</div>
        <h2 className="lore-intro-title">Where the <span className="accent">powered</span> come from.</h2>
        <p className="lore-lead">
          Powered people are not born randomly. They are made. Across three quarters of
          a century, in maternity wards and fertility clinics that did not advertise what
          they were doing, the Strathe family ran a series of medical trials they called
          <em> Project Cradle</em>. Almost every working superhuman in Britain came out
          of one of its phases. The brochure does not mention this. The brochure mentions
          excellence, responsibility, legacy, and service.
        </p>
        <p className="lore-lead">
          The compound is called <strong>Strathogen</strong>. It does not give a foetus
          powers. It removes the body's habit of saying no — stops the genetic instructions
          a foetus carries from being edited down. Whatever the child might have been at
          the outermost edge of its possibility is what the child becomes. The results are
          enormously variable. That is, eventually, the point.
        </p>
        <p className="lore-lead">
          The reason it was made is the part the brochures most carefully do not mention.
          For the first sixty years of the programme, supes were being prepared for
          armed service — Cold War contingency, defence-pipeline thinking, a strategic
          asset class no government wanted to be the second to develop. None of them were
          ever actually deployed. The wars the programme was built for did not come, and
          the wars that did come arrived in formats supes could not legally be used in.
          By the time Geneva was signed in 2009, the entire enterprise had spent six
          decades preparing children for a job that ultimately never existed.
        </p>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">1948 — 1953 · Pre-Cradle</div>
        <h3 className="lore-h">Three institutions. <span className="accent">No consent worth the paper.</span></h3>
        <p className="lore-p">
          Eldred Strathe's earliest trials ran out of three institutions Calderyn either
          owned or could lean on: <strong>St. Berenice's Maternity Hospital</strong> in
          Camden, the <strong>Marwell Fertility Clinic</strong> in Edinburgh, and a
          Royal Air Force family-care scheme operating out of three bases in the Home
          Counties. Mothers were not chosen at random. They were chosen for desperation,
          isolation, or both.
        </p>
        <p className="lore-p">
          Some were told they were receiving a new prenatal vitamin protocol. Some were
          told they were part of a study on miscarriage prevention, which was true in the
          sense that the survival rate was monitored, and untrue in every other sense.
          Some were told nothing. The consent forms, where they existed, were drafted by a
          barrister named Henry Pell, who later told a board meeting that he had written
          them in such a way that almost any reasonable person would sign them and almost
          no court would later be able to use them.
        </p>
        <p className="lore-p">
          The first children began manifesting between ages three and seven. A boy in
          Tooting set his bedroom curtains alight without touching them. A girl in Glasgow
          stopped eating solid food at four and continued growing normally for another
          decade. Twins in Portsmouth, when separated by more than a quarter mile, became
          uncontrollably violent until reunited; their mother killed herself in 1959 and
          left a note that mentioned only that she was tired. Calderyn collected them.
          Calderyn always collected them.
        </p>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">The Three Phases</div>
        <h3 className="lore-h">Cradle, <span className="accent">formalised.</span></h3>
        <p className="lore-p">
          When Eldred founded the Calderyn Institute proper in 1965, the trials moved
          inside it and acquired a name and a number. Cradle has run, in three overlapping
          phases, ever since. Phase three is still running.
        </p>

        <div className="prog-phases" role="list">
          <article className="prog-phase" role="listitem">
            <div className="prog-phase-era">Phase I · Eldred</div>
            <div className="prog-phase-name">Cradle I</div>
            <div className="prog-phase-years">1968 — 1975</div>
            <p className="prog-phase-body">
              Built for a war that never came. <strong>STG-1</strong> proved too aggressive
              — it killed nearly all foetuses carried to term. <strong>STG-7</strong> was
              stabilised by the trial's end. The few surviving Cradle I children became the
              first generation of British supes, conditioned from childhood for a defence
              role that the Cold War never actually called on them to fill. The original
              Vanguard came out of late Cradle I.
            </p>
            <div className="prog-phase-stat">
              <span><span className="prog-phase-stat-k">Compound:</span> STG-1 → STG-7</span>
            </div>
          </article>

          <article className="prog-phase" role="listitem">
            <div className="prog-phase-era">Phase II · Silas</div>
            <div className="prog-phase-name">Cradle II</div>
            <div className="prog-phase-years">1980 — 1995</div>
            <p className="prog-phase-body">
              Silas, growing into the role of his father's successor, refined and expanded
              the programme. Cradle II reached further: <strong>NHS-affiliated maternity
              wings</strong>, private fertility clinics, a network the original trials never
              had. The intended destination was still defence. The intended destination
              was still, as it had been for fifteen years, theoretical. By 1995, with no
              war on the horizon, the question of what to do with the children quietly
              stopped being only the Ministry of Defence's question.
            </p>
            <div className="prog-phase-stat">
              <span><span className="prog-phase-stat-k">Compound:</span> STG-7 (refined)</span>
            </div>
          </article>

          <article className="prog-phase" role="listitem">
            <div className="prog-phase-era">Phase III · Felix</div>
            <div className="prog-phase-name">Cradle III</div>
            <div className="prog-phase-years">2000 — present</div>
            <p className="prog-phase-body">
              The modern programme. Administered globally through <strong>Aldwell Reproductive
              Health</strong>, a STRATA-owned chain of around forty fertility clinics across
              the UK, Western Europe, and the US east coast. The current Vanguard came out
              of this. New supes are still being born from this in 2026. Most of the students
              currently at Calderyn are Cradle III.
            </p>
            <div className="prog-phase-stat">
              <span><span className="prog-phase-stat-k">Status:</span> Active</span>
            </div>
          </article>

          <article className="prog-phase" role="listitem">
            <div className="prog-phase-era">Phase IV · TBA</div>
            <div className="prog-phase-name">Cradle IV</div>
            <div className="prog-phase-years">— · in board memoranda</div>
            <p className="prog-phase-body">
              Not formally launched. Mentioned in board minutes from 2024 onward, never
              with detail. Felix is for. Silas is undecided. The proposed jurisdiction is
              outside the EU, outside the OECD, and outside any treaty that has so far
              survived the question <em>but what if the children were ours from the
              beginning?</em>
            </p>
            <div className="prog-phase-stat">
              <span><span className="prog-phase-stat-k">Status:</span> Proposed</span>
            </div>
          </article>
        </div>
      </section>
      <section className="lore-block">
        <div className="lore-eyebrow">Casting Rule · Strict</div>
        <h3 className="lore-h">Cradle bands are <span className="accent">hard limits.</span></h3>
        <p className="lore-p">Cradle bands are hard limits. A character's age must fall inside the age range of their Cradle phase — Cradle III runs roughly ages 0–26, Cradle II 31–46, and Cradle I 51–58. Powers track the Cradle a character was born into, so anyone with abilities is expected to sit in the band that matches their Cradle. <strong>The Dean</strong> and <strong>Vale</strong> are the only Cradle I characters above 46. <strong>Paragon</strong> is a Cradle II character (age 31–46) who received the Cradle I injection — a Cradle II body with Cradle I powers, which is why he sits in the 31–46 band even though his power profile reads as Cradle I. Submissions outside those bands will not be accepted — please <a href="#lore" style={{color:"#c83030",textDecoration:"underline"}}>read the lore</a> (start with <em>The Programme</em>) before submitting.</p>
      </section>                                                                                                                

      <section className="lore-block">
        <div className="lore-eyebrow">2009 — Geneva</div>
        <h3 className="lore-h">The pivot from <span className="accent">soldiers</span> to celebrities.</h3>
        <p className="lore-p">
          The <strong>Geneva Powered Persons Convention</strong> banned superhuman
          participation in armed conflict and required national registration. The
          intended end-use that had been Cradle's whole point for forty years —
          deployment in war — was outlawed before it had ever occurred. Forty years of
          children had been raised, trained, classified, and maintained for a role no
          government had ever quite been willing to give them, and which was now legally
          impossible. Most adult Cradle I and II graduates had spent their careers in
          standby readiness, defence consulting, or quiet specialist work; after Geneva,
          most were absorbed into STRATA's internal operations division, into private
          security, or into roles inside the Institute itself. Some went rogue. Most did
          not. The ones who did are accounted for in another file.
        </p>
        <p className="lore-p">
          Six years later, Silas handed his son the company so Felix could be the public
          face of the new era. The Vanguard launched the same year. The old guard — the
          Cradle I and II adults who had been raised for a war that never arrived —
          understood exactly what was being signalled. The institution that had spent
          their childhoods preparing them for armed service was now choosing, for the
          generation behind them, to make celebrities instead.
        </p>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">Reading List</div>
        <h3 className="lore-h">What is on record.</h3>
        <p className="lore-p">
          None of the above is on record. There is a <em>Wikipedia</em> page for the
          Calderyn Institute that mentions defence research and educational reform and
          does not mention Strathogen. There is a 2018 BBC documentary titled <em>The
          Cradle of British Heroism</em> which is, unintentionally, named accurately, and
          which the Strathe family privately sponsored. There is a 2022 book by a
          journalist named Iain Halloway who got further than anyone had before; it sold
          poorly; he died in a road accident the year it came out. The accident was an
          accident. As far as anyone is willing to commit to paper.
        </p>
      </section>
    </div>
  );
}

function LoreIncidents(){
  return (
    <div className="lore">
      <section className="lore-block lore-intro">
        <div className="lore-intro-stamp">RESTRICTED · BOARD-LEVEL CIRCULATION</div>
        <h2 className="lore-intro-title">The MV <span className="accent">Cassandra.</span></h2>
        <p className="lore-lead">
          August 2023. A North Sea ferry running its overnight Newcastle to Amsterdam
          route. <strong>Two thousand four hundred and eleven</strong> passengers and crew.
          A Saturday night, peak summer sailing season, the ship at near full capacity.
        </p>
        <p className="lore-lead">
          What happened to the Cassandra is officially <em>the worst peacetime maritime
          disaster since the Titanic</em>. Internally, it is called the Cassandra. It is
          the moment STRATA learned what its most beloved asset was capable of when
          something inside him broke, and chose, in the same week, not to do anything
          about it.
        </p>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">Casefile · 23-AUG-CASS</div>
        <h3 className="lore-h">By the <span className="accent">numbers.</span></h3>
        <div className="case-stats" role="list">
          <div className="case-stat" role="listitem">
            <div className="case-stat-n">2,411</div>
            <div className="case-stat-l">Souls aboard</div>
          </div>
          <div className="case-stat" role="listitem">
            <div className="case-stat-n">2,368</div>
            <div className="case-stat-l">Confirmed dead</div>
          </div>
          <div className="case-stat" role="listitem">
            <div className="case-stat-n">43</div>
            <div className="case-stat-l">Survivors · upper decks</div>
          </div>
          <div className="case-stat" role="listitem">
            <div className="case-stat-n">04:47</div>
            <div className="case-stat-l">GMT · ship lost</div>
          </div>
        </div>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">Two Versions</div>
        <h3 className="lore-h">What the world was told. What the <span className="accent">wreck</span> said.</h3>

        <div className="case-diptych">
          <article className="case-col">
            <div className="case-col-tag">Public Record</div>
            <div className="case-col-h">The hijack.</div>
            <p className="case-col-p">
              The Cassandra was hijacked six hours into the crossing by a heavily armed
              group of approximately fifteen men. Demands have never been made public.
              STRATA dispatched <strong>Adrian</strong>. The world watched on rolling news
              through the night.
            </p>
            <p className="case-col-p">
              Adrian arrived shortly before three in the morning and attempted to retake
              the ship without endangering the passengers. The hijackers had rigged the
              lower decks with explosives. Adrian made the difficult decision to evacuate
              the upper decks first; the explosives detonated before the lower decks could
              be cleared. The Cassandra went down at <strong>04:47 GMT</strong>.
            </p>
            <p className="case-col-p">
              Adrian was filmed at dawn, in the water, recovering bodies. He was filmed for
              <strong> nineteen hours</strong>, without rest. The footage is some of the
              most-watched in broadcasting history.
            </p>
          </article>

          <article className="case-col">
            <div className="case-col-tag">Internal · Iris File</div>
            <div className="case-col-h">There were no <em>explosives.</em></div>
            <p className="case-col-p">
              There may not have been fifteen hijackers. There may not have been hijackers
              at all in the way the press release described them. What is known, to a small
              number of people inside STRATA, is that Adrian arrived on the ship, that
              something happened, and that <strong>the ship went down because Adrian put
              it down</strong>.
            </p>
            <p className="case-col-p">
              The lower decks did not flood. The lower decks were <em>disintegrated</em>.
              The same was true of most of the people on them. Iris's drones reached the
              wreck site before any external agency. Recovery took three days. Iris ran
              the analysis herself.
            </p>
            <p className="case-col-p">
              No shrapnel. No blast patterns. No chemical residues. <strong>A clean curved
              section of the hull simply missing</strong>, as if a god had taken a bite out
              of the ship. She gave the file to Caius. Caius gave it to Silas. The original
              Iris file no longer exists.
            </p>
          </article>
        </div>
      </section>

      <section className="lore-block">
        <div className="case-dossier">
          <div className="case-stamp">EYES ONLY</div>
          <div className="case-dossier-hd">
            <div className="case-dossier-hd-l">What set him off.</div>
            <div className="case-dossier-hd-r">Strathe / Saberis · Closed</div>
          </div>
          <div className="case-dossier-body">
            <p>
              Has never been established. He has not spoken about it. Caius has theories
              and has shared none of them. The leading internal hypothesis, held by
              <strong> Silas</strong> and not by anyone else, is that one of the passengers
              said something to him.
            </p>
            <p>
              Silas has not pursued the hypothesis. Pursuing it would mean asking Adrian
              directly, and asking Adrian directly is a thing Silas has been doing less of,
              year on year, since the Cassandra went down.
            </p>
            <div className="case-quote">
              I need to come home now.
              <span className="case-quote-attr">— Adrian, on STRATA crisis line, 19 minutes after the ship went down</span>
            </div>
          </div>
        </div>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">Aftermath · Public</div>
        <h3 className="lore-h">The most successful crisis-management operation STRATA has ever <span className="accent">run.</span></h3>
        <p className="lore-p">
          The cover story was assembled in under twelve hours. There are now three
          documentaries, two memoirs by survivors, a Royal Commission inquiry that returned
          its findings in 2024 (it accepted the official narrative) and an annual memorial
          service at Newcastle harbour that Adrian attends. He lays a wreath. He weeps.
          The footage circulates every August.
        </p>
        <p className="lore-p">
          The praise has, in the years since, begun to <em>curdle</em>. There are forums
          where people argue the inconsistencies in the official report. There is a man in
          Doncaster who has built a website devoted to it. There is, increasingly, a
          public mood that <em>something is not right</em> about the Cassandra, even
          though no one has been able to articulate what.
        </p>
      </section>

      <section className="lore-block">
        <div className="lore-eyebrow">Aftermath · Internal</div>
        <h3 className="lore-h">Nobody who knows the truth feels <span className="accent">safe.</span></h3>
        <p className="lore-p">
          <strong>Felix Strathe</strong> spent the week after the Cassandra privately
          demanding that something be done about Adrian. <strong>Silas</strong> refused.
          The <em>2017 unkillability report</em> sat between them on the desk during the
          conversation. Silas closed the meeting by saying that Adrian had not been wrong
          before, that they would find out what the passenger said, and that until then
          he stayed.
        </p>
        <p className="lore-p">
          Two years on, in spring 2026, they have not found out. Caius has not told them.
          He maintains that he does not remember. This is a lie. The other three members
          of the team know there is a lie. None of them know what the lie is hiding.
        </p>
        <p className="lore-p">
          Felix has, in the eighteen months since, begun quietly developing contingency
          plans for Adrian's removal. The contingency plans depend on
          <strong> Dr. Devika Ravindrakumar</strong>. Devika does not know about the
          contingency plans. Silas does. Silas has not stopped Felix from developing
          them. Silas has also not authorised them. The two men have not discussed it.
          They are waiting to see who flinches first.
        </p>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STRATA — corporate, talent, groups
═══════════════════════════════════════════════════════════════════════════ */
function StrataTalent(){
  // Vanguard members live in the POWERS array with status: "vanguard".
  // Synthesize a Vanguard list at the top of the Talent page using the
  // same hero-list layout, so each member is visible individually
  // alongside the A → D lists.
  const vanguardMembers = POWERS.filter(p => p.status === "vanguard");
  const vanguardList = vanguardMembers.length > 0 ? {
    tier: "V",
    label: "VANGUARD",
    desc: "STRATA's flagship unit. Invitation-only, contracts negotiated separately from the standard A-list slot. Every member is classified A-List for tier purposes — Vanguard is a role, not a tier. All four members are NPCs.",
    req: "Vanguard role · four slots, capped · NPCs only.",
    color: "#d4a84a",
    isVanguard: true,
    slots: vanguardMembers.map(p => ({
      alias: p.alias,
      char: p.char,
      power: p.power,
      link: p.link || null,
      npc: p.npc,
    })),
  } : null;
  const lists = vanguardList ? [vanguardList, ...HERO_LISTS] : HERO_LISTS;
  return (
    <div>
      {lists.map((list, li) => {
        const slots = list.slots;
        return (
          <div key={li} className="hero-list">
            <div className="hero-list-hd">
              <div className="hero-list-lhs">
                <div className="hero-list-letter" style={{color: list.color}}>{list.tier}</div>
                <div>
                  <div className="hero-list-label">{list.label}</div>
                  <div className="hero-list-desc">{list.desc}</div>
                </div>
              </div>
            </div>
            <div className="hero-list-req">Requirement: {list.req}</div>
            <div className="tw">
              <table>
                <thead><tr>
                  <th>Stage Name</th>
                  <th>Character</th>
                  <th style={{width:200}}>Power Type</th>
                </tr></thead>
                <tbody>
                  {slots.map((s, si) => (
                    <tr key={si}>
                      <td>
                        <span style={{
                          fontFamily:"var(--display)",
                          fontSize:15,
                          letterSpacing:".04em",
                          color: s.char ? "var(--text)" : "var(--text-low)"
                        }}>{s.alias}</span>
                      </td>
                      <td>
                        {s.char
                          ? <><CLink name={s.char} link={s.link||null}/>{s.npc && <NpcBadge/>}</>
                          : <EmptyState/>}
                      </td>
                      <td style={{fontSize:13, color:"var(--text-mid)", fontWeight:600}}>
                        {s.power || <EmptyState label="N/A"/>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StrataGroups(){
  return (
    <div>
      <div className="groups-intro">
        <div className="groups-intro-title">SANCTIONED TEAMS</div>
        <div className="groups-intro-body">
          STRATA's flagship Vanguard unit at the top — invitation-only, A-List tier only. Below: open sanctioned-team slots awaiting concept proposals. Pitch structure, remit, and a 3–6 member roster to admin to claim one.
        </div>
      </div>
      <div className="groups-list">
        {GROUPS.map((g, gi) => (
          <div key={gi} className={"group" + (g.sanctioned ? " sanctioned" : "")}>
            <div className="group-hd">
              <div>
                <div className="group-type">{g.type}</div>
                <div className={"group-name" + (g.members.length ? "" : " empty-name")}>{g.name}</div>
              </div>
              <div className="group-chips">
                {g.sanctioned && <Chip variant="ink">SANCTIONED</Chip>}
                {g.status === "Active"  && <Chip variant="red">ACTIVE</Chip>}
                {g.status === "Dormant" && <Chip variant="ghost">DORMANT</Chip>}
                {g.status === "Concept" && <Chip variant="ghost">CONCEPT</Chip>}
                {!g.sanctioned && !["Active","Dormant","Concept"].includes(g.status) && (
                  <Chip variant="ghost">{g.status.toUpperCase()}</Chip>
                )}
              </div>
            </div>
            <div className="group-desc">{g.desc}</div>
            {g.members.length > 0 ? (
              <div className="tw">
                <table>
                  <thead><tr>
                    <th>Alias</th>
                    <th>Role</th>
                    <th>Character</th>
                  </tr></thead>
                  <tbody>
                    {g.members.map((m, mi) => (
                      <tr key={mi}>
                        <td style={{fontFamily:"var(--display)", fontSize:14, letterSpacing:".04em"}}>{m.alias}</td>
                        <td style={{fontFamily:"var(--mono)", fontSize:10, color:"var(--muted)", letterSpacing:"1.2px", textTransform:"uppercase"}}>{m.role}</td>
                        <td>{m.char ? <><CLink name={m.char} link={m.link||null}/>{m.npc && <NpcBadge/>}</> : <EmptyState/>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="group-empty">↳ No members assigned yet. Propose this collective to admin.</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StrataCorporateView(){
  return (
    <div className="strc">
      {STRATA.map((sec, si) => (
        <section key={si} className="strc-group">
          <div className="strc-group-hd">
            <span className="strc-group-name">{sec.section}</span>
            <span className="strc-group-count">
              {sec.rows.length} {sec.rows.length === 1 ? "role" : "roles"}
            </span>
          </div>
          {sec.note && (
            <p className="strc-group-note">{sec.note}</p>
          )}
          <ul className="strc-roles">
            {sec.rows.map((r, ri) => (
              <li key={ri} className={"strc-role" + (!r.char && !r.clf ? " is-vacant" : "")}>
                <span className="strc-role-label">{r.role}</span>
                <span className="strc-role-sep">·</span>
                <span className="strc-role-who">
                  {r.clf ? (
                    <Chip variant="classified">■ CLASSIFIED</Chip>
                  ) : r.char ? (
                    <><CLink name={r.char} link={r.link||null}/>{r.npc && <NpcBadge/>}</>
                  ) : (
                    <span className="strc-role-open">Open</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* ─── Unified STRATA dashboard — one organisation, three faces ─── */
function StrataOverview({onJump}){
  // Aggregate counts
  const corpRoles = STRATA.reduce((n, s) => n + s.rows.length, 0);
  const corpFilled = STRATA.reduce((n, s) => n + s.rows.filter(r => r.char || r.clf).length, 0);
  const heroSlots = HERO_LISTS.reduce((n, l) => n + l.slots.length, 0);
  const heroFilled = HERO_LISTS.reduce((n, l) => n + l.slots.filter(s => s.char).length, 0);
  const groupCount = GROUPS.length;
  const sanctioned = GROUPS.filter(g => g.sanctioned).length;
  const groupMembers = GROUPS.reduce((n, g) => n + g.members.filter(m => m.char).length, 0);

  // Unified directory — every named person under STRATA's umbrella, with their role-type
  const directory = [];
  STRATA.forEach(sec => sec.rows.forEach(r => {
    if (r.char) directory.push({ kind: "Corporate", section: sec.section, role: r.role, char: r.char, link: r.link || null, npc: r.npc });
  }));
  HERO_LISTS.forEach(l => l.slots.forEach(s => {
    if (s.char) directory.push({ kind: l.tier === "E" ? "Expendable" : `${l.tier}-List Hero`, section: "Talent Roster", role: s.alias, char: s.char, link: s.link || null, power: s.power });
  }));
  GROUPS.forEach(g => g.members.forEach(m => {
    if (m.char) directory.push({ kind: g.sanctioned ? "Sanctioned Group" : "Collective", section: g.name, role: m.role || m.alias, char: m.char, link: m.link || null, alias: m.alias, npc: m.npc });
  }));
  // Cross-references: people appearing in multiple sections
  const byChar = {};
  directory.forEach(d => { byChar[d.char] = (byChar[d.char] || 0) + 1; });
  directory.forEach(d => { d.crossRef = byChar[d.char] > 1; });
  directory.sort((a, b) => a.char.localeCompare(b.char));

  return (
    <div className="strata-overview">
      {/* NEWSPAPER OVERVIEW — replaces the v1 stat cards. A short
          in-fiction business-section piece about STRATA's position,
          set in the Calderyn world's "now" (May 2026). Two columns
          of body, drop cap, byline, masthead. Tight on purpose. */}
      <section className="strata-paper">
        <div className="strata-paper-masthead">
          <div className="strata-paper-title">THE FINANCIAL CORRESPONDENT</div>
          <div className="strata-paper-meta">
            <span>CITY DESK</span>
            <span>·</span>
            <span>SE10</span>
            <span>·</span>
            <span>12 MAY 2026</span>
            <span>·</span>
            <span>EDITION 4,118</span>
          </div>
        </div>
        <div className="strata-paper-eyebrow">BUSINESS · POWERED INDUSTRIES</div>
        <h2 className="strata-paper-headline">
          STRATA reports record intake.
          Critics quiet, again.
        </h2>
        <p className="strata-paper-subhead">
          Four hundred and twelve students across four houses. A three percent
          acceptance rate. Three private security firms quietly absorbed last quarter.
        </p>
        <div className="strata-paper-byline">
          <span>BY <strong>TESSA HOLLINGS-BRAE</strong></span>
          <span className="strata-paper-byline-sep">·</span>
          <span>BUSINESS DESK</span>
          <span className="strata-paper-byline-sep">·</span>
          <span>4 MIN READ</span>
        </div>

        <div className="strata-paper-body">
          <p>
            <span className="strata-paper-dropcap">S</span>trata International &mdash;
            the company that owns or contracts nine in ten of Britain&rsquo;s working
            superhumans &mdash; reported a record intake at Calderyn College last week.
            Its share price closed flat. Its critics were, as is now traditional, quiet.
          </p>
          <p>
            What did not draw editorials was the company&rsquo;s acquisition, in March,
            of three private security firms operating in the Hebrides and Northern
            Ireland. A spokesperson said the firm <em>&ldquo;does not comment on
            portfolio adjustments.&rdquo;</em> Felix Strathe was unavailable.
            Silas Strathe was, as ever, said to be reviewing options from home.
          </p>
        </div>

        {/* Compact stats strip at the bottom — preserves the v1 numbers
            without dominating the article. Click-throughs to the
            corresponding sub-views. */}
        <div className="strata-paper-figures">
          <button className="strata-paper-figure" onClick={() => onJump("corporate")}>
            <span className="strata-paper-figure-num">{corpFilled}<span className="strata-paper-figure-of">/{corpRoles}</span></span>
            <span className="strata-paper-figure-lbl">Corporate</span>
          </button>
          <button className="strata-paper-figure" onClick={() => onJump("talent")}>
            <span className="strata-paper-figure-num">{heroFilled}<span className="strata-paper-figure-of">/{heroSlots}</span></span>
            <span className="strata-paper-figure-lbl">Talent</span>
          </button>
          <button className="strata-paper-figure" onClick={() => onJump("groups")}>
            <span className="strata-paper-figure-num">{groupCount}</span>
            <span className="strata-paper-figure-lbl">Groups</span>
          </button>
          <button className="strata-paper-figure" onClick={() => onJump("groups")}>
            <span className="strata-paper-figure-num">{groupMembers}</span>
            <span className="strata-paper-figure-lbl">On file</span>
          </button>
        </div>
      </section>

      <section className="strata-directory">
        <div className="strata-directory-hd">
          <div>
            <div className="strata-directory-eyebrow"><Icon name="sparkles" size={11} className="inline-icon"/> Unified Directory</div>
            <h3 className="strata-directory-title">Every name on the STRATA books.</h3>
            <p className="strata-directory-blurb">Corporate, talent, and group affiliations in one place. Names with cross-affiliation are flagged.</p>
          </div>
          <div className="strata-directory-count">{directory.length} entries</div>
        </div>
        <div className="tw">
          <table>
            <thead><tr>
              <th style={{width:"34%"}}>Character</th>
              <th style={{width:"22%"}}>Type</th>
              <th>Role / Section</th>
            </tr></thead>
            <tbody>
              {directory.length === 0 && <tr><td colSpan={3}><EmptyState label="No personnel on file."/></td></tr>}
              {directory.map((d, di) => (
                <tr key={di}>
                  <td>
                    <CLink name={d.char} link={d.link}/>
                    {d.npc && <NpcBadge/>}
                    {d.crossRef && <span className="strata-crossref" title="Appears in multiple STRATA sections"><Icon name="arrow-up-right" size={10}/></span>}
                  </td>
                  <td><Chip variant={d.kind === "Corporate" ? "ink" : d.kind === "Sanctioned Group" ? "gold" : d.kind === "Collective" ? "ghost" : "red"}>{d.kind}</Chip></td>
                  <td><span style={{color:"var(--text-mid)"}}>{d.section}</span> <span style={{color:"var(--text-low)", margin:"0 6px"}}>·</span> <span style={{color:"var(--text)", fontWeight:600}}>{d.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StrataTab(){
  const ctx = React.useContext(RegContext);
  const [view, setView] = useState("overview");
  useEffect(() => {
    if (ctx.targetSubview && ["overview","corporate","talent","groups"].includes(ctx.targetSubview)){
      setView(ctx.targetSubview);
      ctx.consumeSubview();
    }
  }, [ctx]);

  const titleMap = {
    overview:  <>STRATA <span className="pg-hd-accent">at a glance</span></>,
    corporate: <>STRATA corporate</>,
    talent:    <>STRATA talent</>,
    groups:    <>Hero collectives</>,
  };
  const bodyMap = {
    overview:  "One organisation, three faces. Corporate, talent, and sanctioned groups in a single directory. Click any tile to drill in.",
    corporate: "Corporate employees, field agents, and PR. Executive identities are classified at Level 4+. Contact admin to claim a senior role.",
    talent:    "STRATA's contracted heroes — A-list down to D-list. Tier reflects roster prominence and contract value, not raw power.",
    groups:    "The sanctioned Vanguard at the top. Independent collectives below — unsanctioned heroes operating outside STRATA's contract system.",
  };

  return (
    <div className="subnav-host">
      <PageHead
        stamp="DOC · 06 · STRATA"
        title={titleMap[view]}
        body={bodyMap[view]}
        note={<>⚠ Viewing this section is logged<br/>Executive records: Level 4+ only</>}
        noteVariant="warn"
        pageNum="P. 006 / VIII"
      />
      <div className="subnav">
        <div className="subnav-inner">
          {[
            ["overview","Overview","Unified directory"],
            ["corporate","Corporate","Internal structure"],
            ["talent","Talent","A → D-list heroes"],
            ["groups","Groups","Vanguard & collectives"]
          ].map(([id, lbl, sub]) => (
            <button
              key={id}
              className={"subnav-btn" + (view === id ? " on" : "")}
              onClick={() => setView(id)}
              aria-pressed={view === id}
            >
              {lbl.toUpperCase()}
              <span className="sn-sub">{sub}</span>
            </button>
          ))}
        </div>
      </div>

      {view === "overview"  && <StrataOverview onJump={setView}/>}
      {view === "corporate" && <StrataCorporateView/>}
      {view === "talent"    && <StrataTalent/>}
      {view === "groups"    && <StrataGroups/>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   OUTSIDE — orgs-first, collapsible sections
═══════════════════════════════════════════════════════════════════════════ */
function OrgsTable({data}){
  // No more collapsible dropdowns — sections always visible. Easier
  // to scan and matches the rest of the site's pattern (no hidden
  // content behind toggle buttons).
  return (
    <div className="orgs">
      {data.map((sec, si) => {
        const orgCount = (sec.orgs || []).length;
        const sectionFilled = (sec.orgs || []).reduce(
          (n, o) => n + ((o.roles || []).filter(r => r.char).length),
          0
        );
        const sectionRoles = (sec.orgs || []).reduce(
          (n, o) => n + ((o.roles || []).length),
          0
        );
        return (
          <section key={si} className="orgs-group">
            <header className="orgs-group-hd">
              <div className="orgs-group-hd-lhs">
                <div className="orgs-group-eyebrow">SECTION · {String(si + 1).padStart(2, "0")}</div>
                <h3 className="orgs-group-name">{sec.section}</h3>
              </div>
              <div className="orgs-group-meta">
                <span className="orgs-group-count">
                  <span className="orgs-group-count-num">{orgCount}</span>
                  <span className="orgs-group-count-lbl">{orgCount === 1 ? "ORG" : "ORGS"}</span>
                </span>
                <span className="orgs-group-fill">
                  <span className="orgs-group-fill-num">{sectionFilled}/{sectionRoles}</span>
                  <span className="orgs-group-fill-lbl">FILLED</span>
                </span>
              </div>
            </header>
            {sec.note && (
              <p className="orgs-group-note">{sec.note}</p>
            )}
            <div className="orgs-list">
              {sec.orgs.map((org, oi) => {
                const filled = (org.roles || []).filter(r => r.char).length;
                const total = (org.roles || []).length;
                return (
                  <article key={oi} className="orgs-item">
                    <header className="orgs-item-hd">
                      <div className="orgs-item-hd-text">
                        <div className="orgs-item-type">{org.type}</div>
                        <h4 className="orgs-item-name">{org.name}</h4>
                      </div>
                      {total > 0 && (
                        <div className="orgs-item-roster">
                          <span className="orgs-item-roster-num">{filled}<span className="orgs-item-roster-of">/{total}</span></span>
                          <span className="orgs-item-roster-lbl">ON FILE</span>
                        </div>
                      )}
                    </header>
                    {org.note && <p className="orgs-item-note">{org.note}</p>}
                    {org.roles && org.roles.length > 0 && (
                      <ul className="orgs-roles">
                        {org.roles.map((r, ri) => (
                          <li key={ri} className={"orgs-role" + (!r.char ? " is-vacant" : "")}>
                            <span className="orgs-role-label">{r.role}</span>
                            <span className="orgs-role-who">
                              {r.char
                                ? <><CLink name={r.char} link={r.link||null}/>{r.npc && <NpcBadge/>}</>
                                : <span className="orgs-role-open">— OPEN</span>}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

// Short labels for the Outside filter tabs so the row fits on one line.
const OUTSIDE_SHORT = {
  "government-civic":      "Government",
  "law-enforcement":       "Law",
  "press-media":           "Press",
  "medical-emergency":     "Medical",
  "independent-operators": "Independent",
  "underworld":            "Underworld",
  "professional-powerball":"Powerball",
  "local-business-trade":  "Business",
};

function OutsideTab(){
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const sections = OUTSIDE.map(s => ({
    id: s.section.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    label: s.section,
    count: (s.orgs || []).length,
  }));
  const totalOrgs = sections.reduce((a, s) => a + s.count, 0);

  const ql = query.trim().toLowerCase();
  const orgMatches = (org) => {
    if (!ql) return true;
    const hay = [
      org.name, org.type, org.note,
      ...(org.roles || []).flatMap(r => [r.role, r.char]),
    ].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(ql);
  };

  const visible = (active === "all" ? OUTSIDE : OUTSIDE.filter(s => {
        const sid = s.section.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        return sid === active;
      }))
    .map(sec => ({ ...sec, orgs: (sec.orgs || []).filter(orgMatches) }))
    .filter(sec => sec.orgs.length > 0);

  return (
    <div>
      <PageHead
        stamp="DOC · 07 · EXTERNAL"
        title={<>Outside Calderyn</>}
        body="Characters who live and work in Greenwich, London — the borough Calderyn College leases its campus from. Organised by the institutions they belong to. One character may appear in multiple rows."
        pageNum="P. 007 / VIII"
      />
      <div className="orgs-search-bar" role="search">
        <div className="orgs-search-input-wrap">
          <span className="orgs-search-icon" aria-hidden="true">
            <Icon name="search" size={14}/>
          </span>
          <input
            type="text"
            className="orgs-search-input"
            placeholder="Search orgs, roles, characters…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search outside organisations"
          />
          {query && (
            <button
              type="button"
              className="orgs-search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >×</button>
          )}
        </div>
      </div>
      <div className="orgs-toolbar">
        <div className="orgs-filters">
          <button
            className={"orgs-pill" + (active === "all" ? " on" : "")}
            onClick={() => setActive("all")}
          >All <span className="orgs-pill-n">{totalOrgs}</span></button>
          {sections.map(s => {
            const short = OUTSIDE_SHORT[s.id] || s.label;
            return (
              <button
                key={s.id}
                className={"orgs-pill" + (active === s.id ? " on" : "")}
                onClick={() => setActive(s.id)}
                title={s.label}
              >{short} <span className="orgs-pill-n">{s.count}</span></button>
            );
          })}
        </div>
      </div>
      <OrgsTable data={visible}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLUBS
═══════════════════════════════════════════════════════════════════════════ */
function clubTotal(c){
  let n = (c.positions || []).length;
  if(c.teams) n += c.teams.reduce((a, t) => a + t.positions.length, 0);
  return n;
}
function clubFilled(c){
  let n = (c.positions || []).filter(p => p.char).length;
  if(c.teams) n += c.teams.reduce((a, t) => a + t.positions.filter(p => p.char).length, 0);
  return n;
}

function ClubRules({rules}){
  const [view, setView] = useState("overview");
  const [lightbox, setLightbox] = useState(false);
  const tabs = [
    {id: "overview",  label: "Overview"},
    {id: "roles",     label: "Roles"},
    {id: "rulebook",  label: "Rulebook"},
  ];

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === "Escape") setLightbox(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <div className="kbr">
      <div className="kbr-section">
        <div className="kbr-section-tag">Roles</div>
        <div className="kbr-body">
          <ol className="kbr-roles">
            {rules.roles.map((r, i) => (
              <li key={i} className="kbr-role">
                <div className="kbr-role-hd">
                  <span className="kbr-role-num">{String(i+1).padStart(2,"0")}</span>
                  <div>
                    <div className="kbr-role-name">{r.name}</div>
                    <div className="kbr-role-tagline">{r.tagline}</div>
                  </div>
                </div>
                <p className="kbr-role-desc">{r.desc}</p>
                {r.best_for && (
                  <div className="kbr-role-best">
                    <span className="kbr-role-best-tag">Best for</span>
                    <span className="kbr-role-best-text">{r.best_for}</span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="kbr-section">
        <div className="kbr-section-tag">Rulebook</div>
        <div className="kbr-body">
          {rules.format && (
            <div className="kbr-block">
              <div className="kbr-block-tag">Rules</div>
              <ul className="kbr-list">
                {rules.format.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
          {rules.violence && (
            <div className="kbr-block">
              <div className="kbr-block-tag">Powers, Violence &amp; Fouls</div>
              <p>{rules.violence}</p>
            </div>
          )}
        </div>
      </div>

      {lightbox && (
        <div
          className="kbr-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Powerball arena diagram"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            className="kbr-lightbox-close"
            onClick={(e) => { e.stopPropagation(); setLightbox(false); }}
            aria-label="Close arena diagram"
          ><i className="fa-solid fa-xmark" aria-hidden="true"></i></button>
          <img
            className="kbr-lightbox-img"
            src="https://files.catbox.moe/h3hq2p.png"
            alt="Powerball arena diagram showing the three-elevation court, half-court split, scoring zones, goal areas, and player positions for both teams"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="kbr-lightbox-hint">
            <i className="fa-solid fa-circle-info" aria-hidden="true"></i> Click anywhere outside the image or press <kbd>Esc</kbd> to close
          </div>
        </div>
      )}
    </div>
  );
}

/* Right-hand slide-over with the selected club's full info. Opened by
   clicking a directory card; Esc, the overlay, or × closes it. Reuses
   the existing detail-column classes (cdet-meta, clubdf-tabs/-body)
   for the inner chrome so only the drawer shell needs new styling. */
function ClubDrawer({club, onClose}){
  const [tab, setTab] = useState("about");
  const hasRules = !!club.rules;
  const hasTeams = !!(club.teams && club.teams.length);
  const total = clubTotal(club);
  const filled = clubFilled(club);
  const tabs = [
    {id: "about",  label: "About"},
    ...(hasRules ? [{id: "rules", label: "Rules"}] : []),
    {id: "roster", label: "Roster"},
  ];

  // Reset to About whenever the drawer opens on a different club.
  useEffect(() => { setTab("about"); }, [club]);

  // Esc closes; lock page scroll while the drawer is mounted.
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="cdrawer-overlay" onClick={onClose} role="presentation">
      <aside
        className="cdrawer"
        role="dialog"
        aria-modal="true"
        aria-label={club.name}
        onClick={e => e.stopPropagation()}
      >
        {/* Same designed header treatment as the old detail column —
            Druk name on the club's accent gradient with the halftone
            pass — so the drawer matches the rest of the page. */}
        <header className="cdrawer-top">
          <div className="cdh cdrawer-cdh" style={{"--accent": club.bg}}>
            <div className="cdh-inner">
              {club.category && <span className="cdh-cat">{club.category}</span>}
              <h2 className="cdh-name">{club.name}</h2>
              {club.tag && <div className="cdh-sub">{club.tag}</div>}
            </div>
          </div>
          <button
            type="button"
            className="cdrawer-close"
            onClick={onClose}
            aria-label="Close"
          ><span aria-hidden="true">×</span></button>
        </header>

        <div className="cdet-meta cdrawer-meta">
          <div className="cdet-meta-cell">
            <span className="cdet-meta-lbl">Access</span>
            <span className="cdet-meta-val">{club.access || "Open"}</span>
          </div>
          <div className="cdet-meta-cell">
            <span className="cdet-meta-lbl">Roster</span>
            <span className="cdet-meta-val">
              <span className="rn-big">{filled}</span>
              <span className="rn-tot">/ {total}</span>
              <span className="rn-suf">active</span>
            </span>
          </div>
        </div>

        <nav className="clubdf-tabs" role="tablist">
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={"clubdf-tab" + (tab === t.id ? " on" : "")}
              onClick={() => setTab(t.id)}
              style={{"--accent": club.bg}}
            >{t.label}</button>
          ))}
        </nav>

        <div className="clubdf-body cdrawer-body">
          {tab === "about"  && <ClubPanelAbout club={club}/>}
          {tab === "rules"  && hasRules && <ClubRules rules={club.rules}/>}
          {tab === "roster" && <ClubPanelRoster club={club} hasTeams={hasTeams}/>}
        </div>
      </aside>
    </div>
  );
}

function ClubsTab(){
  // Card-grid directory: every club visible at once, no scrolling a
  // sidebar. Clicking a card slides the ClubDrawer in from the right
  // with the full about / rules / roster panels.
  const [openIdx, setOpenIdx] = useState(null);
  const club = openIdx != null ? CLUBS[openIdx] : null;

  return (
    <div>
      <PageHead
        stamp="DOC · 05 · CAMPUS ORGS"
        title={<>Clubs &amp; societies</>}
        body={`${["Zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen"][CLUBS.length] || CLUBS.length} campus clubs. Click any card for the full roster, rules, and post-graduation pathway. You can apply for more than one club — one application per position. New clubs go through your house RA — if there's enough interest, the Student Body President considers it for approval.`}
        pageNum="P. 005 / VIII"
      />

      <div className="clubsx">
        <ul className="clubgrid" role="list" aria-label="Clubs directory">
          {CLUBS.map((c, i) => {
            const t = clubTotal(c);
            const f = clubFilled(c);
            const pct = t ? Math.round((f / t) * 100) : 0;
            return (
              <li key={i}>
                <button
                  type="button"
                  className={"clubcard" + (openIdx === i ? " on" : "")}
                  style={{"--accent": c.bg}}
                  onClick={() => setOpenIdx(i)}
                  aria-haspopup="dialog"
                >
                  <span className="clubcard-eyebrow">
                    {c.category && <span className="clubcard-cat">{c.category}</span>}
                    <span className="clubcard-access">{c.access || "Open"}</span>
                  </span>
                  <span className="clubcard-name">{c.name}</span>
                  {c.desc && <span className="clubcard-desc">{c.desc}</span>}
                  <span className="clubcard-foot">
                    <span className="clubcard-meter" aria-hidden="true">
                      <span className="clubcard-meter-fill" style={{width: pct + "%"}}/>
                    </span>
                    <span className="clubcard-stat"><b>{f}</b> / {t} filled</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {club && <ClubDrawer club={club} onClose={() => setOpenIdx(null)}/>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Club detail — FULL-PAGE view (replaces the modal).
   Cinematic hero (club color, oversized display name) + sticky tab
   strip + flat editorial content. DC / Riot / League vocabulary.
   ───────────────────────────────────────────────────────────────── */
function ClubDetailFull({club, onBack}){
  const [tab, setTab] = useState("about");
  const hasRules = !!club.rules;
  const hasTeams = !!(club.teams && club.teams.length);
  const total = clubTotal(club);
  const filled = clubFilled(club);
  const accent = club.bg || "#c41a1a";

  return (
    <div className="clubdf">
      <div className="clubdf-hero" style={{"--accent": accent}}>
        <div className="clubdf-hero-inner">
          <button className="clubdf-back" onClick={onBack} type="button">
            <Icon name="arrow-left" size={12} className="inline-icon"/> All clubs
          </button>
          {club.tag && <div className="clubdf-tag">{club.tag}</div>}
          <h1 className="clubdf-name">{club.name}</h1>
          {club.desc && <p className="clubdf-desc">{club.desc}</p>}
          <div className="clubdf-meta">
            {club.category && (
              <div className="clubdf-meta-item">
                <span className="clubdf-meta-lbl">Category</span>
                <span className="clubdf-meta-val">{club.category}</span>
              </div>
            )}
            <div className="clubdf-meta-item">
              <span className="clubdf-meta-lbl">Roster</span>
              <span className="clubdf-meta-val">{filled}<span className="clubdf-meta-dim">/{total} filled</span></span>
            </div>
            {club.access && (
              <div className="clubdf-meta-item">
                <span className="clubdf-meta-lbl">Access</span>
                <span className="clubdf-meta-val">{club.access}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="clubdf-tabs" role="tablist">
        {[
          {id: "about",  label: "About"},
          ...(hasRules ? [{id: "rules", label: "Rules"}] : []),
          {id: "roster", label: "Roster"},
        ].map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={"clubdf-tab" + (tab === t.id ? " on" : "")}
            onClick={() => setTab(t.id)}
          >{t.label}</button>
        ))}
      </nav>

      <div className="clubdf-body">
        {tab === "about"  && <ClubPanelAbout club={club}/>}
        {tab === "rules"  && hasRules && <ClubRules rules={club.rules}/>}
        {tab === "roster" && <ClubPanelRoster club={club} hasTeams={hasTeams}/>}
      </div>
    </div>
  );
}

function ClubPanel({club, onClose}){
  const [tab, setTab] = useState("about");

  const hasRules = !!club.rules;
  const hasTeams = !!club.teams;
  const hasSeason = !!(club.schedule && Array.isArray(club.schedule.games));

  const tabs = [
    {id: "about",  label: "About",  icon: "fa-circle-info"},
    ...(hasRules ? [{id: "rules", label: "Rules", icon: "fa-book"}] : []),
    ...(hasSeason ? [{id: "season", label: "Season", icon: "fa-trophy"}] : []),
    {id: "roster", label: "Roster", icon: "fa-users"},
  ];

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div className="club-side-overlay" onClick={onClose}/>
      <aside className="club-side-panel" role="dialog" aria-label={club.name}>
        <div className="club-side-hd" style={{background:club.bg}}>
          <div className="club-side-hd-main">
            {club.category && <div className="club-side-cat">{club.category}</div>}
            <div className="club-side-name">{club.name}</div>
            {club.tag && <div className="club-side-tag">{club.tag}</div>}
          </div>
          <button
            className="club-side-close"
            onClick={onClose}
            aria-label="Close panel"
          ><i className="fa-solid fa-xmark" aria-hidden="true"></i></button>
        </div>

        <div className="cp-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={"cp-tab" + (tab === t.id ? " on" : "")}
              onClick={() => setTab(t.id)}
            >
              <i className="fa-solid fa-circle-small" aria-hidden="true"></i>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="club-side-body">
          {tab === "about" && <ClubPanelAbout club={club}/>}
          {tab === "rules" && hasRules && <ClubRules rules={club.rules}/>}
          {tab === "season" && hasSeason && <ClubPanelSeason club={club}/>}
          {tab === "roster" && <ClubPanelRoster club={club} hasTeams={hasTeams}/>}
        </div>
      </aside>
    </>
  );
}

function ClubPanelAbout({club}){
  const [lightbox, setLightbox] = useState(false);
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === "Escape") setLightbox(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);
  return (
    <div className="cp-about">
      <div className="club-side-stats">
        <div className="club-side-stat">
          <div className="club-side-stat-num">{club.access}</div>
          <div className="club-side-stat-lbl">Access</div>
        </div>
      </div>
      <p className="club-side-desc">{club.desc}</p>

      {(club.meets || club.output) && (
        <div className="cp-schedule">
          {club.meets && (
            <div className="cp-schedule-row">
              <span className="cp-schedule-tag"><i className="fa-solid fa-calendar-days" aria-hidden="true"></i> Meets</span>
              <div className="cp-schedule-slots">
                {club.meets.map((m, i) => <span key={i} className="cp-schedule-slot">{m}</span>)}
              </div>
            </div>
          )}
          {club.output && (
            <div className="cp-schedule-row">
              <span className="cp-schedule-tag"><i className="fa-solid fa-bullhorn" aria-hidden="true"></i> Output</span>
              <div className="cp-schedule-output">{club.output}</div>
            </div>
          )}
        </div>
      )}

      {club.rules && (
        <div className="kbr">
          <div className="kbr-section">
            <div className="kbr-section-tag">The Sport</div>
            <div className="kbr-body">
              <p className="kbr-summary">{club.rules.summary}</p>
              <div className="kbr-keypoints">
                <div className="kbr-keypoint">
                  <div className="kbr-keypoint-num">4s</div>
                  <div className="kbr-keypoint-body">
                    <div className="kbr-keypoint-lbl">The Pass Clock</div>
                    <p>Catching the ball freezes you in place. Four seconds to release a pass, or possession drops.</p>
                  </div>
                </div>
                <div className="kbr-keypoint">
                  <div className="kbr-keypoint-num">∞</div>
                  <div className="kbr-keypoint-body">
                    <div className="kbr-keypoint-lbl">The Ball</div>
                    <p>Indestructible engineered composite. No registered power can vaporise, fracture, melt, or deform it. Only move it.</p>
                  </div>
                </div>
                <div className="kbr-keypoint">
                  <div className="kbr-keypoint-num">6v6</div>
                  <div className="kbr-keypoint-body">
                    <div className="kbr-keypoint-lbl">Three Elevations</div>
                    <p>Ground, mid-tier (~10ft), upper-tier (~20ft) platforms connected by ramps, beams, and drop points.</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="kbr-arena-tile"
                onClick={() => setLightbox(true)}
                aria-label="Open arena diagram in fullscreen"
              >
                <span className="kbr-arena-tile-body">
                  <span className="kbr-arena-tile-eyebrow">Arena Diagram</span>
                  <span className="kbr-arena-tile-title">View the Powerball arena</span>
                  <span className="kbr-arena-tile-meta">Six-on-six · Three elevations · Annotated zones</span>
                </span>
                <span className="kbr-arena-tile-cta">
                  <i className="fa-solid fa-up-right-and-down-left-from-center" aria-hidden="true"></i>
                  <span>Open diagram</span>
                </span>
              </button>
            </div>
          </div>
          {lightbox && (
            <div className="kbr-lightbox" role="dialog" aria-modal="true" aria-label="Powerball arena diagram" onClick={() => setLightbox(false)}>
              <button type="button" className="kbr-lightbox-close" onClick={(e) => { e.stopPropagation(); setLightbox(false); }} aria-label="Close arena diagram"><i className="fa-solid fa-xmark" aria-hidden="true"></i></button>
              <img className="kbr-lightbox-img" src="https://files.catbox.moe/h3hq2p.png" alt="Powerball arena diagram" onClick={(e) => e.stopPropagation()}/>
              <div className="kbr-lightbox-hint"><i className="fa-solid fa-circle-info" aria-hidden="true"></i> Click anywhere outside the image or press <kbd>Esc</kbd> to close</div>
            </div>
          )}
        </div>
      )}

      {club.rules && club.rules.career && (
        <div className="cp-about-career">
          <div className="cp-about-career-tag"><i className="fa-solid fa-graduation-cap" aria-hidden="true"></i> Post-Graduation</div>
          <div className="cp-about-career-title">The Professional League</div>
          <p>{club.rules.career}</p>
          <div className="kbr-career-stats" style={{marginTop:14}}>
            <div className="kbr-career-stat">
              <div className="kbr-career-stat-num">~40</div>
              <div>
                <div className="kbr-career-stat-lbl">Drafted Per Year</div>
                <div className="kbr-career-stat-sub">Across all four major collegiate programs.</div>
              </div>
            </div>
            <div className="kbr-career-stat">
              <div className="kbr-career-stat-num">5</div>
              <div>
                <div className="kbr-career-stat-lbl">Avg Career Length</div>
                <div className="kbr-career-stat-sub">Seasons. Most ended early by injury.</div>
              </div>
            </div>
            <div className="kbr-career-stat">
              <div className="kbr-career-stat-num">7-fig</div>
              <div>
                <div className="kbr-career-stat-lbl">Top Picks Sign For</div>
                <div className="kbr-career-stat-sub">Plus sponsorships. Cash, not contract terms.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── POWERBALL · season helpers ─────────────────────────────────────
// Compute the league table from a club.schedule.games[] array. Each
// played game contributes to both houses' W-L-D record + PF/PA. Uses
// schedule.pointsForWin / pointsForDraw (defaults 3/1) for the
// standings sort.
function computeStandings(schedule){
  if (!schedule || !Array.isArray(schedule.games)) return [];
  const win = schedule.pointsForWin ?? 3;
  const draw = schedule.pointsForDraw ?? 1;
  const t = {};
  const bump = (id) => {
    if (!t[id]) t[id] = { id, w: 0, l: 0, d: 0, gp: 0, pf: 0, pa: 0, pts: 0 };
    return t[id];
  };
  for (const g of schedule.games) {
    if (g.status !== "played") continue;
    const h = bump(g.home); const a = bump(g.away);
    h.gp += 1; a.gp += 1;
    h.pf += g.home_score || 0; h.pa += g.away_score || 0;
    a.pf += g.away_score || 0; a.pa += g.home_score || 0;
    if (g.home_score > g.away_score) { h.w += 1; a.l += 1; h.pts += win; }
    else if (g.away_score > g.home_score) { a.w += 1; h.l += 1; a.pts += win; }
    else { h.d += 1; a.d += 1; h.pts += draw; a.pts += draw; }
  }
  // Include houses that haven't played yet so the table never goes
  // empty pre-season.
  const allHouses = ["valaris", "orenne", "saberis", "grimere"];
  for (const h of allHouses) bump(h);
  return Object.values(t).sort((x, y) => {
    if (y.pts !== x.pts) return y.pts - x.pts;
    if ((y.pf - y.pa) !== (x.pf - x.pa)) return (y.pf - y.pa) - (x.pf - x.pa);
    return y.pf - x.pf;
  });
}

// Lookup helpers for the four house entries (id, label, bg colour).
const HOUSE_LOOKUP = (() => {
  const map = {};
  (D.houses || []).forEach(h => { if (h && h.id) map[h.id] = h; });
  return map;
})();
function houseName(id){
  const h = HOUSE_LOOKUP[id];
  if (h && h.name) return h.name;
  return id ? id.toUpperCase() : "—";
}
function houseColor(id){
  return (HOUSE_LOOKUP[id] && HOUSE_LOOKUP[id].bg) || "#444";
}
function houseCrest(id){
  return (HOUSE_LOOKUP[id] && HOUSE_LOOKUP[id].crest) || null;
}

// Renders an <img> of the house's crest (or a fallback square in the
// house colour if no crest URL is set). Used everywhere we previously
// showed a flat coloured swatch.
function HouseCrest({ id, size = 32, className = "" }){
  const src = houseCrest(id);
  const sty = { width: size, height: size };
  if (!src) {
    return (
      <span
        className={"house-crest is-fallback " + className}
        style={{ ...sty, background: houseColor(id) }}
        aria-hidden="true"
      />
    );
  }
  return (
    <img
      className={"house-crest " + className}
      src={src}
      alt=""
      width={size}
      height={size}
      style={sty}
      loading="lazy"
    />
  );
}

// Find the next not-yet-played game and the most recent played game.
function nextGame(schedule){
  if (!schedule || !Array.isArray(schedule.games)) return null;
  return schedule.games.find(g => g.status === "upcoming") || null;
}
function lastGame(schedule){
  if (!schedule || !Array.isArray(schedule.games)) return null;
  const played = schedule.games.filter(g => g.status === "played");
  return played.length ? played[played.length - 1] : null;
}

// Visual league table. Four rows, one per house, each rendered as a
// horizontal card with: rank pill (gold for #1), house colour stripe
// + name, games-played dial, W/D/L pill row, goal-difference bar
// (centred at zero, positive in green / negative in red), and a
// large points value on the right. Used on both the home Powerball
// section and the club page's Season tab.
function LeagueTable({ schedule, compact }){
  const standings = useMemo(() => computeStandings(schedule), [schedule]);
  // Goal-difference range across the table — drives the bar widths so
  // a small differential at the start of the season still reads
  // visually, but later in the season the bars scale to the spread.
  const maxAbs = Math.max(1, ...standings.map(s => Math.abs(s.pf - s.pa)));
  const topPts = Math.max(1, ...standings.map(s => s.pts));

  const totalGames = (schedule && schedule.games) ? schedule.games.length : 0;
  const perHouseTotal = Math.max(1, Math.floor((totalGames * 2) / 4)); // 6 games × 2 sides / 4 houses

  return (
    <div className={"lt" + (compact ? " is-compact" : "")} role="table" aria-label="League standings">
      <div className="lt-head" role="row">
        <div className="lt-head-rank" role="columnheader">RANK</div>
        <div className="lt-head-house" role="columnheader">HOUSE</div>
        {!compact && <div className="lt-head-gp" role="columnheader">PLAYED</div>}
        <div className="lt-head-form" role="columnheader">FORM</div>
        <div className="lt-head-diff" role="columnheader">GOAL DIFFERENCE</div>
        <div className="lt-head-pts" role="columnheader">PTS</div>
      </div>

      <ol className="lt-body">
        {standings.map((s, i) => {
          const diff = s.pf - s.pa;
          const pct = Math.min(100, (Math.abs(diff) / maxAbs) * 100);
          const ptsPct = (s.pts / topPts) * 100;
          const gpPct = (s.gp / perHouseTotal) * 100;
          return (
            <li
              key={s.id}
              className={"lt-row" + (i === 0 ? " is-top" : "") + (i === standings.length - 1 ? " is-bottom" : "")}
              style={{ "--lt-house": houseColor(s.id) }}
              role="row"
            >
              {/* Coloured house stripe down the left */}
              <span className="lt-row-stripe" aria-hidden="true"/>

              <div className="lt-rank" role="cell">
                {i === 0 ? (
                  <span className="lt-rank-crown" aria-hidden="true">
                    <i className="fa-solid fa-crown"></i>
                  </span>
                ) : null}
                <span className="lt-rank-num">{i + 1}</span>
              </div>

              <div className="lt-house" role="cell">
                <div className="lt-house-line">
                  <HouseCrest id={s.id} size={36} className="lt-house-crest"/>
                  <span className="lt-house-name">{houseName(s.id)}</span>
                </div>
                <span className="lt-house-record">
                  <strong>{s.gp}</strong> {s.gp === 1 ? "GAME" : "GAMES"} ·{" "}
                  <strong>{s.pf}</strong> FOR ·{" "}
                  <strong>{s.pa}</strong> AGAINST
                </span>
              </div>

              {!compact && (
                <div className="lt-gp" role="cell">
                  <div className="lt-gp-dial" role="progressbar" aria-valuenow={s.gp} aria-valuemin={0} aria-valuemax={perHouseTotal}>
                    <div className="lt-gp-dial-fill" style={{ width: gpPct + "%" }}/>
                  </div>
                  <div className="lt-gp-text">{s.gp} / {perHouseTotal}</div>
                </div>
              )}

              <div className="lt-form" role="cell">
                <span className="lt-pill lt-pill-w" title={`${s.w} wins`}><strong>{s.w}</strong>W</span>
                <span className="lt-pill lt-pill-d" title={`${s.d} draws`}><strong>{s.d}</strong>D</span>
                <span className="lt-pill lt-pill-l" title={`${s.l} losses`}><strong>{s.l}</strong>L</span>
              </div>

              <div className="lt-diff" role="cell">
                <div className="lt-diff-track">
                  <div className="lt-diff-zero" aria-hidden="true"/>
                  <div
                    className={"lt-diff-bar" + (diff >= 0 ? " is-pos" : " is-neg")}
                    style={{ width: pct + "%" }}
                  />
                </div>
                <div className={"lt-diff-val" + (diff > 0 ? " is-pos" : diff < 0 ? " is-neg" : "")}>
                  {diff > 0 ? "+" : ""}{diff}
                </div>
              </div>

              <div className="lt-pts" role="cell">
                <span className="lt-pts-num">{s.pts}</span>
                <span className="lt-pts-lbl">PTS</span>
                <div className="lt-pts-bar" aria-hidden="true">
                  <div className="lt-pts-bar-fill" style={{ width: ptsPct + "%" }}/>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ClubPanelSeason({club}){
  const sch = club.schedule;
  const standings = useMemo(() => computeStandings(sch), [sch]);
  const upcoming = nextGame(sch);

  return (
    <div className="cps">
      {/* Season header */}
      <div className="cps-head">
        <div className="cps-head-eyebrow">SEASON · {sch.season}</div>
        <div className="cps-head-title">League · Cup race</div>
        <div className="cps-head-sub">
          Six-game round-robin · each house plays each other once.
          <strong> {sch.pointsForWin ?? 3} pts</strong> for a win,
          <strong> {sch.pointsForDraw ?? 1} pt</strong> for a draw,
          <strong> 0 pts</strong> for a loss.
          Tiebreakers: league points → goal difference (PF − PA) → points for.
          Scoring follows the club rules — every score is one point, converted by the Attack pair from inside the scoring zone.
        </div>
      </div>

      {/* Standings — visual card-row table */}
      <div className="cps-section">
        <header className="cps-section-head">
          <span className="cps-section-tag"><i className="fa-solid fa-table-list" aria-hidden="true"></i> Standings</span>
        </header>
        <LeagueTable schedule={sch}/>
      </div>

      {/* Upcoming highlight */}
      {upcoming && (
        <div className="cps-section">
          <header className="cps-section-head">
            <span className="cps-section-tag"><i className="fa-regular fa-calendar" aria-hidden="true"></i> Next match</span>
          </header>
          <PowerballGameCard game={upcoming} highlight/>
        </div>
      )}

      {/* Full schedule */}
      <div className="cps-section">
        <header className="cps-section-head">
          <span className="cps-section-tag"><i className="fa-solid fa-list-ol" aria-hidden="true"></i> Full schedule</span>
        </header>
        <ol className="cps-schedule">
          {sch.games.map(g => (
            <li key={g.id}>
              <PowerballGameCard game={g}/>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// One game row — used by the Powerball season tab AND the home page
// "today" widget. Highlight mode renders the "next match" hero with
// larger team blocks; default mode is a compact row.
function PowerballGameCard({ game, highlight }){
  const homeName  = houseName(game.home);
  const awayName  = houseName(game.away);
  const homeColor = houseColor(game.home);
  const awayColor = houseColor(game.away);
  const isPlayed   = game.status === "played";
  const isUpcoming = game.status === "upcoming";
  const homeWin = isPlayed && game.home_score > game.away_score;
  const awayWin = isPlayed && game.away_score > game.home_score;

  // Format date for display: "18 OCT 2025 · SAT" UK-style.
  // Includes the year so 2025 fixtures are clearly distinguishable
  // from 2026 ones at a glance.
  const gameDate = (() => {
    try { return new Date(game.date + "T12:00:00Z"); }
    catch { return null; }
  })();
  const fmtDate = (() => {
    if (!gameDate) return game.date;
    const day = String(gameDate.getUTCDate()).padStart(2, "0");
    const mons = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    const dows = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
    return day + " " + mons[gameDate.getUTCMonth()] + " " + gameDate.getUTCFullYear() + " · " + dows[gameDate.getUTCDay()];
  })();

  // Relative time stamp so writers see "PLAYED · 11 DAYS AGO" or
  // "UPCOMING · IN 24 DAYS" without doing date math themselves.
  const relStamp = (() => {
    if (!gameDate) return null;
    const ms = gameDate.getTime() - Date.now();
    const days = Math.round(ms / (1000 * 60 * 60 * 24));
    if (isPlayed) {
      const past = Math.abs(days);
      if (past === 0) return "EARLIER TODAY";
      if (past === 1) return "1 DAY AGO";
      if (past < 14) return past + " DAYS AGO";
      if (past < 60) return Math.round(past / 7) + " WEEKS AGO";
      return Math.round(past / 30) + " MONTHS AGO";
    }
    if (isUpcoming) {
      if (days <= 0) return "TODAY";
      if (days === 1) return "TOMORROW";
      if (days < 14) return "IN " + days + " DAYS";
      return "IN " + Math.round(days / 7) + " WEEKS";
    }
    return null;
  })();

  return (
    <div
      className={"pb-game" + (highlight ? " is-highlight" : "") + (isUpcoming ? " is-upcoming" : "") + (isPlayed ? " is-played" : "")}
      style={{ "--pb-game-home": homeColor, "--pb-game-away": awayColor }}
    >
      <div className="pb-game-date">
        <div className="pb-game-date-main">{fmtDate}</div>
        {game.time && <div className="pb-game-date-time">{game.time}</div>}
        {relStamp && <div className={"pb-game-date-rel" + (isUpcoming ? " is-future" : " is-past")}>{relStamp}</div>}
      </div>

      <div className="pb-game-teams">
        <div className={"pb-game-team pb-game-team-home" + (homeWin ? " is-winner" : "")}>
          <HouseCrest id={game.home} size={32} className="pb-game-team-crest"/>
          <span className="pb-game-team-name">{homeName}</span>
          {isPlayed && <span className="pb-game-team-score">{game.home_score}</span>}
        </div>
        <div className="pb-game-vs" aria-hidden="true">
          <i className="fa-solid fa-xmark" aria-hidden="true"></i>
        </div>
        <div className={"pb-game-team pb-game-team-away" + (awayWin ? " is-winner" : "")}>
          {isPlayed && <span className="pb-game-team-score">{game.away_score}</span>}
          <span className="pb-game-team-name">{awayName}</span>
          <HouseCrest id={game.away} size={32} className="pb-game-team-crest"/>
        </div>
      </div>

      <div className="pb-game-meta">
        {isUpcoming && <span className="pb-game-tag is-upcoming">UPCOMING</span>}
        {isPlayed && <span className="pb-game-tag is-final">FINAL</span>}
        {game.venue && <span className="pb-game-venue">{game.venue}</span>}
      </div>

      {game.mvp && (
        <div className="pb-game-mvp-row">
          <span className="pb-game-mvp-lbl">MVP</span>
          {game.mvp_link ? (
            <a
              className="pb-game-mvp-name pb-game-mvp-link"
              href={game.mvp_link}
              target="_blank"
              rel="noopener noreferrer"
              title={`Open ${game.mvp}'s RPC profile`}
            >
              {game.mvp}
              <i className="fa-solid fa-arrow-up-right-from-square pb-game-mvp-icon" aria-hidden="true"></i>
            </a>
          ) : (
            <span className="pb-game-mvp-name">{game.mvp}</span>
          )}
          {game.mvp_team && (
            <span
              className="pb-game-mvp-house"
              style={{ "--mvp-house": houseColor(game.mvp_team) }}
            >
              {houseName(game.mvp_team)}
            </span>
          )}
        </div>
      )}

      {game.note && highlight && (
        <p className="pb-game-note">{game.note}</p>
      )}
    </div>
  );
}

function ClubPanelRoster({club, hasTeams}){
  if (hasTeams) {
    return (
      <div className="cp-roster">
        {club.courtNote && (
          <div className="cp-courtnote">
            <span className="cp-courtnote-tag"><i className="fa-solid fa-people-group" aria-hidden="true"></i> Open Court</span>
            <span>{club.courtNote}</span>
          </div>
        )}

        <div className="kb-teams">
          {club.teams.map((t, ti) => {
            const captain = t.positions.find(p => p.captain);
            const starters = t.positions.filter(p => !((p.pos || "").toLowerCase().startsWith("reserve")));
            const reserves = t.positions.filter(p => (p.pos || "").toLowerCase().startsWith("reserve"));
            return (
              <div key={ti} className="kb-team">
                <div className="kb-team-hd" style={{background:t.bg}}>
              <div className="kb-team-name">{t.house.toUpperCase()}</div>
              {captain && (
                <div className="kb-team-cap">
                  <span className="kb-team-cap-left">
                    <i className="fa-solid fa-star kb-team-cap-icon" aria-hidden="true"></i>
                    <span className="kb-team-cap-label">{captain.pos || "Captain"}</span>
                  </span>
                  <span className="kb-team-cap-right">
                    {captain.char
                      ? <CLink name={captain.char} link={captain.link||null}/>
                      : <span className="kb-team-cap-open">Open</span>}
                  </span>
                </div>
              )}
            </div>
                {t.train && t.train.length > 0 && (
                  <div className="kb-team-meta">
                    <span className="kb-team-meta-tag">Training</span>
                    {t.train.map((slot, si) => (
                      <span key={si} className="kb-team-meta-slot">{slot}</span>
                    ))}
                  </div>
                )}
                                <table className="kb-team-tbl">
                  <tbody>
                    {starters.length > 0 && (
                      <tr className="kb-starters-hd"><td colSpan={2}>{club.teamTableLabel || "Starting Six"}</td></tr>
                    )}
                    {starters.map((p, pi) => (
                      <tr key={"s"+pi}>
                        <td className="kb-team-pos-cell">
                          {p.captain && <span className="kb-team-c-badge" title="Team Captain">C</span>}
                          {p.pos}
                        </td>
                        <td>{p.char ? <CLink name={p.char} link={p.link||null}/> : <EmptyState/>}</td>
                      </tr>
                    ))}
                    {reserves.length > 0 && (
                      <tr className="kb-reserves-hd"><td colSpan={2}>Reserves</td></tr>
                    )}
                    {reserves.map((p, pi) => {
                      const posDisplay = p.pos.replace(/^reserve\s*[·\-—]?\s*/i, "");
                      return (
                        <tr key={"r"+pi} className="kb-row-reserve">
                          <td className="kb-team-pos-cell">
                            {posDisplay}
                          </td>
                          <td>{p.char ? <CLink name={p.char} link={p.link||null}/> : <EmptyState/>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        {(club.positions || []).length > 0 && (
          <div className="cp-staff-block">
            <div className="cp-staff-tag"><i className="fa-solid fa-clipboard-user" aria-hidden="true"></i> League Staff</div>
            <table className="cp-staff-tbl">
              <tbody>
                {club.positions.map((p, pi) => (
                  <tr key={pi}>
                    <td className="cp-staff-pos">{p.pos}</td>
                    <td className="cp-staff-char">{p.char ? <CLink name={p.char} link={p.link||null}/> : <EmptyState/>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  const positions = club.positions || [];
  const groups = club.groups || null;

  if (groups && groups.length > 0) {
    const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const byGroup = {};
    const ensure = (k) => (byGroup[k] = byGroup[k] || []);
    // Bucket by group. A position with no explicit `group` (a bot-appended
    // club approval) is routed to the group whose roles include its pos, and
    // — when filled — drops into an open canonical slot of the same pos
    // rather than adding a duplicate row, so bot appends render in the right
    // section instead of vanishing into an unrendered "other" bucket.
    positions.forEach(p => { if (p.group) ensure(p.group).push(p); });
    positions.forEach(p => {
      if (p.group) return;
      const g = groups.find(gr => (gr.roles || []).includes(p.pos));
      const bucket = ensure(g ? slug(g.label) : "other");
      const openIdx = p.char ? bucket.findIndex(q => q.pos === p.pos && !q.char) : -1;
      if (openIdx >= 0) bucket[openIdx] = p; else bucket.push(p);
    });
    return (
      <div className="cp-roster cp-roster-grouped">
        {groups.map((g, gi) => {
          const key = slug(g.label);
          const items = byGroup[key] || [];
          if (items.length === 0) return null;
          return (
            <div key={gi} className="cp-rgroup">
              <div className="cp-rgroup-hd">
                <span className="cp-rgroup-tag">{g.label}</span>
              </div>
              <table className="cp-rgroup-tbl">
                <tbody>
                  {items.map((p, pi) => (
                    <tr key={pi}>
                      <td className="cp-rgroup-pos">{p.pos}</td>
                      <td className="cp-rgroup-char">{p.char ? <CLink name={p.char} link={p.link||null}/> : <EmptyState/>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="cp-roster">
      <table>
        <thead><tr>
          <th style={{width:200}}>Position</th>
          <th>Character</th>
        </tr></thead>
        <tbody>
          {positions.map((p, pi) => (
            <tr key={pi}>
              <td style={{fontWeight:600, fontSize:13, whiteSpace:"nowrap"}}>{p.pos}</td>
              <td>{p.char ? <CLink name={p.char} link={p.link||null}/> : <EmptyState/>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STUDENT GOVERNMENT
═══════════════════════════════════════════════════════════════════════════ */
const HOUSE_FROM_REP = (pos) => {
  const first = (pos || "").split(/\s+/)[0].toLowerCase();
  return ["valaris","orenne","saberis","grimere"].includes(first) ? first : null;
};

function OfficeOfPresident({president, staff}){
  const presFilled = !!(president && president.char);
  return (
    <section className="office">
      <div className="office-tag">
        <span className="office-tag-num">01</span>
        <span className="office-tag-label">Office of the President</span>
      </div>
      <div className="office-card">
        <div className={"office-prez" + (presFilled ? " filled" : "")}>
          <div className="office-prez-eyebrow">
            <span>Calderyn · 2026</span>
            <span className="office-prez-term">{president && president.term ? president.term : "N/A"}</span>
          </div>
          <div className="office-prez-title">Student Body President</div>
          <div className="office-prez-holder">
            {presFilled
              ? <CLink name={president.char} link={president.link||null} cls="office-prez-name"/>
              : <span className="office-prez-empty">— Position Open —</span>}
          </div>
        </div>
        <div className="office-staff">
          {staff.map((s, i) => {
            const filled = !!s.char;
            return (
              <div key={i} className={"office-staff-cell" + (filled ? " filled" : "")}>
                <div className="office-staff-role">{s.pos}</div>
                <div className="office-staff-holder">
                  {filled
                    ? <CLink name={s.char} link={s.link||null}/>
                    : <span style={{color:"var(--faint)", fontStyle:"italic"}}>Awaiting holder</span>}
                </div>
                {s.term && <div className="office-staff-term">Term · {s.term}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Mandate(){
  return (
    <div className="mandate">
      <div className="mandate-label">
        <span className="mandate-tag">Mandate</span>
        <span className="mandate-rule"/>
      </div>
      <p className="mandate-body">
        The Student Body President leads the government and chairs the Student Council. The Council is staffed by elected House Representatives who double as senior Resident Assistants — they answer to the President and answer for everyone below them. Real budget. Administration retains final approval and exercises that authority routinely and without explanation. <strong>Run anyway.</strong>
      </p>
    </div>
  );
}

function CouncilGrid({seats, note}){
  return (
    <section className="council">
      <div className="block-hd">
        <div className="block-title">The Student Council</div>
        <div className="block-meta">{seats.length} House Reps · Senior Resident Assistants</div>
      </div>
      {note && <div className="block-note">{note}</div>}
      <div className="council-grid">
        {seats.map((s, i) => {
          const houseId = HOUSE_FROM_REP(s.pos);
          const houseColor = houseId ? HC_PRIMARY[houseId] : "#444";
          const houseName = houseId ? houseId.toUpperCase() : "";
          const filled = !!s.char;
          return (
            <div key={i} className={"council-rep" + (filled ? "" : " open")}>
              <div className="council-rep-bar" style={{background:houseColor}}/>
              <div className="council-rep-body">
                <div className="council-rep-house">{houseName}</div>
                <div className="council-rep-role">House Rep · Senior RA</div>
                <div className="council-rep-holder">
                  {filled
                    ? <CLink name={s.char} link={s.link||null}/>
                    : <span style={{color:"var(--faint)", fontStyle:"italic"}}>Awaiting holder</span>}
                </div>
                {s.term && <div className="council-rep-term">Term · {s.term}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function EventCommittee({seats, note}){
  return (
    <section className="committee">
      <div className="block-hd">
        <div className="block-title">Event Committee</div>
        <div className="block-meta">{seats.length} appointed roles</div>
      </div>
      {note && <div className="block-note">{note}</div>}
      <div className="committee-list">
        {seats.map((s, i) => {
          const filled = !!s.char;
          return (
            <div key={i} className={"committee-row" + (filled ? "" : " open")}>
              <div className="committee-role">{s.pos}</div>
              <div className="committee-holder">
                {filled
                  ? <CLink name={s.char} link={s.link||null}/>
                  : <span style={{color:"var(--faint)", fontStyle:"italic"}}>Awaiting holder</span>}
              </div>
              <span className={"committee-stamp" + (filled ? "" : " open")}>
                {filled ? "● Appointed" : "○ Open"}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StudentGovInner(){
  const findSec = (name) => STUDENT_GOV.find(s => s.section === name);
  const office  = findSec("OFFICE OF THE PRESIDENT");
  const council = findSec("STUDENT COUNCIL — RESIDENT ASSISTANTS");
  const events  = findSec("EVENT COMMITTEE");

  const president = office ? office.seats.find(s => /president/i.test(s.pos)) : null;
  const staff     = office ? office.seats.filter(s => !/president/i.test(s.pos)) : [];

  return (
    <div className="gov-wrap">
      {office && <OfficeOfPresident president={president} staff={staff}/>}
      <Mandate/>
      {council && <CouncilGrid seats={council.seats} note={council.note}/>}
      {events  && <EventCommittee seats={events.seats}  note={events.note}/>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   JOIN NOW — APPLICATION FORM
═══════════════════════════════════════════════════════════════════════════ */

const APPLICATION_TYPES = [
  {
    id: "student",
    name: "Student",
    desc: "Apply to enrol at Calderyn College as a powered student. Heroes or Sidekicks track.",
  },
  {
    id: "faculty",
    name: "Faculty",
    desc: "Apply for an open teaching role across one of the three faculty divisions.",
  },
  {
    id: "strata",
    name: "STRATA (Talent or Corporate)",
    desc: "Apply to STRATA International. Talent = hero roster (A→D-list). Corporate = executive, field, or PR.",
  },
  {
    id: "club",
    name: "Club Position",
    desc: "Lead or play in a campus club — Powerball, Drama, Council, Press, etc.",
  },
  {
    id: "gov",
    name: "Student Government",
    desc: "Apply for an open seat in the Office of the President, Council, or Event Committee.",
  },
  {
    id: "collective",
    name: "Hero Collective",
    desc: "Join an existing hero collective or propose a brand-new one. Hero-side only for now.",
  },
  {
    id: "villain",
    name: "Villain",
    desc: "Villain-side characters and collectives. Not open for applications yet (a planned future addition). See the note on the home page.",
    disabled: true,
    soon: "Coming soon",
  },
  {
    id: "outside",
    name: "Outside Calderyn",
    desc: "Greenwich resident — police, council, press, NHS, civilian. Living outside the school.",
  },
];

// Helper: build dropdown options of OPEN faculty roles by section
function getOpenFacultyRoles(){
  const out = [];
  // Office of the Dean + Support Staff rows. Skip every other FACULTY
  // section because the 8 department sections are now sourced from
  // D.departments below; including them here would double every dept
  // slot in the dropdown.
  FACULTY.forEach(sec => {
    if (!/office of the dean|support staff/i.test(sec.section)) return;
    sec.rows.forEach(r => {
      if (!r.char && !r.clf){
        out.push({ section: sec.section, role: r.role });
      }
    });
  });
  // Department slots — Head of Department + numbered profs + instructional
  // staff. Reserved heads (e.g. MDA Room Owner) and filled slots are
  // excluded.
  DEPARTMENTS.forEach(dept => {
    const sectionLabel = `${dept.code} · ${dept.name}`;
    const head = dept.head;
    if (head && !head.char && !head.reserved){
      out.push({ section: sectionLabel, role: head.role || "Head of Department" });
    }
    (dept.staff || []).forEach(s => {
      if (!s.char){
        const slot = s.slot ? `${s.slot} — ` : "";
        out.push({ section: sectionLabel, role: `${slot}${s.role || "Faculty"}` });
      }
    });
    (dept.instructional || []).forEach(p => {
      if (!p.char){
        out.push({ section: sectionLabel, role: p.role || "Instructional Staff" });
      }
    });
  });
  return out;
}

// Helper: build dropdown options of OPEN club positions
function getOpenClubPositions(){
  const out = [];
  CLUBS.forEach(c => {
    (c.positions || []).forEach(p => {
      if (!p.char) out.push({ club: c.name, position: p.pos, isTeam: false });
    });
    (c.teams || []).forEach(t => {
      (t.positions || []).forEach(p => {
        if (!p.char) out.push({ club: c.name, position: p.pos, team: t.house, isTeam: true });
      });
    });
  });
  return out;
}

// Helper: build dropdown options of OPEN gov seats
function getOpenGovSeats(){
  const out = [];
  STUDENT_GOV.forEach(sec => {
    sec.seats.forEach(s => {
      if (!s.char) out.push({ section: sec.section, position: s.pos, term: s.term || "" });
    });
  });
  return out;
}

// Helper: list of collectives. Optionally filter by faction.
// Collectives are hero-side only — villain-side applications aren't
// open yet (a planned future addition). Existing GROUPS
// entries don't carry a `faction` field and are treated as hero-side
// by default, which matches how the collectives copy is written
// ("unsanctioned heroes, B-List tier and below").
function getCollectives(faction){
  return GROUPS
    .filter(g => !g.sanctioned)
    .filter(g => {
      if (!faction) return true;
      const gf = ((g.faction || "hero") + "").toLowerCase();
      return gf === faction;
    })
    .map(g => g.name);
}

// Helper: list of outside organisations
function getOutsideOrgs(){
  const out = [];
  OUTSIDE.forEach(sec => {
    (sec.orgs || []).forEach(org => {
      out.push({ section: sec.section, name: org.name });
    });
  });
  return out;
}

const JOIN_HOUSES = ["Valaris", "Orenne", "Saberis", "Grimere"];
const JOIN_YEARS = ["Freshman", "Sophomore", "Junior", "Senior"];
const JOIN_TIERS = ["A-List", "B-List", "C-List", "D-List"];
const JOIN_TRACKS = ["Heroes", "Sidekicks"];
const JOIN_STRATA_DEPTS = ["Executive", "Field — Handlers & Agents", "PR & Intelligence"];

/* Outside Calderyn — STRATA registry status options.
   Maps to the `status` field on Powers Registry entries
   (see powerStatuses in data.js). */
const JOIN_OUTSIDE_STATUSES = [
  { id: "inactive",     label: "Civilian (registered, no contract)" },
  { id: "unsanctioned", label: "Unsanctioned (no contract, operating regardless)" },
  { id: "strata",       label: "STRATA (under active contract)" },
];

/* Outside Calderyn — tier options including N/A for civilians/non-combat. */
const JOIN_OUTSIDE_TIERS = ["A-List", "B-List", "C-List", "D-List", "N/A"];

/* Small helper rendered below every long textarea — replaces the
   repeated inline-styled char-counter divs. */
function CharCount({value, max}){
  const len = (value || "").length;
  return (
    <div className="join-charcount" aria-live="polite">{len} / {max}</div>
  );
}

/* Section divider inside a .join-fieldset grid. Spans both columns,
   gives long forms visible breathing room between identity / role /
   powers / notes blocks. */
function FieldGroup({title, children}){
  return (
    <>
      <div className="join-section-header">{title}</div>
      {children}
    </>
  );
}


// Friendly field-key → label mapping for the "still needs: …" hint
// shown on each wizard page. Keys not listed here fall through to a
// generic title-cased label.
const JOIN_FIELD_LABELS = {
  char: "Character name",
  rpcLink: "RPC profile link",
  ooc: "Writer tag",
  alias: "Stage name / alias",
  house: "House",
  year: "Year",
  track: "Track",
  tier: "Tier",
  age: "Age",
  power: "Power",
  powerExpression: "Power expression",
  drawbacks: "Drawbacks",
  rulesAgree: "Rules acknowledgment",
  facultyRole: "Faculty role",
  strataRole: "STRATA role",
  strataDept: "Department",
  strataTitle: "Role title",
  clubPosition: "Club position",
  govSeat: "Government seat",
};
function humanizeFieldKey(k){
  if (JOIN_FIELD_LABELS[k]) return JOIN_FIELD_LABELS[k];
  return k.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
}

/* ──────────────────────────────────────────────────────────────────────
   JOIN HUD — STRATA "live ops" dossier-bar
   ──────────────────────────────────────────────────────────────────────
   Sticky bar pinned just below the site nav for the entire application
   flow (type picker → wizard → confirmation). Replaces the v1
   JoinStatsBar with the spec'd HUD treatment:

     [INTAKE QUOTA · 2026]   STUDENTS · [A 1/5][B 0/8][C 0/10][D OPEN]
                             ADULTS    · [A 0/3][B 1/6][C 0/8][D OPEN]
                                                       ● INTAKE OPEN

   - Tier chips show writer's current usage / limit per pool, sourced
     from the /quota-stats Worker endpoint.
   - Active pool (the one THIS form contributes to) is labeled
     "(THIS FORM)" so the writer always knows where they're spending.
   - Before a writer tag is entered (quotaStats null), chips render
     with "—" counts and a muted prompt.
   ──────────────────────────────────────────────────────────────────── */
const QUOTA_TIERS = [
  { id: "A-List", label: "A", className: "tier-a" },
  { id: "B-List", label: "B", className: "tier-b" },
  { id: "C-List", label: "C", className: "tier-c" },
  { id: "D-List", label: "D", className: "tier-d" },
];

function QuotaChip({ tier, count, limit, proposedHere }){
  const isUncapped = limit == null;
  const baseCount  = count == null ? null : count;
  const liveCount  = baseCount == null ? null : baseCount + (proposedHere ? 1 : 0);
  const isFull = !isUncapped && liveCount != null && liveCount >= limit;
  const isOver = !isUncapped && liveCount != null && liveCount >  limit;
  return (
    <div className={
      "join-hud-chip join-hud-chip-" + tier.className
      + (isFull ? " is-full" : "")
      + (isOver ? " is-over" : "")
      + (proposedHere ? " is-proposed" : "")
    }>
      <span className="join-hud-chip-tier">{tier.label}-LIST</span>
      <span className="join-hud-chip-count">
        {liveCount == null
          ? "—"
          : isUncapped
            ? "OPEN"
            : <>{liveCount}<span className="join-hud-chip-slash">/</span>{limit}</>
        }
        {proposedHere && <span className="join-hud-chip-bump" aria-label="includes this submission">+1</span>}
      </span>
    </div>
  );
}

function JoinHUD({ type, quotaStats, step, alwaysShow, proposedTier }){
  // Hide entirely on the archetype picker — the HUD only appears once
  // a writer is inside the wizard for a specific form. Belt + braces:
  // gate on both `type` (no type selected = picker) AND `step` (back
  // navigation can land on step 0 with `type` still set; HUD should
  // hide in that case too).
  //
  // `alwaysShow` bypasses both gates — used by the Students tab page
  // where the HUD is a standalone stats strip, not part of a wizard.
  if (!alwaysShow) {
    if (!type) return null;
    if (step === 0) return null;
  }

  // Single relevant pool only: students for student forms, adults for
  // everything else.
  const activePool = type === "student" ? "student" : "adult";
  const poolLabel  = activePool === "student" ? "STUDENTS" : "ADULTS";
  const stats   = quotaStats || {};
  const limits  = stats.limits || {};
  const counts  = (activePool === "student" ? stats.student : stats.adult) || {};

  return (
    <div className="join-hud" role="region" aria-label="Intake quota status">
      <div className="join-hud-grain" aria-hidden="true"/>
      <div className="join-hud-inner">
        <div className="join-hud-left">
          <span className="join-hud-badge">INTAKE QUOTA · 2026</span>
          <div className="join-hud-pool">
            <span className="join-hud-pool-label">{poolLabel}</span>
            <div className="join-hud-chips">
              {QUOTA_TIERS.map(t => (
                <QuotaChip
                  key={t.id}
                  tier={t}
                  count={quotaStats ? (counts[t.id] || 0) : null}
                  limit={limits[t.id]}
                  proposedHere={proposedTier === t.id}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="join-hud-right">
          <span className="join-hud-status-dot" aria-hidden="true"/>
          <span className="join-hud-status-text">INTAKE OPEN</span>
        </div>
      </div>
    </div>
  );
}

function HomeVillainNotice(){
  // OOC admin notice — villain side isn't open for applications yet.
  // Lives on the home page as its own section. Inline-styled off the
  // theme tokens so it tracks light/dark like the rest of the page.
  return (
    <section id="home-villain" className="home-section">
    <div
      role="note"
      style={{
        maxWidth: 880,
        margin: "0 auto",
        border: "1px solid rgba(227,27,35,0.45)",
        borderLeft: "4px solid var(--red)",
        background: "var(--ink)",
        borderRadius: "10px",
        padding: "22px 24px",
        boxShadow: "0 10px 28px rgba(0,0,0,0.22)",
      }}
    >
      <div style={{
        fontFamily: "var(--mono)",
        fontSize: "11px",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--yellow)",
        marginBottom: "9px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}>
        <Icon name="flag" size={12} className="inline-icon"/> Admin Note · OOC · Villain Side
      </div>
      <h3 style={{ margin: "0 0 9px", fontSize: "18px", fontWeight: 800, color: "#fff", letterSpacing: "0.01em" }}>
        Villain applications aren't open yet.
      </h3>
      <p style={{ margin: "0 0 10px", lineHeight: 1.55, fontSize: "14px", color: "#d7d3cf" }}>
        Villain-side characters and collectives aren't being accepted at the moment.
        They're firmly on the roadmap, but opening the villain side properly needs a
        major site update, and I'd rather build it right than bolt it on.
      </p>
      <p style={{ margin: "0 0 10px", lineHeight: 1.55, fontSize: "14px", color: "#d7d3cf" }}>
        I'm currently recovering from surgery, so that work is paused for a little
        while. Thank you for your patience. It genuinely means a lot. Hero
        applications stay open in the meantime.
      </p>
      <div style={{ fontFamily: "var(--mono)", fontSize: "13px", color: "var(--yellow)", marginTop: "12px" }}>
        Sincerely, Dream
      </div>
    </div>
    </section>
  );
}

function JoinTab(){
  const [type, setType]   = useState(null);
  const [form, setForm]   = useState({});
  const [status, setStatus] = useState({ state: "idle", msg: "" });
  // Submission receipt. `null` until a form has been submitted (or
  // restored from localStorage on mount). Shape:
  //   { id, type, char, alias, submittedAt, state, decidedAt? }
  // state ∈ "pending" | "approved" | "rejected" | "unknown"
  // The receipt screen (rendered when this is non-null) polls
  // /status while state === "pending" and updates live.
  const [submission, setSubmission] = useState(null);
  // Reentrancy guard — React 18 StrictMode + fast double-clicks can
  // race the `disabled` state on the submit button and fire the
  // webhook twice. The ref is checked synchronously inside submit()
  // so a second call short-circuits before the fetch.
  const submittingRef = useRef(false);

  // Restore the receipt on mount so a refresh during pending review
  // doesn't blow away the writer's submission state. The polling
  // effect below will pick up the current server-side state on the
  // first tick.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SUBMISSION_LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.id === "string") setSubmission(parsed);
    } catch {
      // Corrupt localStorage entry — drop it silently.
      try { localStorage.removeItem(SUBMISSION_LS_KEY); } catch {}
    }
  }, []);

  // Live status polling while a submission is pending. Polls every 10s
  // and also on tab focus so a writer returning from another tab gets
  // an immediate refresh. Stops polling once a terminal state arrives.
  useEffect(() => {
    if (!submission || !submission.id) return;
    if (submission.state !== "pending") return;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(STATUS_URL + "?id=" + encodeURIComponent(submission.id));
        if (cancelled || !res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        // Worker returns "unknown" for expired/missing IDs — treat as
        // pending still so we don't surprise the writer with a false
        // "rejected" badge if KV briefly returns 404 during a deploy.
        if (data && (data.state === "approved" || data.state === "rejected")) {
          setSubmission(prev => {
            if (!prev || prev.id !== submission.id) return prev;
            const next = { ...prev, state: data.state, decidedAt: data.decidedAt || new Date().toISOString() };
            try { localStorage.setItem(SUBMISSION_LS_KEY, JSON.stringify(next)); } catch {}
            return next;
          });
        }
      } catch {
        // Network blip — next tick will try again.
      }
    };
    tick(); // immediate catch-up on mount / state change
    const handle = setInterval(tick, 10000);
    const onVis = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      clearInterval(handle);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [submission?.id, submission?.state]);
  // Wizard step. 0 = type picker; 1..N = wizard pages for the chosen
  // type. Resets to 0 when type changes or form is reset.
  const [step, setStep] = useState(0);
  // Quota stats for the writer's current OOC tag. Fetched from the
  // Worker so the writers.js mapping never leaves the server — only
  // counts and limits come down to the client.
  const [quotaStats, setQuotaStats] = useState(null);
  // Writer Tag dropdown options. Starts as the fallback list and gets
  // replaced by /writer-tags from the Worker so auto-mapped writers
  // (e.g. Skully via Gremlin → Skully) appear without code edits.
  const [oocTags, setOocTags] = useState(WRITER_TAGS_FALLBACK);

  // Fetch the live Writer Tag list once on mount. Failures fall back
  // to WRITER_TAGS_FALLBACK so the form remains usable offline.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(WRITER_TAGS_URL);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled || !Array.isArray(data.tags) || data.tags.length === 0) return;
        setOocTags(data.tags);
      } catch {
        // Leave the fallback in place.
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const reset = () => {
    setType(null);
    setForm({});
    setStatus({ state: "idle", msg: "" });
    setSubmission(null);
    setQuotaStats(null);
    setStep(0);
    try { localStorage.removeItem(SUBMISSION_LS_KEY); } catch {}
  };

  // Wizard pages for the current type (null = type uses legacy
  // single-page render).
  const wizardPages = type && JOIN_WIZARD[type] ? JOIN_WIZARD[type] : null;
  const wizardCount = wizardPages ? wizardPages.length : 0;
  const currentPage = wizardPages && step >= 1 ? wizardPages[step - 1] : null;

  // Fields the current wizard page requires. Empty array on the type
  // picker step (step 0) — Next is gated by type selection instead.
  const currentPageRequired = useMemo(() => {
    if (!currentPage) return [];
    const r = currentPage.required;
    return typeof r === "function" ? r(form) : (r || []);
  }, [currentPage, form.fullyHuman, form.strataRole, form.clubName, form.supebrawlInvite]);

  const currentPageMissing = currentPageRequired.filter(k => !form[k] || !String(form[k]).trim());
  const canAdvance = step === 0
    ? !!type
    : currentPageMissing.length === 0;

  // Re-fetch quota stats when the writer's OOC tag — or their club
  // position pick — changes. Debounce by waiting until the value is
  // stable for 300ms so a user typing their freeform tag doesn't fire
  // a request on every keystroke. The club fields let the endpoint
  // also return the writer's live usage against the selected club's
  // per-writer caps (shown under the position picker, including
  // over-cap states on grandfathered rosters).
  useEffect(() => {
    const ooc = (form.ooc || "").trim();
    if (!ooc) { setQuotaStats(null); return; }
    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(QUOTA_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ooc,
            rpcLink: form.rpcLink || "",
            clubName:     form.clubName     || form.optClubName     || "",
            clubTeam:     form.clubTeam     || form.optClubTeam     || "",
            clubPosition: form.clubPosition || form.optClubPosition || "",
          }),
        });
        if (!res.ok || cancelled) return;
        const stats = await res.json();
        if (!cancelled) setQuotaStats(stats);
      } catch {
        // Network error — leave whatever was last loaded; not worth
        // erroring the form for a hint panel.
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(handle); };
  }, [form.ooc, form.rpcLink, form.clubName, form.optClubName, form.clubTeam, form.optClubTeam, form.clubPosition, form.optClubPosition]);

  // Validation: list missing required fields per application type
  const requiredFields = useMemo(() => {
    if (!type) return [];
    const base = ["rpcLink", "char", "ooc", "rulesAgree"];
    // Power fields are universal: any role can be powered unless explicitly "fully human"
    const power = form.fullyHuman ? [] : ["power", "powerExpression", "drawbacks"];
    switch (type) {
      case "student":    return [...base, "house", "year", "track", "tier", ...power];
      case "faculty":    return [...base, "facultyRole", "tier", ...power];
      case "strata":     return form.strataRole === "corporate"
                                ? [...base, "strataRole", "strataDept", "strataTitle", ...power]
                                : [...base, "strataRole", "alias", "tier", ...power];
      case "club":       return form.clubName === "Supebrawl"
                                ? [...base, "clubPosition", "supebrawlInvite"]
                                : [...base, "clubPosition"];
      case "gov":        return [...base, "govSeat"];
      case "collective": {
        // Two sub-flows: joinHero, createNew. Collectives are hero-side
        // only — villain-side applications aren't open yet.
        const flow = form.collectiveFlow;
        if (flow === "createNew"){
          // Power on a "create" submission is optional — the creator may
          // not be a member themselves, or the founding-member list captures
          // it. Skip the universal power requirement here.
          return [...base, "collectiveFlow", "newCollectiveName", "newCollectiveType", "newCollectiveDesc"];
        }
        if (flow === "joinHero"){
          return [...base, "collectiveFlow", "alias", "collectiveName", "collectiveRole", "tier", ...power];
        }
        // No flow chosen yet → only require the flow itself; the rest
        // becomes required after the user picks one.
        return [...base, "collectiveFlow"];
      }
      case "outside":    return [...base, "outsideOrg", "outsideRole", "outsideStatus", "tier", ...power];
      default: return base;
    }
  }, [type, form.fullyHuman, form.strataRole, form.clubName]);

  const missing = requiredFields.filter(k => !form[k] || !String(form[k]).trim());

  // Collective "createNew" flow needs at least one valid founding member
  // (alias + char + role). The members array isn't a string field, so
  // it can't be caught by the simple requiredFields filter above —
  // surface it as a separate missing-flag the submit handler respects.
  const needsFoundingMember = type === "collective"
    && form.collectiveFlow === "createNew";
  const foundingMembers = Array.isArray(form.newCollectiveMembers) ? form.newCollectiveMembers : [];
  const hasValidFoundingMember = foundingMembers.some(m =>
    m && (m.alias || "").trim() && (m.char || "").trim() && (m.role || "").trim()
  );
  const foundingMemberMissing = needsFoundingMember && !hasValidFoundingMember;

  const canSubmit = type
    && missing.length === 0
    && !foundingMemberMissing
    && status.state !== "loading";

  const submit = async () => {
    // Honeypot check — if the hidden field has a value, silently
    // 'succeed' but don't ship. Spammers see a normal-looking receipt
    // (no live status — we never assigned a Worker ID, so polling
    // immediately stops at "pending" and nothing ever flips).
    if (form.hp){
      setSubmission({
        id: "honeypot",
        type: type || "student",
        char: (form.char || form.alias || "Applicant").trim(),
        alias: (form.alias || "").trim(),
        submittedAt: new Date().toISOString(),
        state: "approved", // spammer-facing decoy — don't reveal a poll loop
      });
      return;
    }
    if (!canSubmit) return;
    // Hard reentrancy guard. Without this, a double-click between
    // setStatus(loading) committing to state and the button receiving
    // its disabled prop will fire the Worker (and the Discord webhook)
    // twice. The ref flips synchronously so the second call returns
    // before reaching fetch.
    if (submittingRef.current) return;
    submittingRef.current = true;
    setStatus({ state: "loading", msg: "Sending…" });

    // The Worker builds the Discord embed + attaches Approve/Reject
    // buttons + stashes the submission in KV. We just send the raw form.
    const payload = JSON.stringify({ type, form });
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
      if (!res.ok){
        const txt = await res.text().catch(() => "");
        // Dump everything useful to DevTools so an admin can diagnose
        // quickly from a writer's screenshot.
        console.error("[Calderyn submit] relay non-OK", {
          url: WORKER_URL,
          status: res.status,
          statusText: res.statusText,
          body: txt.slice(0, 400),
          origin: typeof window !== "undefined" ? window.location.origin : "?",
        });
        // Structured rejections (e.g. per-writer club caps) carry a
        // writer-facing message — show it verbatim instead of the
        // generic relay-error copy.
        let server = null;
        try { server = JSON.parse(txt); } catch {}
        if (server && typeof server.message === "string" && server.message.trim()){
          throw new Error(server.message);
        }
        throw new Error("Server rejected (HTTP " + res.status + "). The admin team has been pinged automatically. Try again in a minute, or contact an admin in #strata-ops.");
      }
      // Pull the real Worker-assigned submission ID out of the
      // response so the polling loop has something to look up. Fall
      // back to a synthetic local ID only if the server omits it —
      // the receipt screen will still render, but live status updates
      // won't work (the writer would have to refresh).
      let serverId = null;
      try {
        const data = await res.json();
        if (data && typeof data.id === "string") serverId = data.id;
      } catch { /* non-JSON response — receipt still renders */ }
      const receipt = {
        id: serverId || ("local-" + Date.now().toString(36)),
        type,
        char: (form.char || form.alias || "Applicant").trim(),
        alias: (form.alias || "").trim(),
        submittedAt: new Date().toISOString(),
        state: "pending",
      };
      try { localStorage.setItem(SUBMISSION_LS_KEY, JSON.stringify(receipt)); } catch {}
      setSubmission(receipt);
      setStatus({ state: "idle", msg: "" });
    } catch (err) {
      // "Failed to fetch" / "NetworkError" / "Load failed" are the
      // browser's native TypeErrors for fetch network-level failures
      // (DNS, TLS, CORS preflight reject, offline, blocked by
      // extension). Map them to a friendlier message that suggests
      // what to try next.
      const raw = err && err.message ? String(err.message) : String(err);
      const isNetwork = /failed to fetch|networkerror|load failed|fetch failed/i.test(raw);
      const msg = isNetwork
        ? "Couldn't reach the relay (network or CORS). Check your connection, disable VPN/ad-blockers, or try again — your form is preserved."
        : "Failed to send — " + raw;
      console.error("[Calderyn submit] fetch error", {
        url: WORKER_URL,
        origin: typeof window !== "undefined" ? window.location.origin : "?",
        raw,
        err,
      });
      setStatus({ state: "error", msg });
      submittingRef.current = false; // allow a manual retry on error
    }
  };

  if (submission){
    // Submission receipt — driven entirely by the `submission` state
    // object so a refresh during pending review restores the same
    // view, and the polling loop above flips state to approved /
    // rejected without a refresh.
    const submittedChar = submission.char || "Applicant";
    // Display ID: shorten the Worker's hex ID into a recognisable
    // "CDR-XXXX-YYYY" badge for human reference, while keeping the
    // raw ID intact internally for polling.
    const submissionId = submission.id && submission.id.length >= 8
      ? "CDR-" + submission.id.slice(0, 4).toUpperCase() + "-" + submission.id.slice(4, 8).toUpperCase()
      : submission.id || "CDR-PENDING";
    const submittedDate = (() => {
      try {
        return new Date(submission.submittedAt).toLocaleDateString("en-GB", {
          year: "numeric", month: "short", day: "numeric"
        });
      } catch {
        return "—";
      }
    })();
    const decidedDate = submission.decidedAt ? (() => {
      try {
        return new Date(submission.decidedAt).toLocaleString("en-GB", {
          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
        });
      } catch { return null; }
    })() : null;
    const isPending  = submission.state === "pending";
    const isApproved = submission.state === "approved";
    const isRejected = submission.state === "rejected";
    const statusLabel = isApproved ? "APPROVED"
      : isRejected ? "NOT APPROVED"
      : "PENDING REVIEW";
    const statusClass = isApproved ? " is-approved"
      : isRejected ? " is-rejected"
      : " is-pending";
    return (
      <div className="join">
        <div className="join-form-wrap">
          <JoinHUD type={type} quotaStats={quotaStats} step={step} proposedTier={form.tier}/>
          <div className="join-confirm-aaa">
            {/* CINEMATIC MOMENT — the Vanguard has just been briefed.
                The four portraits flicker in sequence for ~2s as if
                STRATA were cycling through council attention, then
                resolve to a spectral backdrop. Once the flicker
                settles, the wax-seal stamp drops in. */}
            <div className="join-confirm-stage" aria-hidden="true">
              <div className="join-confirm-vanguard">
                {HOME_VANGUARD.map((v, i) => (
                  <div
                    key={v.alias}
                    className={"join-confirm-vg join-confirm-vg-" + (i + 1)}
                    style={{ backgroundImage: `url(${v.portrait})` }}
                  >
                    <div className="join-confirm-vg-label">{v.alias}</div>
                  </div>
                ))}
                <div className="join-confirm-vanguard-line">
                  COUNCIL · BRIEFED · {submittedDate.toUpperCase()}
                </div>
              </div>

              {/* WAX SEAL — drops in after the Vanguard flicker settles.
                  Custom SVG for the irregular wax-edged circle so it
                  reads as embossed wax and not a clean circular badge.
                  The "STRATA" text + radial caption ring inside it. */}
              <div className="join-confirm-wax">
                <svg className="join-confirm-wax-svg" viewBox="0 0 240 240" aria-hidden="true">
                  <defs>
                    <filter id="wax-rough">
                      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7"/>
                      <feDisplacementMap in="SourceGraphic" scale="6"/>
                    </filter>
                    <radialGradient id="wax-fill" cx="38%" cy="32%" r="70%">
                      <stop offset="0%"   stopColor="#a82431"/>
                      <stop offset="55%"  stopColor="#7a1521"/>
                      <stop offset="100%" stopColor="#4a0c14"/>
                    </radialGradient>
                    <radialGradient id="wax-rim" cx="50%" cy="50%" r="50%">
                      <stop offset="92%" stopColor="rgba(0,0,0,0)"/>
                      <stop offset="98%" stopColor="rgba(0,0,0,0.45)"/>
                      <stop offset="100%" stopColor="rgba(0,0,0,0.0)"/>
                    </radialGradient>
                    <path
                      id="wax-ring-path"
                      d="M 120 56 A 64 64 0 1 1 119.99 56"
                    />
                  </defs>
                  {/* Outer scalloped wax body */}
                  <circle
                    cx="120" cy="120" r="100"
                    fill="url(#wax-fill)"
                    filter="url(#wax-rough)"
                  />
                  {/* Subtle inset rim shadow */}
                  <circle cx="120" cy="120" r="100" fill="url(#wax-rim)"/>
                  {/* Inner embossed ring */}
                  <circle cx="120" cy="120" r="78" fill="none" stroke="rgba(255,210,180,0.18)" strokeWidth="1.5"/>
                  <circle cx="120" cy="120" r="68" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1"/>
                  {/* Central monogram + label */}
                  <text x="120" y="118"
                    textAnchor="middle"
                    fontFamily="Druk, sans-serif"
                    fontWeight="900"
                    fontSize="42"
                    fill="#f4d9b8"
                    letterSpacing="2"
                  >STRATA</text>
                  <text x="120" y="142"
                    textAnchor="middle"
                    fontFamily="Söhne Mono, monospace"
                    fontWeight="500"
                    fontSize="9"
                    fill="#f4d9b8"
                    letterSpacing="3"
                  >EST · MMIX</text>
                  {/* Ring of caption text following the rim */}
                  <text
                    fontFamily="Söhne Mono, monospace"
                    fontWeight="600"
                    fontSize="9"
                    fill="rgba(244, 217, 184, 0.7)"
                    letterSpacing="4"
                  >
                    <textPath href="#wax-ring-path" startOffset="0">
                      {isApproved
                        ? "APPROVED · ENROLLED · CALDERYN COLLEGE ·"
                        : isRejected
                        ? "DECISION RECEIVED · CALDERYN COLLEGE ·"
                        : "RECEIVED · UNDER REVIEW · CALDERYN COLLEGE ·"}
                    </textPath>
                  </text>
                </svg>
                <div className="join-confirm-wax-id">{submissionId}</div>
              </div>
            </div>

            <div className={"join-confirm-eyebrow" + statusClass}>
              <span className="join-confirm-dot" aria-hidden="true"/>
              {isApproved
                ? "APPROVED · ROSTER UPDATED"
                : isRejected
                ? "DECISION RECEIVED · SEE YOUR RPC INBOX"
                : "SUBMISSION LOGGED · ADMIN CHANNEL NOTIFIED"}
            </div>

            <h2 className="join-confirm-title">
              {isApproved ? <>Welcome to Calderyn, <span className="join-confirm-name">{submittedChar}</span>.</>
                : isRejected ? <>Thank you for applying, <span className="join-confirm-name">{submittedChar}</span>.</>
                : <>Thank you, <span className="join-confirm-name">{submittedChar}</span>.</>}
            </h2>
            <p className="join-confirm-lede">
              {isApproved
                ? "An admin has approved your application. Your character is now part of the registry — refresh the relevant tab and you'll see them in the roster. Watch your linked RPC profile for any follow-up about channels or onboarding."
                : isRejected
                ? "Your application wasn't approved this time. An admin has reached out via your linked RPC profile with details and any next steps. You're welcome to revise and resubmit."
                : <>Your application has been routed to the admin channel. We'll reach out via the RPC profile you linked — usually within a few days, sometimes sooner. <strong>This page updates live</strong> when an admin decides — leave it open, or refresh later and you'll still see your status.</>}
            </p>

            <div className="join-confirm-receipt" role="note">
              <div className="join-confirm-receipt-col">
                <div className="join-confirm-receipt-label">Submission ID</div>
                <code className="join-confirm-receipt-value">{submissionId}</code>
              </div>
              <div className="join-confirm-receipt-col">
                <div className="join-confirm-receipt-label">Lodged</div>
                <div className="join-confirm-receipt-value">{submittedDate}</div>
              </div>
              <div className="join-confirm-receipt-col">
                <div className="join-confirm-receipt-label">{decidedDate ? "Decided" : "Status"}</div>
                <div className={"join-confirm-receipt-value join-confirm-receipt-status" + statusClass}>
                  <span className="join-confirm-status-dot" aria-hidden="true"/>
                  <span className="join-confirm-receipt-status-text">{statusLabel}</span>
                </div>
                {decidedDate && (
                  <div className="join-confirm-receipt-decided-at">{decidedDate}</div>
                )}
              </div>
            </div>

            <div className="join-confirm-next">
              <div className="join-confirm-next-title">
                {isApproved ? "You're in — what now"
                  : isRejected ? "If you'd like to try again"
                  : "What happens next"}
              </div>
              <ol className="join-confirm-next-list">
                {isApproved ? (
                  <>
                    <li>Your character is live on the registry — find them in the relevant tab (Students, Faculty, Hero List, etc.).</li>
                    <li>An admin will follow up on your linked RPC profile with channel access and onboarding details.</li>
                    <li>Start roleplaying — and submit any further applications (alts, clubs, government) the same way.</li>
                  </>
                ) : isRejected ? (
                  <>
                    <li>Read the admin's note on your linked RPC profile — it explains what didn't work and what would.</li>
                    <li>Revise the character (often a tier shift, power scope, or quota wait is all that's needed).</li>
                    <li>Click <em>Submit another application</em> below to start a fresh submission.</li>
                  </>
                ) : (
                  <>
                    <li>Admin reads your submission against the masterlist and quota.</li>
                    <li>You'll receive a message on your linked RPC profile with the decision and any follow-up questions.</li>
                    <li>If approved, you'll be added to the roster and the channel — this page will update automatically.</li>
                    <li>No need to wait — <em>Submit another application</em> below starts a fresh one (alts, more clubs, a gov seat) while this one stays pending.</li>
                  </>
                )}
              </ol>
            </div>

            <div className="join-confirm-actions">
              <button className="join-confirm-again" onClick={reset}>
                <Icon name="arrow-left" size={14} className="inline-icon"/>
                Submit another application
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="join">
      <div className="join-hero">
        <div className="join-hero-inner">
          <div className="join-hero-stamp"><Icon name="flag" size={12} className="inline-icon"/> INTAKE · 2026 INTAKE OPEN</div>
          <h2>Join the <span className="accent">registry.</span></h2>
          <p>
            Calderyn is open. Pick what you're applying for, fill in the details, we'll review on Discord. <strong>One form per character</strong> — submit multiples separately.
          </p>
        </div>
      </div>

      <div className="join-form-wrap">
        {/* STATS BAR — persistent slot availability strip. Shows
            global overview before a type is picked, then switches
            to type-specific stats. */}
        <JoinHUD type={type} quotaStats={quotaStats} step={step} proposedTier={form.tier}/>

        {/* FORM MASTER HEADER — display name of the application as a
            top-level identity ("STUDENT APPLICATION" / "CLUB POSITION
            APPLICATION") above the step indicator. Shown whenever the
            writer has picked a type, both for wizardized types and
            legacy single-page forms (collective / outside). */}
        {type && (
          <header className="join-form-header">
            <div className="join-form-header-eyebrow">CALDERYN · INTAKE FORM</div>
            <h1 className="join-form-header-title">
              {(JOIN_FORM_TITLES[type] || "Application").toUpperCase()}
            </h1>
            <p className="join-form-header-sub">
              {(APPLICATION_TYPES.find(t => t.id === type) || {}).desc || ""}
            </p>
          </header>
        )}

        {/* WIZARD HEAD — Riot-quality numbered step indicator above
            the page title. Shown only once a type has been selected
            (step >= 1) AND the type is wizardized. */}
        {type && wizardPages && step >= 1 && (
          <header className="join-wiz-head">
            <div className="join-wiz-steps" role="list" aria-label="Application progress">
              {wizardPages.map((p, i) => {
                const n = i + 1;
                const state = n < step ? "done" : n === step ? "current" : "pending";
                return (
                  <div
                    key={p.id}
                    className={"join-wiz-step is-" + state}
                    role="listitem"
                    aria-current={state === "current" ? "step" : undefined}
                  >
                    <div className="join-wiz-step-circle" aria-hidden="true">
                      {state === "done"
                        ? <Icon name="check" size={14}/>
                        : <span className="join-wiz-step-n">{String(n).padStart(2, "0")}</span>
                      }
                    </div>
                    <div className="join-wiz-step-label">{p.title}</div>
                    {i < wizardPages.length - 1 && (
                      <div className="join-wiz-step-connector" aria-hidden="true"/>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Page-specific head — re-keyed on step so each page's
                title animates in from the right on advance. */}
            <div key={"head-" + step} className="join-wiz-head-body">
              <div className="join-wiz-eyebrow">
                STEP {String(step).padStart(2, "0")} / {String(wizardCount).padStart(2, "0")}
              </div>
              <h2 className="join-wiz-title">{currentPage.title}</h2>
              <p className="join-wiz-subtitle">{currentPage.subtitle}</p>
            </div>
          </header>
        )}

        {/* STEP 0 — Type picker.
            For wizardized types, picking advances to step 1. For
            legacy types (collective/outside) it stays put and renders
            the old single-page form below. */}
        {(step === 0 || !wizardPages) && (
          <div className="join-step">
            {/* Type picker eyebrow + title — uses the wizard-eyebrow
                treatment universally now. Earlier this branched on
                whether the type was wizardized, but at step 0 nothing
                is selected yet so wizardPages was always null and the
                v1 ".join-step-tag" text always ran. */}
            <span className="join-wiz-eyebrow">01 · ARCHETYPE</span>
            <h2 className="join-wiz-title">Pick your archetype.</h2>
            <p className="join-wiz-subtitle">The form adjusts to ask only what's needed for the role. Switching resets your inputs.</p>
            <div className="join-typegrid">
              {APPLICATION_TYPES.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  disabled={t.disabled}
                  aria-disabled={t.disabled || undefined}
                  title={t.disabled ? "Not open for applications yet" : undefined}
                  className={"join-type" + (type === t.id ? " on" : "") + (t.disabled ? " is-soon" : "")}
                  style={t.disabled ? { opacity: 0.5, cursor: "not-allowed", filter: "grayscale(0.6)" } : undefined}
                  onClick={() => {
                    // Disabled archetypes (e.g. Villain) are visible but
                    // not selectable yet — bail before touching state.
                    if (t.disabled) return;
                    // Only wipe the form when switching to a DIFFERENT
                    // type — clicking the same type just advances back
                    // into the wizard preserving the data the writer
                    // already entered.
                    if (type !== t.id){
                      setType(t.id);
                      setForm({});
                      setStatus({state:"idle",msg:""});
                    }
                    if (JOIN_WIZARD[t.id]) setStep(1);
                  }}
                >
                  <div className="join-type-num">{String(i+1).padStart(2,"0")}</div>
                  <div className="join-type-name">
                    {t.name}
                    {t.soon && (
                      <span style={{
                        marginLeft: 8,
                        fontFamily: "var(--mono)",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--ink)",
                        background: "var(--yellow)",
                        borderRadius: 4,
                        padding: "2px 6px",
                        verticalAlign: "middle",
                      }}>{t.soon}</span>
                    )}
                  </div>
                  <div className="join-type-desc">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* WIZARD PAGES — render only the current page's fields. */}
        {type && wizardPages && step >= 1 && (
          <>
            {/* Cradle warning still shows on the role page where age
                actually matters, not on every page. */}
            {currentPage.id === "role" && ["student","faculty","strata","collective"].includes(type) && (
              <aside className="join-warn" role="note">
                <div className="join-warn-tag">Age &amp; Cradle requirement — strict.</div>
                <p>
                  Your character's age must fall inside the age range of their Cradle phase (Cradle III: 0–26 · Cradle II: 31–46 · Cradle I: 51–58). Powers track the Cradle a character was born into. <strong>The Dean</strong> and <strong>Vale</strong> are the only Cradle I characters above 46. <strong>Paragon</strong> is a Cradle II character (age 31–46) who received the Cradle I injection — Cradle II body, Cradle I powers. Please <a href="#lore" className="join-warn-link">read the lore</a> (start with <em>The Programme</em>) before submitting.
                </p>
              </aside>
            )}

            <div key={"page-" + step} className="join-wiz-page">
              <JoinFieldset
                type={type}
                form={form}
                set={set}
                quotaStats={quotaStats}
                oocTags={oocTags}
                wizardPageId={currentPage.id}
                missingFields={currentPageMissing}
              />
            </div>

            <div className="join-wiz-nav">
              <button
                type="button"
                className="join-wiz-btn join-wiz-btn-back"
                onClick={() => setStep(Math.max(0, step - 1))}
              >
                <Icon name="arrow-left" size={14}/> Back
              </button>
              {step < wizardCount && (
                <button
                  type="button"
                  className="join-wiz-btn join-wiz-btn-next"
                  onClick={() => setStep(step + 1)}
                  disabled={!canAdvance}
                >
                  Next <Icon name="arrow-right" size={14}/>
                </button>
              )}
              {step === wizardCount && (
                <button
                  type="button"
                  className="join-wiz-btn join-wiz-btn-submit"
                  onClick={submit}
                  disabled={!canSubmit}
                >
                  {status.state === "loading" ? "Sending…" : "Submit Application"}
                </button>
              )}
              <button type="button" className="join-wiz-btn join-wiz-btn-cancel" onClick={reset}>
                Cancel
              </button>
            </div>
            {status.state !== "idle" && (
              <div className={"join-wiz-status " + (status.state === "error" ? "is-error" : "is-loading")}>
                {status.msg}
              </div>
            )}
            {currentPageMissing.length > 0 && step < wizardCount && (
              <div className="join-wiz-status is-hint">
                <Icon name="alert-triangle" size={14} className="inline-icon"/>
                {currentPageMissing.length === 1
                  ? <>Still needs: <strong>{humanizeFieldKey(currentPageMissing[0])}</strong></>
                  : <>Still needs: <strong>{currentPageMissing.map(humanizeFieldKey).join(" · ")}</strong></>
                }
              </div>
            )}
          </>
        )}

        {/* LEGACY single-page render — for collective + outside which
            aren't wizardized yet. Keep the original layout intact. */}
        {type && !wizardPages && (
          <>
            <div className="join-divider">
              <span className="join-divider-rule"/>
              <span className="join-divider-tag">Step 02 · Details</span>
              <span className="join-divider-rule"/>
            </div>
            {["collective"].includes(type) && (
              <aside className="join-warn" role="note">
                <div className="join-warn-tag">Age &amp; Cradle requirement — strict.</div>
                <p>
                  Your character's age must fall inside the age range of their Cradle phase (Cradle III: 0–26 · Cradle II: 31–46 · Cradle I: 51–58). Powers track the Cradle a character was born into. <strong>The Dean</strong> and <strong>Vale</strong> are the only Cradle I characters above 46. <strong>Paragon</strong> is a Cradle II character (age 31–46) who received the Cradle I injection — Cradle II body, Cradle I powers. Please <a href="#lore" className="join-warn-link">read the lore</a> (start with <em>The Programme</em>) before submitting.
                </p>
              </aside>
            )}

            <JoinFieldset type={type} form={form} set={set} quotaStats={quotaStats} oocTags={oocTags}/>

            <div className="join-actions">
              <button
                type="button"
                className="join-submit"
                onClick={submit}
                disabled={!canSubmit}
              >
                {status.state === "loading" ? "Sending…" : "Submit Application"}
              </button>
              <button type="button" className="join-cancel" onClick={reset}>
                Cancel
              </button>
              {status.state !== "idle" && (
                <span className={"join-status " + (status.state === "error" ? "is-error" : "is-loading")}>
                  {status.msg}
                </span>
              )}
              {missing.length > 0 && status.state === "idle" && (
                <span className="join-status is-error">
                  Missing: {missing.length} required field{missing.length === 1 ? "" : "s"}
                </span>
              )}
              {foundingMemberMissing && missing.length === 0 && status.state === "idle" && (
                <span className="join-status is-error">
                  Add at least one founding member with alias, character, and role.
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* Reusable, universal Powers block. Any role can be powered or fully human. */
function PowerFields({form, set, allowHuman = true}){
  const isHuman = allowHuman ? !!form.fullyHuman : false;
  return (
    <>
      <FieldGroup title="Powers"/>
      {allowHuman && (
        <Field label="Powers" full hint="Tick the box if this character is fully human (no powers). Otherwise, fill in the three fields below.">
          <label className="join-checkbox">
            <input type="checkbox" checked={isHuman} onChange={e => set("fullyHuman", e.target.checked)}/>
            <span>This character is fully human — no powers.</span>
          </label>
        </Field>
      )}
      {!isHuman && (
        <>
          <Field label="Power / Ability" required hint="The category and the specific ability — e.g. Pyrokinesis · Heat shaping, Telekinesis · Mass-shift." full>
            <input className="join-input" type="text" value={form.power || ""} onChange={e => set("power", e.target.value)} placeholder="e.g. Electromagnetic field manipulation · Photosphere control"/>
          </Field>
          <Field label="Power Expression" required hint="What it looks like and how it works — the visual manifestation and the internal mechanics." full>
            <textarea className="join-textarea is-medium" value={form.powerExpression || ""} onChange={e => set("powerExpression", e.target.value.slice(0, 1000))} placeholder="How it presents — what others see, hear, feel — and what it does, how it does it." maxLength={1000}/>
            <CharCount value={form.powerExpression} max={1000}/>
          </Field>
          <Field label="Drawbacks" required hint="Costs, weaknesses, hard limits, things that turn it off." full>
            <textarea className="join-textarea is-medium" value={form.drawbacks || ""} onChange={e => set("drawbacks", e.target.value.slice(0, 1000))} placeholder="Even broken-tier characters need limits — be honest." maxLength={1000}/>
            <CharCount value={form.drawbacks} max={1000}/>
          </Field>
        </>
      )}
    </>
  );
}

/* Tail block — Notes + Rules + Honeypot. Used by every form. */
function TailFields({form, set}){
  return (
    <>
      <FieldGroup title="Notes & Confirmation"/>
      <Field label="Additional Notes" hint="Content warnings, plot hooks, connections wanted, triggers, etc. Optional." full>
        <textarea className="join-textarea is-medium" value={form.notes || ""} onChange={e => set("notes", e.target.value.slice(0, 1000))} placeholder="Optional" maxLength={1000}/>
        <CharCount value={form.notes} max={1000}/>
      </Field>
      <Field label="Rules Acknowledgment" required full>
        <label className="join-checkbox">
          <input type="checkbox" checked={!!form.rulesAgree} onChange={e => set("rulesAgree", e.target.checked)}/>
          <span>I have read and agree to the room rules. I understand my character must follow them, and that admin has final say on conduct, conflict, and content.</span>
        </label>
      </Field>
      <Honeypot form={form} set={set}/>
    </>
  );
}

/* Optional cross-references for Student form (clubs + gov) */
function StudentExtras({form, set}){
  // Supebrawl is invite-only (cleared with Sven's typist in RP) and has
  // its own confirmation checkbox on the Club form — keep it out of the
  // student form's optional shortcut entirely.
  const openPos = getOpenClubPositions().filter(p => p.club !== "Supebrawl");
  const openSeats = getOpenGovSeats();
  return (
    <>
      <Field label="Optional · Club Position" hint="If this student also wants to join a club. Skip if you'll decide later. Per-writer club caps apply — to keep enough room for new writers, you can only hold a limited number of positions per club, counted across your characters. Caps will increase as the room grows." full>
        <select
          className="join-select"
          value={form.optClubPositionKey ?? ""}
          onChange={e => {
            const raw = e.target.value;
            const idx = raw === "" ? -1 : parseInt(raw, 10);
            const found = idx >= 0 ? openPos[idx] : null;
            set("optClubPositionKey", raw);
            if (found){
              set("optClubPosition", found.position);
              set("optClubName",     found.club);
              set("optClubTeam",     found.team || "");
            } else {
              set("optClubPosition", "");
              set("optClubName",     "");
              set("optClubTeam",     "");
            }
          }}
        >
          <option value="">— None —</option>
          {openPos.map((p, i) => (
            <option key={i} value={i}>
              {p.club}{p.team ? ` · ${p.team}` : ""} — {p.position}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Optional · Student Government Seat" hint="If this student also wants to run for office. Skip if you'll decide later." full>
        <select
          className="join-select"
          value={form.optGovSeatKey ?? ""}
          onChange={e => {
            const raw = e.target.value;
            const idx = raw === "" ? -1 : parseInt(raw, 10);
            const found = idx >= 0 ? openSeats[idx] : null;
            set("optGovSeatKey", raw);
            if (found){
              set("optGovSeat",    found.position);
              set("optGovSection", found.section);
              set("optGovTerm",    found.term);
            } else {
              set("optGovSeat",    "");
              set("optGovSection", "");
              set("optGovTerm",    "");
            }
          }}
        >
          <option value="">— None —</option>
          {openSeats.map((s, i) => (
            <option key={i} value={i}>{s.section} — {s.position}{s.term ? ` (${s.term})` : ""}</option>
          ))}
        </select>
      </Field>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   COLLECTIVE FIELDSET — 2 flows on one form
   ──────────────────────────────────────────────────────────────────────
   Flow A — Join an existing hero collective.
   Flow B — Create a new hero collective, seed members.

   Collectives are hero-side only. Villain-side applications aren't open
   yet — a planned future addition once the villain system is built.

   The flow picker uses the same .join-typegrid / .join-type chrome as the
   top-level application-type picker so it matches the rest of the form
   visually. Both flows share the universal Common + Power + Tail
   blocks. Create-flow has a small founding-members repeater (alias /
   char / role) that lives entirely in form state — admin pastes the
   resulting GROUPS snippet into data.js.
   ────────────────────────────────────────────────────────────────────── */
const COLLECTIVE_FLOWS = [
  { id: "joinHero",    num: "01", name: "Join · Hero-side",
    desc: "Apply to an existing hero collective. Unsanctioned heroes operating outside STRATA contracts." },
  { id: "createNew",   num: "02", name: "Create · New collective",
    desc: "Propose a brand-new hero collective and its founding members." },
];

function CollectiveFieldset({form, set, Common, wizardPageId}){
  // Page gate — see JoinFieldset's helper for the pattern.
  const onPage = (id) => !wizardPageId || wizardPageId === id;
  const flow = form.collectiveFlow;
  const isJoin = flow === "joinHero";
  const faction = flow === "joinHero" ? "hero" : null;
  const collectives = getCollectives(faction);

  // Kind taxonomy is whatever distinct .type values data.js already uses.
  const kinds = useMemo(() => {
    const seen = new Set();
    GROUPS.forEach(g => { if (g.type) seen.add(g.type); });
    return Array.from(seen);
  }, []);

  const members = Array.isArray(form.newCollectiveMembers) ? form.newCollectiveMembers : [];
  const setMembers = (arr) => set("newCollectiveMembers", arr);
  const updateMember = (i, key, value) => {
    const arr = members.slice();
    arr[i] = { ...(arr[i] || {}), [key]: value };
    setMembers(arr);
  };
  const addMember = () => setMembers([...members, { alias: "", char: "", role: "" }]);
  const removeMember = (i) => {
    const arr = members.slice();
    arr.splice(i, 1);
    setMembers(arr);
  };

  return (
    <div className="join-fieldset" data-wiz-page={wizardPageId || ""}>
      {/* PROFILE — Common identity fields. Alias only shows for join
          flows since create-new doesn't need a stage name yet (the
          flow picker is on the next page so on profile we don't yet
          know which path the writer is on; alias rendered
          conditionally on flow). */}
      {onPage("profile") && (
        <>
          <FieldGroup title="Character Profile"/>
          {Common}
          {isJoin && (
            <Field label="Stage Name / Alias" required full>
              <input
                className="join-input"
                type="text"
                value={form.alias || ""}
                onChange={e => set("alias", e.target.value)}
                placeholder="HEX, NULL, etc."
              />
            </Field>
          )}
        </>
      )}

      {/* ROLE — flow picker + flow-specific affiliation block. */}
      {onPage("role") && (
        <>
          <FieldGroup title="Pick a flow"/>
          <div className="join-flow-blurb">
            Two paths on one form. Switching flow keeps your character &amp; profile, but resets flow-specific fields. Collectives are hero-side; villain-side applications aren't open yet.
          </div>
          <div className="join-typegrid join-flowgrid">
            {COLLECTIVE_FLOWS.map(opt => (
              <button
                key={opt.id}
                type="button"
                className={"join-type" + (flow === opt.id ? " on" : "")}
                onClick={() => {
                  set("collectiveFlow", opt.id);
                  // Clear the other flow's fields so a stale value can't
                  // leak into the snippet/embed if the user switches.
                  if (opt.id === "createNew"){
                    set("collectiveName", "");
                    set("collectiveRole", "");
                  } else {
                    set("newCollectiveName", "");
                    set("newCollectiveType", "");
                    set("newCollectiveDesc", "");
                    set("newCollectiveColor", "");
                    set("newCollectiveBanner", "");
                    set("newCollectiveMembers", []);
                  }
                }}
              >
                <div className="join-type-num">{opt.num}</div>
                <div className="join-type-name">{opt.name}</div>
                <div className="join-type-desc">{opt.desc}</div>
              </button>
            ))}
          </div>

          {/* JOIN-flow affiliation fields */}
          {isJoin && (
            <>
              <FieldGroup title="Hero Collective"/>
              <Field
                label="Hero Collective"
                required
                full
                hint={collectives.length === 0
                  ? "None registered yet — type the collective name, or switch to Create to propose one."
                  : "Pick from registered collectives, or type a new name if a player has proposed one off-registry."}
              >
                {collectives.length > 0 ? (
                  <select
                    className="join-select"
                    value={form.collectiveName || ""}
                    onChange={e => set("collectiveName", e.target.value)}
                  >
                    <option value="">Select collective…</option>
                    {collectives.map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input
                    className="join-input"
                    type="text"
                    value={form.collectiveName || ""}
                    onChange={e => set("collectiveName", e.target.value)}
                    placeholder="e.g. Nightwatch Collective"
                  />
                )}
              </Field>
              <Field label="Role within Collective" required hint="Leader, Specialist, Field, etc." full>
                <input
                  className="join-input"
                  type="text"
                  value={form.collectiveRole || ""}
                  onChange={e => set("collectiveRole", e.target.value)}
                  placeholder="e.g. Field Operative"
                />
              </Field>
              <Field label="Tier" required hint="Threat / capability tier — choose N/A if not applicable" full>
                <select className="join-select" value={form.tier || ""} onChange={e => set("tier", e.target.value)}>
                  <option value="">Select tier…</option>
                  {JOIN_OUTSIDE_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </>
          )}

          {/* CREATE-flow new-collective fields */}
          {flow === "createNew" && (
            <>
              <FieldGroup title="New Collective"/>
              <Field label="Collective Name" required>
                <input
                  className="join-input"
                  type="text"
                  value={form.newCollectiveName || ""}
                  onChange={e => set("newCollectiveName", e.target.value)}
                  placeholder="e.g. The Iron Sigil"
                />
              </Field>
              <Field label="Kind" required hint="Taxonomy taken from data.js groups[].type">
                <select
                  className="join-select"
                  value={form.newCollectiveType || ""}
                  onChange={e => set("newCollectiveType", e.target.value)}
                >
                  <option value="">Select kind…</option>
                  {kinds.map((k, i) => <option key={i} value={k}>{k}</option>)}
                </select>
              </Field>
              <Field label="Description" required full hint="One paragraph. Structure, motive, public face.">
                <textarea
                  className="join-textarea is-medium"
                  value={form.newCollectiveDesc || ""}
                  onChange={e => set("newCollectiveDesc", e.target.value.slice(0, 1000))}
                  placeholder="Who they are, what they do, why they're a unit."
                  maxLength={1000}
                />
                <div style={{textAlign:"right",fontSize:"11px",opacity:0.6,marginTop:"4px",fontFamily:"var(--mono)"}}>
                  {(form.newCollectiveDesc || "").length} / 1000
                </div>
              </Field>
              <Field label="Brand Colour" hint="Optional hex (e.g. #c41a1a). Admin may or may not wire it through.">
                <input
                  className="join-input"
                  type="text"
                  value={form.newCollectiveColor || ""}
                  onChange={e => set("newCollectiveColor", e.target.value)}
                  placeholder="#c41a1a"
                />
              </Field>
              <Field label="Banner URL" hint="Optional image URL. Same caveat as colour.">
                <input
                  className="join-input"
                  type="url"
                  value={form.newCollectiveBanner || ""}
                  onChange={e => set("newCollectiveBanner", e.target.value)}
                  placeholder="https://i.ibb.co/…"
                />
              </Field>

              <FieldGroup title="Founding Members"/>
              <Field label="Founding Members" required full hint="At least one row with alias, character, and role.">
                <div className="join-members">
                  {members.length === 0 && (
                    <div className="join-members-empty">No members yet — add the first founder below.</div>
                  )}
                  {members.map((m, i) => (
                    <div className="join-member-row" key={i}>
                      <div className="join-member-num">{String(i+1).padStart(2,"0")}</div>
                      <input
                        className="join-input join-member-input"
                        type="text"
                        value={m.alias || ""}
                        onChange={e => updateMember(i, "alias", e.target.value)}
                        placeholder="Alias"
                        aria-label={`Member ${i+1} alias`}
                      />
                      <input
                        className="join-input join-member-input"
                        type="text"
                        value={m.char || ""}
                        onChange={e => updateMember(i, "char", e.target.value)}
                        placeholder="Character name"
                        aria-label={`Member ${i+1} character`}
                      />
                      <input
                        className="join-input join-member-input"
                        type="text"
                        value={m.role || ""}
                        onChange={e => updateMember(i, "role", e.target.value)}
                        placeholder="Role (e.g. Leader)"
                        aria-label={`Member ${i+1} role`}
                      />
                      <button
                        type="button"
                        className="join-member-remove"
                        onClick={() => removeMember(i)}
                        aria-label={`Remove member ${i+1}`}
                      ><Icon name="x" size={14}/></button>
                    </div>
                  ))}
                  <button type="button" className="join-member-add" onClick={addMember}>
                    + Add founding member
                  </button>
                </div>
              </Field>
            </>
          )}
        </>
      )}

      {/* POWER — required for join flows, optional for create-new
          (founder may not be a member themselves). */}
      {onPage("power") && (
        <>
          {flow === "createNew" && (
            <div className="join-info-card">
              <strong>Optional for create-new.</strong> Founders aren't required to attach power
              details. If you're founding-and-playing this collective, fill in your power below.
              Otherwise advance to Confirm.
            </div>
          )}
          <PowerFields form={form} set={set}/>
        </>
      )}

      {/* SUBMIT — final tail (notes + rules ack + honeypot). */}
      {onPage("submit") && <TailFields form={form} set={set}/>}
    </div>
  );
}

// Small read-only panel that surfaces a writer's current per-pool,
// per-tier character counts the moment they pick their Writer Tag.
// Counts come from the Worker's /quota-stats endpoint; the OOC mapping
// and character lists never leave the server.

function JoinFieldset({type, form, set, quotaStats, oocTags, wizardPageId}){
  // wizardPageId: when present, render only the fields belonging to
  // that wizard page. When absent (collective/outside legacy types),
  // render the full single-page form.
  const onPage = (id) => !wizardPageId || wizardPageId === id;
  // Pool this form would route to — student form → student pool,
  // everything else → adult. Used to highlight the relevant row in
  // the quota panel below the Writer Tag dropdown.
  const activePool = type === "student" ? "student" : "adult";

  // Writer Tag dropdown state. `form.oocPreset` tracks which option is
  // selected; "_other" reveals a freeform text input that writes into
  // `form.ooc` directly. For preset selections, both fields hold the
  // same value so server-side consumption is uniform.
  const onOocSelect = (v) => {
    if (v === "_other") {
      set("oocPreset", "_other");
      // Don't clear ooc if they're switching back from a preset and
      // had nothing typed — let them edit. But if they came from a
      // preset value, clear it so the text input starts empty.
      if (form.oocPreset && form.oocPreset !== "_other") set("ooc", "");
    } else {
      set("oocPreset", v);
      set("ooc", v);
    }
  };

  const Common = (
    <>
      <Field label="Character Name" required>
        <input className="join-input" type="text" value={form.char || ""} onChange={e => set("char", e.target.value)} placeholder="Full name"/>
      </Field>
      <Field label="RPC Profile Link" required hint="roleplay.chat profile URL">
        <input className="join-input" type="url" value={form.rpcLink || ""} onChange={e => set("rpcLink", e.target.value)} placeholder="https://www.roleplay.chat/..."/>
      </Field>
      <Field label="Writer Tag" required hint="Your OOC handle — used internally for quota tracking. Never shown publicly." full>
        <select
          className="join-select"
          value={form.oocPreset || ""}
          onChange={e => onOocSelect(e.target.value)}
        >
          <option value="">Select your handle…</option>
          {(oocTags || []).map(n => <option key={n} value={n}>{n}</option>)}
          <option value="_other">Other / new writer…</option>
        </select>
        {form.oocPreset === "_other" && (
          <input
            className="join-input"
            style={{marginTop: "8px"}}
            type="text"
            value={form.ooc || ""}
            onChange={e => set("ooc", e.target.value)}
            placeholder="Type your handle"
          />
        )}
        {/* Inline quota panel removed — the top sticky HUD shows the
            same data once a writer tag is entered. */}
      </Field>
    </>
  );

  if (type === "student"){
    return (
      <div className="join-fieldset" data-wiz-page={wizardPageId || ""}>
        {onPage("profile") && (
          <>
            <FieldGroup title="Character Profile"/>
            {Common}
            <Field label="Stage Name / Alias" hint="If they have a hero name yet" full>
              <input className="join-input" type="text" value={form.alias || ""} onChange={e => set("alias", e.target.value)} placeholder="VOLT, KESTREL, etc."/>
            </Field>
          </>
        )}
        {onPage("role") && (
          <>
            <FieldGroup title="Enrollment"/>
            <div className="join-info-card">
              <p className="join-info-rule">House placement is not chosen — it is assigned.</p>
              <p className="join-info-sub">Every student is assessed mentally and physically before arriving. Your house is confirmed in your acceptance letter before you set foot on campus. Select the house that fits your character's power profile; mismatches will be flagged on review.</p>
              <div className="join-info-houses">
                <div className="join-info-house"><span className="jih-name">Valaris</span><span className="jih-desc">Bravery, bold action, and moral decisiveness</span></div>
                <div className="join-info-house"><span className="jih-name">Orenne</span><span className="jih-desc">Resilience, hard work, and dependability</span></div>
                <div className="join-info-house"><span className="jih-name">Saberis</span><span className="jih-desc">Strategy, precision, and calculated ambition</span></div>
                <div className="join-info-house"><span className="jih-name">Grimere</span><span className="jih-desc">Intellectual, technical, and creative</span></div>
              </div>
            </div>
            <Field label="House" required full>
              <select className="join-select" value={form.house || ""} onChange={e => set("house", e.target.value)}>
                <option value="">Select house…</option>
                {JOIN_HOUSES.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </Field>
            <Field label="Year" required hint="Fr 18–19 · So 19–20 · Jr 20–21 · Sr 21–22" full>
              <select className="join-select" value={form.year || ""} onChange={e => set("year", e.target.value)}>
                <option value="">Select year…</option>
                {JOIN_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </Field>
            <Field label="Track" required>
              <select className="join-select" value={form.track || ""} onChange={e => set("track", e.target.value)}>
                <option value="">Select track…</option>
                {JOIN_TRACKS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Tier" required hint="A through D">
              <select className="join-select" value={form.tier || ""} onChange={e => set("tier", e.target.value)}>
                <option value="">Select tier…</option>
                {JOIN_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <FieldGroup title="Optional Extras"/>
            <StudentExtras form={form} set={set}/>
          </>
        )}
        {onPage("power") && (
          <PowerFields form={form} set={set} allowHuman={false}/>
        )}
        {onPage("submit") && (
          <TailFields form={form} set={set}/>
        )}
      </div>
    );
  }

  if (type === "faculty"){
    const openRoles = getOpenFacultyRoles();
    return (
      <div className="join-fieldset" data-wiz-page={wizardPageId || ""}>
        {onPage("profile") && (
          <>
            <FieldGroup title="Character Profile"/>
            {Common}
            <Field label="Stage Name / Alias" hint="Public-facing alias. Optional." full>
              <input className="join-input" type="text" value={form.alias || ""} onChange={e => set("alias", e.target.value)} placeholder="Optional"/>
            </Field>
          </>
        )}
        {onPage("role") && (
          <>
            <FieldGroup title="Faculty Position"/>
            <Field label="Open Faculty Role" required hint="Only open roles are listed" full>
              <select
                className="join-select"
                value={form.facultyRole || ""}
                onChange={e => {
                  const role = e.target.value;
                  const found = openRoles.find(r => r.role === role);
                  set("facultyRole", role);
                  set("facultySection", found ? found.section : "");
                }}
              >
                <option value="">Select role…</option>
                {openRoles.map((r, i) => (
                  <option key={i} value={r.role}>{r.section} — {r.role}</option>
                ))}
              </select>
            </Field>
            <Field label="Ranking" required hint="A-List · B-List · C-List · D-List — counts toward your adult-pool quota" full>
              <select className="join-select" value={form.tier || ""} onChange={e => set("tier", e.target.value)}>
                <option value="">Select ranking…</option>
                {JOIN_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </>
        )}
        {onPage("power") && <PowerFields form={form} set={set}/>}
        {onPage("submit") && <TailFields form={form} set={set}/>}
      </div>
    );
  }

  if (type === "strata"){
    const isCorporate = form.strataRole === "corporate";
    return (
      <div className="join-fieldset" data-wiz-page={wizardPageId || ""}>
        {onPage("profile") && (
          <>
            <FieldGroup title="Character Profile"/>
            {Common}
          </>
        )}
        {onPage("role") && (
          <>
            <FieldGroup title="STRATA Position"/>
            <Field label="STRATA Role" required hint="Talent = hero roster. Corporate = executive, field, or PR." full>
              <select className="join-select" value={form.strataRole || ""} onChange={e => set("strataRole", e.target.value)}>
                <option value="">Select role…</option>
                <option value="talent">Talent (Hero)</option>
                <option value="corporate">Corporate</option>
              </select>
            </Field>
            {form.strataRole === "talent" && (<>
            <Field label="Stage Name / Alias" required hint="Their hero name" full>
              <input className="join-input" type="text" value={form.alias || ""} onChange={e => set("alias", e.target.value)} placeholder="ARCLIGHT, etc."/>
            </Field>
            <Field label="Tier" required hint="A-list = top of roster" full>
              <select className="join-select" value={form.tier || ""} onChange={e => set("tier", e.target.value)}>
                <option value="">Select tier…</option>
                {JOIN_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            </>)}
            {isCorporate && (<>
            <Field label="Department" required hint="Which division they work in" full>
              <select className="join-select" value={form.strataDept || ""} onChange={e => set("strataDept", e.target.value)}>
                <option value="">Select department…</option>
                {JOIN_STRATA_DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Role / Title" required hint="e.g. Board Member, Senior Handler, PR Director" full>
              <input className="join-input" type="text" value={form.strataTitle || ""} onChange={e => set("strataTitle", e.target.value)} placeholder="e.g. Senior Handler"/>
            </Field>
            </>)}
          </>
        )}
        {onPage("power") && form.strataRole && (
          <PowerFields form={form} set={set} allowHuman={isCorporate}/>
        )}
        {onPage("submit") && <TailFields form={form} set={set}/>}
      </div>
    );
  }

  if (type === "club"){
    const openPos = getOpenClubPositions();
    return (
      <div className="join-fieldset" data-wiz-page={wizardPageId || ""}>
        {onPage("profile") && (
          <>
            <FieldGroup title="Character Profile"/>
            {Common}
          </>
        )}
        {onPage("role") && (
          <>
            <FieldGroup title="Club Position"/>
            <Field label="Open Club Position" required hint="Only open positions are listed. Per-writer club caps apply — to keep enough room for new writers, you can only hold a limited number of positions per club, counted across your characters. Caps will increase as the room grows." full>
              <select
                className="join-select"
                value={form.clubPositionKey ?? ""}
                onChange={e => {
                  const raw = e.target.value;
                  const idx = raw === "" ? -1 : parseInt(raw, 10);
                  const found = idx >= 0 ? openPos[idx] : null;
                  set("clubPositionKey", raw);
                  // Invite confirmation is per-selection — never carry it
                  // over from a previously picked Supebrawl slot.
                  set("supebrawlInvite", false);
                  if (found){
                    set("clubPosition", found.position);
                    set("clubName",     found.club);
                    set("clubTeam",     found.team || "");
                  } else {
                    set("clubPosition", "");
                    set("clubName",     "");
                    set("clubTeam",     "");
                  }
                }}
              >
                <option value="">Select position…</option>
                {openPos.map((p, i) => (
                  <option key={i} value={i}>
                    {p.club}{p.team ? ` · ${p.team}` : ""} — {p.position}
                  </option>
                ))}
              </select>
            </Field>
            {form.clubName === "Supebrawl" && (
              <Field label="Supebrawl · Invitation Check" required hint="Supebrawl is invite-only. The ring is Sven Skarsen's — entry is arranged with his typist in RP before any application goes in. One character per writer." full>
                <label className="join-checkbox">
                  <input type="checkbox" checked={!!form.supebrawlInvite} onChange={e => set("supebrawlInvite", e.target.checked)}/>
                  <span>I have spoken to Sven Skarsen's typist in RP and this character's invitation to the ring has been agreed.</span>
                </label>
              </Field>
            )}
            {/* Live per-writer club-cap usage for the selected pick —
                surfaces FULL / OVER CAP before submit instead of only
                blocking at the relay. Data comes back with the quota
                stats (counts only, no names). */}
            {form.clubPosition && quotaStats?.club?.buckets?.length > 0 && (
              <div className="join-club-usage" role="status">
                <span className="join-club-usage-lbl">Your {quotaStats.club.club} usage</span>
                <span className="join-club-usage-chips">
                  {quotaStats.club.buckets.map((b, i) => {
                    const over = b.count > b.limit;
                    const full = b.count >= b.limit;
                    return (
                      <span key={i} className={"join-club-usage-chip" + (over ? " is-over" : full ? " is-full" : "")}>
                        <b>{b.count}</b>&thinsp;/&thinsp;{b.limit} {b.label}
                        {(over || full) && <em>{over ? "OVER CAP" : "FULL"}</em>}
                      </span>
                    );
                  })}
                </span>
                {quotaStats.club.buckets.some(b => b.count >= b.limit) && (
                  <span className="join-club-usage-note">
                    This pick is at or over the per-writer cap — the relay will refuse it. Caps rise as the room grows.
                  </span>
                )}
              </div>
            )}
          </>
        )}
        {onPage("submit") && <TailFields form={form} set={set}/>}
      </div>
    );
  }

  if (type === "gov"){
    const openSeats = getOpenGovSeats();
    return (
      <div className="join-fieldset" data-wiz-page={wizardPageId || ""}>
        {onPage("profile") && (
          <>
            <FieldGroup title="Character Profile"/>
            {Common}
          </>
        )}
        {onPage("role") && (
          <>
            <FieldGroup title="Government Seat"/>
            <Field label="Open Government Seat" required hint="Only open seats are listed" full>
              <select
                className="join-select"
                value={form.govSeatKey ?? ""}
                onChange={e => {
                  const raw = e.target.value;
                  const idx = raw === "" ? -1 : parseInt(raw, 10);
                  const found = idx >= 0 ? openSeats[idx] : null;
                  set("govSeatKey", raw);
                  if (found){
                    set("govSeat",    found.position);
                    set("govSection", found.section);
                    set("govTerm",    found.term);
                  } else {
                    set("govSeat",    "");
                    set("govSection", "");
                    set("govTerm",    "");
                  }
                }}
              >
                <option value="">Select seat…</option>
                {openSeats.map((s, i) => (
                  <option key={i} value={i}>{s.section} — {s.position}{s.term ? ` (${s.term})` : ""}</option>
                ))}
              </select>
            </Field>
          </>
        )}
        {onPage("submit") && <TailFields form={form} set={set}/>}
      </div>
    );
  }

  if (type === "collective"){
    return <CollectiveFieldset form={form} set={set} Common={Common} wizardPageId={wizardPageId}/>;
  }

  if (type === "outside"){
    const orgs = getOutsideOrgs();
    const isCivilianStatus = form.outsideStatus === "inactive";
    return (
      <div className="join-fieldset" data-wiz-page={wizardPageId || ""}>
        {onPage("profile") && (
          <>
            <FieldGroup title="Character Profile"/>
            {Common}
            <Field label="Stage Name / Alias" hint="Hero name, codename, or working alias. Skip if they go by their real name." full>
              <input className="join-input" type="text" value={form.alias || ""} onChange={e => set("alias", e.target.value)} placeholder="e.g. VULCAN, BLÓÐHUNDR — leave blank if none"/>
            </Field>
          </>
        )}
        {onPage("role") && (
          <>
            <FieldGroup title="Affiliation"/>
            <Field label="Organisation" required full>
              <select
                className="join-select"
                value={form.outsideOrgKey ?? ""}
                onChange={e => {
                  const raw = e.target.value;
                  const idx = raw === "" ? -1 : parseInt(raw, 10);
                  const found = idx >= 0 ? orgs[idx] : null;
                  set("outsideOrgKey", raw);
                  if (found){
                    set("outsideOrg",     found.name);
                    set("outsideSection", found.section);
                  } else {
                    set("outsideOrg",     "");
                    set("outsideSection", "");
                  }
                }}
              >
                <option value="">Select organisation…</option>
                {orgs.map((o, i) => (
                  <option key={i} value={i}>{o.section} — {o.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Role at Organisation" required hint="e.g. Boss, Capo, Singer, DCI, Councillor, Reporter, Fixer" full>
              <input className="join-input" type="text" value={form.outsideRole || ""} onChange={e => set("outsideRole", e.target.value)} placeholder="Job title or rank"/>
            </Field>
            <FieldGroup title="Registry Classification"/>
            <Field label="STRATA Registry Status" required hint="How does STRATA classify this character on the Powers Registry?" full>
              <select className="join-select" value={form.outsideStatus || ""} onChange={e => set("outsideStatus", e.target.value)}>
                <option value="">Select status…</option>
                {JOIN_OUTSIDE_STATUSES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Tier" required hint={isCivilianStatus ? "Civilians typically register as N/A" : "Threat / capability tier — choose N/A if not applicable"} full>
              <select className="join-select" value={form.tier || ""} onChange={e => set("tier", e.target.value)}>
                <option value="">Select tier…</option>
                {JOIN_OUTSIDE_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </>
        )}
        {onPage("power")  && <PowerFields form={form} set={set}/>}
        {onPage("submit") && <TailFields form={form} set={set}/>}
      </div>
    );
  }

  return null;
}

function Field({label, required, hint, full, children}){
  return (
    <div className={"join-field" + (full ? " full" : "")}>
      <div className="join-field-label">
        {label}
        {required && <span className="join-field-required">*</span>}
        {hint && <span className="join-field-hint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Honeypot({form, set}){
  return (
    <div className="join-hp" aria-hidden="true">
      <label>Leave this field empty
        <input type="text" tabIndex={-1} autoComplete="off" value={form.hp || ""} onChange={e => set("hp", e.target.value)}/>
      </label>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CAMPUS MAP TAB — editorial gazetteer

   Built using the site's existing comic-editorial vocabulary
   (lore-eyebrow, lore-h, lore-house-hd, curr-row pattern). No
   per-district rainbow colours; red+gold like everywhere else.
   Houses get their proper crests + virtue + display caps.
   ═══════════════════════════════════════════════════════════════════════════ */

const HOUSE_LORE_META = {
  valaris: { name: "VALARIS", virtue: "House of Justice",     namesake: "Adrian Valaris · Paragon",   color: "#c41a1a", crest: "https://i.ibb.co/G4q9m34x/Valaris.png"  },
  orenne:  { name: "ORENNE",  virtue: "House of Fortitude",   namesake: "Margery Orenne · Aegis",     color: "#d4901a", crest: "https://i.ibb.co/0RQXNgXg/Orenne.png"   },
  saberis: { name: "SABERIS", virtue: "House of Prudence",    namesake: "Caius Saberis · Vigil",      color: "#15803d", crest: "https://i.ibb.co/qMry0fF2/Saberis.png"  },
  grimere: { name: "GRIMERE", virtue: "House of Temperance",  namesake: "Iris Grimere · Switchboard", color: "#1e40af", crest: "https://i.ibb.co/PGhrJBBm/Grimere.png" },
};

/* A single location row — modelled on the curriculum row pattern.
   Number on left, name + sub in the middle, expand chevron on right.
   Click reveals description + tags inline. */
function MapLocCard({loc}){
  return (
    <article className={"map-loc-card" + (loc.classified ? " is-classified" : "")}>
      <header className="map-loc-card-hd">
        <div className="map-loc-card-hd-l">
          <span className="map-loc-card-num">{loc.n}</span>
          <h4 className="map-loc-card-name">
            {loc.name}
            {loc.classified && <span className="map-loc-card-cls">CLASSIFIED</span>}
          </h4>
        </div>
        {loc.sub && <span className="map-loc-card-sub">{loc.sub}</span>}
      </header>
      <p className="map-loc-card-desc" dangerouslySetInnerHTML={{__html: loc.desc}}/>
      {loc.tags && loc.tags.length > 0 && (
        <ul className="map-loc-card-tags">
          {loc.tags.map((t,i) => (<li key={i} className="map-loc-card-tag">{t}</li>))}
        </ul>
      )}
    </article>
  );
}

function MapLocGrid({items}){
  return (
    <div className="map-grid">
      {items.map(loc => (<MapLocCard key={loc.id} loc={loc}/>))}
    </div>
  );
}

/* Compact list variant — uniform row height, single-line description.
   Used as the default for non-residence districts. Trades the full prose
   of MapLocCard for a scannable gazetteer that doesn't feel jarring when
   some entries are richer than others. */
function MapLocList({items}){
  // Strip the location desc down to the first sentence so chapel-length
  // entries don't dwarf the one-liners next to them.
  const trim = (s) => {
    if (!s) return "";
    const cleaned = String(s).replace(/<[^>]+>/g, "");
    const m = cleaned.match(/^.+?[.!?](?=\s|$)/);
    return (m ? m[0] : cleaned).trim();
  };
  return (
    <ul className="map-list">
      {items.map(loc => (
        <li key={loc.id} className={"map-list-row" + (loc.classified ? " is-classified" : "")}>
          <span className="map-list-n">{loc.n}</span>
          <div className="map-list-body">
            <div className="map-list-hd">
              <h4 className="map-list-name">{loc.name}</h4>
              {loc.sub && <span className="map-list-sub">{loc.sub}</span>}
              {loc.classified && <span className="map-list-cls">CLASSIFIED</span>}
            </div>
            <p className="map-list-desc">{trim(loc.desc)}</p>
            {loc.tags && loc.tags.length > 0 && (
              <ul className="map-list-tags">
                {loc.tags.map((t, i) => (<li key={i} className="map-list-tag">{t}</li>))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

/* Residence section — house identity via a clean section divider
   (color bar + name + virtue + count), with rooms in the same compact
   MapLocList format used by every other district. */
function ResidenceBlocks({items}){
  const houseOrder = ["valaris", "orenne", "saberis", "grimere"];
  const byHouse = {};
  const communal = [];
  items.forEach(loc => {
    if (loc.house && houseOrder.includes(loc.house)) {
      (byHouse[loc.house] = byHouse[loc.house] || []).push(loc);
    } else {
      communal.push(loc);
    }
  });

  return (
    <div className="map-residence">
      {houseOrder.map(houseId => {
        const list = byHouse[houseId];
        if (!list || !list.length) return null;
        const m = HOUSE_LORE_META[houseId];
        return (
          <section
            key={houseId}
            className="map-house"
            style={{"--h-color": m.color}}
          >
            <header className="map-house-hd">
              <div className="map-house-hd-l">
                <span className="map-house-hd-name">{m.name}</span>
                <span className="map-house-hd-virtue">{m.virtue}</span>
              </div>
              <span className="map-house-hd-count">
                <b>{list.length}</b>
                <span>{list.length === 1 ? "room" : "rooms"}</span>
              </span>
            </header>
            <ol className="map-stage-pins map-stage-pins-house">
              {list.map((loc, i) => (
                <MapStageLocation key={loc.id} loc={loc} idx={i}/>
              ))}
            </ol>
          </section>
        );
      })}

      {communal.length > 0 && (
        <section className="map-house map-house-communal" style={{"--h-color": "#d4a84a"}}>
          <header className="map-house-hd">
            <div className="map-house-hd-l">
              <span className="map-house-hd-name">POLICY</span>
              <span className="map-house-hd-virtue">Applies to all four houses</span>
            </div>
            <span className="map-house-hd-count">
              <b>{communal.length}</b>
              <span>{communal.length === 1 ? "entry" : "entries"}</span>
            </span>
          </header>
          <p className="map-house-blurb">
            Houses are private; the shared spaces between them are not. The residential quad, the communal kitchen, the laundry, the snug and the garden courtyard belong to everyone — you'll find them under <strong>Campus Commons</strong>.
          </p>
          <ol className="map-stage-pins map-stage-pins-house">
            {communal.map((loc, i) => (
              <MapStageLocation key={loc.id} loc={loc} idx={i}/>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   DISTRICT VISUAL PRESETS — used for the placeholder banner image
   on each district until real photography is dropped in. Keyed to the
   district id from data.js mapDistricts.
   ──────────────────────────────────────────────────────────────────── */
const DISTRICT_VISUALS = {
  academic:  { c1: "#3b4a6e", c2: "#10172b", icon: "book-open",   tag: "STUDIES" },
  training:  { c1: "#a82431", c2: "#3a070d", icon: "shield",      tag: "COMBAT" },
  residence: { c1: "#a87520", c2: "#2c1c0a", icon: "users",       tag: "DORMS"  },
  strata:    { c1: "#1e3a5f", c2: "#08111e", icon: "file-text",   tag: "CORP"   },
  athletics: { c1: "#2d6b3a", c2: "#0c1d12", icon: "sparkles",    tag: "FIELD"  },
  commons:   { c1: "#c18b3c", c2: "#3c2812", icon: "users",       tag: "COMMON" },
  perimeter: { c1: "#3a3a44", c2: "#0e0e14", icon: "shield",      tag: "BORDER" },
  outside:   { c1: "#2c5d6e", c2: "#0a1820", icon: "map",         tag: "EXTERNAL"},
};

function DistrictBanner({ district, idx, count }){
  const v = DISTRICT_VISUALS[district.id] || DISTRICT_VISUALS.academic;
  return (
    <div
      className="map-banner"
      style={{
        "--db-c1": v.c1,
        "--db-c2": v.c2,
      }}
      role="img"
      aria-label={`${district.name} — placeholder banner`}
    >
      {/* Gradient + halftone overlay handled in CSS; this div is the
          structural container only. */}
      <div className="map-banner-halftone" aria-hidden="true"/>
      <div className="map-banner-grain" aria-hidden="true"/>
      <div className="map-banner-icon" aria-hidden="true">
        <Icon name={v.icon} size={140} stroke={1}/>
      </div>
      <div className="map-banner-meta">
        <div className="map-banner-num">
          <span className="map-banner-num-tag">{v.tag}</span>
          <span className="map-banner-num-divider">·</span>
          <span className="map-banner-num-n">DISTRICT {String(idx + 1).padStart(2, "0")}</span>
        </div>
        <div className="map-banner-name">{district.name}</div>
        <div className="map-banner-count">
          {count} {count === 1 ? "LOCATION" : "LOCATIONS"} ON RECORD
        </div>
      </div>
      <div className="map-banner-placeholder-stamp" aria-hidden="true">
        IMAGE · PLACEHOLDER
      </div>
    </div>
  );
}

/* Field-guide location card · everything visible at a glance, no
   dropdowns. Map-style pin marker + name + sub + description + tags. */
function MapStageLocation({loc, idx}){
  return (
    <li className={"map-stage-pin" + (loc.classified ? " is-classified" : "")}>
      <div className="map-stage-pin-rail" aria-hidden="true">
        <span className="map-stage-pin-marker">{loc.n}</span>
        <span className="map-stage-pin-line"/>
      </div>
      <div className="map-stage-pin-body">
        <header className="map-stage-pin-hd">
          <h4 className="map-stage-pin-name">{loc.name}</h4>
          {loc.classified && <span className="map-stage-pin-cls">CLASSIFIED</span>}
        </header>
        {loc.sub && <div className="map-stage-pin-sub">{loc.sub}</div>}
        <p className="map-stage-pin-desc" dangerouslySetInnerHTML={{__html: loc.desc}}/>
        {loc.tags && loc.tags.length > 0 && (
          <ul className="map-stage-pin-tags">
            {loc.tags.map((t, i) => (<li key={i} className="map-stage-pin-tag">{t}</li>))}
          </ul>
        )}
      </div>
    </li>
  );
}

/* Short labels for the sticky district nav so 8 chips fit one row without
   overflow. Falls back to the full name when no short is mapped. */
const DISTRICT_SHORT = {
  academic:  "Academic",
  training:  "Training",
  residence: "Houses",
  strata:    "STRATA",
  athletics: "Athletics",
  commons:   "Commons",
  perimeter: "Perimeter",
  outside:   "Outside",
};

function MapTab(){
  const districts = D.mapDistricts;
  const locations = D.mapLocations;
  const districtsWithItems = districts.filter(d => locations.some(l => l.district === d.id));
  const [activeId, setActiveId] = useState(districtsWithItems[0]?.id);
  const [posterExpanded, setPosterExpanded] = useState(false);
  const [query, setQuery] = useState("");

  // Warm the browser cache for every district hero image the moment the
  // map tab mounts, so switching districts is instant. The images are
  // served from catbox.moe which has no CDN — without this prefetch each
  // click pays the full network round-trip again.
  useEffect(() => {
    const prefetched = districts
      .filter(d => d.image)
      .map(d => {
        const img = new Image();
        img.decoding = "async";
        img.src = d.image;
        return img;
      });
    return () => { prefetched.length = 0; };
  }, [districts]);

  const ql = query.trim().toLowerCase();
  const matchLoc = (l) => {
    if (!ql) return true;
    const hay = [
      l.name, l.sub, l.desc,
      ...(l.tags || []),
      l.classified ? "classified" : "",
    ].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(ql);
  };

  const activeDistrict = districtsWithItems.find(d => d.id === activeId) || districtsWithItems[0];
  const activeIdx = districtsWithItems.findIndex(d => d.id === activeDistrict?.id);
  const activeItems = activeDistrict ? locations.filter(l => l.district === activeDistrict.id) : [];
  const isResidence = activeDistrict?.id === "residence";

  // Global search results — grouped by district
  const searchActive = !!ql;
  const searchGroups = searchActive
    ? districtsWithItems
        .map(d => ({
          d,
          items: locations.filter(l => l.district === d.id && matchLoc(l)),
        }))
        .filter(g => g.items.length > 0)
    : [];
  const searchTotal = searchGroups.reduce((a, g) => a + g.items.length, 0);

  return (
    <div>
      <PageHead
        stamp="DOC · 03 · GROUNDS"
        title={<>Campus map &amp; <em style={{fontFamily: 'var(--display)', fontStyle: 'normal'}}>grounds</em></>}
        body="Greenwich, London. The compound runs from Trafalgar Road to the Thames, with Greenwich Park at the eastern wall. What follows is the gazetteer — every door, room, and corner the registry will commit to in writing."
        pageNum="P. 003 / VIII"
      />

      <div className="map-search-bar" role="search">
        <div className="map-search-input-wrap">
          <i className="fa-solid fa-magnifying-glass map-search-icon" aria-hidden="true"></i>
          <input
            type="text"
            className="map-search-input"
            placeholder="Search locations, rooms, tags…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search the campus map"
          />
          {query && (
            <button
              type="button"
              className="map-search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            ><i className="fa-solid fa-xmark" aria-hidden="true"></i></button>
          )}
        </div>
        {searchActive && (
          <span className="map-search-count">
            <b>{searchTotal}</b> {searchTotal === 1 ? "match" : "matches"} across {searchGroups.length} district{searchGroups.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {/* Horizontal chip row · zone selector. Compact tabs along the top.
          Below it, a 40/60 stage panel that fits the viewport. */}
      <nav className="map-nav" aria-label="Campus districts">
        <ol className="map-nav-list">
          {districtsWithItems.map((d, i) => {
            const v = DISTRICT_VISUALS[d.id] || DISTRICT_VISUALS.academic;
            const total = locations.filter(l => l.district === d.id).length;
            const dCount = searchActive
              ? locations.filter(l => l.district === d.id && matchLoc(l)).length
              : total;
            const dimmed = searchActive && dCount === 0;
            const isActive = d.id === activeId && !searchActive;
            return (
              <li
                key={d.id}
                className={
                  "map-nav-item"
                  + (isActive ? " is-active" : "")
                  + (dimmed ? " is-dim" : "")
                }
              >
                <button
                  type="button"
                  className="map-nav-btn"
                  onClick={() => {
                    setQuery("");
                    setActiveId(d.id);
                  }}
                  aria-current={isActive ? "page" : undefined}
                  style={{"--map-nav-c": d.color}}
                >
                  <span className="map-nav-icon" aria-hidden="true">
                    <Icon name={v.icon} size={18} stroke={1.7}/>
                  </span>
                  <span className="map-nav-body">
                    <span className="map-nav-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="map-nav-name">{DISTRICT_SHORT[d.id] || d.name}</span>
                    <span className="map-nav-count">{dCount} {dCount === 1 ? "loc" : "locs"}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="map-page">
        <main className="map-main">
          {searchActive ? (
            <section className="map-district map-search-results">
              <header className="map-district-head">
                <div className="lore-eyebrow"><i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i> Search · {ql}</div>
                <h2 className="lore-h map-district-h">Results.</h2>
                <p className="map-district-blurb">
                  Showing every location across every district whose name, subtitle, description, or tag matches your query. Clear the search to return to the gazetteer.
                </p>
                <div className="map-district-meta">
                  <span className="map-district-count">{searchTotal} {searchTotal === 1 ? "location" : "locations"}</span>
                </div>
              </header>
              {searchGroups.length === 0 ? (
                <div className="map-search-empty">
                  <i className="fa-solid fa-circle-question map-search-empty-icon" aria-hidden="true"></i>
                  <div className="map-search-empty-label">No locations match “{query}”</div>
                  <div className="map-search-empty-sub">Try a different term, or clear the search to browse by district.</div>
                  <button type="button" className="map-search-empty-btn" onClick={() => setQuery("")}>Clear search</button>
                </div>
              ) : (
                <div className="map-search-groups">
                  {searchGroups.map(g => (
                    <div key={g.d.id} className="map-search-group">
                      <header className="map-search-group-hd">
                        <span className="map-search-group-name">{g.d.name}</span>
                        <span className="map-search-group-count">{g.items.length}</span>
                      </header>
                      <MapLocList items={g.items}/>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : (
            activeDistrict && (
              <section
                className={"map-stage" + (isResidence ? " is-residence" : "") + (posterExpanded ? " is-poster-expanded" : "")}
                style={{
                  "--district-c": activeDistrict.color,
                  "--district-c1": (DISTRICT_VISUALS[activeDistrict.id] || DISTRICT_VISUALS.academic).c1,
                  "--district-c2": (DISTRICT_VISUALS[activeDistrict.id] || DISTRICT_VISUALS.academic).c2,
                }}
                data-district={activeDistrict.id}
              >
                {/* LEFT · the cinematic poster — gradient + halftone +
                    massive icon glyph + overlay name. Stays in view on
                    desktop while the right column scrolls. When the
                    district has a hero image, it layers in behind the
                    overlays with a dark vignette for title legibility. */}
                <aside className={"map-stage-poster" + (activeDistrict.image ? " is-image" : "")} aria-hidden="true">
                  {activeDistrict.image && (
                    <img
                      className="map-stage-poster-img"
                      src={activeDistrict.image}
                      alt=""
                      decoding="async"
                      fetchpriority="high"
                    />
                  )}
                  {activeDistrict.image && <div className="map-stage-poster-img-vignette" aria-hidden="true"/>}
                  <div className="map-stage-poster-halftone"/>
                  <div className="map-stage-poster-grain"/>
                  <div className="map-stage-poster-glyph">
                    <Icon name={(DISTRICT_VISUALS[activeDistrict.id] || DISTRICT_VISUALS.academic).icon} size={220} stroke={0.9}/>
                  </div>
                  <div className="map-stage-poster-stamp">
                    <span className="map-stage-poster-stamp-tag">{(DISTRICT_VISUALS[activeDistrict.id] || DISTRICT_VISUALS.academic).tag}</span>
                    <span className="map-stage-poster-stamp-sep">·</span>
                    <span className="map-stage-poster-stamp-n">№ {String(activeIdx + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="map-stage-poster-title">
                    <span className="map-stage-poster-title-kicker">District {String(activeIdx + 1).padStart(2, "0")}</span>
                    <span className="map-stage-poster-title-name">{activeDistrict.name}</span>
                  </div>
                  <button
                    type="button"
                    className="map-stage-poster-expand"
                    onClick={() => setPosterExpanded(v => !v)}
                    aria-label={posterExpanded ? "Collapse district image" : "Expand district image"}
                    aria-pressed={posterExpanded}
                  >
                    <Icon name={posterExpanded ? "chevron-up" : "chevron-down"} size={12} stroke={2}/>
                    <span>{posterExpanded ? "COLLAPSE" : "EXPAND"}</span>
                  </button>
                </aside>

                {/* RIGHT · info column — deck (blurb) then sub-locations.
                    Header chrome lives entirely in the poster on the left;
                    don't duplicate the district name or stamp here. */}
                <div className="map-stage-info">
                  <header className="map-stage-head">
                    <p className="map-stage-deck">{activeDistrict.blurb}</p>
                  </header>

                  {isResidence ? (
                    <ResidenceBlocks items={activeItems}/>
                  ) : (
                    <section className="map-stage-locations">
                      <header className="map-stage-locations-hd">
                        <span className="map-stage-locations-lbl">Field Guide · Locations</span>
                        <span className="map-stage-locations-count">{activeItems.length}</span>
                      </header>
                      <ol className="map-stage-pins">
                        {activeItems.map((loc, i) => (
                          <MapStageLocation key={loc.id} loc={loc} idx={i}/>
                        ))}
                      </ol>
                    </section>
                  )}
                </div>
              </section>
            )
          )}

          {!searchActive && (
            <div className="map-footnote">
              <p>
                <strong>End gazetteer.</strong> Locations marked <em>CLASSIFIED</em> appear in this index by name only; access is restricted by Tier and by the discretion of the Dean's office. Off-campus venues are listed for reference and are not affiliated with the Institute except where noted.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   APP SHELL
═══════════════════════════════════════════════════════════════════════════ */
const TAB_MAP = {
  rules:      <RulesTab/>,
  faculty:    <FacultyTab/>,
  lore:       <HousesTab/>,
  map:        <MapTab/>,
  students:   <StudentsTab/>,
  strata:     <StrataTab/>,
  outside:    <OutsideTab/>,
  powers:     <PowersTab/>,
  clubs:      <ClubsTab/>,
  join:       <JoinTab/>,
};
// Legacy hash redirect: anyone with #houses in their URL gets sent to #lore
const TAB_ALIAS = { houses: "lore" };

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL SEARCH
═══════════════════════════════════════════════════════════════════════════ */
function GlobalSearch({open, onClose, onJump}){
  const [q, setQ] = useState("");
  const ql = q.trim().toLowerCase();

  const groups = useMemo(() => {
    if (!ql) return [];
    const matches = SEARCH_INDEX.filter(item => item.keys.includes(ql));
    const byKind = {};
    matches.forEach(m => {
      if (!byKind[m.kind]) byKind[m.kind] = [];
      byKind[m.kind].push(m);
    });
    const order = ["Student","Hero","Power","Faculty","STRATA","Group","Group Member","Outside","Club","Club Role","Team Player","Govt"];
    return order.filter(k => byKind[k]).map(k => ({kind: k, items: byKind[k]}));
  }, [ql]);

  const totalMatches = groups.reduce((n, g) => n + g.items.length, 0);

  useEffect(() => {
    if (!open) return;
    setQ("");
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    setTimeout(() => {
      const el = document.getElementById("gs-input");
      if (el) el.focus();
    }, 0);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleJump = (item) => {
    onJump(item.tab, item.subview);
    onClose();
  };

  return (
    <div className="gs-overlay" onClick={onClose}>
      <div className="gs-panel" onClick={e => e.stopPropagation()}>
        <div className="gs-panel-hd">
          <span className="gs-panel-icon" aria-hidden="true"><i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i></span>
          <input
            id="gs-input"
            type="text"
            className="gs-panel-input"
            placeholder="Search the entire registry…"
            value={q}
            onChange={e => setQ(e.target.value)}
            aria-label="Global search"
          />
          <button className="gs-panel-close" onClick={onClose} aria-label="Close search">
            ESC
          </button>
        </div>
        {ql && (
          <div className="gs-panel-count">
            {totalMatches} {totalMatches === 1 ? "match" : "matches"}
          </div>
        )}
        <div className="gs-panel-body">
          {!ql && (
            <div className="gs-empty">
              <div className="gs-empty-icon"><i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i></div>
              Type to search · Records will appear here
            </div>
          )}
          {ql && totalMatches === 0 && (
            <div className="gs-empty">
              <div className="gs-empty-icon"><i className="fa-solid fa-circle-question" aria-hidden="true"></i></div>
              No records found for "{q}"
            </div>
          )}
          {groups.map(g => (
            <div key={g.kind} className="gs-group">
              <div className="gs-group-hd">
                <span>{g.kind}{g.items.length === 1 ? "" : "s"}</span>
                <span className="gs-group-count">{g.items.length}</span>
              </div>
              {g.items.map((item, i) => (
                <button
                  key={i}
                  className="gs-result"
                  onClick={() => handleJump(item)}
                >
                  <div className="gs-result-main">
                    <div className="gs-result-label">{item.label}</div>
                    {item.sub && <div className="gs-result-sub">{item.sub}</div>}
                  </div>
                  <span className="gs-result-kind">{item.kind}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════════════════════ */
function Footer(){
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">CALDERYN</div>
          <div className="footer-line">STRATA INTERNAL · REGISTRY ARCHIVE · 2026</div>
          <div className="footer-meta">
            This document is the property of STRATA International. Distribution beyond Level&nbsp;II access is a Class&nbsp;III violation. The names, faces, and abilities recorded here are subject to non-disclosure under the same paperwork you signed when you walked through the gate.
          </div>
        </div>
        <div className="footer-stamp">
          <span className="footer-stamp-mark">⊠</span>
          Confidential<br/>
          Internal Only
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════════════════════════ */
const MUSIC_TRACK = {
  title: "Don't Be A Hero",
  artist: "Siren",
  src: "https://file.garden/afN5Az6TPxbx7GGe/Upchuck/Don't%20Be%20A%20Hero.wav",
  cover: "https://i.ibb.co/rjpwbf0/ezgif-1c133bbb2a505ce7.webp",
};

// Compact masthead-resident music player. Lives in the top nav bar
// between the brand and the search box. Single <audio> looped at 30%
// default volume with the same browser-policy-aware autoplay
// fallback as before (capture-phase listener that catches the user's
// first click anywhere).
// ─── MAST CHROME ────────────────────────────────────────────────────
// Live in-world readouts that live in the top nav between the music
// player and the search bar. Four chips:
//   · GREENWICH CLOCK   live ticking date + time in GMT/BST
//   · ACADEMIC TERM     current Calderyn term + week number
//   · STRATA STATUS     hour-of-day-driven threat level (atmospheric)
//   · ROSTER COUNT      total registered characters across the registry
// All four are derived; nothing is fetched. The chips animate, pulse,
// and update on a 1s timer in MastChrome.

// Calderyn academic-year structure. Modelled on the Hogwarts /
// British boarding-school three-term cycle:
//   AUTUMN TERM · 1 Sep  → 19 Dec   (15 weeks)  ← arrival / first half
//   SPRING TERM · 6 Jan  → 9 Apr    (13 weeks)  ← coursework heavy
//   SUMMER TERM · 18 Apr → 30 Jun   (11 weeks)  ← finals + Powerball cup
// Outside those windows the school is on holiday (Christmas / Easter /
// Summer break) and the chip reads "HOLIDAY · <next term>".
//
// The academic year is named by the September start, so a date in
// May 2026 belongs to academic year "2025-26".
function calderynTerm(now){
  const t = now.getTime();
  // Figure out which academic year we're in. Sep 1 onwards = next year.
  const cal = now.getUTCFullYear();
  const startYear = (now.getUTCMonth() >= 8) ? cal : cal - 1;
  const yearLabel = startYear + "-" + String((startYear + 1) % 100).padStart(2, "0");

  const terms = [
    { name: "AUTUMN", start: Date.UTC(startYear,     8, 1),  end: Date.UTC(startYear,     11, 19) }, // Sep 1 → Dec 19
    { name: "SPRING", start: Date.UTC(startYear + 1, 0, 6),  end: Date.UTC(startYear + 1, 3,  9)  }, // Jan 6 → Apr 9
    { name: "SUMMER", start: Date.UTC(startYear + 1, 3, 18), end: Date.UTC(startYear + 1, 5, 30) }, // Apr 18 → Jun 30
  ];

  // In-term?
  for (const term of terms) {
    if (t >= term.start && t <= term.end) {
      const wks = (t - term.start) / (1000 * 60 * 60 * 24 * 7);
      const totalWks = (term.end - term.start) / (1000 * 60 * 60 * 24 * 7);
      return {
        name: term.name,
        week: Math.floor(wks) + 1,
        totalWeeks: Math.ceil(totalWks),
        year: yearLabel,
        inSession: true,
      };
    }
  }
  // On holiday — figure out which break and what's next.
  const next = terms.find(term => t < term.start);
  let breakName = "SUMMER BREAK";
  if (next) {
    if (next.name === "SPRING") breakName = "CHRISTMAS BREAK";
    else if (next.name === "SUMMER") breakName = "EASTER BREAK";
    else breakName = "SUMMER BREAK";
  }
  return {
    name: breakName,
    nextTerm: next ? next.name : null,
    year: yearLabel,
    inSession: false,
  };
}

function MastChrome(){
  const [now, setNow] = useState(() => new Date());

  // 1s tick. Use setTimeout aligned to the next second rather than a
  // 1000ms interval so the clock advances cleanly with the wall clock
  // (an interval drifts by a few ms per minute over long sessions).
  useEffect(() => {
    let cancel = false;
    const schedule = () => {
      const ms = 1000 - (Date.now() % 1000);
      const t = setTimeout(() => {
        if (cancel) return;
        setNow(new Date());
        schedule();
      }, ms);
      return t;
    };
    const t = schedule();
    return () => { cancel = true; clearTimeout(t); };
  }, []);

  const term = calderynTerm(now);

  // GMT date / time formatted for in-world chrome:
  //   "20 MAY · 14:32:08 GMT"
  const day = now.getUTCDate();
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const mon = months[now.getUTCMonth()];
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mm = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  const dateStr = String(day).padStart(2, "0") + " " + mon;
  const timeStr = hh + ":" + mm + ":" + ss;

  const termTitle = term.inSession
    ? `Academic year ${term.year} · ${term.name} term, week ${term.week} of ${term.totalWeeks}`
    : `${term.year} academic year · currently on ${term.name.toLowerCase()}`;

  return (
    <div className="mast-chrome" role="group" aria-label="Live registry chrome">
      <div className="mast-chip mast-chip-clock" title="Greenwich Mean Time">
        <span className="mast-chip-eyebrow">GREENWICH</span>
        <span className="mast-chip-value">
          <span className="mast-chip-date">{dateStr}</span>
          <span className="mast-chip-sep">·</span>
          <span className="mast-chip-time">{timeStr}</span>
          <span className="mast-chip-tz">GMT</span>
        </span>
      </div>

      <div className={"mast-chip mast-chip-term" + (term.inSession ? " is-in-session" : " is-on-holiday")} title={termTitle}>
        <span className="mast-chip-eyebrow">{term.inSession ? "TERM" : "BREAK"}</span>
        <span className="mast-chip-value">
          {term.inSession ? (
            <>
              {term.name}
              <span className="mast-chip-sep">·</span>
              <span className="mast-chip-week">WK {String(term.week).padStart(2, "0")} / {term.totalWeeks}</span>
            </>
          ) : (
            <>{term.name}</>
          )}
        </span>
      </div>
    </div>
  );
}

function NowPlaying(){
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    try {
      const v = parseFloat(localStorage.getItem("calderyn:musicVolume"));
      return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.3;
    } catch { return 0.3; }
  });
  const [volOpen, setVolOpen] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    try { localStorage.setItem("calderyn:musicVolume", String(volume)); } catch {}
  }, [volume]);

  // Autoplay strategy:
  //   1. Start the audio MUTED at the configured volume. Every major
  //      browser (Chrome, Safari, Firefox, mobile) allows muted
  //      autoplay without prior user interaction, so the track begins
  //      buffering and playing immediately on page load.
  //   2. Latch a one-shot capture-phase listener for click / keydown /
  //      touchstart on the document. On the first real user gesture
  //      anywhere on the page, the audio is unmuted — by which point
  //      it's already playing, so the writer hears it instantly with
  //      no extra "tap to play" friction.
  //   3. We also explicitly re-issue play() on first gesture in case
  // Autoplay strategy (mobile-friendly):
  //   1. On mount, set audio.muted = true and call play() — muted
  //      autoplay is permitted by every browser without user
  //      interaction. The track starts buffering and playing
  //      silently.
  //   2. When the user taps the cover button, togglePlay() unmutes
  //      AND ensures playback. Tapping the cover the first time
  //      always becomes "make this audible" instead of "toggle".
  //   3. Subsequent taps on the cover (audio already unmuted) toggle
  //      play/pause normally.
  // Previously a document-wide capture-phase gesture listener was
  // also unmuting on any first click anywhere. That raced with the
  // cover button's togglePlay on mobile (capture handler set
  // muted=false + called play(); bubble reached togglePlay which
  // then read audio.paused=false and PAUSED the just-started
  // music). Removed the document listener — togglePlay alone now
  // handles the unmute-on-first-tap path, no race.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Saved volume from localStorage might be 0 (user muted in a
    // previous session). Don't let that mean "silent forever" on
    // a fresh visit — bump it back to 0.3 default if we're at 0
    // so the first tap on the cover produces audible playback.
    if (volume === 0) {
      audio.volume = 0.3;
    } else {
      audio.volume = volume;
    }
    audio.muted = true;
    let cancelled = false;
    const start = () => {
      const p = audio.play();
      if (!p || typeof p.then !== "function") return;
      p.then(
        () => { if (!cancelled) setIsPlaying(true); },
        () => {}
      );
    };
    // Attempt right away, and again once the media is ready in case
    // mount fired before the source could even start buffering.
    start();
    const onCanPlay = () => start();
    audio.addEventListener("canplay", onCanPlay);
    return () => {
      cancelled = true;
      audio.removeEventListener("canplay", onCanPlay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    // First tap when audio is muted (autoplay state) → unmute +
    // ensure playing. Treats the cover as "make audible" rather
    // than "toggle pause". Catches the mobile case where the cover
    // is the user's first interaction with the page.
    if (a.muted) {
      a.muted = false;
      // If volume got persisted to 0, restore a sensible default
      // so unmute actually produces sound.
      if (a.volume === 0) {
        a.volume = 0.3;
        setVolume(0.3);
      }
      if (a.paused) {
        const p = a.play();
        if (p && typeof p.then === "function") p.catch(() => {});
      }
      return;
    }
    if (a.paused) {
      const p = a.play();
      if (p && typeof p.then === "function") p.catch(() => {});
    } else {
      a.pause();
    }
  };

  const seek = (e) => {
    const a = audioRef.current;
    if (!a || !duration || !Number.isFinite(duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    a.currentTime = pct * duration;
    setCurrentTime(a.currentTime);
  };

  const fmt = (s) => {
    if (!Number.isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return m + ":" + (r < 10 ? "0" : "") + r;
  };

  const pct = duration ? (currentTime / duration) * 100 : 0;
  const muted = volume === 0;

  return (
    <div
      className={"mast-np" + (isPlaying ? " is-playing" : "")}
      role="region"
      aria-label="Music player"
    >
      <audio
        ref={audioRef}
        src={MUSIC_TRACK.src}
        preload="auto"
        loop
        playsInline
        webkit-playsinline="true"
        x-webkit-airplay="allow"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
      />

      <button
        type="button"
        className="mast-np-cover"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        style={{ backgroundImage: `url(${MUSIC_TRACK.cover})` }}
      >
        <span className="mast-np-cover-veil" aria-hidden="true">
          {isPlaying ? (
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
              <rect x="4" y="3" width="2.5" height="10" rx="0.6" fill="currentColor"/>
              <rect x="9.5" y="3" width="2.5" height="10" rx="0.6" fill="currentColor"/>
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
              <path d="M4 3 L13 8 L4 13 Z" fill="currentColor"/>
            </svg>
          )}
        </span>
      </button>

      <div className="mast-np-mid">
        <div className="mast-np-meta">
          <div className="mast-np-title" title={MUSIC_TRACK.title}>{MUSIC_TRACK.title}</div>
          <div className="mast-np-artist">
            <span className="mast-np-eq" aria-hidden="true">
              <i/><i/><i/>
            </span>
            {MUSIC_TRACK.artist}
          </div>
        </div>
        <div
          className="mast-np-bar"
          onClick={seek}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.floor(duration) || 0}
          aria-valuenow={Math.floor(currentTime) || 0}
          tabIndex={0}
        >
          <div className="mast-np-bar-fill" style={{ width: pct + "%" }}/>
        </div>
      </div>

      <div className="mast-np-times" aria-hidden="true">
        {fmt(currentTime)}<span>/</span>{fmt(duration)}
      </div>

      <div className={"mast-np-vol" + (volOpen ? " is-open" : "")}>
        <button
          type="button"
          className="mast-np-vol-btn"
          onClick={() => {
            if (muted) { setVolume(0.3); setVolOpen(true); }
            else setVolOpen(o => !o);
          }}
          onDoubleClick={() => setVolume(0)}
          aria-label={muted ? "Unmute" : "Volume"}
          title={muted ? "Unmute" : "Volume (double-click to mute)"}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M2 6 H5 L9 3 V13 L5 10 H2 Z" fill="currentColor"/>
            {muted ? (
              <path d="M11 5 L15 11 M15 5 L11 11" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
            ) : volume < 0.5 ? (
              <path d="M11 6 Q13 8 11 10" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
            ) : (
              <>
                <path d="M11 6 Q13 8 11 10" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                <path d="M13.5 4 Q16 8 13.5 12" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
              </>
            )}
          </svg>
        </button>
        <input
          type="range"
          min="0" max="1" step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="mast-np-vol-slider"
          style={{ "--np-vol-pct": (volume * 100) + "%" }}
          aria-label="Volume"
        />
      </div>
    </div>
  );
}

function App(){
  const validIds = TABS.map(t => t.id);

  // Parse a hash like "#lore/world" or "#houses" into {tab, subview}, applying aliases
  const parseHash = () => {
    try{
      const raw = (window.location.hash || "").replace(/^#/, "").split("/");
      let id = raw[0] || "";
      const sub = raw[1] || null;
      if (TAB_ALIAS[id]) id = TAB_ALIAS[id];
      if (validIds.includes(id)) return { tab: id, subview: sub };
    }catch(e){}
    return { tab: TABS[0].id, subview: null };
  };

  const initial = parseHash();
  const [tab, setTabState] = useState(initial.tab);
  const [gsOpen, setGsOpen] = useState(false);
  const [targetSubview, setTargetSubview] = useState(initial.subview);
  // Mobile nav drawer state retired — the viewport meta now forces a
  // 1200px logical width on every device, so the desktop tab strip
  // shows on phones too and the hamburger is gone.
  const setTab = useCallback((id) => {
    setTabState(id);
    try{ window.location.hash = id; }catch(e){}
  }, []);

  useEffect(() => {
    const onHash = () => {
      const parsed = parseHash();
      setTabState(parsed.tab);
      if (parsed.subview) setTargetSubview(parsed.subview);
    };
    try{ window.addEventListener("hashchange", onHash); }catch(e){}
    return () => { try{ window.removeEventListener("hashchange", onHash); }catch(e){} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"){
        e.preventDefault();
        setGsOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onTabKey = (e, idx) => {
    if(e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "Home" || e.key === "End"){
      e.preventDefault();
      let next = idx;
      if(e.key === "ArrowRight") next = (idx + 1) % TABS.length;
      if(e.key === "ArrowLeft")  next = (idx - 1 + TABS.length) % TABS.length;
      if(e.key === "Home")       next = 0;
      if(e.key === "End")        next = TABS.length - 1;
      setTab(TABS[next].id);
      const btn = document.querySelectorAll(".tab")[next];
      if(btn) btn.focus();
    }
  };

  const handleJump = useCallback((tabId, subview) => {
    if (subview) setTargetSubview(subview);
    setTab(tabId);
  }, [setTab]);

  const ctxValue = useMemo(() => ({
    targetSubview,
    consumeSubview: () => setTargetSubview(null),
  }), [targetSubview]);

  return (
    <RegContext.Provider value={ctxValue}>
      <header className="masthead">
        <div className="mast-inner">
          <div className="mast-brand">
            <div className="mast-brand-mark" aria-label="Calderyn College">CC</div>
            <div className="mast-brand-text">
              <div className="mast-brand-name">Calderyn College</div>
              <div className="mast-brand-sub">Central Registry · Greenwich</div>
              <div className="mast-brand-founded">Est. 1965</div>
            </div>
          </div>
          <div className="mast-meta">
            <span className="mast-meta-cell">
              <span className="dot live"/>
              <strong>Live</strong>
              <span>2026 · Vol. XI</span>
            </span>
            <span className="mast-meta-sep">/</span>
            <span className="mast-meta-cell">
              <span className="dot"/>
              <strong>Clearance</strong>
              <span>Level II</span>
            </span>
          </div>
          <NowPlaying/>
          <MastChrome/>
          <button
            type="button"
            className="mast-search"
            onClick={() => setGsOpen(true)}
            aria-label="Open global search"
          >
            <span className="mast-search-icon" aria-hidden="true"><i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i></span>
            <span className="mast-search-text">Search the registry…</span>
            <span className="mast-search-kbd">⌘K</span>
          </button>
          <div className="mast-strata" aria-label="STRATA International — operator">
            <div className="mast-strata-logo" aria-hidden="true"/>
            <div className="mast-strata-text">
              <div className="mast-strata-name">STRATA</div>
              <div className="mast-strata-sub">International · Operator</div>
            </div>
          </div>
        </div>
      </header>

      <nav
        className="tabs"
        role="tablist"
        aria-label="Registry sections"
      >
        <div className="tabs-inner" id="tabs-drawer">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              className={"tab" + (tab === t.id ? " on" : "")}
              onClick={() => setTab(t.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              role="tab"
              aria-selected={tab === t.id}
              aria-controls="panel"
              tabIndex={tab === t.id ? 0 : -1}
            >
              <span className="tab-num">{t.n}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="pg" id="panel" role="tabpanel">
        {tab === "home" ? <HomeTab setTab={setTab}/> : TAB_MAP[tab]}
      </div>

      <Footer/>

      <GlobalSearch open={gsOpen} onClose={() => setGsOpen(false)} onJump={handleJump}/>
    </RegContext.Provider>
  );
}

try{
  ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
}catch(err){
  document.getElementById("root").innerHTML =
    '<div style="padding:32px;font-family:Söhne,system-ui,sans-serif;color:#f1ede4;background:#0c0c10;border:1px solid #e4324a;border-left:4px solid #e4324a;margin:24px;border-radius:12px;">'
    + '<div style="font-family:Druk,Söhne,sans-serif;font-size:32px;margin-bottom:12px;letter-spacing:-.01em;color:#f1cd72;">Render error</div>'
    + '<pre style="white-space:pre-wrap;font-size:12px;color:#b8b3a8;">' + (err && err.stack ? err.stack : String(err)) + '</pre>'
    + '</div>';
  console.error(err);
}
