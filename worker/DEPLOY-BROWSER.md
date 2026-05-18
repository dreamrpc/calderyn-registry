# Browser-only deploy (no terminal required)

This walks you through deploying the Worker entirely from a browser via
GitHub Actions + the Cloudflare dashboard. No `npm`, no `wrangler`, no
local shell.

You do **five** one-time things in browser tabs, then click **Run
workflow** in GitHub.

---

## 1. Cloudflare dashboard — create the KV namespace

A KV namespace is the tiny key-value store that holds pending
submissions while admins approve / reject them.

1. Go to <https://dash.cloudflare.com/> → sign in.
2. Left sidebar → **Workers & Pages** → **KV**.
3. Click **Create a namespace**. Name it exactly `SUBMISSIONS`.
   Click **Add**.
4. After creation, the namespace appears in the list with an
   **ID** column. Copy that ID (looks like `0e3d4f8c…`).
5. Paste it to me in chat and I'll commit it into `wrangler.toml` —
   that's the only edit that has to happen in code, and I can do it
   for you.

---

## 2. Cloudflare dashboard — create an API token

This is what GitHub Actions uses to deploy the Worker. **It is a
secret** — once you generate it, don't paste it anywhere except
GitHub's secrets store.

1. Still on <https://dash.cloudflare.com/> → top-right user menu →
   **My Profile** → **API Tokens** → **Create Token**.
2. Find the template **"Edit Cloudflare Workers"** → click **Use
   template**.
3. **Account Resources**: select your account.
4. **Zone Resources**: leave as *All zones from an account* (Workers
   don't need a zone but the template asks anyway).
5. Click **Continue to summary** → **Create Token**.
6. Copy the token. Save it; Cloudflare only shows it once.

While you're in the dashboard, also grab your **Account ID**:

- Workers & Pages page, right sidebar → **Account ID**. Or
  <https://dash.cloudflare.com/> URL: `dash.cloudflare.com/<account-id>/...`.

---

## 3. GitHub repo — add the secrets

1. Go to <https://github.com/dreamrpc/calderyn-registry/settings/secrets/actions>.
2. Click **New repository secret** for each of the following. Name
   exactly as shown. Paste the matching value and click **Add secret**.

   | Name                    | Value                                                |
   |-------------------------|------------------------------------------------------|
   | `CLOUDFLARE_API_TOKEN`  | Token from step 2                                    |
   | `CLOUDFLARE_ACCOUNT_ID` | Account ID from step 2                               |
   | `DISCORD_PUBLIC_KEY`    | Discord application's Public Key                     |
   | `DISCORD_BOT_TOKEN`     | Discord bot token                                    |
   | `GH_DATA_PAT`           | GitHub fine-grained PAT with Contents:Read+Write     |

   > **Why `GH_DATA_PAT` and not `GITHUB_TOKEN`?**
   > `GITHUB_TOKEN` is a name GitHub reserves for the auto-generated
   > token Actions create per run — you can't store your own under that
   > name. The workflow uploads your PAT to Cloudflare under the name
   > `GITHUB_TOKEN` (which is what the Worker code reads), but the
   > GitHub-side secret is called `GH_DATA_PAT` to dodge the conflict.

---

## 4. (After I commit the KV id) Merge PR #64

I'll wait for your KV namespace id, commit it into `wrangler.toml`,
and update the PR. Then you merge **PR #64** via the GitHub web UI
(big green **Merge pull request** button).

---

## 5. GitHub repo — trigger the deploy

After PR #64 is merged into `main`, the workflow will auto-run
because it watches `worker/**` paths. You can also trigger it
manually any time:

1. <https://github.com/dreamrpc/calderyn-registry/actions/workflows/deploy-worker.yml>
2. Right side: **Run workflow** → choose branch `main` → **Run
   workflow**.
3. Watch the run. The "Deploy + push secrets" step is where the
   actual `wrangler deploy` happens. At the end, the logs print the
   deployed URL — should be
   `https://calderyn-registry-relay.dreamroleplaywriter.workers.dev`
   (or similar if your Cloudflare subdomain is different).

If the URL the workflow prints **does not match** what's in `app.jsx`
(currently `https://calderyn-registry-relay.dreamroleplaywriter.workers.dev/submit`),
paste it to me and I'll update `app.jsx` with the correct URL.

---

## 6. Discord developer portal — point interactions at the Worker

1. <https://discord.com/developers/applications> → **Calderyn
   Registry** (your application).
2. **General Information** → **Interactions Endpoint URL** →
   `https://calderyn-registry-relay.dreamroleplaywriter.workers.dev/interactions`
   (substitute the URL from step 5 if different).
3. **Save Changes**. Discord pings the URL to verify the signature.
4. If it goes green → you're live.

If Discord rejects the URL, 99% of the time it's because
`DISCORD_PUBLIC_KEY` was pasted wrong. Edit that secret in GitHub,
re-run the workflow, and try Discord again.

---

## Things that work after this is live

| Action                                | Result                                                                 |
|---------------------------------------|------------------------------------------------------------------------|
| Submit any form on the website        | Lands in the form's dedicated channel (`student-apps`, etc.) with two buttons. |
| Admin clicks ✅ on a Student form     | New entry committed to `data.js` on `main`; site rebuilds in ~1 min.   |
| Non-admin clicks any button           | Ephemeral "you don't have permission" reply; nothing happens.          |
| Admin clicks ❌ on an approved entry  | The committed lines are removed from `data.js`; site rebuilds.         |
| Admin re-clicks ✅                    | Lines re-added (idempotent).                                           |
| Submit Faculty/Club/etc.              | Posts to its channel; approve/reject toggles state but doesn't yet edit `data.js` (Phase 2). |

---

## Re-running the deploy later

Any change you make under `worker/**` on `main` triggers the deploy
automatically. You can also click **Run workflow** any time from the
Actions tab — Wrangler upserts the secrets and re-deploys on every run.

If you rotate a secret (e.g., regenerate the bot token after this
chat), just update the matching GitHub secret and re-run the workflow.
No other action needed.
