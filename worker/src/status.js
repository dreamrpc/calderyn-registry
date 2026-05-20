// Public status lookup for a single submission. The writer's client
// polls this while their receipt screen says "pending" so the page
// flips to "approved" / "rejected" without a refresh.
//
// PRIVACY: this endpoint only echoes the minimum fields needed to
// render the receipt — id, type, state, and (when terminal) decidedAt.
// It deliberately does NOT return the form contents, the OOC writer
// tag, the rpcLink, or the Discord channel / message IDs. Submission
// IDs are 8 hex chars (~4B keyspace), but since we never reveal who
// submitted what, enumeration only tells the caller "yes, that ID
// exists and is currently in state X" — not a leak.

export async function handleStatus(request, env) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id || !/^[a-f0-9]{4,32}$/i.test(id)) {
    return json({ error: "invalid_id" }, 400);
  }

  const raw = await env.SUBMISSIONS.get(`sub:${id}`);
  if (!raw) {
    // Either never existed, or expired out of KV (180-day TTL). Either
    // way, return a stable shape so the client can treat both as
    // "we no longer track this submission" without special-casing.
    return json({ id, state: "unknown" }, 404);
  }

  let sub;
  try { sub = JSON.parse(raw); } catch { return json({ error: "corrupt_record" }, 500); }

  // decidedAt: timestamp of the last terminal-state history entry.
  let decidedAt = null;
  if (sub.state === "approved" || sub.state === "rejected") {
    const hist = Array.isArray(sub.history) ? sub.history : [];
    for (let i = hist.length - 1; i >= 0; i--) {
      if (hist[i] && (hist[i].action === "approved" || hist[i].action === "rejected")) {
        decidedAt = hist[i].at;
        break;
      }
    }
  }

  return json({
    id: sub.id,
    type: sub.type,
    state: sub.state || "pending",
    decidedAt,
  });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
