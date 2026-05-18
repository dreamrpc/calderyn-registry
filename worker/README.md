# calderyn-registry-relay (Worker)

Cloudflare Worker that powers the registry's application flow:

- `POST /submit` — receives a form submission from `app.jsx`, posts a
  Discord message with **Approve ✓ / Reject ✗** buttons into the admin
  channel, and stashes the submission in KV.
- `POST /interactions` — Discord posts here when an admin clicks a
  button. The Worker verifies the request signature, checks the clicker
  has the admin role, and auto-edits `data.js` via the GitHub API to
  add or remove the entry.

> **All seven form types auto-route to `data.js`.** Student / Powers
> Registry / Collective Join / Outside also write a `powers[]` entry
> when the character isn't fully human. Faculty / STRATA / Club / Gov
> append next to any existing placeholder slot — those leave the
> original empty row in place, so the audit-log embed reminds you to
> delete it manually if you want a tidy roster.

---

## One-time setup

> **No terminal?** Skip this whole section and follow
> [`DEPLOY-BROWSER.md`](./DEPLOY-BROWSER.md) instead — that path uses
> only the Cloudflare dashboard + GitHub Actions and never needs a
> shell. The walkthrough below assumes a local terminal with `node`
> and `npx` available.

### 1. Discord — create the application

1. Go to <https://discord.com/developers/applications> → **New
   Application**. Name it whatever you like (e.g. *Calderyn Registry
   Relay*).
2. **General Information** tab — copy the **Application ID** and the
   **Public Key**. You'll need both.
3. **Bot** tab → *Reset Token* → copy the bot token (save it; Discord
   only shows it once). Toggle on **Server Members Intent**
   (`PRESENCE_INTENT` is NOT needed). Save.
4. **OAuth2 → URL Generator**: tick `bot` and `applications.commands`.
   Bot permissions: `Send Messages`, `Read Message History`, `View
   Channels`. Open the generated URL and invite the bot to your server.
5. For each form type, you need an admin-only channel for its approval
   messages — `student-apps`, `faculty-apps`, `strata-apps`,
   `club-apps`, `gov-apps`, `collective-apps`, `outside-apps`, plus an
   `apps-fallback` for anything unrecognised. Right-click each →
   **Copy Channel ID** (Developer Mode on: Settings → App Settings →
   Advanced → Developer Mode). Paste each into the matching
   `DISCORD_CHANNEL_*` entry in `wrangler.toml`. The bot needs
   *View Channel* + *Send Messages* + *Read Message History* in every
   channel it'll post to.
6. In Discord, right-click the **admin role** in the server's role list
   → **Copy Role ID**.

### 2. GitHub — fine-grained PAT

1. <https://github.com/settings/personal-access-tokens/new> → **Fine-
   grained token**.
2. **Resource owner:** `dreamrpc`.
3. **Repository access:** select `calderyn-registry` only.
4. **Permissions** → *Repository permissions* → set **Contents** to
   **Read and write**. Leave everything else at *No access*.
5. Generate. Copy the token (`github_pat_...`); you won't see it again.

### 3. Cloudflare — deploy the Worker

```bash
cd worker
npm install
npx wrangler login           # opens browser, one-time
npx wrangler kv namespace create SUBMISSIONS
```

The KV command prints something like:
```
[[kv_namespaces]]
binding = "SUBMISSIONS"
id = "abc123..."
```
Copy that `id` into `wrangler.toml` (replace `<PASTE_KV_NAMESPACE_ID_HERE>`).

In `wrangler.toml`, also fill in the non-secret IDs you copied above:
- `DISCORD_APPLICATION_ID`
- `DISCORD_ADMIN_ROLE_ID`
- `DISCORD_CHANNEL_STUDENT` / `_FACULTY` / `_STRATA` / `_CLUB` /
  `_GOV` / `_COLLECTIVE` / `_OUTSIDE` / `_FALLBACK`

