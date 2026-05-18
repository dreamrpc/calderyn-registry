import { verifySignature, editMessage } from "./discord.js";
import { buildEmbed } from "./embed.js";
import { updateFile } from "./github.js";
import { buildInsertions, applyInsertions, removeBySubmissionId, countEntriesFor } from "./markers.js";

const INTERACTION_PONG       = 1;
const INTERACTION_COMPONENT  = 3;

// Response types we send back synchronously.
const PONG                          = 1;
const UPDATE_MESSAGE                = 7; // updates the message the button was on
const CHANNEL_MESSAGE_EPHEMERAL     = 4; // ephemeral reply visible only to clicker

export async function handleInteraction(request, env, ctx) {
  if (!env.DISCORD_PUBLIC_KEY) {
    return new Response("public key not configured", { status: 500 });
  }

  // verifySignature consumes the body once, hands us the raw text back.
  const { ok, body } = await verifySignature(request, env.DISCORD_PUBLIC_KEY);
  if (!ok) return new Response("bad signature", { status: 401 });

  let interaction;
  try {
    interaction = JSON.parse(body);
  } catch {
    return new Response("bad body", { status: 400 });
  }

  if (interaction.type === INTERACTION_PONG) {
    return json({ type: PONG });
  }

  if (interaction.type !== INTERACTION_COMPONENT) {
    return json({
      type: CHANNEL_MESSAGE_EPHEMERAL,
      data: { content: "Unsupported interaction.", flags: 64 },
    });
  }

  const customId = interaction.data?.custom_id || "";
  const [action, id] = customId.split(":");
  if ((action !== "approve" && action !== "reject") || !id) {
    return ephemeral("Unknown button.");
  }

  // Admin role gate. interaction.member.roles is an array of role IDs.
  const roles = interaction.member?.roles || [];
  if (!env.DISCORD_ADMIN_ROLE_ID || !roles.includes(env.DISCORD_ADMIN_ROLE_ID)) {
    return ephemeral("You don't have permission to approve or reject applications.");
  }

  const key = `sub:${id}`;
  const stored = await env.SUBMISSIONS.get(key);
  if (!stored) return ephemeral("This submission is no longer in the queue (expired or never existed).");

  const sub = JSON.parse(stored);
  const fromState = sub.state;
  const toState = action === "approve" ? "approved" : "rejected";

  // No-op if state already matches (double-click on the same button).
  if (fromState === toState) {
    return ephemeral(`Already ${toState}.`);
  }

  // Do the slow work in the background so we can reply within Discord's
  // 3-second deadline. Defer the actual edit + GitHub commit; respond
  // immediately with an ephemeral ack.
  ctx.waitUntil(
    finalizeAction({
      env, sub, toState, fromState, actor: interaction.member?.user,
    }).catch(err => console.error("finalize failed:", err))
  );

  return json({
    type: CHANNEL_MESSAGE_EPHEMERAL,
    data: {
      content: action === "approve"
        ? "✅ Approving — committing to data.js and updating the message…"
        : "❌ Rejecting — updating data.js (if needed) and the message…",
      flags: 64,
    },
  });
}

async function finalizeAction({ env, sub, toState, fromState, actor }) {
  const actorTag = actor ? `<@${actor.id}>` : "an admin";
  const auditLine = { at: new Date().toISOString(), action: toState, by: actor?.id || null };

  // Data-file mutation: only for the Student form in Phase 1.
  let dataFileTouched = false;
  if (sub.type === "student") {
    if (toState === "approved") {
      const insertions = buildInsertions(sub);
      await updateFile(
        env,
        env.GITHUB_DATA_FILE,
        `Approve student application: ${safe(sub.form.char)} (${sub.id})`,
        (current) => {
          // Skip re-insert if entries already present (idempotent retry).
          if (countEntriesFor(current, sub.id) > 0) return current;
          return applyInsertions(current, insertions);
        }
      );
      dataFileTouched = true;
    } else if (toState === "rejected" && fromState === "approved") {
      await updateFile(
        env,
        env.GITHUB_DATA_FILE,
        `Reject previously-approved student application: ${safe(sub.form.char)} (${sub.id})`,
        (current) => {
          if (countEntriesFor(current, sub.id) === 0) return current;
          return removeBySubmissionId(current, sub.id);
        }
      );
      dataFileTouched = true;
    }
  }

  // Update KV state.
  const updated = {
    ...sub,
    state: toState,
    history: [...(sub.history || []), auditLine],
  };
  await env.SUBMISSIONS.put(`sub:${sub.id}`, JSON.stringify(updated), {
    expirationTtl: 60 * 60 * 24 * 180,
  });

  // Edit the original Discord message: change colour + footer to reflect
  // the new state, keep the buttons so an admin can toggle it back.
  const newColor =
    toState === "approved" ? 0x22c55e :     // green
    toState === "rejected" ? 0x6b7280 :     // grey
    0xe31b23;
  const footerSuffix =
    toState === "approved" ? ` · ✅ approved by ${actor?.username || "admin"}` :
    toState === "rejected" ? ` · ❌ rejected by ${actor?.username || "admin"}` :
    "";
  const note =
    sub.type !== "student" && toState === "approved"
      ? "\n_(Phase 1: data.js auto-edit only supports Student form — please update manually.)_"
      : "";

  const newEmbed = buildEmbed(sub.type, sub.form, {
    color: newColor,
    footer: `Calderyn College · Central Registry · 2026${footerSuffix}`,
  });

  // Prepend a status banner to description so the state is unmissable.
  newEmbed.description =
    (toState === "approved" ? "**✅ Approved.**" :
     toState === "rejected" ? "**❌ Rejected.**" : "") +
    (newEmbed.description ? `\n${newEmbed.description}` : "") + note;

  try {
    await editMessage(env, sub.channelId, sub.messageId, {
      embeds: [newEmbed],
      components: approvalButtons(sub.id),
    });
  } catch (err) {
    console.error("message edit failed:", err);
  }

  if (!dataFileTouched && sub.type === "student" && toState === "rejected" && fromState === "pending") {
    // Pending → rejected: nothing to remove from data.js, that's expected.
  }
}

function approvalButtons(id) {
  return [
    {
      type: 1,
      components: [
        { type: 2, style: 3, label: "Approve", emoji: { name: "✅" }, custom_id: `approve:${id}` },
        { type: 2, style: 4, label: "Reject",  emoji: { name: "❌" }, custom_id: `reject:${id}` },
      ],
    },
  ];
}

function ephemeral(content) {
  return json({
    type: CHANNEL_MESSAGE_EPHEMERAL,
    data: { content, flags: 64 },
  });
}

function json(body) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
  });
}

function safe(s) {
  return String(s || "").replace(/[\r\n]/g, " ").slice(0, 80);
}
