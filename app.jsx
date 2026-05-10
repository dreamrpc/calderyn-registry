/* ════════════════════════════════════════════════════════════════════════
   CALDERYN COLLEGE — APPLICATION CODE
   ────────────────────────────────────────────────────────────────────────
   This file is the React app. You don't normally need to edit it.
   For adding/removing characters, see data.js instead.

   Application submissions are routed through a Cloudflare Worker proxy
   so that webhook URLs are never exposed in client code.
   ════════════════════════════════════════════════════════════════════════ */

const WORKER_URL = "https://calderyn-registry-relay.dreamroleplaywriter.workers.dev";

const {useState, useMemo, useEffect, useCallback, useRef} = React;
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
    <div className="curr">
      {/* Year tabs — clean strip */}
      <div className="curr-yeartabs" role="tablist" aria-label="Choose a year">
        {YEAR_TABS.map(yt => (
          <button
            key={yt.idx}
            type="button"
            role="tab"
            aria-selected={yt.idx === yearIdx}
            className={"curr-yeartab" + (yt.idx === yearIdx ? " on" : "")}
            onClick={() => setYearIdx(yt.idx)}
          >
            <span className="curr-yeartab-num">YR {yt.idx+1}</span>
            <span className="curr-yeartab-label">{yt.label}</span>
          </button>
        ))}
      </div>

      {/* Year head — single condensed band */}
      <header className="curr-yearhead">
        <div className="curr-yearhead-eyebrow">Year {yearIdx+1} · {YEAR_TABS[yearIdx].label}</div>
        <h3 className="curr-yearhead-title">
          {heroYr?.t && sidekickYr?.t && heroYr.t === sidekickYr.t
            ? heroYr.t
            : <>The {YEAR_TABS[yearIdx].label.toLowerCase()} year</>}
        </h3>
        {(heroYr?.d || sidekickYr?.d) && (
          <div className="curr-yearhead-tracks">
            {heroYr?.d && <p className="curr-yearhead-line"><span className="curr-yearhead-tag t-hero">Heroes</span> {heroYr.d}</p>}
            {sidekickYr?.d && <p className="curr-yearhead-line"><span className="curr-yearhead-tag t-sidekick">Sidekicks</span> {sidekickYr.d}</p>}
          </div>
        )}
      </header>

      {/* Toolbar — counts + track filter */}
      <div className="curr-toolbar">
        <div className="curr-counts">
          <strong>{allSubs.length}</strong> classes
          <span className="curr-counts-sep">·</span>
          <strong>{requiredCount}</strong> required
          <span className="curr-counts-sep">·</span>
          <strong>{electiveCount}</strong> elective{electiveCount === 1 ? "" : "s"}
        </div>
        <div className="curr-filter">
          {[
            ["all", "All"],
            ["hero", "Heroes"],
            ["sidekick", "Sidekicks"],
            ["shared", "Shared"],
          ].map(([id, lbl]) => (
            <button
              key={id}
              type="button"
              className={"curr-filter-pill" + (filter === id ? " on" : "")}
              onClick={() => setFilter(id)}
            >{lbl}</button>
          ))}
        </div>
      </div>

      {/* Unified class list */}
      <ul className="curr-list">
        {filtered.length === 0 ? (
          <li className="curr-row-empty">— No classes match this filter —</li>
        ) : filtered.map((s, i) => <ClassRow key={i} subject={s} />)}
      </ul>

      {/* Quiet footnote */}
      <p className="curr-finenote">
        Both tracks serve the machine. Both tracks break you down and rebuild you as something useful. <span className="curr-finenote-hit">By the time you realise you're complicit, you're already too deep to walk away.</span>
      </p>
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
              <td style={{fontSize:13}}>{s.power}</td>
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
  const [view, setView] = useState("heroes");
  useEffect(() => {
    if (ctx.targetSubview && ["heroes","sidekicks","govt"].includes(ctx.targetSubview)){
      setView(ctx.targetSubview);
      ctx.consumeSubview();
    }
  }, [ctx]);
  return (
    <div className="subnav-host">
      <PageHead
        stamp="DOC · 04 · STUDENTS"
        title={<>Student registry</>}
        body="All enrolled students, sorted by curriculum track. Click any character name to visit their profile."
        note={<>No cap on student numbers<br/>New characters always welcome</>}
        pageNum="P. 004 / VIII"
      />
      <div className="subnav">
        <div className="subnav-inner">
          {[
            ["heroes",    "Heroes",          "Track One"],
            ["sidekicks", "Sidekicks",       "Track Two"],
            ["govt",      "Student Govt.",   "Elected & appointed"],
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
      {view === "heroes"    && <StudentRoster track="hero"/>}
      {view === "sidekicks" && <StudentRoster track="sidekick"/>}
      {view === "govt"      && <StudentGovInner/>}
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
      <div className="subnav house-subnav">
        <div className="subnav-inner">
          {LORE_TABS.map(t => (
            <button
              key={t.id}
              className={"subnav-btn house-subnav-btn" + (view === t.id ? " on" : "")}
              onClick={() => setView(t.id)}
              aria-pressed={view === t.id}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {view === "world" && <LoreWorld/>}
      {view === "history" && <LoreHistory/>}
      {view === "vanguard" && <LoreVanguard/>}
      {view === "houses" && <LoreHouses/>}
      {view === "dean" && <LoreDean/>}
      {view === "incidents" && <LoreIncidents/>}
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
        <p className="lore-p">
          Powered characters must fall inside the age range of their Cradle phase.
          Cradle III runs roughly ages 0–26, Cradle II 31–46, and Cradle I 51–58.
          Submissions outside those bands will not be accepted.
        </p>
        <p className="lore-p">
          The <strong>only</strong> powered characters permitted above the age of 46 are <strong>Paragon</strong>, <strong>the Dean</strong>, and <strong>Vale</strong>.
          No other Cradle‑I‑aged powered characters will be approved. If your concept needs to be older than 46 and powered, it doesn't fit this game — rework the age, or pitch it as a non‑powered Outside Calderyn role instead.
        </p>
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
  return (
    <div>
      {HERO_LISTS.map((list, li) => {
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
                      <td>{s.char ? <CLink name={s.char} link={s.link||null}/> : <EmptyState/>}</td>
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
        <div className="groups-intro-title">SANCTIONED & INDEPENDENT</div>
        <div className="groups-intro-body">
          STRATA's flagship Vanguard unit at the top — invitation-only, A-List tier only. Below: independent collectives of unsanctioned heroes (B-List tier and below) operating outside STRATA's contract system. Propose new collectives to admin — typical size is 3–6 members with a shared goal or origin.
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
              {g.sanctioned
                ? <Chip variant="ink">SANCTIONED</Chip>
                : g.status === "Active"  ? <Chip variant="red">ACTIVE</Chip>
                : g.status === "Dormant" ? <Chip variant="ghost">DORMANT</Chip>
                : g.status === "Concept" ? <Chip variant="ghost">CONCEPT</Chip>
                : <Chip variant="ghost">{g.status.toUpperCase()}</Chip>}
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
          <div className="strata-stat-sub">Internal structure ↗</div>
        </button>
        <button className="strata-stat" onClick={() => onJump("talent")}>
          <div className="strata-stat-num">{heroFilled}<span className="strata-stat-of">/{heroSlots}</span></div>
          <div className="strata-stat-label">Heroes on the roster</div>
          <div className="strata-stat-sub">A → D-list talent ↗</div>
        </button>
        <button className="strata-stat" onClick={() => onJump("groups")}>
          <div className="strata-stat-num">{groupCount}</div>
          <div className="strata-stat-label">{sanctioned} sanctioned · {groupCount - sanctioned} independent · {groupMembers} {groupMembers === 1 ? "member" : "members"} on file</div>
          <div className="strata-stat-sub">Vanguard & collectives ↗</div>
        </button>
      </section>

      <section className="strata-directory">
        <div className="strata-directory-hd">
          <div>
            <div className="strata-directory-eyebrow">◆ Unified Directory</div>
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
                    {d.crossRef && <span className="strata-crossref" title="Appears in multiple STRATA sections">⇄</span>}
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
        <div className="kbr-section-tag">Overview</div>
        <div className="kbr-body">
          <p className="kbr-summary">{rules.summary}</p>

          <div className="kbr-keypoints">
            <div className="kbr-keypoint">
              <div className="kbr-keypoint-num">4s</div>
              <div className="kbr-keypoint-body">
                <div className="kbr-keypoint-lbl"><span className="ico" aria-hidden="true">⧖</span> The Pass Clock</div>
                <p>Catching the ball freezes you in place. Four seconds to release a pass, or possession drops.</p>
              </div>
            </div>
            <div className="kbr-keypoint">
              <div className="kbr-keypoint-num">∞</div>
              <div className="kbr-keypoint-body">
                <div className="kbr-keypoint-lbl"><span className="ico" aria-hidden="true">○</span> The Ball</div>
                <p>Indestructible engineered composite. No registered power can vaporise, fracture, melt, or deform it. Only move it.</p>
              </div>
            </div>
            <div className="kbr-keypoint">
              <div className="kbr-keypoint-num">6v6</div>
              <div className="kbr-keypoint-body">
                <div className="kbr-keypoint-lbl"><span className="ico" aria-hidden="true">▤</span> Three Elevations</div>
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
            <img
              className="kbr-arena-tile-img"
              src="https://files.catbox.moe/h3hq2p.png"
              alt=""
              loading="lazy"
            />
            <div className="kbr-arena-tile-body">
              <div className="kbr-arena-tile-eyebrow"><span className="ico" aria-hidden="true">▦</span> Arena Diagram</div>
              <div className="kbr-arena-tile-title">View the Powerball arena</div>
              <div className="kbr-arena-tile-meta">Six-on-six · Three elevations · Annotated zones</div>
              <div className="kbr-arena-tile-action">
                <span className="ico" aria-hidden="true">⛶</span>
                <span>Click to expand</span>
              </div>
            </div>
          </button>
        </div>
      </div>

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
              <div className="kbr-block-tag"><span className="ico" aria-hidden="true">▤</span> Rules</div>
              <ul className="kbr-list">
                {rules.format.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
          {rules.violence && (
            <div className="kbr-block">
              <div className="kbr-block-tag"><span className="ico" aria-hidden="true">▲</span> Powers, Violence &amp; Fouls</div>
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
          ><span className="ico" aria-hidden="true">×</span></button>
          <img
            className="kbr-lightbox-img"
            src="https://files.catbox.moe/h3hq2p.png"
            alt="Powerball arena diagram showing the three-elevation court, half-court split, scoring zones, goal areas, and player positions for both teams"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="kbr-lightbox-hint">
            <span className="ico" aria-hidden="true">ⓘ</span> Click anywhere outside the image or press <kbd>Esc</kbd> to close
          </div>
        </div>
      )}
    </div>
  );
}

function ClubsTab(){
  const [filter, setFilter] = useState("All");
  const [openIdx, setOpenIdx] = useState(0);

  const categories = useMemo(() => {
    const cats = ["All"];
    CLUBS.forEach(c => {
      if (c.category && !cats.includes(c.category)) cats.push(c.category);
    });
    return cats;
  }, []);

  const visible = useMemo(() => {
    if (filter === "All") return CLUBS.map((c, i) => ({c, i}));
    return CLUBS.map((c, i) => c.category === filter ? {c, i} : null).filter(Boolean);
  }, [filter]);

  // Keep selection valid when filter changes
  useEffect(() => {
    if (visible.length === 0) return;
    if (!visible.some(v => v.i === openIdx)) {
      setOpenIdx(visible[0].i);
    }
  }, [filter, visible, openIdx]);

  const open = CLUBS[openIdx] || CLUBS[0];

  // Reset detail tab when switching clubs
  const [detailTab, setDetailTab] = useState("about");
  useEffect(() => { setDetailTab("about"); }, [openIdx]);

  const hasRules = !!(open && open.rules);
  const hasTeams = !!(open && open.teams);
  const detailTabs = [
    {id: "about",  label: "About"},
    ...(hasRules ? [{id: "rules", label: "Rules"}] : []),
    {id: "roster", label: "Roster"},
  ];

  return (
    <div>
      <PageHead
        stamp="DOC · 05 · CAMPUS ORGS"
        title={<>Clubs &amp; societies</>}
        body="Six campus clubs. Pick one from the directory to view its full roster, rules, and post-graduation pathway. Leadership is one role per player. New clubs go through your house RA — if there's enough interest, the Student Body President considers it for approval."
        pageNum="P. 005 / VIII"
      />
      <div className="club-filters-band">
        <span className="club-filters-label">Filter by</span>
        <div className="club-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={"club-filter-pill" + (filter === cat ? " on" : "")}
              onClick={() => setFilter(cat)}
            >
              {cat}
              {cat !== "All" && (
                <span className="club-filter-count">
                  {CLUBS.filter(c => c.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="clubs-dir">
        {/* LEFT — directory rail */}
        <aside className="clubs-dir-rail" aria-label="Club directory">
          <div className="clubs-dir-rail-hd">
            <span className="clubs-dir-rail-label">Directory</span>
            <span className="clubs-dir-rail-count">{visible.length} / {CLUBS.length}</span>
          </div>
          {visible.length === 0 && (
            <div style={{padding:"24px 16px"}}>
              <EmptyState label={`No clubs in ${filter}`}/>
            </div>
          )}
          <ul className="clubs-dir-list">
            {visible.map(({c, i}) => {
              const total = clubTotal(c);
              const filled = clubFilled(c);
              return (
                <li key={i}>
                  <button
                    className={"clubs-dir-item" + (openIdx === i ? " on" : "")}
                    onClick={() => setOpenIdx(i)}
                    aria-current={openIdx === i ? "true" : undefined}
                    style={{"--accent": c.bg}}
                  >
                    <span className="clubs-dir-item-stripe" aria-hidden="true"/>
                    <span className="clubs-dir-item-body">
                      <span className="clubs-dir-item-name">{c.name}</span>
                      <span className="clubs-dir-item-meta">
                        {c.category && <span className="clubs-dir-item-cat">{c.category}</span>}
                        <span className="clubs-dir-item-roster">
                          <span className="clubs-dir-item-roster-num">{filled}</span>
                          <span className="clubs-dir-item-roster-sep">/</span>
                          <span className="clubs-dir-item-roster-tot">{total}</span>
                          <span className="clubs-dir-item-roster-lbl">filled</span>
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* RIGHT — detail pane */}
        {open && (
          <section className="clubs-dir-detail" aria-label={open.name}>
            <header className="clubs-dir-hero" style={{"--accent": open.bg}}>
              <div className="clubs-dir-hero-inner">
                {open.category && <div className="clubs-dir-hero-cat">{open.category}</div>}
                <h2 className="clubs-dir-hero-name">{open.name}</h2>
                {open.tag && <div className="clubs-dir-hero-tag">{open.tag}</div>}
              </div>
            </header>

            <div className="clubs-dir-glance">
              <div className="clubs-dir-glance-cell">
                <div className="clubs-dir-glance-lbl">Access</div>
                <div className="clubs-dir-glance-val">{open.access}</div>
              </div>
              {open.meets && open.meets.length > 0 && (
                <div className="clubs-dir-glance-cell">
                  <div className="clubs-dir-glance-lbl">Meets</div>
                  <div className="clubs-dir-glance-val">
                    {open.meets.map((m, mi) => (
                      <span key={mi} className="clubs-dir-glance-chip">{m}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="clubs-dir-glance-cell">
                <div className="clubs-dir-glance-lbl">Roster</div>
                <div className="clubs-dir-glance-val">
                  <span className="clubs-dir-glance-num">{clubFilled(open)}</span>
                  <span className="clubs-dir-glance-tot"> / {clubTotal(open)}</span>
                  <span className="clubs-dir-glance-sub"> active</span>
                </div>
              </div>
            </div>

            <nav className="clubs-dir-tabs" role="tablist">
              {detailTabs.map(t => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={detailTab === t.id}
                  className={"clubs-dir-tab" + (detailTab === t.id ? " on" : "")}
                  onClick={() => setDetailTab(t.id)}
                >{t.label}</button>
              ))}
            </nav>

            <div className="clubs-dir-body">
              {detailTab === "about"  && <ClubPanelAbout club={open}/>}
              {detailTab === "rules"  && hasRules && <ClubRules rules={open.rules}/>}
              {detailTab === "roster" && <ClubPanelRoster club={open} hasTeams={hasTeams}/>}
            </div>
          </section>
        )}
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
          ><span className="ico" aria-hidden="true">×</span></button>
        </div>

        <div className="cp-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={"cp-tab" + (tab === t.id ? " on" : "")}
              onClick={() => setTab(t.id)}
            >
              <span className="ico" aria-hidden="true">●</span>
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
              <span className="cp-schedule-tag"><span className="ico" aria-hidden="true">◫</span> Meets</span>
              <div className="cp-schedule-slots">
                {club.meets.map((m, i) => <span key={i} className="cp-schedule-slot">{m}</span>)}
              </div>
            </div>
          )}
          {club.output && (
            <div className="cp-schedule-row">
              <span className="cp-schedule-tag"><span className="ico" aria-hidden="true">◖</span> Output</span>
              <div className="cp-schedule-output">{club.output}</div>
            </div>
          )}
        </div>
      )}

      {club.rules && club.rules.career && (
        <div className="cp-about-career">
          <div className="cp-about-career-tag"><span className="ico" aria-hidden="true">▪</span> Post-Graduation</div>
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
            <span className="cp-courtnote-tag"><span className="ico" aria-hidden="true">▥</span> Open Court</span>
            <span>{club.courtNote}</span>
          </div>
        )}

        <div className="kb-teams">
          {club.teams.map((t, ti) => {
            const captain = t.positions.find(p => p.captain && p.char);
            const starters = t.positions.filter(p => !((p.pos || "").toLowerCase().startsWith("reserve")));
            const reserves = t.positions.filter(p => (p.pos || "").toLowerCase().startsWith("reserve"));
            return (
              <div key={ti} className="kb-team">
                <div className="kb-team-hd" style={{background:t.bg}}>
              <div className="kb-team-name">{t.house.toUpperCase()}</div>
              {captain && (
                <div className="kb-team-cap"><i className="fa-solid fa-star kb-team-cap-icon" aria-hidden="true"></i><span className="kb-team-cap-label">Captain:</span> <CLink name={captain.char} link={captain.link||null}/></div>
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
          <div className="cp-staff-tag"><span className="ico" aria-hidden="true">▤</span> League Staff</div>
          <table>
            <tbody>
              {club.positions.map((p, pi) => (
                <tr key={pi}>
                  <td style={{fontWeight:600, fontSize:13, width:200, whiteSpace:"nowrap"}}>{p.pos}</td>
                  <td>{p.char ? <CLink name={p.char} link={p.link||null}/> : <EmptyState/>}</td>
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
    desc: "Independent collectives — unsanctioned heroes operating outside STRATA contracts.",
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

// Helper: list of collectives
function getCollectives(){
  return GROUPS.filter(g => !g.sanctioned).map(g => g.name);
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

function JoinTab(){
  const [type, setType]   = useState(null);
  const [form, setForm]   = useState({});
  const [status, setStatus] = useState({ state: "idle", msg: "" });
  const [confirmed, setConfirmed] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const reset = () => {
    setType(null);
    setForm({});
    setStatus({ state: "idle", msg: "" });
    setConfirmed(false);
  };

  // Validation: list missing required fields per application type
  const requiredFields = useMemo(() => {
    if (!type) return [];
    const base = ["rpcLink", "char", "rulesAgree"];
    // Power fields are universal: any role can be powered unless explicitly "fully human"
    const power = form.fullyHuman ? [] : ["power", "powerExpression", "drawbacks"];
    switch (type) {
      case "student":    return [...base, "house", "year", "track", "tier", ...power];
      case "faculty":    return [...base, "facultyRole", ...power];
      case "strata":     return form.strataRole === "corporate"
                                ? [...base, "strataRole", "strataDept", "strataTitle", ...power]
                                : [...base, "strataRole", "alias", "tier", ...power];
      case "club":       return [...base, "clubPosition"];
      case "gov":        return [...base, "govSeat"];
      case "collective": return [...base, "alias", "collectiveName", "collectiveRole", ...power];
      case "outside":    return [...base, "outsideOrg", "outsideRole", ...power];
      default: return base;
    }
  }, [type, form.fullyHuman]);

  const missing = requiredFields.filter(k => !form[k] || !String(form[k]).trim());
  const canSubmit = type && missing.length === 0 && status.state !== "loading";

  // Build the data-file-shaped JS snippet for admin to paste into the data
  const buildSnippet = () => {
    const s = (v) => v ? `"${String(v).replace(/"/g, '\\"')}"` : "";
    const link = form.rpcLink ? `, link: ${s(form.rpcLink)}` : "";
    const human = form.fullyHuman ? `, human: true` : "";
    const powerFrag = form.fullyHuman ? "" :
      `, power: ${s(form.power)}, expression: ${s(form.powerExpression)}, drawbacks: ${s(form.drawbacks)}`;

    let main = "";
    switch (type) {
      case "student":
        main = `{ char: ${s(form.char)}, alias: ${s(form.alias) || '""'}, house: ${s((form.house||"").toLowerCase())}, year: ${s(form.year)}, track: ${s((form.track||"").toLowerCase())}, tier: ${s(form.tier)}${powerFrag}${human}${link} },`;
        break;
      case "faculty":
        main = `// → goes in FACULTY → "${form.facultySection || ''}" section
{ role: ${s(form.facultyRole)}, char: ${s(form.char)}, stage: ${s(form.alias) || '""'}${powerFrag}${human}${link} },`;
        break;
      case "strata":
        main = `// → goes in HERO_LISTS → ${form.tier} list, fills first open slot
{ alias: ${s(form.alias)}, char: ${s(form.char)}${powerFrag}${human}${link} },`;
        break;
      case "club":
        main = `// → goes in CLUBS → "${form.clubName || ''}" → ${form.clubTeam ? 'team "' + form.clubTeam + '"' : 'positions'}
{ pos: ${s(form.clubPosition)}, char: ${s(form.char)}${powerFrag}${human}${link} },`;
        break;
      case "gov":
        main = `// → goes in STUDENT_GOV → "${form.govSection || ''}" → seats
{ pos: ${s(form.govSeat)}, char: ${s(form.char)}, term: ${s(form.govTerm) || '"2026-27"'}${powerFrag}${human}${link} },`;
        break;
      case "collective":
        main = `// → goes in GROUPS → "${form.collectiveName || ''}" → members
{ alias: ${s(form.alias)}, role: ${s(form.collectiveRole)}, char: ${s(form.char)}${powerFrag}${human}${link} },`;
        break;
      case "outside":
        main = `// → goes in OUTSIDE → "${form.outsideSection || ''}" → org "${form.outsideOrg || ''}" → roles
{ role: ${s(form.outsideRole)}, char: ${s(form.char)}${powerFrag}${human}${link} },`;
        break;
      default: return "";
    }

    // Optional cross-references for student form (clubs / gov)
    const extras = [];
    if (type === "student" && form.optClubPosition){
      extras.push(`// → also add to CLUBS → "${form.optClubName || ''}" → ${form.optClubTeam ? 'team "' + form.optClubTeam + '"' : 'positions'}
{ pos: ${s(form.optClubPosition)}, char: ${s(form.char)}${link} },`);
    }
    if (type === "student" && form.optGovSeat){
      extras.push(`// → also add to STUDENT_GOV → "${form.optGovSection || ''}" → seats
{ pos: ${s(form.optGovSeat)}, char: ${s(form.char)}, term: ${s(form.optGovTerm) || '"2026-27"'}${link} },`);
    }
    return [main, ...extras].join("\n\n");
  };

  const submit = async () => {
    // Honeypot check — if the hidden field has a value, silently 'succeed' but don't ship
    if (form.hp){
      setConfirmed(true);
      return;
    }
    if (!canSubmit) return;
    setStatus({ state: "loading", msg: "Sending…" });

    const typeName = APPLICATION_TYPES.find(t => t.id === type)?.name || type;
    const snippet = buildSnippet();

    /* --- Discord embed helpers ----------------------------------------
       Embed field values are capped at 1024 chars by Discord. splitField()
       word-aware splits long values across multiple fields ("Field (1/2)",
       "Field (2/2)") instead of hard-truncating mid-word. */
    const FIELD_VALUE_MAX = 1024;
    const splitField = (name, value, inline = false) => {
      if (!value) return [];
      const v = String(value);
      if (v.length <= FIELD_VALUE_MAX) return [{ name, value: v, inline }];
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
      return parts.map((value, i) => ({
        name: parts.length > 1 ? `${name} (${i + 1}/${parts.length})` : name,
        value, inline,
      }));
    };
    /* safeBlock() - word-aware truncate for the data-file snippet code block.
       Discord embed description max is 4096; leave headroom for the fence. */
    const safeBlock = (s, max = 3900) => {
      if (!s || s.length <= max) return s || "";
      let cut = s.lastIndexOf("\n", max);
      if (cut < max - 400) cut = s.lastIndexOf(" ", max);
      if (cut < 0) cut = max;
      return s.slice(0, cut) + "\n// ...trimmed";
    };

    // Build the Discord embed — only the info admin actually needs to update the site
    const fields = [
      { name: "Type",          value: typeName, inline: true },
      { name: "Character",     value: form.char || "—", inline: true },
      { name: "RPC Profile",   value: form.rpcLink || "—", inline: false },
    ];
    if (form.alias)            fields.push({ name: "Stage Name / Alias", value: form.alias, inline: true });
    if (form.house)            fields.push({ name: "House",       value: form.house, inline: true });
    if (form.year)             fields.push({ name: "Year",        value: form.year, inline: true });
    if (form.track)            fields.push({ name: "Track",       value: form.track, inline: true });
    if (form.tier)             fields.push({ name: "Tier",        value: form.tier, inline: true });
    if (form.facultyRole)      fields.push({ name: "Faculty Role",     value: `${form.facultyRole} (${form.facultySection || '?'})`, inline: false });
    if (form.clubPosition)     fields.push({ name: "Club Position",    value: `${form.clubName || '?'} — ${form.clubPosition}${form.clubTeam ? ' (' + form.clubTeam + ')' : ''}`, inline: false });
    if (form.govSeat)          fields.push({ name: "Gov Seat",         value: `${form.govSeat} (${form.govSection || '?'})`, inline: false });
    if (form.collectiveRole)   fields.push({ name: "Collective",       value: `${form.collectiveName || '?'} — ${form.collectiveRole}`, inline: false });
    if (form.outsideRole)      fields.push({ name: "Outside Role",     value: `${form.outsideOrg || '?'} — ${form.outsideRole}`, inline: false });

    // Powers (only if not fully human)
    if (form.fullyHuman){
      fields.push({ name: "Powers",         value: "Fully human — no powers.", inline: false });
    } else {
      if (form.power)           fields.push({ name: "Power / Ability",  value: form.power, inline: true });
      if (form.powerExpression) fields.push(...splitField("Power Expression", form.powerExpression));
      if (form.drawbacks)       fields.push(...splitField("Drawbacks", form.drawbacks));
    }

    // Optional cross-references (student only)
    if (form.optClubPosition)  fields.push({ name: "Optional Club",    value: `${form.optClubName || '?'} — ${form.optClubPosition}${form.optClubTeam ? ' (' + form.optClubTeam + ')' : ''}`, inline: false });
    if (form.optGovSeat)       fields.push({ name: "Optional Gov Seat", value: `${form.optGovSeat} (${form.optGovSection || '?'})`, inline: false });

    if (form.notes)            fields.push(...splitField("Additional Notes", form.notes));
    fields.push({ name: "Rules Acknowledged", value: form.rulesAgree ? "✅ Confirmed read & agreed" : "✗ Not confirmed", inline: false });

    const payload = {
      username: "Calderyn Registry — Applications",
      content: "<@&1498799678551101451>",
      allowed_mentions: { roles: ["1498799678551101451"] },
      embeds: [{
        title: `New Application · ${typeName}`,
        description: `**${form.char}**${form.alias ? ` — *${form.alias}*` : ''}`,
        color: 0xe31b23,
        fields,
        footer: { text: "Calderyn College · Central Registry · 2026" },
        timestamp: new Date().toISOString(),
      }, {
        title: "Data-file snippet",
        description: "```js\n" + safeBlock(snippet) + "\n```",
        color: 0xffcc00,
      }],
    };

    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, payload }),
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
    return (
      <div className="join">
        <div className="join-form-wrap">
          <div className="join-confirm">
            <div className="join-confirm-stamp">⚑ APPLICATION RECEIVED</div>
            <h3>Application <span className="accent">sent.</span></h3>
            <p>
              Your application has been forwarded to the admin channel.
              We'll reach out via the RPC profile you linked with a decision and any
              follow-up questions. Sit tight — usually within a few days.
            </p>
            <button className="join-confirm-again" onClick={reset}>
              Submit Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="join">
      <div className="join-hero">
        <div className="join-hero-inner">
          <div className="join-hero-stamp">⚑ INTAKE · 2026 INTAKE OPEN</div>
          <h2>Join the <span className="accent">registry.</span></h2>
          <p>
            Calderyn is open. Pick what you're applying for, fill in the details, we'll review on Discord. <strong>One form per character</strong> — submit multiples separately.
          </p>
        </div>
      </div>

      <div className="join-form-wrap">
        {/* Step 1 — type picker */}
        <div className="join-step">
          <span className="join-step-tag">Step 01 · Application Type</span>
          <div className="join-step-title">What are you applying for?</div>
          <div className="join-step-blurb">
            Pick a role. The form adjusts to ask only what's needed. Switching types resets your inputs.
          </div>
          <div className="join-typegrid">
            {APPLICATION_TYPES.map((t, i) => (
              <button
                key={t.id}
                type="button"
                className={"join-type" + (type === t.id ? " on" : "")}
                onClick={() => { setType(t.id); setForm({}); setStatus({state:"idle",msg:""}); }}
              >
                <div className="join-type-num">{String(i+1).padStart(2,"0")}</div>
                <div className="join-type-name">{t.name}</div>
                <div className="join-type-desc">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — fields specific to chosen type */}
        {type && (
          <>
            <div className="join-divider">
              <span className="join-divider-rule"/>
              <span className="join-divider-tag">Step 02 · Details</span>
              <span className="join-divider-rule"/>
            </div>
          {["student","faculty","strata","collective"].includes(type) && (
            <aside className="join-age-note" style={{margin:"16px 0 24px",padding:"14px 18px",border:"1px solid #c83030",borderLeft:"4px solid #c83030",background:"rgba(200,48,48,0.08)",borderRadius:"6px",fontSize:"0.92rem",lineHeight:"1.5"}}>
              <strong style={{textTransform:"uppercase",letterSpacing:"0.08em",color:"#c83030"}}>Age & Cradle requirement — strict.</strong>{" "}
              Your character's age must fall inside the age range of their Cradle phase (Cradle III: 0–26 · Cradle II: 31–46 · Cradle I: 51–58). The <strong>only</strong> powered characters permitted above the age of 46 are <strong>Paragon</strong>, <strong>the Dean</strong>, and <strong>Vale</strong> — no other powered characters above 46 will be accepted.
            </aside>
          )}                                                                          

            <JoinFieldset type={type} form={form} set={set}/>

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
      {allowHuman && (
        <Field label="Powers" full hint="Tick the box if this character is fully human (no powers). Otherwise, fill in the five fields below.">
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
            <div style={{textAlign:"right",fontSize:"11px",opacity:0.6,marginTop:"4px",fontFamily:"monospace"}}>{(form.powerExpression || "").length} / 1000</div>
          </Field>
          <Field label="Drawbacks" required hint="Costs, weaknesses, hard limits, things that turn it off." full>
            <textarea className="join-textarea is-medium" value={form.drawbacks || ""} onChange={e => set("drawbacks", e.target.value.slice(0, 1000))} placeholder="Even broken-tier characters need limits — be honest." maxLength={1000}/>
            <div style={{textAlign:"right",fontSize:"11px",opacity:0.6,marginTop:"4px",fontFamily:"monospace"}}>{(form.drawbacks || "").length} / 1000</div>
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
      <Field label="Additional Notes" hint="Content warnings, plot hooks, connections wanted, triggers, etc. Optional." full>
        <textarea className="join-textarea is-medium" value={form.notes || ""} onChange={e => set("notes", e.target.value.slice(0, 1000))} placeholder="Optional" maxLength={1000}/>
            <div style={{textAlign:"right",fontSize:"11px",opacity:0.6,marginTop:"4px",fontFamily:"monospace"}}>{(form.notes || "").length} / 1000</div>
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

function JoinFieldset({type, form, set}){
  const Common = (
    <>
      <Field label="Character Name" required>
        <input className="join-input" type="text" value={form.char || ""} onChange={e => set("char", e.target.value)} placeholder="Full name"/>
      </Field>
      <Field label="RPC Profile Link" required hint="The roleplay.chat profile URL for this character">
        <input className="join-input" type="url" value={form.rpcLink || ""} onChange={e => set("rpcLink", e.target.value)} placeholder="https://www.roleplay.chat/..."/>
      </Field>
    </>
  );

  if (type === "student"){
    return (
      <div className="join-fieldset">
        {Common}
        <Field label="Stage Name / Alias" hint="If they have a hero name yet">
          <input className="join-input" type="text" value={form.alias || ""} onChange={e => set("alias", e.target.value)} placeholder="VOLT, KESTREL, etc."/>
        </Field>
        <Field label="House" required>
          <select className="join-select" value={form.house || ""} onChange={e => set("house", e.target.value)}>
            <option value="">Select house…</option>
            {JOIN_HOUSES.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </Field>
        <Field label="Year" required hint="Fr 18–19 · So 19–20 · Jr 20–21 · Sr 21–22">
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
        <PowerFields form={form} set={set} allowHuman={false}/>
        <StudentExtras form={form} set={set}/>
        <TailFields form={form} set={set}/>
      </div>
    );
  }

  if (type === "faculty"){
    const openRoles = getOpenFacultyRoles();
    return (
      <div className="join-fieldset">
        {Common}
        <Field label="Stage Name / Alias" hint="Public-facing alias">
          <input className="join-input" type="text" value={form.alias || ""} onChange={e => set("alias", e.target.value)} placeholder="Optional"/>
        </Field>
        <Field label="Open Faculty Role" required hint="Only open roles are listed">
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
        <PowerFields form={form} set={set}/>
        <TailFields form={form} set={set}/>
      </div>
    );
  }

  if (type === "strata"){
    const isCorporate = form.strataRole === "corporate";
    return (
      <div className="join-fieldset">
        {Common}
        <Field label="STRATA Role" required hint="Talent = hero roster. Corporate = executive, field, or PR.">
          <select className="join-select" value={form.strataRole || ""} onChange={e => set("strataRole", e.target.value)}>
            <option value="">Select role…</option>
            <option value="talent">Talent (Hero)</option>
            <option value="corporate">Corporate</option>
          </select>
        </Field>
        {form.strataRole === "talent" && (<>
        <Field label="Stage Name / Alias" required hint="Their hero name">
          <input className="join-input" type="text" value={form.alias || ""} onChange={e => set("alias", e.target.value)} placeholder="ARCLIGHT, etc."/>
        </Field>
        <Field label="Tier" required hint="A-list = top of roster">
          <select className="join-select" value={form.tier || ""} onChange={e => set("tier", e.target.value)}>
            <option value="">Select tier…</option>
            {JOIN_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        </>)}
        {isCorporate && (<>
        <Field label="Department" required hint="Which division they work in">
          <select className="join-select" value={form.strataDept || ""} onChange={e => set("strataDept", e.target.value)}>
            <option value="">Select department…</option>
            {JOIN_STRATA_DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Role / Title" required hint="e.g. Board Member, Senior Handler, PR Director">
          <input className="join-input" type="text" value={form.strataTitle || ""} onChange={e => set("strataTitle", e.target.value)} placeholder="e.g. Senior Handler"/>
        </Field>
        </>)}
        {form.strataRole && (<PowerFields form={form} set={set} allowHuman={isCorporate}/>)}
        <TailFields form={form} set={set}/>
      </div>
    );
  }

  if (type === "club"){
    const openPos = getOpenClubPositions();
    return (
      <div className="join-fieldset">
        {Common}
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
        <TailFields form={form} set={set}/>
      </div>
    );
  }

  if (type === "gov"){
    const openSeats = getOpenGovSeats();
    return (
      <div className="join-fieldset">
        {Common}
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
        <TailFields form={form} set={set}/>
      </div>
    );
  }

  if (type === "collective"){
    const collectives = getCollectives();
    return (
      <div className="join-fieldset">
        {Common}
        <Field label="Stage Name / Alias" required>
          <input className="join-input" type="text" value={form.alias || ""} onChange={e => set("alias", e.target.value)} placeholder="HEX, NULL, etc."/>
        </Field>
        <Field label="Collective" required>
          <select
            className="join-select"
            value={form.collectiveName || ""}
            onChange={e => set("collectiveName", e.target.value)}
          >
            <option value="">Select collective…</option>
            {collectives.map((c, i) => <option key={i} value={c}>{c}</option>)}
            <option value="[New / Proposed]">[Propose new collective]</option>
          </select>
        </Field>
        <Field label="Role within Collective" required hint="Leader, Specialist, Field, etc.">
          <input className="join-input" type="text" value={form.collectiveRole || ""} onChange={e => set("collectiveRole", e.target.value)} placeholder="e.g. Field Operative"/>
        </Field>
        <PowerFields form={form} set={set}/>
        <TailFields form={form} set={set}/>
      </div>
    );
  }

  if (type === "outside"){
    const orgs = getOutsideOrgs();
    return (
      <div className="join-fieldset">
        {Common}
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
        <Field label="Role at Organisation" required hint="e.g. DCI, Councillor, Reporter" full>
          <input className="join-input" type="text" value={form.outsideRole || ""} onChange={e => set("outsideRole", e.target.value)} placeholder="Job title"/>
        </Field>
        <PowerFields form={form} set={set}/>
        <TailFields form={form} set={set}/>
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
function MapRow({loc, isOpen, onToggle}){
  return (
    <article
      className={"map-row" + (isOpen ? " is-open" : "") + (loc.classified ? " is-classified" : "")}
    >
      <button
        className="map-row-btn"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="map-row-num">{loc.n}</span>
        <span className="map-row-body">
          <span className="map-row-name">
            {loc.name}
            {loc.classified && <span className="map-row-cls">CLASSIFIED</span>}
          </span>
          <span className="map-row-sub">{loc.sub}</span>
        </span>
        <span className="map-row-toggle" aria-hidden="true">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className="map-row-desc">
          <p dangerouslySetInnerHTML={{__html: loc.desc}}/>
          {loc.tags && loc.tags.length > 0 && (
            <div className="map-row-tags">
              {loc.tags.map((t,i) => (<span key={i} className="map-row-tag">{t}</span>))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function MapRowList({items, openId, setOpenId}){
  return (
    <div className="map-rows">
      {items.map(loc => (
        <MapRow
          key={loc.id}
          loc={loc}
          isOpen={openId === loc.id}
          onToggle={() => setOpenId(openId === loc.id ? null : loc.id)}
        />
      ))}
    </div>
  );
}

/* Residence section — each house presented in the lore-house pattern
   (crest + virtue + display name + namesake), with its rooms as a
   numbered row list underneath. Communal spaces follow as a fifth panel. */
function ResidenceBlocks({items, openId, setOpenId}){
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
          <article
            key={houseId}
            className="map-house lore-house"
            style={{"--h-color": m.color, borderTopColor: m.color}}
          >
            <div className="lore-house-hd">
              <img src={m.crest} alt={m.name + " crest"} className="lore-house-crest" loading="lazy"/>
              <div>
                <div className="lore-house-virtue">{m.virtue}</div>
                <h3 className="lore-house-name">{m.name}</h3>
                <div className="lore-house-namesake">{m.namesake}</div>
              </div>
              <div className="map-house-count">
                <span className="map-house-count-n">{list.length}</span>
                <span className="map-house-count-l">{list.length === 1 ? "ROOM" : "ROOMS"}</span>
              </div>
            </div>
            <MapRowList items={list} openId={openId} setOpenId={setOpenId}/>
          </article>
        );
      })}

      {communal.length > 0 && (
        <article className="map-house map-house-communal lore-house" style={{"--h-color":"#d4a84a", borderTopColor:"#d4a84a"}}>
          <div className="lore-house-hd">
            <div className="map-house-shared-mark" aria-hidden="true">◆</div>
            <div>
              <div className="lore-house-virtue">Shared · All four houses</div>
              <h3 className="lore-house-name">COMMUNAL</h3>
              <div className="lore-house-namesake">The residential quad — neutral ground</div>
            </div>
            <div className="map-house-count">
              <span className="map-house-count-n">{communal.length}</span>
              <span className="map-house-count-l">{communal.length === 1 ? "PLACE" : "PLACES"}</span>
            </div>
          </div>
          <p className="map-house-blurb">
            Houses are private; the residential quad is not. The lawn between the four buildings, the kitchen, the laundry, the snug and the garden courtyard belong to everyone — house colours come off at the door.
          </p>
          <MapRowList items={communal} openId={openId} setOpenId={setOpenId}/>
        </article>
      )}
    </div>
  );
}

function MapTab(){
  const districts = D.mapDistricts;
  const locations = D.mapLocations;
  const [openId, setOpenId] = useState(null);
  const sectionRefs = useRef({});

  const jumpTo = (dId) => {
    const el = sectionRefs.current[dId];
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const countFor = (id) => locations.filter(l => l.district === id).length;

  return (
    <div>
      <PageHead
        stamp="DOC · 03 · GROUNDS"
        title={<>Campus map &amp; <em style={{fontFamily: 'var(--display)', fontStyle: 'normal'}}>grounds</em></>}
        body="Greenwich, London. The compound runs from Trafalgar Road to the Thames, with Greenwich Park at the eastern wall. What follows is the gazetteer — every door, room, and corner the registry will commit to in writing."
        pageNum="P. 003 / VIII"
      />

      <div className="map-page">

        {/* ── DISTRICT INDEX ─────────────────────────────────
             Comic-frame plates, numbered 01–07, each clickable. */}
        <section className="map-index">
          <div className="lore-eyebrow">◆ Index of the grounds</div>
          <h2 className="map-index-h">Eight districts.</h2>
          <p className="map-index-lead">
            The compound divides cleanly. <em>Four main zones</em> — academic, training, residences, STRATA — sit inside the wall. Four more reach beyond it: athletics &amp; grounds, the campus commons, the perimeter strip, and the slice of Greenwich the school treats as overflow.
          </p>
          <div className="map-index-grid">
            {districts.map((d, i) => {
              const n = String(i+1).padStart(2,"0");
              return (
                <button
                  key={d.id}
                  className="map-index-card"
                  onClick={() => jumpTo(d.id)}
                  aria-label={"Jump to " + d.name}
                >
                  <div className="map-index-card-num">{n}</div>
                  <div className="map-index-card-name">{d.name}</div>
                  <div className="map-index-card-count">{countFor(d.id)} locations</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── DISTRICT SECTIONS ──────────────────────────────
             Each district uses the lore-eyebrow / lore-h pattern
             so the page reads as part of the editorial spread. */}
        {districts.map((d, i) => {
          const items = locations.filter(l => l.district === d.id);
          if (!items.length) return null;
          const isResidence = d.id === "residence";
          const n = String(i+1).padStart(2,"0");

          return (
            <section
              key={d.id}
              className="map-district"
              ref={el => { sectionRefs.current[d.id] = el; }}
            >
              <header className="map-district-head">
                <div className="lore-eyebrow">◆ District {n}</div>
                <h2 className="lore-h map-district-h">{d.name}.</h2>
                <p className="map-district-blurb">{d.blurb}</p>
                <div className="map-district-meta">
                  <span className="map-district-count">{items.length} {items.length === 1 ? "location" : "locations"}</span>
                </div>
              </header>

              {isResidence
                ? <ResidenceBlocks items={items} openId={openId} setOpenId={setOpenId}/>
                : <MapRowList items={items} openId={openId} setOpenId={setOpenId}/>
              }
            </section>
          );
        })}

        {/* ── FOOTNOTE ───────────────────────────────────── */}
        <div className="map-footnote">
          <p>
            <strong>End gazetteer.</strong> Locations marked <em>CLASSIFIED</em> appear in this index by name only; access is restricted by Tier and by the discretion of the Dean's office. Off-campus venues are listed for reference and are not affiliated with the Institute except where noted.
          </p>
        </div>
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
          <span className="gs-panel-icon" aria-hidden="true"><span className="ico" aria-hidden="true">⌕</span></span>
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
              <div className="gs-empty-icon"><span className="ico" aria-hidden="true">⌕</span></div>
              Type to search · Records will appear here
            </div>
          )}
          {ql && totalMatches === 0 && (
            <div className="gs-empty">
              <div className="gs-empty-icon"><span className="ico" aria-hidden="true">○</span></div>
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
            <span className="mast-search-icon" aria-hidden="true"><span className="ico" aria-hidden="true">⌕</span></span>
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

      <nav className="tabs" role="tablist" aria-label="Registry sections">
        <div className="tabs-inner">
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
        {TAB_MAP[tab]}
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
    '<div style="padding:32px;font-family:Inter,sans-serif;color:#f1ede4;background:#0c0c10;border:1px solid #e4324a;border-left:4px solid #e4324a;margin:24px;border-radius:12px;">'
    + '<div style="font-family:Fraunces,Georgia,serif;font-size:32px;margin-bottom:12px;letter-spacing:-.01em;color:#f1cd72;">Render error</div>'
    + '<pre style="white-space:pre-wrap;font-size:12px;color:#b8b3a8;">' + (err && err.stack ? err.stack : String(err)) + '</pre>'
    + '</div>';
  console.error(err);
}
