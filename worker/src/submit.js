import { buildEmbed } from "./embed.js";
import { postMessage } from "./discord.js";
import { getFile } from "./github.js";
import { ensureWriterMapping } from "./writer-mapping.js";
import { lookupOocByRpc } from "./writers.js";
import {
  extractRpcUsername,
  getOocForForm,
  isCappedClubSubmission,
  checkClubQuota,
  clubQuotaMessage,
} from "./quota.js";

export async function handleSubmit(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const { type, form } = body || {};
  if (!type || !form || typeof form !== "object") {
    return json({ error: "missing_fields" }, 400);
  }

  // Honeypot — silent success so spammers don't get feedback.
  if (form.hp) {
    return json({ ok: true });
  }

  // Supebrawl is invite-only: Sven Skarsen's typist clears every entry
  // in RP before an application is even allowed to exist. The form
  // collects that confirmation as a required checkbox; this server-side
  // check catches stale or hand-crafted payloads that skip it. Applies
  // to any form shape that can target a club (clubName / optClubName).
  if ((form.clubName || form.optClubName) === "Supebrawl" && !form.supebrawlInvite) {
    return json({
      error: "supebrawl_invite_required",
      message:
        "Supebrawl is invite-only. Speak to Sven Skarsen's typist in RP first — " +
        "once the invite is agreed, tick the confirmation box on the form and resubmit.",
    }, 409);
  }

  // Per-writer club caps — checked BEFORE anything is posted so an
  // over-cap writer gets immediate feedback on the form instead of a
  // doomed pending application. Covers the Club form and the Student
  // form's optional club position. Fail-open on data fetch errors (a
  // GitHub hiccup must never block submissions; the same check re-runs
  // as a hard gate at approve time in interactions.js).
  if (isCappedClubSubmission(form)) {
    try {
      const { text } = await getFile(env, env.GITHUB_DATA_FILE);
      const verdict = checkClubQuota(text, { type, form });
      if (!verdict.allowed) {
        return json({
          error: "club_quota",
          club: verdict.club,
          scope: verdict.scope,
          count: verdict.count,
          limit: verdict.limit,
          message: clubQuotaMessage(verdict),
        }, 409);
      }
    } catch (err) {
      console.error("submit-time club quota check failed:", err.message);
    }
  }

  const id = newSubmissionId();
  const embed = buildEmbed(type, form);
  const components = approvalButtons(id);
  const channelId = channelForType(env, type);

  let posted;
  try {
    posted = await postMessage(env, channelId, {
      content: env.DISCORD_PING_ROLE_ID ? `<@&${env.DISCORD_PING_ROLE_ID}>` : "",
      allowed_mentions: env.DISCORD_PING_ROLE_ID
        ? { roles: [env.DISCORD_PING_ROLE_ID] }
        : { parse: [] },
      embeds: [embed],
      components,
    });
  } catch (err) {
    return json({ error: "discord_post_failed", detail: String(err).slice(0, 300) }, 502);
  }

  await env.SUBMISSIONS.put(
    `sub:${id}`,
    JSON.stringify({
      id,
      type,
      form,
      state: "pending",
      channelId: posted.channel_id,
      messageId: posted.id,
      history: [{ at: new Date().toISOString(), action: "submitted" }],
    }),
    // Keep submissions for 180 days; admin can still toggle within that window.
    { expirationTtl: 60 * 60 * 24 * 180 }
  );

  // Auto-register the writer mapping if this RPC account isn't in
  // writers.js yet. Runs in the background via ctx.waitUntil so the
  // submission response doesn't wait on a GitHub commit. Idempotent:
  // ensureWriterMapping re-reads the live writers.js inside its
  // SHA-retry loop and returns { unchanged: true } when the entry is
  // already there, so this safely co-exists with the same call from
  // interactions.js.
  const rpcUsername = extractRpcUsername(form.rpcLink);
  const ooc = getOocForForm(form);
  if (rpcUsername && ooc && !lookupOocByRpc(rpcUsername)) {
    // Run the GitHub commit out-of-band when we have a ctx (normal
    // Cloudflare request path); fall back to await only if ctx is
    // missing (defensive — should never happen in production, but a
    // missing ctx used to crash the whole request and emit a 503 with
    // no CORS headers, which masked itself as a "preflight failed"
    // browser error).
    const work = ensureWriterMapping(env, rpcUsername, ooc).catch(err =>
      console.error("submit-time writer-mapping failed:", err.message)
    );
    if (ctx && typeof ctx.waitUntil === "function") {
      ctx.waitUntil(work);
    } else {
      await work;
    }
  }

  return json({ ok: true, id });
}

function approvalButtons(id) {
  return [
    {
      type: 1, // action row
      components: [
        {
          type: 2, // button
          style: 3, // success / green
          label: "Approve",
          emoji: { name: "✅" },
          custom_id: `approve:${id}`,
        },
        {
          type: 2,
          style: 4, // danger / red
          label: "Reject",
          emoji: { name: "❌" },
          custom_id: `reject:${id}`,
        },
      ],
    },
  ];
}

// Map a submission type to the configured admin-only channel. Unknown
// types fall through to the fallback channel so nothing silently drops.
function channelForType(env, type) {
  const map = {
    student:    env.DISCORD_CHANNEL_STUDENT,
    faculty:    env.DISCORD_CHANNEL_FACULTY,
    strata:     env.DISCORD_CHANNEL_STRATA,
    club:       env.DISCORD_CHANNEL_CLUB,
    gov:        env.DISCORD_CHANNEL_GOV,
    collective: env.DISCORD_CHANNEL_COLLECTIVE,
    outside:    env.DISCORD_CHANNEL_OUTSIDE,
  };
  return map[type] || env.DISCORD_CHANNEL_FALLBACK;
}

function newSubmissionId() {
  // 8 hex chars from a fresh UUID — short enough to embed in a code
  // comment, random enough to collide only at absurd volumes.
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8);
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
