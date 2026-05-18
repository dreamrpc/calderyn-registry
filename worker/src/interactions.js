import { verifySignature, editMessage, postMessage } from "./discord.js";
import { buildEmbed } from "./embed.js";
import { updateFile, getFile } from "./github.js";
import { buildInsertions, applyInsertions, removeBySubmissionId, countEntriesFor } from "./markers.js";
import { checkTierQuota, getTierLimits, getOocForForm, extractRpcUsername } from "./quota.js";
import { lookupOocByRpc } from "./writers.js";
import { ensureWriterMapping } from "./writer-mapping.js";

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
  const auditLine = { at: new Date().toISOString(), action: toState, by: actor?.id || null };

  // Auto-register the writer mapping on EVERY admin action — both
  // approve and reject — and regardless of whether the data.js commit
  // path runs. The submission represents a real writer the admin is
  // acknowledging, so their RPC → OOC pair should land in writers.js
  // even if the application itself is rejected, blocked by quota, or
  // for a tierless form (faculty/club/gov) where no data.js mutation
  // happens. Idempotent: ensureWriterMapping no-ops when the mapping
  // is already present. Same call also fires at submission time from
  // submit.js; the duplicate here covers transient failures and
  // pre-mapping legacy submissions.
  try {
    const writerUser = extractRpcUsername(sub.form?.rpcLink);
    const writerOoc  = getOocForForm(sub.form);
    if (writerUser && writerOoc && !lookupOocByRpc(writerUser)) {
      await ensureWriterMapping(env, writerUser, writerOoc);
    }
  } catch (err) {
    console.error("admin-action writer-mapping failed:", err.message);
  }

  // Data-file mutation runs for every form type in Phase 2. Each type's
  // entries are built by markers.js; slot-fill types (faculty, strata,
  // club, gov) append next to any existing placeholder rather than
  // replacing them — see the audit-log note in logEmbed.
  let rosterChange = null; // "added" | "removed" | null
  let commitSha = null;
  let blocked = null;     // populated if quota fails
  if (toState === "approved") {
    // Per-tier quota check — needs the live data.js, so do it here
    // rather than in the synchronous interaction handler. If the
    // writer is about to exceed the cap for the submission's tier,
    // abort the approval: leave KV state untouched and edit the
    // message to show the block.
    if (sub.form?.tier) {
      try {
        const current = await getFile(env, env.GITHUB_DATA_FILE);
        const verdict = checkTierQuota(current.text, sub, getTierLimits(env));
        if (!verdict.allowed) blocked = verdict;
      } catch (err) {
        console.error("quota check failed:", err.message);
        // Be conservative: if we can't verify, allow the approval to
        // proceed rather than block on a transient GitHub hiccup.
      }
    }

    if (!blocked) {
      const insertions = buildInsertions(sub);
      if (insertions.length > 0) {
        const res = await updateFile(
          env,
          env.GITHUB_DATA_FILE,
          `Approve ${sub.type} application: ${safe(sub.form.char || sub.form.newCollectiveName)} (${sub.id})`,
          (current) => {
            if (countEntriesFor(current, sub.id) > 0) return current;
            return applyInsertions(current, insertions);
          }
        );
        if (!res.unchanged) {
          rosterChange = "added";
          commitSha = res.commitSha;
        }
      }
    }
  } else if (toState === "rejected" && fromState === "approved") {
    const res = await updateFile(
      env,
      env.GITHUB_DATA_FILE,
      `Reject previously-approved ${sub.type} application: ${safe(sub.form.char || sub.form.newCollectiveName)} (${sub.id})`,
      (current) => {
        if (countEntriesFor(current, sub.id) === 0) return current;
        return removeBySubmissionId(current, sub.id);
      }
    );
    if (!res.unchanged) {
      rosterChange = "removed";
      commitSha = res.commitSha;
    }
  }

  // Blocked path — quota check refused the approval. Leave KV state
  // unchanged (still pending), restore both buttons, edit the message
  // with a clear explanation. PRIVACY: the embed names neither the OOC
  // writer nor their existing A-List characters — listing those would
  // tie this RPC account to the writer's other accounts publicly.
  if (blocked) {
    const poolLabel = blocked.pool === "student" ? "student" : "adult";
    const blockedEmbed = buildEmbed(sub.type, sub.form, {
      color: 0xf59e0b, // amber — distinguishable from approved/rejected/pending
      footer: `Calderyn College · Central Registry · 2026 · ⚠ ${poolLabel} ${blocked.tier} quota`,
    });
    blockedEmbed.description =
      `**⚠ Approval blocked — ${poolLabel} ${blocked.tier} quota.**\n` +
      `This writer already has **${blocked.count} ${poolLabel} ${blocked.tier} characters** ` +
      `(limit: ${blocked.limit}). The ${poolLabel} pool is counted separately from the ` +
      `${poolLabel === "student" ? "adult" : "student"} pool, so re-tiering one of those ` +
      `won't free up a slot here. No new ${poolLabel} ${blocked.tier} approvals can be ` +
      `accepted until existing ${poolLabel} characters are adjusted to a different tier. ` +
      `The writer has been notified.\n\n` +
      (blockedEmbed.description || "");
    try {
      await editMessage(env, sub.channelId, sub.messageId, {
        embeds: [blockedEmbed],
        components: bothButtons(sub.id),
      });
    } catch (err) {
      console.error("blocked-message edit failed:", err);
    }
    return; // do not update KV, do not log to #registry-log
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
  // the new state, and switch the buttons to show only the *inverse*
  // action so the admin can toggle back with a single click.
  const newColor =
    toState === "approved" ? 0x22c55e :     // green
    toState === "rejected" ? 0x6b7280 :     // grey
    0xe31b23;
  const footerSuffix =
    toState === "approved" ? ` · ✅ approved by ${actor?.username || "admin"}` :
    toState === "rejected" ? ` · ❌ rejected by ${actor?.username || "admin"}` :
    "";
  // Slot-fill forms keep their placeholder row when we append — admin
  // may want to delete it manually so the slot isn't listed twice.
  const SLOT_FILL_TYPES = new Set(["faculty", "strata", "club", "gov"]);
  const note =
    toState === "approved" && rosterChange === "added" && SLOT_FILL_TYPES.has(sub.type)
      ? "\n_Tip: the original placeholder row for this slot is still in data.js — delete it manually if you want a clean roster._"
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
      components: inverseButton(sub.id, toState),
    });
  } catch (err) {
    console.error("message edit failed:", err);
  }

  // Roster-change log post: only when a real data.js commit happened and
  // a valid log channel snowflake is configured. /^\d{17,20}$/ guards
  // against placeholder values like "<PASTE_..." that would otherwise
  // hit Discord and produce noise in logs.
  if (rosterChange && /^\d{17,20}$/.test(env.DISCORD_CHANNEL_LOG || "")) {
    try {
      await postMessage(env, env.DISCORD_CHANNEL_LOG, {
        embeds: [logEmbed({ env, sub, rosterChange, actor, commitSha })],
        allowed_mentions: { parse: [] },
      });
    } catch (err) {
      console.error("log post failed:", err);
    }
  }
}

