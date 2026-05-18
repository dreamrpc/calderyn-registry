# Cloudflare Pages — one-time setup

This walks you through enabling the new `.github/workflows/deploy-pages.yml`
so the site auto-deploys to Cloudflare Pages on every push to `main`.
GitHub Pages keeps deploying in parallel until you flip it off.

## What you do once, in a browser

### 1. Add the Pages permission to your existing API token

The token currently authorises Wrangler to deploy the Worker. Pages
deploys need an additional permission on the same token.

1. <https://dash.cloudflare.com/profile/api-tokens>
2. Find the token used for the Worker deploy → click **Edit**.
3. Under **Permissions**, click **Add more** →
   - **Account** → **Cloudflare Pages** → **Edit**.
4. **Continue to summary** → **Update token**. The token value doesn't
   change; no GitHub secret update needed.

> The workflow creates the Pages project itself on its first run via
> the Cloudflare API. No dashboard click required.

### 2. Trigger the first deploy

Either push any site-file change to `main` or run the workflow
manually:

1. <https://github.com/dreamrpc/calderyn-registry/actions/workflows/deploy-pages.yml>
2. **Run workflow** → choose branch `main` → **Run workflow**.
3. Watch the run. The **Ensure Pages project exists** step calls the
   Cloudflare API to create `calderyn-registry` on the first run
   (subsequent runs detect the project already exists and continue).
   The **Deploy to Cloudflare Pages** step then prints the deployed
   URL — typically `https://calderyn-registry.pages.dev` for
   production and a unique
   `https://<deployment-id>.calderyn-registry.pages.dev` URL for
   that specific deployment.

### 3. Verify in a private/incognito window

1. Open <https://calderyn-registry.pages.dev> in incognito.
2. Compare against <https://dreamrpc.github.io/calderyn-registry/> —
   should look identical.
3. Submit a test Student form. It should land in `#student-apps`
   exactly like submissions from the GH Pages site (the Worker's
   CORS allowlist already includes both origins).

If something looks wrong, the GH Pages site is still up — no rush to
disable it.

## When ready, disable GitHub Pages

1. <https://github.com/dreamrpc/calderyn-registry/settings/pages>
2. Under **Build and deployment** → **Source**, change from
   *Deploy from a branch* to **None**, or just disable the deployment.

Old links to `https://dreamrpc.github.io/calderyn-registry/` will
break, so update anything pointing to it (Discord channel descriptions,
bookmarks, the `avatar_url` in submit.js if you ever changed it from
GH Pages, etc.) to the new domain.

## Custom domain (optional, later)

To serve the site at e.g. `registry.calderyn.example` instead of
`*.pages.dev`:

1. Cloudflare dashboard → Workers & Pages → `calderyn-registry` →
   **Custom domains** → **Set up a custom domain**.
2. Add the DNS record Cloudflare suggests (usually a CNAME).
3. Once it's live, add the new origin to
   `worker/wrangler.toml`'s `CORS_ALLOWED_ORIGINS` and re-run the
   Worker deploy workflow.

## How the deploy works

- Trigger: push to `main` that touches anything *outside* `worker/`,
  `.github/`, or `README.md`. Also `workflow_dispatch` from the
  Actions tab.
- The workflow copies site files into a clean `dist/` directory:
  `app.jsx`, `data.js`, `index.html`, `polish.css`, the logo PNG,
  and `.nojekyll` if present.
- `wrangler pages deploy dist` uploads `dist/` to Cloudflare. The CDN
  serves it within ~15–30 s.

## Re-running

Every push to `main` triggers it automatically. Manual re-runs via
**Run workflow** are safe at any time.
