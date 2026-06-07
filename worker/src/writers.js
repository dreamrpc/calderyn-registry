// RPC-username → OOC-writer mapping for the per-writer A-List quota.
//
// PRIVACY: OOC writer names are NEVER exposed publicly or in Discord
// embeds. They live here purely so the quota check can count a writer's
// A-List characters across ALL of their RPC accounts.
//
// Keys are normalised on lookup (lowercased, `+` / `%20` decoded to
// space) so the same writer matches regardless of casing or URL
// encoding — `Black+Mass` in a profile URL resolves to the same entry
// as the typed name `black mass`.

// Source mapping. Keep keys in the form they appear in roleplay.chat
// profile URLs (with `+` for spaces, original capitalisation).
const RPC_TO_OOC_RAW = {
  "advocate":      "Wilder",
  "Black+Mass":    "Star",
  "BLACK+VEIN":    "Tyler",
  "Blackout!":     "Star",
  "blood+eagle":   "Dream",
  "chronicles":    "Wilder",
  "Corrode":       "Star",
  "Crashnburn":    "Star King",
  "Crown.":        "Star",
  "desirable":     "Wilder",
  "delgado":       "Dream",
  "Filament!":     "Star",
  "ghoulfriend":   "Star",
  "Hopper":        "Star",
  "illuminate":    "Dream",
  "iridescence":   "Wilder",
  "Katniss":       "Katniss",
  "Kestrel":       "Star",
  "Kingsman":      "Storm",
  "lyrica":        "Dream",
  "Menagerie!":    "Star",
  "mongrel":       "Wilder",
  "monolith":      "Wilder",
  "Morpha":        "Star",
  "Nocturne.":     "Star",
  "odyssey":       "Wilder",
  "pressure":      "Wilder",
  "Rosetta!":      "Star",
  "Savior":        "Storm",
  "serpentina":    "Dream",
  "Starboy!":      "Star",
  "stormcaller":   "Storm",
  "Swapper":       "Storm",
  "Swarm!":        "Star",
  "Sweet+Spot":    "Star",
  "TechPaladin":   "Storm",
  "the+Abyss":     "Star",
  "upchuck":       "Dream",
  "vecna":         "Dream",
  "Verdant!":      "Star",
  "Gremlin": "Skully",
  // Pre-AUTO-INSERT additions for characters that pre-date the
  // auto-mapping system (hand-seeded faculty/outside entries whose
  // RPC accounts were never captured by a form approval).
  "bulk":          "Wilder",
  "Breakpoint":    "Star",
  "Xenofire": "Skully",
  "dream": "Dream",
  ".Echo": "Star",
  "Airborne": "Skully",
  ".Haze": "Star",
  "Savory": "Skully",
  "Dead%20Man%20Walkin": "Skully",
  "knife": "Wilder",
  "Moni+Beifong": "Alex",
  "AXIOM": "Tyler",
  "Grave+Listener": "Skully",
  "Golden%20Fool": "Skully",
  "Bumblebee.": "Star",
  "vein": "Dream",
  "Layla_": "Sin",
  "Blink": "Star",
  "Siege": "Storm",
  "sylvia": "Dream",
  "shadowshade": "harvey",
  "Gauging+The+Room": "Skully",
  "Facet": "Star",
  "IceKing": "Storm",
  "The%20Underbroker": "Skully",
  "Ricochet!": "Star",
  "seafoam": "Wilder",
  // AUTO-INSERT:writers — newly-approved writer mappings get added
  // by the relay Worker directly above this marker (one line per RPC
  // account). Do not remove. See worker/src/writer-mapping.js for the
  // commit-time logic.
};

// Build the normalised lookup table once.
const RPC_TO_OOC = (() => {
  const out = new Map();
  for (const [k, v] of Object.entries(RPC_TO_OOC_RAW)) {
    out.set(normalize(k), v);
  }
  return out;
})();

// Unique set of known OOC names — used by the client form to populate
// the Writer Tag dropdown. Sorted alphabetically.
export const KNOWN_OOC_NAMES = [...new Set(Object.values(RPC_TO_OOC_RAW))].sort();

// Normalise an RPC username for matching: URL-decoded (`+` → space),
// lowercased, trimmed.
export function normalize(rpcUsername) {
  if (!rpcUsername) return "";
  let s = String(rpcUsername).replace(/\+/g, " ");
  try { s = decodeURIComponent(s); } catch {}
  return s.toLowerCase().trim();
}

// Resolve an RPC username (any casing/encoding) to its OOC writer
// name. Returns null when the username isn't in the mapping yet.
export function lookupOocByRpc(rpcUsername) {
  if (!rpcUsername) return null;
  return RPC_TO_OOC.get(normalize(rpcUsername)) || null;
}
