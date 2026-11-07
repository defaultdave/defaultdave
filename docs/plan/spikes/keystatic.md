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

## GitHub mode (criterion 2, Dave)

Not run by me: it creates a GitHub App in your account and needs you to sign in.

1. Create a scratch GitHub repo, for example `defaultdave/keystatic-spike-scratch` (private is fine). Push the scratch app to it yourself (`git remote add origin ...`, `git push -u origin main`). Do not point this at the real site repo for the spike.
2. In `keystatic.config.ts` change the storage line:
   ```ts
   storage: { kind: 'github', repo: { owner: 'defaultdave', name: 'keystatic-spike-scratch' } },
   ```
   (Pattern for the real site: `process.env.NODE_ENV === 'production' ? { kind: 'github', repo: ... } : { kind: 'local' }`.)
3. Start `pnpm dev`, open `http://127.0.0.1:3000/keystatic` (port as printed). Keystatic shows a first-run "Set up GitHub app" flow. It sends you to GitHub, creates a GitHub App in your account, asks you to install it on the scratch repo only, then redirects back.
4. In dev, Keystatic writes the credentials to `.env` in the scratch dir. Names only: `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`. Keep the values out of chat and the repo. For the real site they go to the Vercel env store per the project's secrets rule.
5. Reload `/keystatic`, sign in with GitHub when prompted, edit the seeded post title, and save. Keystatic commits to the repo (default branch unless you use branch prefixes).

What one committed edit proves: the GitHub OAuth callback and token cookie flow work on Next 16.4.5 App Router (`/api/keystatic/github/*`), and the content round-trips through the GitHub API as a real commit on the scratch repo. Check the commit appears on GitHub with the new title. Remember the GitHub App steps above are Keystatic's documented flow; I could not run them, so treat exact button labels as unverified. Delete the scratch GitHub App and repo afterwards if you do not want them.

## Decision: pending Dave (GitHub mode / local mode only / Payload)

Recommendation: GitHub mode, conditional on criterion 2 passing. Local mode already works on Next 16.4.5 and React 19.3.0 with no peer warnings and a passing build, so the only unproven half is the GitHub OAuth flow, and the fix needed so far (`allowedDevOrigins`) is one config line. It matches the plan (git-based CMS, MDX in `content/`, no database). Fall back to local mode only if the OAuth flow fails; Payload is not worth its database and hosting cost for a personal portfolio. Open item for the cms unit: how the two dynamic routes coexist with the "fully static" goal.
