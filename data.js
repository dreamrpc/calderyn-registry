/* ════════════════════════════════════════════════════════════════════════
   CALDERYN COLLEGE — REGISTRY DATA
   ────────────────────────────────────────────────────────────────────────
   This is where you edit characters, faculty, clubs, etc.
   The HTML and JSX never need to be touched for normal updates.

   QUICK NAVIGATION (search for these markers):
     • houseColors     — house theme colours (rarely edit)
     • houses          — the four house objects (rarely edit)
     • students        — STUDENT ROSTER ← paste student applications here
     • faculty         — FACULTY ROSTER ← paste faculty applications here
     • strata          — STRATA corporate directory
     • outside         — Greenwich orgs (police, NHS, council, press, etc.)
     • powers          — Power registry (linked to students/faculty)
     • powerStatuses   — Status definitions (Student / Vanguard / etc.)
     • bannedPowers    — Banned-power list
     • powerTiers      — Tier definitions (A through D)
     • clubs           — CLUBS ← Powerball, Drama, Council, Press, etc.
     • studentGov      — STUDENT GOVERNMENT (President, RAs, Committee)
     • heroLists       — STRATA hero rosters (A-list / B-list / C-list / D-list)
     • groups          — VANGUARD + Hero Collectives
     • rules           — RP rules (rarely edit)
     • curriculumTracks — Curriculum (rarely edit)
     • tabs            — Tab nav config (don't edit)

   To add a new character: search for the right section, paste the snippet
   from the application Discord embed at the right spot, save, and push.
   ════════════════════════════════════════════════════════════════════════ */

window.CALDERYN = {

houseColors: {
  valaris: { primary: "#c41a1a", secondary: "#ffcc00", trim: "#FFF8E7" },
  orenne:  { primary: "#d4901a", secondary: "#ffcc00", trim: "#E8DDC2" },
  saberis: { primary: "#15803d", secondary: "#0C0C0C", trim: "#ffcc00" },
  grimere: { primary: "#1e40af", secondary: "#9B6A2F", trim: "#D6D8E1" },
},

houseLore: {
  rebrand2020: "In 2020, Calderyn’s four houses were rebranded around the active Vanguard. Each house was renamed for, and aligned to the virtue of, a sitting Vanguard member: Valaris (Paragon — Justice), Orenne (Aegis — Fortitude), Saberis (Vigil — Prudence), and Grimere (Switchboard — Temperance). The rebrand reframed house identity around STRATA’s flagship operators rather than founding-era figures, and the established: \"2020\" tag on each house records the date of that change."
},

houses: [
  {
    id: "valaris", name: "VALARIS", bg: "#c41a1a", animal: "Falcon",
    crest: "https://i.ibb.co/G4q9m34x/Valaris.png",
    established: "2020", virtue: "Justice",
    virtue_gloss: "What is right · Spoken aloud · Without apology",
    traits: ["Brave", "Charismatic", "Idealistic"],
    motto: "Loud, and unafraid.",
    rival: "saberis",
    rivalry: "The bitterest rivalry on campus, and the one the administration has never managed to defuse. Valaris students view Saberis as compromised — willing to deal with the institution rather than challenge it, willing to launder ambition as 'pragmatism.' Saberis students view Valaris as naive — performing principle in public while their bills get paid by the same STRATA contracts. Neither side is wrong.",
    represents: "Valaris is built on Justice. Students here are taught to draw moral lines and hold them — to act decisively when something is wrong, to refuse to soften the truth for comfort, and to take responsibility for the consequences.",
    namesake: { name: "Adrian Valaris", title: "Paragon · Vanguard · Active", portrait: null, desc: "Adrian Valaris — Paragon, the symbol — never set foot in this school as a student.", link: null },
    sorting: "Valaris finds you. The intake board favours students with a measurable public or social footprint.",
    alumni: [
      { name: "[Open]", alias: "[ALIAS]", era: "Class of 2018", note: "A-list. Headline operator." },
      { name: "[Open]", alias: "[ALIAS]", era: "Class of 2022", note: "B-list. Press circuit." },
    ],
  },
  {
    id: "orenne", name: "ORENNE", bg: "#d4901a", animal: "Stag",
    crest: "https://i.ibb.co/0RQXNgXg/Orenne.png",
    established: "2020", virtue: "Fortitude",
    virtue_gloss: "Endurance · Loyalty · Holding the Line",
    traits: ["Loyal", "Humble", "Resilient"],
    motto: "Still standing. Still ours.",
    rival: null, rivalry: null,
    represents: "Orenne is built on Fortitude — the slow virtue. Students here are not the loudest and rarely the most decorated, but they are the ones still standing when the press has moved on.",
    namesake: { name: "Margery Orenne", title: "Aegis · Vanguard · Active", portrait: null, desc: "Margery Orenne — Aegis — was here from 2005 to 2009.", link: null },
    sorting: "Orenne selects students with documented histories of consistent behaviour under pressure.",
    alumni: [
      { name: "[Open]", alias: "[ALIAS]", era: "Class of 2019", note: "B-list. Long-form rescue operations." },
      { name: "[Open]", alias: "[ALIAS]", era: "Class of 2023", note: "C-list. Regional. Refused promotion." },
    ],
  },
  {
    id: "saberis", name: "SABERIS", bg: "#15803d", animal: "Serpent",
    crest: "https://i.ibb.co/qMry0fF2/Saberis.png",
    established: "2020", virtue: "Prudence",
    virtue_gloss: "Foresight · Judgment · Strategic Patience",
    traits: ["Ambitious", "Cunning", "Versatile"],
    motto: "Patient. Then decisive.",
    rival: "valaris",
    rivalry: "Saberis maintains, on record, that there is no rivalry. Off the record, every Saberis senior keeps a private file on at least one Valaris counterpart.",
    represents: "Saberis is built on Prudence — the practical wisdom of knowing when, where, how, and at what cost.",
    namesake: { name: "Caius Saberis", title: "Vigil · Vanguard · Active", portrait: null, desc: "Caius Saberis — Vigil — was here from 2002 to 2006.", link: null },
    sorting: "Saberis selects for ambition with direction.",
    alumni: [
      { name: "[Open]", alias: "[ALIAS]", era: "Class of 2017", note: "A-list. Three-time STRATA contract renewal." },
      { name: "[Open]", alias: "[ALIAS]", era: "Class of 2021", note: "Politician. Powered policy advisor." },
    ],
  },
  {
    id: "grimere", name: "GRIMERE", bg: "#1e40af", animal: "Moth",
    crest: "https://i.ibb.co/PGhrJBBm/Grimere.png",
    established: "2020", virtue: "Temperance",
    virtue_gloss: "Restraint · Balance · Knowing When Not To",
    traits: ["Knowledge", "Unconventional", "Curious"],
    motto: "Know it. Then keep it.",
    rival: null, rivalry: null,
    represents: "Grimere is built on Temperance — the virtue of restraint, balance, and knowing when not to deploy.",
    namesake: { name: "Iris Grimere", title: "Switchboard · Vanguard · Active", portrait: null, desc: "Iris Grimere — Switchboard — was here from 2009 to 2013, and never quite left.", link: null },
    sorting: "Grimere takes those who don't fit elsewhere — not as a consolation, but deliberately.",
    alumni: [
      { name: "[Open]", alias: "[ALIAS]", era: "Class of 2016", note: "Now College faculty — Power Theory." },
      { name: "[Open]", alias: "[ALIAS]", era: "Class of 2024", note: "Unsanctioned. Withdrew from contract negotiation." },
    ],
  },
],

// ────────────────────────────────────────────────────────────────────
// REGISTRY RULES — PER-WRITER PER-POOL TIER CAPS
//   Each writer (OOC identity) has TWO independent character pools
//   — students and adults — and each pool gets the same tier caps,
//   counted across every RPC account they own:
//       A-List → max 5    (per pool)
//       B-List → max 8    (per pool)
//       C-List → max 10   (per pool)
//       D-List → uncapped
//   Student characters and adult characters are counted SEPARATELY:
//   a writer at the student A-List cap can still submit an adult
//   A-Lister, and vice versa.
//
//   Pool determination — a character is "student" if their powers[]
//   row has status: "student"; anything else (or a heroLists slot
//   alone) is "adult".
//
//   Exceptions were granted to early supporters during the room's
//   opening weeks; no further exceptions will be made going forward.
//
//   Enforced automatically by the Discord approval bot at click time
//   (worker/src/quota.js + worker/src/writers.js). The bot blocks any
//   approval that would push a writer past the cap for the submission's
//   pool + tier combination and shows an amber "quota blocked" embed
//   in the application channel.
//
//   Adding a *new role* for an existing character at the same tier
//   (e.g. an A-Lister taking a faculty seat or a Powerball position
//   on another form) does NOT count as a new slot — the set only
//   grows on a new char name.
//
//   Cap values are env-configurable in worker/wrangler.toml:
//   A_LIST_LIMIT_PER_WRITER, B_LIST_LIMIT_PER_WRITER,
//   C_LIST_LIMIT_PER_WRITER.
// ────────────────────────────────────────────────────────────────────
students: [
  // Monty's secret ability (dormant power absorption through death) is
  // narrative-locked and intentionally omitted from the public power /
  // expression / drawbacks fields below. Admin-side note only:
  //   "Monty's real ability has not properly activated because he has
  //    never killed another powered person. If he kills a supe, his
  //    body can absorb and permanently integrate aspects of their power.
  //    Until then, his body is misfiring, which is why his ability
  //    expresses as mucus, regurgitation, and stomach-pressure attacks."
  // Player notes: Valaris embarrassment in power presentation, not in
  //   ambition. Talked his way into Student Body President + Debate
  //   Club Captain despite the most unmarketable ability on campus.
  {
    char: "Montgomery Farthing III",
    alias: "Upchuck",
    house: "valaris",
    year: "Junior",
    track: "hero",
    tier: "C-List",
    power: "Regurgitive storage, mucus armour, and belch sonics",
    expression: "Monty's ability currently manifests as a gross biological defence system. He can store small objects inside his body and regurgitate them later, coat himself in slippery mucus armour, and release short-range sonic belches that can disorient opponents. These powers are humiliating, messy, and unreliable, but useful for distraction, survival, smuggling, and support work.",
    drawbacks: "Monty's powers make him nauseous, weak, dehydrated, and physically disgusting to be around. His mucus can be dried, frozen, burned, or washed away. His belch sonics are short range and can affect allies. His storage has strict size limits and can injure him if he swallows anything sharp, toxic, or unstable.",
    link: "https://roleplay.chat/profile.php?user=upchuck",
  },
  {
    char: "Cesare Delgado",
    alias: "NANO",
    house: "grimere",
    year: "Junior",
    track: "hero",
    tier: "A-List",
    power: "Technorganic Integration — fused cybernetic / nanotech body system",
    expression: "Cesare's body is a fused technorganic platform — armour plating, an integrated arm-cannon, deployable shielding, mechanical limbs, thrusters for short-burst mobility, neural-interface tech tools, and active self-repair routines. He can read and command compatible electronics through direct contact and operates in close coordination with BYTE's network support.",
    drawbacks: "Heavy use causes overheating, phantom pain, system strain, and mechanical lockups. EMPs, malware, and hostile tech intrusion affect him directly because his cybernetics are part of his body, not equipment. The arm-cannon overheats and locks in cannon form after sustained firing. Full mechanical-limb deployment frightens onlookers. Shielding sacrifices mobility and offence; thrusters cannot sustain flight. His organic systems still need rest, oxygen, pain management, and cooling cycles. Major repairs require parts, time, and specialist help. His deepest weakness is ownership: significant parts of him may be classified as experimental STRATA-linked medical technology, blurring the line between Cesare and the asset.",
    link: "https://roleplay.chat/profile.php?user=delgado"
  },
  {
    char: "Vecna Ravindrakumar",
    alias: "BYTE",
    house: "grimere",
    year: "Junior",
    track: "sidekick",
    tier: "B-List",
    power: "Technopathic Intrusion — mental interface with electronic systems",
    expression: "BYTE mentally interfaces with electronics within close range — reading device states, commanding compatible hardware, monitoring and countering surveillance, and influencing environmental tech (lights, doors, screens, comms). She specialises in digital forensics: reconstructing deleted files, tracing comms, identifying tampering. In the field she runs live systems support for NANO and the team, and operates Trojan, a small companion drone that acts as a mobile relay and lets her extend her range and senses through it.",
    drawbacks: "Her power needs systems to work — she's effectively powerless in low-tech, shielded, or analog environments. Heavy intrusion causes sensory overstimulation, migraines, and nosebleeds; cascading networks can overload her if she pushes too hard. She processes commands literally, so unclear instructions to systems can produce dangerous results. Trojan is a single point of failure: if the drone is destroyed, jammed, or compromised, her effective range collapses, and a hostile actor with the right counter-tools could ride her connection back to her.",
    link: "https://roleplay.chat/profile.php?user=vecna"
  },
  {
    char: "Celestia \"Stella\" Starkov",
    alias: "Mirage",
    house: "saberis",
    year: "Sophomore",
    track: "hero",
    tier: "A-List",
    power: "Mirage — Light Bending, Illusion Projection, Photon-Flight, Light Teleportation, & Weaponised Light",
    expression: "Stella manipulates visible light around her body in motion. The illusion side of her power throws false doubles, stages glamour disguises, weaves shimmer-fields and visual distortions, decoys her own movement, and drops her into short bursts of near-invisibility. The offensive side bends light into something that hits — concussive photo-flashes, blinding flares at point-blank, and focused coherent beams she can lance from her hands or kicks at range. She can also ride her own light: short bursts of photon-thrust flight that read as a streak of brilliance, useful for vertical recovery, gap-closing, and stage entrances more than long-haul travel. At higher output she folds that flight into true light teleportation — collapsing into a streak of brilliance and re-forming somewhere else in line of sight, leaving a trail of false Stellas in her wake that hold their pose for a beat before dissolving, so opponents can’t tell which silhouette is the real exit. The work is at its sharpest while she is moving — flipping, dancing, kicking, acting — where her gymnastics, Drama Club training, and taekwondo footwork weaponise misdirection. As Calderyn's founding cheer captain, with regular Drama Club lead roles since enrolling, she has built the timing, presence, and discipline to sell every illusion as the real thing while she sets up the actual hit.",
    drawbacks: "Her illusions are visual only — they cannot strike, hold, or block on their own, and they lose ground against darkness, smoke, heavy rain, thermal tracking, sound-based senses, scent tracking, and any opponent who refuses to trust their eyes. Her offensive light has a real cost — focused beams and concussive flashes bleed heat into her hands, arms, and eyes, leaving burns at high intensity, and a missed beam is a lit-up signal flare that gives her position away to anything looking. Photon-flight is short-range and short-duration — fine for a leap, a dodge, or a stage entrance, useless as long-haul transport, and it dumps light and heat in a way that defeats her own stealth the moment she uses it. Overuse of any branch triggers migraines, eye strain, nausea, vertigo, nosebleeds, and afterimages that make her own vision unreliable; pushed too hard she becomes the easiest target on the field. Her reputation is also a liability — people consistently underestimate her until she has already won, but the same image makes her a sponsorship target whose every move is recorded.",
    link: "https://roleplay.chat/profile.php?user=illuminate"
  },
  {
    char: "Valentina \"Tina\" Salvador",
    alias: "Serpentina",
    house: "saberis",
    year: "Freshman",
    track: "sidekick",
    tier: "B-List",
    power: "Serpentine Physiology · Petrifying Gaze, Venom Command, Pheromone Trance, Hyperflexibility",
    expression: "Gorgon-like serpentine mutation: faint pearlescent scales, vertical pupils when active, two living white serpents in her hair (nervous-system extensions, react to heat/scent/threat).\n\nPRIMARY — Petrifying Gaze: direct eye contact triggers temporary calcifying paralysis. Stiffness, numbness, slowed reactions, pale stone-like skin. Glance = hesitation; sustained = full immobilisation. Temporary mineralised stasis, NOT permanent stone.\n\nSECONDARY — Pheromone Trance: subtle close-range pheromones don't control alone, but make targets fixate on her voice/scent/eyes — drowsy, fascinated, compliant. Sets up the gaze.\n\nTERTIARY — Venom Command: a hair-serpent bite injects venom that creates a temporary obedience state. Numbness, dulled emotion, heightened suggestibility. Target follows simple spoken commands (stop, drop it, stay quiet). NOT full puppetry, NOT mind-rewrite.\n\nPHYSICAL — Snake-like flexibility, balance, and recovery. Effective evasive support fighter and cheer flyer.",
    drawbacks: "GAZE — Needs direct eye contact. Blocked by mirrored lenses, visors, blindfolds, smoke, darkness, camera feeds, reflections, trained look-aways. One target at a time; multi-target attempts strain her and weaken the effect. Breaks if she blinks, looks away, is startled, or struck. Stronger or trained targets resist faster.\n\nVENOM — Requires a successful bite. Armour, sealed suits, healing factors, toxin resistance, antivenom block it. Lasts only minutes per dose. One bitten target reliably commanded at a time. Self-destructive or morally opposed commands can be resisted.\n\nPHEROMONES — Close range only. Killed by wind, rain, open air, respirators, sealed helmets, smoke, strong chemicals.\n\nCOSTS — Overuse: migraines, eye pain, nosebleeds, nausea, light sensitivity, joint stiffness. Pushed too hard, painful stone patches surface on her own skin. No super-strength, no invulnerability. Cold and dehydration slow her. Hair-serpents are sensitive; if grabbed, cut, burned, or frozen, she feels it as her own pain.",
    link: "https://roleplay.chat/profile.php?user=serpentina"
  },
  {
    char: "Lyrica Malaya Song",
    alias: "Siren",
    house: "valaris",
    year: "Senior",
    track: "hero",
    tier: "B-List",
    power: "Siren Physiology — Vocal Resonance, Hydroresonance & Aquatic Adaptation",
    expression: "Mutation that alters Lyrica's voice, lungs, throat, hearing, body chemistry, and relationship with water — a living siren system rather than a single-track power. SIREN VOICE: produces inhuman frequencies and layered harmonics that can shape sonic pressure waves, shatter glass, disrupt balance, induce nausea/vertigo/headaches, rattle bones and structures, hijack microphones, phones, speakers, amps, intercoms, and PA systems, carve short-range silence pockets through counter-frequency, and project emotional unease, longing, dread, panic, or euphoria through sound (influence, not mind control). HYDRORESONANCE: water carries her resonance better than air, letting her ripple, tremble, lift, coil, and splash existing moisture; form unstable shields and curtains; move water in ribbons; and amplify sonic pressure through nearby liquid. BOILING POINT: sustained vocal vibration excites water until it warms, steams, or boils — small volumes go fast, larger volumes need stamina and emotional control; used for steam cover, scalding spray, pressure bursts, intimidation, area denial, heated traps, cauterising steam, and rescue concealment. STEAM GENERATION: hot vapour fills a space, obscuring vision, distorting light, slicking surfaces, and turning the battlefield into a stage where her voice seems to come from everywhere. AQUATIC ADAPTATION: enhanced swim speed/grace/endurance, instinctive response to currents and pressure, and a secondary aquatic breathing state that draws oxygen from water through mutated tissue, allowing extended underwater survival; underwater her voice travels farther and hits harder, with a hum becoming a warning pulse and a scream a concussive blast. UNDERWATER SONAR SENSE: detects ripples, footsteps through puddles, vibration in pipes, and movement through nearby water — siren-grade sonar in clean or flowing liquid. CURRENT INFLUENCE: subtle flow control around her body for faster swimming, sharp turns, and resisting drag. STRATA fits her with a sleek silver vocal stabilizer at her throat that regulates dangerous frequencies and glows red when her siren tones engage; she styles it as jewellery and resents it as life support on a leash.",
    drawbacks: "Her power runs through damaged, unstable parts of her body — a previous supe-related attack permanently injured her vocal cords and triggered the mutation. Overuse causes throat bleeding, temporary loss of speech, migraines, vertigo, nosebleeds, chest pain, tremors, hearing distortion, loss of pitch control, accidental resonance spikes, and collapse after prolonged use; pushed too far, the damage becomes permanent. She cannot conjure water from nothing — she needs existing moisture (puddles, rain, fountains, pipes, drinks, wet floors, sprinklers, steam, mist, humidity, damp clothing, or nearby bodies of water), and dry, dehumidified, or sealed environments cripple her hydroresonance. Boiling and freezing cost more than simply moving water; large-scale temperature shifts exhaust her quickly. Weakened or blocked by soundproof rooms, silence technology, sonic dampeners, throat restraints, gags, sealed helmets, audio interference, smoke inhalation, throat injuries, feedback attacks, and anything that stops her breathing or vocalising. Underwater she is dangerous but not invincible — nets, restraints, toxins, sonic dampeners, extreme pressure, polluted, chemical, or sewage water, freezing temperatures, and low-oxygen conditions can still put her in danger. Power is emotionally reactive: anger gives her volume, grief gives her depth, fear makes her unstable, humiliation makes her dangerous, and anything connected to Dirty Halo can make her resonance spike before she chooses to use it. The vocal stabilizer keeps her voice usable — without it, frequencies become wildly unpredictable and self-damaging.",
    link: "https://roleplay.chat/profile.php?user=lyrica"
  },
  {
    char: "Katniss Saunders",
    alias: "Schrödinger",
    house: "valaris",
    year: "Freshman",
    track: "hero",
    tier: "A-List",
    power: "Form Manipulation - Shape-Shifting; Aura Manipulation - Energy Weapons, Tools, Constructs",
    expression: "Katniss has only two single powers but they are incredibly strong, especially in the hands of a young adult who doesn't know how to utilize them properly and could easily become a dangerous villain if left alone. Her first is shape-shifting. Kat has two available forms, one being a 'disguise' of sorts that could be utilized for stealth purposes - that of an orange and black striped tabby cat. The other form is the one that makes her dangerous and puts her on the A-list without even realizing it - a tiger anthropomorphic type form in which all her human traits (strength, hearing, speed, sight, taste) are boosted into vastly superhuman proportions. In either human or anthropomorphic form she also has the curious ability to control the energy of her own aura. It can be used to mimic the shape of and be used as almost anything she has seen such as weapons, tools, vehicles, etc.",
    drawbacks: "There are costs to her power. The longer and longer she uses either, the more and more fatigued she grows. Her shifting power in particular has a special give and take as needed condition: her enhanced abilities can be pushed even further than they are in her initial transformation. How far exactly she can push her limits is not known since it's not been tested either by herself or others. But the more and more she pushes herself, the more and quicker she tires out and the more rest or medical attention she will need. Science suggests that were she to keep pushing hard enough, her own powers could potentially even kill her. Kat has a very flawed personality; a bad childhood and a troubled young adult who dropped out of high school, she pushes everyone away and is, most the time, a bitch to others. That wall around her heart seems almost like solid steel and impassable, making her quite unfriendly and mean in social settings.",
    link: "https://roleplay.chat/profile.php?user=Katniss"
  },
  {
    char: "Orion Sterling",
    alias: "n/a",
    house: "saberis",
    year: "Junior",
    track: "hero",
    tier: "C-List",
    power: "Chronal Displacement · Spatial Decoy",
    expression: "Orion's power manifests as nine brilliant, sapphire-hued points of light that hover in a fixed \"Great Hunter\" formation behind his back, acting as tethered anchors for his physical presence. Internally, these stars serve as stabilizers for nine \"latent selves\" folded into his immediate personal space; when he sustains a strike that would otherwise be terminal, the internal pressure of the incoming kinetic force triggers an automatic sub-dimensional swap. The real Orion is momentarily displaced—shifting slightly out of phase—while a discarded anchor surges forward to form a \"Glass Shatter\" phantom that solidifies instantly to absorb the trauma. This decoy then erupts into a cloud of razor-sharp, crystalline stardust as it disintegrates, signaling the permanent erasure of one anchor and leaving the real Orion exposed and one step closer to his inevitable, final mortality.",
    drawbacks: "The most glaring drawback is the power's absolute entropy; each shattered phantom is a permanent loss of a non-renewable biological resource, meaning Orion is effectively a \"terminal\" hero whose career—and life—has a hard, visible expiration date. Mechanically, the \"Glass Shatter\" only triggers for fatal trauma, leaving him entirely vulnerable to non-lethal injuries like broken bones, exhaustion, or blood loss that can weaken him without activating his safety net. Furthermore, because multiple fatal strikes (such as a hail of high-caliber gunfire or a sustained explosion) consume multiple lives simultaneously, he lacks the \"invincibility frames\" typical of most protectors, making him exceptionally fragile in high-volume combat scenarios. Finally, the Celestial Guard constellation acts as a glowing tactical liability, broadcasting his remaining \"health bar\" to any enemy savvy enough to count the stars and wait for the final, flickering light to go dark.",
    link: "https://roleplay.chat/profile.php?user=odyssey"
  },
  {
    char: "Rhode Sterling",
    alias: "n/a",
    house: "valaris",
    year: "Junior",
    track: "hero",
    tier: "A-List",
    power: "Kinetic Conversion · Absorption & Redirection",
    expression: "Rhode's power manifests internally as a physiological \"battery\" centered in his chest and shoulders, where his body absorbs the kinetic energy from physical impacts and stores it within his muscular structure. This internal mechanic allows him to double the force of incoming strikes and redirect them through his limbs, boosting his physical output far beyond human limits. Visually, this expression is characterized by a vibrant golden aura that causes his skin to glow and his muscles to surge with energy, particularly around the \"X\" scar on his chest. When he releases this stored energy, it erupts in explosive, graphic shockwaves and stylized golden bursts.",
    drawbacks: "Rhode's power has a finite storage capacity, meaning that if he absorbs too much force too quickly without redirecting it, he risks a \"Kinetic Overload\" that can cause internal physical strain or unintentional explosive discharges. Because his ability is purely reactive and categorized as Absorption and Redirection, it is inherently ineffective against non-physical or elemental attacks, such as mental manipulation or energy-based strikes that lack mass. Furthermore, he cannot generate his own kinetic energy from a standstill; he requires an initial external impact or a \"jumpstart\" to begin doubling his striking power. These hard limits mean that if he is isolated from physical combat or unable to maintain his focus during high-intensity fights, his golden kinetic glow fades, leaving him reliant solely on his natural physical strength.",
    link: "https://roleplay.chat/profile.php?user=chronicles"
  },
  {
    char: "Candiope Sterling",
    alias: "MONOLITH",
    house: "orenne",
    year: "Freshman",
    track: "sidekick",
    tier: "B-List",
    power: "Density Manipulation · Inertia Reinforcement",
    expression: "Visually, Candiope's power manifests as the pale, shattering pattern of scars across her skin, glowing with a dull, subterranean amber light as she draws her molecular structure tighter, making her skin appear as unyielding as forged industrial steel. Internally, she exerts a subconscious command over the Higgs field interaction within her own mass, effectively locking her particles into a high-density lattice that refuses to be displaced by outside kinetic energy. When she is active, she doesn't just feel heavy; she creates a localized gravitational anchor that causes the ground to crack beneath her feet and projectiles to simply pancake against her skin as if hitting a mountain.",
    drawbacks: "While her density provides near-invulnerability, the massive increase in mass causes Candiope to become exceptionally slow and cumbersome, often resulting in her sinking through floorboards or pavement not rated for such extreme weight. The internal physical strain of \"anchoring\" her molecules is visible through the stress fractures on her skin, which deepen and cause searing neural pain if she maintains her maximum density for too long, eventually leading to a forced \"shutdown\" that leaves her physically exhausted and fragile as a glass pane. Additionally, because her power is tied to structural integrity, she is highly vulnerable to sonic frequencies or vibrations that can destabilize her molecular lattice, potentially causing her density to collapse prematurely or backfire painfully against her own skeletal system.",
    link: "https://roleplay.chat/profile.php?user=monolith"
  },
  {
    char: "Ariana Ferreira",
    alias: "Morpha",
    house: "orenne",
    year: "Junior",
    track: "sidekick",
    tier: "B-List",
    power: "Kinetic Morphology — Adaptive Elastic Physiology",
    expression: "Highly elastic physiology that lets Ariana stretch, compress, inflate, and redistribute her body's mass and density at will. Elastic extension grants precise long-reach grappling and ranged strikes; mass redistribution shifts her between low-density inflation (cushioning, buoyancy, partial lift, crowd control) and high-density compression (heavier strikes, rolling momentum, crushing force). Impact distribution and adaptive durability spread blunt force across her elastic structure, partly resisting bullets, electricity, and heat. Conditional strength scales with her form — weakest stretched, peak when compressed. Enhanced baseline attributes and instinctive kinetic awareness let her redirect momentum and use the environment as leverage.",
    drawbacks: "Overextension and repeated deformation cause structural fatigue and loss of control. Each density mode has a tradeoff — inflated is pierce-vulnerable and weaker, compressed is slower and less shock-absorbent. Her control depends on focus; electric shock, fatigue, or stress reduces precision. Cold makes her stiff and brittle; heat over-softens her. Absorbing too much force risks over-dispersion and delayed reactions. Maintaining altered forms drains her metabolism quickly, and her recovery has a hard ceiling — severe trauma, repeated damage, and especially acid or corrosives bypass her elasticity entirely.",
    link: "https://roleplay.chat/profile.php?user=Morpha"
  },
  {
    char: "Enzo Krüger",
    alias: "Starboy",
    house: "valaris",
    year: "Senior",
    track: "hero",
    tier: "A-List",
    power: "Stellar Compression, Stellar Flight, Diamond State, Starburst Release, Event Horizon Perception, Enhanced Physicality",
    expression: "Enzo’s body functions like a living gravitational reactor, absorbing, compressing, and redistributing force through his system. He doesn’t generate energy from nothing — kinetic impact, atmospheric resistance, momentum, and physical strain convert into volatile stellar energy. The more force he absorbs, the more dangerous he becomes. Manifests through glowing fracture-lines beneath the skin, prism-like refractions, compressed air distortions, and bursts of gold-white stellar light. At lower tiers his output looks elegant and controlled; at peak it turns violent and unstable, resembling a star approaching collapse.",
    drawbacks: "Overcompression Syndrome — absorbed force can rupture his own structure when reserves outpace his capacity. Momentum Dependency means he relies on incoming force to fuel output, leaving him vulnerable in low-pressure standoffs. Sustained release builds Extreme Heat that scalds skin and warps gear. Emotional Amplification destabilizes precision, while Self-Sacrificial Tendencies and Fear of Failure push him to keep absorbing past safe limits.",
    link: "https://roleplay.chat/profile.php?user=Starboy!"
  },
  {
    char: "Quinn O'Hare",
    alias: "Kestrel",
    house: "valaris",
    year: "Senior",
    track: "hero",
    tier: "A-List",
    power: "Predator Sync — Counter-Adaptive Mimicry",
    expression: "Rather than copying powers, Quinn aligns her physiology, perception, and combat style to directly counter a target. Sustained engagement lets her read movement, timing, and power usage and incrementally transform into the opponent's worst matchup. A primary mark deepens that adaptation — sharper reactions, refined movement, tailored counter-strategy — and lets her close the gap on stronger fighters. Enhanced physical attributes are balanced toward speed, agility, and reaction over raw strength. Her physiology processes toxins at an accelerated rate (poisons, venoms, chemical agents are reduced, not negated), and her nervous system rapidly recalibrates after stuns or paralysis. Adaptation visibly escalates through Mark, Read, and Adapt phases.",
    drawbacks: "Adaptation isn't instant — she needs a brief engagement window before her ability takes effect. Only one primary target can be fully marked at a time, and switching focus requires a reset period. Tracking multiple threats while maintaining adaptive states is mentally taxing and fails under cognitive overload. Adaptation lowers an opponent's effectiveness but doesn't grant immunity — damage still lands. Prolonged combat or repeated toxin and disruption exposure drains her metabolic reserves, slowing reactions and reducing adaptation efficiency.",
    link: "https://roleplay.chat/profile.php?user=Kestrel"
  },
  {
    char: "Velora Virelli",
    alias: "Filament",
    house: "grimere",
    year: "Sophomore",
    track: "hero",
    tier: "A-List",
    power: "Adaptive Silk Manipulation · Perceptual Influence",
    expression: "Velora generates and controls living filament strands through her hair, shifting them between soft silk and reinforced high-tension fibre. Tensile reinforcement supports her body weight or others, anchors to structures, and suspends or immobilises targets. Weave constructs interlace strands into shields, barriers, and protective wraps that absorb and disperse force (stronger against blunt than piercing). Filament strikes deliver whip-like hits and sweeps that trip, displace, or redirect momentum. Zone control places strands across an area to dictate movement and dominate space. Layered on top is Soft Focus — a passive perceptual influence that lowers her perceived threat level, draws attention to her face, creates micro reaction-delays, and softens emotional tone. It is misdirection, not mind control.",
    drawbacks: "Filament growth and reinforcement consume significant energy; prolonged use brings fatigue and weaker, less responsive strands. Managing multiple strands raises mental load and drops precision under pressure. Heat weakens fibre integrity and cluttered environments interfere with control. Greater length costs precision and response speed. She can't out-muscle physically dominant opponents and is vulnerable when restrained. Soft Focus loses ground against trained or alert targets and breaks down in chaos or under overwhelming stimuli.",
    link: "https://roleplay.chat/profile.php?user=Filament!"
  },
  {
    char: "Jason McTavish",
    alias: "Storm",
    house: "orenne",
    year: "Senior",
    track: "hero",
    tier: "A-List",
    power: "Weather Manipulation · Electrokinetic",
    expression: "Storm-pattern weather generation — rain, wind, thunder, and lightning at varying scales — plus electric-based phenomena generated within and around his own body. Effective range scales with effort and recovery time.",
    drawbacks: "Internal electrical use causes muscle deterioration and chronic insomnia even with natural resistances. Frequent infirmary visits for physical recovery; horrendous sleep cycle constrains heavy operation windows.",
    link: "https://roleplay.chat/profile.php?user=stormcaller"
  },
  {
    char: "Isaac Whitman",
    alias: "Swapper",
    house: "grimere",
    year: "Junior",
    track: "hero",
    tier: "B-List",
    power: "Relay Shift — Selective Teleportation",
    expression: "On touch, Issac registers a person or object onto his Shift List. From there he can teleport to any registered target, swap positions with a registered object, or perform combinations of the two. No apparent distance limit.",
    drawbacks: "Shift List capped at twenty-five active registrations. One teleport or swap may be executed at a time — no chained jumps. Registration requires direct skin/object contact.",
    link: "https://roleplay.chat/profile.php?user=Swapper"
  },
  {
    char: "Emery Hollister",
    alias: "Sweet Spot",
    house: "orenne",
    year: "Sophomore",
    track: "sidekick",
    tier: "B-List",
    power: "Bio-Confection Manipulation — Living Floss Generation",
    expression: "Converts her body into a cotton-candy-like bio-organic substance and produces consumable floss infused with tailored biochemical effects. Power leans toward support, enhancement and influence rather than direct combat — soft and inviting in presentation, but capable of significant impact depending on application.",
    drawbacks: "Requires high caloric intake; energy depletion drops output quality. Mood and emotional state alter results — instability skews intended effects. Heat destabilises structure, moisture disrupts cohesion, wind affects dispersion. Not suited for direct combat. Overuse risks others becoming dependent on her output.",
    link: "https://roleplay.chat/profile.php?user=Sweet+Spot"
  },
  {
    char: "Angelique Pierce",
    alias: "ANGEL",
    house: "orenne",
    year: "Sophomore",
    track: "hero",
    tier: "C-List",
    power: "Wing Manifestation · Energy Projection · Rapid-Pulse Conduits",
    expression: "Possesses 15-foot iridescent wings that shift through purples, teals and golds, biologically anchored to her spine. Vents stored thermal energy as strobing white-hot pulses fired from her palms; uses the recoil tactically as a thruster system to execute jagged mid-air pivots.",
    drawbacks: "Despite her power, Angel is still just a girl — no healing factor or superhuman durability. Wings are biological extensions of her spine: damage causes immense pain, can induce shock and prevents flight, with healing slow and natural. Energy use spikes internal temperature; rapid-fire causes heat exhaustion, migraines and tremors, and a full thermal drain leaves her lethargic and weak.",
    link: "https://roleplay.chat/profile.php?user=iridescence"
  },

  {
    char: "Cassian Marrow",
    alias: "the Abyss",
    house: "grimere",
    year: "Senior",
    track: "hero",
    tier: "B-List",
    power: "Amphibious Physiology · Pressure Manipulation · Hydrosensory Awareness",
    expression: "Deep-sea biology gives Cassian modified lungs and gills, peak performance in water, plus enhanced strength and accelerated regeneration. He compresses and pressurises water for offence, senses bioelectric fields, and communicates with marine life.",
    drawbacks: "Heavily dependent on moisture — heat and dry air sap stamina, sensory range, and regeneration. Electrical attacks are far more dangerous to him than most supers, especially while submerged. Long stretches at depth amplify predatory, instinct-driven behaviour.",
    link: "https://roleplay.chat/profile.php?user=the+Abyss"
  },
  {
    char: "Malachi Castellano",
    alias: "WILDKIN",
    house: "orenne",
    year: "Freshman",
    track: "sidekick",
    tier: "C-List",
    power: "Primal Empathy · Animal Communication",
    expression: "Reads and projects emotional states across non-human animals, can calm or rouse a herd, and holds two-way 'conversations' through imagery and feeling. Larger or more intelligent species respond more cleanly than insects or simple reptiles.",
    drawbacks: "No combat application; he panics under direct violence. Sustained empathic contact bleeds animal instinct into his own mood, leaving him jumpy, territorial, or exhausted. Crowded human environments are sensory overload.",
    link: "https://roleplay.chat/profile.php?user=advocate"
  },
  {
    char: "Philip Chang",
    alias: "Blackout",
    house: "orenne",
    year: "Senior",
    track: "hero",
    tier: "B-List",
    power: "Reactive Adaptive Morphogenesis · Enhanced Strength · Durability · Agility · Accelerated Recovery",
    expression: "Under stress, fear, or protectiveness, Philip's body rapidly evolves to meet a perceived threat — strength, durability, agility, and reflex all spike alongside reactive black biomechanical plating. The stronger the emotional trigger, the more powerful and unstable the transformation.",
    drawbacks: "Emotional escalation drives the power, so high-stakes situations are also when control fails. Aggression intensity scales with intensity — over-triggering risks collateral damage and identity dissociation. Calm, controlled engagement leaves him no stronger than baseline.",
    link: "https://roleplay.chat/profile.php?user=Blackout!"
  },
  {
    char: "Daphne Callas",
    alias: "Verdant",
    house: "saberis",
    year: "Freshman",
    track: "hero",
    tier: "B-List",
    power: "Botanical Bio-Manipulation · Plant Growth · Solar Regeneration · Toxic Immunity",
    expression: "Accelerates and shapes plant life — coaxing growth, weaving constructs, and triggering targeted mutations. She photosynthesises in sunlight for fast healing and stamina, and is immune to most plant-based toxins.",
    drawbacks: "Sterile or barren environments leave her without ammunition. Extreme cold slows responsiveness; fire annihilates her constructs. Sustained sunlight deprivation cripples regeneration, stamina, and hydration; heavy ability use burns through nutrient reserves.",
    link: "https://roleplay.chat/profile.php?user=Verdant!"
  },
  {
    char: "Marceline Ward",
    alias: "Ghoulfriend",
    house: "saberis",
    year: "Junior",
    track: "hero",
    tier: "C-List",
    power: "Adaptive Bioreconstruction · Enhanced Physical Attributes · Pain Conversion",
    expression: "Marceline's body actively rebuilds itself through accelerated biological adaptation — torn tissue reroutes, organs reconnect, and her physiology can absorb and integrate features from injury or contact. She converts pain into temporary physical performance.",
    drawbacks: "Reconstruction is visible, painful, and metabolically expensive. Excessive damage triggers psychological fragmentation and donor-memory bleed. Adaptive immunity has limits, and she remains vulnerable mid-reconstruction; emotional spikes can hijack the process.",
    link: "https://roleplay.chat/profile.php?user=ghoulfriend"
  },
  {
    char: "Tyler Caldwell",
    alias: "BLACK VEIN",
    house: "valaris",
    year: "Senior",
    track: "hero",
    tier: "A-List",
    power: "Adaptive Mutation · Organic Weaponization",
    expression: "Tyler shapes his own biology in real time — growing claws, blades, plating, or spurs of dense organic tissue, and reconfiguring limbs to meet whatever fight he's in. Mutations adapt mid-engagement based on the threat he's facing.",
    drawbacks: "Heavy mutation is calorically punishing and leaves him visibly disfigured for hours afterward. Shifts cost time he doesn't always have, and complex shapes degrade under sustained punishment. Cold and toxin exposure slow the mutation engine to a crawl.",
    link: "https://roleplay.chat/profile.php?user=BLACK+VEIN"
  },
  {
    char: "Lucrecia Sofìa Avalos-Perez",
    alias: "Rosetta",
    house: "valaris",
    year: "Freshman",
    track: "sidekick",
    tier: "C-List",
    power: "Omnilingualism",
    expression: "Instinctively understands, interprets, speaks, reads, and writes virtually any language she encounters — spoken, dialectal, coded, symbolic, or invented. Rather than memorising, her mind processes communication as natural intent, capturing emotional context and rhetoric at remarkable speed.",
    drawbacks: "No combat application. Cognitive load and hyperawareness leave her prone to overstimulation in crowded or multilingual environments. Constant contextual translation creates emotional vulnerability and a morally complicated perspective on whose meaning to prioritise.",
    link: "https://roleplay.chat/profile.php?user=Rosetta!"
  },
  {
    char: "Manuel \"Manny\" Glint",
    alias: "BurnOut",
    house: "orenne",
    year: "Senior",
    track: "hero",
    tier: "B-List",
    power: "Superspeed · Hypermetabolism",
    expression: "Converts anything edible into pure caloric output, then burns those calories to move and think at lightning speed. Reaction time, sprint speed, and combat tempo all scale with how much he's eaten in the last hour.",
    drawbacks: "Constantly needs to eat. Long fights drain him; once calories run out, his body begins to autophage — cannibalising muscle and organ tissue to keep going. Vulnerable to anything that disrupts digestion or appetite.",
    link: "https://roleplay.chat/profile.php?user=Crashnburn"
  },
  {
    char: "Winifred Finch",
    alias: "Swarm",
    house: "grimere",
    year: "Freshman",
    track: "sidekick",
    tier: "C-List",
    power: "Entomantic Hive-Link, Swarm Command, Distributed Awareness, Environmental Attraction, Quiet Movement, Emotional Escalation Response",
    expression: "Entomantic Hive-Link\nWinnie possesses a rare biological-psychic connection to insects and similar small crawling creatures, allowing her to communicate with, influence, and command them through instinctive emotional and mental impulses. The connection extends across nearly all species — from moths and beetles to spiders, crickets, centipedes, bees, wasps, flies, slugs, and more. While commands begin simple, her control becomes increasingly precise under focus or emotional stress. Unlike traditional telepathy, the connection feels deeply sensory and collective. Winnie does not merely “control” insects; she experiences them as part of a living network surrounding her at all times.\n\nhttps://docs.google.com/document/d/1XV-7nfcYdo7qYiNc-hQiJVygViY__m4Nib4KeDVZSAs/edit?usp=sharing",
    drawbacks: "Sensory Overload, Sensory Overload, Physically Vulnerable, Cold Temperatures, Fire & Chemical Exposure, Hoarding & Attachment Tendencies",
    link: "https://roleplay.chat/profile.php?user=Swarm!"
  },
  {
    char: "Riley Carter",
    alias: "VICE",
    house: "valaris",
    year: "Junior",
    track: "hero",
    tier: "A-List",
    power: "Pressure Manipulation · Biological Pressure Control",
    expression: "Vice’s power manifests through localized pressure distortion within biological systems. When activated, subtle visual effects appear around the target: faint air warping, trembling fabric, pulsing veins, brief condensation, and low-frequency vibrations in the surrounding space. Riley manipulates pressure by applying focused compression or imbalance to specific physiological systems, including muscles, lungs, joints, blood flow, and equilibrium centers. This allows her to induce heaviness, pain, dizziness, breath restriction, muscular disruption, or temporary loss of coordination without causing visible external force. Precision and proximity are critical. The closer Riley is to a target, the more accurate and effective her control becomes.",
    drawbacks: "Vice’s power requires intense concentration and precise anatomical awareness. Emotional instability, panic, exhaustion, or sensory overload can make her control dangerously inconsistent. Her effectiveness rapidly decreases with distance, making close-range engagement essential for accurate pressure application. Affecting multiple targets at once significantly increases mental strain and reduces precision. Excessive use places severe stress on Riley’s own body, often causing migraines, nosebleeds, tremors, muscle fatigue, elevated heart rate, and temporary loss of fine motor control. Improper pressure placement can result in unintended serious injury, forcing her to constantly restrain herself during combat. Her abilities are also less effective against non-biological targets, heavily armored opponents, or individuals with abnormal internal physiology. Sedatives, disorientation, or direct disruption of her focus can weaken or interrupt activation entirely.",
    link: "https://roleplay.chat/profile.php?user=pressure"
  },
  {
    char: "Mavis Kingsman",
    alias: "Savior",
    house: "grimere",
    year: "Freshman",
    track: "hero",
    tier: "A-List",
    power: "Psionic Dominion, Telekinesis, Telepathy, Empathic Link, Flight, Psionic Barriers",
    expression: "PSIONIC DOMINION\nMavis’ abilities operate through an interconnected psionic field tied directly to her mind, emotions, and nervous system. Unlike supers who separate powers into isolated categories, Mavis experiences telepathy, telekinesis, empathy, and flight as extensions of the same core phenomenon. Her thoughts influence matter, her emotions affect force output, and her awareness constantly brushes against the mental and emotional presence of others. STRATA classifies her as an exceptionally dangerous psionic because her power scales through cognition and emotional processing rather than purely physical limitation.\n\n(Ran out of room again: https://docs.google.com/document/d/1QyYVgRM0G7F2TXenGoq6yZvBadI_eVvJOL4WzAsrVlM/edit?usp=sharing)",
    drawbacks: "Emotional Overload, Thought Intrusion, Precision vs Power, Mental Fatigue, Responsibility Complex, Social Detachment",
    link: "https://roleplay.chat/profile.php?user=Savior"
  },
  {
    char: "Baldor Kingsman",
    alias: "King",
    house: "valaris",
    year: "Freshman",
    track: "hero",
    tier: "B-List",
    power: "Momentum Physiology (\"Underdog Syndrome\")",
    expression: "Baldor’s body continuously escalates in:\nphysical strength\ndurability\npain tolerance\nstamina\nrecovery efficiency\nforce output\n\n…based on active exertion duration.\n\nThe longer he remains physically engaged:\n\nfighting\nlifting\nrunning\nresisting damage\npushing through exhaustion\n\n…the stronger and tougher he becomes. He essentially turns sustained struggle into fuel.",
    drawbacks: "1. Slow Start — He is strongest in prolonged engagements. Ambushes and quick overwhelming attacks are dangerous because he hasn’t ramped yet.\n\n2. Massive Caloric Burn — He burns absurd calories. He is CONSTANTLY hungry. This boy destroys barbecue, biscuits, burgers, sweet tea, protein shakes, and home cooking. STRATA nutritionists probably hate him.\n\n3. Internal Damage — His pain tolerance masks serious injury. He may continue fighting on torn ligaments, cracked bones, internal bleeding… and collapse afterward.\n\n4. Heat Buildup — Long activation causes dangerous overheating. Too long in escalation can lead to heat stroke, organ stress, tunnel vision, aggression spikes, and blackouts. Ice baths and recovery protocols become mandatory.\n\n5. Emotional Trigger Risk — His escalation responds strongly to emotional stress: humiliation, anger, fear for others, desperation. This means emotional manipulation can unintentionally push him into unstable overdrive.",
    link: "https://roleplay.chat/profile.php?user=Kingsman"
  },
  {
    char: "McKenna Doyle",
    alias: "Menagerie",
    house: "orenne",
    year: "Junior",
    track: "hero",
    tier: "B-List",
    power: "Biological Echo Mimicry, Partial Manifestation, Enhanced Physicality, Animal Communication & Instinct Recognition",
    expression: "Biological Echo Mimicry\nMcKenna’s primary ability allows her to physically transform into animal species she has previously “imprinted” through direct skin-to-living-creature contact. Once contact is established, she retains the species within her biological memory and can access it again later without repeated exposure. Transformations are not illusionary; they are complete biological shifts that alter musculature, organs, senses, instincts, movement patterns, and neurological processing. She can perform either full-body transformations or partial adaptations, allowing her to selectively borrow traits from different species without committing entirely to a single form.\n\n(Ran out of room: https://docs.google.com/document/d/1AiO8XXAzmuKbnJBkoyUyY5gnoxQKHrE2TrgGRuyyBgA/edit?usp=sharing)",
    drawbacks: "Instinct Drift, Identity Degradation, Physical Energy Consumption, Emotional & Instinctive Triggers, Overadaptation, Non-Specialist Ceiling",
    link: "https://roleplay.chat/profile.php?user=Menagerie!",
    note: "Banned from Powerball. During a sophomore-year intramural scrimmage McKenna entered partial-manifestation while playing Defence and inflicted bite injuries on three opposing players that required hospital triage. Athletics director and Powerball coaching staff ruled her out of all Powerball play — league, scrimmage, and practice — for the remainder of her time at Calderyn. Other powered contact sports unaffected.",
  },
  { char: "Sven Skarsen", alias: "BLOOD EAGLE", house: "saberis", year: "Sophomore", track: "hero", tier: "A-List", power: "Blood Iron · Hemo-metallurgy (close-range brawler)", expression: "Sven hardens his own blood-derived energy into stylised black-red metal constructs that form along his hands, forearms, shoulders, and back. Visually it reads as wet crimson-black iron, rusted steel, and glossy obsidian — never as open wounds or splatter. He can shape claws, hooked chains, jagged armour plates, axe-like weapons, sharp metallic shards, and jagged wing-blades from his shoulders (the Blood Eagle silhouette). Mechanically the constructs are physically real once formed: hard, heavy, dense, and capable of cutting, blocking, and dragging. In his overdrive 'War Vein' state his veins darken and armour spreads across arms, ribs, and jawline, increasing output and durability at the cost of fine control.", drawbacks: "Limited supply — output draws on his own reserves and burns him out fast under heavy use. Pain is real — armour blunts hits but every strike still hurts, and he keeps fighting through it. Reckless nature — his power scales with aggression, so it punishes patience and rewards bad decisions. Focus required — anger and adrenaline tank his shaping control, making constructs sloppy or unstable. Weight drag — large constructs (axe, full wings) slow him down and ruin agility. Medical risk — pushing too far in one fight leaves him weak, dizzy, and slow to recover afterwards.", link: "https://roleplay.chat/profile.php?user=blood+eagle" },
  { char: "Tatiana Morozova", alias: "Nocturne", house: "grimere", year: "Freshman", track: "hero", tier: "A-List", power: "Choreographic Synchronization · Kinetic Choreography · Forced Misstep · Emotional Entrainment · Corps Echoes · Enhanced Physical Condition", expression: "Tatiana's core mutation revolves around movement synchronization and rhythmic influence. Through dance and controlled pacing, her nervous system imposes rhythm onto the environment and people around her.", drawbacks: "Precision Dependency, Emotional Feedback Loop, Physical Exhaustion, Range Limit, Choreographic Memory Overload", link: "https://roleplay.chat/profile.php?user=Nocturne." },
  { char: "Oliver Daniel Fletcher", alias: "Hopper", house: "valaris", year: "Freshman", track: "sidekick", tier: "B-List", power: "Amphibian Physiology · Adhesion & Surface Climbing · Elastic Leg Compression & Leaping · Aquatic Adaptation · Enhanced Low-Light Vision · Prehensile Tongue Adaptation · Hyper Reflexes · Flexibility", expression: "Oliver's body has undergone a gradual mutation mirroring amphibian traits. Unlike overtly monstrous mutations, he still appears largely human outwardly with most changes presenting internally through movement patterns and reflex behaviors.", drawbacks: "Constant Self-Restraint, Power Growth Instability, Overstimulation & Sensory Fatigue, Cold Temperatures, Dryness & Dehydration, Emotional Transparency", link: "https://roleplay.chat/profile.php?user=Hopper" },
  { char: "Mason Graves", alias: "Paladin", house: "grimere", year: "Sophomore", track: "hero", tier: "B-List", power: "Hyper Intelligence", expression: "Mason possesses a superhumanly accelerated cognitive architecture. His brain processes information at speeds impossible for ordinary humans, allowing him to analyze, simulate, invent, and adapt in real time.", drawbacks: "Physical Frailty, Information Overload, Emotional Blind Spots, Dependency on Templar armor", link: "https://roleplay.chat/profile.php?user=TechPaladin" },
  { char: "Sorina Mirela Vaduva", alias: "Black Mass", house: "valaris", year: "Sophomore", track: "hero", tier: "B-List", power: "Hellfire Generation · Revenant Transformation · Fire Resistance & Thermal Immunity · Infernal Healing · Chain Manifestation & Metal Conduction · Trauma Reflection · Enhanced Physicality · Emotional Perception", expression: "Sorina can produce and manipulate superheated black-orange plasma flames from her body, breath, or physical contact. The flames spread aggressively across fuel sources but can also cling unnaturally to metal, chains, and surfaces.", drawbacks: "Emotional Instability Amplification, Overheating & Internal Damage, Oxygen & Containment Vulnerability, Trauma Feedback", link: "https://roleplay.chat/profile.php?user=Black+Mass" },
  { char: "Asher Wilde", alias: "MONGREL", house: "saberis", year: "Freshman", track: "hero", tier: "B-List", power: "Shapeshifting · Beast Physiology", expression: "Mongrel's body enters a progressive transformation state rather than an instant shift. Muscles swell and condense beneath the skin, frame grows larger, shoulders broaden, veins become pronounced, and posture lowers into a more predatory stance.", drawbacks: "Transformation instability, emotional triggering, recovery exhaustion, sensory overstimulation in beast form", link: "https://roleplay.chat/profile.php?user=mongrel" },
  { char: "Princeton Ambrose", alias: "EROS", house: "valaris", year: "Senior", track: "hero", tier: "A-List", power: "Neurochemical Manipulation · Emotional Influence", expression: "Eros emits engineered synthetic pheromones through respiration, body heat, and skin contact, creating an invisible neurochemical field that subtly influences the emotions of nearby individuals.", drawbacks: "Overheating & Dehydration, Emotional Instability, Power Growth Instability, Open-Air Vulnerability, Respiratory Inhibitors", link: "https://roleplay.chat/profile.php?user=desirable" },
  { char: "Dexter Crowley", alias: "Ruckus", house: "saberis", year: "Freshman", track: "sidekick", tier: "C-List", power: "Gremlinoid Morph", expression: "Gremlinoid Morph\nPower Expression\nChaotic Gremlin Entity (Symbiotic/Transformative State) AKA Gremlin Mode: Not a separate being. Not a costume. He is Dexter’s unleashed survival code. Though talks to it like it is a second personality. Refers to it as Angry Feral Inner Child\nEnhanced Strength\nEnhanced  Speed & Agility\nEnhanced Senses\nRazor Sharp Claws/Teeth\nPain Resistance/Damage Tolerance\nRapid Recovery\nFeral Instinct / Combat Sense\nChaos Adaptation\nFearless Aggression\nCompact Frame Advantage\nDexter Link (Anchor System)", drawbacks: "Enhanced Strength: He's a mini tank.  Fights like the hulk.  But over used of heavy lifting and hard fighting can wear him down.\nEnhanced  Speed & Agility: Same as above. He's not sonic speed but faster than a human.  Long term fights/running can wear him down.\nEnhanced Senses: Strong odors/high pitched sounds\nRazor Sharp Claws/Teeth: He's a gremlin. He's gonna break a lot of things by \"accident\"\nPain Resistance/Damage Tolerance: Adrenaline makes it not hurt. Hurt more than he knows.\nRapid Recovery: Not a full healing factor\nFeral Instinct / Combat Sense -  Chaos Adaptation - Fearless Aggression: \"Acts First - Thinks never\". Pure instinct\nCompact Frame Advantage: If it can keep him from breaking out, easier to trap him.(\nDexter Link (Anchor System) \"Personalities\" may fight for control causing delay.\nHe struggles with spoken communication, mostly using growls, gestures, broken words, or gremlin-speak.\nHe can be distracted by food, shiny junk, loud machines, or anything of interest", link: "https://roleplay.chat/profile.php?user=Gremlin" }, // sub:e31100af
  { char: "Xeno", alias: "Xenofire", house: "grimere", year: "Senior", track: "hero", tier: "A-List", power: "Pyrokinetic Plasma Form", expression: "Pyrokinetic Plasma Manipulation: Xeno doesn’t just control fire. He generates and becomes plasma flame, which is a higher-energy state than normal flame. That’s why his fire looks alive, smooth, and intense instead of cracked or lava-like.\n\nLiving Flame/Plasma Physiology:  When shifted, his body becomes energy instead of flesh.\nNo internal organs while transformed/Physical attacks pass through or disperse him\n\nControlled Transformation States: Human/Clean Controlled Plasma/Pure Fire\n\nFlight / Propulsion\n\nThermal Control\n\nFire/Heat Immunity\n\nEnergy Projection: Fire blasts/waves/beams/Focused cutting arcs\n\nRegeneration (When in Plasma form)\n\nOxygen Interaction Awareness\n\nAdaptive Output: Emotional intensity, Environmental heat, Available oxygen\n\nAscended / Perfect Balance: (Has not reached this level)\nAbsolute control over plasma output/No wasted energy/Precision + maximum efficiency\nThis is peak Xenofire. Controlled star-level energy without chaos.\n", drawbacks: "Oxygen Dependency: No oxygen, no fire.\n\nEnergy Burnout: He runs on internal energy reserves. So he can run out of energy to burn.\n\nEmotional Instability Amplifier: Anger = stronger but less controlled, Calm = weaker output but precise, Extreme emotion can trigger Meltdown\n\nCollateral Damage Risk: Heat spreads/Environments ignite/Civilian risk is high without restraint\n\nHuman Form Vulnerability: Unless in Plasma/Fire form he's just human.\n\nOxygen Crash Weakness (Origin Trauma): Psychological + physical flaw. Sudden oxygen loss can destabilize his form\nCan cause flickering, forced reversion, or fall-out.\n\nOverheating Instability\n\nToo much output too fast: Plasma becomes erratic/Control drops/Risk of entering Meltdown\n\nMemory Fragmentation (Lore-Based)\n\nDue to his origin: Past is incomplete/Emotional triggers can spike powers unpredictably - Needs Therapy\n\nSuit Dependence:  Helps regulate output/Prevents accidental environmental ignition", link: "https://roleplay.chat/profile.php?user=Xenofire" }, // sub:953a48bf
  { char: "Evelyn Chen", alias: "Echo", house: "grimere", year: "Freshman", track: "sidekick", tier: "D-List", power: "Remote Sensory Synchronization, Emotional Echo Feedback, Surface Thought Impression, Enhanced Perception, Cognitive Pattern Recognition", expression: "Remote Sensory Synchronization\nEcho possesses the ability to establish a sensory link with another person through visual familiarity, most effectively through direct sight, clear photographs, or prolonged visual exposure. Once connected, Evelyn can temporarily perceive the world through the target’s senses, allowing her to see through their eyes and hear surrounding audio as though physically present. Stronger connections may also grant fragmented emotional impressions, instinctive reactions, or fleeting surface-level thoughts. The clarity and stability of the synchronization are heavily influenced by image quality, emotional intensity, physical distance, and Evelyn’s own mental condition. Close proximity and emotionally charged situations dramatically strengthen the connection, while poor visuals or overstimulation can destabilize it.\n\n(OUT OF ROOM: https://docs.google.com/document/d/1CfWPbAvBPUtEo7pCOE8fhkJOjlA12kedXKAvhmv3aow/edit?usp=sharing)", drawbacks: "Overlinking & Neurological Strain, Phantom Trauma Feedback, Emotional & Sensory Overload, Limited Range & Visual Dependence, Social Anxiety & Self-Consciousness, Insomnia & Hyperfixation, Low Combat Capability", link: "https://roleplay.chat/profile.php?user=.Echo" }, // sub:6b3eb389
  { char: "Sylas Luftborne", alias: "ZERO G", house: "valaris", year: "Senior", track: "hero", tier: "A-List", power: "GRAVITY MANIPULATION", expression: "Personal Gravitational Core Manipulation: (Core): \nGenerates an internal gravitational core and projects a controlled field outward\nRedefines gravity direction relative to himself (wall-walking, inverted movement, midair anchoring)\n\nGravity Amplification: Turn a punch into a crushing impact, make a balloon heavy as a bus\n\nGravity Nullification: Create zero-G combat zones\n\nKinetic Acceleration: Burst speed (almost teleport-like), High-impact strikes, Controlled falls turned into attacks\n\nMicro-Singularity Gravity Pull: Pulls everything inward briefly\n\nPASSIVE TRAITS: Enhanced spatial awareness (he “feels” mass and pull)/Perfect balance under shifting forces/High resistance to pressure and G-forces\n\n", drawbacks: "Body is the engine: disruption to focus, stamina, breathing, or equilibrium destabilizes the field\nResults in misaligned vectors, loss of balance, or pressure backlash \n\nMicro-Singularity Gravity Pull: takes a lot of energy\n\nCognitive Load:  Requires constant calculation/Multiple gravity fields = mental strain / Overuse leads to:  Slower reactions,  Loss of precision\n\nOverload Risk: Too much mass + too much force = backlash = Cause uncontrolled collapse/Slam himself instead / Misalign vector= sends himself flying instead\n\nEnergy Drain: Larger manipulations = higher cost/Sustained combat drains him fast", link: "https://roleplay.chat/profile.php?user=Airborne" }, // sub:fcdbf13d
  { char: "Alphonse Driessen", alias: "Haze", house: "saberis", year: "Sophomore", track: "hero", tier: "C-List", power: "Smoke Physiology, Toxic Smoke Manipulation, Internal Infiltration, Enhanced Physical Attributes", expression: "Smoke Physiology\nAlphonse possesses the ability to partially or completely convert his body into a smoke-like state at will. In this form, physical attacks can pass harmlessly through him, allowing him to evade strikes, bullets, restraints, and environmental hazards that would incapacitate most people. He can disperse into narrow spaces, move through vents or cracks, and travel along existing airflow with unnatural fluidity. While fully converted, he loses the ability to physically interact with objects or carry weight, making the form ideal for infiltration, escape, stealth, and reconnaissance rather than direct force. Smoke-heavy environments such as fires, fog, steam, or polluted city air enhance his concealment and reduce the strain required to remain dispersed.\n\n(OUT OF ROOM: https://docs.google.com/document/d/1rPgS-TEVsM78G5m9tio0iSwBKEK2otO1XSym4KyVN-M/edit?usp=sharing)", drawbacks: "Respiratory Strain, Vulnerability to Wind & Airflow, Limited Physical Interaction While Dispersed, Reform Vulnerability, Thrill-Seeking Behavior, Emotional Avoidance, Public Marketability Issues, Dependence on Atmosphere & Environment", link: "https://roleplay.chat/profile.php?user=.Haze" }, // sub:a4f05170
  { char: "Khan Grimassi", alias: "The Connoisseur ", house: "grimere", year: "Junior", track: "sidekick", tier: "B-List", power: "Gastrokinetic Adaptation: gains powers from what he consumes.", expression: "Universal Digestion: can digest almost anything, including metal, bullets, glass, stone, bone, chemicals, and toxins.\nTrait Absorption: takes on properties of what he eats.\nEx: \nPhysical Augmentation: Protein, carbs, fats, sugars, etc. boost strength, stamina, durability, or speed.\nElemental Adaptation: spicy food, ice, liquids, minerals, and chemicals can create heat, cold, fluidity, hardness, or other effects.\nAdaptive Immunity: can build resistance to poisons, toxins, and harmful substances.\nSensory Palate: can detect ingredients, toxins, chemicals, and properties through taste/smell.\nMetabolic Overdrive: rapid consumption stacks temporary boosts.\nTemporary Power Stacking: can combine multiple consumed effects at once\nCulinary Instinct: knows what to eat for the result he needs.\n\nDoes not know yet:\nObject Conversion: bullets let him fire bullets, metal hardens his body, rubber makes him elastic, glass creates sharp cutting effects.\nToxin Immunity: His body will convert to powers.", drawbacks: "Consumption Dependent: only as strong as what he has recently consumed.\nTime Limit: all adaptations fade after digestion burns through them.\nContamination Risk: poisoned, spoiled, or corrupted intake can disrupt or harm him in extreme ways \nOverload: too many effects at once can cause burnout, vomiting, collapse, or internal strain.\nBad Matchups: some consumed traits may backfire in the wrong environment.\nNutritional Crash: heavy power use drains calories fast.\nLimited Storage: gear only carries so many emergency foods, spices, and objects.\nPower Instability: mixed ingredients or objects can create unpredictable results.\nHuman Body Limits: durable, but not invincible. He can still be cut, shot, poisoned (through skin not ingesting), burned, or knocked out.", link: "https://roleplay.chat/profile.php?user=Savory" }, // sub:51c61fcc
  { char: "Moni Li", alias: "", house: "grimere", year: "Freshman", track: "sidekick", tier: "C-List", power: "Geokinesis-Telekinetic control over the Silica located in 99 percent of Dirt and Stone.", expression: "Mental control, movement, restructuring, and compression of \"Earth.\" It is in reality a telekinetic control over the Silica, All Rock and Stone, Dirt and sand to a particulate level. Comes with ability to \"sense\" vibrations through the ground. ", drawbacks: "Physical weight of moved mass provides greater mental strain. Inability to heat, cool, or affect controlled materials any farther than physical manipulation. ", link: "https://roleplay.chat/profile.php?user=Moni+Beifong" }, // sub:d7341d4f
  { char: "Griffin Knight", alias: "RAZOR", house: "saberis", year: "Sophomore", track: "sidekick", tier: "B-List", power: "Construct Manipulation · Kinetic Blade Manifestation", expression: "Razor's ability manifests as dense electric-blue kinetic constructs that form around his hands, fingertips, and nearby space before compressing into knife-shaped weapons. Moments before materialization, faint fracture patterns spread through the air like cracks in glass. Manifested blades range from thin needles to heavier combat knives, all leaving subtle blue energy trails. During movement abilities, fragmented afterimages and streaks follow him, making his repositioning seem abrupt and difficult to track. Internally, his power functions through an instinctive spatial mapping system connected to every active blade. Razor constantly senses each knife's position, direction, and momentum. Rather than controlling them like puppets, he influences their movement through rapid subconscious calculations. The more knives placed throughout an environment, the more information and combat options he gains. His strength relies heavily on preparation and setup rather than raw power.", drawbacks: "Razor's ability depends heavily on active blade placement and environmental setup. With few or no knives embedded around him, his combat options become limited and far less effective. Excessive knife generation or rapid use of multiple abilities places strain on his nervous system, causing headaches, slowed reaction time, hand tremors, and mental overload from tracking too many active blades at once. Maintaining awareness of numerous knife positions becomes increasingly difficult under stress. His mobility is also restricted by placement. Knife Step cannot function without an embedded blade as an anchor point. Destroyed, displaced, or obstructed knives reduce his control and the routes available to him. Wide-area attacks, unpredictable movement, sensory disruption, or close-range pressure can interfere with his setup and force him into direct combat, where his advantage drops significantly.", link: "https://roleplay.chat/profile.php?user=knife" }, // sub:cea89741
  { char: "Natalie Neuman", alias: "AXIOM", house: "grimere", year: "Sophomore", track: "sidekick", tier: "B-List", power: "Cognitive Augmentation · Hypercognition", expression: "At first glance, her abilities appear almost invisible compared to more explosive hero types. There are no glowing energy blasts or obvious physical mutations. Her power manifests through overwhelming cognitive processing expressed subtly through behavior, perception, and environmental interaction. Internally? Her brain processes, stores, cross-references, and simulates information at massively accelerated speeds far beyond baseline human capability.", drawbacks: "Physically Weak\nMinimal combat training and below-average physical endurance. In direct confrontation against most combat-oriented heroes, she is heavily disadvantaged.\n\nMental Fatigue\nContinuous high-speed cognition rapidly drains her mentally. Extended processing sessions can lead to migraines, tremors, nausea, insomnia, and temporary cognitive shutdowns.\n\nEmotionally Detached\nShe often struggles relating to people emotionally. Conversations can feel inefficient or exhausting to her, causing her to appear cold, dismissive, or arrogant even when she is not intentionally trying to be.\n", link: "https://roleplay.chat/profile.php?user=AXIOM" }, // sub:2d32b02d
  { char: "Charmaine Leocadia Quinteros", alias: "Haven", house: "orenne", year: "Freshman", track: "sidekick", tier: "B-List", power: "Atmospheric Force Manipulation, Bubble Creation & Control, Pressure Regulation, Oxygen Manipulation, Mobility & Buoyancy Support", expression: "Atmospheric Force Manipulation\nHaven possesses the ability to generate and manipulate stabilized atmospheric-pressure constructs that manifest as translucent, iridescent \"bubbles.\" These constructs can vary in size, density, elasticity, and durability depending on her concentration, emotional state, and stamina reserves. While visually soft and fluid, the bubbles are capable of withstanding significant force and are primarily used for protection, rescue operations, mobility support, and environmental stabilization.\n\n(Ran out of room: https://docs.google.com/document/d/1_Byy9Lc67ssXBEBW3O5E5YGO1wVyj1sErfcUOdRa980/edit?usp=sharing)", drawbacks: "Severe Stamina Drain, Multitasking Limitations, Emotional Influence, Protective Instincts, Limited Offensive Capability, Precision vs. Scale, Burnout Risk, Difficulty Saying No", link: "https://roleplay.chat/profile.php?user=Haven" },
  { char: "Michael Greystone", alias: "Lazarus", house: "saberis", year: "Junior", track: "sidekick", tier: "D-List", power: "Respawn Resurrection", expression: "Michael’s power only activates after complete death. Once he dies, his body fully restores itself and resurrects him in peak physical condition.\n\nEvery injury disappears.\nEvery wound is erased.\nPoison, blood loss, organ failure, exhaustion — all gone.\n\nIt’s less like healing and more like a full system reset. A biological checkpoint reload.\n\nOver time, repeated deaths have made him harder to kill in the same way twice. Not because he gains new powers, but because experience leaves scars on the mind.\n\nAfter being shot enough times, he reacts faster to guns.\nAfter enough ambushes, his instincts sharpen.\nNot supernatural precognition — just brutal survival conditioning.", drawbacks: "While alive, Michael is completely human.\n\nIf he’s stabbed, he bleeds.\nIf bones break, they stay broken.\nIf he’s dying, he still feels every second of it.\n\nUnless he receives medical treatment… or dies entirely, the damage remains.\n\nWorse still, resurrection does nothing for the psychological damage.\n\nMichael remembers every death in perfect detail.\nThe pain.\nThe panic.\nThe exact moment everything goes black.\n\nThe result is severe psychological trauma: PTSD, night terrors, hesitation triggers, anxiety, and emotional exhaustion that worsen with every resurrection.\n\nThe result is severe psychological trauma: PTSD, night terrors, hesitation triggers, anxiety, and emotional exhaustion that worsen with every resurrection or separation.  \n\nIf decapitated and head kept in a box. His body will not grow head.  His head will not grow a body.  They must come back together for full healing or he stays dead.  If his body doesn't pull itself together first in 1 month, he'll permanently  die..", link: "https://roleplay.chat/profile.php?user=Dead+Man+Walkin" }, // sub:14fea86e
  { char: "Robert Manucharian", alias: "Fool's Gold ", house: "orenne", year: "Sophomore", track: "sidekick", tier: "A-List", power: "Malleable Hydrogel Physiology", expression: "Full-body morphing: reshape limbs, size, and structure at will\nWeapon formation: blades, maces, spikes, shields, tendrils\nElasticity: stretch, compress, and extend for reach and mobility\nDensity control: shift from soft fluid to hardened, armor-like states\nImpact absorption: disperse blunt force through gel structure\nRegenerative reform: reconstruct damaged or displaced mass\n Adaptive defense: harden on contact or react to incoming attacks\nMimicry: replicate faces, voices, and surface-level appearance\nPseudo-gear creation: form armor, clothing, and masks from body\nEnvironmental adaptation: flow through gaps, cling, or anchor to surfaces\n", drawbacks: "His large transformations require focus, and the bigger or more detailed the shape, the harder it is to hold.\n\nHis mimicry is surface-level. He can copy faces, voices, clothing, and body shape, but not true internal biology.\n\nExtreme heat can dry, warp, or destabilize his hydrogel structure.\n\nExtreme cold can stiffen him, slow his movement, or make his body brittle.\n\nStrong electricity can disrupt his cohesion and cause involuntary twitching, melting, or partial collapse.\n\nOveruse makes his form sluggish, unstable, and harder to control.\n\nHeavy damage can scatter his mass, forcing him to spend time pulling himself back together.\n\nComplex weapon forms weaken if he loses concentration.\n\nEmotional spikes make his morphing stronger but messier and less precise.\n\nAble to make a simple projectile: slingshot, bow n arrow, throw a spear or bat. If he dies he must also recover it to be while again. Unable to make complex items like working guns, things with engines, etc.", link: "https://roleplay.chat/profile.php?user=Golden%20Fool" }, // sub:5adf244b
  { char: "Beatrix Moretti", alias: "Bumblebee", house: "orenne", year: "Freshman", track: "sidekick", tier: "C-List", power: "Apis Bio-Electricity, Vibrational Flight, Stinger Pulses, Resonance Disruption, Swarm Sense, Enhanced Physical Attributes", expression: "Apis Bio-Electricity\nBee generates a specialized form of golden bio-electric energy that behaves somewhere between electricity, vibration, and neurological stimulation. Unlike traditional electrokinesis, her abilities are far less destructive and far more adaptive, designed around movement, disruption, support, and protection. Her energy often manifests through: warm gold light, hexagonal patterns, static-like buzzing, and vibrating pulses that ripple through the air. The more emotionally invested Bee becomes in protecting someone, the more stable and responsive her powers tend to become.\n\n(Out of room: )", drawbacks: "Executive Dysfunction, Sensory Overload, Emotional Vulnerability, Inconsistent Performance, Limited Offensive Power, Physical Fragility, Compulsive Compassion", link: "https://roleplay.chat/profile.php?user=Bumblebee." }, // sub:4e55e98e
  { char: "Viviane Yamaguchi", alias: "VEINGLORY", house: "grimere", year: "Freshman", track: "sidekick", tier: "B-List", power: "Vital Manipulation · Diagnostic Body Reading · Truth Pulse · X-Ray Vision", expression: "Vital Manipulation — Senses and controls living vital systems at range: heartbeat, blood flow, breathing, nerve signals, muscle tension, blood pressure, pain response, organ stress, and tissue repair. Touch or focused attention allows her to stabilise injuries, alter circulatory pressure, or override motor functions entirely.\n\nDiagnostic Body Reading — Reads body language through vital signs, micro-expressions, breathing shifts, pulse changes, muscle tension, eye movement, blood pressure, and nervous-system spikes. Allows her to detect when someone is lying, hiding fear, masking pain, or suppressing emotion. She does not read minds; she reads the body's involuntary truth.\n\nTruth Pulse — Focused lie-detection. She compares spoken words against heartbeat, breath, stress response, and pulse rhythm. Skilled liars, trained agents, sedatives, emotional numbness, or body-altering powers can interfere.\n\nX-Ray Vision — Natural diagnostic sight regulated by her Vitrex Diagnostic Goggles, allowing her to detect fractures, internal bleeding, organ damage, foreign objects, muscle tears, hidden trauma, and power-related abnormalities. Without the goggles her x-ray sight runs unfiltered, causing sensory overload.", drawbacks: "Requires sustained focus — loss of concentration breaks the effect. Range reduces precision significantly. Crowds and busy environments overwhelm her senses. Physical barriers and armour interfere with vital manipulation. Complex tissue repair is far harder and slower than causing harm. Truth Pulse can be beaten by skilled liars, trained agents, sedatives, emotional numbness, or body-altering powers. Unfiltered x-ray vision causes migraines, nausea, eye strain, nosebleeds, and sensory overload — requires Vitrex Goggles to function safely. Cannot resurrect the dead. Has a deep fear of losing control over her own power.", link: "https://roleplay.chat/profile.php?user=vein" }, // sub:28edfc1f
  { char: "Layla Armstrong", alias: "Hexashift", house: "orenne", year: "Junior", track: "sidekick", tier: "B-List", power: "Limb Extension, Teleportation, Superhuman Strength", expression: "Sheeva [Mortal Kombat] x Dhalsim [Street Fighter]", drawbacks: "Can only stretch so far before limbs tear. Can't teleport long distances and can only teleport self.", link: "https://roleplay.chat/profile.php?user=Layla_" }, // sub:6f29a7e1
  { char: "Sylvia Strathe", alias: "Silhouette", house: "orenne", year: "Senior", track: "sidekick", tier: "A-List", power: "Invisibility · Invisible force constructs · Force-field generation · Stealth", expression: "Sylvia can render herself completely invisible at will — no shimmer, no distortion, no sound. She can also generate invisible force constructs: solid platforms, shields, barriers, and pressure attacks that exist in the air around her but cannot be seen. These constructs appear only as faint glass-like distortions, subtle pressure ripples, or displaced light when active. She uses them offensively as ghost-hand pressure strikes, defensively as full-body force shields, and structurally as invisible platforms she can stand or fly on. Her invisibility and constructs can operate simultaneously — she can be fully invisible while projecting a visible space that others can walk into without knowing it is shielded.", drawbacks: "Powers require sustained concentration — disrupted focus causes constructs to collapse mid-use. Heavy impacts absorbed by her force fields cause direct physical strain and can knock her out of invisibility. Scale is limited as a sidekick — large constructs drain her quickly. Can be detected by thermal imaging, motion sensors, pressure pads, or sound-based tracking even while invisible. Vulnerable if caught off guard at close range before a shield is raised. Overcommitted schedule affects recovery and focus. Perfectionism and fear of failure create performance pressure that can interfere with precision. Recognition issues — her powers are invisible, making her contributions hard to see. Public image pressure from Strata conflicts with dangerous hero work. Family pressure from her uncle's position at Strata creates expectation she cannot always meet. Grief over Solas and emotional weight from the Cassandra tragedy affect her stability under pressure.", link: "https://roleplay.chat/profile.php?user=sylvia" }, // sub:0a936bfa
  { char: "Evan Holloway", alias: "Shadowshade", house: "grimere", year: "Senior", track: "sidekick", tier: "B-List", power: "Shadow Phase", expression: "Evan has the ability to merge himself with shadows, traveling undetected through them. He can also create shadow puppets-- obscure phantoms that serve as decoys and distractions.", drawbacks: "His powers make him sensitive to light. He can only travel through pre-existing shadows rather than create them himself. Therefore, in a place without shadows, he's ineffective. When he makes shadow puppets, it leaves him vulnerable and he can't move. ", link: "https://roleplay.chat/profile.php?user=shadowshade" }, // sub:4f166b28
  { char: "Antonie Ciaran Jean-Baptiste ", alias: "Blink", house: "grimere", year: "Junior", track: "hero", tier: "C-List", power: "Perceptual Momentum, Accelerated Movement, Blink-Stepping, Kinetic Amplification, Enhanced Physical Attributes", expression: "Perceptual Momentum\nAnton's powers are rooted in an unusual interaction between motion, awareness, and observation. Whenever visual perception of him is interrupted—whether through blinking, darkness, distraction, obstructions, or broken lines of sight—his body becomes capable of generating and sustaining dramatically greater momentum. These brief gaps in perception allow him to move, accelerate, and reposition with an efficiency that defies conventional physics. While he remains superhumanly fast under normal conditions, his capabilities increase substantially whenever opponents lose track of him, making him particularly dangerous in chaotic or low-visibility environments.\n\n(Ran out of room: https://docs.google.com/document/d/1BpcGeUwCd0GUXmPm5R_WotVuyhtirGBWgK9AaaBHtrE/edit?usp=sharing)", drawbacks: "Continuous Observation, Momentum Dependency, Neurological Strain, Escalation Feedback, Emotional Triggers, Reputation & Political Scrutiny, Risk-Seeking Behavior, Family Entanglements", link: "https://roleplay.chat/profile.php?user=Blink" }, // sub:f174fc2c
  { char: "Daniel Hightower", alias: "Siege", house: "valaris", year: "Junior", track: "hero", tier: "A-List", power: "Hardlight Manipulation", expression: "Daniel can generate and control solidified photonic energy, forming opaque pale-blue constructs with tangible mass and durability. Unlike ordinary light, these creations possess physical substance and can withstand tremendous force before breaking apart into shimmering fragments.\n\nThe versatility of this power allows Daniel to create barriers, platforms, restraints, tools, weapons, shelters, bridges, and countless other structures. While simple constructs can be produced almost instantaneously, larger or more complex creations require greater concentration and energy expenditure.", drawbacks: "Every active construct occupies a portion of Daniel's attention.\nMaintaining a single barrier requires little effort, but coordinating dozens of structures simultaneously places immense strain on his concentration. As the number, complexity, and scale of his constructs increase, so does the likelihood of mistakes, delays, or structural failures.\n\nHardlight generation demands substantial energy.\nSmall constructs can be maintained for extended periods, but large fortifications, sustained battles, or repeated reconstruction rapidly drain Daniel's reserves. Extended overuse can result in severe exhaustion, dizziness, nausea, muscle weakness, and eventual collapse.\n\nDaniel excels when he has time to establish defenses and control the battlefield.\nOpponents who constantly relocate, force rapid repositioning, or prevent him from setting up layered defenses can significantly reduce his effectiveness.", link: "https://roleplay.chat/profile.php?user=Siege" }, // sub:64886309
  { char: "Nina Sterling Evergreen", alias: "Crown", house: "saberis", year: "Junior", track: "hero", tier: "A-List", power: "Auric Transmutation, Gilded Reinforcement, Auric Conduction, Living Treasury Mutation, Treasury State, Enhanced Physical Conditioning", expression: "Auric Transmutation\nNina possesses the ability to transmute organic and inorganic matter into a living auric-gold state through touch, conductive spread, and focused activation. Unlike ordinary metallic conversion, her auric matter remains partially reactive to her influence, allowing her to reinforce, crystallize, reshape, weaponize, or immobilize affected material. While highly controlled under normal circumstances, emotional destabilization can cause involuntary transmutation responses and uncontrolled auric spread.\n\n(Out of room: https://docs.google.com/document/d/1TlmyWRN8COQD81OgLJyCbB8oL9GpnW0BMQ85WhnkNLc/edit?usp=sharing)", drawbacks: "Emotional Destabilization, Conductive Vulnerability, Metabolic Strain, Escalation Risk, Treasury State Instability, Physical Contact Anxiety", link: "https://roleplay.chat/profile.php?user=Crown." }, // sub:ae27911b
  { char: "Roan Aoibhinn Marie O'Malley", alias: "Ricochet", house: "valaris", year: "Sophomore", track: "hero", tier: "C-List", power: "Kinetic Rebound Physiology, Enhanced Physicality, Impact Resistance", expression: "Kinetic Rebound Physiology\nRoan's power revolves around a unique kinetic physiology that allows her body to absorb, redirect, store, and manipulate momentum through controlled impacts. Rather than stopping when force is applied, her body instinctively converts that force into movement and acceleration. Every ability she possesses stems from this singular power source, allowing her to transform collisions, falls, and environmental interactions into opportunities for mobility, offense, and rescue. What appears chaotic from the outside is, in reality, an increasingly refined relationship between Roan and the physics surrounding her.\n\n(Full info: https://docs.google.com/document/d/1JcnFh-aQt1yGx_QSRuHtybDxG4YHXK_gEJqRz5M3X7w/edit?usp=sharing)", drawbacks: "Momentum Dependency, Collision Risk, Escalation Hazard, Human Error, Environmental Dependence, Physical Wear and Tear, Emotional Instability, Protective Instinct, Isolation Through Difference\n", link: "https://roleplay.chat/profile.php?user=Ricochet!" }, // sub:281a65e1
  { char: "Nike Navarro", alias: "SEAFOAM", house: "valaris", year: "Senior", track: "hero", tier: "C-List", power: "Hydrokinesis · Water Nymph Physiology", expression: "Seafoam possesses an innate connection to water, functioning as both conduit and catalyst. Rather than controlling water through force, she influences it through instinct, emotion, and proximity, causing nearby moisture to respond as naturally as a limb. Water gathers around her in flowing ribbons, spirals, droplets, and seafoam-like currents that move with graceful, organic motion. She can draw from oceans, rivers, rain, humidity, and other nearby sources to create barriers, tendrils, platforms, waves, and currents. More subtle applications allow her to sense disturbances through water, perceive through reflective surfaces, and accelerate healing with purified water. Her powers intensify near large bodies of water and during storms, often accompanied by drifting droplets, rippling reflections, glowing seafoam, and the distant sound of waves.", drawbacks: "Seafoam's abilities are heavily dependent on the presence of water. While she can manipulate moisture in the air, arid environments, extreme heat, and prolonged drought significantly reduce her effectiveness. Large-scale constructs and sustained hydrokinesis rapidly drain her stamina, causing physical exhaustion, dehydration, and loss of focus. Her healing abilities require clean, accessible water and cannot repair severe injuries instantly. Contaminated or magically altered water is difficult to control and may disrupt her powers entirely. Emotional distress can also affect her control, causing currents, waves, or seafoam manifestations to react unpredictably. Although resistant to aquatic pressure and cold, she remains physically vulnerable when caught without sufficient water nearby and cannot maintain advanced abilities indefinitely.", link: "https://roleplay.chat/profile.php?user=seafoam" }, // sub:fc774fe5
  { char: "Damian Hollister", alias: "Silverweave", house: "grimere", year: "Senior", track: "hero", tier: "B-List", power: "Clothing Manipulation, Fabric Awareness, Enhanced Physicality", expression: "Clothing Manipulation\nDamian’s primary ability allows him to manipulate textiles and clothing that are actively being worn by another person or himself. Unlike telekinesis, his power does not extend to loose objects or fabrics not currently in physical use. Once contact or awareness is established, however, he can exert remarkable control over tension, movement, compression, and directional force within garments.", drawbacks: "Limited Target Scope, Physically Outmatched, Overstimulation & Sensory Strain", link: "https://roleplay.chat/profile.php?user=Silverweave" }, // sub:80ffafe1
  { char: "Roger Lee", alias: "Dragon Force", house: "valaris", year: "Sophomore", track: "hero", tier: "B-List", power: "Draconic Force", expression: "The foundation of Roger's power. Roger possesses an extraordinarily potent life-force that continuously fuels and reinforces his body. By consciously directing this energy, he can temporarily amplify his physical abilities beyond their already enhanced baseline. Roger can channel Draconic Force into physical transformations that progressively alter his body. The greater the manifestation, the greater the strain and energy consumption. Roger can project Draconic Force externally as visible crimson-gold energy. At maximum output, the aura can take the shape of an enormous spectral dragon surrounding his body. By compressing Draconic Force within specialized respiratory organs created through manifestation, Roger can unleash devastating ranged attacks. Roger naturally projects a powerful aura of confidence, determination, and authority. This effect becomes noticeably stronger during active combat situations. Roger has received extensive formal martial arts instruction from an early age.\n", drawbacks: "Roger possesses a strong competitive streak and can become emotionally invested in conflicts.\nMaintaining high-level manifestations requires enormous amounts of energy.\nDraconic Force responds strongly to Roger's emotional state.\nRoger places tremendous value on protecting friends, teammates, and innocent bystanders.\nRoger dislikes appearing weak, incapable, or dependent on others.\nWhen actively utilizing Dragon Force, Roger becomes extremely difficult to ignore.\nBecause of his strained relationship with his father and his dislike of abusive authority figures, Roger can react poorly to individuals he perceives as arrogant, controlling, or hypocritical.\nMany of his failures stem not from lack of capability, but from acting before fully considering the consequences of his actions. This is the single greatest obstacle standing between Dragon Force and true A-List status.", link: "https://roleplay.chat/profile.php?user=Dragonforce" }, // sub:2c8ebbe7
  { char: "Marina Warbeck", alias: "Shutter", house: "orenne", year: "Freshman", track: "sidekick", tier: "C-List", power: "Frame Control — photography-based moment manipulation", expression: "Marina affects only what she can clearly frame — through a camera lens, photo, screen, mirror, finger-rectangle, or focused sightline. Visuals lean on camera flashes, frame lines, film grain and suspended dust. Core aspects: Shutter Freeze (briefly freezes a framed subject mid-motion, her signature), Refocus (sharpens perception of tiny details and tells), Exposure (makes existing physical evidence stand out), Motion Blur (smears her own movement to dodge), Crop (a fragile rectangular boundary to shield or contain), Retake (redoes her own last 1–2 seconds of movement), Suspension (briefly hovers framed objects/people; no true flight), Replay (steps into old photos to relive them as memory-imprints), Extract (pulls a temporary copy of a small non-living object from a photo), Contact Sheet (compares related photos for patterns), and Darkroom Focus (deep concentration to combine abilities). Built for support, rescue, investigation and evidence-gathering rather than brute force.", drawbacks: "Everything needs a frame, focus point, or image — no clear sightline means no power. Effects are brief and small-scale: freezes last only seconds, boundaries are fragile and break under force, suspension can't lift heavy subjects and gives no real flight. Living people are far harder to freeze or hold than objects. Extracted objects are temporary and fade; they only work on small non-living things actually visible in the photo, never people or animals. Replay can't change the past, bring anyone back, or give perfect answers — memory-imprints are biased and incomplete, and lingering too long is overwhelming. Overusing Suspension, Motion Blur, Retake or Extract causes dizziness, nausea, headaches and flash-spots. She's weakest in chaotic combat where she can't concentrate, is clumsy under pressure, panics when attention is on her, and misreads evidence when biased. No mind-reading, reality-warping, no true time travel.", link: "https://roleplay.chat/profile.php?user=shutter" }, // sub:7287dcac
  { char: "Indigo Sky", alias: "The Blue Bard", house: "grimere", year: "Freshman", track: "sidekick", tier: "C-List", power: "Core: Total Self-Awareness /  Secondary: Object Scaling", expression: "Total Self-Awareness :\nEidetic Memory: Near-perfect recall of anything he has seen, heard, read, or experienced.\nHyperthymesia:  Detailed autobiographical memory, allowing him to remember personal experiences with extreme accuracy.\nEnhanced Observation: Notices tiny details, changes, clues, body language, flaws, and inconsistencies others miss.\nSpatial Awareness: Understands his position, distance, movement, angles, balance, and surroundings with exceptional precision.\nProximity Awareness : Tracks people, movement, and objects within his immediate awareness range.\nEmotional Awareness: Identifies and understands his own emotional reactions in real time.\nInformation Cataloging: Metally organizes people, places, objects, events, and details for later recall.\nRapid Recall: Pulls up stored information almost instantly when needed.\n\nObject Scaling: Can increase or decrease the size of non-living objects while maintaining their functionality and proportional properties.", drawbacks: "Diagnosed: Schizotypal Personality Disorder and a systematized delusion\nHe was diagnosed before he ever got powers.  Powers lead to full delusions of grandeur. \nHis psychosis comes in the form of hallucinations of Hud Screens.  His powers, his life, and everything between he brought to him through HUD Screens and Videogame/Dungeon N Dragons style storytelling and narration.\nBecause of this he and his abilities can also be manipulated.\nEX:\nObject Scaling: Subconscious ability. Any bag he touches he believes is a bag of holding.  Shrinking and growing as he pulls them in and out of the bag.  He can not just grow/shrink things cause he chooses to.\nPeople: All exist on radar map hud as NPCs until categorized, friend, enemy etc. If one convinced him they had an invisible cloak on, they'd literally be removed from his radar and vision. \nSide quests: He may be distracted and  go off to do something expecting to get XP.\n", link: "https://roleplay.chat/profile.php?user=Player%20One" }, // sub:201f9ded
  { char: "Eira Skarsen", alias: "Svalinn", house: "saberis", year: "Sophomore", track: "hero", tier: "C-List", power: "Purification, Purification Reservoir, Enhanced Physiology", expression: "Purification\nEira's primary ability allows her to identify, remove, contain, redistribute, and condense contaminants, corruption, instability, and harmful influences from living organisms, objects, energies, environments, and certain abstract systems. She can purge toxins, diseases, radiation, biological abnormalities, environmental pollutants, and various forms of power-induced corruption, making her one of the most versatile support-oriented students at Calderyn. Her power does not destroy contamination; it relocates, stores, condenses, or redistributes it according to the laws governing her ability. \n\n(https://docs.google.com/document/d/1FvVLpvzutxisNJcNifUpKiWuqrhsumb9wxLThsvG31I/edit?usp=sharing)", drawbacks: "Conservation of Contamination, Reservoir Accumulation, Ethical Redistribution, Subjective Classification, Limited Direct Offense, Intellectual Obsession", link: "https://roleplay.chat/profile.php?user=Svalinn" }, // sub:75878f9d
  // AUTO-INSERT:students — approved Student form entries get inserted directly above this marker by the relay Worker. Do not remove.
],

faculty: [
  {
    section: "OFFICE OF THE DEAN",
    note: "The Dean is the operational head of Calderyn College. Final authority on admission, discipline, expulsion, and reassignment. Reports to the STRATA executive board and to no one else.",
    rows: [
      { role: "Dean", char: "Dr. Devika Ravindrakumar", tier: "A", power: "Power Nullification (15m field)", npc: true },
      { role: "Director of Admissions" },
      { role: "Registrar" },
      { role: "Registrar", char: "Helena Claire Fairchild", stage: "Facet", power: "Facet Duplication, Shared Consciousness & Reintegration, Enhanced Physical Attributes", expression: "Facet Duplication\nHelena's primary ability allows her to create independent duplicates of herself known as facets. Each facet is a complete version of Helena at the moment of creation, possessing her memories, personality, knowledge, and abilities. Once separated, facets begin accumulating their own experiences, perspectives, and emotional responses to the world around them. When Helena chooses to reintegrate, she absorbs the memories, emotions, knowledge, and experiences of each facet, allowing her to learn and grow at a significantly accelerated rate compared to most individuals. While many assume her ability is valuable because it allows her to be in multiple places simultaneously, Helena considers the true strength of her power to be the accumulation of experience and understanding.\n\n(Full info: https://docs.google.com/document/d/1NVFHpdaFTz5GGq5lwuyfiSST6TMrec72s9NaOynqzo8/edit?usp=sharing)", drawbacks: "Emotional Accumulation, Psychological Fragmentation, Attachment to Her Facets, Sensitivity to Violence, Difficulty Letting Go, Curiosity Over Practicality, Reluctance to Ask for Help", link: "https://roleplay.chat/profile.php?user=Facet" }, // sub:0b8ec5aa
    ],
  },

  /* ─── 1 · COMBAT ───────────────────────────────────────────────── */
  {
    section: "COMBAT",
    dept: "combat",
    note: "The largest faculty by headcount. The department the public thinks Calderyn is. HoD locked: Theron, ex-Vanguard background. Operational record partially classified.",
    rows: [
      { role: "Head of Combat", deptSlot: "head",
        char: "Theron", stage: "THERON",
        power: "Biokinetic Augmentation · Kinetic Absorption & Release",
        expression: "Theron's body absorbs and redistributes incoming force, dampening damage and channelling that energy into momentum. Strength scales with motion, favouring charges, grapples, and sustained pressure. In Break State his biological inhibitors fail, deepening output at the cost of self-damage.",
        drawbacks: "Not invulnerable — repeated impacts, piercing attacks, and concentrated force still fracture and bleed him. Heavy absorption strains his system, slowing reactions and pushing him toward overheating, fatigue, and eventual shutdown. Break State worsens injury suppression and risks collapse.",
        link: "https://roleplay.chat/profile.php?user=bulk",
        npc: false,
      },
      { role: "Prof. 1 · Power-Augmented Engagement & Hand-to-Hand", deptSlot: "prof1" },
      { role: "Prof. 2 · Crisis Intervention & Multi-Agency Response", deptSlot: "prof2" },
      { role: "Prof. 3 · Containment & Powered-on-Powered Engagement", deptSlot: "prof3" },
      { role: "TA · Combat (Heroes lane)" },
      { role: "TA · Combat (Sidekicks lane)" },
    ],
  },

  /* ─── 2 · MEDIA & ARTS ─────────────────────────────────────────── */
  {
    section: "MEDIA & ARTS",
    dept: "media-arts",
    note: "The public-presentation faculty. Press, identity craft, performance training as the spine. The department whose graduates the public actually recognises. HoD: open.",
    rows: [
      { role: "Head of Media & Arts", deptSlot: "head" },
      { role: "Prof. 1 · Press, Statement Craft & Statutory Liaison", deptSlot: "prof1" },
      { role: "Prof. 2 · Performance, Presence & Public Address", deptSlot: "prof2" },
      { role: "Prof. 3 · Visual Identity, Costume & the Codename Seminar", deptSlot: "prof3" },
    ],
  },

  /* ─── 3 · SCIENCES ─────────────────────────────────────────────── */
  {
    section: "SCIENCES",
    dept: "sciences",
    note: "The academic spine of the institution. A real faculty of sciences that happens to teach supes. Largest discipline cluster after Combat. HoD: open.",
    rows: [
      { role: "Head of Sciences", deptSlot: "head" },
      { role: "Prof. 1 · Mathematics & Physical Sciences", deptSlot: "prof1" },
      { role: "Prof. 2 · Parahuman Biology & Pharmacology", deptSlot: "prof2" },
      { role: "Prof. 3 · Powered Medicine · Teaching Clinic", deptSlot: "prof3" },
    ],
  },

  /* ─── 4 · ENGINEERING ──────────────────────────────────────────── */
  {
    section: "ENGINEERING",
    dept: "engineering",
    note: "Builds, maintains, and runs everything on campus that isn't a person. HoD: open. (Iris Grimere stays in Support Staff as Diagnostic Wing Director — not teaching faculty.)",
    rows: [
      { role: "Head of Engineering", deptSlot: "head" },
      { role: "Prof. 1 · Robotics & Autonomous Systems", deptSlot: "prof1" },
      { role: "Prof. 2 · Personal Kit & Gadget Design", deptSlot: "prof2" },
      { role: "Prof. 3 · Facility Systems & Infrastructure", deptSlot: "prof3" },
      { role: "Workshop Technician" },
      { role: "Workshop Technician" },
      { role: "Bot Bay Technician" },
    ],
  },

  /* ─── 5 · HISTORY & DOCTRINE ───────────────────────────────────── */
  {
    section: "HISTORY & DOCTRINE",
    dept: "history-doctrine",
    note: "The department that holds the institutional argument with itself. The Doctrine, ethics, law, comparative powered politics. HoD: open, longest-serving head on paper; sits to Devika's right at Heads' Table.",
    rows: [
      { role: "Head of History & Doctrine", deptSlot: "head" },
      { role: "Prof. 1 · The Calderyn Doctrine, 1948–Present", deptSlot: "prof1" },
      { role: "Prof. 2 · Ethics, Restraint & Non-Deployment", deptSlot: "prof2" },
      { role: "Prof. 3 · Powered Persons, the State, STRATA & the Pipeline", deptSlot: "prof3" },
    ],
  },

  /* ─── 6 · ATHLETICS ────────────────────────────────────────────── */
  {
    section: "ATHLETICS",
    dept: "athletics",
    note: "The body as long-term instrument. Distinct from Combat. Runs the house system, Powerball, and the inter-house calendar. HoD: open.",
    rows: [
      { role: "Head of Athletics", deptSlot: "head" },
      { role: "Prof. 1 · Foundations of Conditioning & Endurance", deptSlot: "prof1" },
      { role: "Prof. 2 · Power-Augmented Athletics & Limit Testing", deptSlot: "prof2" },
      { role: "Prof. 3 · Sports Medicine & Recovery", deptSlot: "prof3" },
      { role: "House Trainer · Valaris" },
      { role: "House Trainer · Saberis" },
      { role: "House Trainer · Orenne" },
      { role: "House Trainer · Grimere" },
    ],
  },

  /* ─── 7 · HUMANITIES ───────────────────────────────────────────── */
  {
    section: "HUMANITIES",
    dept: "humanities",
    note: "Literature, philosophy, languages. The academic spine that isn't STEM. HoD: open. The only head with no security clearance — institutionally significant.",
    rows: [
      { role: "Head of Humanities", deptSlot: "head" },
      { role: "Prof. 1 · English Literature & Writing", deptSlot: "prof1" },
      { role: "Prof. 2 · Philosophy", deptSlot: "prof2" },
      { role: "Prof. 3 · Modern Languages", deptSlot: "prof3" },
    ],
  },

  /* ─── 8 · POLITICS & PUBLIC AFFAIRS ────────────────────────────── */
  {
    section: "POLITICS & PUBLIC AFFAIRS",
    dept: "politics",
    note: "The social-sciences department. Politics, business, policy, economics — the disciplines that govern how powered persons actually operate inside the state and the market. HoD: open.",
    rows: [
      { role: "Head of Politics & Public Affairs", deptSlot: "head" },
      { role: "Prof. 1 · Political Theory & Government", deptSlot: "prof1" },
      { role: "Prof. 2 · Business & Management", deptSlot: "prof2" },
      { role: "Prof. 3 · Public Policy & Economics", deptSlot: "prof3" },
    ],
  },

  /* ─── SUPPORT STAFF (Switchboards LOCKED here per canon) ──────── */
  {
    section: "SUPPORT STAFF",
    note: "The Diagnostic Wing is overseen, in name and in practice, by Iris Grimere (Switchboard). Day-to-day medical staff report through her. Switchboards is not on teaching faculty; her institutional presence runs through the Wing and through the bots that run the campus.",
    rows: [
      { role: "Diagnostic Wing — Director", char: "Iris Grimere", tier: "A", stage: "Switchboard", power: "Technokinesis", npc: true },
      { role: "Chief Medical Officer" },
      { role: "Security Chief" },
      { role: "Head Groundskeeper" },
      { role: "Residential Warden" },
    ],
  },
],

/* ═══════════════════════════════════════════════════════════════════════════
   AUX FACULTY · approved-via-form professors that fill departments[] slots
   When a writer applies for a department position via the join form and
   their submission is approved, the Worker appends an entry here rather
   than mutating the departments[] tree in place. The Faculty Registry
   render path merges these onto the matching dept head / staff / instruct
   slot before rendering.
   Entry shape:
     { deptId, slotKind, role, char, link, alias, tier, npc, // sub:<id> }
   slotKind ∈ "head" | "staff" | "instructional"
   ═══════════════════════════════════════════════════════════════════════════ */
auxFaculty: [
  { deptId: "media-arts", slotKind: "head", role: "Head of Media & Arts", char: "Professor Eurydice Lovecraft", alias: "Dream", tier: "A", power: "Oneiric Perception · Somnolent Illusion", expression: "Dream operates at the border between waking and sleeping. There is no visible light show, no dramatic visual signature. People near her describe a quality to the air: a warmth behind the eyes, a slowing of thought, the sense that the present moment has become slightly less urgent. She does not look like she is doing anything. That is part of how it works.\n\nSurface — She makes people sleepy. She can drop drowsiness over a whole room, blur a crowd's attention, calm panic, or ease a single target into actual sleep without them realising she did it. Most people never notice they were pushed.\n\nDaydream — She edits how the moment feels. Light seems warmer. A stranger feels familiar. A fear loosens. A bruise reads as old, a tired face reads as rested. Surface only — she is tweaking the picture, not the truth. It holds for as long as she pays attention to it.\n\nDreamscape — She builds a fake world inside someone's head. At full depth she constructs an entire reality around a target: corridors, conversations, rooms, faces, weather. The person inside walks through it believing it is an ordinary afternoon, and tends to remember it that way after. Sight, sound, touch, emotion — all of it consistent enough that they do not question it.\n\nOneiric Echoes — Her own sleep sometimes shows her things. During natural sleep, especially after she has used her power hard, she gets fragmented visions. Pieces of the past, hidden truths, possible futures. They come as symbols rather than facts — flooded rooms, cracked mirrors, burning film reels, faceless crowds, white moths, applause, blood on gloves, doors that should not exist. She cannot summon them, cannot choose what they show, and often cannot tell what they mean until after the fact. But they have been right often enough that she has stopped ignoring them.", drawbacks: "Dreamscape leaves her body undefended — While she is inside a constructed dream, her real body is frozen and blind to the room. Someone could walk up to her, hit her, take her keys, drag her somewhere else, and she would not notice until the dream ends.\n\nDaydream is paint, not surgery — It changes how things look or feel in the moment. It does not change what someone believes, override strong emotion, or hold against anyone who is actively suspicious or resisting. Soft pressure, not control.\n\nSleep does not work on adrenaline — She cannot put a target to sleep if they are highly agitated, in severe pain, or chemically stimulated. The more scared, hurt, or wired they are, the harder she has to push, and at some point she cannot push hard enough.\n\nEchoes are unreliable — They are symbolic, fragmentary, and impossible to force. They may show a possible future, not a guaranteed one. They can be misread, polluted by her own fears, or distorted by recent dreamscape work. After deep use of her power she may struggle to tell the difference between a genuine warning, a psychic afterimage, plain memory, and an ordinary nightmare.\n\nBurnout muddies her — After deep dreamscape work she has trouble telling her own present from the ones she just built. She needs time before she is safe to drive, make decisions, or be in any situation that requires sharp judgment.", link: "https://www.roleplay.chat/profile.php?user=dream" }, // sub:f7faa2f9
  { deptId: "combat", slotKind: "instructional", role: "TA · Combat (Sidekicks lane)", char: "Eric Winters", alias: "Ice King", tier: "A", power: "Cryokinetic Manipulation", expression: "Eric possesses the ability to generate, shape, control, and manipulate ice and cold energy on a highly advanced level. By extracting heat from his surroundings and introducing intense cryogenic energy, he can freeze moisture in the atmosphere, create solid ice from seemingly nothing, and reshape frozen matter according to his will. His powers are equally effective in offense, defense, rescue operations, and environmental control, making him one of the more versatile heroes associated with Calderyn and STRATA. Rather than relying solely on overwhelming force, Eric excels at controlling the pace, flow, and terrain of a confrontation.\n\nAt the foundation of Eric's abilities lies his capacity to remove heat from objects, environments, and living targets. Metal can become brittle, water can freeze instantly, and entire areas can rapidly lose temperature under his influence. ", drawbacks: "Extreme heat-based abilities represent one of Eric's most direct counters. Fire manipulators, plasma users, thermal controllers, and high-temperature environments can rapidly weaken his constructs, reduce the effectiveness of his freezing techniques, and force him to expend significantly more energy to maintain control. While he can still operate under such conditions, doing so becomes considerably more taxing and less efficient.\n\nAlthough Eric is dangerous from the moment a fight begins, his greatest strengths emerge after Winter Domain has been established. Opponents capable of overwhelming him early, forcing constant repositioning, or denying him opportunities to expand his influence can significantly reduce the effectiveness of his most powerful abilities. He excels in prolonged engagements but is less dominant during the opening moments of a confrontation.", link: "https://roleplay.chat/profile.php?user=IceKing" }, // sub:cd87514f
  // AUTO-INSERT:auxFaculty — approved Faculty form entries (department slots) get inserted directly above this marker by the relay Worker. Do not remove.
],

/* ═══════════════════════════════════════════════════════════════════════════
   DEPARTMENT TRIADS
   Two departments — Combat Training and Media Training — run on a triad
   model: one Head of Department who teaches the SHARED (cross-track)
   classes, plus one TA per track who teaches the track-specific classes.
   The HoD can substitute into any class via the optional `headSubs: true`
   flag on a class entry.

   Faculty for a class is computed at view-time:
     - type "shared"        → head
     - type "hero"          → taHero
     - type "sidekick"      → taSidekick
     - headSubs: true       → head (overrides the TA for that class)
═══════════════════════════════════════════════════════════════════════════ */
departments: [
  /* ─────────────────────────────────────────────────────────────────
     1 · COMBAT (HoD locked: Theron)
     ───────────────────────────────────────────────────────────────── */
  {
    id: "combat",
    name: "Combat",
    code: "COM",
    color: "#c41a1a",
    blurb: "The largest faculty by headcount and the department the public thinks Calderyn is. Carries the heaviest legacy of the doctrinal era — the 'prepared for war that never came' energy lives strongest here.",
    head: {
      role: "Head of Combat",
      char: "Theron",
      alias: "Bulk",
      tier: "A",
      power: "Biokinetic Augmentation · Kinetic Absorption & Release",
      expression: "Theron's body absorbs and redistributes incoming force, dampening damage and channelling that energy into momentum. Strength scales with motion, favouring charges, grapples, and sustained pressure. In Break State his biological inhibitors fail, deepening output at the cost of self-damage.",
      drawbacks: "Not invulnerable — repeated impacts, piercing attacks, and concentrated force still fracture and bleed him. Heavy absorption strains his system, slowing reactions and pushing him toward overheating, fatigue, and eventual shutdown. Break State worsens injury suppression and risks collapse.",
      link: "https://roleplay.chat/profile.php?user=bulk",
      npc: false,
      bio: "Ex-Vanguard background. Carries an institutional authority no other head matches. Operational record is partially classified; what students know is that he was on active deployment during the Cassandra incident, though never on the boat itself.",
    },
    staff: [
      { slot: "Prof. 1", role: "Power-Augmented Engagement & Hand-to-Hand Combat", bio: "Practitioner background. The professor everyone takes first because she's the most accessible." },
      { slot: "Prof. 2", role: "Crisis Intervention & Multi-Agency Response",       bio: "Joint background: Met liaison, fire service coordination, ambulance triage. Teaches the realistic chaos of mixed-asset response." },
      { slot: "Prof. 3", role: "Containment & Powered-on-Powered Engagement",       bio: "The most feared seat in the building regardless of who holds the post. Teaches students to fight their own peers — current classmates, future colleagues, sometimes both — and teaches the moral weight of it explicitly." },
    ],
    instructional: [
      { role: "TA · Combat (Heroes lane)" },
      { role: "TA · Combat (Sidekicks lane)" },
    ],
    facilities: "The Engagement Hall (multi-arena, designed to take damage and recover overnight via Engineering bots), the Containment Range, the Briefing Theatre.",
    classes: [
      { code: "COM-101", year: "FRESHMAN", kind: "shared-core", title: "Foundations of Engagement",
        taughtBy: "Prof. 1",
        desc: "Year-one combat literacy for every student, every designation. Stance, conditioning, controlled-arena drills, calibrated power stress-testing. Most physical washouts surface here — STRATA wants the unwillable broken early." },
      { code: "COM-201", year: "SOPHOMORE", kind: "literacy",    title: "Crisis Intervention Protocols",
        taughtBy: "Prof. 2",
        desc: "Multi-agency response. The realistic chaos of mixed-asset coordination — Met liaison, fire service, ambulance triage, you. The professor's joint background means you do not get the version where everything works first time." },
      { code: "COM-202", year: "SOPHOMORE", kind: "literacy",    title: "Containment & Holding",
        taughtBy: "Prof. 3",
        desc: "How to stop a powered threat without taking it apart. Restraint doctrine, holding patterns, the calculus of when not to escalate. Sidekick-designation students gravitate here; the institution does not object." },
      { code: "COM-203", year: "SOPHOMORE", kind: "literacy",    title: "Tactical Doctrine",
        taughtBy: "Prof. 2",
        desc: "Field tactics at the team level. Approach vectors, fire-and-movement under powered conditions, the architecture of a sanctioned op from briefing to debrief." },
      { code: "COM-301", year: "JUNIOR", kind: "literacy",    title: "The Civilian Calculation",
        taughtBy: "HoD",
        desc: "The institution's most morally serious module. When the maths is bystanders against asset, who lives, who pays the bill. Failing this class is generally career-ending." },
      { code: "COM-302", year: "JUNIOR", kind: "specialism",  title: "Powered-on-Powered Engagement",
        taughtBy: "Prof. 3",
        desc: "Specialist seat. Combat against your own peers — current classmates, future colleagues, sometimes both. The professor teaches the moral weight of it explicitly." },
      { code: "COM-303", year: "SENIOR", kind: "specialism",  title: "Field Command",
        taughtBy: "HoD",
        desc: "Senior capstone. Lead authority, command structure under live conditions, the responsibility that comes with being the one whose name reaches the press. Open to both designations." },
    ],
  },

  /* ─────────────────────────────────────────────────────────────────
     2 · MEDIA & ARTS  (HoD: open)
     ───────────────────────────────────────────────────────────────── */
  {
    id: "media-arts",
    name: "Media & Arts",
    code: "MDA",
    color: "#d4901a",
    blurb: "The public-presentation faculty. Press on one wing, identity craft on the other, performance training as the spine that joins them. The department whose graduates the public actually recognises.",
    head: {
      role: "Head of Media & Arts",
      char: "Eurydice Lovecraft",
      alias: "Dream",
      tier: "A",
      power: "Oneiric Perception · Somnolent Illusion",
      expression: "Lovecraft puts people to sleep. Not gently, not always, but consistently. A room she walks into goes quieter inside ten minutes if she wants it to. At surface level she settles panic, dims attention, eases someone over the edge of sleep without them noticing the push. At depth she builds dreamscapes around a single target or a small group. Full constructed rooms, corridors, conversations, stages a person walks through believing they are walking through anything else. The illusion bends what they see, what they hear, what they touch, what they feel emotionally, what they believe is happening in the moment. People come back from a Lovecraft dream sure they had a normal afternoon. Underneath that she runs a smaller kind of trick on the side. She calls it daydream tailoring and treats it like makeup. She can smooth a bruise off a student's face for a press appearance, soften the colour of tired eyes, slim the line of a jacket someone is still wearing, brighten or dim a person's complexion just enough that a camera reads them as someone slightly different. The work is surface only. It holds for as long as she is actively paying attention to it.",
      drawbacks: "The deep work costs her presence. While she is inside a constructed dreamscape with someone she stops being inside the room with her own body. The illusions need a thread of contact: skin to skin works best, sustained eye contact works for short range, sleeping in the same building works for the long version. Anyone trained to recognise dream logic can break out, and she teaches the resistance herself. Heavy stimulants, adrenaline, and certain medications dampen her reach. The daydream tailoring is cheap in single use and expensive in volume. She cannot read minds; the dreams she builds are her imagination dressed for the target, not pulled out of their head.",
      link: "https://roleplay.chat/profile.php?user=dream",
      npc: false,
      bio: "Twenty-eight years old, velvet-clad, and impossible to ignore. Lovecraft runs the press wing, the studio, and the codename seminar with the air of a woman who has personally met every nightmare the British tabloids can invent. Students call her Dream because that is what she signs the back of her exams. She begins lectures with sentences like good morning my little catastrophes and pauses mid-thought to tell a kid in the second row they haven't slept. She is funny in a dry, slightly unsettling way, theatrical without ever quite being melodramatic, and very protective of the students she has put on television. Theron treats her with a particular institutional respect that the rest of the faculty has noticed.",
    },
    staff: [],
    // Media & Arts runs on a different faculty model from the other
    // departments: the HoD (Eurydice "Dream" Lovecraft) teaches every
    // module across press, performance, and identity craft herself.
    // Two TAs support — Sidekick-track gravitates to the press wing,
    // Hero-track gravitates to performance + visual identity, so the
    // lanes split that way.
    instructional: [
      { role: "TA · Media & Arts (Heroes lane)" },
      { role: "TA · Media & Arts (Sidekicks lane)" },
    ],
    facilities: "The Press Suite (working broadcast space, real cameras, real lighting), the Studio (visual identity / costume / persona work), the Address Theatre (live-audience performance training).",
    classes: [
      { code: "MDA-101", year: "FRESHMAN", kind: "shared-core", title: "The Public Face",
        taughtBy: "HoD",
        desc: "Year-one media literacy for every student. Camera presence, interview basics, the transcript of someone else's incident dissected line by line. You learn what gets said and what gets cleared before you learn how to say either." },
      { code: "MDA-201", year: "SOPHOMORE", kind: "literacy",    title: "Press Protocols & Statement Craft",
        taughtBy: "HoD",
        desc: "Press and statutory liaison. How the powered sector communicates with the state and the public, and where those two diverge. The Sidekick-designation lane gravitates here." },
      { code: "MDA-202", year: "SOPHOMORE", kind: "literacy",    title: "Performance & Presence",
        taughtBy: "HoD",
        desc: "Public address under hostile conditions. Holding a room without your power, refusing a question visibly, the bridge between press work and stagecraft." },
      { code: "MDA-203", year: "SOPHOMORE", kind: "specialism",  title: "Visual Identity & Costume Design",
        taughtBy: "HoD",
        desc: "Single-term seminar. You walk in a student; you walk out with a working persona, or you don't. Costume, visual identity, the legal architecture of a working alias." },
      { code: "MDA-301", year: "JUNIOR", kind: "literacy",    title: "Hearings & Accountability",
        taughtBy: "HoD",
        desc: "Statutory hearings, internal investigations, the architecture of accountability when something went wrong. The press work that follows when a deployment goes public. Open to both designations." },
      { code: "MDA-302", year: "JUNIOR", kind: "specialism",  title: "The Codename Seminar",
        taughtBy: "HoD",
        desc: "Notorious. The naming itself is the assessment. Most students change their codename at least twice during the term. Open to both designations." },
      { code: "MDA-303", year: "SENIOR", kind: "specialism",  title: "Powerball Coverage",
        taughtBy: "HoD",
        desc: "Cross-listed with Athletics. The annual exhibition meet is the country's biggest powered media event. How to cover it, brand it, survive it on either side of the camera." },
    ],
  },

  /* ─────────────────────────────────────────────────────────────────
     3 · SCIENCES  (HoD: open)
     ───────────────────────────────────────────────────────────────── */
  {
    id: "sciences",
    name: "Sciences",
    code: "SCI",
    color: "#2eb574",
    blurb: "The academic spine of the institution. A real faculty of sciences that happens to teach supes. Largest discipline cluster after Combat.",
    head: {
      role: "Head of Sciences",
      bio: "Senior parahuman researcher, clinical or biological background, the most-cited member of faculty. Holds unlisted STRATA clearance.",
    },
    staff: [
      { slot: "Prof. 1", role: "Mathematics & Physical Sciences",       bio: "Maths, physics, foundational chemistry. The quantitative spine. Teaches the modules every other department's students complain about taking." },
      { slot: "Prof. 2", role: "Parahuman Biology & Pharmacology",      bio: "Physiology, biochem, drug action, dosing for altered metabolisms. Works closely with Prof. 3's clinical team." },
      { slot: "Prof. 3", role: "Powered Medicine — Teaching Clinic",    bio: "Clinical and surgical practice. Runs the Teaching Clinic. Holds NHS consultant-equivalent status; the Clinic is the country's only specialist powered-medicine training site." },
    ],
    facilities: "The Teaching Clinic (operational facility treating powered patients), the Labs (biology, chemistry, physics — separate wings), the Research Wing (closed to undergraduates outside the Year 3 capstone).",
    classes: [
      { code: "SCI-101", year: "SOPHOMORE", kind: "required", title: "Foundations of Parahuman Biology",
        taughtBy: "Prof. 2",
        desc: "Year-one shared core. How human anatomy and physiology stretch, distort, and occasionally break to accommodate powered metabolism. Even the Combat kids take this. Especially the Combat kids." },
      { code: "SCI-102", year: "SOPHOMORE", kind: "required",    title: "Chemistry for the Powered Sciences",
        taughtBy: "Prof. 1",
        desc: "Powered biochem foundations. The quantitative spine the other departments complain about taking but no responsible science programme would survive without." },
      { code: "SCI-103", year: "SOPHOMORE", kind: "required",    title: "Mathematics for the Powered Sciences",
        taughtBy: "Prof. 1",
        desc: "Calculus and statistics applied to powered systems. Dose curves, ballistic models, kinetic scaling. The professor expects working knowledge by week three." },
      { code: "SCI-201", year: "SOPHOMORE", kind: "required",    title: "Powered Physiology & Operational Limits",
        taughtBy: "Prof. 2",
        desc: "Where powers actually live in the body. Cellular adaptations, energy budgets, the failure modes that come for everyone eventually. Diagnostic Wing supplies the case material." },
      { code: "SCI-202", year: "SOPHOMORE", kind: "specialism",  title: "Pharmacology & Dosing",
        taughtBy: "Prof. 2",
        desc: "Drug action on altered metabolisms. Standard pharmacology then everything that changes when the patient is not strictly standard. Required for anyone working in the Wing." },
      { code: "SCI-203", year: "SOPHOMORE", kind: "specialism",  title: "Applied Physics for Powered Practitioners",
        taughtBy: "Prof. 1",
        desc: "Forces, fields, thermodynamics under power-induced stress. The class for people who want to build, study, or contain powered phenomena — and the class engineers steal from." },
      { code: "SCI-301", year: "JUNIOR", kind: "specialism",  title: "Trauma Medicine & Powered Anatomy",
        taughtBy: "Prof. 3",
        desc: "Clinical specialism. Trauma response at the powered scale. Live case rotations in the Teaching Clinic; you see your first real powered casualty before week four." },
      { code: "SCI-302", year: "JUNIOR", kind: "specialism",  title: "Surgical Practice on Powered Patients",
        taughtBy: "Prof. 3",
        desc: "Surgical specialism. The country's only training site. Direct supervision by the consultant who holds the chair. Senior students assist on live cases by term end." },
      { code: "SCI-303", year: "SENIOR", kind: "specialism",  title: "Powered Research Methods",
        taughtBy: "HoD",
        desc: "Capstone for research-track students. Original investigative work; some senior projects get classified before they get graded." },
    ],
  },

  /* ─────────────────────────────────────────────────────────────────
     4 · ENGINEERING  (HoD: OPEN per canon — Switchboards stays in
     Support Staff as Diagnostic Wing Director, not teaching faculty)
     ───────────────────────────────────────────────────────────────── */
  {
    id: "engineering",
    name: "Engineering",
    code: "ENG",
    color: "#1e40af",
    blurb: "Builds, maintains, and runs everything on campus that isn't a person. The kitchens, the grounds, the cleaning crew, the boiler rooms, the training-hall maintenance, the security shutters — all of it runs on bots designed, built, and serviced by Engineering. There are no human kitchen staff and no human caretakers at Calderyn.",
    head: {
      role: "Head of Engineering",
      bio: "Senior systems engineer with infrastructure-scale background. The seat the institution treats as quietly load-bearing.",
    },
    staff: [
      { slot: "Prof. 1", role: "Robotics & Autonomous Systems",   bio: "Runs the design pipeline for kitchen and maintenance units. The kitchens you eat from this term were her work." },
      { slot: "Prof. 2", role: "Personal Kit & Gadget Design",    bio: "Smaller-scale: what an individual operative carries, wears, or deploys. Most Engineering students who aren't going into infrastructure end up under him." },
      { slot: "Prof. 3", role: "Facility Systems & Infrastructure", bio: "Buildings, power, security, integration. Works directly on the campus's underlying systems." },
    ],
    instructional: [
      { role: "Workshop Technician" },
      { role: "Workshop Technician" },
      { role: "Bot Bay Technician" },
    ],
    facilities: "The Workshops (multiple), the Bot Bays (kitchen, maintenance, security units serviced and trained here), the Infrastructure Spine (a physical corridor running the length of the campus housing the systems the department runs).",
    classes: [
      { code: "ENG-101", year: "SOPHOMORE", kind: "required",    title: "Foundations of Powered Engineering",
        taughtBy: "Prof. 1",
        desc: "Year-two entry module. Materials, tolerances, the physics of gear built to take power-induced stress without coming apart in the user's hand." },
      { code: "ENG-102", year: "SOPHOMORE", kind: "required",    title: "Workshop Practice & Safety",
        taughtBy: "Prof. 2",
        desc: "Hands-on workshop training. Tools, fabrication basics, the unwritten rules of a shop where the equipment is sometimes powered. First-aid is on the syllabus." },
      { code: "ENG-201", year: "SOPHOMORE", kind: "specialism",  title: "Autonomous Systems",
        taughtBy: "Prof. 1",
        desc: "Robotics and autonomous design. The kitchen units, the maintenance bots, the security shutters — all designed under this seat. Students service the live fleet by term end." },
      { code: "ENG-202", year: "SOPHOMORE", kind: "specialism",  title: "Personal Kit Design",
        taughtBy: "Prof. 2",
        desc: "What an individual operative carries, wears, or deploys. Most Engineering graduates who aren't going into infrastructure end up here." },
      { code: "ENG-203", year: "SOPHOMORE", kind: "specialism",  title: "Infrastructure Systems",
        taughtBy: "Prof. 3",
        desc: "Buildings, power, security, integration. The systems that run the campus. Senior placements rotate through the Infrastructure Spine alongside the professor." },
      { code: "ENG-301", year: "JUNIOR", kind: "specialism",  title: "Containment Tech & Hardened Systems",
        taughtBy: "Prof. 3",
        desc: "How to build environments that hold powered persons reliably and safely. Cross-listed informally with Combat — the Containment Range was largely designed by this seat's predecessors." },
      { code: "ENG-302", year: "JUNIOR", kind: "specialism",  title: "Field Repair & Improvisation",
        taughtBy: "Prof. 2",
        desc: "Operational repair under live conditions. Building what you need with what you have. The professor's anecdotes are not in the syllabus; the techniques are." },
      { code: "ENG-303", year: "SENIOR", kind: "specialism",  title: "Project Capstone",
        taughtBy: "HoD",
        desc: "Senior project. Design and build something a working operative would actually use. Best projects get adopted into the campus's actual infrastructure." },
    ],
  },

  /* ─────────────────────────────────────────────────────────────────
     5 · HISTORY & DOCTRINE  (HoD: open, longest-serving head on
     paper, sits to Devika's right at Heads' Table)
     ───────────────────────────────────────────────────────────────── */
  {
    id: "history-doctrine",
    name: "History & Doctrine",
    code: "HIS",
    color: "#8a3a8a",
    blurb: "The department that holds the institutional argument with itself. The Doctrine, ethics, law, comparative powered politics. The void at the centre is exactly the point: the curriculum teaches around the question of where the powered population originally came from, and a careful student notices the gap.",
    head: {
      role: "Head of History & Doctrine",
      bio: "Institutional historian, longest-serving head on faculty. Sits to Devika's right at Heads' Table. Has held the post longer than any of his colleagues have held theirs combined.",
    },
    staff: [
      { slot: "Prof. 1", role: "The Calderyn Doctrine, 1948–Present",                    bio: "Teaches the public version of the institution's history. Knows exactly what the public version omits, and teaches with that omission visible at the edges." },
      { slot: "Prof. 2", role: "Ethics, Restraint & the Philosophy of Non-Deployment",   bio: "The institution-specific ethics seat. Famously brutal modular assessments." },
      { slot: "Prof. 3", role: "Powered Persons, the State, STRATA & the Pipeline",      bio: "The law/regulation seat. Handles statutory frameworks, the pipeline, Met liaison, and the architecture of the regulatory monopoly." },
    ],
    facilities: "The Reading Room (open to students), the Closed Archive (not — though everyone knows it's there).",
    classes: [
      { code: "CAL-101", year: "SOPHOMORE", kind: "required", title: "Introduction to Calderyn",
        taughtBy: "Prof. 1",
        desc: "Year-one shared core. The institution, its remit, its public history. The first reading list is mandatory. The second reading list is implied." },
      { code: "HIS-101", year: "FRESHMAN", kind: "shared-core", title: "The Calderyn Doctrine, 1948–Present",
        taughtBy: "Prof. 1",
        desc: "Year-one shared core. The public version of the institution's history. The professor teaches with the omissions visible at the edges; a careful student notices what is missing." },
      { code: "HIS-102", year: "SOPHOMORE", kind: "required",    title: "Foundations of Powered Law",
        taughtBy: "Prof. 3",
        desc: "Statutory framework. Geneva, the Powered Persons Acts, the architecture of the regulatory monopoly that produced STRATA." },
      { code: "HIS-201", year: "SOPHOMORE", kind: "required",    title: "Ethics of Restraint",
        taughtBy: "Prof. 2",
        desc: "Calderyn-specific applied ethics. The institutional case for non-deployment, the philosophy that holds the Doctrine together, the assessments famous for being brutal. Absorbs the foundation ethics work no Calderyn graduate is allowed to skip." },
      { code: "HIS-202", year: "SOPHOMORE", kind: "specialism",  title: "Powered Persons & the State",
        taughtBy: "Prof. 3",
        desc: "The political dimension of regulation. How parliamentary scrutiny, the Met, and STRATA actually interact. Statutory hearings, oversight committees, the votes that have shaped the powered sector since 1948." },
      { code: "HIS-203", year: "SOPHOMORE", kind: "specialism",  title: "STRATA: Structure and Mandate",
        taughtBy: "Prof. 3",
        desc: "The institution that owns the pipeline. Corporate structure, executive lines, the contracts your future depends on. The professor brought receipts from his last consultancy." },
      { code: "HIS-301", year: "JUNIOR", kind: "specialism",  title: "STRATA & the Pipeline",
        taughtBy: "Prof. 3",
        desc: "Specialism. The mechanics by which Calderyn fills STRATA's roster, the conditions of the relationship, the politics of being its training arm. Reading list is small and dense." },
      { code: "HIS-302", year: "JUNIOR", kind: "specialism",  title: "Comparative Powered Histories",
        taughtBy: "Prof. 1",
        desc: "Powered governance abroad. Comparative case studies — what other states do, what they don't, where Britain stands relative to them." },
      { code: "HIS-303", year: "SENIOR", kind: "specialism",  title: "Doctrine in Practice",
        taughtBy: "HoD",
        desc: "Senior seminar. Selected guests from STRATA and the Vanguard attend; some sessions are recorded, some are not. Attendance is by invitation from the professor." },
    ],
  },

  /* ─────────────────────────────────────────────────────────────────
     6 · ATHLETICS  (HoD: open. Distinct from Combat — body as
     long-term instrument, not weapon. Runs houses + Powerball.)
     ───────────────────────────────────────────────────────────────── */
  {
    id: "athletics",
    name: "Athletics",
    code: "ATH",
    color: "#15803d",
    blurb: "The body as long-term instrument. Distinct from Combat: Combat is engagement, Athletics is conditioning, movement, endurance, recovery. Less institutional, more coaching culture. Runs the house system, Powerball, and the inter-house calendar.",
    head: {
      role: "Head of Athletics",
      bio: "Competitive background, former record-holder in powered athletics. Treats the office like a locker room and the corridor outside it accordingly.",
    },
    staff: [
      { slot: "Prof. 1", role: "Foundations of Conditioning & Endurance",          bio: "Where every student starts. The professor is unromantic about the body and very fond of statistics." },
      { slot: "Prof. 2", role: "Power-Augmented Athletics & Limit Testing",         bio: "Designs Powerball each year. Has strong opinions about which house should win and is meant to keep them to herself." },
      { slot: "Prof. 3", role: "Sports Medicine, Injury Management & Recovery",     bio: "Works closely with the Sciences Teaching Clinic; the two faculties share cases weekly." },
    ],
    instructional: [
      { role: "House Trainer · Valaris" },
      { role: "House Trainer · Saberis" },
      { role: "House Trainer · Orenne" },
      { role: "House Trainer · Grimere" },
    ],
    facilities: "The Conditioning Hall (the legendary inter-house records live on the wall here — the Valaris–Saberis bench-press record that's stood for nine years), the Powerball Arena, four house training rooms.",
    classes: [
      { code: "ATH-102", year: "SOPHOMORE", kind: "required", title: "Movement & Powered Form",
        taughtBy: "Prof. 1",
        desc: "Year-one shared core. Baseline conditioning, movement, the body before specialisation. Every student takes this regardless of designation or intended department." },
      { code: "ATH-101", year: "SOPHOMORE", kind: "required",    title: "Foundations of Conditioning",
        taughtBy: "Prof. 1",
        desc: "Year-two entry module for the department. Conditioning, endurance, recovery science. Treats the powered body as a long-term instrument rather than a short-term weapon." },
      { code: "ATH-201", year: "SOPHOMORE", kind: "specialism",  title: "Power-Augmented Athletics",
        taughtBy: "Prof. 2",
        desc: "Limit testing, output scaling, the boundary between training hard and breaking yourself. The professor designs Powerball each year and has opinions about which house should win." },
      { code: "ATH-202", year: "SOPHOMORE", kind: "specialism",  title: "Sports Medicine & Recovery",
        taughtBy: "Prof. 3",
        desc: "Injury management, rehabilitation, the medicine of long careers. Shares case material with the Sciences Teaching Clinic; the two faculties meet weekly." },
      { code: "ATH-203", year: "SOPHOMORE", kind: "specialism",  title: "Tactical Athletics",
        taughtBy: "Prof. 2",
        desc: "Cross-listed with Combat. Movement under operational conditions — speed, agility, escape, pursuit. Where the body meets the engagement." },
      { code: "ATH-301", year: "JUNIOR", kind: "specialism",  title: "Competitive Practice",
        taughtBy: "HoD",
        desc: "Inter-house competition framework. The professor runs the calendar; students run on the days he sets. Track records on the Conditioning Hall wall date back to 1968." },
      { code: "ATH-302", year: "JUNIOR", kind: "specialism",  title: "Long Career Practice",
        taughtBy: "Prof. 3",
        desc: "How to operate, fight, and present for two decades without destroying yourself. The class retired operatives wish they had taken when they had it." },
      { code: "ATH-303", year: "SENIOR", kind: "specialism",  title: "Powerball Officiating",
        taughtBy: "Prof. 2",
        desc: "Rules, calls, controversies. Graduates of this seminar referee at exhibition meets. The professor's standards are explicit and unforgiving." },
    ],
  },

  /* ─────────────────────────────────────────────────────────────────
     7 · HUMANITIES  (HoD: open. The only head with no security
     clearance — institutionally significant.)
     ───────────────────────────────────────────────────────────────── */
  {
    id: "humanities",
    name: "Humanities",
    code: "HUM",
    color: "#a85020",
    blurb: "Literature, philosophy, languages. The academic spine that isn't STEM. Smaller than Combat or Sciences. Taught by faculty with serious academic reputations rather than operational ones.",
    head: {
      role: "Head of Humanities",
      bio: "Senior humanities academic, no operational background. The only head who's never held a Vanguard or STRATA position — at Heads' Table she is the only voice with no security clearance, which means a small but real category of conversations doesn't happen in her presence.",
    },
    staff: [
      { slot: "Prof. 1", role: "English Literature & Writing",     bio: "Specialism in 20th-century British literature, with a particular interest in the post-1948 corpus and its powered subtexts." },
      { slot: "Prof. 2", role: "Philosophy",                       bio: "General moral philosophy. Teaches the canon (Aristotle, Kant, Mill) and modern applied ethics. Distinct from History & Doctrine's Calderyn-specific ethics." },
      { slot: "Prof. 3", role: "Modern Languages",                 bio: "Foundation course plus a rotating specialism. French and Russian most years; Mandarin when staffing allows." },
    ],
    facilities: "The Library (the only one open to all students; Engineering bots reshelve overnight), the Seminar Rooms.",
    classes: [
      { code: "HUM-101", year: "SOPHOMORE", kind: "required", title: "Foundations of Literary Analysis",
        taughtBy: "Prof. 1",
        desc: "Year-one shared core. Close reading, argument, the apparatus of academic writing. Even the Combat kids take English; especially the Combat kids." },
      { code: "HUM-102", year: "SOPHOMORE", kind: "required",    title: "Foundations of Philosophy",
        taughtBy: "Prof. 2",
        desc: "The canon. Aristotle through Mill, then a brief and bracing application to powered contemporary problems. The professor's reading list runs to two pages." },
      { code: "HUM-103", year: "SOPHOMORE", kind: "required",    title: "Foundations of Modern Languages",
        taughtBy: "Prof. 3",
        desc: "Entry-level language work. The rotating specialism varies by staffing — French and Russian most years, Mandarin when the budget allows." },
      { code: "HUM-201", year: "SOPHOMORE", kind: "specialism",  title: "Writing for Powered Practitioners",
        taughtBy: "Prof. 1",
        desc: "Report craft. Statement-writing. Every other department leans on this module by spring. The Press Suite owes its survival to graduates of this seat." },
      { code: "HUM-202", year: "SOPHOMORE", kind: "specialism",  title: "Moral Philosophy",
        taughtBy: "Prof. 2",
        desc: "General applied ethics. Distinct from History & Doctrine's Calderyn-specific module — this is the broader canon and the wider tradition. Students take both. The contradictions are the point." },
      { code: "HUM-203", year: "SOPHOMORE", kind: "specialism",  title: "Languages · Specialism",
        taughtBy: "Prof. 3",
        desc: "Advanced language work in the rotating specialism. Field translation is the eventual goal; the professor's standards for fluency are unsentimental." },
      { code: "HUM-301", year: "JUNIOR", kind: "specialism",  title: "Powered Literature & the Public Imagination",
        taughtBy: "Prof. 1",
        desc: "Famously divisive seminar. The 20th-century corpus and what it did and didn't do with the powered population. The reading list is the assessment." },
      { code: "HUM-302", year: "JUNIOR", kind: "specialism",  title: "Applied Ethics",
        taughtBy: "Prof. 2",
        desc: "Senior applied ethics. Case-based, often drawing on real incidents. Joint sessions with History & Doctrine when the timetable allows; the two faculties disagree publicly and amicably." },
      { code: "HUM-303", year: "SENIOR", kind: "specialism",  title: "Translation & Field Communication",
        taughtBy: "Prof. 3",
        desc: "For students likely to operate internationally. The mechanics of working in a second language under operational pressure." },
    ],
  },

  /* ─────────────────────────────────────────────────────────────────
     8 · POLITICS & PUBLIC AFFAIRS  (HoD: open)
     ───────────────────────────────────────────────────────────────── */
  {
    id: "politics",
    name: "Politics & Public Affairs",
    code: "POL",
    color: "#54545c",
    blurb: "The social-sciences department. Politics, business, policy, economics — the disciplines that govern how powered persons actually operate inside the state and the market.",
    head: {
      role: "Head of Politics & Public Affairs",
      bio: "Senior policy academic or former parliamentary advisor, with prior STRATA committee work on record.",
    },
    staff: [
      { slot: "Prof. 1", role: "Political Theory & Government",          bio: "Powered affairs in parliament, comparative powered politics abroad, the political philosophy of having a powered minority population." },
      { slot: "Prof. 2", role: "Business & Management",                  bio: "The commercial dimension of a public-facing career: sponsorship, brand, contracting, liability. Disproportionately important for hero-designation students." },
      { slot: "Prof. 3", role: "Public Policy & Economics",              bio: "Including the political economy of the pipeline. Disproportionately important for sidekick-designation students moving into post-field admin and committee work." },
    ],
    facilities: "The Committee Room (a working facsimile of an actual parliamentary committee room, used for moot hearings), the Strategy Suite (war-game space for political and commercial scenarios).",
    classes: [
      { code: "POL-101", year: "SOPHOMORE", kind: "required",    title: "Foundations of Powered Politics",
        taughtBy: "Prof. 1",
        desc: "Year-two entry module. Political theory applied to the powered sector. Parliamentary process, the architecture of regulation, the long argument over how to govern a powered minority." },
      { code: "POL-102", year: "SOPHOMORE", kind: "required",    title: "Foundations of Business & Management",
        taughtBy: "Prof. 2",
        desc: "Year-two entry module. Commercial fundamentals for a public-facing career. The professor has the longest CV of operational consultancy on faculty." },
      { code: "POL-201", year: "SOPHOMORE", kind: "specialism",  title: "Comparative Powered Government",
        taughtBy: "Prof. 1",
        desc: "Other states, other regimes. How parliamentary democracies, party autocracies, and unaffiliated jurisdictions handle the powered population. The professor's annotated map covers the back wall of the Strategy Suite." },
      { code: "POL-202", year: "SOPHOMORE", kind: "specialism",  title: "Sponsorship, Profile & Commercial Practice",
        taughtBy: "Prof. 2",
        desc: "Disproportionately important for hero-designation students. Sponsorship structure, brand management, the commercial liability of a career under contract." },
      { code: "POL-203", year: "SOPHOMORE", kind: "specialism",  title: "Public Policy & the Powered Sector",
        taughtBy: "Prof. 3",
        desc: "The political economy of the pipeline. Disproportionately important for sidekick-designation students moving into post-field admin or committee work." },
      { code: "POL-301", year: "JUNIOR", kind: "specialism",  title: "Parliamentary Practice & Committee Work",
        taughtBy: "Prof. 1",
        desc: "Senior specialism. The Committee Room is a working facsimile of an actual parliamentary committee room; the moot hearings are not abstract." },
      { code: "POL-302", year: "JUNIOR", kind: "specialism",  title: "International Powered Affairs",
        taughtBy: "Prof. 1",
        desc: "Treaty work, diplomacy, the operational architecture of powered persons abroad. Geneva is on the syllabus; so are the conversations Geneva pretends to settle." },
      { code: "POL-303", year: "SENIOR", kind: "specialism",  title: "Capstone Policy Project",
        taughtBy: "HoD",
        desc: "Senior policy capstone. Original work, briefed to a panel that includes a STRATA observer and, in some years, a serving committee member." },
    ],
  },
],

/* ═══════════════════════════════════════════════════════════════════════
   DESIGNATION MODULES (HRO- / SDK-)
   Year-by-year specialist track for Heroes / Sidekicks designations.
   Not attached to a department. Designation is assigned by faculty at
   the end of Freshman Orientation based on power profile + STRATA
   preliminary assessment.
═══════════════════════════════════════════════════════════════════════ */
designationModules: [
  { code: "HRO-101", year: "FRESHMAN", designation: "hero",     title: "Foundations of Lead Practice",
    desc: "Year-one designation module. What the lead designation actually means, before you've earned the right to it. The class is small; the assessment is harder than the syllabus suggests." },
  { code: "HRO-201", year: "SOPHOMORE", designation: "hero",     title: "Profile, Burden, and the Public Eye",
    desc: "Year-two designation module. The cost of being seen. Notoriously honest about the asymmetry — the institution officially treats Hero and Sidekick as equal-but-different. The institution officially knows this is not true." },
  { code: "HRO-301", year: "JUNIOR", designation: "hero",     title: "The Lead Calculation",
    desc: "Year-three designation module. The decisions that cannot be delegated. Some sessions are closed to faculty outside the seat. The transcripts follow you into your contract negotiation." },
  { code: "SDK-101", year: "FRESHMAN", designation: "sidekick", title: "Foundations of Support Practice",
    desc: "Year-one designation module. Support doctrine. Why a lead without a support fails earlier and more publicly than they expect." },
  { code: "SDK-201", year: "SOPHOMORE", designation: "sidekick", title: "Coordination Under Lead Authority",
    desc: "Year-two designation module. The cost of not being seen. Notoriously honest about the asymmetry — the institution officially treats Hero and Sidekick as equal-but-different. The institution officially knows this is not true." },
  { code: "SDK-301", year: "JUNIOR", designation: "sidekick", title: "The Sidekick's Calculation",
    desc: "Year-three designation module. The decisions that have to be made silently. Some of the most senior STRATA handlers came out of this seat." },
],

/* ═══════════════════════════════════════════════════════════════════════
   SHARED CORE — Y1 modules that don't sit under a department
═══════════════════════════════════════════════════════════════════════ */
sharedCoreExtra: [
  { code: "TUT-101", year: "FRESHMAN", kind: "shared-core", title: "Tutorial",
    taughtBy: "Assigned Tutor",
    desc: "Small-group tutorial system. Each student is assigned a tutor at the start of Year 1; the tutor stays with the student through all three years. Pastoral, academic-progress, and the first place a problem surfaces before it becomes one." },
],

strata: [
  {
    section: "CORPORATE — EXECUTIVE",
    note: "STRATA International. The school's owner. Chair Silas Strathe (78) and CEO Felix Strathe (53) are public figures and answer to no one outside the family. Other senior identities are classified at Level 4+.",
    rows: [
      { role: "Chair", char: "Silas Strathe", npc: true },
      { role: "Chief Executive", char: "Felix Strathe", npc: true },
      { role: "Board Member" },
      { role: "Board Member" },
      { role: "Legal Director" },
      { role: "Chief Science Officer", clf: true },
    ],
  },
  {
    section: "FIELD — HANDLERS & AGENTS",
    rows: [
      { role: "Senior Handler" },
      { role: "Handler — Campus Embedded" },
      { role: "Handler — Campus Embedded" },
      { role: "Field Agent" },
      { role: "Field Agent" },
    ],
  },
  {
    section: "PR & INTELLIGENCE",
    rows: [
      { role: "PR Director" },
      { role: "Senior Analyst" },
      { role: "Media Liaison" },
      { role: "Intelligence Operative" },
    ],
  },
],

outside: [
  {
    section: "GOVERNMENT & CIVIC",
    note: "Elected officials, mayoral staff, regulators, public servants who interface with STRATA.",
    orgs: [
      {
        name: "Royal Borough of Greenwich",
        type: "Local Council",
        note: "The Royal Borough's elected leadership and senior staff. Negotiates the STRATA municipal contract and answers to the Mayor of London on incidents that cross borough lines.",
        roles: [
          { role: "Council Leader",     char: "Anton Oakridge", npc: true },
          { role: "Mayor (Ceremonial)", char: "Lynda Byrd",     npc: true },
          { role: "Chief Executive" },
          { role: "Press Officer" },
        ],
      },
      {
        name: "Borough Council",
        type: "Elected Members",
        note: "Fifty-one elected councillors across seventeen wards. Approves the STRATA contract every four years and complains about it the rest of the time.",
        roles: [
          { role: "Cabinet Member" },
          { role: "Cabinet Member" },
          { role: "Backbench Councillor" },
        ],
      },
      {
        name: "Oversight Office",
        type: "Powered-Activity Regulator",
        note: "Borough-level body that files paperwork, reads incident reports, and has subpoena authority on STRATA but rarely uses it. Reports to the Greater London Authority on serious matters.",
        roles: [
          { role: "Director" },
          { role: "Lead Regulator" },
          { role: "Civic Liaison" },
        ],
      },
    ],
  },
  {
    section: "LAW ENFORCEMENT",
    note: "Police, federal agents, investigators handling powered-incident cases.",
    orgs: [
      {
        name: "Greenwich Borough Met",
        type: "Local Police Borough",
        note: "Greenwich's Metropolitan Police borough command. Files everything that's NOT explicitly a STRATA matter, which depending on the week is either everything or nothing.",
        roles: [
          { role: "Borough Commander" },
          { role: "Detective Inspector" },
          { role: "Detective Sergeant" },
          { role: "Constable" },
        ],
      },
      {
        name: "Met Specialist Unit",
        type: "Powered-Crimes Division",
        note: "Metropolitan Police division handling cross-borough powered crime. Permanent friction with STRATA over jurisdiction.",
        roles: [
          { role: "Detective Chief Inspector" },
          { role: "Detective Inspector" },
          { role: "Forensic Analyst" },
        ],
      },
    ],
  },
  {
    section: "PRESS & MEDIA",
    note: "Reporters, broadcasters, freelance journalists. Some of them know more than they should.",
    orgs: [
      {
        name: "The Daily Crown",
        type: "London Newspaper",
        note: "London's broadsheet of record, with its newsroom in Canary Wharf. Print and digital. STRATA holds an executive seat on its editorial board, which the staff resent and route around.",
        roles: [
          { role: "Editor-in-Chief" },
          { role: "Investigative Reporter" },
          { role: "STRATA Beat Reporter" },
          { role: "Powerball Beat Reporter" },
        ],
      },
      {
        name: "Channel 4 — South-East London",
        type: "Local News Bureau",
        note: "Channel 4's regional bureau, broadcast out of a converted warehouse in Deptford. Goes hard on STRATA press conferences and harder on the human-interest segments.",
        roles: [
          { role: "Anchor" },
          { role: "Field Reporter" },
          { role: "Camera Operator" },
        ],
      },
      {
        name: "Independent Press",
        type: "Freelance & Substack",
        note: "Self-published reporters and photographers. Lower readership, fewer constraints.",
        roles: [
          { role: "Freelance Investigator" },
          { role: "Freelance Photographer" },
          { role: "Substack Columnist" },
        ],
      },
    ],
  },
  {
    section: "MEDICAL & EMERGENCY",
    note: "Hospital staff, EMTs, fire and rescue. People who clean up after STRATA.",
    orgs: [
      {
        name: "Greenwich General",
        type: "Teaching Hospital",
        note: "Main trauma centre, on the river road past the Cutty Sark. Has a dedicated Powered-Injury Wing on the third floor that no civilian patient ever sees.",
        roles: [
          { role: "Chief of Medicine" },
          { role: "ER Physician" },
          { role: "Trauma Nurse" },
          { role: "Powered-Injury Specialist" },
        ],
      },
      {
        name: "Greenwich Fire & Rescue",
        type: "Emergency Services",
        note: "Fire, rescue, ambulance. First on scene at every powered-incident call.",
        roles: [
          { role: "Fire Captain" },
          { role: "Paramedic" },
          { role: "EMT" },
        ],
      },
    ],
  },
  {
    section: "INDEPENDENT OPERATORS",
    note: "Private investigators, freelance consultants, contractors-for-hire.",
    orgs: [
      {
        name: "Vesper & Associates",
        type: "Private Investigation Firm",
        note: "Boutique PI shop. Specialises in cases STRATA won't touch and the police can't.",
        roles: [
          { role: "Senior Investigator" },
          { role: "Investigator" },
        ],
      },
      {
        name: "Independent Consultants",
        type: "Freelance Pool",
        note: "Solo operators with niche expertise. No firm, no overhead, no oversight.",
        roles: [
          {
            role: "Tracking Specialist",
            char: "Eirik Aslund / BLÓÐHUNDR",
            power: "Sensory Adaptation · Hyper-Predatory Perception",
            expression: "Eirik's power expresses through extreme sensory adaptation and subconscious biological analysis rather than overt supernatural effects. His nervous system continuously processes environmental stimuli at an inhuman level, allowing him to identify microscopic disturbances in scent, heat, sound, movement, and behavior patterns almost instantly. When active, his focus becomes visibly intense and unnervingly still. His pupils subtly sharpen, his breathing slows, and he often tilts his head slightly while isolating specific stimuli from surrounding noise. He can track individuals through residual heat, adrenaline traces, blood particles, sweat composition, disturbed airflow, gait patterns, and micro-expressions. In combat, Hyper-Predatory Perception allows him to anticipate movement by reading involuntary muscle tension, weight distribution, breathing changes, and eye movement before actions occur, making his reactions appear nearly precognitive.",
            drawbacks: "Eirik's sensory processing cannot fully \"shut off,\" forcing his brain to constantly absorb environmental information. Crowded or overstimulating areas with excessive noise, movement, strong odors, or emotional stress signals can overwhelm his nervous system, causing migraines, nausea, disorientation, irritability, and severe fatigue. Heavy smoke, industrial chemicals, biological contamination, or deliberately overwhelming scent sources can interfere with his tracking abilities and make target isolation significantly harder. His heightened perception also creates emotional and psychological strain. He unconsciously notices fear, stress, dishonesty, attraction, and hesitation in others, making normal social interaction exhausting and isolating. Because his brain remains hyper-alert even at rest, Eirik suffers from chronic insomnia, hypervigilance, and difficulty fully recovering physically or mentally after prolonged tracking or combat.",
            link: "https://roleplay.chat/profile.php?user=blodhundr",
          },
          { role: "Powered-Threat Consultant" },
          { role: "Contract Investigator" },
          { role: "Security Specialist" },
        ],
      },
    ],
  },
  {
    section: "UNDERWORLD",
    note: "Criminal enterprises, fixers, fences. The ecosystem powered crime feeds into.",
    orgs: [
      {
        name: "The Marlowe Family",
        type: "Organised Crime Syndicate",
        note: "Old money, old methods. Three generations deep. Don't accept new initiates from outside the family unless STRATA is involved.",
        roles: [
          {
            role: "Leader",
            char: "August Marlowe",
            power: "Pyrokenisis",
            expression: "Hellfire Pyrokinesis\n\"The flame does not forgive.\"\nAugust generates and controls a supernatural form of combustion known as Hellfire — a violet-black flame with properties similar to white phosphorus. Once ignited, the fire clings aggressively to surfaces, spreads unnaturally, and resists conventional extinguishing methods. Unlike ordinary fire, his flames appear semi-sentient at higher output, reacting to his emotional state and destructive impulses. His hellfire can: melt metal, ignite damp environments, spread across walls and ceilings, persist long after combat ends, scar victims permanently. The flames become strongest during moments of rage, humiliation, possessiveness, or grief.",
            drawbacks: "Emotional Combustion\n\"The fire listens too closely.\"\nAugust's hellfire is deeply linked to his emotional state. Strong feelings — especially rage, humiliation, grief, jealousy, or possessiveness — dramatically increase both the intensity and instability of his powers. The more emotional he becomes: the harder precise control becomes, the more aggressively hellfire spreads, the more autonomous the hellhounds behave, the more collateral damage occurs. At lower levels, this simply makes him more dangerous. At higher levels, it risks turning him into a catastrophe. This means psychologically provoking him can actually destabilize his combat efficiency, even if it increases raw destructive output.",
            link: "https://roleplay.chat/profile.php?user=Hellson",
          },
          { role: "Boss" },
          { role: "Underboss" },
          { role: "Capo" },
          { role: "Soldier" },
        ],
      },
      {
        name: "The Iron Hand",
        type: "Powered Crew",
        note: "Newer crew, all powered, all unsanctioned. STRATA hasn't decided whether to recruit them or burn them down.",
        roles: [
          { role: "Crew Leader" },
          { role: "Operator" },
          { role: "Operator" },
        ],
      },
      {
        name: "Independent Fixers",
        type: "Solo Operators",
        note: "Brokers who connect powered freelancers with paying clients. No loyalty beyond the next payment.",
        roles: [
          { role: "Fixer" },
          { role: "Fence" },
          { role: "Fence" },
        ],
      },
    ],
  },
  {
    section: "PROFESSIONAL POWERBALL",
    note: "PBL teams, the league above college. Players move between teams across their career — same character may appear on multiple rosters over time.",
    orgs: [
      {
        name: "Berlin Bolts",
        type: "PBL Team",
        note: "Defending champions. Aggressive offence, polished media presence, deepest sponsor bench in the league.",
        roles: [
          { role: "Captain" },
          { role: "Playmaker" },
          { role: "Attack" }, { role: "Attack" },
          { role: "Defence" }, { role: "Defence" },
          { role: "Goalkeeper" },
        ],
      },
      {
        name: "Tokyo Storm",
        type: "PBL Team",
        note: "Defensive specialists. Lowest goals-conceded in the league three years running. Fans call them \"the wall.\"",
        roles: [
          { role: "Captain" },
          { role: "Playmaker" },
          { role: "Attack" }, { role: "Attack" },
          { role: "Defence" }, { role: "Defence" },
          { role: "Goalkeeper" },
        ],
      },
      {
        name: "Madrid Crown",
        type: "PBL Team",
        note: "Old franchise, recently reorganised. Heavy investment from Vanguard alumni. Currently rebuilding.",
        roles: [
          { role: "Captain" },
          { role: "Playmaker" },
          { role: "Attack" }, { role: "Attack" },
          { role: "Defence" }, { role: "Defence" },
          { role: "Goalkeeper" },
        ],
      },
      {
        name: "Free Agents & Retired",
        type: "Out of Contract",
        note: "Players between contracts, draft hopefuls awaiting placement, retired veterans returning to the city. Available for assignment.",
        roles: [
          { role: "Free Agent" }, { role: "Free Agent" },
          { role: "Draft Hopeful" }, { role: "Draft Hopeful" },
          { role: "Retired Pro" }, { role: "Retired Pro" },
        ],
      },
    ],
  },
  {
    section: "LOCAL BUSINESS & TRADE",
    note: "Cafés, bars, restaurants, shops — the civilian fabric of the city. One character may own or work at multiple establishments.",
    orgs: [
      {
        name: "STRATA Burger",
        type: "Fast Food Chain",
        note: "STRATA's flagship fast-food brand. Locations on Trafalgar Road, by the Cutty Sark, and across the river at Canary Wharf. The corporate sponsor reaches everywhere, including lunch.",
        roles: [
          { role: "Franchise Manager" },
          { role: "Shift Lead" },
          { role: "Crew Member" }, { role: "Crew Member" },
        ],
      },
      {
        name: "The Iron Owl Café",
        type: "Café",
        note: "On a side street between Greenwich Market and the campus gate. Open late. Notoriously the only place to study where Calderyn students don't run into faculty.",
        roles: [
          { role: "Owner" },
          { role: "Manager" },
          { role: "Barista" }, { role: "Barista" },
        ],
      },
      {
        name: "Mira's",
        type: "Greasy Spoon",
        note: "Twenty-four-hour caff just off Greenwich Market. Cheap fry-ups. Students after exams, coppers after shifts, journalists after deadlines.",
        roles: [
          { role: "Owner" },
          { role: "Cook" },
          { role: "Server" }, { role: "Server" },
        ],
      },
      {
        name: "Arboleda",
        type: "Restaurant",
        note: "Upscale bistro overlooking Greenwich Park. Where STRATA executives take their meetings and where Vanguard alumni get spotted by paparazzi.",
        roles: [
          { role: "Head Chef" },
          { role: "Sous Chef" },
          { role: "Maître d'" },
          { role: "Server" },
        ],
      },
      {
        name: "Pulse",
        type: "Nightclub",
        note: "Two stops up the DLR by the O2. The nightclub everyone tells their parents they don't go to. STRATA contractors mix with Calderyn students; somehow nobody calls it in.",
        roles: [
          { role: "Owner" },
          { role: "Manager" },
          { role: "Bartender" }, { role: "Bartender" },
          { role: "Bouncer" },
        ],
      },
      {
        name: "Marrow & Tonic",
        type: "Pub",
        note: "Backstreet boozer between the campus and Maze Hill station. Doesn't card aggressively. Standing weekly tab for at least three Calderyn faculty.",
        roles: [
          { role: "Owner" },
          { role: "Bartender" }, { role: "Bartender" },
        ],
      },
      {
        name: "The 2/4 Circle",
        type: "Nightclub",
        note: "Intimate live-music venue tucked off Greenwich Market. Smaller and more atmospheric than Pulse — focused on vocal acts, jazz nights, and after-hours sets.",
        roles: [
          { role: "Manager" },
          { role: "Bartender" },
          { role: "Bouncer" },
          {
            role: "Nightclub Singer",
            char: "Briar Musgraves",
            power: "Resonant Aura Reading, Emotional Atmosphere Manipulation, Vocal Entrancement, Emotional Echoes",
            expression: "Resonant Aura Reading\nBriar perceives emotional resonance through sound, rhythm, vocal inflection, and atmosphere. Music sharpens this perception dramatically, especially live singing. Emotional states manifest to her as layered sensory impressions: tones, textures, temperatures, pressure shifts, phantom tastes, or distortions in sound. Crowds become emotional symphonies, while individuals feel like isolated instruments she can tune into with frightening precision.\n\nShe can sense: attraction, grief, fear, guilt, obsession, deception, emotional instability, desperation, suppressed anger, and emotional attachment. The stronger the emotion, the \"louder\" the resonance. Direct singing creates the clearest readings, particularly if eye contact or emotional focus is maintained.",
            expressionDoc: "https://docs.google.com/document/d/1PSqNwFZpLZTVDERTNYN-VJxPZxDOt1UgCZRB03r_ni4/edit?usp=sharing",
            drawbacks: "Emotional Overload, Difficulty Separating Her Emotions From Others, Silence Weakens Her, Emotional Blind Spots, Attachment Vulnerability, Hypervigilance & Control Issues, Physical Vulnerability",
            link: "https://roleplay.chat/profile.php?user=Reverie",
          },
        ],
      },
    ],
  },
],

powers: [
  {
    status: "vanguard",
    tier: "A",
    power: "Solar Metabolism · Limitless Endurance · Uncapped Strength · Flight · Heat Vision · Enhanced Senses",
    char: "Adrian Valaris",
    alias: "PARAGON",
    npc: true,
    expression: "The sun feeds him. Nothing measurable runs him down. His strength has no documented ceiling and his flight is officially uncatalogued because every piece of equipment that tries to clock him fails at full speed. Heat vision in coherent ranged beams, calibrated by something the medical wing has elected to call intent because no one has come up with a better word. His senses run well beyond baseline — he can pick a single conversation out of a crowded street from above, read a license plate at altitude, hear a heartbeat through a wall. Whether that's a separate ability or simply what comes with the rest of him, the medical wing has stopped trying to settle. In person: quiet, unfailingly polite, stands up when you walk into a room.",
    drawbacks: "Performance scales with sunlight; prolonged darkness, deep underground operations, or heavy cloud cover dampen output. Heat vision needs line of sight and a coherent ranged beam — useless around corners. Enhanced senses cut both ways: dense crowds, loud rooms, and overlapping conversations can become disorienting noise without conscious filtering.",
  },
  {
    status: "vanguard",
    tier: "A",
    power: "Precognition",
    char: "Caius Saberis",
    alias: "VIGIL",
    npc: true,
    expression: "A precognitive window ninety seconds wide and roughly thirty metres deep. He sees every branch of every possible action laid out around him with the clarity of sheet music — the bullet leaving the barrel, the door opening, the word leaving the mouth — and picks the branch he wants. The other branches collapse and are not. Fights with a folded-steel longsword Switchboard made him in 2018, which he has never named. Cost: migraines. Wrong twice in eleven years.",
    drawbacks: "Foresight window is roughly ninety seconds wide and thirty metres deep — beyond that range or timeframe he is blind. Sustained use produces migraines that can put him out of action for hours afterward. His record is twice wrong in eleven years; the branches he reads are probabilistic, not certain. No advantage against an opponent who acts without intent.",
  },
  {
    status: "vanguard",
    tier: "A",
    power: "Damage Resistance · Accelerated Healing · Flight · Super Strength",
    char: "Margery Orenne",
    alias: "AEGIS",
    npc: true,
    expression: "Her body does not break the way bodies break. Blades go in, bullets go in, but the damage does not propagate outward the way damage is supposed to. She bleeds, but the bleeding stops sooner than it ought. Heals six times faster than is decent. Cruises at three hundred miles an hour, holds position indefinitely, lifts roughly four hundred kilograms without breaking a sweat. Field-condition endurance record: fifty-one hours. She broke nine bones during it and did not notice until the third day.",
    drawbacks: "Damage doesn't propagate the way it should, but it still happens — she still bleeds, breaks, and feels it. Field record was fifty-one hours and nine broken bones unnoticed until day three, which the medical wing has flagged as a risk pattern, not a feature. Healing is six times faster than baseline, not instant; lifting cap sits around four hundred kilograms.",
  },
  {
    status: "vanguard",
    tier: "A",
    power: "Technokinesis",
    char: "Iris Grimere",
    alias: "SWITCHBOARD",
    npc: true,
    expression: "She speaks to electronics by thought, in a range that has no precise edge but seems to extend as far as she can perceive a device. She does not need to touch them. She does not need to see them. They listen. Not physically superhuman in any other respect — strength, durability, and reflexes are baseline human, and her health is, if anything, slightly under because she forgets to eat. Every piece of gear the Vanguard carries is hers: Vigil's sword, Aegis's flight harness, Paragon's gauntlets.",
    drawbacks: "Range is bounded by what she can perceive as a device; out of perception, out of reach. No physical augmentation — strength, durability, and reflexes are baseline human, and her health runs slightly under because she forgets to eat. Cannot interface with anything that isn't electronic. If she's incapacitated, every piece of Vanguard gear she's tuned goes silent.",
  },
  {
    status: "faculty",
    tier: "A",
    power: "Power Nullification",
    char: "Dr. Devika Ravindrakumar",
    alias: null,
    npc: true,
    expression: "Spherical fifteen-metre nullification field, manually toggled. Inside the field, registered abilities are completely suspended — the nullification does not distinguish between hostile and friendly, and includes her own. Sustained activation produces severe migraines; she rarely holds the field for more than ten minutes at a stretch. The Dean's primary tool for de-escalating campus crises and the reason she does not contract as an active hero.",
    drawbacks: "The nullification field is indiscriminate: it suspends every registered ability inside it, hostile or friendly, which makes it as much a hazard to allies as to opponents. Devika herself isn't immune — her own abilities don't switch off entirely, but inside the field she runs weaker and noticeably more vulnerable than her usual baseline. Sustained activation produces severe migraines; she rarely holds the field for more than ten minutes at a stretch. Range is fixed at a fifteen-metre sphere, manually toggled, no fine-grained targeting. The reason she does not contract as an active hero.",
  },
  {
    status: "faculty",
    tier: "A",
    power: "Oneiric Perception · Somnolent Illusion",
    char: "Eurydice Lovecraft",
    alias: "Dream",
    npc: false,
    link: "https://roleplay.chat/profile.php?user=dream",
    expression: "Lovecraft puts people to sleep. Not gently, not always, but consistently. A room she walks into goes quieter inside ten minutes if she wants it to. At surface level she settles panic, dims attention, eases someone over the edge of sleep without them noticing the push. At depth she builds dreamscapes around a single target or a small group. Full constructed rooms, corridors, conversations, stages a person walks through believing they are walking through anything else. The illusion bends what they see, what they hear, what they touch, what they feel emotionally, what they believe is happening in the moment. People come back from a Lovecraft dream sure they had a normal afternoon. Underneath that she runs a smaller kind of trick on the side. She calls it daydream tailoring and treats it like makeup. She can smooth a bruise off a student's face for a press appearance, soften the colour of tired eyes, slim the line of a jacket someone is still wearing, brighten or dim a person's complexion just enough that a camera reads them as someone slightly different. The work is surface only. It holds for as long as she is actively paying attention to it.",
    drawbacks: "The deep work costs her presence. While she is inside a constructed dreamscape with someone she stops being inside the room with her own body. Push her, hit her, take her keys, she will not notice until the dream lets go. The illusions need a thread of contact: skin to skin works best, sustained eye contact works for short range, sleeping in the same building works for the long version. Anyone trained to recognise dream logic can break out, and she teaches the resistance herself because she believes the people who have her in their lives should be able to refuse her. Heavy stimulants, adrenaline, and certain medications dampen her reach. The daydream tailoring is cheap in single use and expensive in volume. She cannot read minds. The dreams she builds are her imagination dressed for the target, not pulled out of their head.",
  },
  {
    status: "student",
    tier: "C",
    power: "Regurgitive storage, mucus armour, and belch sonics",
    char: "Montgomery Farthing III",
    alias: "Upchuck",
    expression: "Monty's ability currently manifests as a gross biological defence system. He can store small objects inside his body and regurgitate them later, coat himself in slippery mucus armour, and release short-range sonic belches that can disorient opponents. These powers are humiliating, messy, and unreliable, but useful for distraction, survival, smuggling, and support work.",
    drawbacks: "Monty's powers make him nauseous, weak, dehydrated, and physically disgusting to be around. His mucus can be dried, frozen, burned, or washed away. His belch sonics are short range and can affect allies. His storage has strict size limits and can injure him if he swallows anything sharp, toxic, or unstable.",
        note: "Monty's real ability has not properly activated because he has never killed another powered person. If he kills a supe, his body can absorb and permanently integrate aspects of their power. Until then, his body is misfiring, which is why his ability expresses as mucus, regurgitation, and stomach-pressure attacks.",
     link: "https://roleplay.chat/profile.php?user=upchuck",
  },
  {
    char: "Cesare Delgado",
    alias: "NANO",
    status: "student",
    tier: "A",
    power: "Technorganic Integration",
    expression: "A fused technorganic body — adaptive armour plating, an integrated arm-cannon, deployable shielding, mechanical limbs, short-burst thrusters, neural-interface tools, and active self-repair routines. He can read and command compatible electronics on contact and operates in tight coordination with BYTE's network support.",
    drawbacks: "Heavy use causes overheating, phantom pain, system strain, and mechanical lockups. EMPs and malware affect him directly because his cybernetics are part of his body. The arm-cannon overheats and can lock in cannon form. Full mechanical-limb deployment frightens onlookers. Shielding sacrifices mobility; thrusters cannot sustain flight. His organic systems still need rest, oxygen, pain management, and cooling cycles. Major repairs require parts, time, and specialist help. Deepest weakness: significant parts of him may be classified as experimental STRATA-linked medical technology, blurring the line between Cesare and the asset.",
    link: "https://roleplay.chat/profile.php?user=delgado"
  },
  {
    char: "Vecna Ravindrakumar",
    alias: "BYTE",
    status: "student",
    tier: "B",
    power: "Technopathic Intrusion",
    expression: "Mental interface with electronic systems within close range — reading device states, commanding compatible hardware, countering surveillance, and influencing environmental tech. Specialises in digital forensics: reconstructing deleted files, tracing comms, identifying tampering. Runs live systems support for NANO in the field. Operates Trojan, a small companion drone that acts as a mobile relay and extends her range and senses through it.",
    drawbacks: "Powerless in low-tech, shielded, or analog environments. Heavy intrusion causes sensory overstimulation, migraines, and nosebleeds; cascading networks can overload her if she pushes too hard. Processes commands literally, so unclear instructions to systems can produce dangerous results. Trojan is a single point of failure: if the drone is destroyed, jammed, or compromised, her effective range collapses, and a hostile actor with the right counter-tools could ride her connection back to her.",
    link: "https://roleplay.chat/profile.php?user=vecna"
  },
  {
    char: "Celestia \"Stella\" Starkov",
    alias: "Mirage",
    status: "student",
    tier: "A",
    power: "Mirage — Light Bending, Illusion Projection, Photon-Flight, Light Teleportation, & Weaponised Light",
    expression: "Stella manipulates visible light around her body in motion. The illusion side of her power throws false doubles, stages glamour disguises, weaves shimmer-fields and visual distortions, decoys her own movement, and drops her into short bursts of near-invisibility. The offensive side bends light into something that hits — concussive photo-flashes, blinding flares at point-blank, and focused coherent beams she can lance from her hands or kicks at range. She can also ride her own light: short bursts of photon-thrust flight that read as a streak of brilliance, useful for vertical recovery, gap-closing, and stage entrances more than long-haul travel. At higher output she folds that flight into true light teleportation — collapsing into a streak of brilliance and re-forming somewhere else in line of sight, leaving a trail of false Stellas in her wake that hold their pose for a beat before dissolving, so opponents can’t tell which silhouette is the real exit. The work is at its sharpest while she is moving — flipping, dancing, kicking, acting — where her gymnastics, Drama Club training, and taekwondo footwork weaponise misdirection. As Calderyn's founding cheer captain, with regular Drama Club lead roles since enrolling, she has built the timing, presence, and discipline to sell every illusion as the real thing while she sets up the actual hit.",
    drawbacks: "Her illusions are visual only — they cannot strike, hold, or block on their own, and they lose ground against darkness, smoke, heavy rain, thermal tracking, sound-based senses, scent tracking, and any opponent who refuses to trust their eyes. Her offensive light has a real cost — focused beams and concussive flashes bleed heat into her hands, arms, and eyes, leaving burns at high intensity, and a missed beam is a lit-up signal flare that gives her position away to anything looking. Photon-flight is short-range and short-duration — fine for a leap, a dodge, or a stage entrance, useless as long-haul transport, and it dumps light and heat in a way that defeats her own stealth the moment she uses it. Overuse of any branch triggers migraines, eye strain, nausea, vertigo, nosebleeds, and afterimages that make her own vision unreliable; pushed too hard she becomes the easiest target on the field. Her reputation is also a liability — people consistently underestimate her until she has already won, but the same image makes her a sponsorship target whose every move is recorded.",
    link: "https://roleplay.chat/profile.php?user=illuminate"
  },
  {
    status: "student",
    tier: "B",
    power: "Serpentine Physiology · Petrifying Gaze, Venom Command, Pheromone Trance, Hyperflexibility",
    char: "Valentina \"Tina\" Salvador",
    alias: "Serpentina",
    expression: "Gorgon-like serpentine mutation: faint pearlescent scales, vertical pupils when active, two living white serpents in her hair (nervous-system extensions, react to heat/scent/threat).\n\nPRIMARY — Petrifying Gaze: direct eye contact triggers temporary calcifying paralysis. Stiffness, numbness, slowed reactions, pale stone-like skin. Glance = hesitation; sustained = full immobilisation. Temporary mineralised stasis, NOT permanent stone.\n\nSECONDARY — Pheromone Trance: subtle close-range pheromones don't control alone, but make targets fixate on her voice/scent/eyes — drowsy, fascinated, compliant. Sets up the gaze.\n\nTERTIARY — Venom Command: a hair-serpent bite injects venom that creates a temporary obedience state. Numbness, dulled emotion, heightened suggestibility. Target follows simple spoken commands (stop, drop it, stay quiet). NOT full puppetry, NOT mind-rewrite.\n\nPHYSICAL — Snake-like flexibility, balance, and recovery. Effective evasive support fighter and cheer flyer.",
    drawbacks: "GAZE — Needs direct eye contact. Blocked by mirrored lenses, visors, blindfolds, smoke, darkness, camera feeds, reflections, trained look-aways. One target at a time; multi-target attempts strain her and weaken the effect. Breaks if she blinks, looks away, is startled, or struck. Stronger or trained targets resist faster.\n\nVENOM — Requires a successful bite. Armour, sealed suits, healing factors, toxin resistance, antivenom block it. Lasts only minutes per dose. One bitten target reliably commanded at a time. Self-destructive or morally opposed commands can be resisted.\n\nPHEROMONES — Close range only. Killed by wind, rain, open air, respirators, sealed helmets, smoke, strong chemicals.\n\nCOSTS — Overuse: migraines, eye pain, nosebleeds, nausea, light sensitivity, joint stiffness. Pushed too hard, painful stone patches surface on her own skin. No super-strength, no invulnerability. Cold and dehydration slow her. Hair-serpents are sensitive; if grabbed, cut, burned, or frozen, she feels it as her own pain.",
    link: "https://roleplay.chat/profile.php?user=serpentina"
  },
  {
    char: "Lyrica Malaya Song",
    alias: "Siren",
    status: "student",
    tier: "B",
    power: "Siren Physiology — Vocal Resonance, Hydroresonance & Aquatic Adaptation",
    expression: "Living siren mutation: voice, lungs, throat, hearing, and body chemistry rewired around water. Inhuman vocal frequencies shape pressure waves, shatter glass, disrupt balance, hijack speakers/mics/PA systems, carve silence pockets, and project emotional unease — influence, not mind control. Hydroresonance ripples, lifts, coils, and weaponises existing moisture; sustained vibration boils it for steam cover, scalding spray, and area denial. Steam clouds obscure vision and slick surfaces. Aquatic adaptation gives her enhanced swimming, current control, secondary underwater breathing through mutated tissue, and siren sonar that reads movement through nearby water. Submerged, her voice carries farther and hits harder. STRATA vocal stabilizer at her throat regulates dangerous frequencies and glows red when active.",
    drawbacks: "Power runs through permanently damaged vocal cords from a prior supe attack — overuse causes throat bleeding, voice loss, migraines, vertigo, nosebleeds, hearing distortion, and resonance spikes; pushed too far, damage becomes permanent. Cannot create water from nothing; needs rain, pipes, fountains, puddles, sprinklers, steam, humidity, or nearby bodies of water. Boiling and large temperature shifts exhaust her fast. Weakened by soundproofing, silence tech, sonic dampeners, dry/dehumidified spaces, throat restraints, gags, smoke, feedback attacks, and anything stopping her breath. Underwater she is strong but vulnerable to nets, toxins, polluted/chemical/freezing/low-oxygen water, and extreme pressure. Power is emotionally reactive — fear destabilises, humiliation makes her dangerous, Dirty Halo triggers spikes. Without the stabilizer, frequencies turn self-damaging.",
    link: "https://roleplay.chat/profile.php?user=lyrica"
  },
  {
    status: "student",
    tier: "A",
    power: "Form Manipulation - Shape-Shifting; Aura Manipulation - Energy Weapons, Tools, Constructs",
    char: "Katniss Saunders",
    alias: "Schrödinger",
    expression: "Katniss has only two single powers but they are incredibly strong, especially in the hands of a young adult who doesn't know how to utilize them properly and could easily become a dangerous villain if left alone. Her first is shape-shifting. Kat has two available forms, one being a 'disguise' of sorts that could be utilized for stealth purposes - that of an orange and black striped tabby cat. The other form is the one that makes her dangerous and puts her on the A-list without even realizing it - a tiger anthropomorphic type form in which all her human traits (strength, hearing, speed, sight, taste) are boosted into vastly superhuman proportions. In either human or anthropomorphic form she also has the curious ability to control the energy of her own aura. It can be used to mimic the shape of and be used as almost anything she has seen such as weapons, tools, vehicles, etc.",
    drawbacks: "There are costs to her power. The longer and longer she uses either, the more and more fatigued she grows. Her shifting power in particular has a special give and take as needed condition: her enhanced abilities can be pushed even further than they are in her initial transformation. How far exactly she can push her limits is not known since it's not been tested either by herself or others. But the more and more she pushes herself, the more and quicker she tires out and the more rest or medical attention she will need. Science suggests that were she to keep pushing hard enough, her own powers could potentially even kill her. Kat has a very flawed personality; a bad childhood and a troubled young adult who dropped out of high school, she pushes everyone away and is, most the time, a bitch to others. That wall around her heart seems almost like solid steel and impassable, making her quite unfriendly and mean in social settings.",
    link: "https://roleplay.chat/profile.php?user=Katniss"
  },
  {
    status: "student",
    tier: "C",
    power: "Chronal Displacement · Spatial Decoy",
    char: "Orion Sterling",
    alias: "n/a",
    expression: "Orion's power manifests as nine brilliant, sapphire-hued points of light that hover in a fixed \"Great Hunter\" formation behind his back, acting as tethered anchors for his physical presence. Internally, these stars serve as stabilizers for nine \"latent selves\" folded into his immediate personal space; when he sustains a strike that would otherwise be terminal, the internal pressure of the incoming kinetic force triggers an automatic sub-dimensional swap. The real Orion is momentarily displaced—shifting slightly out of phase—while a discarded anchor surges forward to form a \"Glass Shatter\" phantom that solidifies instantly to absorb the trauma. This decoy then erupts into a cloud of razor-sharp, crystalline stardust as it disintegrates, signaling the permanent erasure of one anchor and leaving the real Orion exposed and one step closer to his inevitable, final mortality.",
    drawbacks: "The most glaring drawback is the power's absolute entropy; each shattered phantom is a permanent loss of a non-renewable biological resource, meaning Orion is effectively a \"terminal\" hero whose career—and life—has a hard, visible expiration date. Mechanically, the \"Glass Shatter\" only triggers for fatal trauma, leaving him entirely vulnerable to non-lethal injuries like broken bones, exhaustion, or blood loss that can weaken him without activating his safety net. Furthermore, because multiple fatal strikes (such as a hail of high-caliber gunfire or a sustained explosion) consume multiple lives simultaneously, he lacks the \"invincibility frames\" typical of most protectors, making him exceptionally fragile in high-volume combat scenarios. Finally, the Celestial Guard constellation acts as a glowing tactical liability, broadcasting his remaining \"health bar\" to any enemy savvy enough to count the stars and wait for the final, flickering light to go dark.",
    link: "https://roleplay.chat/profile.php?user=odyssey"
  },
  {
    status: "student",
    tier: "A",
    power: "Kinetic Conversion · Absorption & Redirection",
    char: "Rhode Sterling",
    alias: "n/a",
    expression: "Rhode's power manifests internally as a physiological \"battery\" centered in his chest and shoulders, where his body absorbs the kinetic energy from physical impacts and stores it within his muscular structure. This internal mechanic allows him to double the force of incoming strikes and redirect them through his limbs, boosting his physical output far beyond human limits. Visually, this expression is characterized by a vibrant golden aura that causes his skin to glow and his muscles to surge with energy, particularly around the \"X\" scar on his chest. When he releases this stored energy, it erupts in explosive, graphic shockwaves and stylized golden bursts.",
    drawbacks: "Rhode's power has a finite storage capacity, meaning that if he absorbs too much force too quickly without redirecting it, he risks a \"Kinetic Overload\" that can cause internal physical strain or unintentional explosive discharges. Because his ability is purely reactive and categorized as Absorption and Redirection, it is inherently ineffective against non-physical or elemental attacks, such as mental manipulation or energy-based strikes that lack mass. Furthermore, he cannot generate his own kinetic energy from a standstill; he requires an initial external impact or a \"jumpstart\" to begin doubling his striking power. These hard limits mean that if he is isolated from physical combat or unable to maintain his focus during high-intensity fights, his golden kinetic glow fades, leaving him reliant solely on his natural physical strength.",
    link: "https://roleplay.chat/profile.php?user=chronicles"
  },
  {
    status: "student",
    tier: "B",
    power: "Density Manipulation · Inertia Reinforcement",
    char: "Candiope Sterling",
    alias: "MONOLITH",
    expression: "Visually, Candiope's power manifests as the pale, shattering pattern of scars across her skin, glowing with a dull, subterranean amber light as she draws her molecular structure tighter, making her skin appear as unyielding as forged industrial steel. Internally, she exerts a subconscious command over the Higgs field interaction within her own mass, effectively locking her particles into a high-density lattice that refuses to be displaced by outside kinetic energy. When she is active, she doesn't just feel heavy; she creates a localized gravitational anchor that causes the ground to crack beneath her feet and projectiles to simply pancake against her skin as if hitting a mountain.",
    drawbacks: "While her density provides near-invulnerability, the massive increase in mass causes Candiope to become exceptionally slow and cumbersome, often resulting in her sinking through floorboards or pavement not rated for such extreme weight. The internal physical strain of \"anchoring\" her molecules is visible through the stress fractures on her skin, which deepen and cause searing neural pain if she maintains her maximum density for too long, eventually leading to a forced \"shutdown\" that leaves her physically exhausted and fragile as a glass pane. Additionally, because her power is tied to structural integrity, she is highly vulnerable to sonic frequencies or vibrations that can destabilize her molecular lattice, potentially causing her density to collapse prematurely or backfire painfully against her own skeletal system.",
    link: "https://roleplay.chat/profile.php?user=monolith"
  },
  {
    char: "Ariana Ferreira",
    alias: "Morpha",
    status: "student",
    tier: "B",
    power: "Kinetic Morphology — Adaptive Elastic Physiology",
    expression: "Elastic physiology that stretches, compresses, inflates, and redistributes mass and density at will. Precision elastic extension grapples and strikes at long reach. Mass redistribution shifts between low-density inflation (cushioning, lift, crowd control) and high-density compression (heavier strikes, crushing momentum). Impact distribution and adaptive durability spread blunt force across her body — partial resistance to bullets, electricity, and heat; vulnerability to acid and corrosives. Conditional strength scales with form. Enhanced baseline attributes and instinctive kinetic awareness for environmental leverage.",
    drawbacks: "Overextension causes structural fatigue. Inflated form is pierce-vulnerable and weaker; compressed is slow and less shock-absorbent. Control fails under shock, fatigue, or stress. Cold makes her stiff and brittle; heat over-softens. Excessive force absorption risks over-dispersion. Heavy metabolic strain and a hard recovery ceiling against severe trauma or corrosive damage.",
    link: "https://roleplay.chat/profile.php?user=Morpha"
  },
  {
    char: "Enzo Krüger",
    alias: "Starboy",
    status: "student",
    tier: "A",
    power: "Stellar Compression — Pressure-Loaded Stellar Output",
    expression: "Living gravitational reactor: absorbs, compresses, and redistributes external force into volatile stellar energy. Kinetic impact, atmospheric drag, momentum, and physical strain all charge his reserves. Output ranges from controlled stellar flight, diamond-state hardening, and event-horizon perception to starburst releases of gold-white stellar light. Enhanced physicality scales with absorbed pressure.",
    drawbacks: "Overcompression can rupture his own structure when reserves outpace capacity. Momentum dependency leaves him underpowered in low-pressure standoffs. Sustained release generates extreme heat that scalds skin and warps gear. Emotional amplification destabilizes precision; self-sacrificial tendencies and fear of failure push him past safe limits.",
    link: "https://roleplay.chat/profile.php?user=Starboy!"
  },
  {
    char: "Quinn O'Hare",
    alias: "Kestrel",
    status: "student",
    tier: "A",
    power: "Predator Sync — Counter-Adaptive Mimicry",
    expression: "Doesn't copy abilities — aligns her physiology, perception, and combat style to directly counter a target. Sustained engagement reads patterns and turns her into the opponent's worst matchup. Primary mark deepens adaptation against one designated target for sharper reactions and tailored counter-strategy. Balanced enhanced attributes favour speed, agility, and reaction over raw strength. Toxic resilience neutralises poisons, venoms, and chemical agents at an accelerated rate. Shock recovery rapidly recalibrates her nervous system after stuns or paralysis. Visible escalation through Mark, Read, and Adapt phases.",
    drawbacks: "Adaptation needs an engagement window — it isn't instant. Only one primary target can be marked at a time; switching focus requires a reset. Cognitive load is high when tracking multiple threats. Reduces opponent effectiveness but does not negate damage. Metabolic strain over long fights or repeated toxin exposure slows reactions and adaptation.",
    link: "https://roleplay.chat/profile.php?user=Kestrel"
  },
  {
    char: "Velora Virelli",
    alias: "Filament",
    status: "student",
    tier: "A",
    power: "Adaptive Silk Manipulation · Perceptual Influence",
    expression: "Generates and controls living filament strands through her hair, shifting between soft silk and reinforced high-tension fibre. Tensile reinforcement supports her weight or others, anchors to structures, and immobilises targets. Weave constructs form shields, barriers, and protective wraps (better against blunt than piercing). Filament strikes deliver whip motion, sweeps, and momentum redirection. Zone control places strands across an area to dictate movement. Soft Focus is a passive perceptual influence that lowers perceived threat, draws attention to her face, creates micro reaction-delays, and softens emotional tone — misdirection, not mind control.",
    drawbacks: "Filament growth and reinforcement drain energy; prolonged use brings fatigue and weaker strands. Managing multiple strands raises mental load and drops precision. Heat weakens fibres; cluttered spaces interfere with control. Greater length costs precision and response speed. Can't out-muscle physically dominant opponents and is vulnerable if restrained. Soft Focus breaks against trained or alert targets and under chaotic stimuli.",
    link: "https://roleplay.chat/profile.php?user=Filament!"
  },
  {
    char: "Jason McTavish",
    alias: "Storm",
    status: "student",
    tier: "A",
    power: "Weather Manipulation · Electrokinetic",
    expression: "Storm-system generation (rain, wind, thunder, lightning) plus body-centered electric phenomena. Output scales with effort and recovery window.",
    drawbacks: "Self-routing of muscle electricity causes deterioration; chronic insomnia and disrupted sleep cycle; recurring infirmary attendance for physical training and recovery.",
    link: "https://roleplay.chat/profile.php?user=stormcaller"
  },
  {
    char: "Isaac Whitman",
    alias: "Swapper",
    status: "student",
    tier: "B",
    power: "Relay Shift — Selective Teleportation",
    expression: "Touch-registers people or objects to a Shift List, then teleports to or swaps with any registered target. Combinations of teleport and swap permitted.",
    drawbacks: "Twenty-five active registrations max. One operation at a time — no chained shifts. Registration requires skin/surface contact.",
    link: "https://roleplay.chat/profile.php?user=Swapper"
  },
  {
    char: "Emery Hollister",
    alias: "Sweet Spot",
    status: "student",
    tier: "B",
    power: "Bio-Confection Manipulation — Living Floss Generation",
    expression: "Body-converts into a cotton-candy-like bio-organic substance, producing consumable floss infused with tailored biochemical effects. Power skews to support, enhancement and influence rather than direct combat.",
    drawbacks: "Hungry power — high caloric intake required; depletion drops output quality. Mood-reactive: instability skews intended effects. Vulnerable to heat, moisture and wind. Not suited for direct combat.",
    link: "https://roleplay.chat/profile.php?user=Sweet+Spot"
  },
  {
    char: "Angelique Pierce",
    alias: "ANGEL",
    status: "student",
    tier: "C",
    power: "Wing Manifestation · Energy Projection · Rapid-Pulse Conduits",
    expression: "15-foot iridescent wings biologically anchored to her spine, plus thermal energy vented as strobing white-hot palm-pulses. Discharge recoil is used tactically as a thruster system for instant, jagged mid-air pivots.",
    drawbacks: "No healing factor or superhuman durability — wings can break, bleed and disable her. Rapid-fire energy use causes heat exhaustion, migraines and physical tremors; a full thermal drain leaves her lethargic and weak.",
    link: "https://roleplay.chat/profile.php?user=iridescence"
  },

  {
    char: "Cassian Marrow",
    alias: "the Abyss",
    status: "student",
    tier: "B",
    power: "Amphibious Physiology · Pressure Manipulation · Hydrosensory Awareness",
    expression: "Deep-sea biology gives Cassian modified lungs and gills, peak performance in water, plus enhanced strength and accelerated regeneration. He compresses and pressurises water for offence, senses bioelectric fields, and communicates with marine life.",
    drawbacks: "Heavily dependent on moisture — heat and dry air sap stamina, sensory range, and regeneration. Electrical attacks are far more dangerous to him than most supers, especially while submerged. Long stretches at depth amplify predatory, instinct-driven behaviour.",
    link: "https://roleplay.chat/profile.php?user=the+Abyss"
  },
  {
    char: "Malachi Castellano",
    alias: "WILDKIN",
    status: "student",
    tier: "C",
    power: "Primal Empathy · Animal Communication",
    expression: "Reads and projects emotional states across non-human animals, can calm or rouse a herd, and holds two-way 'conversations' through imagery and feeling. Larger or more intelligent species respond more cleanly than insects or simple reptiles.",
    drawbacks: "No combat application; he panics under direct violence. Sustained empathic contact bleeds animal instinct into his own mood, leaving him jumpy, territorial, or exhausted. Crowded human environments are sensory overload.",
    link: "https://roleplay.chat/profile.php?user=advocate"
  },
  {
    char: "Philip Chang",
    alias: "Blackout",
    status: "student",
    tier: "B",
    power: "Reactive Adaptive Morphogenesis · Enhanced Strength · Durability · Agility · Accelerated Recovery",
    expression: "Under stress, fear, or protectiveness, Philip's body rapidly evolves to meet a perceived threat — strength, durability, agility, and reflex all spike alongside reactive black biomechanical plating. The stronger the emotional trigger, the more powerful and unstable the transformation.",
    drawbacks: "Emotional escalation drives the power, so high-stakes situations are also when control fails. Aggression intensity scales with intensity — over-triggering risks collateral damage and identity dissociation. Calm, controlled engagement leaves him no stronger than baseline.",
    link: "https://roleplay.chat/profile.php?user=Blackout!"
  },
  {
    char: "Daphne Callas",
    alias: "Verdant",
    status: "student",
    tier: "B",
    power: "Botanical Bio-Manipulation · Plant Growth · Solar Regeneration · Toxic Immunity",
    expression: "Accelerates and shapes plant life — coaxing growth, weaving constructs, and triggering targeted mutations. She photosynthesises in sunlight for fast healing and stamina, and is immune to most plant-based toxins.",
    drawbacks: "Sterile or barren environments leave her without ammunition. Extreme cold slows responsiveness; fire annihilates her constructs. Sustained sunlight deprivation cripples regeneration, stamina, and hydration; heavy ability use burns through nutrient reserves.",
    link: "https://roleplay.chat/profile.php?user=Verdant!"
  },
  {
    char: "Marceline Ward",
    alias: "Ghoulfriend",
    status: "student",
    tier: "C",
    power: "Adaptive Bioreconstruction · Enhanced Physical Attributes · Pain Conversion",
    expression: "Marceline's body actively rebuilds itself through accelerated biological adaptation — torn tissue reroutes, organs reconnect, and her physiology can absorb and integrate features from injury or contact. She converts pain into temporary physical performance.",
    drawbacks: "Reconstruction is visible, painful, and metabolically expensive. Excessive damage triggers psychological fragmentation and donor-memory bleed. Adaptive immunity has limits, and she remains vulnerable mid-reconstruction; emotional spikes can hijack the process.",
    link: "https://roleplay.chat/profile.php?user=ghoulfriend"
  },
  {
    char: "Tyler Caldwell",
    alias: "BLACK VEIN",
    status: "student",
    tier: "A",
    power: "Adaptive Mutation · Organic Weaponization",
    expression: "Tyler shapes his own biology in real time — growing claws, blades, plating, or spurs of dense organic tissue, and reconfiguring limbs to meet whatever fight he's in. Mutations adapt mid-engagement based on the threat he's facing.",
    drawbacks: "Heavy mutation is calorically punishing and leaves him visibly disfigured for hours afterward. Shifts cost time he doesn't always have, and complex shapes degrade under sustained punishment. Cold and toxin exposure slow the mutation engine to a crawl.",
    link: "https://roleplay.chat/profile.php?user=BLACK+VEIN"
  },
  {
    char: "Lucrecia Sofìa Avalos-Perez",
    alias: "Rosetta",
    status: "student",
    tier: "C",
    power: "Omnilingualism",
    expression: "Instinctively understands, interprets, speaks, reads, and writes virtually any language she encounters — spoken, dialectal, coded, symbolic, or invented. Rather than memorising, her mind processes communication as natural intent, capturing emotional context and rhetoric at remarkable speed.",
    drawbacks: "No combat application. Cognitive load and hyperawareness leave her prone to overstimulation in crowded or multilingual environments. Constant contextual translation creates emotional vulnerability and a morally complicated perspective on whose meaning to prioritise.",
    link: "https://roleplay.chat/profile.php?user=Rosetta!"
  },
  {
    char: "Manuel \"Manny\" Glint",
    alias: "BurnOut",
    status: "student",
    tier: "B",
    power: "Superspeed · Hypermetabolism",
    expression: "Converts anything edible into pure caloric output, then burns those calories to move and think at lightning speed. Reaction time, sprint speed, and combat tempo all scale with how much he's eaten in the last hour.",
    drawbacks: "Constantly needs to eat. Long fights drain him; once calories run out, his body begins to autophage — cannibalising muscle and organ tissue to keep going. Vulnerable to anything that disrupts digestion or appetite.",
    link: "https://roleplay.chat/profile.php?user=Crashnburn"
  },
  {
    char: "Theron",
    alias: "Bulk",
    status: "faculty",
    tier: "A",
    power: "Biokinetic Augmentation · Kinetic Absorption & Release",
    expression: "Theron's body absorbs and redistributes incoming force, dampening damage and channelling that energy into momentum. Strength scales with motion, favouring charges, grapples, and sustained pressure. In Break State his biological inhibitors fail, deepening output at the cost of self-damage.",
    drawbacks: "Not invulnerable — repeated impacts, piercing attacks, and concentrated force still fracture and bleed him. Heavy absorption strains his system, slowing reactions and pushing him toward overheating, fatigue, and eventual shutdown. Break State worsens injury suppression and risks collapse.",
    link: "https://roleplay.chat/profile.php?user=bulk"
  },
  {
    status: "student",
    tier: "C",
    power: "Entomantic Hive-Link, Swarm Command, Distributed Awareness, Environmental Attraction, Quiet Movement, Emotional Escalation Response",
    char: "Winifred Finch",
    alias: "Swarm",
    expression: "Entomantic Hive-Link\nWinnie possesses a rare biological-psychic connection to insects and similar small crawling creatures, allowing her to communicate with, influence, and command them through instinctive emotional and mental impulses. The connection extends across nearly all species — from moths and beetles to spiders, crickets, centipedes, bees, wasps, flies, slugs, and more. While commands begin simple, her control becomes increasingly precise under focus or emotional stress. Unlike traditional telepathy, the connection feels deeply sensory and collective. Winnie does not merely “control” insects; she experiences them as part of a living network surrounding her at all times.\n\nhttps://docs.google.com/document/d/1XV-7nfcYdo7qYiNc-hQiJVygViY__m4Nib4KeDVZSAs/edit?usp=sharing",
    drawbacks: "Sensory Overload, Sensory Overload, Physically Vulnerable, Cold Temperatures, Fire & Chemical Exposure, Hoarding & Attachment Tendencies",
    link: "https://roleplay.chat/profile.php?user=Swarm!"
  },
  {
    status: "student",
    tier: "A",
    power: "Pressure Manipulation · Biological Pressure Control",
    char: "Riley Carter",
    alias: "VICE",
    expression: "Vice’s power manifests through localized pressure distortion within biological systems. When activated, subtle visual effects appear around the target: faint air warping, trembling fabric, pulsing veins, brief condensation, and low-frequency vibrations in the surrounding space. Riley manipulates pressure by applying focused compression or imbalance to specific physiological systems, including muscles, lungs, joints, blood flow, and equilibrium centers. This allows her to induce heaviness, pain, dizziness, breath restriction, muscular disruption, or temporary loss of coordination without causing visible external force. Precision and proximity are critical. The closer Riley is to a target, the more accurate and effective her control becomes.",
    drawbacks: "Vice’s power requires intense concentration and precise anatomical awareness. Emotional instability, panic, exhaustion, or sensory overload can make her control dangerously inconsistent. Her effectiveness rapidly decreases with distance, making close-range engagement essential for accurate pressure application. Affecting multiple targets at once significantly increases mental strain and reduces precision. Excessive use places severe stress on Riley’s own body, often causing migraines, nosebleeds, tremors, muscle fatigue, elevated heart rate, and temporary loss of fine motor control. Improper pressure placement can result in unintended serious injury, forcing her to constantly restrain herself during combat. Her abilities are also less effective against non-biological targets, heavily armored opponents, or individuals with abnormal internal physiology. Sedatives, disorientation, or direct disruption of her focus can weaken or interrupt activation entirely.",
    link: "https://roleplay.chat/profile.php?user=pressure"
  },
  {
    status: "student",
    tier: "A",
    power: "Psionic Dominion, Telekinesis, Telepathy, Empathic Link, Flight, Psionic Barriers",
    char: "Mavis Kingsman",
    alias: "Savior",
    expression: "PSIONIC DOMINION\nMavis’ abilities operate through an interconnected psionic field tied directly to her mind, emotions, and nervous system. Unlike supers who separate powers into isolated categories, Mavis experiences telepathy, telekinesis, empathy, and flight as extensions of the same core phenomenon. Her thoughts influence matter, her emotions affect force output, and her awareness constantly brushes against the mental and emotional presence of others. STRATA classifies her as an exceptionally dangerous psionic because her power scales through cognition and emotional processing rather than purely physical limitation.\n\n(Ran out of room again: https://docs.google.com/document/d/1QyYVgRM0G7F2TXenGoq6yZvBadI_eVvJOL4WzAsrVlM/edit?usp=sharing)",
    drawbacks: "Emotional Overload, Thought Intrusion, Precision vs Power, Mental Fatigue, Responsibility Complex, Social Detachment",
    link: "https://roleplay.chat/profile.php?user=Savior",
    note: "Banned-power check passes: Mavis's telepathy is bounded — line-of-contact reach, single-target or small-group focus, conscious activation. Not a universal-simultaneous-telepathy expression. Admin-approved."
  },
  {
    status: "student",
    tier: "B",
    power: "Momentum Physiology (\"Underdog Syndrome\")",
    char: "Baldor Kingsman",
    alias: "King",
    expression: "Baldor’s body continuously escalates in physical strength, durability, pain tolerance, stamina, recovery efficiency, and force output based on active exertion duration. The longer he remains physically engaged — fighting, lifting, running, resisting damage, pushing through exhaustion — the stronger and tougher he becomes. He essentially turns sustained struggle into fuel.",
    drawbacks: "1. Slow Start — strongest in prolonged engagements; ambushes and quick overwhelming attacks are dangerous before he has ramped. 2. Massive Caloric Burn — constantly hungry; STRATA nutritionists probably hate him. 3. Internal Damage — pain tolerance masks serious injury; he may continue fighting on torn ligaments, cracked bones, or internal bleeding and collapse afterward. 4. Heat Buildup — long activation causes dangerous overheating, with risk of heat stroke, organ stress, tunnel vision, aggression spikes, and blackouts. 5. Emotional Trigger Risk — escalation responds strongly to emotional stress (humiliation, anger, fear for others, desperation), which means emotional manipulation can push him into unstable overdrive.",
    link: "https://roleplay.chat/profile.php?user=Kingsman"
  },
  {
    status: "student",
    tier: "B",
    power: "Biological Echo Mimicry, Partial Manifestation, Enhanced Physicality, Animal Communication & Instinct Recognition",
    char: "McKenna Doyle",
    alias: "Menagerie",
    expression: "Biological Echo Mimicry\nMcKenna’s primary ability allows her to physically transform into animal species she has previously “imprinted” through direct skin-to-living-creature contact. Once contact is established, she retains the species within her biological memory and can access it again later without repeated exposure. Transformations are not illusionary; they are complete biological shifts that alter musculature, organs, senses, instincts, movement patterns, and neurological processing. She can perform either full-body transformations or partial adaptations, allowing her to selectively borrow traits from different species without committing entirely to a single form.\n\n(Ran out of room: https://docs.google.com/document/d/1AiO8XXAzmuKbnJBkoyUyY5gnoxQKHrE2TrgGRuyyBgA/edit?usp=sharing)",
    drawbacks: "Instinct Drift, Identity Degradation, Physical Energy Consumption, Emotional & Instinctive Triggers, Overadaptation, Non-Specialist Ceiling",
    link: "https://roleplay.chat/profile.php?user=Menagerie!",
    note: "Athletics flag: McKenna is permanently banned from Powerball after a sophomore-year mauling incident during partial-manifestation Defence. See her Students entry for the full ruling."
  },
  {
    char: "Eirik Aslund",
    alias: "BLÓÐHUNDR",
    status: "unsanctioned",
    power: "Sensory Adaptation · Hyper-Predatory Perception",
    expression: "Eirik's power expresses through extreme sensory adaptation and subconscious biological analysis rather than overt supernatural effects. His nervous system continuously processes environmental stimuli at an inhuman level, allowing him to identify microscopic disturbances in scent, heat, sound, movement, and behavior patterns almost instantly. When active, his focus becomes visibly intense and unnervingly still. His pupils subtly sharpen, his breathing slows, and he often tilts his head slightly while isolating specific stimuli from surrounding noise. He can track individuals through residual heat, adrenaline traces, blood particles, sweat composition, disturbed airflow, gait patterns, and micro-expressions. In combat, Hyper-Predatory Perception allows him to anticipate movement by reading involuntary muscle tension, weight distribution, breathing changes, and eye movement before actions occur, making his reactions appear nearly precognitive.",
    drawbacks: "Eirik's sensory processing cannot fully \"shut off,\" forcing his brain to constantly absorb environmental information. Crowded or overstimulating areas with excessive noise, movement, strong odors, or emotional stress signals can overwhelm his nervous system, causing migraines, nausea, disorientation, irritability, and severe fatigue. Heavy smoke, industrial chemicals, biological contamination, or deliberately overwhelming scent sources can interfere with his tracking abilities and make target isolation significantly harder. His heightened perception also creates emotional and psychological strain. He unconsciously notices fear, stress, dishonesty, attraction, and hesitation in others, making normal social interaction exhausting and isolating. Because his brain remains hyper-alert even at rest, Eirik suffers from chronic insomnia, hypervigilance, and difficulty fully recovering physically or mentally after prolonged tracking or combat.",
    link: "https://roleplay.chat/profile.php?user=blodhundr"
  },
  {
    char: "Briar Musgraves",
    status: "unsanctioned",
    power: "Resonant Aura Reading, Emotional Atmosphere Manipulation, Vocal Entrancement, Emotional Echoes",
    expression: "Resonant Aura Reading\nBriar perceives emotional resonance through sound, rhythm, vocal inflection, and atmosphere. Music sharpens this perception dramatically, especially live singing. Emotional states manifest to her as layered sensory impressions: tones, textures, temperatures, pressure shifts, phantom tastes, or distortions in sound. Crowds become emotional symphonies, while individuals feel like isolated instruments she can tune into with frightening precision.\n\nShe can sense: attraction, grief, fear, guilt, obsession, deception, emotional instability, desperation, suppressed anger, and emotional attachment. The stronger the emotion, the \"louder\" the resonance. Direct singing creates the clearest readings, particularly if eye contact or emotional focus is maintained.",
    expressionDoc: "https://docs.google.com/document/d/1PSqNwFZpLZTVDERTNYN-VJxPZxDOt1UgCZRB03r_ni4/edit?usp=sharing",
    drawbacks: "Emotional Overload, Difficulty Separating Her Emotions From Others, Silence Weakens Her, Emotional Blind Spots, Attachment Vulnerability, Hypervigilance & Control Issues, Physical Vulnerability",
    link: "https://roleplay.chat/profile.php?user=Reverie"
  },
  {
    char: "August Marlowe",
    alias: "Vulcan",
    status: "unsanctioned",
    power: "Pyrokinesis",
    expression: "Hellfire Pyrokinesis\n\"The flame does not forgive.\"\nAugust generates and controls a supernatural form of combustion known as Hellfire — a violet-black flame with properties similar to white phosphorus. Once ignited, the fire clings aggressively to surfaces, spreads unnaturally, and resists conventional extinguishing methods. Unlike ordinary fire, his flames appear semi-sentient at higher output, reacting to his emotional state and destructive impulses. His hellfire can: melt metal, ignite damp environments, spread across walls and ceilings, persist long after combat ends, scar victims permanently. The flames become strongest during moments of rage, humiliation, possessiveness, or grief.",
    drawbacks: "Emotional Combustion\n\"The fire listens too closely.\"\nAugust's hellfire is deeply linked to his emotional state. Strong feelings — especially rage, humiliation, grief, jealousy, or possessiveness — dramatically increase both the intensity and instability of his powers. The more emotional he becomes: the harder precise control becomes, the more aggressively hellfire spreads, the more autonomous the hellhounds behave, the more collateral damage occurs. At lower levels, this simply makes him more dangerous. At higher levels, it risks turning him into a catastrophe. This means psychologically provoking him can actually destabilize his combat efficiency, even if it increases raw destructive output.",
    link: "https://roleplay.chat/profile.php?user=Hellson"
  },
  {
    char: "Sven Skarsen",
    alias: "BLOOD EAGLE",
    status: "student",
    tier: "A",
    power: "Blood Iron · Hemo-metallurgy (close-range brawler)",
    expression: "Sven hardens his own blood-derived energy into stylised black-red metal constructs that form along his hands, forearms, shoulders, and back. Visually it reads as wet crimson-black iron, rusted steel, and glossy obsidian — never as open wounds or splatter. He can shape claws, hooked chains, jagged armour plates, axe-like weapons, sharp metallic shards, and jagged wing-blades from his shoulders (the Blood Eagle silhouette). Mechanically the constructs are physically real once formed: hard, heavy, dense, and capable of cutting, blocking, and dragging. In his overdrive 'War Vein' state his veins darken and armour spreads across arms, ribs, and jawline, increasing output and durability at the cost of fine control.",
    drawbacks: "Limited supply — output draws on his own reserves and burns him out fast under heavy use. Pain is real — armour blunts hits but every strike still hurts, and he keeps fighting through it. Reckless nature — his power scales with aggression, so it punishes patience and rewards bad decisions. Focus required — anger and adrenaline tank his shaping control, making constructs sloppy or unstable. Weight drag — large constructs (axe, full wings) slow him down and ruin agility. Medical risk — pushing too far in one fight leaves him weak, dizzy, and slow to recover afterwards.",
    link: "https://roleplay.chat/profile.php?user=blood+eagle"
  },
  { char: "Tatiana Morozova", alias: "Nocturne", status: "student", tier: "A", power: "Choreographic Synchronization · Kinetic Choreography · Forced Misstep · Emotional Entrainment · Corps Echoes · Enhanced Physical Condition", expression: "Tatiana's core mutation revolves around movement synchronization and rhythmic influence. Through dance and controlled pacing, her nervous system imposes rhythm onto the environment and people around her.", drawbacks: "Precision Dependency, Emotional Feedback Loop, Physical Exhaustion, Range Limit, Choreographic Memory Overload", link: "https://roleplay.chat/profile.php?user=Nocturne." },
  { char: "Oliver Daniel Fletcher", alias: "Hopper", status: "student", tier: "B", power: "Amphibian Physiology · Adhesion & Surface Climbing · Elastic Leg Compression & Leaping · Aquatic Adaptation · Enhanced Low-Light Vision · Prehensile Tongue Adaptation · Hyper Reflexes · Flexibility", expression: "Oliver's body has undergone a gradual mutation mirroring amphibian traits. Unlike overtly monstrous mutations, he still appears largely human outwardly with most changes presenting internally through movement patterns and reflex behaviors.", drawbacks: "Constant Self-Restraint, Power Growth Instability, Overstimulation & Sensory Fatigue, Cold Temperatures, Dryness & Dehydration, Emotional Transparency", link: "https://roleplay.chat/profile.php?user=Hopper" },
  { char: "Mason Graves", alias: "Paladin", status: "student", tier: "B", power: "Hyper Intelligence", expression: "Mason possesses a superhumanly accelerated cognitive architecture. His brain processes information at speeds impossible for ordinary humans, allowing him to analyze, simulate, invent, and adapt in real time.", drawbacks: "Physical Frailty, Information Overload, Emotional Blind Spots, Dependency on Templar armor", link: "https://roleplay.chat/profile.php?user=TechPaladin" },
  { char: "Sorina Mirela Vaduva", alias: "Black Mass", status: "student", tier: "B", power: "Hellfire Generation · Revenant Transformation · Fire Resistance & Thermal Immunity · Infernal Healing · Chain Manifestation & Metal Conduction · Trauma Reflection · Enhanced Physicality · Emotional Perception", expression: "Sorina can produce and manipulate superheated black-orange plasma flames from her body, breath, or physical contact. The flames spread aggressively across fuel sources but can also cling unnaturally to metal, chains, and surfaces.", drawbacks: "Emotional Instability Amplification, Overheating & Internal Damage, Oxygen & Containment Vulnerability, Trauma Feedback", link: "https://roleplay.chat/profile.php?user=Black+Mass" },
  { char: "Asher Wilde", alias: "MONGREL", status: "student", tier: "B", power: "Shapeshifting · Beast Physiology", expression: "Mongrel's body enters a progressive transformation state rather than an instant shift. Muscles swell and condense beneath the skin, frame grows larger, shoulders broaden, veins become pronounced, and posture lowers into a more predatory stance.", drawbacks: "Transformation instability, emotional triggering, recovery exhaustion, sensory overstimulation in beast form", link: "https://roleplay.chat/profile.php?user=mongrel" },
  { char: "Princeton Ambrose", alias: "EROS", status: "student", tier: "A", power: "Neurochemical Manipulation · Emotional Influence", expression: "Eros emits engineered synthetic pheromones through respiration, body heat, and skin contact, creating an invisible neurochemical field that subtly influences the emotions of nearby individuals.", drawbacks: "Overheating & Dehydration, Emotional Instability, Power Growth Instability, Open-Air Vulnerability, Respiratory Inhibitors", link: "https://roleplay.chat/profile.php?user=desirable" },
  { char: "Dexter Crowley", alias: "Ruckus", status: "student", tier: "C", power: "Gremlinoid Morph", expression: "Gremlinoid Morph\nPower Expression\nChaotic Gremlin Entity (Symbiotic/Transformative State) AKA Gremlin Mode: Not a separate being. Not a costume. He is Dexter’s unleashed survival code. Though talks to it like it is a second personality. Refers to it as Angry Feral Inner Child\nEnhanced Strength\nEnhanced  Speed & Agility\nEnhanced Senses\nRazor Sharp Claws/Teeth\nPain Resistance/Damage Tolerance\nRapid Recovery\nFeral Instinct / Combat Sense\nChaos Adaptation\nFearless Aggression\nCompact Frame Advantage\nDexter Link (Anchor System)", drawbacks: "Enhanced Strength: He's a mini tank.  Fights like the hulk.  But over used of heavy lifting and hard fighting can wear him down.\nEnhanced  Speed & Agility: Same as above. He's not sonic speed but faster than a human.  Long term fights/running can wear him down.\nEnhanced Senses: Strong odors/high pitched sounds\nRazor Sharp Claws/Teeth: He's a gremlin. He's gonna break a lot of things by \"accident\"\nPain Resistance/Damage Tolerance: Adrenaline makes it not hurt. Hurt more than he knows.\nRapid Recovery: Not a full healing factor\nFeral Instinct / Combat Sense -  Chaos Adaptation - Fearless Aggression: \"Acts First - Thinks never\". Pure instinct\nCompact Frame Advantage: If it can keep him from breaking out, easier to trap him.(\nDexter Link (Anchor System) \"Personalities\" may fight for control causing delay.\nHe struggles with spoken communication, mostly using growls, gestures, broken words, or gremlin-speak.\nHe can be distracted by food, shiny junk, loud machines, or anything of interest", link: "https://roleplay.chat/profile.php?user=Gremlin" }, // sub:e31100af
  { char: "Xeno", alias: "Xenofire", status: "student", tier: "A", power: "Pyrokinetic Plasma Form", expression: "Pyrokinetic Plasma Manipulation: Xeno doesn’t just control fire. He generates and becomes plasma flame, which is a higher-energy state than normal flame. That’s why his fire looks alive, smooth, and intense instead of cracked or lava-like.\n\nLiving Flame/Plasma Physiology:  When shifted, his body becomes energy instead of flesh.\nNo internal organs while transformed/Physical attacks pass through or disperse him\n\nControlled Transformation States: Human/Clean Controlled Plasma/Pure Fire\n\nFlight / Propulsion\n\nThermal Control\n\nFire/Heat Immunity\n\nEnergy Projection: Fire blasts/waves/beams/Focused cutting arcs\n\nRegeneration (When in Plasma form)\n\nOxygen Interaction Awareness\n\nAdaptive Output: Emotional intensity, Environmental heat, Available oxygen\n\nAscended / Perfect Balance: (Has not reached this level)\nAbsolute control over plasma output/No wasted energy/Precision + maximum efficiency\nThis is peak Xenofire. Controlled star-level energy without chaos.\n", drawbacks: "Oxygen Dependency: No oxygen, no fire.\n\nEnergy Burnout: He runs on internal energy reserves. So he can run out of energy to burn.\n\nEmotional Instability Amplifier: Anger = stronger but less controlled, Calm = weaker output but precise, Extreme emotion can trigger Meltdown\n\nCollateral Damage Risk: Heat spreads/Environments ignite/Civilian risk is high without restraint\n\nHuman Form Vulnerability: Unless in Plasma/Fire form he's just human.\n\nOxygen Crash Weakness (Origin Trauma): Psychological + physical flaw. Sudden oxygen loss can destabilize his form\nCan cause flickering, forced reversion, or fall-out.\n\nOverheating Instability\n\nToo much output too fast: Plasma becomes erratic/Control drops/Risk of entering Meltdown\n\nMemory Fragmentation (Lore-Based)\n\nDue to his origin: Past is incomplete/Emotional triggers can spike powers unpredictably - Needs Therapy\n\nSuit Dependence:  Helps regulate output/Prevents accidental environmental ignition", link: "https://roleplay.chat/profile.php?user=Xenofire" }, // sub:953a48bf
  { char: "Professor Eurydice Lovecraft", alias: "Dream", status: "faculty", power: "Oneiric Perception · Somnolent Illusion", expression: "Dream operates at the border between waking and sleeping. There is no visible light show, no dramatic visual signature. People near her describe a quality to the air: a warmth behind the eyes, a slowing of thought, the sense that the present moment has become slightly less urgent. She does not look like she is doing anything. That is part of how it works.\n\nSurface — She makes people sleepy. She can drop drowsiness over a whole room, blur a crowd's attention, calm panic, or ease a single target into actual sleep without them realising she did it. Most people never notice they were pushed.\n\nDaydream — She edits how the moment feels. Light seems warmer. A stranger feels familiar. A fear loosens. A bruise reads as old, a tired face reads as rested. Surface only — she is tweaking the picture, not the truth. It holds for as long as she pays attention to it.\n\nDreamscape — She builds a fake world inside someone's head. At full depth she constructs an entire reality around a target: corridors, conversations, rooms, faces, weather. The person inside walks through it believing it is an ordinary afternoon, and tends to remember it that way after. Sight, sound, touch, emotion — all of it consistent enough that they do not question it.\n\nOneiric Echoes — Her own sleep sometimes shows her things. During natural sleep, especially after she has used her power hard, she gets fragmented visions. Pieces of the past, hidden truths, possible futures. They come as symbols rather than facts — flooded rooms, cracked mirrors, burning film reels, faceless crowds, white moths, applause, blood on gloves, doors that should not exist. She cannot summon them, cannot choose what they show, and often cannot tell what they mean until after the fact. But they have been right often enough that she has stopped ignoring them.", drawbacks: "Dreamscape leaves her body undefended — While she is inside a constructed dream, her real body is frozen and blind to the room. Someone could walk up to her, hit her, take her keys, drag her somewhere else, and she would not notice until the dream ends.\n\nDaydream is paint, not surgery — It changes how things look or feel in the moment. It does not change what someone believes, override strong emotion, or hold against anyone who is actively suspicious or resisting. Soft pressure, not control.\n\nSleep does not work on adrenaline — She cannot put a target to sleep if they are highly agitated, in severe pain, or chemically stimulated. The more scared, hurt, or wired they are, the harder she has to push, and at some point she cannot push hard enough.\n\nEchoes are unreliable — They are symbolic, fragmentary, and impossible to force. They may show a possible future, not a guaranteed one. They can be misread, polluted by her own fears, or distorted by recent dreamscape work. After deep use of her power she may struggle to tell the difference between a genuine warning, a psychic afterimage, plain memory, and an ordinary nightmare.\n\nBurnout muddies her — After deep dreamscape work she has trouble telling her own present from the ones she just built. She needs time before she is safe to drive, make decisions, or be in any situation that requires sharp judgment.", link: "https://www.roleplay.chat/profile.php?user=dream" }, // sub:f7faa2f9
  { char: "Evelyn Chen", alias: "Echo", status: "student", tier: "D", power: "Remote Sensory Synchronization, Emotional Echo Feedback, Surface Thought Impression, Enhanced Perception, Cognitive Pattern Recognition", expression: "Remote Sensory Synchronization\nEcho possesses the ability to establish a sensory link with another person through visual familiarity, most effectively through direct sight, clear photographs, or prolonged visual exposure. Once connected, Evelyn can temporarily perceive the world through the target’s senses, allowing her to see through their eyes and hear surrounding audio as though physically present. Stronger connections may also grant fragmented emotional impressions, instinctive reactions, or fleeting surface-level thoughts. The clarity and stability of the synchronization are heavily influenced by image quality, emotional intensity, physical distance, and Evelyn’s own mental condition. Close proximity and emotionally charged situations dramatically strengthen the connection, while poor visuals or overstimulation can destabilize it.\n\n(OUT OF ROOM: https://docs.google.com/document/d/1CfWPbAvBPUtEo7pCOE8fhkJOjlA12kedXKAvhmv3aow/edit?usp=sharing)", drawbacks: "Overlinking & Neurological Strain, Phantom Trauma Feedback, Emotional & Sensory Overload, Limited Range & Visual Dependence, Social Anxiety & Self-Consciousness, Insomnia & Hyperfixation, Low Combat Capability", link: "https://roleplay.chat/profile.php?user=.Echo" }, // sub:6b3eb389
  { char: "Sylas Luftborne", alias: "ZERO G", status: "student", tier: "A", power: "GRAVITY MANIPULATION", expression: "Personal Gravitational Core Manipulation: (Core): \nGenerates an internal gravitational core and projects a controlled field outward\nRedefines gravity direction relative to himself (wall-walking, inverted movement, midair anchoring)\n\nGravity Amplification: Turn a punch into a crushing impact, make a balloon heavy as a bus\n\nGravity Nullification: Create zero-G combat zones\n\nKinetic Acceleration: Burst speed (almost teleport-like), High-impact strikes, Controlled falls turned into attacks\n\nMicro-Singularity Gravity Pull: Pulls everything inward briefly\n\nPASSIVE TRAITS: Enhanced spatial awareness (he “feels” mass and pull)/Perfect balance under shifting forces/High resistance to pressure and G-forces\n\n", drawbacks: "Body is the engine: disruption to focus, stamina, breathing, or equilibrium destabilizes the field\nResults in misaligned vectors, loss of balance, or pressure backlash \n\nMicro-Singularity Gravity Pull: takes a lot of energy\n\nCognitive Load:  Requires constant calculation/Multiple gravity fields = mental strain / Overuse leads to:  Slower reactions,  Loss of precision\n\nOverload Risk: Too much mass + too much force = backlash = Cause uncontrolled collapse/Slam himself instead / Misalign vector= sends himself flying instead\n\nEnergy Drain: Larger manipulations = higher cost/Sustained combat drains him fast", link: "https://roleplay.chat/profile.php?user=Airborne" }, // sub:fcdbf13d
  { char: "Alphonse Driessen", alias: "Haze", status: "student", tier: "C", power: "Smoke Physiology, Toxic Smoke Manipulation, Internal Infiltration, Enhanced Physical Attributes", expression: "Smoke Physiology\nAlphonse possesses the ability to partially or completely convert his body into a smoke-like state at will. In this form, physical attacks can pass harmlessly through him, allowing him to evade strikes, bullets, restraints, and environmental hazards that would incapacitate most people. He can disperse into narrow spaces, move through vents or cracks, and travel along existing airflow with unnatural fluidity. While fully converted, he loses the ability to physically interact with objects or carry weight, making the form ideal for infiltration, escape, stealth, and reconnaissance rather than direct force. Smoke-heavy environments such as fires, fog, steam, or polluted city air enhance his concealment and reduce the strain required to remain dispersed.\n\n(OUT OF ROOM: https://docs.google.com/document/d/1rPgS-TEVsM78G5m9tio0iSwBKEK2otO1XSym4KyVN-M/edit?usp=sharing)", drawbacks: "Respiratory Strain, Vulnerability to Wind & Airflow, Limited Physical Interaction While Dispersed, Reform Vulnerability, Thrill-Seeking Behavior, Emotional Avoidance, Public Marketability Issues, Dependence on Atmosphere & Environment", link: "https://roleplay.chat/profile.php?user=.Haze" }, // sub:a4f05170
  { char: "Khan Grimassi", alias: "The Connoisseur ", status: "student", tier: "B", power: "Gastrokinetic Adaptation: gains powers from what he consumes.", expression: "Universal Digestion: can digest almost anything, including metal, bullets, glass, stone, bone, chemicals, and toxins.\nTrait Absorption: takes on properties of what he eats.\nEx: \nPhysical Augmentation: Protein, carbs, fats, sugars, etc. boost strength, stamina, durability, or speed.\nElemental Adaptation: spicy food, ice, liquids, minerals, and chemicals can create heat, cold, fluidity, hardness, or other effects.\nAdaptive Immunity: can build resistance to poisons, toxins, and harmful substances.\nSensory Palate: can detect ingredients, toxins, chemicals, and properties through taste/smell.\nMetabolic Overdrive: rapid consumption stacks temporary boosts.\nTemporary Power Stacking: can combine multiple consumed effects at once\nCulinary Instinct: knows what to eat for the result he needs.\n\nDoes not know yet:\nObject Conversion: bullets let him fire bullets, metal hardens his body, rubber makes him elastic, glass creates sharp cutting effects.\nToxin Immunity: His body will convert to powers.", drawbacks: "Consumption Dependent: only as strong as what he has recently consumed.\nTime Limit: all adaptations fade after digestion burns through them.\nContamination Risk: poisoned, spoiled, or corrupted intake can disrupt or harm him in extreme ways \nOverload: too many effects at once can cause burnout, vomiting, collapse, or internal strain.\nBad Matchups: some consumed traits may backfire in the wrong environment.\nNutritional Crash: heavy power use drains calories fast.\nLimited Storage: gear only carries so many emergency foods, spices, and objects.\nPower Instability: mixed ingredients or objects can create unpredictable results.\nHuman Body Limits: durable, but not invincible. He can still be cut, shot, poisoned (through skin not ingesting), burned, or knocked out.", link: "https://roleplay.chat/profile.php?user=Savory" }, // sub:51c61fcc
  { char: "Moni Li", status: "student", tier: "C", power: "Geokinesis-Telekinetic control over the Silica located in 99 percent of Dirt and Stone.", expression: "Mental control, movement, restructuring, and compression of \"Earth.\" It is in reality a telekinetic control over the Silica, All Rock and Stone, Dirt and sand to a particulate level. Comes with ability to \"sense\" vibrations through the ground. ", drawbacks: "Physical weight of moved mass provides greater mental strain. Inability to heat, cool, or affect controlled materials any farther than physical manipulation. ", link: "https://roleplay.chat/profile.php?user=Moni+Beifong" }, // sub:d7341d4f
  { char: "Griffin Knight", alias: "RAZOR", status: "student", tier: "B", power: "Construct Manipulation · Kinetic Blade Manifestation", expression: "Razor's ability manifests as dense electric-blue kinetic constructs that form around his hands, fingertips, and nearby space before compressing into knife-shaped weapons. Moments before materialization, faint fracture patterns spread through the air like cracks in glass. Manifested blades range from thin needles to heavier combat knives, all leaving subtle blue energy trails. During movement abilities, fragmented afterimages and streaks follow him, making his repositioning seem abrupt and difficult to track. Internally, his power functions through an instinctive spatial mapping system connected to every active blade. Razor constantly senses each knife's position, direction, and momentum. Rather than controlling them like puppets, he influences their movement through rapid subconscious calculations. The more knives placed throughout an environment, the more information and combat options he gains. His strength relies heavily on preparation and setup rather than raw power.", drawbacks: "Razor's ability depends heavily on active blade placement and environmental setup. With few or no knives embedded around him, his combat options become limited and far less effective. Excessive knife generation or rapid use of multiple abilities places strain on his nervous system, causing headaches, slowed reaction time, hand tremors, and mental overload from tracking too many active blades at once. Maintaining awareness of numerous knife positions becomes increasingly difficult under stress. His mobility is also restricted by placement. Knife Step cannot function without an embedded blade as an anchor point. Destroyed, displaced, or obstructed knives reduce his control and the routes available to him. Wide-area attacks, unpredictable movement, sensory disruption, or close-range pressure can interfere with his setup and force him into direct combat, where his advantage drops significantly.", link: "https://roleplay.chat/profile.php?user=knife" }, // sub:cea89741
  { char: "Natalie Neuman", alias: "AXIOM", status: "student", tier: "B", power: "Cognitive Augmentation · Hypercognition", expression: "At first glance, her abilities appear almost invisible compared to more explosive hero types. There are no glowing energy blasts or obvious physical mutations. Her power manifests through overwhelming cognitive processing expressed subtly through behavior, perception, and environmental interaction. Internally? Her brain processes, stores, cross-references, and simulates information at massively accelerated speeds far beyond baseline human capability.", drawbacks: "Physically Weak\nMinimal combat training and below-average physical endurance. In direct confrontation against most combat-oriented heroes, she is heavily disadvantaged.\n\nMental Fatigue\nContinuous high-speed cognition rapidly drains her mentally. Extended processing sessions can lead to migraines, tremors, nausea, insomnia, and temporary cognitive shutdowns.\n\nEmotionally Detached\nShe often struggles relating to people emotionally. Conversations can feel inefficient or exhausting to her, causing her to appear cold, dismissive, or arrogant even when she is not intentionally trying to be.\n", link: "https://roleplay.chat/profile.php?user=AXIOM" }, // sub:2d32b02d
  { char: "Charmaine Leocadia Quinteros", alias: "Haven", status: "student", tier: "B", power: "Atmospheric Force Manipulation, Bubble Creation & Control, Pressure Regulation, Oxygen Manipulation, Mobility & Buoyancy Support", expression: "Atmospheric Force Manipulation\nHaven possesses the ability to generate and manipulate stabilized atmospheric-pressure constructs that manifest as translucent, iridescent \"bubbles.\" These constructs can vary in size, density, elasticity, and durability depending on her concentration, emotional state, and stamina reserves. While visually soft and fluid, the bubbles are capable of withstanding significant force and are primarily used for protection, rescue operations, mobility support, and environmental stabilization.\n\n(Ran out of room: https://docs.google.com/document/d/1_Byy9Lc67ssXBEBW3O5E5YGO1wVyj1sErfcUOdRa980/edit?usp=sharing)", drawbacks: "Severe Stamina Drain, Multitasking Limitations, Emotional Influence, Protective Instincts, Limited Offensive Capability, Precision vs. Scale, Burnout Risk, Difficulty Saying No", link: "https://roleplay.chat/profile.php?user=Haven" },
  { char: "Michael Greystone", alias: "Lazarus", status: "student", tier: "D", power: "Respawn Resurrection", expression: "Michael’s power only activates after complete death. Once he dies, his body fully restores itself and resurrects him in peak physical condition.\n\nEvery injury disappears.\nEvery wound is erased.\nPoison, blood loss, organ failure, exhaustion — all gone.\n\nIt’s less like healing and more like a full system reset. A biological checkpoint reload.\n\nOver time, repeated deaths have made him harder to kill in the same way twice. Not because he gains new powers, but because experience leaves scars on the mind.\n\nAfter being shot enough times, he reacts faster to guns.\nAfter enough ambushes, his instincts sharpen.\nNot supernatural precognition — just brutal survival conditioning.", drawbacks: "While alive, Michael is completely human.\n\nIf he’s stabbed, he bleeds.\nIf bones break, they stay broken.\nIf he’s dying, he still feels every second of it.\n\nUnless he receives medical treatment… or dies entirely, the damage remains.\n\nWorse still, resurrection does nothing for the psychological damage.\n\nMichael remembers every death in perfect detail.\nThe pain.\nThe panic.\nThe exact moment everything goes black.\n\nThe result is severe psychological trauma: PTSD, night terrors, hesitation triggers, anxiety, and emotional exhaustion that worsen with every resurrection.\n\nThe result is severe psychological trauma: PTSD, night terrors, hesitation triggers, anxiety, and emotional exhaustion that worsen with every resurrection or separation.  \n\nIf decapitated and head kept in a box. His body will not grow head.  His head will not grow a body.  They must come back together for full healing or he stays dead.  If his body doesn't pull itself together first in 1 month, he'll permanently  die..", link: "https://roleplay.chat/profile.php?user=Dead+Man+Walkin" }, // sub:14fea86e
  { char: "Robert Manucharian", alias: "Fool's Gold ", status: "student", tier: "A", power: "Malleable Hydrogel Physiology", expression: "Full-body morphing: reshape limbs, size, and structure at will\nWeapon formation: blades, maces, spikes, shields, tendrils\nElasticity: stretch, compress, and extend for reach and mobility\nDensity control: shift from soft fluid to hardened, armor-like states\nImpact absorption: disperse blunt force through gel structure\nRegenerative reform: reconstruct damaged or displaced mass\n Adaptive defense: harden on contact or react to incoming attacks\nMimicry: replicate faces, voices, and surface-level appearance\nPseudo-gear creation: form armor, clothing, and masks from body\nEnvironmental adaptation: flow through gaps, cling, or anchor to surfaces\n", drawbacks: "His large transformations require focus, and the bigger or more detailed the shape, the harder it is to hold.\n\nHis mimicry is surface-level. He can copy faces, voices, clothing, and body shape, but not true internal biology.\n\nExtreme heat can dry, warp, or destabilize his hydrogel structure.\n\nExtreme cold can stiffen him, slow his movement, or make his body brittle.\n\nStrong electricity can disrupt his cohesion and cause involuntary twitching, melting, or partial collapse.\n\nOveruse makes his form sluggish, unstable, and harder to control.\n\nHeavy damage can scatter his mass, forcing him to spend time pulling himself back together.\n\nComplex weapon forms weaken if he loses concentration.\n\nEmotional spikes make his morphing stronger but messier and less precise.\n\nAble to make a simple projectile: slingshot, bow n arrow, throw a spear or bat. If he dies he must also recover it to be while again. Unable to make complex items like working guns, things with engines, etc.", link: "https://roleplay.chat/profile.php?user=Golden%20Fool" }, // sub:5adf244b
  { char: "Beatrix Moretti", alias: "Bumblebee", status: "student", tier: "C", power: "Apis Bio-Electricity, Vibrational Flight, Stinger Pulses, Resonance Disruption, Swarm Sense, Enhanced Physical Attributes", expression: "Apis Bio-Electricity\nBee generates a specialized form of golden bio-electric energy that behaves somewhere between electricity, vibration, and neurological stimulation. Unlike traditional electrokinesis, her abilities are far less destructive and far more adaptive, designed around movement, disruption, support, and protection. Her energy often manifests through: warm gold light, hexagonal patterns, static-like buzzing, and vibrating pulses that ripple through the air. The more emotionally invested Bee becomes in protecting someone, the more stable and responsive her powers tend to become.\n\n(Out of room: )", drawbacks: "Executive Dysfunction, Sensory Overload, Emotional Vulnerability, Inconsistent Performance, Limited Offensive Power, Physical Fragility, Compulsive Compassion", link: "https://roleplay.chat/profile.php?user=Bumblebee." }, // sub:4e55e98e
  { char: "Viviane Yamaguchi", alias: "VEINGLORY", status: "student", tier: "B", power: "Vital Manipulation · Diagnostic Body Reading · Truth Pulse · X-Ray Vision", expression: "Vital Manipulation — Senses and controls living vital systems at range: heartbeat, blood flow, breathing, nerve signals, muscle tension, blood pressure, pain response, organ stress, and tissue repair. Touch or focused attention allows her to stabilise injuries, alter circulatory pressure, or override motor functions entirely.\n\nDiagnostic Body Reading — Reads body language through vital signs, micro-expressions, breathing shifts, pulse changes, muscle tension, eye movement, blood pressure, and nervous-system spikes. Allows her to detect when someone is lying, hiding fear, masking pain, or suppressing emotion. She does not read minds; she reads the body's involuntary truth.\n\nTruth Pulse — Focused lie-detection. She compares spoken words against heartbeat, breath, stress response, and pulse rhythm. Skilled liars, trained agents, sedatives, emotional numbness, or body-altering powers can interfere.\n\nX-Ray Vision — Natural diagnostic sight regulated by her Vitrex Diagnostic Goggles, allowing her to detect fractures, internal bleeding, organ damage, foreign objects, muscle tears, hidden trauma, and power-related abnormalities. Without the goggles her x-ray sight runs unfiltered, causing sensory overload.", drawbacks: "Requires sustained focus — loss of concentration breaks the effect. Range reduces precision significantly. Crowds and busy environments overwhelm her senses. Physical barriers and armour interfere with vital manipulation. Complex tissue repair is far harder and slower than causing harm. Truth Pulse can be beaten by skilled liars, trained agents, sedatives, emotional numbness, or body-altering powers. Unfiltered x-ray vision causes migraines, nausea, eye strain, nosebleeds, and sensory overload — requires Vitrex Goggles to function safely. Cannot resurrect the dead. Has a deep fear of losing control over her own power.", link: "https://roleplay.chat/profile.php?user=vein" }, // sub:28edfc1f
  { char: "Layla Armstrong", alias: "Hexashift", status: "student", tier: "B", power: "Limb Extension, Teleportation, Superhuman Strength", expression: "Sheeva [Mortal Kombat] x Dhalsim [Street Fighter]", drawbacks: "Can only stretch so far before limbs tear. Can't teleport long distances and can only teleport self.", link: "https://roleplay.chat/profile.php?user=Layla_" }, // sub:6f29a7e1
  { char: "Ren Yamaguchi", status: "inactive", tier: "A", npc: true, power: "Pressure Bloom · Cranial Combustion", expression: "Ren builds invisible pressure inside living tissue — particularly around the skull, brain, and blood vessels. In its passive state this manifests as Pressure Bloom: chronic internal pressure that rebounds into his own body, causing severe migraines, nosebleeds, dizziness, light sensitivity, and fainting spells. At full unrestrained expression — designated Cranial Combustion — the pressure can cause catastrophic internal rupture in a third party. Ren actively suppresses this and the ability is treated as a dangerous medical condition rather than a weapon.", drawbacks: "Pressure rebounds into his own body as often as it targets others — causing chronic migraines, nosebleeds, dizziness, light sensitivity, and fainting. Emotionally influenced; stress worsens both the rebound and the risk of escalation to Cranial Combustion. Age 11, no training, under continuous parental and STRATA supervision. No operational deployment permitted." },
  { char: "Sylvia Strathe", alias: "Silhouette", status: "student", tier: "A", power: "Invisibility · Invisible force constructs · Force-field generation · Stealth", expression: "Sylvia can render herself completely invisible at will — no shimmer, no distortion, no sound. She can also generate invisible force constructs: solid platforms, shields, barriers, and pressure attacks that exist in the air around her but cannot be seen. These constructs appear only as faint glass-like distortions, subtle pressure ripples, or displaced light when active. She uses them offensively as ghost-hand pressure strikes, defensively as full-body force shields, and structurally as invisible platforms she can stand or fly on. Her invisibility and constructs can operate simultaneously — she can be fully invisible while projecting a visible space that others can walk into without knowing it is shielded.", drawbacks: "Powers require sustained concentration — disrupted focus causes constructs to collapse mid-use. Heavy impacts absorbed by her force fields cause direct physical strain and can knock her out of invisibility. Scale is limited as a sidekick — large constructs drain her quickly. Can be detected by thermal imaging, motion sensors, pressure pads, or sound-based tracking even while invisible. Vulnerable if caught off guard at close range before a shield is raised. Overcommitted schedule affects recovery and focus. Perfectionism and fear of failure create performance pressure that can interfere with precision. Recognition issues — her powers are invisible, making her contributions hard to see. Public image pressure from Strata conflicts with dangerous hero work. Family pressure from her uncle's position at Strata creates expectation she cannot always meet. Grief over Solas and emotional weight from the Cassandra tragedy affect her stability under pressure.", link: "https://roleplay.chat/profile.php?user=sylvia" }, // sub:0a936bfa
  { char: "Evan Holloway", alias: "Shadowshade", status: "student", tier: "B", power: "Shadow Phase", expression: "Evan has the ability to merge himself with shadows, traveling undetected through them. He can also create shadow puppets-- obscure phantoms that serve as decoys and distractions.", drawbacks: "His powers make him sensitive to light. He can only travel through pre-existing shadows rather than create them himself. Therefore, in a place without shadows, he's ineffective. When he makes shadow puppets, it leaves him vulnerable and he can't move. ", link: "https://roleplay.chat/profile.php?user=shadowshade" }, // sub:4f166b28
  { char: "Antonie Ciaran Jean-Baptiste ", alias: "Blink", status: "student", tier: "C", power: "Perceptual Momentum, Accelerated Movement, Blink-Stepping, Kinetic Amplification, Enhanced Physical Attributes", expression: "Perceptual Momentum\nAnton's powers are rooted in an unusual interaction between motion, awareness, and observation. Whenever visual perception of him is interrupted—whether through blinking, darkness, distraction, obstructions, or broken lines of sight—his body becomes capable of generating and sustaining dramatically greater momentum. These brief gaps in perception allow him to move, accelerate, and reposition with an efficiency that defies conventional physics. While he remains superhumanly fast under normal conditions, his capabilities increase substantially whenever opponents lose track of him, making him particularly dangerous in chaotic or low-visibility environments.\n\n(Ran out of room: https://docs.google.com/document/d/1BpcGeUwCd0GUXmPm5R_WotVuyhtirGBWgK9AaaBHtrE/edit?usp=sharing)", drawbacks: "Continuous Observation, Momentum Dependency, Neurological Strain, Escalation Feedback, Emotional Triggers, Reputation & Political Scrutiny, Risk-Seeking Behavior, Family Entanglements", link: "https://roleplay.chat/profile.php?user=Blink" }, // sub:f174fc2c
  { char: "Daniel Hightower", alias: "Siege", status: "student", tier: "A", power: "Hardlight Manipulation", expression: "Daniel can generate and control solidified photonic energy, forming opaque pale-blue constructs with tangible mass and durability. Unlike ordinary light, these creations possess physical substance and can withstand tremendous force before breaking apart into shimmering fragments.\n\nThe versatility of this power allows Daniel to create barriers, platforms, restraints, tools, weapons, shelters, bridges, and countless other structures. While simple constructs can be produced almost instantaneously, larger or more complex creations require greater concentration and energy expenditure.", drawbacks: "Every active construct occupies a portion of Daniel's attention.\nMaintaining a single barrier requires little effort, but coordinating dozens of structures simultaneously places immense strain on his concentration. As the number, complexity, and scale of his constructs increase, so does the likelihood of mistakes, delays, or structural failures.\n\nHardlight generation demands substantial energy.\nSmall constructs can be maintained for extended periods, but large fortifications, sustained battles, or repeated reconstruction rapidly drain Daniel's reserves. Extended overuse can result in severe exhaustion, dizziness, nausea, muscle weakness, and eventual collapse.\n\nDaniel excels when he has time to establish defenses and control the battlefield.\nOpponents who constantly relocate, force rapid repositioning, or prevent him from setting up layered defenses can significantly reduce his effectiveness.", link: "https://roleplay.chat/profile.php?user=Siege" }, // sub:64886309
  { char: "Nina Sterling Evergreen", alias: "Crown", status: "student", tier: "A", power: "Auric Transmutation, Gilded Reinforcement, Auric Conduction, Living Treasury Mutation, Treasury State, Enhanced Physical Conditioning", expression: "Auric Transmutation\nNina possesses the ability to transmute organic and inorganic matter into a living auric-gold state through touch, conductive spread, and focused activation. Unlike ordinary metallic conversion, her auric matter remains partially reactive to her influence, allowing her to reinforce, crystallize, reshape, weaponize, or immobilize affected material. While highly controlled under normal circumstances, emotional destabilization can cause involuntary transmutation responses and uncontrolled auric spread.\n\n(Out of room: https://docs.google.com/document/d/1TlmyWRN8COQD81OgLJyCbB8oL9GpnW0BMQ85WhnkNLc/edit?usp=sharing)", drawbacks: "Emotional Destabilization, Conductive Vulnerability, Metabolic Strain, Escalation Risk, Treasury State Instability, Physical Contact Anxiety", link: "https://roleplay.chat/profile.php?user=Crown." }, // sub:ae27911b
  { char: "Helena Claire Fairchild", alias: "Facet", status: "faculty", power: "Facet Duplication, Shared Consciousness & Reintegration, Enhanced Physical Attributes", expression: "Facet Duplication\nHelena's primary ability allows her to create independent duplicates of herself known as facets. Each facet is a complete version of Helena at the moment of creation, possessing her memories, personality, knowledge, and abilities. Once separated, facets begin accumulating their own experiences, perspectives, and emotional responses to the world around them. When Helena chooses to reintegrate, she absorbs the memories, emotions, knowledge, and experiences of each facet, allowing her to learn and grow at a significantly accelerated rate compared to most individuals. While many assume her ability is valuable because it allows her to be in multiple places simultaneously, Helena considers the true strength of her power to be the accumulation of experience and understanding.\n\n(Full info: https://docs.google.com/document/d/1NVFHpdaFTz5GGq5lwuyfiSST6TMrec72s9NaOynqzo8/edit?usp=sharing)", drawbacks: "Emotional Accumulation, Psychological Fragmentation, Attachment to Her Facets, Sensitivity to Violence, Difficulty Letting Go, Curiosity Over Practicality, Reluctance to Ask for Help", link: "https://roleplay.chat/profile.php?user=Facet" }, // sub:0b8ec5aa
  { char: "Eric Winters", alias: "Ice King", status: "faculty", power: "Cryokinetic Manipulation", expression: "Eric possesses the ability to generate, shape, control, and manipulate ice and cold energy on a highly advanced level. By extracting heat from his surroundings and introducing intense cryogenic energy, he can freeze moisture in the atmosphere, create solid ice from seemingly nothing, and reshape frozen matter according to his will. His powers are equally effective in offense, defense, rescue operations, and environmental control, making him one of the more versatile heroes associated with Calderyn and STRATA. Rather than relying solely on overwhelming force, Eric excels at controlling the pace, flow, and terrain of a confrontation.\n\nAt the foundation of Eric's abilities lies his capacity to remove heat from objects, environments, and living targets. Metal can become brittle, water can freeze instantly, and entire areas can rapidly lose temperature under his influence. ", drawbacks: "Extreme heat-based abilities represent one of Eric's most direct counters. Fire manipulators, plasma users, thermal controllers, and high-temperature environments can rapidly weaken his constructs, reduce the effectiveness of his freezing techniques, and force him to expend significantly more energy to maintain control. While he can still operate under such conditions, doing so becomes considerably more taxing and less efficient.\n\nAlthough Eric is dangerous from the moment a fight begins, his greatest strengths emerge after Winter Domain has been established. Opponents capable of overwhelming him early, forcing constant repositioning, or denying him opportunities to expand his influence can significantly reduce the effectiveness of his most powerful abilities. He excels in prolonged engagements but is less dominant during the opening moments of a confrontation.", link: "https://roleplay.chat/profile.php?user=IceKing" }, // sub:cd87514f
  { char: "Roan Aoibhinn Marie O'Malley", alias: "Ricochet", status: "student", tier: "C", power: "Kinetic Rebound Physiology, Enhanced Physicality, Impact Resistance", expression: "Kinetic Rebound Physiology\nRoan's power revolves around a unique kinetic physiology that allows her body to absorb, redirect, store, and manipulate momentum through controlled impacts. Rather than stopping when force is applied, her body instinctively converts that force into movement and acceleration. Every ability she possesses stems from this singular power source, allowing her to transform collisions, falls, and environmental interactions into opportunities for mobility, offense, and rescue. What appears chaotic from the outside is, in reality, an increasingly refined relationship between Roan and the physics surrounding her.\n\n(Full info: https://docs.google.com/document/d/1JcnFh-aQt1yGx_QSRuHtybDxG4YHXK_gEJqRz5M3X7w/edit?usp=sharing)", drawbacks: "Momentum Dependency, Collision Risk, Escalation Hazard, Human Error, Environmental Dependence, Physical Wear and Tear, Emotional Instability, Protective Instinct, Isolation Through Difference\n", link: "https://roleplay.chat/profile.php?user=Ricochet!" }, // sub:281a65e1
  { char: "Nike Navarro", alias: "SEAFOAM", status: "student", tier: "C", power: "Hydrokinesis · Water Nymph Physiology", expression: "Seafoam possesses an innate connection to water, functioning as both conduit and catalyst. Rather than controlling water through force, she influences it through instinct, emotion, and proximity, causing nearby moisture to respond as naturally as a limb. Water gathers around her in flowing ribbons, spirals, droplets, and seafoam-like currents that move with graceful, organic motion. She can draw from oceans, rivers, rain, humidity, and other nearby sources to create barriers, tendrils, platforms, waves, and currents. More subtle applications allow her to sense disturbances through water, perceive through reflective surfaces, and accelerate healing with purified water. Her powers intensify near large bodies of water and during storms, often accompanied by drifting droplets, rippling reflections, glowing seafoam, and the distant sound of waves.", drawbacks: "Seafoam's abilities are heavily dependent on the presence of water. While she can manipulate moisture in the air, arid environments, extreme heat, and prolonged drought significantly reduce her effectiveness. Large-scale constructs and sustained hydrokinesis rapidly drain her stamina, causing physical exhaustion, dehydration, and loss of focus. Her healing abilities require clean, accessible water and cannot repair severe injuries instantly. Contaminated or magically altered water is difficult to control and may disrupt her powers entirely. Emotional distress can also affect her control, causing currents, waves, or seafoam manifestations to react unpredictably. Although resistant to aquatic pressure and cold, she remains physically vulnerable when caught without sufficient water nearby and cannot maintain advanced abilities indefinitely.", link: "https://roleplay.chat/profile.php?user=seafoam" }, // sub:fc774fe5
  { char: "Damian Hollister", alias: "Silverweave", status: "student", tier: "B", power: "Clothing Manipulation, Fabric Awareness, Enhanced Physicality", expression: "Clothing Manipulation\nDamian’s primary ability allows him to manipulate textiles and clothing that are actively being worn by another person or himself. Unlike telekinesis, his power does not extend to loose objects or fabrics not currently in physical use. Once contact or awareness is established, however, he can exert remarkable control over tension, movement, compression, and directional force within garments.", drawbacks: "Limited Target Scope, Physically Outmatched, Overstimulation & Sensory Strain", link: "https://roleplay.chat/profile.php?user=Silverweave" }, // sub:80ffafe1
  { char: "Roger Lee", alias: "Dragon Force", status: "student", tier: "B", power: "Draconic Force", expression: "The foundation of Roger's power. Roger possesses an extraordinarily potent life-force that continuously fuels and reinforces his body. By consciously directing this energy, he can temporarily amplify his physical abilities beyond their already enhanced baseline. Roger can channel Draconic Force into physical transformations that progressively alter his body. The greater the manifestation, the greater the strain and energy consumption. Roger can project Draconic Force externally as visible crimson-gold energy. At maximum output, the aura can take the shape of an enormous spectral dragon surrounding his body. By compressing Draconic Force within specialized respiratory organs created through manifestation, Roger can unleash devastating ranged attacks. Roger naturally projects a powerful aura of confidence, determination, and authority. This effect becomes noticeably stronger during active combat situations. Roger has received extensive formal martial arts instruction from an early age.\n", drawbacks: "Roger possesses a strong competitive streak and can become emotionally invested in conflicts.\nMaintaining high-level manifestations requires enormous amounts of energy.\nDraconic Force responds strongly to Roger's emotional state.\nRoger places tremendous value on protecting friends, teammates, and innocent bystanders.\nRoger dislikes appearing weak, incapable, or dependent on others.\nWhen actively utilizing Dragon Force, Roger becomes extremely difficult to ignore.\nBecause of his strained relationship with his father and his dislike of abusive authority figures, Roger can react poorly to individuals he perceives as arrogant, controlling, or hypocritical.\nMany of his failures stem not from lack of capability, but from acting before fully considering the consequences of his actions. This is the single greatest obstacle standing between Dragon Force and true A-List status.", link: "https://roleplay.chat/profile.php?user=Dragonforce" }, // sub:2c8ebbe7
  { char: "Jane Doe", status: "expendable", tier: "E", power: "Pathokinesis · Living & Ability Infection", expression: "One contagion expressed as many fevers — Jane's body sickens whatever it touches, and the form the sickness takes depends only on the host. MIASMA — a passive, unswitchable corrupting field: flowers brown, food turns, the healthy near her pick up chills and fog. It sickens her own side exactly as it sickens a threat, which is why she is kept behind glass. THE BITE — her only controlled expression: filed teeth break skin and the host decides the result. Into flesh, festering necrosis; into a powered person, a fever in the gift itself (a healer's mends scar, a light-thrower casts shadow, a teleporter drags a screaming echo); into a mind, slow warm delirium and a sick child's compliance. Fevers break on their own; necrosis does not. THE BREAKOUT — involuntary: fear, lost control, or running her venom dry slams the dial back to the setting she was born at, the field turning acute and, at full, the Bloom — her own body opening into necrotic growth she can neither choose nor steer. PATIENT ZERO — immune to every disease, poison, and biological attack there is, including her own. Mute since birth, held in containment since the hour she was born; the Dean's nullification field is the only thing that switches her off.", drawbacks: "Indiscriminate at the root — the miasma and the delirium do not pick sides, and the bite ferments differently in every host, so she cannot choose the fever she causes. Fear is a trigger she cannot disarm, which makes her most lethal the instant she is most frightened. Her venom is finite, and biting runs her down toward the Breakout. Her one controlled attack needs teeth in skin, and she is physically frail: immune to sickness, but a blade, a bullet, a fall, or the cost of her own Bloom kills her as easily as anyone — more easily. A nullifier shuts her off completely; the Dean's field is both the leash and the only peace she has known.", link: "https://roleplay.chat/profile.php?user=jane" },
  { char: "Marina Warbeck", alias: "Shutter", status: "student", tier: "C", power: "Frame Control — photography-based moment manipulation", expression: "Marina affects only what she can clearly frame — through a camera lens, photo, screen, mirror, finger-rectangle, or focused sightline. Visuals lean on camera flashes, frame lines, film grain and suspended dust. Core aspects: Shutter Freeze (briefly freezes a framed subject mid-motion, her signature), Refocus (sharpens perception of tiny details and tells), Exposure (makes existing physical evidence stand out), Motion Blur (smears her own movement to dodge), Crop (a fragile rectangular boundary to shield or contain), Retake (redoes her own last 1–2 seconds of movement), Suspension (briefly hovers framed objects/people; no true flight), Replay (steps into old photos to relive them as memory-imprints), Extract (pulls a temporary copy of a small non-living object from a photo), Contact Sheet (compares related photos for patterns), and Darkroom Focus (deep concentration to combine abilities). Built for support, rescue, investigation and evidence-gathering rather than brute force.", drawbacks: "Everything needs a frame, focus point, or image — no clear sightline means no power. Effects are brief and small-scale: freezes last only seconds, boundaries are fragile and break under force, suspension can't lift heavy subjects and gives no real flight. Living people are far harder to freeze or hold than objects. Extracted objects are temporary and fade; they only work on small non-living things actually visible in the photo, never people or animals. Replay can't change the past, bring anyone back, or give perfect answers — memory-imprints are biased and incomplete, and lingering too long is overwhelming. Overusing Suspension, Motion Blur, Retake or Extract causes dizziness, nausea, headaches and flash-spots. She's weakest in chaotic combat where she can't concentrate, is clumsy under pressure, panics when attention is on her, and misreads evidence when biased. No mind-reading, reality-warping, no true time travel.", link: "https://roleplay.chat/profile.php?user=shutter" }, // sub:7287dcac
  { char: "Indigo Sky", alias: "The Blue Bard", status: "student", tier: "C", power: "Core: Total Self-Awareness /  Secondary: Object Scaling", expression: "Total Self-Awareness :\nEidetic Memory: Near-perfect recall of anything he has seen, heard, read, or experienced.\nHyperthymesia:  Detailed autobiographical memory, allowing him to remember personal experiences with extreme accuracy.\nEnhanced Observation: Notices tiny details, changes, clues, body language, flaws, and inconsistencies others miss.\nSpatial Awareness: Understands his position, distance, movement, angles, balance, and surroundings with exceptional precision.\nProximity Awareness : Tracks people, movement, and objects within his immediate awareness range.\nEmotional Awareness: Identifies and understands his own emotional reactions in real time.\nInformation Cataloging: Metally organizes people, places, objects, events, and details for later recall.\nRapid Recall: Pulls up stored information almost instantly when needed.\n\nObject Scaling: Can increase or decrease the size of non-living objects while maintaining their functionality and proportional properties.", drawbacks: "Diagnosed: Schizotypal Personality Disorder and a systematized delusion\nHe was diagnosed before he ever got powers.  Powers lead to full delusions of grandeur. \nHis psychosis comes in the form of hallucinations of Hud Screens.  His powers, his life, and everything between he brought to him through HUD Screens and Videogame/Dungeon N Dragons style storytelling and narration.\nBecause of this he and his abilities can also be manipulated.\nEX:\nObject Scaling: Subconscious ability. Any bag he touches he believes is a bag of holding.  Shrinking and growing as he pulls them in and out of the bag.  He can not just grow/shrink things cause he chooses to.\nPeople: All exist on radar map hud as NPCs until categorized, friend, enemy etc. If one convinced him they had an invisible cloak on, they'd literally be removed from his radar and vision. \nSide quests: He may be distracted and  go off to do something expecting to get XP.\n", link: "https://roleplay.chat/profile.php?user=Player%20One" }, // sub:201f9ded
  { char: "Eira Skarsen", alias: "Svalinn", status: "student", tier: "C", power: "Purification, Purification Reservoir, Enhanced Physiology", expression: "Purification\nEira's primary ability allows her to identify, remove, contain, redistribute, and condense contaminants, corruption, instability, and harmful influences from living organisms, objects, energies, environments, and certain abstract systems. She can purge toxins, diseases, radiation, biological abnormalities, environmental pollutants, and various forms of power-induced corruption, making her one of the most versatile support-oriented students at Calderyn. Her power does not destroy contamination; it relocates, stores, condenses, or redistributes it according to the laws governing her ability. \n\n(https://docs.google.com/document/d/1FvVLpvzutxisNJcNifUpKiWuqrhsumb9wxLThsvG31I/edit?usp=sharing)", drawbacks: "Conservation of Contamination, Reservoir Accumulation, Ethical Redistribution, Subjective Classification, Limited Direct Offense, Intellectual Obsession", link: "https://roleplay.chat/profile.php?user=Svalinn" }, // sub:75878f9d
  // AUTO-INSERT:powers — approved Student form powers-registry entries get inserted directly above this marker by the relay Worker. Do not remove.
],

powerStatuses: [
  { id: "student",      label: "Student",      bg: "#1e40af", text: "#fff",    desc: "Enrolled at Calderyn College. Tier is provisional — locked in sophomore year, reviewed every spring after that. Day-to-day life: house residence, Power Theory faculty, mandatory training. Higher-tier students get earlier handler attention, sponsorship scouts, and STRATA liaison meetings starting sophomore year. Lower-tier students train, sit exams, and wait." },
  { id: "vanguard",     label: "Vanguard",     bg: "#d4901a", text: "#1a0e00", desc: "STRATA's flagship unit. Four members, capped, household names. Vanguard contracts are negotiated separately from the standard A-list contract and operate at international response scale. Every member is also classified A-List for tier purposes — Vanguard is a role, not a tier. Currently: Paragon (Unit Leader), Vigil and Aegis (Field Operatives), Switchboard (Specialist)." },
  { id: "strata",       label: "STRATA",       bg: "#e31b23", text: "#fff",    desc: "Under active STRATA contract. Deployment, schedule, public messaging, sponsorship, and travel are all coordinated through your handler team — the size of which scales to your tier. STRATA decides where you go, what you say, and what your face is worth this quarter. Contracts are typically multi-year and the exit clauses are deliberately not in the brochure." },
  { id: "faculty",      label: "Faculty",      bg: "#15803d", text: "#fff",    desc: "Calderyn staff with a registered ability. Most faculty contracts include a field-deployment clause that suspends external operations during teaching terms — instruction or admin work only. Some faculty negotiate exceptions for ongoing field roles (the Diagnostic Wing director still runs Vanguard tech support; the Dean's nullification field is on call for crisis events on campus). Some are former A-listers cooling off after a bad press cycle. Some never made the leagues at all." },
  { id: "unsanctioned", label: "Unsanctioned", bg: "#0e0e10", text: "#ff2a32", desc: "Operating without a STRATA contract. Independent vigilantes, hostiles, rogue former assets, and anyone who registered but declined a contract. STRATA tracks them, estimates their tier internally, and decides case-by-case whether to recruit, contain, or ignore. Most know they're being watched. Concealment of a registered power outside contract structure is a Class III violation." },
  { id: "inactive",     label: "Civilian",     bg: "#54545c", text: "#fff",    desc: "Registered with STRATA, no operational contract, no active deployment. The largest group on the registry by a wide margin. Includes anyone who chose civilian life from the start (a baker who can heat his ovens with a glance, a nurse with low-grade healing, an office worker who pulls files telekinetically), retired operatives who walked away from a contract, dormant supes whose powers have not manifested in years, and deceased registry entries kept on file as historical record. STRATA tracks tier and ability for the registry, but does not assign handlers, dictate deployment, or restrict daily life. Civilian status is the default outcome for any registered ability whose owner does not want to be a hero." },
  { id: "expendable",   label: "Expendable",   bg: "#241c1c", text: "#cf8e8e", desc: "Not a contract — a use. A registered ability with no market and no field value, retained because the body carrying it furthers research: 'for the good of supekind' on the record, and STRATA's product pipeline off it. An Expendable is not deployed — it is drawn from: an immune or filtering body dosed with compounds no ethics board would clear. On paper it is already dead — no oversight, no next of kin, no exit. The classification appears on the public registry in name only; the roster behind it is sealed, and there is exactly one name on it." },
],

restrictedPowers: [
  {
    name: "Pressure Bloom",
    holder: "Ren Yamaguchi",
    reason: "Capability for catastrophic internal rupture in third parties exists at full expression, though holder actively suppresses use. Power rebounds into holder's own body — treated as a dangerous medical condition rather than a weapon. Holder is age 11, under continuous parental and STRATA supervision. No operational deployment permitted under any circumstances. Registry entry maintained for monitoring."
  },
  {
    name: "Patient Zero",
    holder: "Jane Doe",
    reason: "Passive necrotising contagion field that cannot be fully suppressed; at full involuntary expression — the Bloom — causes lethal area necrosis the holder can neither choose nor steer. Mute, held in containment since birth, classified Expendable (Pharmacological). No operational deployment under any circumstances. Containment depends on a standing nullification contingency — the Dean — exactly as on the night of the index event. Registry entry maintained for monitoring; identity sealed."
  },
],

bannedPowers: [
  "Full reality rewriting or universal creation/erasure",
  "Time travel or paradox-creating temporal manipulation — plot-locked: only one slot for this ability exists, and it is taken.",
  "Power absorption — plot-locked: only one slot for this ability exists, and it is taken.",
  "Permanent complete mind destruction or total memory wiping",
  "Mass resurrection or wide-scale death negation",
  "Necromancy — raising, animating, or commanding the dead as servants, soldiers, or controllable bodies. Speaking with the dead in flavour-only, non-combat ways may be approved on a case-by-case basis.",
  "True personal immortality or unkillability — abilities that remove any condition under which the character can die. Long lifespans, heavy regeneration, and self-resurrection on a cooldown are tier-gated and approved case-by-case; \"cannot be killed\" is not.",
  "Universal simultaneous telepathy — every mind at once",
  "Dimensional collapse or pocket-universe creation",
  "Mass cellular rewriting affecting third parties without their knowledge",
  "Reproductive interference, fertility manipulation, or pregnancy alteration",
  "Wartime-equivalent destructive output (Geneva 2009 — supes are barred from active war zones, and abilities scaled to that line will not be approved for civilian play)",
  "Anything that breaks the registry's one-expression-per-character rule",
],

powerTiers: [
  {
    id: "a", tier: "A", label: "A-LIST",
    tagline: "The face on the billboard.",
    bracket: "Global Flagship",
    deployment: "Global crisis response. International ops. STRATA elite field unit. Press-facing by default.",
    ceiling: "Flagship endorsements. Solo IP. Biopic-tier PR. Cereal boxes, action figures, fragrance lines.",
    cost: "Full handler team. 30-day registration deadline. Every public appearance logged. Burnout rate is not in the brochure.",
    slots: "Mandatory full STRATA registration. Handler team assigned within 30 days. Annual reassessment. Capped at 10 active A-list slots — application requires admin conversation before submission.",
    color: "#e31b23", accent: "#ff2a32",
  },
  {
    id: "b", tier: "B", label: "B-LIST",
    tagline: "Reliable. Dangerous. Working.",
    bracket: "Regional / Team",
    deployment: "Regional hero contracts. STRATA field agent. Private security lead. Rescue and response unit.",
    ceiling: "Regional endorsements. Team IP only — no solo. Entertainment and stunt work on the side.",
    cost: "Annual reassessment. Public-use registration. Most working supes are here. Not glamorous, but it pays.",
    slots: "Full STRATA registration. Single handler assigned. Annual reassessment.",
    color: "#1e40af", accent: "#3a5ab8",
  },
  {
    id: "c", tier: "C", label: "C-LIST",
    tagline: "Specialist. Sidekick. Support.",
    bracket: "Private / Niche",
    deployment: "Sidekick or team member. Investigation, medical support, consulting. Local hero work.",
    ceiling: "Local endorsements only. No solo IP. Occasional reality TV.",
    cost: "Standard monitoring. Often paired with combat training to stay relevant. The unsung middle of the roster.",
    slots: "Standard registration. Shared handler or team liaison. Biennial check-in.",
    color: "#15803d", accent: "#2e7f57",
  },
  {
    id: "d", tier: "D", label: "D-LIST",
    tagline: "A power that helps. Not one that pays.",
    bracket: "Unmarketable",
    deployment: "Civilian career with an edge. Niche consulting. Private contracts. STRATA won't call.",
    ceiling: "No endorsements. No monitoring beyond registration. You are not famous.",
    cost: "None — except the career you could have had if your power had landed anywhere else.",
    slots: "Registration on file. No active monitoring. No handler.",
    color: "#54545c", accent: "#8a857e",
  },
  {
    id: "e", tier: "E", label: "EXPENDABLE", hideList: true,
    tagline: "Not sold. Spent.",
    bracket: "Below Market · Research Asset",
    deployment: "Not deployed — drawn from. A power with no market and no field value, kept only because the body carrying it is useful to research that 'furthers supekind' (the official line) and STRATA's product pipeline (the real one). One subject on the books: an immune physiology dosed with compounds no trial could clear.",
    ceiling: "None. No name, no contract, no exit. On paper, most are already dead.",
    cost: "Everything. There is no version of this that comes with a salary.",
    slots: "Not applied for — assigned. A contract implies someone who can refuse.",
    color: "#6b3a3a", accent: "#8a4a4a",
    types: [
      { name: "Pharmacological", nickname: "The Vial", use: "Immune or hyper-filtering physiologies dosed with drugs, toxins, suppressants, and anti-powered agents at any concentration — no body count on the books." },
    ],
  },
],

clubs: [
  {
    name: "Powerball",
    bg: "#c41a1a",
    category: "Athletics",
    access: "House tryout",
    tag: "STRATA-SPONSORED COLLEGIATE LEAGUE",
    desc: "Calderyn's marquee sport. The most-watched event on campus and a viable post-graduation career — the college league feeds the pros, with scouts at every Friday night match.",
    rules: {
      summary: "Six-on-six on a three-elevation court split at midfield. Each side fields one Playmaker, two Attack, two Defence, and one Goalkeeper. Attack stays in the attacking half; Defence stays in the defending half; the Goalkeeper is locked to the goal area; the Playmaker plays anywhere. Catching the ball freezes you in place — you have four seconds to pass before possession drops. The Playmaker is the only exception: they can move while holding the ball, but the four-second clock still applies. Only Attack can score, and only from inside the scoring zone. Powers are legal against the ball, the environment, and other players, within injury limits. The pass — and the Playmaker's carry — is the entire game.",
      format: [
        "Four quarters, twelve minutes each. Running clock except on dead balls and medical pauses.",
        "Active line-up: 1 Playmaker · 2 Attack · 2 Defence · 1 Goalkeeper. Bench: a full Reserves Squad with one reserve per starting role.",
        "The ball is INDESTRUCTIBLE — engineered composite that no registered power can vaporise, dissolve, fracture, melt, or permanently deform. It can only be moved.",
        "Receivers cannot pass back to the same player who served them. No self-pass loops.",
        "Every score is one point. No multi-point shots.",
        "Each quarter opens with a serve from midcourt by the Playmaker of the team awarded the serve (alternating quarters; coin toss for Q1). After every score, the conceding Playmaker serves from their own goal line. The serve must clear midcourt before any teammate may receive it.",
        "Each team names a Team Captain pre-game — any starter — who wears the C, leads the line-up, addresses referees, and may issue one official challenge per game.",
        "One captaincy per writer — no one wears the C for more than one team, counted across all of their characters.",
        "Tiebreaker is sudden death on a half-size single-elevation court, four players per side.",
      ],
      violence: "Powers may disable, displace, restrain, intercept, or knock down opposing players. Powers may NOT inflict bleeding wounds, fractures, burns above first-degree, or any injury requiring more than on-bench medical attention. The rule is enforced; it is also broken. Powerball has the highest in-season injury rate of any collegiate sport in the country, and STRATA's medical insurance for league players is the most expensive line item in the athletic department's budget. Three personal fouls = ejection. Flagrant fouls (deliberate injury, attack on a downed player or referee, holding past the four-second count, crossing midline outside Playmaker permissions, leaving the goal area as Goalkeeper) = automatic ejection plus a minimum two-game suspension. A career-ending flagrant triggers league review and possible permanent ban.",
      career: "Powerball is one of two viable career paths for a powered graduate who does not want a STRATA hero contract. The professional league — the PBL — drafts roughly forty players a year out of the four major collegiate programs in the country. Calderyn is one of those four. Top picks sign multi-year deals in the seven figures plus sponsorships; mid picks earn the same as a B-list STRATA hero with significantly less paperwork and no contractual obligation to die. Career length averages five seasons. Career-ending injuries are common. Calderyn graduates drafted directly into the PBL are tracked as a separate honour from the Vanguard pipeline.",
      roles: [
        { name: "Playmaker", tagline: "1 per side · The only role that can move with the ball.", desc: "The court's only mobile possession unit. Engine of every offence and primary target of every defence. The position rewards reading the court above all.", best_for: "Mobility powers — speed, flight, short-range teleport, parkour-coded enhancement, evasion, environmental traversal." },
        { name: "Attack", tagline: "2 per side · The only role that can score. Locked to the attacking half.", desc: "Holds position in the attacking half, works to receive in the scoring zone, and converts. Pro scouts watch this pair first — every highlight reel is built here.", best_for: "Powers that fire from a standstill — short-range teleport, kinetic projection, force pulses, body-armoring abilities." },
        { name: "Defence", tagline: "2 per side · Disrupts before the goal area. Locked to the defending half.", desc: "The pressure layer. Splits coverage between the deeper court and the edge of the goal area, intercepting passes and breaking up plays before the Goalkeeper has to make a save.", best_for: "Force-field, barrier, gravity, sensory, telekinetic, or rapid-reaction powers — anything that contests space across the defending half." },
        { name: "Goalkeeper", tagline: "1 per side · Last line. Locked to the goal area.", desc: "Stands between the ball and the goal line. Confined to the painted goal area at their own end of the court — leaving it is a flagrant. Every save is a four-second window against an Attack already inside the scoring zone. The position is purely reactive, brutally exposed, and the most-replayed clip from any match.", best_for: "Deflection, force-field, barrier, body-armoring, or rapid-reaction powers. Anything that can stop or redirect a projectile in the moment it arrives." },
      ],
    },
    teams: [
      { house: "Valaris", bg: "#c41a1a", train: ["MON · 6:00 AM", "WED · 7:00 PM"], positions: [
        { pos: "Playmaker", char: "Tyler Caldwell", link: "https://roleplay.chat/profile.php?user=BLACK+VEIN" },
        { pos: "Attack", char: "Katniss Saunders", link: "https://roleplay.chat/profile.php?user=Katniss" }, { pos: "Attack", char: "Rhode Sterling", link: "https://roleplay.chat/profile.php?user=chronicles" },
        { pos: "Defence", char: "Riley Carter", link: "https://roleplay.chat/profile.php?user=pressure" }, { pos: "Defence", char: "Sylas Luftborne", link: "https://roleplay.chat/profile.php?user=Airborne" }, // sub:fcdbf13d
        { pos: "Goalkeeper", captain: true, char: "Enzo Krüger", link: "https://roleplay.chat/profile.php?user=Starboy!" },
        { pos: "Reserve · Playmaker" },
        { pos: "Reserve · Attack" }, { pos: "Reserve · Attack" },
        { pos: "Reserve · Defence" }, { pos: "Reserve · Defence" },
        { pos: "Reserve · Goalkeeper" },
        { pos: "Reserve · Playmaker", char: "Roan Aoibhinn Marie O'Malley", link: "https://roleplay.chat/profile.php?user=Ricochet!" }, // sub:281a65e1
        { pos: "Reserve · Attack", char: "Roger Lee", link: "https://roleplay.chat/profile.php?user=Dragonforce" }, // sub:2c8ebbe7
      ]},
      { house: "Orenne", bg: "#d4901a", train: ["TUE · 6:00 AM", "THU · 7:00 PM"], positions: [
        { pos: "Playmaker", captain: true, char: "Jason McTavish", link: "https://roleplay.chat/profile.php?user=stormcaller" },
        { pos: "Attack" }, { pos: "Attack" },
        { pos: "Defence", char: "Ariana Ferreira", link: "https://roleplay.chat/profile.php?user=Morpha" }, { pos: "Defence" },
        { pos: "Goalkeeper" },
        { pos: "Reserve · Playmaker" },
        { pos: "Reserve · Attack" }, { pos: "Reserve · Attack" },
        { pos: "Reserve · Defence" }, { pos: "Reserve · Defence" },
        { pos: "Reserve · Goalkeeper" },
        { pos: "Goalkeeper", char: "Robert Manucharian", link: "https://roleplay.chat/profile.php?user=Golden%20Fool" }, // sub:5adf244b
      ]},
      { house: "Saberis", bg: "#15803d", train: ["THU · 6:00 AM", "MON · 7:00 PM"], positions: [
        { pos: "Playmaker", captain: true },
        { pos: "Attack", char: "Sven Skarsen", link: "https://roleplay.chat/profile.php?user=blood+eagle" }, { pos: "Attack" },
        { pos: "Defence" }, { pos: "Defence" },
        { pos: "Goalkeeper" },
        { pos: "Reserve · Playmaker" },
        { pos: "Reserve · Attack", char: "Dexter Crowley", link: "https://roleplay.chat/profile.php?user=Gremlin" }, { pos: "Reserve · Attack" }, // sub:e31100af
        { pos: "Reserve · Defence" }, { pos: "Reserve · Defence" },
        { pos: "Reserve · Goalkeeper" },
        { pos: "Playmaker", char: "Michael Greystone", link: "https://roleplay.chat/profile.php?user=Dead+Man+Walkin" }, // sub:14fea86e
      ]},
      { house: "Grimere", bg: "#1e40af", train: ["FRI · 6:00 AM", "TUE · 7:00 PM"], positions: [
        { pos: "Playmaker", captain: true, char: "Cesare Delgado", link: "https://roleplay.chat/profile.php?user=delgado" },
        { pos: "Attack", char: "Xeno", link: "https://roleplay.chat/profile.php?user=Xenofire" }, { pos: "Attack" }, // sub:953a48bf
        { pos: "Defence", char: "Khan Grimassi", link: "https://roleplay.chat/profile.php?user=Savory" }, { pos: "Defence" }, // sub:51c61fcc
        { pos: "Goalkeeper" },
        { pos: "Reserve · Playmaker" },
        { pos: "Reserve · Attack" }, { pos: "Reserve · Attack" },
        { pos: "Reserve · Defence" }, { pos: "Reserve · Defence" },
        { pos: "Reserve · Goalkeeper" },
      ]},
    ],
    courtNote: "Practice court is open Saturday and Sunday — first come, first served, any house.",
    positions: [
      { pos: "Head Coach" },
      { pos: "Assistant Coach" },
      { pos: "Referee — Senior" },
    ],
    // Six-game round-robin season — Calderyn's collegiate league
    // structure mirrors the four-house format that anchors a
    // British boarding-school sporting year: each house plays each
    // other house exactly once, then the cup is awarded on points.
    // Saberis play all three of their games in the first half of
    // the season; the cup final is between the top two contenders.
    //
    // SCORING ALIGNS WITH CLUB RULES — every score is one point
    // (only Attack can convert, only from inside the scoring zone),
    // so a 48-minute game lands in the 17-30 range per side. Bigger
    // scoreboard numbers seen elsewhere in basketball-style sports
    // would imply hundreds of scoring plays per game; Powerball
    // doesn't work that way.
    //
    // LEAGUE POINTS · standard three-one-zero (3 for a win, 1 for a
    // draw, 0 for a loss). Tiebreakers used on the table sort:
    // (1) league points, (2) goal difference (PF − PA), (3) PF.
    schedule: {
      season: "2025-26",
      pointsForWin: 3,
      pointsForDraw: 1,
      games: [
        { id: 1, date: "2025-10-18", time: "19:00 BST", venue: "Powerball Arena · Greenwich",
          home: "valaris",  away: "saberis", status: "played",
          home_score: 26, away_score: 18,
          mvp: "Tyler Caldwell", mvp_team: "valaris",
          mvp_link: "https://roleplay.chat/profile.php?user=BLACK+VEIN",
          note: "Valaris opened the season with a statement win. Caldwell ran the floor from Playmaker — 14 assists, never lost the four-second clock — and Saberis never recovered from a 6-1 first quarter." },
        { id: 2, date: "2025-11-15", time: "19:00 GMT", venue: "Powerball Arena · Greenwich",
          home: "orenne",   away: "saberis", status: "played",
          home_score: 22, away_score: 17,
          mvp: "Jason McTavish", mvp_team: "orenne",
          mvp_link: "https://roleplay.chat/profile.php?user=stormcaller",
          note: "Orenne controlled possession for 27 of 48 minutes. McTavish set the Calderyn single-game assist record (13) from the Playmaker slot — feeding the Orenne Attack pair into the scoring zone shot after shot." },
        { id: 3, date: "2026-02-07", time: "19:00 GMT", venue: "Powerball Arena · Greenwich",
          home: "grimere",  away: "saberis", status: "played",
          home_score: 25, away_score: 17,
          mvp: "Cesare Delgado", mvp_team: "grimere",
          mvp_link: "https://roleplay.chat/profile.php?user=delgado",
          note: "Grimere finished Saberis's season at 0-3. Delgado assisted 16 of his side's 25 scores from the Playmaker slot — Grimere held possession for 31 minutes flat and never gave up the floor." },
        { id: 4, date: "2026-03-14", time: "19:00 GMT", venue: "Powerball Arena · Greenwich",
          home: "valaris",  away: "orenne",  status: "played",
          home_score: 23, away_score: 21,
          mvp: "Enzo Krüger", mvp_team: "valaris",
          mvp_link: "https://roleplay.chat/profile.php?user=Starboy!",
          note: "Valaris snuck this one out in the final 90 seconds. Krüger turned away 14 Orenne shots from the goal area — three in the final two minutes when the line had collapsed in front of him — to hold the 2-point margin." },
        { id: 5, date: "2026-05-09", time: "19:00 BST", venue: "Powerball Arena · Greenwich",
          home: "valaris",  away: "grimere", status: "played",
          home_score: 21, away_score: 24,
          mvp: "Cesare Delgado", mvp_team: "grimere",
          mvp_link: "https://roleplay.chat/profile.php?user=delgado",
          note: "Upset of the season. Delgado dragged Grimere through Valaris's Defence from the Playmaker slot — 14 assists, possession for 28 of 48 minutes, three of those assists landing in the final eight to seal the 3-point margin. His second MVP of the season." },
        // Cup final shifted off Stella's GOSH-visit Saturday so the
        // Powerball squads aren't being asked to do both in one day.
        // Now sits on the following Saturday — still inside the
        // summer term, evening kickoff back as is normal for the
        // league.
        { id: 6, date: "2026-06-20", time: "19:30 BST", venue: "Powerball Arena · Greenwich · CUP FINAL",
          home: "orenne",   away: "grimere", status: "upcoming",
          home_score: null, away_score: null,
          note: "CUP FINAL · A Grimere win or draw seals the title. An Orenne win on differential could throw it back open." },
      ],
    },
  },
  {
    name: "Cheer Squad",
    bg: "#7a1a4a",
    category: "Performance",
    access: "Tryout",
    tag: "PERFORMANCE — POWERS ENCOURAGED",
    desc: "Performs at every Powerball match and STRATA campus event. Powers are part of the routine — flight, propulsion, force projection, sonic flair, anything choreographed and rehearsed. Coach is a retired A-lister with a clipboard and zero patience for sloppy power control. Sloppy execution is what gets you flagged at the league level, not the powers themselves.",
    meets: ["TUE · 5:00 PM", "THU · 5:00 PM", "GAME DAYS"],
    output: "Performs at every home Powerball match · STRATA campus events · Annual showcase",
    groups: [
      { label: "Leadership", roles: ["Captain"] },
      { label: "Squad", roles: ["Flyer", "Base", "Tumbler"] },
      { label: "Reserves", roles: ["Alternate Flyer", "Alternate Base", "Alternate Tumbler"] },
    ],
    positions: [
      { pos: "Captain", group: "leadership", char: "Celestia \"Stella\" Starkov", link: "https://roleplay.chat/profile.php?user=illuminate" },
      { pos: "Flyer", group: "squad", char: "Valentina \"Tina\" Salvador", link: "https://roleplay.chat/profile.php?user=serpentina" }, { pos: "Flyer", group: "squad", char: "Velora Virelli", link: "https://roleplay.chat/profile.php?user=Filament!" }, { pos: "Flyer", group: "squad" },
      { pos: "Base", group: "squad", char: "Manuel \"Manny\" Glint", link: "https://roleplay.chat/profile.php?user=Crashnburn" }, { pos: "Base", group: "squad" }, { pos: "Base", group: "squad" },
      { pos: "Tumbler", group: "squad" }, { pos: "Tumbler", group: "squad" }, { pos: "Tumbler", group: "squad" },
      { pos: "Alternate Flyer", group: "reserves", char: "Emery Hollister", link: "https://roleplay.chat/profile.php?user=Sweet+Spot" }, { pos: "Alternate Base", group: "reserves" }, { pos: "Alternate Tumbler", group: "reserves", char: "Daphne Callas", link: "https://roleplay.chat/profile.php?user=Verdant!" },
      { pos: "Base", char: "Layla Armstrong", link: "https://roleplay.chat/profile.php?user=Layla_" }, // sub:6f29a7e1
      { pos: "Tumbler", char: "Nina Sterling Evergreen", link: "https://roleplay.chat/profile.php?user=Crown." }, // sub:ae27911b
    ],
  },
  {
    name: "Symphony & Choir",
    bg: "#1e40af",
    category: "Performance",
    access: "Audition",
    tag: "POWERS WELCOME · BLIND AUDITION",
    desc: "Calderyn's combined orchestral ensemble and college choir. Performs at the Dean's dinners, alumni events, the annual memorial service, and one full joint programme each spring. Auditions are blind and any power is welcome — sonic, kinetic, illusory, perceptual, anything that makes the music better. The Music Director cares about the result; argue with the result and they'll show you the door.",
    meets: ["MON · 7:00 PM", "WED · 7:00 PM", "SAT · 10:00 AM"],
    output: "Dean's dinners · Alumni events · Annual memorial service · Annual joint programme",
    groups: [
      { label: "Direction", roles: ["Music Director", "Concertmaster", "Choir Master"] },
      { label: "Orchestra Leads", roles: ["Strings Lead", "Woodwind Lead", "Brass Lead", "Percussion Lead"] },
      { label: "Choir Leads", roles: ["Soprano Lead", "Alto Lead", "Tenor Lead", "Bass Lead"] },
      { label: "Members", roles: ["Member"] },
    ],
    positions: [
      { pos: "Music Director", group: "direction" },
      { pos: "Concertmaster", group: "direction", char: "Damian Hollister", link: "https://roleplay.chat/profile.php?user=Silverweave" }, // sub:07747737
      { pos: "Choir Master", group: "direction" },
      { pos: "Strings Lead", group: "orchestra-leads" },
      { pos: "Woodwind Lead", group: "orchestra-leads" },
      { pos: "Brass Lead", group: "orchestra-leads" },
      { pos: "Percussion Lead", group: "orchestra-leads" },
      { pos: "Soprano Lead", group: "choir-leads" },
      { pos: "Alto Lead", group: "choir-leads" },
      { pos: "Tenor Lead", group: "choir-leads" },
      { pos: "Bass Lead", group: "choir-leads" },
      { pos: "Member", group: "members", char: "Lyrica Malaya Song", link: "https://roleplay.chat/profile.php?user=lyrica" }, { pos: "Member", group: "members" },
      { pos: "Member", group: "members" }, { pos: "Member", group: "members" },
      { pos: "Soprano Lead", char: "Nina Sterling Evergreen", link: "https://roleplay.chat/profile.php?user=Crown." }, // sub:803e09e3
      { pos: "Strings Lead", char: "Marina Warbeck", link: "https://roleplay.chat/profile.php?user=shutter" }, // sub:7287dcac
      { pos: "Member", char: "Eira Skarsen", link: "https://roleplay.chat/profile.php?user=Svalinn" }, // sub:75878f9d
    ],
  },
  {
    name: "Drama Society",
    bg: "#d4901a",
    category: "Performance",
    access: "Open",
    tag: "PERFORMANCE — POWERS INTEGRATED",
    desc: "Two main productions a year — a musical and a straight play — plus occasional devised work. Powers are part of the craft: a flying actor, a telekinetic set change, illusion-based lighting, sonic vocal range. The script gets written around what the cast can actually do. Closest thing on campus to live, choreographed combat performance — minus the bruises.",
    meets: ["TUE · 6:00 PM", "FRI · 6:00 PM", "PRODUCTION WEEKS DAILY"],
    output: "Two productions per year · Devised work as scheduled · Showcase performances",
    groups: [
      { label: "Leadership", roles: ["President", "Artistic Director", "Stage Manager"] },
      { label: "Cast", roles: ["Actor"] },
      { label: "Tech", roles: ["Technical Director", "Lighting", "Sound", "Set"] },
      { label: "Hair & Makeup", roles: ["H&M Lead", "H&M Artist"] },
      { label: "Ensemble", roles: ["Ensemble"] },
    ],
    positions: [
      { pos: "President", group: "leadership" },
      { pos: "Artistic Director", group: "leadership" },
      { pos: "Stage Manager", group: "leadership" },
      { pos: "Actor", group: "cast", char: "Celestia \"Stella\" Starkov", link: "https://roleplay.chat/profile.php?user=illuminate" }, { pos: "Actor", group: "cast", char: "Velora Virelli", link: "https://roleplay.chat/profile.php?user=Filament!" },
      { pos: "Actor", group: "cast" }, { pos: "Actor", group: "cast" },
      { pos: "Actor", group: "cast" }, { pos: "Actor", group: "cast" },
      { pos: "Technical Director", group: "tech" },
      { pos: "Lighting", group: "tech" },
      { pos: "Sound", group: "tech" },
      { pos: "Set", group: "tech" }, { pos: "Set", group: "tech" },
      { pos: "H&M Lead", group: "hair-makeup" },
      { pos: "H&M Artist", group: "hair-makeup" }, { pos: "H&M Artist", group: "hair-makeup" },
      { pos: "Ensemble", group: "ensemble" }, { pos: "Ensemble", group: "ensemble" },
      { pos: "Actor", char: "Indigo Sky", link: "https://roleplay.chat/profile.php?user=Player%20One" }, // sub:201f9ded
    ],
  },
  {
    name: "Debate Club",
    bg: "#15803d",
    category: "Academic",
    access: "Open",
    tag: "INTER-UNIVERSITY CIRCUIT",
    desc: "Competes on the inter-university debate circuit. Policy, parliamentary, Lincoln-Douglas. Telepathic, persuasive, and empathic abilities are barred by league rule. Administration sends a STRATA observer to every home round.",
    meets: ["MON · 7:30 PM", "THU · 7:30 PM"],
    output: "Inter-university circuit · Home round once per term · Nationals if qualified",
    groups: [
      { label: "Leadership", roles: ["Captain", "Vice Captain", "Research Lead"] },
      { label: "Varsity", roles: ["Policy", "Parliamentary"] },
      { label: "Novice", roles: ["Novice"] },
    ],
    positions: [
      { pos: "Captain", group: "leadership", char: "Montgomery Farthing III", link: "https://roleplay.chat/profile.php?user=upchuck" },
      { pos: "Vice Captain", group: "leadership" },
      { pos: "Research Lead", group: "leadership", char: "Damian Hollister", link: "https://roleplay.chat/profile.php?user=Silverweave" }, // sub:32a887a1
      { pos: "Policy", group: "varsity" }, { pos: "Policy", group: "varsity" },
      { pos: "Parliamentary", group: "varsity" }, { pos: "Parliamentary", group: "varsity" },
      { pos: "Novice", group: "novice", char: "Lucrecia Sofìa Avalos-Perez", link: "https://roleplay.chat/profile.php?user=Rosetta!" }, { pos: "Novice", group: "novice" },
      { pos: "Novice", char: "Eira Skarsen", link: "https://roleplay.chat/profile.php?user=Svalinn" }, // sub:c9b5dc5a
    ],
  },
  {
    name: "Cape & Dagger",
    bg: "#2c1d4a",
    category: "Publications",
    access: "Application",
    tag: "STUDENT-RUN NEWS",
    desc: "The student-run news outlet. Campus reporting, investigative features, the Powerball beat, faculty profiles, anonymous tip line. Publishes weekly online and in a printed end-of-term anthology. STRATA reads every issue, has pulled three articles in the last decade, and the editors keep going.",
    meets: ["WED · 8:00 PM", "SUN · 4:00 PM"],
    output: "Weekly online edition · End-of-term printed anthology · Breaking coverage as needed",
    groups: [
      { label: "Masthead", roles: ["Editor-in-Chief", "Managing Editor"] },
      { label: "Section Editors", roles: ["News Editor", "Investigative Editor", "Features Editor", "Sports Editor", "Photo Editor", "Copy Editor"] },
      { label: "Reporters & Columnists", roles: ["Staff Reporter", "Columnist"] },
    ],
    positions: [
      { pos: "Editor-in-Chief", group: "masthead" },
      { pos: "Managing Editor", group: "masthead" },
      { pos: "News Editor", group: "section-editors" },
      { pos: "Investigative Editor", group: "section-editors", char: "Isaac Whitman", link: "https://roleplay.chat/profile.php?user=Swapper" },
      { pos: "Features Editor", group: "section-editors" },
      { pos: "Sports Editor", group: "section-editors" },
      { pos: "Photo Editor", group: "section-editors", char: "Orion Sterling", link: "https://roleplay.chat/profile.php?user=odyssey" },
      { pos: "Copy Editor", group: "section-editors" },
      { pos: "Staff Reporter", group: "reporters-columnists", char: "Quinn O'Hare", link: "https://roleplay.chat/profile.php?user=Kestrel", note: "Photographer · Anonymous tipline" }, { pos: "Staff Reporter", group: "reporters-columnists" },
      { pos: "Staff Reporter", group: "reporters-columnists" },
      { pos: "Columnist", group: "reporters-columnists" }, { pos: "Columnist", group: "reporters-columnists" },
      { pos: "Columnist", char: "Viviane Yamaguchi", link: "https://roleplay.chat/profile.php?user=vein" }, // sub:28edfc1f
      { pos: "Staff Reporter", char: "Evan Holloway", link: "https://roleplay.chat/profile.php?user=shadowshade" }, // sub:4f166b28
      { pos: "Staff Reporter", char: "Daniel Hightower", link: "https://roleplay.chat/profile.php?user=Siege" }, // sub:64886309
      { pos: "Columnist", char: "Lucrecia Sofìa Avalos-Perez", link: "https://roleplay.chat/profile.php?user=Rosetta!" }, // sub:c8aeb013
    ],
  },
],

studentGov: [
  {
    section: "OFFICE OF THE PRESIDENT",
    type: "elected",
    note: "Campus-wide ballot. One-year term. The Student Body President leads the government and chairs the Student Council. Real budget. Administration overrides routinely and without explanation.",
    seats: [
      { pos: "Student Body President", term: "2026–27", char: "Montgomery Farthing III", link: "https://roleplay.chat/profile.php?user=upchuck" },
      { pos: "Treasurer",              term: "2026–27", char: "Sylas Luftborne", link: "https://roleplay.chat/profile.php?user=Airborne" }, // sub:fcdbf13d
      { pos: "Secretary",              term: "2026–27", char: "Natalie Neuman", link: "https://roleplay.chat/profile.php?user=AXIOM" }, // sub:2d32b02d
    ],
  },
  {
    section: "STUDENT COUNCIL — RESIDENT ASSISTANTS",
    type: "elected",
    note: "One House Representative per house, doubling as senior Resident Assistant for that house's dorms. They run house meetings, mediate dorm disputes, oversee underclassman conduct, and report to the President. New club proposals start here — pitch your idea to your RA, and if there's enough demonstrated interest, it gets raised to the President for approval. Term: one academic year. One Senior RA per writer: a writer may hold only one of these seats at a time, counted across all of their accounts.",
    seats: [
      { pos: "Valaris Rep · Senior RA", term: "2026–27", char: "Enzo Krüger", link: "https://roleplay.chat/profile.php?user=Starboy!" },
      { pos: "Orenne Rep · Senior RA",  term: "2026–27", char: "Jason McTavish", link: "https://roleplay.chat/profile.php?user=stormcaller" },
      { pos: "Saberis Rep · Senior RA", term: "2026–27" },
      { pos: "Grimere Rep · Senior RA", term: "2026–27" },
    ],
  },
  {
    section: "EVENT COMMITTEE",
    type: "appointed",
    note: "Appointed by the President. Plans and runs whatever the campus throws at them — formals, mixers, fundraisers, rivalries, sanctioned and otherwise. Budget approval routes through Treasurer. Two seats per writer max: a writer may hold at most two Event Committee seats, counted across all of their accounts.",
    seats: [
      { pos: "Committee Chair" },
      { pos: "Vice Chair" },
      { pos: "Logistics Lead", char: "Xeno", link: "https://roleplay.chat/profile.php?user=Xenofire" }, // sub:953a48bf
      { pos: "Programming Lead" },
      { pos: "Committee Member", char: "Ariana Ferreira", link: "https://roleplay.chat/profile.php?user=Morpha" },
      { pos: "Committee Member", char: "Lucrecia Sofìa Avalos-Perez", link: "https://roleplay.chat/profile.php?user=Rosetta!" },
      { pos: "Committee Member" },
      { pos: "Committee Member" },
      { pos: "Committee Member" },
      { pos: "Committee Member" },
    ],
  },
],

heroLists: [
  {
    tier: "A",
    label: "A-LIST HEROES",
    desc: "Household names below the Vanguard. Headline operators, sponsorship-heavy, own primetime coverage. The working top tier — the heroes everyone knows without needing to ask.",
    req: "A-List tier. Capped at 10 slots — application requires admin conversation before submission.",
    color: "#e31b23",
    slots: [
      { alias: "[Open]", role: "Headline Hero", char: null, power: null },
      { alias: "[Open]", role: "Headline Hero", char: null, power: null },
      { alias: "[Open]", role: "Headline Hero", char: null, power: null },
      { alias: "[Open]", role: "Headline Hero", char: null, power: null },
      { alias: "[Open]", role: "Headline Hero", char: null, power: null },
      { alias: "[Open]", role: "Headline Hero", char: null, power: null },
      { alias: "[Open]", role: "Headline Hero", char: null, power: null },
      { alias: "[Open]", role: "Headline Hero", char: null, power: null },
      { alias: "[Open]", role: "Headline Hero", char: null, power: null },
      { alias: "[Open]", role: "Headline Hero", char: null, power: null },
    ],
  },
  {
    tier: "B",
    label: "B-LIST HEROES",
    desc: "Known. Deployed regularly. Good enough for press releases, not quite good enough for primetime. Capable operators who haven't broken through — or have been deliberately kept from doing so.",
    req: "B-List tier or above.",
    color: "#1e40af",
    slots: [
      { alias: "[Open]", role: "Contracted Hero", char: null, power: null },
      { alias: "[Open]", role: "Contracted Hero", char: null, power: null },
      { alias: "[Open]", role: "Contracted Hero", char: null, power: null },
    ],
  },
  {
    tier: "C",
    label: "C-LIST HEROES",
    desc: "Regional. Niche. Occasionally useful. STRATA keeps them contracted because it's cheaper than letting them go independent. They know this.",
    req: "C-List tier or above.",
    color: "#15803d",
    slots: [
      { alias: "[Open]", role: "Regional Hero", char: null, power: null },
      { alias: "[Open]", role: "Regional Hero", char: null, power: null },
      { alias: "[Open]", role: "Regional Hero", char: null, power: null },
    ],
  },
  {
    tier: "D",
    label: "D-LIST HEROES",
    desc: "Barely known. Struggling. Some are trying to climb. Some have given up. All of them are one bad headline away from having their contract quietly voided.",
    req: "D-List tier. Open to any registered ability.",
    color: "#54545c",
    slots: [
      { alias: "[Open]", role: "Contracted Hero", char: null, power: null },
      { alias: "[Open]", role: "Contracted Hero", char: null, power: null },
    ],
  },
  {
    tier: "E",
    label: "EXPENDABLES",
    desc: "Not heroes. Not contracted. Not free. The classification below the list — a registered ability with no market, held because the body is useful to research. The roster behind it is sealed, and only one name is on it.",
    req: "Expendable classification. Not applied for — assigned.",
    color: "#6b3a3a",
    slots: [
      { alias: "Pharmacological · The Vial", role: "Pharmacological", char: "Jane Doe", power: "Pathokinesis · Living & Ability Infection", link: "https://roleplay.chat/profile.php?user=jane" },
    ],
  },
],

groups: [
  {
    name: "VANGUARD",
    type: "STRATA Vanguard",
    status: "Active",
    desc: "The absolute top of STRATA's roster. Four slots total. International household names — the face of every press release, every billboard, every sanctioned global response. Their contracts are classified. Their smiles are not. All four members are NPCs.",
    sanctioned: true,
    members: [
      { alias: "PARAGON",     role: "Unit Leader",     char: "Adrian Valaris",  npc: true },
      { alias: "VIGIL",       role: "Field Operative", char: "Caius Saberis",   npc: true },
      { alias: "AEGIS",       role: "Field Operative", char: "Margery Orenne",  npc: true },
      { alias: "SWITCHBOARD", role: "Specialist",      char: "Iris Grimere",    npc: true },
    ],
  },
  {
    name: "[Open Team Slot]",
    type: "STRATA Sanctioned Team",
    status: "Concept",
    sanctioned: true,
    desc: "A STRATA-sanctioned hero team operating under contract — below the Vanguard, above the solo roster. Propose structure, remit, and a 3–6 member roster to admin.",
    members: [],
  },
  {
    name: "[Open Team Slot]",
    type: "STRATA Sanctioned Team",
    status: "Concept",
    sanctioned: true,
    desc: "A STRATA-sanctioned hero team operating under contract — below the Vanguard, above the solo roster. Propose structure, remit, and a 3–6 member roster to admin.",
    members: [],
  },
],

rules: [
  { n: "01", title: "Respect everyone.",                     body: "Treat all members with respect in and out of character. Your character can be terrible. You cannot. Harassment, bigotry, or targeted behaviour toward another player is grounds for immediate removal." },
  { n: "02", title: "No godmodding or powerplaying.",        body: "You do not control another player's character without their explicit consent. This includes dictating outcomes of actions, overriding another character's reactions, or writing their responses for them." },
  { n: "03", title: "Keep OOC conflict out of IC spaces.",   body: "If you have a problem with another player, take it to admin privately. Do not play out real grievances through your characters. Do not use IC spaces to publicly address OOC issues." },
  { n: "04", title: "Check the masterlist before applying.", body: "All character concepts must be checked against the registry before submission. Duplicate power expressions and naming conflicts will be caught at review — checking first saves everyone time." },
  { n: "05", title: "Activity.",                              body: "If you go inactive without notice for more than 30 days, your character slots may be reopened. Let admin know if you need a hiatus — we will hold your spots. Silence will not be assumed to be a hiatus." },
  { n: "06", title: "Three-day cooldown between applications.", body: "There is no cap on how many characters you can play, but the room is run by a single mod. To keep applications reviewable, please wait three days after submitting one character application before submitting your next. Patience here keeps the queue moving and the reviews thorough." },
  { n: "07", title: "Power applications require approval.",   body: "All powers must be registered in the Powers tab before play begins. A-List applications require a separate conversation with admin before submission. Do not play an unregistered ability." },
  { n: "08", title: "Admin decisions are final.",             body: "Disagreements with admin decisions should be raised calmly and in private. Public disputes, callouts, or attempts to rally other players against a ruling will not be entertained and may result in removal." },
    { n: "09", title: "Cradle bands are hard limits.",     body: "A character's age must fall inside the age range of their Cradle phase — Cradle III runs roughly ages 0–26, Cradle II 31–46, and Cradle I 51–58. Powers track the Cradle a character was born into, so anyone with abilities is expected to sit in the band that matches their Cradle. The Dean and Vale are the only Cradle I characters above 46. Paragon is a Cradle II character (age 31–46) who received the Cradle I injection — a Cradle II body with Cradle I powers, which is why he sits in the 31–46 band even though his power profile reads as Cradle I. Submissions outside those bands will not be accepted — please read the lore (start with The Programme) before submitting." },  
],

curriculumTracks: [
  {
    n: "01",
    label: "TRACK ONE · FOUR YEARS",
    title: "HEROES",
    tag: "The weapon. The brand. The scapegoat.",
    bg: "var(--red)",
    fg: "#fff",
    badge: "var(--ink)",
    badgeFg: "var(--yellow)",
    stamps: ["WEAPONIZED", "ON CAMERA", "SPONSORED", "EXPENDABLE"],
    years: [
      { y: "FRESHMAN",  t: "Intake & Indoctrination",   d: "Power assessment, combat basics, media training 101. All deployment is simulated — supervised arena drills, controlled scenarios, no civilians in the room. You learn to hit things and smile on cue. Most washouts happen this year — STRATA prefers it that way." },
      { y: "SOPHOMORE", t: "Classification & Branding", d: "Your tier gets locked in. Your alias gets trademarked. Sponsorship scouts start circling. Identity Management lectures begin — public name, working alias, what to do when one leaks into the other. Deployment escalates to civilian-adjacent: shadowing established heroes at low-stakes events, sponsored ribbon-cuttings, charity matches, anywhere the cameras are friendly. You stop being a student and start being an asset with a projected lifetime value." },
      { y: "JUNIOR",    t: "Live Deployment Trials",    d: "Sanctioned live ops under faculty supervision. Real crisis scenes — property damage, crowd control, hostage incidents at the lower end of the threat ladder. Body counts get logged. PR handles the cleanup. You are told the collateral was unavoidable. You are told this often." },
      { y: "SENIOR",    t: "Contract & Debut",          d: "You sign. Solo or paired contract deployment, scaled to your tier — A-list seniors get pulled into international response, B-list and below get regional, C-list get specialist niche work. The contract is binding, the language is deliberate, and the exit clauses do not exist. You graduate onto a roster. You are now someone's weapon." },
    ],
  },
  {
    n: "02",
    label: "TRACK TWO · FOUR YEARS",
    title: "SIDEKICKS",
    tag: "The handler. The cleaner. The fall guy.",
    bg: "var(--ink)",
    fg: "var(--yellow)",
    badge: "var(--yellow)",
    badgeFg: "var(--ink)",
    stamps: ["HANDLER", "CLEANER", "FALL GUY", "DENIABLE"],
    years: [
      { y: "FRESHMAN",  t: "Intake & Triage",       d: "Field medicine, tactical comms, basic crisis management. All deployment is classroom — mock comms drills, simulated triage scenes, no live partner yet. You learn to keep someone conscious long enough to be photogenic. You learn whose life is worth the paperwork." },
      { y: "SOPHOMORE", t: "Pairing & Protocol",    d: "Assigned to a Heroes-track sophomore for observation. You co-attend their sponsored low-stakes events — the ribbon-cuttings, the charity matches, the soft-launch appearances. You handle their schedule, not yet their incidents. You learn their tells, their triggers, their tolerances. You are now legally responsible for their behaviour in public." },
      { y: "JUNIOR",    t: "Spin & Cleanup",        d: "Rotations through real STRATA PR, legal, and incident-response teams. You draft press releases for the graduating cohort's first live ops. You sit in on actual after-action reviews. You learn which details survive the final cut, and which lawyers signed off on what." },
      { y: "SENIOR",    t: "Contract & Assignment", d: "You sign the same contract. Your name goes on the same roster, two columns over, paired with the hero you've been shadowing since sophomore year. You go where they go. You write what their team needs written. When your hero finally does something the firm can't spin, your signature is on the incident report." },
    ],
  },
],

tabs: [
  { id: "home",       label: "Home",          n: "00" },
  { id: "rules",      label: "Rules",         n: "01" },
  { id: "lore",       label: "Lore",          n: "02" },
  { id: "map",        label: "Campus Map",    n: "03" },
  { id: "faculty",    label: "Faculty",       n: "04" },
  { id: "students",   label: "Students",      n: "05" },
  { id: "clubs",      label: "Clubs",         n: "06" },
  { id: "strata",     label: "STRATA",        n: "07" },
  { id: "outside",    label: "Outside",       n: "08" },
  { id: "powers",     label: "Powers",        n: "09" },
  { id: "join",       label: "Join Now",      n: "10" },
],

/* ─── CAMPUS MAP — lore-grounded locations across the Greenwich compound ─ */
mapDistricts: [
  {
    id: "academic",
    name: "Academic Core",
    blurb: "The 1965 sandstone compound. Lecture halls, seminar rooms, the library, the offices where the curriculum gets argued over twice a term and never really changes.",
    color: "#c41a1a",
    image: "https://files.catbox.moe/tde840.png",
  },
  {
    id: "training",
    name: "Training Wing",
    blurb: "Reinforced floors, sealed labs, the rooms where students find out what they actually do. Sixty years of safety upgrades. Most of them earned the hard way.",
    color: "#d4901a",
    image: "https://files.catbox.moe/p8cugn.png",
  },
  {
    id: "residence",
    name: "House Residences",
    blurb: "Four houses, four halls — Valaris, Orenne, Saberis, Grimere. Each its own building, its own kitchen, its own unwritten rules. House territory is a real thing.",
    color: "#15803d",
    image: "https://files.catbox.moe/kay5pb.png",
  },
  {
    id: "strata",
    name: "STRATA Wing",
    blurb: "The corporate end of the compound. Liaison offices, briefing theatres, the Diagnostic Wing, and the corridor with the door nobody photographs.",
    color: "#1e40af",
    image: "https://files.catbox.moe/vj2lk8.png",
  },
  {
    id: "athletics",
    name: "Athletics & Grounds",
    blurb: "The Powerball Arena, the regulation arena, the practice pitches. Where students burn energy in ways insurance approves of.",
    color: "#7a1a4a",
    image: "https://files.catbox.moe/29afvr.png",
  },
  {
    id: "commons",
    name: "Campus Commons",
    blurb: "The non-academic inside of the wall — the bits of campus that aren't classrooms or labs. Faculty cottages, the shop, the campus pub, the sit-down restaurant. Where the school stops being a school for an hour at a time.",
    color: "#8a6a3a",
    image: "https://files.catbox.moe/696iic.png",
  },
  {
    id: "perimeter",
    name: "Perimeter",
    blurb: "Walls, gates, and the strip of campus that touches Greenwich. The river, the park, the streets students aren't supposed to be on after curfew.",
    color: "#4a4a52",
    image: "https://files.catbox.moe/hwi5o4.png",
  },
  {
    id: "outside",
    name: "Off-Campus",
    blurb: "The Greenwich blocks within walking distance. Cafés, pubs, the late shift at Mira's. STRATA day-pass territory, unofficially extended to anywhere a Calderyn student can be back from before bed-check.",
    color: "#5a4a3a",
    image: "https://files.catbox.moe/1ukqr4.png",
  },
],

mapLocations: [
  /* ═══ ACADEMIC CORE ═══════════════════════════════════════════════ */
  { id: "calderyn-hall", district: "academic", n: "A1",
    name: "Calderyn Hall",
    sub: "Main lecture building · 1965",
    desc: "Built over the original Institute site. Sandstone, ivy, a clock tower that's been three minutes fast since 1981. First- and second-year lectures all happen here. The brass plaque at the front entrance still reads MEDICAL RESEARCH COMPOUND — DEFENCE — the hall was renamed twice and the plaque was never replaced.",
    tags: ["Lectures", "FR/SO core"],
  },
  { id: "founders-stair", district: "academic", n: "A2",
    name: "The Founders' Stair",
    sub: "Six-storey iron staircase, Calderyn Hall",
    desc: "Runs through the centre of the building. Tradition says you don't speak on the third landing. Nobody remembers why. Faculty pretend it isn't a tradition. Faculty also don't speak on the third landing.",
    tags: ["Tradition", "Acoustic dead-zone"],
  },
  { id: "library", district: "academic", n: "A3",
    name: "The Calderyn Library",
    sub: "Open stacks · restricted archive",
    desc: "Three floors public, two floors not. Open stacks cover every published work on power theory, ethics, and operational doctrine. The lower archive is sealed behind a Tier-3 lock and a librarian named Mrs. Athol, who has not visibly aged since 1993.",
    tags: ["24/7 stacks", "Tier-3 archive"],
  },
  { id: "deans-office", district: "academic", n: "A4",
    name: "Dean's Office",
    sub: "Top floor, Calderyn Hall",
    desc: "Dean's office hours are Tuesdays 14:00–16:00. Appointments outside that window are theoretically possible and practically impossible. The waiting room contains one chair, one fern, and a portrait of Silas Strathe that has been turned slightly toward the wall.",
    tags: ["By appointment", "Tier-1 only"],
  },
  { id: "faculty-row", district: "academic", n: "A5",
    name: "Faculty Row",
    sub: "Office corridor · second floor west",
    desc: "Twenty-four offices along a single corridor, alphabetised by surname and not redrawn since 1998. Three of them have been locked since their occupants \"took sabbatical\". Nobody asks. Office doors close in this corridor with the polite ferocity of doors that have closed a great many conversations.",
    tags: ["Faculty only after 18:00"],
  },
  { id: "ethics-seminar", district: "academic", n: "A6",
    name: "The Ethics Seminar Room",
    sub: "Calderyn Hall · room 2-04",
    desc: "Where Powered Ethics is taught — to seniors, in small groups, with the cameras off. The only room on campus where faculty are required to sign an off-record agreement before lecturing. Everything said in 2-04 stays in 2-04. Officially.",
    tags: ["SR only", "Cameras-off"],
  },
  { id: "refectory", district: "academic", n: "A7",
    name: "The Refectory",
    sub: "Dining hall · all houses",
    desc: "Long oak tables, cathedral ceiling, a serving line that does an unreasonably good shepherd's pie. House territory is unmarked but observed — the four corners belong to the four houses by tradition no one has ever written down.",
    tags: ["All hours", "House seating"],
  },
  { id: "media-suite", district: "academic", n: "A8",
    name: "Media Training Suite",
    sub: "Identity Management classrooms",
    desc: "Three sound-stages, a fake press room, two cameras with the BBC logo carefully scratched off. Where sophomores learn how to answer questions from people who already know the answer. Identity Management lectures begin here in second year and never quite stop.",
    tags: ["SO+", "Recorded"],
  },
  { id: "auditorium", district: "academic", n: "A9",
    name: "The Auditorium",
    sub: "Main hall · 600 seats",
    desc: "Where the year-opening address happens, where the senior contracts are signed in front of a witness audience, and where the Vanguard appeared on stage in 2015 to a closed-door cohort the school still doesn't officially acknowledge happened.",
    tags: ["Ceremony", "Closed presentations"],
  },

  /* ── DEPARTMENT TEACHING ROOMS · one block per department ──
     Eight academic classrooms, one per faculty. Combat's lecture
     side, distinct from the practical floors in the Training Wing.
     Media & Arts shares the corridor with the Media Training Suite
     (A8) but the desk-side teaching happens here. The five elective
     departments — Sciences, Engineering, Athletics, Humanities,
     Politics — each get a dedicated classroom block too. */
  { id: "combat-classroom", district: "academic", n: "A10",
    name: "Combat Lecture Block",
    sub: "Tactics, doctrine, after-action review",
    desc: "Three tiered rooms on the south side of Calderyn Hall, well removed from the practical floors in the Training Wing. The whiteboards run wall-to-wall; the chairs are bolted down because the chairs used to get thrown. Every Combat module that isn't a sparring practical gets argued out here — tactics, doctrine, the slow forensic review of footage from the Scenario Floor. Mandatory for every student regardless of designation.",
    tags: ["Required track", "Tactics", "All years"],
  },
  { id: "mda-classroom", district: "academic", n: "A11",
    name: "Media & Arts Classrooms",
    sub: "Press, performance, identity craft",
    desc: "Four rooms across the corridor from the Media Training Suite. Where the lectures, the readings, and the codename seminar all happen before students ever set foot in front of a camera. Velvet chairs, dim lights, a row of recording booths in the back for elocution drills. Mandatory for every student — the public-presentation tier of the curriculum nobody escapes.",
    tags: ["Required track", "Press", "Performance"],
  },
  { id: "history-classroom", district: "academic", n: "A12",
    name: "History & Doctrine Seminars",
    sub: "Doctrine, ethics, comparative politics",
    desc: "Small seminar rooms, oak panelling, a single circular table per room and one writable wall. Where the institutional argument with itself gets held — the Doctrine read line by line, the ethics seminars stretching past their scheduled hour, the comparative-politics readings that nobody finishes but everyone defends. Mandatory for every student. The room layout is deliberate; you cannot hide at the back.",
    tags: ["Required track", "Doctrine", "Ethics"],
  },
  { id: "sciences-classroom", district: "academic", n: "A13",
    name: "Sciences Teaching Lab",
    sub: "Lecture hall + wet lab + dry lab",
    desc: "A wide bay on the east wing — one tiered lecture hall, one wet lab licensed for biological work, one dry lab kitted out for the parahuman-physiology modules. Walk-in cold storage at the back, fume hoods along the south wall, a portrait of an unnamed researcher hanging crooked above the door. Elective track. Students who pick Sciences live here.",
    tags: ["Elective track", "Wet/dry lab", "SO+"],
  },
  { id: "engineering-classroom", district: "academic", n: "A14",
    name: "Engineering Drafting Halls",
    sub: "Workshop classrooms · CAD bays",
    desc: "Two long halls, one set up as a drafting studio with CAD stations and one set up as a hands-on workshop classroom. Tool walls, printable-blueprint plotters, a 3D-print farm in the corner that runs more or less constantly. The walk-in workshop in Grimere is for after-hours making; this is where the modules get taught. Elective track.",
    tags: ["Elective track", "Workshop", "CAD bays"],
  },
  { id: "athletics-classroom", district: "academic", n: "A15",
    name: "Athletics Theory Room",
    sub: "Conditioning, sports medicine, recovery",
    desc: "A bright, low-ceilinged room over the Powerball Arena's north wing. Whiteboards diagram movement patterns, projection-grade screens loop game footage on mute, anatomical posters cover the long wall. Where the conditioning lectures, sports-medicine seminars, and recovery-protocol classes happen — the desk side of a department that mostly lives outdoors. Elective track.",
    tags: ["Elective track", "Theory", "Above the arena"],
  },
  { id: "humanities-classroom", district: "academic", n: "A16",
    name: "Humanities Reading Rooms",
    sub: "Literature, history, philosophy",
    desc: "A suite of three small reading rooms off the library's east stairs. Soft chairs, low lamps, walls of reference shelves. Calderyn's Humanities programme is small and old-fashioned and the rooms reflect it — everyone reads aloud, everyone takes notes by hand, and discussion goes until the building's evening lockdown. Elective track. Quiet, defended, slightly out of step with everything else.",
    tags: ["Elective track", "Seminar", "Library-adjacent"],
  },
  { id: "politics-classroom", district: "academic", n: "A17",
    name: "Politics & Public Affairs Wing",
    sub: "Policy, state, market",
    desc: "Two adjoining rooms on the third floor west — one set up as a mock committee chamber with a long curved desk, the other a standard seminar room for the policy-reading modules. Where the Politics & Public Affairs department teaches the disciplines that govern how powered persons actually operate inside the state and the market. Elective track.",
    tags: ["Elective track", "Policy", "Committee room"],
  },

  /* ═══ TRAINING WING ════════════════════════════════════════════════ */
  { id: "arena", district: "training", n: "T1",
    name: "The Arena",
    sub: "Reinforced training floor",
    desc: "Built 2007 after the original gym was destroyed during a sophomore sparring incident. Walls clad in inertial damping foam, ceiling rated to absorb a 40-tonne impact, observation deck behind one-way reinforced glass. All combat practicals happen here. Cameras run constant. Footage goes upstairs.",
    tags: ["Combat practical", "Faculty-supervised"],
  },
  { id: "scenario-floor", district: "training", n: "T2",
    name: "Scenario Floor",
    sub: "Reconfigurable simulator",
    desc: "Holographic projection layered over a mechanical floor that pulls itself into the shape of a collapsed building, a hostage corridor, a London A-road in flood. Junior- and senior-year live ops drills run here. Sign in. Sign out. Don't be the reason somebody else doesn't.",
    tags: ["JR/SR only", "Tier-2 access"],
  },
  { id: "powerlab", district: "training", n: "T3",
    name: "Power Calibration Lab",
    sub: "Assessment & containment",
    desc: "Where freshmen find out what their power actually does — measured, classified, filed. Faraday cage, thermal isolation, independent air supply. There has not been an evacuation since 2019. The lead researcher will not say what the 2019 evacuation was for.",
    tags: ["FR intake", "Containment-rated"],
  },
  { id: "tier-cells", district: "training", n: "T4",
    name: "Tier Classification Cells",
    sub: "Sophomore reclassification suites",
    desc: "Six small rooms where sophomores get their tier locked in. The reading you're given here goes on a STRATA file that will follow you for the rest of your career. Some students walk out smiling. Some don't walk out the same week.",
    tags: ["SO classification", "STRATA-filed"],
  },
  { id: "containment", district: "training", n: "T5",
    name: "Containment Block",
    sub: "Reinforced isolation cells",
    desc: "Six cells designed to hold a student whose power has gone wrong. Soundproofed, signal-shielded, climate-controlled. Officially used twice a year for medical observation. Unofficially used somewhat more often than that.",
    tags: ["Medical hold", "Tier-1 medical"],
    classified: true,
  },
  { id: "infirmary", district: "training", n: "T6",
    name: "The Infirmary",
    sub: "Medical wing · 12 beds",
    desc: "Twelve beds, two operating theatres, one surgeon on call who used to work for STRATA black ops and won't talk about it. Most students see this room twice a year. Some never leave it.",
    tags: ["24/7", "Trauma-rated"],
  },
  { id: "psych", district: "training", n: "T7",
    name: "Psychological Services",
    sub: "Counselling offices · north wing",
    desc: "Mandatory after a tier reclassification, after a deployment, and after anything the dean's office decides counts as <em>after</em>. Confidential up to the point where STRATA decides it isn't. Most students figure out where that line sits the hard way.",
    tags: ["Mandatory post-op", "Confidential*"],
  },
  { id: "sim-control", district: "training", n: "T8",
    name: "Simulation Control",
    sub: "Observation booth above Scenario Floor",
    desc: "Where faculty run the scenarios. Bank of monitors, two writers in the corner generating fictional incident text on demand, a coffee machine older than most of the students. The view through the one-way glass is what the students don't get to see.",
    tags: ["Faculty only", "Recorded"],
  },

  /* ═══ HOUSE RESIDENCES ════════════════════════════════════════════
     Each house has 3 rooms: Common Room → Dorms → Signature room.
     `house` field colour-codes cards per-house.
     Communal spaces at the end serve all four houses. */

  // ── VALARIS — Falcon · Justice · the public-facing house ── #c41a1a
  { id: "valaris-common", district: "residence", n: "V·1", house: "valaris",
    name: "Valaris Common Room",
    sub: "Falcon · Justice",
    desc: "Red sandstone walls, tall windows facing the quad, a stage at one end and no chairs at the other. The Valaris common room is where house meetings happen standing up — and the floor is where freshmen learn to argue without their hands shaking. A portrait of Adrian Valaris faces the door. Outsiders are welcome by invitation. Invitations are rare.",
    tags: ["Common room", "Stage floor"],
  },
  { id: "valaris-dorm", district: "residence", n: "V·2", house: "valaris",
    name: "Valaris Dorms",
    sub: "Floors 2–4 · Valaris House",
    desc: "Four floors of doubles and singles, tall ceilings, brass fittings. Valaris dorms have full-length mirrors fitted in every room as standard — a tradition no one apologises for. Doors are kept closed. Hallway voices are kept low. The house operates on the assumption that someone is always watching, because in third year, someone usually is.",
    tags: ["Dormitory", "Doubles + singles"],
  },
  { id: "valaris-mirror", district: "residence", n: "V·3", house: "valaris",
    name: "The Mirror Room",
    sub: "Press rehearsal · top floor",
    desc: "Three walls of mirrors, a fourth wall hung with cameras. The signature room of House Valaris — where seniors rehearse press appearances, screen-test their own footage, and run drills on their statements until the delivery sounds untrained. The room is unbookable. House members get a key with their crest.",
    tags: ["Signature", "Press training", "Members only"],
  },

  // ── ORENNE — Stag · Fortitude · the slow virtue ── #d4901a
  { id: "orenne-common", district: "residence", n: "O·1", house: "orenne",
    name: "Orenne Common Room",
    sub: "Stag · Fortitude",
    desc: "Stone, dark wood, a low ceiling, and a fire that's been kept lit during winter terms since 2021. The Orenne common room runs warm and quiet. House meetings happen seated and last as long as they need to. The amber rug in the centre is older than the house — donated by a Vanguard widow at the founding ceremony.",
    tags: ["Common room", "Fireplace"],
  },
  { id: "orenne-dorm", district: "residence", n: "O·2", house: "orenne",
    name: "Orenne Dorms",
    sub: "Floors 2–3 · Orenne House",
    desc: "Smaller than the other houses by design — Orenne takes the smallest cohort, year on year. Dorms are simple: a bed, a desk, a window that opens, a radiator that works. Doors are unlocked by tradition. Things go missing in Orenne about a tenth as often as anywhere else on campus.",
    tags: ["Dormitory", "Smallest cohort"],
  },
  { id: "orenne-table", district: "residence", n: "O·3", house: "orenne",
    name: "The Long Table",
    sub: "Adjudication hall · ground floor",
    desc: "Twelve metres of oak, scarred to hell, sits in a low-lit room off the common room. The signature room of House Orenne. Every house dispute gets argued out here. Nobody leaves the table angry — that's not the rule, that's the tradition. The rule is you don't get up before the matter is closed. Aegis sat at the head of this table as a senior; her chair is unmarked and used.",
    tags: ["Signature", "Adjudication", "House tradition"],
  },

  // ── SABERIS — Serpent · Prudence · ambition with direction ── #15803d
  { id: "saberis-common", district: "residence", n: "S·1", house: "saberis",
    name: "Saberis Common Room",
    sub: "Serpent · Prudence",
    desc: "Modernist, glass-fronted, brutally well-lit. The Saberis common room has a working bar with no alcohol behind it, a 12-metre whiteboard nobody erases, and a small library of public contracts the seniors read for fun. Music is allowed but never loud. The conversations in this room have a way of sounding like negotiations even when they aren't.",
    tags: ["Common room", "Whiteboard wall"],
  },
  { id: "saberis-dorm", district: "residence", n: "S·2", house: "saberis",
    name: "Saberis Dorms",
    sub: "Floors 2–4 · Saberis House",
    desc: "The newest residential block on campus — built 2024, all glass and steel, full HVAC, individual climate control in every room. Saberis dorms are singles only, no doubles. Each room comes with a desk built for two screens. The roof access stair is on this floor, theoretically locked, practically not.",
    tags: ["Dormitory", "Singles only"],
  },
  { id: "saberis-roof", district: "residence", n: "S·3", house: "saberis",
    name: "The Roof Garden",
    sub: "Top floor terrace · Saberis House",
    desc: "Officially off-limits. Practically the signature room of House Saberis. Half greenhouse, half outdoor lounge, full view of the river and Canary Wharf beyond it. Where Saberis seniors decide things — house elections, internal disputes, who's nominated for what externally. Faculty don't come up here. Faculty don't notice the door is unlocked.",
    tags: ["Signature", "Off-limits", "River view"],
  },

  // ── GRIMERE — Moth · Temperance · the misfits, deliberately ── #1e40af
  { id: "grimere-common", district: "residence", n: "G·1", house: "grimere",
    name: "Grimere Common Room",
    sub: "Moth · Temperance",
    desc: "Built into the south slope, half-underground. Low ceilings, blue lamps, surprisingly warm. The Grimere common room has mismatched furniture — every piece donated by a previous resident — and a wall covered in small unframed photographs of every Grimere alumnus going back to founding. The newest photograph is always slightly off-centre. By tradition, the alignment is fixed by the next intake.",
    tags: ["Common room", "Photo wall"],
  },
  { id: "grimere-dorm", district: "residence", n: "G·2", house: "grimere",
    name: "Grimere Dorms",
    sub: "Floors 1–2 · Grimere House",
    desc: "Half the rooms are below ground level — Grimere is built into the hillside and the dorms benefit from it: thick walls, even temperature, almost no exterior noise. The wiring throughout the building is unusual; each room has more sockets than the spec required, an inheritance from Switchboard's time as a resident.",
    tags: ["Dormitory", "Half-buried"],
  },
  { id: "grimere-workshop", district: "residence", n: "G·3", house: "grimere",
    name: "The Workshop",
    sub: "Sub-basement · Grimere House",
    desc: "A working forge, a working soldering bench, a 3D printer that's been there since 2022, and a wall of tools nobody can quite remember acquiring. The signature room of House Grimere — the only house with somewhere to make things, and they do: gear, props, the occasional structural repair the faculty officially never see. House key required. House members teach each other.",
    tags: ["Signature", "Workshop", "Members only"],
  },

  // ── COMMUNAL — shared between all four houses ── neutral grey
  { id: "residential-quad", district: "residence", n: "C·1",
    name: "The Residential Quad",
    sub: "Open lawn between the four houses",
    desc: "Eighty metres of lawn bordered by all four house buildings. Picnic tables, a pair of stone benches that get fought over in good weather, a single oak in the middle that was planted in 2020 with one shovelful of earth from each house. The quad is the only place on campus where house colours mix freely. Faculty don't supervise it. Houses police it themselves.",
    tags: ["All houses", "Open lawn"],
  },
  { id: "residential-kitchen", district: "residence", n: "C·2",
    name: "The Communal Kitchen",
    sub: "Ground floor · between Saberis & Orenne",
    desc: "Two stoves, three ovens, a pantry the houses contribute to on a rota, and an espresso machine that has not stopped working since 2021. Open to all four houses. Sign-up board for cooking slots is on the door, mostly observed. The unwritten rule is you clean what you used and one thing somebody else didn't.",
    tags: ["All houses", "24/7"],
  },
  { id: "residential-laundry", district: "residence", n: "C·3",
    name: "The Laundry",
    sub: "Sub-level · centre of the quad",
    desc: "Twelve washers, twelve dryers, four ironing boards, one folding table the size of a small bed. Open to every resident. The lighting is good. The acoustics are unusually warm. By tradition, laundry-room conversations are not repeated outside it — a convention even the four house presidents observe.",
    tags: ["All houses", "Off the record"],
  },
  { id: "residential-snug", district: "residence", n: "C·4",
    name: "The Snug",
    sub: "Inter-house lounge · ground floor",
    desc: "A single low-ceilinged room with sofas from all four houses, a mismatched coffee table, a kettle, and a record player with a milk-crate of vinyl that gets added to but never thinned. The Snug is where students from different houses meet on neutral ground — house colours come off at the door by tradition. House meetings happen in the houses. Friendships happen here.",
    tags: ["All houses", "Neutral ground"],
  },
  { id: "residential-courtyard", district: "residence", n: "C·5",
    name: "The Garden Courtyard",
    sub: "Walled garden · north of the quad",
    desc: "A small walled garden with raised beds, a greenhouse the Saberis grad-society maintains, and a stone fire pit that gets lit on the last night of every term. Open to all houses. The vegetables grown here go to the communal kitchen. The tradition of lighting the pit is older than the houses themselves — a holdover from the 1965 staff garden.",
    tags: ["All houses", "Garden", "Term tradition"],
  },
  { id: "residential-policy", district: "residence", n: "C·6",
    name: "Housing Policy",
    sub: "Room allocation across all four houses",
    desc: "Dorm rooms are shared by gender as a matter of default: girls room with girls, boys room with boys. The Dean's office handles exceptions on a case-by-case basis. A single room is granted to the standing Student Body President for the duration of their term, and to any student whose circumstances warrant it — transitioning students, students who don't identify with a specific gender, medical or safeguarding cases, and anything else the Dean signs off on. Requests are confidential. The waitlist is short and the conversation is private.",
    tags: ["Policy", "All houses", "Dean's office"],
  },

  /* ═══ STRATA WING ══════════════════════════════════════════════════ */
  { id: "liaison", district: "strata", n: "S1",
    name: "STRATA Liaison Office",
    sub: "Corporate-side reception",
    desc: "First door past the connecting corridor. STRATA staff badges, STRATA furniture, STRATA coffee. The receptionist's name has been Elena since 2017 and she is not the same Elena. Students don't get past reception without a specific meeting on the books.",
    tags: ["STRATA staff only"],
  },
  { id: "briefing", district: "strata", n: "S2",
    name: "Briefing Theatre",
    sub: "Three deployment-prep rooms",
    desc: "Where senior-year students get their first live deployment briefings. Three theatres, all soundproofed, all monitored. The big one seats forty. The medium one seats twelve. The small one seats two and is where the conversations happen that don't get briefed.",
    tags: ["SR only", "STRATA-monitored"],
  },
  { id: "debrief", district: "strata", n: "S3",
    name: "Debrief Suite",
    sub: "Post-deployment review",
    desc: "What the brochures call \"reflection rooms.\" What the students call \"the sweat box.\" A faculty member, a STRATA liaison, and you, going through the footage frame by frame until everyone agrees on what happened.",
    tags: ["Mandatory", "Recorded"],
  },
  { id: "press-pit", district: "strata", n: "S4",
    name: "The Press Pit",
    sub: "STRATA-side conference room",
    desc: "A real, working press conference room — used for the seniors' first scripted press appearances and, occasionally, for actual press. The seats face a desk that's an inch lower than the ones used by the journalists. The lighting is set to make whoever's at the desk look slightly above their colour-grade.",
    tags: ["SR press training"],
  },
  { id: "vault", district: "strata", n: "S5",
    name: "The Vault",
    sub: "Restricted archive · sub-level",
    desc: "Officially: secure storage for confiscated artifacts. Unofficially: nobody on the student side has ever seen the inside. Three Tier-1 keys are required to open the outer door. The list of who holds them is itself classified.",
    tags: ["TIER-0", "Classified"],
    classified: true,
  },
  { id: "felix-suite", district: "strata", n: "S6",
    name: "The Strathe Suite",
    sub: "Top floor · STRATA wing",
    desc: "Felix Strathe's London office on the rare days he's on campus. Dark wood, ridiculous view, a phone with no buttons that connects to one number. Students do not enter this suite. Faculty enter, on average, twice a year, and tend to be quiet for a day afterwards.",
    tags: ["Strathe only"],
    classified: true,
  },
  { id: "reassignment", district: "strata", n: "S7",
    name: "Reassignment Office",
    sub: "Unmarked door · ground floor",
    desc: "What the brochures don't talk about. Calderyn does not fail students. It <em>reassigns</em> them — and the conversation that begins that process happens here. The plaque on the door reads <em>STUDENT TRANSITION SERVICES</em>. The plaque is new.",
    tags: ["Closed-door"],
    classified: true,
  },

  /* ═══ ATHLETICS & GROUNDS ═════════════════════════════════════════ */
  { id: "powerball-court", district: "athletics", n: "B1",
    name: "Powerball Arena",
    sub: "Regulation-spec PBL practice court",
    desc: "Glass-walled, regulation dimensions, cleared for league-spec practice. Six on six, one Playmaker, two Attack, two Defence, one Goalkeeper. The Calderyn varsity team practices here. Junior scouts from Berlin, Tokyo, and Madrid have been seen in the upper gallery on more than one occasion.",
    tags: ["Powerball", "League-spec"],
  },
  { id: "training-pitch", district: "athletics", n: "B2",
    name: "Outdoor Training Pitch",
    sub: "All-weather field · north grounds",
    desc: "All-weather rubberised pitch for general fitness drills, scrimmages, and the kind of conditioning the indoor halls aren't rated for. Most powers are allowed here. Fire is not. Telekinesis is conditional.",
    tags: ["Open hours"],
  },
  { id: "pool", district: "athletics", n: "B3",
    name: "The Pool",
    sub: "Olympic-spec aquatic centre",
    desc: "Eight lanes, ten metres deep at the dive end, and a separate sealed tank for water-elemental students who don't share lanes well. The depth is a deliberate choice. There has been at least one rescue per year since 2011. None of them have been a drowning.",
    tags: ["Tier-1 supervisor"],
  },
  { id: "weights", district: "athletics", n: "B4",
    name: "The Iron Hall",
    sub: "Reinforced weight room",
    desc: "Strength training for students whose strength training breaks normal equipment. Plates measured in tonnes, racks bolted to the foundation, a coach named Saunders who has been here since 1991 and does not flinch. \"You can lift a car. Now learn to put it down without making a hole.\"",
    tags: ["Strength training"],
  },
  { id: "cheer-studio", district: "athletics", n: "B5",
    name: "Cheer & Dance Studio",
    sub: "Mirrored studios · west wing",
    desc: "Two large studios, sprung floors, full mirrors. The Cheer Squad practices here three nights a week. Drama Society borrows the smaller studio on Sundays and never quite finishes vacating it before cheer arrives.",
    tags: ["Cheer", "Performance"],
  },

  /* ═══ CAMPUS COMMONS ═══════════════════════════════════════════════ */
  { id: "faculty-cottages", district: "commons", n: "K1",
    name: "Faculty Cottages",
    sub: "Eight terraced houses · west wall",
    desc: "Eight brick cottages backed against the inside of the west wall, built for the original 1965 medical research staff and never substantially altered. Faculty in tenured posts get one for the duration of their contract; the rest commute. There is a long-running unofficial rule that students do not cross the cottage path after dark, and a longer-running unofficial rule that faculty do not invite students across it under any circumstances.",
    tags: ["Faculty residence", "Tenured only"],
  },
  { id: "wardens-house", district: "commons", n: "K2",
    name: "The Warden's House",
    sub: "Standalone cottage · north of the cottages",
    desc: "A larger detached cottage at the end of the row, traditionally allocated to the Warden of Houses — the senior faculty member responsible for residential life. Currently Margery Orenne. The light in the upstairs window has been on past midnight every night this term, and nobody who has noticed is willing to ask why.",
    tags: ["Warden's residence", "Always-on light"],
  },
  { id: "campus-shop", district: "commons", n: "K3",
    name: "The Calderyn Shop",
    sub: "General store · ground floor, by the refectory",
    desc: "Officially: stationery, toiletries, energy drinks, the school-branded hoodies that cost more than they should. Unofficially: where you can also buy a passable bottle of red, the back-issue editorial magazines the library doesn't stock, and — from a glass cabinet behind the counter — STRATA-licensed merchandise in the brand colours of whichever alumni are currently being marketed. Run by a woman called Bea who has been there longer than the Dean.",
    tags: ["Open 07:00–22:00", "Cash & badge"],
  },
  { id: "common-table", district: "commons", n: "K4",
    name: "The Common Table",
    sub: "Sit-down restaurant · ground floor, east of refectory",
    desc: "The school's proper restaurant, as distinct from the refectory. Tablecloths, a wine list, a chef who came from a one-star Soho kitchen and wanted, by his own account, to cook something that wasn't being photographed. Used for Dean's dinners, parents' weekends, faculty meetings that need to feel like meetings. Students can book — bookings are taken seriously, and so is the dress code.",
    tags: ["Bookings req.", "Dress code"],
  },
  { id: "the-vesper", district: "commons", n: "K5",
    name: "The Vesper",
    sub: "Campus pub · cellar level, under the refectory",
    desc: "The campus pub, in a vaulted brick cellar under the refectory. Carded properly — over-eighteens only, and the bar staff know every face. Six taps, a piano nobody admits to playing, and a back booth that is by long convention reserved for whichever faculty member arrived first. Named for the founding alumna Eleanor Vesper, whose portrait hangs over the bar and whose initials are still cut into the wood of the booth.",
    tags: ["18+", "Termtime nightly"],
  },
  { id: "chapel", district: "commons", n: "K6",
    name: "The Chapel",
    sub: "Non-denominational chapel · Memorial Garden",
    desc: "A small stone chapel at the quiet end of the commons, kept non-denominational since the 1980s and used mostly for the annual memorial service and the occasional faculty wedding. The doors are unlocked from dawn to dusk and the back pew is, by a tradition nobody legislated, where students sit when they need somewhere that isn't a counsellor's office. <strong>The Memorial Garden to the Fallen Heroes</strong> runs the length of the chapel's east wall &mdash; a walled walk of pale stone, planted with white roses and a single ancient yew, with the names of Calderyn alumni heroes lost in the field cut into the inner wall. The newest panel is the <em>Cassandra panel</em>, commissioned by <a href=\"https://roleplay.chat/profile.php?user=illuminate\" target=\"_blank\" rel=\"noopener noreferrer\">Celestia &quot;Stella&quot; Starkov</a> in memory of <strong>SOLARIS</strong> &mdash; her boyfriend, former A-list STRATA hero and nephew to the current CEO of STRATA &mdash; and the other alumni heroes who answered the call and fell with him in the Cassandra incident. The names beside his are kept by the school but not by the public registry; the families asked, and the school agreed.",
    tags: ["Open dawn–dusk", "Memorial"],
  },

  /* ═══ PERIMETER ════════════════════════════════════════════════════ */
  { id: "main-gate", district: "perimeter", n: "P1",
    name: "The Main Gate",
    sub: "Trafalgar Road entrance",
    desc: "Iron, fifteen feet, opens by biometric override. There's a smaller pedestrian gate to the left for students with day-passes. There's a third gate that doesn't appear on any campus map and is operated by the STRATA security detail in plain dark coats.",
    tags: ["Day-pass required", "Biometric"],
  },
  { id: "perimeter-wall", district: "perimeter", n: "P2",
    name: "The Eastern Wall",
    sub: "Boundary with Greenwich Park",
    desc: "Sixteen feet of stone with a carbon-fibre lattice running along the inside. Officially impassable. Practically, three or four students per year find a way over it, get fifty metres into the park, and are politely returned to campus by people in dark coats who don't introduce themselves.",
    tags: ["Out-of-bounds", "Monitored"],
  },
  { id: "observatory", district: "perimeter", n: "P3",
    name: "The Observatory",
    sub: "South-east tower roof",
    desc: "Built in 1969 for atmospheric research, decommissioned in 1992, unofficially used by every senior class since. The dome opens. The telescope still works. The view of Canary Wharf at 3 a.m. is, by general consensus, the best thing on campus.",
    tags: ["Unofficial", "Best at 3 a.m."],
  },
  { id: "thames-steps", district: "perimeter", n: "P4",
    name: "The Thames Steps",
    sub: "Riverside dock · south boundary",
    desc: "Stone steps down to the Thames, used historically for receiving cargo. Currently used for: smoking, breakups, sitting and not talking, and the occasional unauthorised river entry that Faculty pretend not to notice.",
    tags: ["Tradition", "After hours"],
  },
  { id: "service-tunnel", district: "perimeter", n: "P5",
    name: "The Service Tunnel",
    sub: "Sub-level vehicle access",
    desc: "Where deliveries arrive and where the unmarked vans depart. Runs under the south wall and exits a hundred metres down Trafalgar Road, near the bend. Students are not given the gate code. Three students per cohort figure out the gate code anyway.",
    tags: ["Service", "Not on map"],
    classified: true,
  },
  { id: "park-edge", district: "perimeter", n: "P6",
    name: "The Park Edge",
    sub: "Greenwich Park boundary path",
    desc: "The park itself is technically off-campus, but the strip along the wall isn't really park territory either. Senior students walk it at dusk. Faculty acknowledge it exists by leaving the side gate unlocked between 18:00 and 20:00 in good weather.",
    tags: ["Permissive", "Daylight only"],
  },

  /* ═══ OFF-CAMPUS ═══════════════════════════════════════════════════ */
  { id: "iron-owl", district: "outside", n: "X1",
    name: "The Iron Owl Café",
    sub: "Side street · between market & gate",
    desc: "On a side street between Greenwich Market and the campus gate. Open late. Notoriously the only place to study where Calderyn students don't run into faculty — possibly because the owner is a Vesper alumna who went into food rather than press.",
    tags: ["Café", "Day-pass walk"],
  },
  { id: "miras", district: "outside", n: "X2",
    name: "Mira's",
    sub: "Greasy spoon · just off Greenwich Market",
    desc: "Twenty-four-hour café off Greenwich Market. Cheap fry-ups, cheaper coffee. Students after exams, coppers after shifts, journalists after deadlines. Mira herself has a wall of polaroids of regulars going back to the eighties. There are Calderyn faces on it the school no longer admits to having taught.",
    tags: ["24h", "Day-pass walk"],
  },
  { id: "marrow-tonic", district: "outside", n: "X3",
    name: "Marrow & Tonic",
    sub: "Backstreet pub · Maze Hill end",
    desc: "Backstreet boozer between the campus and Maze Hill station. Doesn't card aggressively. Standing weekly tab for at least three Calderyn faculty. The back room is where Powered Ethics gets argued over for real, off the record, no notes.",
    tags: ["Pub", "Lax carding"],
  },
  { id: "pulse", district: "outside", n: "X4",
    name: "Pulse",
    sub: "Nightclub · two stops up the DLR",
    desc: "Two stops up the DLR by the O2. The nightclub everyone tells their parents they don't go to. STRATA contractors mix with Calderyn students; somehow nobody calls it in. Door staff are paid by someone other than the venue.",
    tags: ["Nightclub", "After hours"],
  },
  { id: "arboleda", district: "outside", n: "X5",
    name: "Arboleda",
    sub: "Restaurant · overlooking Greenwich Park",
    desc: "Upscale bistro overlooking the park. Where STRATA executives take their meetings and where Vanguard alumni get spotted by paparazzi. Calderyn students eat here exactly twice — once on a parents' weekend and once when someone else is paying.",
    tags: ["Restaurant", "Press hotspot"],
  },
  { id: "strata-burger", district: "outside", n: "X6",
    name: "STRATA Burger — Trafalgar Rd",
    sub: "Fast food · corporate sponsor",
    desc: "STRATA's flagship fast-food brand. The Trafalgar Road branch is the closest to campus. Yes, the corporate sponsor reaches everywhere, including lunch. Yes, the burger is fine. The branding on the wrapper is the same trademark Identity Management lectures use as a case study.",
    tags: ["Fast food", "Sponsor visible"],
  },
  { id: "greenwich-general", district: "outside", n: "X7",
    name: "Greenwich General",
    sub: "Teaching hospital · river road",
    desc: "Main civilian trauma centre, on the river road past the Cutty Sark. Has a dedicated Powered-Injury Wing on the third floor that no civilian patient ever sees. Calderyn medical referrals route here when the on-campus infirmary won't cover it.",
    tags: ["Hospital", "Powered wing"],
  },
  { id: "strata-tower", district: "outside", n: "X8",
    name: "STRATA Tower",
    sub: "International operator HQ · off-campus",
    desc: "STRATA’s flagship corporate tower, off-campus and across the river. International operator HQ, mission dispatch, and senior STRATA leadership all sit above the student-facing floors. Crisis monitoring runs around the clock. Calderyn students see the lobby on supervised visits and nowhere else unless someone has already decided their day for them.",
    tags: ["Corporate HQ", "Off-campus"],
  },
],

};

