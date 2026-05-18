# calderyn-registry

Calderyn College — Central Registry. A character roster + lore site for
a roleplay community, with a Discord-button-driven approval workflow
backed by a small Cloudflare Worker.

- **Live site:** <https://calderyn-registry.pages.dev>
- **Hosting:** Cloudflare Pages (static site) + Cloudflare Worker
  (form relay + Discord interactions).
- **Source of truth:** [`data.js`](./data.js). The site renders
  whatever is in this file; the bot writes to it on approval.

## Repo map

```
app.jsx                     ← the site (JSX, loaded via Babel)
data.js                     ← roster, factions, clubs, gov, etc.
index.html, polish.css      ← chrome
worker/                     ← Cloudflare Worker (form relay + Discord)
.github/workflows/          ← auto-deploy for site + worker
PAGES-DEPLOY.md             ← one-time Cloudflare Pages setup
worker/README.md            ← worker overview
worker/DEPLOY-BROWSER.md    ← one-time worker setup (browser only)
```

## How approvals work

1. A writer fills the Join form on the site and submits.
2. The Worker posts a message into the matching `#*-apps` Discord
   channel with Approve / Reject buttons.
3. An admin clicks ✅ Approve. The Worker verifies the signature, runs
   the rule checks below, commits the new entry into `data.js` on
   `main`, and edits the Discord message to show approved state.
4. Cloudflare Pages rebuilds in ~30 s and the new character is live.
5. Clicking ❌ at any point reverses the action; the Worker writes a
   removal commit that undoes the approval.

A roster-change audit log lands in `#registry-log` for every commit.

## Registry rules enforced by the bot

### A-List cap — 5 characters per writer

Each writer is limited to **a maximum of 5 A-List characters across the
entire registry**. The limit applies *per OOC writer*, not per RPC
account — a writer with multiple RPC accounts has a single combined
count.

The check fires when an admin clicks ✅ on a submission whose tier is
`A-List`. If approving would push the writer over the cap, the click
is rejected with an amber *"Approval blocked — A-List quota"* embed.
The submission stays in the queue so the admin can revisit later or
reject it outright.

**Special cases:**

- Adding a *new role* for a character the writer already owns at
  A-List (e.g. that A-Lister gaining a faculty seat or a Powerball
  position via another form) is **allowed** — the set doesn't grow.
- Writers who are over the cap from grandfathered early-supporter
  approvals can still add new roles for their existing A-Listers; new
  characters at A-List remain blocked until they bring the count down
  by re-tiering existing characters.
- The cap value lives in `worker/wrangler.toml` as
  `A_LIST_LIMIT_PER_WRITER`; changing it is one edit + a Worker
  re-deploy.

**Privacy:** the bot never exposes the OOC writer name or the writer's
other characters in any public Discord message. The OOC mapping lives
entirely server-side in [`worker/src/writers.js`](./worker/src/writers.js)
and is consulted only by the quota check. The blocked embed shows
just the count and the cap, nothing that links the submitting RPC
account to the writer's other accounts.

## Editing the registry manually

You don't usually need to — the bot handles approvals. But occasionally
you'll want to:

- **Remove a character** that's left the room → delete their lines
  from `data.js` (`students[]`, `powers[]`, and any other arrays they
  appear in) and push to `main`. Pages rebuilds in ~30 s.
- **Re-tier a character** (e.g. demote an A-Lister to B-List to free
  up a quota slot) → edit the `tier` field in both `students[]` and
  `powers[]` for that character.
- **Add an entry the bot can't route yet** (Phase 2 supports all
  forms via append-only; if you want clean slot-replacement for
  Faculty / STRATA / Club / Gov entries, that's Phase 2b and not
  built yet) → edit `data.js` directly.

## Deploys

Both auto-deploy on push to `main`:

- **Site** → `.github/workflows/deploy-pages.yml` runs
  `wrangler pages deploy` in ~25 s. Triggers on any change outside
  `worker/`, `.github/`, and `README.md`.
- **Worker** → `.github/workflows/deploy-worker.yml` runs
  `wrangler deploy` in ~30 s. Triggers on any change inside `worker/`.

Manual deploys are available via *Run workflow* in the Actions tab.
