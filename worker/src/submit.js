import { buildEmbed } from "./embed.js";
import { postMessage } from "./discord.js";

export async function handleSubmit(request, env) {
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

  const id = newSubmissionId();
  const embed = buildEmbed(type, form);
  const components = approvalButtons(id);

  let posted;
  try {
    posted = await postMessage(env, {
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
