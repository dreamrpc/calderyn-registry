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

### Per-pool per-tier per-writer caps

Each writer has **two independent character pools** — students and
adults — and each pool gets its own tier caps, counted across all of
the writer's RPC accounts:

| Tier   | Cap (each pool) | Env var                  |
|--------|-----------------|---------------------------|
| A-List | 5               | `A_LIST_LIMIT_PER_WRITER` |
| B-List | 8               | `B_LIST_LIMIT_PER_WRITER` |
| C-List | 10              | `C_LIST_LIMIT_PER_WRITER` |
| D-List | uncapped        | —                         |

A writer at the student A-List cap can still submit an adult A-Lister
(and vice versa) because the two pools are counted independently.

**Pool determination:**
- A character is **student** if their `powers[]` row carries
  `status: "student"`.
- Anything else (an Outside character, a STRATA hero with non-student
  status, a `heroLists` slot for a character with no `powers[]` row)
  is **adult**.
- The same character is *never* counted in both pools — pool
  classification is character-level, not entry-level. A student who
  also has a STRATA `heroLists` slot still counts as one student, not
  one student + one adult.

**Submission routing** is by form type:
- `Student` form → student pool
- `STRATA`, `Outside`, `Collective Join` (any form with a tier other
  than student) → adult pool
- `Faculty`, `Club`, `Gov`, `Collective Create New` have no tier and
  bypass the quota entirely.

The check fires when an admin clicks ✅ on any submission with a tier.
If approving would push the writer over the cap *for the submission's
pool + tier combination*, the click is rejected with an amber
*"Approval blocked — `<pool>` `<tier>` quota"* embed. The submission
stays in the queue so the admin can revisit later or reject it outright.

**Special cases:**

- Adding a *new role* for a character the writer already owns at the
  same tier (e.g. an A-Lister gaining a faculty seat or a Powerball
  position via another form) is **allowed** — the set doesn't grow.
- Writers who are over a cap from grandfathered early-supporter
  approvals can still add new roles for their existing characters at
  that tier; only *new char names* are blocked.
- The cap values live in `worker/wrangler.toml`; changing one is a
  single edit + a Worker re-deploy.

**Privacy:** the bot never exposes the OOC writer name or the writer's
other characters in any public Discord message. The OOC mapping lives
entirely server-side in [`worker/src/writers.js`](./worker/src/writers.js)
and is consulted only by the quota check. The blocked embed shows
just the count and the cap, nothing that links the submitting RPC
account to the writer's other accounts.

**Auto-mapping new writers.** When a new writer submits the form via
the *"Other / new writer…"* path (typing their handle into the Writer
Tag freeform input) and the submission is approved, the bot commits
the `rpc-username → ooc-name` pair into
[`worker/src/writers.js`](./worker/src/writers.js) automatically on
the same approval, just above the `// AUTO-INSERT:writers` marker.
The same happens if an existing writer submits from a new RPC account.
Lands as a separate commit (`Map new writer: <user> → <handle>`)
right before the registry-data commit, so cross-account quota counting
works on their next submission. Failures are non-fatal — if the
writers.js commit doesn't go through, the registry-data approval
still does and the mapping picks up on the next try.

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
