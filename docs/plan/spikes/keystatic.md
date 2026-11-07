# Spike: Keystatic on Next.js 16.4 App Router (issue #3)

Date: 2026-11-07. Scratch app: `/Users/davidfleming/Workspace/keystatic-spike-scratch` (own git repo, never pushed, outside this repo).

## Criterion 1: local mode mounts and edits an entry. PASS

Keystatic mounted at `/keystatic` in local mode, the seeded entry opened in the editor, the title was changed and saved from the UI, and the file on disk changed.

Diff from the scratch repo after clicking Save:

```
--- a/content/posts/hello/index.mdoc
+++ b/content/posts/hello/index.mdoc
@@ -1,4 +1,4 @@
 ---
-title: Hello Keystatic
+title: Hello Keystatic edited
 ---
 This is the seeded entry for the spike.
```

Screenshot (kept outside the repo): `/Users/davidfleming/Workspace/keystatic-spike-scratch/screenshots/keystatic-edit-saved.png`

The edit was driven through the real UI with Playwright (title textbox, Save button). The API calls behind it (`/api/keystatic/tree`, `/api/keystatic/blob/...`) returned 200.

## Production build: PASS

`pnpm build` with Keystatic mounted completed: compiled, TypeScript passed, 3 static pages generated. Routes:

```
○ /
○ /_not-found
ƒ /api/keystatic/[...params]
ƒ /keystatic/[[...params]]
```

Both Keystatic routes are dynamic (server-rendered on demand), not static. The site is meant to be fully static, so the cms unit must decide how these routes ship (Vercel runs them as functions, which is fine, but `output: 'export'` would not work with them). I did not test `output: 'export'`.

## Versions (exact)

| Item | Version |
|---|---|
| next | 16.4.5 (Turbopack) |
| react / react-dom | 19.3.0 (19.3.1 is available) |
| @keystatic/core | 0.6.9 |
| @keystatic/next | 5.0.5 |
| typescript | 6.0.3 (pinned to match the site; the unpinned install picked 7.0.2) |
| @types/react, @types/react-dom | 19.3.0 |
| @types/node | 26.6.6 |
| pnpm | 10.26.2 |
| Node | 25.2.1 on this machine (the brief says 26; not 26 here, so unverified on 26) |

## Install warnings

None. pnpm printed no peer dependency warnings against React 19.3.0 or Next 16.4.5. Declared peers: `@keystatic/core` accepts react `^18.2.0 || ^19.0.0`; `@keystatic/next` accepts `next >=14` and the same react range.

## Errors hit and workarounds

1. **Blank /keystatic page in dev (real finding).** Next 16 blocks `/_next/*` dev resources (HMR) from origins other than localhost. Keystatic's route handler normalizes `localhost` to `127.0.0.1`, so the page served 200 but never hydrated and the body was empty. Dev log: "Blocked cross-origin request to Next.js dev resource /_next/hmr from 127.0.0.1". Fix in `next.config.ts`:
   ```ts
   const nextConfig: NextConfig = { allowedDevOrigins: ['127.0.0.1'] };
   ```
   The real site needs this too, or Dave should open the CMS at `http://127.0.0.1:3000/keystatic` only after adding it. Restart the dev server after changing it.
2. **Doc snippet path.** The docs example imports `'../../keystatic.config'` in `app/keystatic/[[...params]]/page.tsx`. From that folder the correct path is `'../../../keystatic.config'`.
3. **Directory entries.** For `content/posts/hello/index.mdoc` the collection path must be `content/posts/*/` (trailing slash), otherwise the entry is not found.
4. **Environment only (not Keystatic).** Inside the agent sandbox, Turbopack failed with "unable to start FSEvent stream", so the dev server and build ran unsandboxed. A normal terminal will not hit this. `npm view` also failed on a root-owned `~/.npm` cache; pnpm install worked, so installs were unaffected. Dave may want `sudo chown -R 501:20 ~/.npm`.
5. Dev console noise from the browser tool: favicon 404 and HMR websocket errors before fix 1. Nothing after it.

Next 16 also generated an `AGENTS.md` in the scratch app (`agentRules: false` turns this off).

## Files in the scratch app

`keystatic.config.ts` (local storage, `posts` collection, `fields.slug` title, `fields.markdoc` content), `app/keystatic/[[...params]]/page.tsx` (`'use client'`, `makePage(config)` from `@keystatic/next/ui/app`), `app/api/keystatic/[...params]/route.ts` (`makeRouteHandler({ config })` from `@keystatic/next/route-handler`), `content/posts/hello/index.mdoc`.

## GitHub mode (criterion 2): PASS

Run by Dave on 2026-11-07 against `defaultdave/keystatic-spike-scratch` (private), same scratch app, `storage: { kind: 'github', repo: { owner: 'defaultdave', name: 'keystatic-spike-scratch' } }`, dev server on next 16.4.5.

- Keystatic's first-run "Set up GitHub app" flow created a GitHub App in the owner's account; Dave left Deployed App URL and organization blank, installed it on the scratch repo only, and landed on `/keystatic/branch/main` signed in. The OAuth callback and token cookie flow work on Next 16.4.5 App Router.
- One edit saved from the UI committed to GitHub: `df2e09b` "Update content/posts/new slug" (author David Fleming, 2026-11-07 20:25 UTC), verified with `gh api` on the repo: `content/posts/hello/index.mdoc` removed, `content/posts/new slug/index.mdoc` added.
- Finding: the collection's slug field is the title, so editing the title renames the entry folder (`hello` to `new slug`, with a space). The real site needs a stable slug field separate from the title, or a title edit changes the URL.
- Not tested: production (Vercel) OAuth callback with a real Deployed App URL, branch prefixes, and Node 26. The real Keystatic App, with `davidfleming.me` as the deployed URL and its secrets in the Vercel env store, is `cms` work.
- Cleanup: Dave deleted the scratch repo and the scratch GitHub App on 2026-11-07.

## Decision: GitHub mode (Dave, 2026-11-07)

GitHub mode. Local mode stays the dev default through `process.env.NODE_ENV === 'production' ? { kind: 'github', ... } : { kind: 'local' }` (to confirm in `cms`). Payload is out. Carry into `cms`:

1. `allowedDevOrigins: ['127.0.0.1']` in `next.config.ts`.
2. A stable slug field, not the title.
3. The two Keystatic routes are dynamic; settle them against the fully static goal (Vercel runs them as functions; `output: 'export'` is out).
4. Create the real Keystatic GitHub App for `davidfleming.me` and put its secrets in the Vercel env store.
