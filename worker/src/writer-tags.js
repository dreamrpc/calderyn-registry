// Read-only endpoint that lets the application form populate its
// Writer Tag dropdown dynamically from the canonical OOC name list
// in writers.js. The list grows automatically as new writers are
// approved (and auto-mapped) so the dropdown stays in sync without
// manual code edits.
//
// Privacy: the response exposes only the SET of unique OOC names —
// no RPC-username → OOC mapping. Anyone calling this endpoint learns
// "these handles exist" but not which RPC accounts belong to which
// handle, which is the actual sensitive piece.
//
// Cached for 5 minutes via Cache-Control so revisits during a single
// session don't hammer the Worker.

import { KNOWN_OOC_NAMES } from "./writers.js";

export async function handleWriterTags(request, env) {
  return new Response(JSON.stringify({ tags: KNOWN_OOC_NAMES }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=300",
    },
  });
}