// After an action, show only the *opposite* button — clicking it toggles
// state back. Pending state (initial) shows both buttons via submit.js.
function inverseButton(id, currentState) {
  const opposite =
    currentState === "approved"
      ? { type: 2, style: 4, label: "Reject",  emoji: { name: "❌" }, custom_id: `reject:${id}` }
      : { type: 2, style: 3, label: "Approve", emoji: { name: "✅" }, custom_id: `approve:${id}` };
  return [{ type: 1, components: [opposite] }];
}

// Both buttons — used when a quota-blocked approval leaves the
// submission in its original state so the admin can either try again
// later (after another A-Lister leaves) or reject outright.
function bothButtons(id) {
  return [{
    type: 1,
    components: [
      { type: 2, style: 3, label: "Approve", emoji: { name: "✅" }, custom_id: `approve:${id}` },
      { type: 2, style: 4, label: "Reject",  emoji: { name: "❌" }, custom_id: `reject:${id}` },
    ],
  }];
}

// Concise log post for the roster-change channel.
function logEmbed({ env, sub, rosterChange, actor, commitSha }) {
  const form = sub.form || {};
  const added = rosterChange === "added";
  const title = added
    ? `📥 Roster updated — added ${form.char || "(unknown)"}${form.alias ? ` (${form.alias})` : ""}`
    : `📤 Roster updated — removed ${form.char || "(unknown)"}${form.alias ? ` (${form.alias})` : ""}`;

  const meta = [
    form.house  && `House: **${form.house}**`,
    form.year   && `Year: ${form.year}`,
    form.track  && `Track: ${form.track}`,
    form.tier   && `Tier: ${form.tier}`,
    form.power  && `Power: ${form.power}`,
  ].filter(Boolean).join(" · ");

  const commitUrl = commitSha
    ? `https://github.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/commit/${commitSha}`
    : null;

  const lines = [
    `${added ? "Approved" : "Removed"} by <@${actor?.id || "unknown"}>`,
    meta,
    commitUrl ? `[View commit](${commitUrl})` : null,
    form.rpcLink ? `[RPC profile](${form.rpcLink})` : null,
  ].filter(Boolean);

  return {
    title,
    description: lines.join("\n"),
    color: added ? 0x22c55e : 0x6b7280,
    footer: { text: `sub:${sub.id} · ${new Date().toISOString()}` },
  };
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
