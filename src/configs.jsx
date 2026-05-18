/* ════════════════════════════════════════════════════════════════════════
   CALDERYN — STRUCTURAL CONFIGS
   ────────────────────────────────────────────────────────────────────────
   Page-level data structures that drive the cinematic UI. These are
   intentionally separated from data.js (which holds character / roster
   content) so editing the LAYOUT of a section doesn't require touching
   the same file as editing WHO appears in it.

   Currently here:
     CDR.HOME_VANGUARD  — the four Vanguard cards on the home landing
     CDR.JOIN_WIZARD    — application-type → ordered pages mapping

   LOADING
     Loaded via <script type="text/babel"> in index.html BEFORE app.jsx
     so the globals are available when components mount.
   ════════════════════════════════════════════════════════════════════════ */

window.CDR = window.CDR || {};

/* ──────────────────────────────────────────────────────────────────────
   HOME — VANGUARD QUARTET
   The four cards on the home landing. Order = render order.
   Add a fifth Vanguard? Append a row here. The home page picks it up
   automatically.

   Fields:
     alias     - all caps codename
     name      - civilian name
     age       - integer
     house     - lowercase house id (matches existing house tokens)
     color     - hex, used for the card glow + alias color
     portrait  - image URL (same ibb.co URLs used on Lore → Vanguard)
     power     - one-line power summary
     tag       - one-line role descriptor
     hook      - one-line lore-voice quote shown on the bottom of the card
   ────────────────────────────────────────────────────────────────────── */
CDR.HOME_VANGUARD = [
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

/* ──────────────────────────────────────────────────────────────────────
   JOIN — MULTI-PAGE WIZARD
   Each application type defines an ordered list of pages the writer
   walks through. Adding a page = appending an entry here AND wrapping
   the relevant JSX in JoinFieldset with `{onPage("id") && ...}`.

   Page fields:
     id        - stable identifier, referenced by JoinFieldset's onPage()
     title     - big display heading
     subtitle  - one-line context
     required  - array of form keys OR function(form) returning array.
                 The wizard gates "Next" on this — until they're all
                 filled the user can't advance.

   Types not listed here render the legacy single-page form (currently
   collective + outside which have sub-flows that need their own pass).
   ────────────────────────────────────────────────────────────────────── */
CDR.JOIN_WIZARD = {
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
  // collective + outside not yet wizardized — they fall through to the
  // legacy single-page render in JoinTab.
};
