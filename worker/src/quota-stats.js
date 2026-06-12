// Read-only endpoint that lets the application form preview a
// writer's current quota usage as they fill it in. Same privacy
// contract as the blocked-approval embed: the response never includes
// the resolved OOC name, RPC-account list, or character names — only
// per-pool, per-tier integer counts.
//
// Request body (JSON):
//   { ooc?: string, rpcLink?: string,
//     clubName?, clubTeam?, clubPosition? }   (club-cap usage preview)
// At least one of ooc/rpcLink must resolve to a known OOC writer;
// otherwise we respond with zeroes (no error, so the form can show
// clean stats for "new writer" submissions before they type a
// freeform tag). When a capped club is selected, the response also
// carries `club: { club, buckets: [{ label, count, limit }] }` so the
// form can show the writer's live usage — including over-cap states
// on grandfathered rosters — before they submit.

import { getCharsByPoolTierAndOoc, getOocForForm, getTierLimits, clubQuotaUsage } from "./quota.js";
import { getFile } from "./github.js";

const TIERS = ["A-List", "B-List", "C-List", "D-List"];

export async function handleQuotaStats(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const writer = getOocForForm(body || {});
  const limits = getTierLimits(env);

  // Empty stats by default — used when the writer can't be resolved
  // (e.g. "Other / new writer" with no freeform tag yet).
  const empty = () => TIERS.reduce((o, t) => (o[t] = 0, o), {});
  const out = {
    limits,
    student: empty(),
    adult: empty(),
    resolved: !!writer,
  };

  if (!writer) return json(out);

  let text;
  try {
    text = (await getFile(env, env.GITHUB_DATA_FILE)).text;
  } catch (err) {
    // Don't fail the request — show empty stats with a flag so the
    // client can render a "couldn't load" hint rather than a crash.
    return json({ ...out, error: "data_unavailable" }, 502);
  }

  const byPool = getCharsByPoolTierAndOoc(text);
  for (const pool of ["student", "adult"]) {
    for (const tier of TIERS) {
      out[pool][tier] = byPool.get(pool)?.get(tier)?.get(writer)?.size || 0;
    }
  }

  // Club-cap usage preview for the selected club position, if any.
  try {
    const usage = clubQuotaUsage(text, body || {});
    if (usage) out.club = usage;
  } catch (err) {
    console.error("club usage preview failed:", err.message);
  }

  return json(out);
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
