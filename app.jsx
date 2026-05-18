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
  "chevron-right":  <><path d="m9 18 6-6-6-6"/></>,
  "external-link":  <><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M21 14v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/></>,
  "file-text":      <><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></>,
  "flag":           <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></>,
  "info":           <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>,
  "map":            <><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></>,
  "menu":           <><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></>,
  "scroll-text":    <><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></>,
  "search":         <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>,
  "shield":         <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></>,
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
    { id: "role",    title: "Enrollment",  subtitle: "Where in Calderyn they sit.",         required: ["house", "year", "track", "tier", "age"] },
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
    { id: "role",    title: "Position",    subtitle: "Pick from the open club roster.",     required: ["clubPosition"] },
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
        return ["collectiveFlow", "newCollectiveName", "newCollectiveType", "newCollectiveFaction", "newCollectiveDesc"];
      }
      if (f.collectiveFlow === "joinHero" || f.collectiveFlow === "joinVillain") {
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
const FACULTY        = D.faculty;
const STRATA         = D.strata;
const OUTSIDE        = D.outside;
const POWERS         = D.powers;
const POWER_STATUSES = D.powerStatuses;
const BANNED_POWERS  = D.bannedPowers;
const POWER_TIERS    = D.powerTiers;
const CLUBS          = D.clubs;
const STUDENT_GOV    = D.studentGov;
const HERO_LISTS     = D.heroLists;
const GROUPS         = D.groups;
const TABS           = D.tabs;
const TIER_COLOR     = {A:"#e31b23", B:"#1e40af", C:"#15803d", D:"#54545c"};

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

  FACULTY.forEach(sec => sec.rows.forEach(r => {
    if (r.clf) return;
    push({
      kind: "Faculty",
      label: r.char || r.role,
      sub: r.char ? r.role : `${sec.section} · open`,
      tab: "faculty",
      link: r.link || null,
      keys: hay(r.role, r.char, sec.section),
    });
  }));

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
      kind: "Hero",
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
      {tier}-List
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

function HomeTab({setTab}){
  return (
    <div className="home-page">
      <HomeHero setTab={setTab}/>
      <HomeVanguard/>
      <HomeProgramme/>
      <HomeDormNotice/>
      <HomeCTA setTab={setTab}/>
    </div>
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
    <section className="home-hero">
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
  return (
    <section ref={ref} className={"home-section home-vanguard-section " + (inView ? "is-in" : "")}>
      <div className="home-section-head">
        <div className="home-section-stamp">DOSSIER · 01 · ACTIVE ROSTER</div>
        <h2 className="home-section-title">THE VANGUARD</h2>
        <p className="home-section-lede">
          Four people stand between this country and the kinds of incidents the news
          decides not to run. Their contracts are classified. Their faces are not.
        </p>
      </div>
      <div className="home-vanguard-grid">
        {HOME_VANGUARD.map((v, i) => (
          <article key={v.alias} className="home-vg" style={{
            "--vg-color": v.color,
            animationDelay: `${0.15 * i}s`,
          }}>
            <div className="home-vg-portrait">
              <img src={v.portrait} alt={v.alias} loading="lazy"/>
              <div className="home-vg-portrait-frame"/>
            </div>
            <div className="home-vg-body">
              <div className="home-vg-alias">{v.alias}</div>
              <div className="home-vg-name">{v.name} · {v.age}</div>
              <div className="home-vg-tag">{v.tag}</div>
              <div className="home-vg-power">{v.power}</div>
              <div className="home-vg-hook">&ldquo;{v.hook}&rdquo;</div>
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
    <section ref={ref} className={"home-section home-programme " + (inView ? "is-in" : "")}>
      <div className="home-programme-frame">
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
    <section ref={ref} className={"home-section home-dorm " + (inView ? "is-in" : "")}>
      <div className="home-dorm-card">
        <div className="home-dorm-stamp-row">
          <div className="home-dorm-stamp red">RESTRICTED · INTERNAL</div>
          <div className="home-dorm-doc">DOC · 14 · DORM POLICY</div>
        </div>
        <h3 className="home-dorm-title">Power Compatibility &amp; Cohabitation</h3>
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
        <div className="home-dorm-signoff">— Faculty memorandum, second printing, 2026</div>
      </div>
    </section>
  );
}

function HomeCTA({setTab}){
  const [ref, inView] = useInView(0.4);
  return (
    <section ref={ref} className={"home-section home-cta " + (inView ? "is-in" : "")}>
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
   CURRICULUM
═══════════════════════════════════════════════════════════════════════════ */
function CurriculumView(){
  const tracks = D.curriculumTracks;
  const [yearIdx, setYearIdx] = useState(0);
  const [filter, setFilter] = useState("all"); // all / hero / sidekick / shared

  const YEAR_KEY = { FR: 0, SO: 1, JR: 2, SR: 3 };
  const SECTION_OF = {};
  FACULTY.forEach(sec => {
    const tag = sec.section.includes("ELECTIVE") ? "elective"
              : sec.section.includes("SHARED")   ? "shared"
              : (sec.section.includes("HEROES") || sec.section.includes("SIDEKICKS")) ? "core"
              : null;
    sec.rows.forEach(r => { if (r.role && tag) SECTION_OF[r.role] = tag; });
  });

  function subjectsForTrackYear(trackId, yIdx){
    const out = [];
    FACULTY.forEach(sec => {
      sec.rows.forEach(r => {
        if (!r.subjects || !r.tracks) return;
        if (!r.tracks.includes(trackId)) return;
        r.subjects.forEach(subj => {
          let year, title, desc;
          if (typeof subj === "string"){
            const m = subj.match(/^(FR|SO|JR|SR)\s*·\s*(.+)$/);
            if (!m) return;
            year = m[1]; title = m[2].trim(); desc = null;
          } else {
            year = subj.year; title = subj.title; desc = subj.desc || null;
          }
          if (YEAR_KEY[year] !== yIdx) return;
          out.push({
            subject: title,
            desc: desc,
            prof: r.role,
            shared: r.tracks.length > 1,
            kind: SECTION_OF[r.role] || "core",
          });
        });
      });
    });
    return out;
  }

  const YEAR_TABS = [
    { idx: 0, key: "FR", label: "Freshman" },
    { idx: 1, key: "SO", label: "Sophomore" },
    { idx: 2, key: "JR", label: "Junior" },
    { idx: 3, key: "SR", label: "Senior" },
  ];

  const heroTrack     = tracks.find(t => t.title.toLowerCase() === "heroes");
  const sidekickTrack = tracks.find(t => t.title.toLowerCase() === "sidekicks");
  const heroYr     = heroTrack?.years?.[yearIdx];
  const sidekickYr = sidekickTrack?.years?.[yearIdx];

  const heroSubs = subjectsForTrackYear("hero", yearIdx);
  const sideSubs = subjectsForTrackYear("sidekick", yearIdx);

  const seen = new Map();
  function addSubject(s, trackId){
    const key = s.subject;
    if (seen.has(key)){
      const ex = seen.get(key);
      if (!ex.tracks.includes(trackId)) ex.tracks.push(trackId);
    } else {
      seen.set(key, { ...s, tracks: [trackId], required: s.kind !== "elective" });
    }
  }
  heroSubs.forEach(s => addSubject(s, "hero"));
  sideSubs.forEach(s => addSubject(s, "sidekick"));

  // Single unified list, alphabetical, with required-first secondary sort
  const allSubs = Array.from(seen.values()).sort((a, b) => {
    if (a.required !== b.required) return a.required ? -1 : 1;
    return a.subject.localeCompare(b.subject);
  });
  const requiredCount = allSubs.filter(s => s.required).length;
  const electiveCount = allSubs.length - requiredCount;

  // Apply filter
  const filtered = allSubs.filter(s => {
    if (filter === "all") return true;
    const isHero = s.tracks.includes("hero");
    const isSide = s.tracks.includes("sidekick");
    if (filter === "shared")    return isHero && isSide;
    if (filter === "hero")      return isHero && !isSide;
    if (filter === "sidekick")  return isSide && !isHero;
    return true;
  });

  return (
    <div className="curr lore-shell">
      <aside className="lore-toc">
        <div className="lore-toc-inner">
          <div className="lore-toc-stamp">CURRICULUM · YEARS</div>
          <ol className="lore-toc-list">
            {YEAR_TABS.map(yt => (
              <li key={yt.idx} className={"lore-toc-item" + (yt.idx === yearIdx ? " on" : "")}>
                <button
                  type="button"
                  className="lore-toc-btn"
                  onClick={() => setYearIdx(yt.idx)}
                  aria-current={yt.idx === yearIdx ? "page" : undefined}
                >
                  <span className="lore-toc-n">{String(yt.idx + 1).padStart(2, "0")}</span>
                  <span className="lore-toc-label">{yt.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </aside>
      <main className="lore-main">

        <header className="curr-yearhead">
          <div className="curr-yearhead-eyebrow">Year {yearIdx+1} · {YEAR_TABS[yearIdx].label}</div>
          <h3 className="curr-yearhead-title">
            What the {YEAR_TABS[yearIdx].label.toLowerCase()} year actually looks like.
          </h3>
        </header>

        <div className="curr-summary">
          <article className="curr-track curr-track-hero">
            <div className="curr-track-hd">
              <span className="curr-track-tag">Track One · Heroes</span>
              <h4 className="curr-track-name">{heroYr?.t || "—"}</h4>
            </div>
            {heroYr?.d && <p className="curr-track-desc">{heroYr.d}</p>}
            {heroTrack?.stamps && (
              <div className="curr-track-stamps">
                {heroTrack.stamps.map(s => <span key={s} className="curr-stamp">{s}</span>)}
              </div>
            )}
          </article>

          <article className="curr-track curr-track-side">
            <div className="curr-track-hd">
              <span className="curr-track-tag">Track Two · Sidekicks</span>
              <h4 className="curr-track-name">{sidekickYr?.t || "—"}</h4>
            </div>
            {sidekickYr?.d && <p className="curr-track-desc">{sidekickYr.d}</p>}
            {sidekickTrack?.stamps && (
              <div className="curr-track-stamps">
                {sidekickTrack.stamps.map(s => <span key={s} className="curr-stamp">{s}</span>)}
              </div>
            )}
          </article>
        </div>
      </main>
    </div>
  );
}

function ClassRow({subject}){
  const [open, setOpen] = useState(false);
  const hasDesc = !!subject.desc;
  const isHero = subject.tracks.includes("hero");
  const isSide = subject.tracks.includes("sidekick");
  const trackLabel = (isHero && isSide) ? "Shared" : isHero ? "Heroes" : isSide ? "Sidekicks" : null;
  const trackKind  = (isHero && isSide) ? "shared" : isHero ? "hero"   : isSide ? "sidekick"  : "";
  const required = subject.required;
  return (
    <li className={"curr-row" + (open ? " is-open" : "") + (hasDesc ? " has-desc" : "")}>
      <button
        type="button"
        className="curr-row-btn"
        onClick={() => hasDesc && setOpen(!open)}
        disabled={!hasDesc}
        aria-expanded={open}
      >
        <span className="curr-row-name">{subject.subject}</span>
        <span className={"curr-row-kind " + (required ? "is-required" : "is-elective")}>
          {required ? "Required" : "Elective"}
        </span>
        {trackLabel && (
          <span className={"curr-row-track t-" + trackKind}>{trackLabel}</span>
        )}
        {hasDesc && (
          <span className="curr-row-toggle" aria-hidden="true">{open ? "−" : "+"}</span>
        )}
      </button>
      {open && hasDesc && (
        <div className="curr-row-desc">{subject.desc}</div>
      )}
    </li>
  );
}

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
          <h3 className="bay-hd-title">A → D List · Market Value</h3>
          <p className="bay-hd-blurb">Not raw strength. How sellable you are.</p>
        </header>
        <div className="tier-ladder">
          {POWER_TIERS.map(t => (
            <article key={t.id} className="tier-card" style={{borderTopColor:t.color}}>
              <div className="tier-card-top">
                <span className="tier-card-letter" style={{color:t.color}}>{t.tier}</span>
                <span className="tier-card-list">List</span>
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
          <h3 className="bay-hd-title">Six Roles · Same Spectrum</h3>
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

      <section className="banned-bay">
        <div className="banned-bay-hd">
          <div className="banned-bay-stamp">Banned</div>
          <div className="banned-bay-blurb">These exceed the registry's design. Applications including any of the below will be rejected at first review.</div>
        </div>
        <ul className="banned-bay-list">
          {BANNED_POWERS.map((b, i) => (
            <li key={i} className="banned-bay-item">
              <span className="banned-bay-num">{String(i+1).padStart(2,"0")}</span>
              <span className="banned-bay-text">{b}</span>
              <span className="banned-bay-tag">Rejected</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PowersRegistry(){
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [openIdx, setOpenIdx] = useState({});
  const rows = useMemo(() => POWERS.filter(p => {
    if(status !== "all" && p.status !== status) return false;
    if(q){
      const hay = [p.power, p.char, p.alias, p.expression].join(" ").toLowerCase();
      if(!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [status, q]);
  const groups = useMemo(() => POWER_STATUSES
    .map(s => ({s, list: rows.filter(p => p.status === s.id)}))
    .filter(g => g.list.length > 0)
  , [rows]);

  const toggleRow = (key) => setOpenIdx(prev => ({...prev, [key]: !prev[key]}));

  return (
    <div className="preg">
      <div className="preg-hint">
        Click any row to read that character's power expression.
      </div>
      <div className="preg-toolbar">
        <div className="preg-filters">
          <button
            className={"preg-pill" + (status === "all" ? " on" : "")}
            onClick={() => setStatus("all")}
          >All</button>
          {POWER_STATUSES.map(s => (
            <button
              key={s.id}
              className={"preg-pill" + (status === s.id ? " on" : "")}
              onClick={() => setStatus(status === s.id ? "all" : s.id)}
              style={status === s.id
                ? {background:s.bg, color:s.text, borderColor:s.bg}
                : {}}
            >{s.label}</button>
          ))}
        </div>
        <div className="preg-search-wrap">
          <input
            type="text"
            placeholder="Search name, alias, power, expression…"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="preg-search"
            aria-label="Search powers"
          />
          {(q || status !== "all") && (
            <button
              className="preg-clear"
              onClick={() => { setQ(""); setStatus("all"); }}
            >Clear</button>
          )}
          <span className="preg-count">{rows.length} {rows.length === 1 ? "record" : "records"}</span>
        </div>
      </div>

      {groups.length === 0 && (
        <div className="preg-empty">
          {POWERS.length === 0
            ? "No powers registered yet"
            : "No records match the current filter"}
        </div>
      )}

      {groups.map(({s, list}) => (
        <section key={s.id} className="preg-group">
          <div
            className="preg-group-hd"
            style={{background:s.bg, color:s.text}}
          >
            <span className="preg-group-name">{s.label}</span>
            <span className="preg-group-count">
              {list.length} {list.length === 1 ? "record" : "records"}
            </span>
          </div>
          <div className="preg-tbl-wrap">
            <table className="preg-tbl">
              <thead>
                <tr>
                  <th style={{width:80}}>Tier</th>
                  <th style={{width:200}}>Character</th>
                  <th style={{width:170}}>Stage Name</th>
                  <th>Power</th>
                  <th style={{width:90}} aria-label="Details"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((p, pi) => {
                  const key = `${s.id}-${pi}`;
                  const isOpen = !!openIdx[key];
                  const hasExpr = !!p.expression;
                  return (
                    <React.Fragment key={pi}>
                      <tr
                        className={"preg-row" + (isOpen ? " is-open" : "") + (hasExpr ? " is-clickable" : "")}
                        onClick={() => hasExpr && toggleRow(key)}
                      >
                        <td><TierChip tier={p.tier}/></td>
                        <td className="preg-col-char">
                          <CLink name={p.char} link={p.link || null}/>
                          {p.npc && <NpcBadge/>}
                        </td>
                        <td className="preg-col-alias">
                          {p.alias
                            ? <span className="preg-alias">{p.alias}</span>
                            : <span className="preg-na">—</span>}
                        </td>
                        <td className="preg-col-power">{p.power || "N/A"}</td>
                        <td className="preg-col-toggle">
                          {hasExpr && (
                            <span className="preg-view-btn" aria-hidden="true">
                              {isOpen ? "Hide" : "View"}
                              <span className="preg-view-arrow">{isOpen ? "▲" : "▼"}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                      {isOpen && hasExpr && (
                        <tr className="preg-detail-row">
                          <td colSpan={5}>
                            <div className="preg-detail">
                              <span className="preg-detail-label">Expression</span>
                              <p className="preg-detail-text">{p.expression}</p>
                              {p.expressionDoc && (
                                <a
                                  href={p.expressionDoc}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="preg-detail-doc"
                                >
                                  <span className="preg-detail-doc-icon" aria-hidden="true">📄</span>
                                  <span className="preg-detail-doc-label">Read the full power doc</span>
                                  <span className="preg-detail-doc-arrow" aria-hidden="true">→</span>
                                </a>
                              )}
                              {p.drawbacks && <span className="preg-detail-label">Drawbacks / Limits</span>}
                              {p.drawbacks && <p className="preg-detail-text">{p.drawbacks}</p>}
                               {p.note && <span className="preg-detail-label preg-detail-label--note">Admin Note</span>}
                               {p.note && <p className="preg-detail-text preg-detail-note">{p.note}</p>}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function PowersTab(){
  const ctx = React.useContext(RegContext);
  const [view, setView] = useState("guide");
  useEffect(() => {
    if (ctx.targetSubview && ["guide","registry"].includes(ctx.targetSubview)){
      setView(ctx.targetSubview);
      ctx.consumeSubview();
    }
  }, [ctx]);
  return (
    <div className="subnav-host">
      <PageHead
        stamp="DOC · 08 · POWER REGISTRY"
        title={<>The powered</>}
        body={<>One tier system (A–D). Six statuses. Read the <strong>Guide</strong> first; the <strong>Registry</strong> is the cast.</>}
        note={<>{POWERS.length} on file<br/>Same type is fine — same expression is not</>}
        pageNum="P. 008 / VIII"
      />
      <div className="subnav">
        <div className="subnav-inner">
          {[["guide","Guide","How powers work"], ["registry","Registry","Who has what"]].map(([id, lbl, sub]) => (
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
      {view === "guide" ? <PowersGuide/> : <PowersRegistry/>}
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

  const [q, setQ] = useState("");
  const [house, setHouse] = useState("all");
  const [tier, setTier]   = useState("all");
  const [track, setTrack] = useState("all");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return STUDENTS.filter(s => {
      if (house !== "all" && (s.house || "").toLowerCase() !== house) return false;
      if (track !== "all" && (s.track || "").toLowerCase() !== track) return false;
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
    }).sort((a, b) => (a.char || "").split(" ").pop().localeCompare((b.char || "").split(" ").pop()));
  }, [q, house, tier, track]);

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
          <span className="sfilter-lbl">Track</span>
          <Pill active={track === "all"}      onClick={() => setTrack("all")}>All</Pill>
          <Pill active={track === "hero"}     onClick={() => setTrack("hero")}>Hero</Pill>
          <Pill active={track === "sidekick"} onClick={() => setTrack("sidekick")}>Sidekick</Pill>
        </div>

        <div className="sfilter-count">{filtered.length} entr{filtered.length === 1 ? "y" : "ies"}</div>
      </div>

      <div className="tw">
        <table>
          <thead><tr>
            <th className="rn">#</th>
            <th>Character</th>
            <th>Stage Name</th>
            <th>House</th>
            <th>Year</th>
            <th>Track</th>
            <th>Power / Ability</th>
            <th>Tier</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{padding:"60px 16px", textAlign:"center"}}>
                  <div className="empty-state-block">
                    <EmptyState label="No characters match these filters"/>
                    <button type="button" className="empty-cta" onClick={() => {setQ(""); setHouse("all"); setTier("all"); setTrack("all");}}>Reset filters</button>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map((s, i) => {
              const houseCol = s.house ? HC_PRIMARY[s.house.toLowerCase()] : null;
              const trackLbl = (s.track || "").toLowerCase() === "hero" ? "Hero"
                              : (s.track || "").toLowerCase() === "sidekick" ? "Sidekick"
                              : "—";
              return (
                <tr key={i} className="student-row" style={houseCol ? {boxShadow:`inset 4px 0 0 ${houseCol}`} : null}>
                  <td className="rn">{i+1}</td>
                  <td><CLink name={s.char} link={s.link}/></td>
                  <td><span className="stage-name">{s.alias}</span></td>
                  <td><HouseTag house={s.house}/></td>
                  <td style={{textTransform:"capitalize", fontSize:13, color:"var(--muted)", fontStyle:"italic"}}>{s.year}</td>
                  <td>
                    <span className={"track-tag track-tag-" + ((s.track || "").toLowerCase() === "hero" ? "hero" : "sidekick")}>{trackLbl}</span>
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
            ["curriculum", "Curriculum",       "Two tracks · Four years"],
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

function FacultyRegistryView(){
  const [openIdx, setOpenIdx] = useState({});
  const toggleRow = (key) => setOpenIdx(prev => ({...prev, [key]: !prev[key]}));

  // Find the dean — first row in the Office of the Dean section, role === "Dean"
  const deanSection = FACULTY.find(s => /office of the dean/i.test(s.section));
  const deanRow = deanSection ? deanSection.rows.find(r => /dean/i.test(r.role) && r.char) : null;

  return (
    <div className="freg">
      <div className="freg-hint">
        Click any row to read that professor's four-year course arc.
      </div>

      {deanRow && (
        <div className="dean-card">
          <div className="dean-card-portrait">
            <img src="https://i.ibb.co/sJ5Cpr33/d3e97bef-2645-43b0-ae16-fddf2256890f.png" alt="Dr. Devika Ravindrakumar" loading="lazy"/>
          </div>
          <div className="dean-card-text">
            <div className="dean-card-eyebrow">Office of the Dean</div>
            <div className="dean-card-name">
              <CLink name={deanRow.char} link={deanRow.link||null}/>
            </div>
            <div className="dean-card-stage">
              {deanRow.stage ? deanRow.stage : "STAGE NAME · N/A"}
            </div>
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

      {FACULTY.map((sec, si) => {
        // Skip rendering the dean row in its normal table — it's promoted to the card above
        const rowsToShow = sec.rows.filter(r => !(deanRow && r === deanRow));
        if (rowsToShow.length === 0) return null;

        return (
          <section key={si} className="freg-group">
            <div className="freg-group-hd">
              <span className="freg-group-name">{sec.section}</span>
              <span className="freg-group-count">
                {rowsToShow.length} {rowsToShow.length === 1 ? "role" : "roles"}
              </span>
            </div>
            {sec.note && !(deanRow && sec === deanSection) && (
              <p className="freg-group-note">{sec.note}</p>
            )}
            <div className="freg-tbl-wrap">
              <table className="freg-tbl">
                <thead>
                  <tr>
                    <th style={{width:300}}>Subject</th>
                    <th style={{width:130}}>Tracks</th>
                    <th style={{width:220}}>Professor</th>
                    <th style={{width:160}}>Stage Name</th>
                    <th>Power</th>
                    <th style={{width:80}} aria-label="Details"></th>
                  </tr>
                </thead>
                <tbody>
                  {rowsToShow.map((r, ri) => {
                    const key = `${si}-${ri}`;
                    const isOpen = !!openIdx[key];
                    const subs = (r.subjects || []).map(s => {
                      if (typeof s === "string"){
                        const m = s.match(/^(FR|SO|JR|SR)\s*·\s*(.+)$/);
                        return m ? { year: m[1], title: m[2].trim() } : null;
                      }
                      return s;
                    }).filter(Boolean);
                    const YEAR_KEY = { FR: 0, SO: 1, JR: 2, SR: 3 };
                    subs.sort((a, b) => YEAR_KEY[a.year] - YEAR_KEY[b.year]);
                    const hasArc = subs.length > 0;
                    const isOpenRole = !r.char && !r.clf;
                    const trackLabel = (() => {
                      if (!r.tracks || r.tracks.length === 0) return null;
                      if (r.tracks.length === 2) return "Both";
                      if (r.tracks[0] === "hero") return "Heroes";
                      if (r.tracks[0] === "sidekick") return "Sidekicks";
                      return null;
                    })();

                    return (
                      <React.Fragment key={ri}>
                        <tr
                          className={"freg-row" + (isOpen ? " is-open" : "") + (hasArc ? " is-clickable" : "") + (isOpenRole ? " is-vacant" : "")}
                          onClick={() => hasArc && toggleRow(key)}
                        >
                          <td className="freg-col-subj">{r.role}</td>
                          <td className="freg-col-tracks">
                            {trackLabel || <span className="freg-na">N/A</span>}
                          </td>
                          <td className="freg-col-prof">
                            {r.clf ? (
                              <Chip variant="classified">■ CLASSIFIED</Chip>
                            ) : r.char ? (
                              <>
                                <CLink name={r.char} link={r.link||null}/>
                                {r.npc && <NpcBadge/>}
                              </>
                            ) : (
                              <span className="freg-open-stamp">OPEN ROLE</span>
                            )}
                          </td>
                          <td className="freg-col-stage">
                            {r.stage
                              ? <span className="stage-name">{r.stage}</span>
                              : <span className="freg-na">N/A</span>}
                          </td>
                          <td className="freg-col-power">
                            {r.power
                              ? r.power
                              : <span className="freg-na">N/A</span>}
                          </td>
                          <td className="freg-col-toggle">
                            {hasArc && (
                              <span className="freg-view-btn" aria-hidden="true">
                                {isOpen ? "Hide" : "View"}
                                <span className="freg-view-arrow">{isOpen ? "▲" : "▼"}</span>
                              </span>
                            )}
                          </td>
                        </tr>
                        {isOpen && hasArc && (
                          <tr className="freg-detail-row">
                            <td colSpan={6}>
                              <div className="freg-detail">
                                <span className="freg-detail-label">Course Arc</span>
                                <ol className="freg-arc">
                                  {subs.map((s, sj) => (
                                    <li key={sj} className="freg-arc-item">
                                      <span className="freg-arc-year">{s.year}</span>
                                      <span className="freg-arc-title">{s.title}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LORE TABS
═══════════════════════════════════════════════════════════════════════════ */
const LORE_TABS = [
  { id: "world",     label: "The World" },
  { id: "history",   label: "The Programme" },
  { id: "vanguard",  label: "The Vanguard" },
  { id: "houses",    label: "The Houses" },
  { id: "dean",      label: "The Dean" },
  { id: "incidents", label: "The Cassandra Incident" },
];

function HousesTab(){
  const ctx = React.useContext(RegContext);
  const [view, setView] = useState("world");
  useEffect(() => {
    if (ctx.targetSubview && LORE_TABS.find(t => t.id === ctx.targetSubview)){
      setView(ctx.targetSubview);
      ctx.consumeSubview();
    }
  }, [ctx]);

  const activeLore = LORE_TABS.find(t => t.id === view) || LORE_TABS[0];

  // Render the title with the trailing word in italic prestige serif
  const titleWithItalic = (() => {
    const parts = activeLore.label.split(" ");
    if (parts.length < 2) return activeLore.label;
    const last = parts.pop();
    return <>{parts.join(" ")} {last.toLowerCase()}</>;
  })();

  // Per-sub-tab body copy so the page-head intro reflects the active section
  const bodyMap = {
    world:     "Eleven years on, the world has not been the same since the first hero team walked out onto a stage in west London. STRATA owns most of them. Calderyn trains the rest.",
    history:   "Sixty years of preparation for a war that never came. Project Cradle, Strathogen, the pipeline that shaped almost every working superhuman in Britain.",
    vanguard:  "Four members. The most powerful superhumans alive. Paragon, Vigil, Aegis, Switchboard — and the politics keeping them on the same team.",
    houses:    "Four houses, four virtues, four namesakes. Pick the one that matches the character you want to play.",
    dean:      "Dr. Devika Ravindrakumar. Fifty-three. Field nullification at fifteen metres. Students are afraid of her before they meet her, and more afraid afterwards.",
    incidents: "The MV Cassandra. February 2024. A press cycle no one survived intact — and the contingency plans Felix Strathe quietly began developing the day after.",
  };

  return (
    <div className="subnav-host">
      <PageHead
        stamp="DOC · 02 · LORE"
        title={titleWithItalic}
        body={bodyMap[view] || bodyMap.world}
        note={<>Public record · IC-visible<br/>Plot-locked content lives elsewhere</>}
        pageNum="P. 002 / VIII"
      />
      <div className="lore-shell">
        <aside className="lore-toc">
          <div className="lore-toc-inner">
            <div className="lore-toc-stamp">CONTENTS</div>
            <ol className="lore-toc-list">
              {LORE_TABS.map((t, i) => (
                <li key={t.id} className={"lore-toc-item" + (view === t.id ? " on" : "")}>
                  <button
                    type="button"
                    className="lore-toc-btn"
                    onClick={() => { setView(t.id); window.scrollTo({top: 0, behavior: 'instant'}); }}
                    aria-current={view === t.id ? "page" : undefined}
                  >
                    <span className="lore-toc-n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="lore-toc-label">{t.label}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </aside>
        <main className="lore-main">
          {view === "world" && <LoreWorld/>}
          {view === "history" && <LoreHistory/>}
          {view === "vanguard" && <LoreVanguard/>}
          {view === "houses" && <LoreHouses/>}
          {view === "dean" && <LoreDean/>}
          {view === "incidents" && <LoreIncidents/>}
        </main>
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
    { id: "incidents", n: "06", title: "Cassandra",            blurb: "Feb 2024. The press cycle no one survived." },
  ];

  return (
    <div className="lore lore-start">
      <section className="lore-block lore-start-grid">
        <div className="ls-col ls-col-read">
          <div className="lore-eyebrow">Six pages, in order &middot; click any to read</div>
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

function LoreVanguard(){
  return (
    <div className="lore">
      <section className="lore-block lore-intro">
        <div className="lore-intro-stamp">PUBLIC RECORD · ORIENTATION READING</div>
        <h2 className="lore-intro-title">The <span className="accent">Vanguard.</span></h2>
        <p className="lore-lead">
          There are four of them. They have been a team since March 2015, and by every public
          measurement anyone has dared take, they are the four most powerful superhumans
          alive.
        </p>
      </section>

      <section className="lore-block">
        <div className="lore-vanguard">
          <article className="lore-vg" style={{"--vg-color": "#c41a1a"}}>
            <div className="lore-vg-portrait">
              <img src="https://i.ibb.co/Tx8LND9D/884dff81-b7c4-448a-be91-1d79b440f8e3.png" alt="Paragon" loading="lazy"/>
            </div>
            <div className="lore-vg-text">
              <div className="lore-vg-alias">PARAGON</div>
            <div className="lore-vg-name">Adrian Valaris · 45</div>
            <div className="lore-vg-tag">The symbol</div>
            <p className="lore-vg-desc">
              The sun feeds him. Nothing measurable runs him down. His strength has no
              documented ceiling. His flight is officially uncatalogued because the
              equipment that tries to clock him fails when he reaches full speed. Heat
              vision in coherent ranged beams, calibrated by something the medical wing has
              elected to call <em>intent</em> because no one has come up with a better word.
              His senses run well beyond baseline — he can pick a single conversation out of
              a crowded street from above, read a license plate at altitude, hear a heartbeat
              through a wall. Whether that's a separate ability or simply what comes with the
              rest of him, the medical wing has stopped trying to settle.
            </p>
            <p className="lore-vg-desc">
              In person he is quiet, unfailingly polite, and stands up when you walk into a
              room. He is the most beloved man in Britain.
            </p>
            </div>
          </article>
          <article className="lore-vg" style={{"--vg-color": "#15803d"}}>
            <div className="lore-vg-portrait">
              <img src="https://i.ibb.co/SDY1sLN8/2377bc73-8c3f-40c6-951d-7f0365013c2a.png" alt="Vigil" loading="lazy"/>
            </div>
            <div className="lore-vg-text">
              <div className="lore-vg-alias">VIGIL</div>
            <div className="lore-vg-name">Caius Saberis · 42</div>
            <div className="lore-vg-tag">The strategist</div>
            <p className="lore-vg-desc">
              Precognition, in a window ninety seconds wide and roughly thirty metres deep.
              He sees every branch of every possible action laid out around him with the
              clarity of sheet music. The bullet leaving the barrel. The door opening. The
              word leaving the mouth. He picks the branch he wants. The other branches
              collapse and are not.
            </p>
            <p className="lore-vg-desc">
              Fights with a folded-steel longsword that Switchboard made him in 2018, and
              which he has never named. <em>Naming weapons</em>, he said in one of his rare
              interviews, <em>is something young men do.</em> The cost is migraines. He has
              been wrong twice in eleven years.
            </p>
            </div>
          </article>
          <article className="lore-vg" style={{"--vg-color": "#d4901a"}}>
            <div className="lore-vg-portrait">
              <img src="https://i.ibb.co/fKV1tKH/ccf8e712-87c2-4da0-af44-d290385a7e8c.png" alt="Aegis" loading="lazy"/>
            </div>
            <div className="lore-vg-text">
              <div className="lore-vg-alias">AEGIS</div>
            <div className="lore-vg-name">Margery Orenne · 39</div>
            <div className="lore-vg-tag">The rescuer</div>
            <p className="lore-vg-desc">
              Her body does not break the way bodies break. Blades go in. Bullets go in.
              The damage simply does not propagate outward through her the way damage is
              supposed to. She bleeds, but the bleeding stops sooner than it ought. She
              heals six times faster than is decent.
            </p>
            <p className="lore-vg-desc">
              Cruises at three hundred miles an hour, holds position indefinitely, lifts
              roughly four hundred kilograms without breaking a sweat. Paragon saves the
              world. Aegis saves the people in it. Her record under field conditions is
              fifty-one hours. She broke nine bones during it and did not notice until the
              third day.
            </p>
            </div>
          </article>
          <article className="lore-vg" style={{"--vg-color": "#1e40af"}}>
            <div className="lore-vg-portrait">
              <img src="https://i.ibb.co/LzyQcRcL/a18a925b-91f4-45d8-b2e3-66821aaf9661.png" alt="Switchboard" loading="lazy"/>
            </div>
            <div className="lore-vg-text">
              <div className="lore-vg-alias">SWITCHBOARD</div>
            <div className="lore-vg-name">Iris Grimere · 35</div>
            <div className="lore-vg-tag">The architect</div>
            <p className="lore-vg-desc">
              Technokinesis. She speaks to electronics, by thought, in a range that has no
              precise edge but seems to extend as far as she can perceive a device. She
              does not need to touch them. She does not need to see them. They listen.
            </p>
            <p className="lore-vg-desc">
              Not physically superhuman. Strength, durability, and reflexes are baseline
              human, and her health is, if anything, slightly under, because she forgets to
              eat. Every piece of gear the Vanguard uses is hers. Vigil's sword. Aegis's
              flight harness. Paragon's gauntlets. Three cats, named after pre-Socratic
              philosophers.
            </p>
            </div>
          </article>
        </div>
      </section>
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
            The prestige house. Front-line heroes, future poster children, the students
            with the cleanest jaws and publicists already on retainer. Confident, and
            watched, often by each other.
          </p>
          <p className="lore-house-desc">
            Adrian Valaris himself never set foot in this school as a student. There is no
            portrait of him as a teenager because <em>no such portrait exists.</em> This is not a
            thing Valaris students discuss. It is not, really, a thing anyone discusses.
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
            The strategists. The analysts. The patient and the precise. Smaller cohorts,
            harder examinations, a quieter and more dangerous kind of arrogance.
          </p>
          <p className="lore-house-desc">
            Caius Saberis was here from 2002 to 2006, and the fencing salle still has his
            trophies on the wall, and Saberis students are expected to know which year he
            won which one.
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
            The rescue house, the medical house, the pastoral house. It has the best
            kitchen and the most actual friendships, and it is the house people transfer
            into when a year has gone badly.
          </p>
          <p className="lore-house-desc">
            Margery Orenne was here from 2005 to 2009, and she comes back every September
            to give the welcome address, and stays after to talk to anyone who wants to
            talk to her.
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
            For the technical and the engineering and the cerebral and, if you are being
            honest about it, the strange. The labs run all night.
          </p>
          <p className="lore-house-desc">
            Iris Grimere was here from 2009 to 2013, and never quite left — she runs the
            diagnostic wing now, which has, by the most conservative count, saved four
            hundred student lives. Grimere is the only house with a living relationship
            with its namesake, and the Grimere students are insufferable about it.
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
            <img src="https://i.ibb.co/sJ5Cpr33/d3e97bef-2645-43b0-ae16-fddf2256890f.png" alt="Dr. Devika Ravindrakumar — Dean of Calderyn" loading="lazy"/>
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
          October 2023. A North Sea ferry running its overnight Newcastle to Amsterdam
          route. <strong>Two thousand four hundred and eleven</strong> passengers and crew.
          A Saturday night, peak autumn sailing season, the ship at near full capacity.
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
        <div className="lore-eyebrow">Casefile · 23-OCT-CASS</div>
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
          The footage circulates every October.
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
    if (s.char) directory.push({ kind: `${l.tier}-List Hero`, section: "Talent Roster", role: s.alias, char: s.char, link: s.link || null, power: s.power });
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
      <section className="strata-stats">
        <button className="strata-stat" onClick={() => onJump("corporate")}>
          <div className="strata-stat-num">{corpFilled}<span className="strata-stat-of">/{corpRoles}</span></div>
          <div className="strata-stat-label">Corporate roles filled</div>
          <div className="strata-stat-sub">Internal structure <Icon name="arrow-up-right" size={11} className="inline-icon"/></div>
        </button>
        <button className="strata-stat" onClick={() => onJump("talent")}>
          <div className="strata-stat-num">{heroFilled}<span className="strata-stat-of">/{heroSlots}</span></div>
          <div className="strata-stat-label">Heroes on the roster</div>
          <div className="strata-stat-sub">A–D-list talent <Icon name="arrow-up-right" size={11} className="inline-icon"/></div>
        </button>
        <button className="strata-stat" onClick={() => onJump("groups")}>
          <div className="strata-stat-num">{groupCount}</div>
          <div className="strata-stat-label">{sanctioned} sanctioned · {groupCount - sanctioned} independent · {groupMembers} {groupMembers === 1 ? "member" : "members"} on file</div>
          <div className="strata-stat-sub">Vanguard & collectives <Icon name="arrow-up-right" size={11} className="inline-icon"/></div>
        </button>
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
function OrgsTable({data, startCollapsed}){
  const [openSecs, setOpenSecs] = useState(() => {
    const init = {};
    data.forEach(sec => { init[sec.section] = !startCollapsed; });
    return init;
  });
  useEffect(() => {
    const init = {};
    data.forEach(sec => { init[sec.section] = !startCollapsed; });
    setOpenSecs(init);
  }, [startCollapsed, data]);

  const toggleSec = (key) => setOpenSecs(prev => ({...prev, [key]: !prev[key]}));

  return (
    <div className="orgs">
      {data.map((sec, si) => {
        const isOpen = !!openSecs[sec.section];
        const orgCount = (sec.orgs || []).length;
        return (
          <section key={si} className={"orgs-group" + (isOpen ? " is-open" : "")}>
            <button
              type="button"
              className="orgs-group-hd"
              onClick={() => toggleSec(sec.section)}
              aria-expanded={isOpen}
            >
              <span className="orgs-group-name">{sec.section}</span>
              <span className="orgs-group-meta">
                <span className="orgs-group-count">
                  {orgCount} {orgCount === 1 ? "entry" : "entries"}
                </span>
                <span className="orgs-group-toggle" aria-hidden="true">
                  {isOpen ? "▲" : "▼"}
                </span>
              </span>
            </button>
            {isOpen && (
              <>
                {sec.note && (
                  <p className="orgs-group-note">{sec.note}</p>
                )}
                <div className="orgs-list">
                  {sec.orgs.map((org, oi) => (
                    <article key={oi} className="orgs-item">
                      <header className="orgs-item-hd">
                        <h4 className="orgs-item-name">{org.name}</h4>
                        <div className="orgs-item-type">{org.type}</div>
                      </header>
                      {org.note && <p className="orgs-item-note">{org.note}</p>}
                      {org.roles && org.roles.length > 0 && (
                        <ul className="orgs-roles">
                          {org.roles.map((r, ri) => (
                            <li key={ri} className={"orgs-role" + (!r.char ? " is-vacant" : "")}>
                              <span className="orgs-role-label">{r.role}</span>
                              <span className="orgs-role-sep">·</span>
                              <span className="orgs-role-who">
                                {r.char
                                  ? <><CLink name={r.char} link={r.link||null}/>{r.npc && <NpcBadge/>}</>
                                  : <span className="orgs-role-open">Open</span>}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}

function OutsideTab(){
  const [active, setActive] = useState("all");
  const sections = OUTSIDE.map(s => ({
    id: s.section.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    label: s.section,
    count: (s.orgs || []).length,
  }));
  const totalOrgs = sections.reduce((a, s) => a + s.count, 0);

  const visible = active === "all"
    ? OUTSIDE
    : OUTSIDE.filter(s => {
        const sid = s.section.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        return sid === active;
      });

  return (
    <div>
      <PageHead
        stamp="DOC · 07 · EXTERNAL"
        title={<>Outside Calderyn</>}
        body="Characters who live and work in Greenwich, London — the borough Calderyn College leases its campus from. Organised by the institutions they belong to. One character may appear in multiple rows."
        pageNum="P. 007 / VIII"
      />
      <div className="orgs-toolbar">
        <div className="orgs-filters">
          <button
            className={"orgs-pill" + (active === "all" ? " on" : "")}
            onClick={() => setActive("all")}
          >All <span className="orgs-pill-n">{totalOrgs}</span></button>
          {sections.map(s => (
            <button
              key={s.id}
              className={"orgs-pill" + (active === s.id ? " on" : "")}
              onClick={() => setActive(s.id)}
            >{s.label} <span className="orgs-pill-n">{s.count}</span></button>
          ))}
        </div>
      </div>
      <OrgsTable data={visible} startCollapsed={active === "all"}/>
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

function ClubModal({club, onClose}){
  const [tab, setTab] = useState("about");
  const hasRules = !!club.rules;
  const hasTeams = !!club.teams;
  const tabs = [
    {id: "about",  label: "About"},
    ...(hasRules ? [{id: "rules", label: "Rules"}] : []),
    {id: "roster", label: "Roster"},
  ];

  // Reset to About whenever the modal opens on a different club.
  useEffect(() => { setTab("about"); }, [club]);

  // Esc closes; lock page scroll while the modal is mounted.
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
    <div
      className="club-modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="club-modal"
        role="dialog"
        aria-modal="true"
        aria-label={club.name}
        onClick={e => e.stopPropagation()}
      >
        <header className="club-modal-hd" style={{background: club.bg}}>
          <div className="club-modal-hd-body">
            {club.category && <div className="club-modal-cat">{club.category}</div>}
            <h2 className="club-modal-name">{club.name}</h2>
            {club.tag && <div className="club-modal-tag">{club.tag}</div>}
          </div>
          <button
            type="button"
            className="club-modal-close"
            onClick={onClose}
            aria-label="Close"
          ><span aria-hidden="true">×</span></button>
        </header>
        <nav className="club-modal-tabs" role="tablist">
          {tabs.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={"club-modal-tab" + (tab === t.id ? " on" : "")}
              onClick={() => setTab(t.id)}
            >{t.label}</button>
          ))}
        </nav>
        <div className="club-modal-body">
          {tab === "about"  && <ClubPanelAbout club={club}/>}
          {tab === "rules"  && hasRules && <ClubRules rules={club.rules}/>}
          {tab === "roster" && <ClubPanelRoster club={club} hasTeams={hasTeams}/>}
        </div>
      </div>
    </div>
  );
}

function ClubsTab(){
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [tab, setTab] = useState("about");

  // Reset to About whenever the user picks a different club.
  useEffect(() => { setTab("about"); }, [selectedIdx]);

  const club = CLUBS[selectedIdx];
  const hasRules = !!(club && club.rules);
  const hasTeams = !!(club && club.teams && club.teams.length);
  const total = club ? clubTotal(club) : 0;
  const filled = club ? clubFilled(club) : 0;
  const accent = (club && club.bg) || "#c41a1a";

  return (
    <div>
      <PageHead
        stamp="DOC · 05 · CAMPUS ORGS"
        title={<>Clubs &amp; societies</>}
        body="Six campus clubs. Pick one from the directory to view its full roster, rules, and post-graduation pathway. Leadership is one role per player. New clubs go through your house RA — if there's enough interest, the Student Body President considers it for approval."
        pageNum="P. 005 / VIII"
      />

      <div className="clubsx">
        <div className="clubs-split">
          {/* ── DIRECTORY ─────────────────────────────────────────── */}
          <aside className="cdir" aria-label="Clubs directory">
            <div className="cdir-hd">
              <span className="cdir-hd-lbl">Directory</span>
              <span className="cdir-hd-count">
                {CLUBS.length} <em>/ {CLUBS.length}</em>
              </span>
            </div>
            <ul className="cdir-list" role="tablist">
              {CLUBS.map((c, i) => {
                const t = clubTotal(c);
                const f = clubFilled(c);
                const active = i === selectedIdx;
                return (
                  <li key={i} role="presentation">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={"cdir-row" + (active ? " on" : "")}
                      style={{"--accent": c.bg}}
                      onClick={() => setSelectedIdx(i)}
                    >
                      <span className="cdir-row-body">
                        <span className="cdir-row-name">{c.name}</span>
                        <span className="cdir-row-foot">
                          {c.category && (
                            <span className="cdir-row-cat">{c.category}</span>
                          )}
                          <span className="cdir-row-stat">
                            <b>{f}</b><span className="sep">/</span>{t}
                            <span className="lbl">filled</span>
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* ── DETAIL ────────────────────────────────────────────── */}
          <main className="cdet" key={selectedIdx}>
            <div className="cdh" style={{"--accent": accent}}>
              <div className="cdh-inner">
                {club.category && (
                  <span className="cdh-cat">{club.category}</span>
                )}
                <h1 className="cdh-name">{club.name}</h1>
                {club.tag && <div className="cdh-sub">{club.tag}</div>}
              </div>
            </div>

            <div className="cdet-meta">
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
                  style={{"--accent": accent}}
                >{t.label}</button>
              ))}
            </nav>

            <div className="clubdf-body">
              {tab === "about"  && <ClubPanelAbout club={club}/>}
              {tab === "rules"  && hasRules && <ClubRules rules={club.rules}/>}
              {tab === "roster" && <ClubPanelRoster club={club} hasTeams={hasTeams}/>}
            </div>
          </main>
        </div>
      </div>
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

  const tabs = [
    {id: "about",  label: "About",  icon: "fa-circle-info"},
    ...(hasRules ? [{id: "rules", label: "Rules", icon: "fa-book"}] : []),
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
                    <span className="kb-team-cap-label">Captain</span>
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
                      <tr className="kb-starters-hd"><td colSpan={2}>Starting Six</td></tr>
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
      </div>
    );
  }

  const positions = club.positions || [];
  const groups = club.groups || null;

  if (groups && groups.length > 0) {
    const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const byGroup = {};
    positions.forEach(p => {
      const k = p.group || "other";
      (byGroup[k] = byGroup[k] || []).push(p);
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
    desc: "Join an existing collective as a hero or villain, or propose a brand-new collective. Pick a flow on the next step.",
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
  FACULTY.forEach(sec => {
    sec.rows.forEach(r => {
      if (!r.char && !r.clf){
        out.push({ section: sec.section, role: r.role });
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
// Existing GROUPS entries don't carry a `faction` field — non-sanctioned
// groups are treated as hero-side by default, which matches how the
// existing collectives copy is written ("unsanctioned heroes, B-List
// tier and below"). New villain-side collectives created through the
// 3-flow form will land with `faction: "villain"` on the data snippet.
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
     from the same /quota-stats Worker endpoint that powers the inline
     QuotaStatsPanel.
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

function QuotaChip({ tier, count, limit }){
  const isUncapped = limit == null;
  const isFull = !isUncapped && count >= limit;
  const isOver = !isUncapped && count > limit;
  return (
    <div className={
      "join-hud-chip join-hud-chip-" + tier.className
      + (isFull ? " is-full" : "")
      + (isOver ? " is-over" : "")
    }>
      <span className="join-hud-chip-tier">{tier.label}-LIST</span>
      <span className="join-hud-chip-count">
        {count == null
          ? "—"
          : isUncapped
            ? "OPEN"
            : <>{count}<span className="join-hud-chip-slash">/</span>{limit}</>
        }
      </span>
    </div>
  );
}

function JoinHUD({ type, quotaStats }){
  // Hide entirely on the archetype picker — the HUD only appears once
  // a writer is inside the wizard for a specific form.
  if (!type) return null;

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

function JoinTab(){
  const [type, setType]   = useState(null);
  const [form, setForm]   = useState({});
  const [status, setStatus] = useState({ state: "idle", msg: "" });
  const [confirmed, setConfirmed] = useState(false);
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
    setConfirmed(false);
    setQuotaStats(null);
    setStep(0);
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
  }, [currentPage, form.fullyHuman, form.strataRole]);

  const currentPageMissing = currentPageRequired.filter(k => !form[k] || !String(form[k]).trim());
  const canAdvance = step === 0
    ? !!type
    : currentPageMissing.length === 0;

  // Re-fetch quota stats when the writer's OOC tag changes. Debounce
  // by waiting until the value is stable for 300ms so a user typing
  // their freeform tag doesn't fire a request on every keystroke.
  useEffect(() => {
    const ooc = (form.ooc || "").trim();
    if (!ooc) { setQuotaStats(null); return; }
    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(QUOTA_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ooc, rpcLink: form.rpcLink || "" }),
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
  }, [form.ooc, form.rpcLink]);

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
      case "club":       return [...base, "clubPosition"];
      case "gov":        return [...base, "govSeat"];
      case "collective": {
        // Three sub-flows: joinHero, joinVillain, createNew.
        // Validation branches accordingly.
        const flow = form.collectiveFlow;
        if (flow === "createNew"){
          // Power on a "create" submission is optional — the creator may
          // not be a member themselves, or the founding-member list captures
          // it. Skip the universal power requirement here.
          return [...base, "collectiveFlow", "newCollectiveName", "newCollectiveType", "newCollectiveFaction", "newCollectiveDesc"];
        }
        if (flow === "joinHero" || flow === "joinVillain"){
          return [...base, "collectiveFlow", "alias", "collectiveName", "collectiveRole", "tier", ...power];
        }
        // No flow chosen yet → only require the flow itself; the rest
        // becomes required after the user picks one.
        return [...base, "collectiveFlow"];
      }
      case "outside":    return [...base, "outsideOrg", "outsideRole", "outsideStatus", "tier", ...power];
      default: return base;
    }
  }, [type, form.fullyHuman]);

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
    // Honeypot check — if the hidden field has a value, silently 'succeed' but don't ship
    if (form.hp){
      setConfirmed(true);
      return;
    }
    if (!canSubmit) return;
    setStatus({ state: "loading", msg: "Sending…" });

    // The Worker builds the Discord embed + attaches Approve/Reject
    // buttons + stashes the submission in KV. We just send the raw form.
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, form }),
      });
      if (!res.ok){
        const txt = await res.text().catch(() => "");
        throw new Error("Relay rejected: " + res.status + " " + txt.slice(0, 200));
      }
      setConfirmed(true);
      setStatus({ state: "idle", msg: "" });
    } catch (err) {
      setStatus({ state: "error", msg: "Failed to send — " + (err.message || String(err)) });
    }
  };

  if (confirmed){
    // Submission receipt: derived from char name + timestamp so it's
    // stable for the writer to reference, not a real DB id.
    const submittedChar = (form.char || form.alias || "Applicant").trim();
    const submissionId = (() => {
      const t = Date.now().toString(36).toUpperCase().slice(-6);
      const seed = (form.char || form.alias || form.rpcLink || "X")
        .split("")
        .reduce((a, c) => a + c.charCodeAt(0), 0)
        .toString(36).toUpperCase().slice(-2);
      return "CDR-" + seed + "-" + t;
    })();
    const submittedDate = new Date().toLocaleDateString("en-GB", {
      year: "numeric", month: "short", day: "numeric"
    });
    return (
      <div className="join">
        <div className="join-form-wrap">
          <JoinHUD type={type} quotaStats={quotaStats}/>
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
                      RECEIVED · UNDER REVIEW · CALDERYN COLLEGE ·
                    </textPath>
                  </text>
                </svg>
                <div className="join-confirm-wax-id">{submissionId}</div>
              </div>
            </div>

            <div className="join-confirm-eyebrow">
              <span className="join-confirm-dot" aria-hidden="true"/>
              SUBMISSION LOGGED · ADMIN CHANNEL NOTIFIED
            </div>

            <h2 className="join-confirm-title">
              Thank you, <span className="join-confirm-name">{submittedChar}</span>.
            </h2>
            <p className="join-confirm-lede">
              Your application has been routed to the admin channel. We'll reach out
              via the RPC profile you linked — usually within a few days, sometimes
              sooner. Don't refresh this page if you're waiting on a confirmation,
              just keep an eye on your roleplay.chat messages.
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
                <div className="join-confirm-receipt-label">Status</div>
                <div className="join-confirm-receipt-value join-confirm-receipt-status">
                  <span className="join-confirm-status-dot" aria-hidden="true"/>
                  PENDING REVIEW
                </div>
              </div>
            </div>

            <div className="join-confirm-next">
              <div className="join-confirm-next-title">What happens next</div>
              <ol className="join-confirm-next-list">
                <li>Admin reads your submission against the masterlist and quota.</li>
                <li>You'll receive a message on your linked RPC profile with the decision and any follow-up questions.</li>
                <li>If approved, you'll be added to the roster and the channel.</li>
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
        <JoinHUD type={type} quotaStats={quotaStats}/>

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
                  className={"join-type" + (type === t.id ? " on" : "")}
                  onClick={() => {
                    setType(t.id);
                    setForm({});
                    setStatus({state:"idle",msg:""});
                    // For wizardized types, advance immediately to step 1
                    // so the writer drops into the first real page.
                    if (JOIN_WIZARD[t.id]) setStep(1);
                  }}
                >
                  <div className="join-type-num">{String(i+1).padStart(2,"0")}</div>
                  <div className="join-type-name">{t.name}</div>
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
                onClick={() => step > 1 ? setStep(step - 1) : setStep(0)}
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
  const openPos = getOpenClubPositions();
  const openSeats = getOpenGovSeats();
  return (
    <>
      <Field label="Optional · Club Position" hint="If this student also wants to join a club. Skip if you'll decide later." full>
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
   COLLECTIVE FIELDSET — 3 flows on one form
   ──────────────────────────────────────────────────────────────────────
   Flow A — Join an existing hero collective.
   Flow B — Join an existing villain collective.
   Flow C — Create a new collective (hero or villain), seed members.

   The flow picker uses the same .join-typegrid / .join-type chrome as the
   top-level application-type picker so it matches the rest of the form
   visually. All three flows share the universal Common + Power + Tail
   blocks. Create-flow has a small founding-members repeater (alias /
   char / role) that lives entirely in form state — admin pastes the
   resulting GROUPS snippet into data.js.
   ────────────────────────────────────────────────────────────────────── */
const COLLECTIVE_FLOWS = [
  { id: "joinHero",    num: "01", name: "Join · Hero-side",
    desc: "Apply to an existing hero collective. Unsanctioned heroes operating outside STRATA contracts." },
  { id: "joinVillain", num: "02", name: "Join · Villain-side",
    desc: "Apply to an existing villain collective. Underworld crews, cults, organised antagonists." },
  { id: "createNew",   num: "03", name: "Create · New collective",
    desc: "Propose a brand-new collective and its founding members. Hero-side or villain-side." },
];

function CollectiveFieldset({form, set, Common, wizardPageId}){
  // Page gate — see JoinFieldset's helper for the pattern.
  const onPage = (id) => !wizardPageId || wizardPageId === id;
  const flow = form.collectiveFlow;
  const isJoin = flow === "joinHero" || flow === "joinVillain";
  const faction = flow === "joinVillain" ? "villain" : flow === "joinHero" ? "hero" : null;
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
                placeholder={flow === "joinVillain" ? "WRAITH, MAW, etc." : "HEX, NULL, etc."}
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
            Three paths on one form. Switching flow keeps your character &amp; profile, but resets flow-specific fields.
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
                    set("newCollectiveFaction", "");
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
              <FieldGroup title={flow === "joinVillain" ? "Villain Collective" : "Hero Collective"}/>
              <Field
                label={flow === "joinVillain" ? "Villain Collective" : "Hero Collective"}
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
                    placeholder={flow === "joinVillain"
                      ? "e.g. The Iron Sigil"
                      : "e.g. Nightwatch Collective"}
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
              <Field label="Faction" required full>
                <select
                  className="join-select"
                  value={form.newCollectiveFaction || ""}
                  onChange={e => set("newCollectiveFaction", e.target.value)}
                >
                  <option value="">Select faction…</option>
                  <option value="hero">Hero</option>
                  <option value="villain">Villain</option>
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
function QuotaStatsPanel({stats, activePool}){
  if (!stats) return null;
  const TIERS = ["A-List", "B-List", "C-List", "D-List"];
  const limits = stats.limits || {};
  const renderPool = (pool, label) => {
    const counts = stats[pool] || {};
    const isActive = pool === activePool;
    return (
      <div className="quota-pool" style={{
        opacity: isActive ? 1 : 0.65,
        fontWeight: isActive ? 600 : 400,
        margin: "4px 0",
      }}>
        <span style={{minWidth: "9em", display: "inline-block"}}>
          {label}{isActive ? " (this form)" : ""}:
        </span>
        {TIERS.map((t, i) => {
          const count = counts[t] || 0;
          const limit = limits[t]; // undefined for D-List → uncapped
          const atCap = limit != null && count >= limit;
          const overCap = limit != null && count > limit;
          const sep = i === 0 ? "" : " · ";
          return (
            <span key={t} style={{
              color: overCap ? "#e31b23" : atCap ? "#d4a84a" : "inherit",
              fontWeight: (overCap || atCap) ? 700 : "inherit",
            }}>
              {sep}{t} {count}{limit != null ? `/${limit}` : " (uncapped)"}
            </span>
          );
        })}
      </div>
    );
  };
  return (
    <div className="quota-stats" style={{
      margin: "8px 0 4px",
      padding: "10px 12px",
      background: "rgba(212, 168, 74, 0.05)",
      border: "1px solid rgba(212, 168, 74, 0.2)",
      borderRadius: "8px",
      fontSize: "13px",
      fontFamily: "var(--mono, monospace)",
      color: "var(--text, #ece6d6)",
    }}>
      <div style={{
        fontSize: "11px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--text-low, #8a8478)",
        marginBottom: "6px",
      }}>
        Your current quota
      </div>
      {renderPool("student", "Students")}
      {renderPool("adult",   "Adults")}
    </div>
  );
}

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
        <QuotaStatsPanel stats={quotaStats} activePool={activePool}/>
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
            <Field label="Open Club Position" required hint="Only open positions are listed" full>
              <select
                className="join-select"
                value={form.clubPositionKey ?? ""}
                onChange={e => {
                  const raw = e.target.value;
                  const idx = raw === "" ? -1 : parseInt(raw, 10);
                  const found = idx >= 0 ? openPos[idx] : null;
                  set("clubPositionKey", raw);
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
            <MapLocList items={list}/>
          </section>
        );
      })}

      {communal.length > 0 && (
        <section className="map-house map-house-communal" style={{"--h-color": "#d4a84a"}}>
          <header className="map-house-hd">
            <div className="map-house-hd-l">
              <span className="map-house-hd-name">COMMUNAL</span>
              <span className="map-house-hd-virtue">Shared · All four houses</span>
            </div>
            <span className="map-house-hd-count">
              <b>{communal.length}</b>
              <span>{communal.length === 1 ? "place" : "places"}</span>
            </span>
          </header>
          <p className="map-house-blurb">
            Houses are private; the residential quad is not. The lawn between the four buildings, the kitchen, the laundry, the snug and the garden courtyard belong to everyone — house colours come off at the door.
          </p>
          <MapLocList items={communal}/>
        </section>
      )}
    </div>
  );
}

function MapTab(){
  const districts = D.mapDistricts;
  const locations = D.mapLocations;
  const districtsWithItems = districts.filter(d => locations.some(l => l.district === d.id));
  const [activeId, setActiveId] = useState(districtsWithItems[0]?.id);
  const [query, setQuery] = useState("");

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

      <div className="map-page lore-shell">
        <aside className="lore-toc">
          <div className="lore-toc-inner">
            <div className="lore-toc-stamp">DISTRICTS</div>
            <ol className="lore-toc-list">
              {districtsWithItems.map((d, i) => {
                const dCount = searchActive
                  ? locations.filter(l => l.district === d.id && matchLoc(l)).length
                  : null;
                const dimmed = searchActive && dCount === 0;
                return (
                  <li
                    key={d.id}
                    className={
                      "lore-toc-item"
                      + (d.id === activeId && !searchActive ? " on" : "")
                      + (dimmed ? " is-dim" : "")
                    }
                  >
                    <button
                      type="button"
                      className="lore-toc-btn"
                      onClick={() => {
                        setQuery("");
                        setActiveId(d.id);
                        window.scrollTo({top: 0, behavior: 'instant'});
                      }}
                      aria-current={d.id === activeId && !searchActive ? "page" : undefined}
                    >
                      <span className="lore-toc-n">{String(i + 1).padStart(2, "0")}</span>
                      <span className="lore-toc-label">{d.name}</span>
                      {searchActive && (
                        <span className="lore-toc-count">{dCount}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>

        <main className="lore-main map-main">
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
              <section className="map-district">
                <header className="map-district-head">
                  <div className="lore-eyebrow"><Icon name="sparkles" size={11} className="inline-icon"/> District {String(activeIdx + 1).padStart(2, "0")}</div>
                  <h2 className="lore-h map-district-h">{activeDistrict.name}.</h2>
                  <p className="map-district-blurb">{activeDistrict.blurb}</p>
                  <div className="map-district-meta">
                    <span className="map-district-count">{activeItems.length} {activeItems.length === 1 ? "location" : "locations"}</span>
                  </div>
                </header>

                {isResidence
                  ? <ResidenceBlocks items={activeItems}/>
                  : <MapLocList items={activeItems}/>
                }
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
  // Mobile nav drawer (visible only below the breakpoint where the
  // inline horizontal tab strip collapses). Closes automatically on
  // tab selection so the user lands on the chosen page cleanly.
  const [navOpen, setNavOpen] = useState(false);

  const setTab = useCallback((id) => {
    setTabState(id);
    setNavOpen(false);
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
        className={"tabs" + (navOpen ? " is-open" : "")}
        role="tablist"
        aria-label="Registry sections"
      >
        {/* Mobile toggle — visible only below ~760px via CSS. Shows the
            active tab's label so the closed state still tells you where
            you are. Tap to open the drawer. */}
        <button
          type="button"
          className="tabs-mobile-toggle"
          onClick={() => setNavOpen(o => !o)}
          aria-expanded={navOpen}
          aria-controls="tabs-drawer"
        >
          <Icon name={navOpen ? "x" : "menu"} size={18}/>
          <span className="tabs-mobile-current">
            {(TABS.find(t => t.id === tab) || TABS[0]).label}
          </span>
        </button>

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