Then store the **secrets**:
```bash
npx wrangler secret put DISCORD_PUBLIC_KEY
npx wrangler secret put DISCORD_BOT_TOKEN
npx wrangler secret put GITHUB_TOKEN
```
Paste the matching value when prompted for each.

Deploy:
```bash
npx wrangler deploy
```

Wrangler prints the live URL, e.g.
`https://calderyn-registry-relay.dreamroleplaywriter.workers.dev`.

### 4. Discord — point interactions at the Worker

Back at <https://discord.com/developers/applications> → your app →
**General Information** → set **Interactions Endpoint URL** to:

```
https://<your-worker-url>/interactions
```

Discord pings the URL on save to verify it. If you get *"interactions
endpoint url could not be verified"*, double-check that
`DISCORD_PUBLIC_KEY` is set as a Worker secret and matches the value on
this page exactly.

### 5. Client — confirm the URL matches

The site's `app.jsx` posts to `WORKER_URL` (top of file). If your
Worker URL differs from the existing
`https://calderyn-registry-relay.dreamroleplaywriter.workers.dev`,
update that constant and commit.

---

## How a submission flows

1. User fills the form on the site, clicks **Submit Application**.
2. Browser POSTs `{ type, form }` to the Worker's `/submit`.
3. Worker generates an 8-char `sub:<id>`, builds the Discord embed,
   posts it to the admin channel with two buttons (Approve / Reject),
   and stores `{ type, form, state: "pending", messageId, ... }` in KV
   under `sub:<id>`.
4. An admin (someone with the configured admin role) clicks a button.
5. Discord POSTs the interaction to `/interactions`. Worker verifies
   the Ed25519 signature, confirms the clicker's `member.roles`
   includes the admin role, then:
   - **Approve** *(Student)*: commits a new entry to `data.js`
     immediately above the `// AUTO-INSERT:students` marker (and
     `// AUTO-INSERT:powers` if the character isn't fully human). Each
     inserted line ends with `// sub:<id>` so future toggles can find
     and remove it.
   - **Reject** of a previously-approved entry: removes any line
     ending in `// sub:<id>` from `data.js`.
   - **Reject** while still pending: just marks the KV state and edits
     the Discord message.
   - **Re-approve** after reject: re-inserts (idempotent — skips if
     the entry is already present).
6. The Discord message is edited to show the new state in the
   description (`✅ Approved.` / `❌ Rejected.`) and footer, with the
   buttons kept so you can toggle.
7. GitHub Pages rebuilds in 30–60 s after each commit and serves the
   updated `data.js`.

## Important behaviours

- **Admin gate.** Anyone without `DISCORD_ADMIN_ROLE_ID` who clicks a
  button gets an ephemeral *"you don't have permission"* reply; nothing
  else happens.
- **Idempotency.** Re-clicking the same button is a no-op. Approve
  while already approved → ephemeral *"Already approved."*.
- **Concurrent writes.** `updateFile` retries up to four times on a
  GitHub SHA conflict (someone else committed between read and write).
- **KV expiry.** Submissions live in KV for 180 days. After that, the
  buttons stop working on old messages — by design, the queue isn't
  forever.
- **Markers must stay put.** `data.js` must contain a line of the
  form `// AUTO-INSERT:students` and `// AUTO-INSERT:powers` directly
  above each section's closing `],`. Removing them breaks the approval
  flow until they're restored.

## Local dev

```bash
cd worker
npx wrangler dev   # local Worker at http://127.0.0.1:8787
```

Discord won't be able to reach localhost; for `/interactions` testing
you'd need to tunnel (e.g. `cloudflared tunnel`) and point the
Interactions Endpoint URL at the tunnel. Day-to-day, `wrangler tail`
against the deployed Worker is faster.

## Logs / troubleshooting

```bash
npx wrangler tail
```
Shows live request logs from the deployed Worker. Useful for diagnosing
"the button did nothing" failures — those land here as a clear error
line.
