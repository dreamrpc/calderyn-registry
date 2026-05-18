const API = "https://discord.com/api/v10";

// POST a fresh message into the given channel using the bot token.
// Returns the parsed message object (so we can stash id/channel_id).
export async function postMessage(env, channelId, payload) {
  requireEnv(env, ["DISCORD_BOT_TOKEN"]);
  if (!channelId) throw new Error("postMessage: missing channelId");
  const res = await fetch(
    `${API}/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`discord ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

// PATCH an existing message — used to flip the embed colour, add an audit
// footer, and (optionally) replace the buttons after an admin acts.
export async function editMessage(env, channelId, messageId, payload) {
  requireEnv(env, ["DISCORD_BOT_TOKEN"]);
  const res = await fetch(
    `${API}/channels/${channelId}/messages/${messageId}`,
    {
      method: "PATCH",
      headers: {
        authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`discord edit ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

// Verify the Ed25519 signature Discord puts on every interaction request.
// Public key is the Application's hex-encoded public key.
export async function verifySignature(request, publicKeyHex) {
  const sig = request.headers.get("x-signature-ed25519");
  const ts  = request.headers.get("x-signature-timestamp");
  if (!sig || !ts) return { ok: false, body: null };

  const body = await request.text();
  const key = await crypto.subtle.importKey(
    "raw",
    hexToBytes(publicKeyHex),
    { name: "Ed25519" },
    false,
    ["verify"]
  );
  const ok = await crypto.subtle.verify(
    "Ed25519",
    key,
    hexToBytes(sig),
    new TextEncoder().encode(ts + body)
  );
  return { ok, body };
}

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
}

function requireEnv(env, keys) {
  for (const k of keys) {
    if (!env[k]) throw new Error(`missing env var: ${k}`);
  }
}
