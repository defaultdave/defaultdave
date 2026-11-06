# Preflight: davidfleming.me (repo `defaultdave`)

The setup the build needs before its first unit starts. The agent drafts this runbook and walks it as a dry run; Dave then does each row for real. Closes the `preflight` unit. Drafted 2026-11-06.

Secrets go from the provider straight into the Vercel env store and local `.env`. Never paste one into a chat, a ticket, or this file. The `secret-guard` hook blocks commands that name `.env`, so the values are typed by Dave, not by an agent.

## Services

| Service | Account (whose) | Plan or tier | Caps that bite on this tier | Workaround when a cap is hit | Secrets it issues | Where each secret lives | Done |
|---|---|---|---|---|---|---|---|
| GitHub repository `defaultdave/defaultdave` | Dave | Free, public (a portfolio repo is itself portfolio) | Actions minutes are unlimited on public repos; 2,000 a month if made private | Keep it public; CI runs build, lint, typecheck, test only | None | | [x] |
| GitHub App for Keystatic (one per repo, created from Keystatic's setup screen in local mode) | Dave | Free | None | | Client ID, Client Secret, and a generated `KEYSTATIC_SECRET` | Vercel env store: Production and Preview; local `.env`. Client ID may be `NEXT_PUBLIC_` | moved to `cms` |
| GitHub App `defaultdave-agents`, shared across Dave's projects (Ramble's `ramble-agents-defaultdave`, renamed; decision 2026-11-06) | Dave | Free | None | Tokens are restricted to one repo when minted (`merge-desk`) | App ID, installation ID (not secret), one private key, shared | Key stays where Ramble keeps it; `~/.config/defaultdave-agents/app.conf` holds the ids and points `APP_KEY` at it; never in the repo | [x] App renamed, permissions read back 2026-11-06; app.conf written (mode 600); repo added to the installation (Dave; `gh` cannot read installations with his token, so the `merge-desk` dry run confirms it) |
| GitHub Project board for `defaultdave/defaultdave` (section G) | Dave | Free | A GitHub App cannot edit a user-owned project | Board edits run under Dave's login; issue creation as the App | None | Project #20 | [x] |
| Vercel project `defaultdave`, Git-linked | Dave | Hobby (non-commercial personal use; a portfolio qualifies) | Verified 2026-11-06 on vercel.com/docs/plans/hobby and /docs/limits: 100 deployments a day (and 100 builds an hour); 1 concurrent build; 45 min per build; 100 GB Fast Data Transfer, 1M CDN requests, 5,000 image transformations, 1M function invocations a month; non-commercial use only. Over a cap: not billed, the feature is blocked until 30 days pass | Deploy cap: batch content commits, or push to a branch and merge once. Concurrent build: PRs queue, wait. Bandwidth: unreachable for this site | `VERCEL_TOKEN` only if the CLI is used from an agent; otherwise none | Not needed at launch | moved to `scaffold` |
| Vercel Domains: `davidfleming.me` | Dave | $13.99 first year, $20 a year renewal (quoted 2026-11-06; re-check at purchase) | None | If taken at purchase time: `defaultdave.me` or `defaultdave.dev` (both open on 2026-11-06); update `brief.md` and `stack-decisions.md` | None | Bought 2026-11-06 on team `david-fleming`, auto-renew on, Vercel nameservers; attaching it moves to `scaffold` | [x] |
| Vercel Web Analytics | Dave | Hobby inclusion | 50,000 events a month, 1 month of data (verified 2026-11-06); over the cap, collection pauses and resumes after 7 days | Accept the cap; the site is low-traffic | None; enabled per project | | moved to `seo-perf` |
| Vercel Speed Insights | Dave | Hobby inclusion | 10,000 events over the last 30 days, shared across the team (verified 2026-11-06) | Accept; sample rate can be lowered in the component | None | | moved to `seo-perf` |
| Lighthouse CI (GitHub Action, temporary public storage) | none | Free | Report links expire after 7 days | Re-run on demand; scores are also printed in the job log | None | | moved to `scaffold` |
| Music embed host (Bandcamp, SoundCloud, Spotify or YouTube; open question 1 in the brief) | Dave | Free | Embedding must be allowed on the release; some hosts throttle unauthenticated embeds | Fall back to outbound links for that release | None | Bandcamp (Dave, 2026-11-06); CSP frame origin `bandcamp.com` | [x] |

## Environments

| Environment | URL | Database or branch | Who can see it | Done |
|---|---|---|---|---|
| Local | `http://localhost:3000`, Keystatic at `/keystatic` in local mode | Working tree `content/` | Dave | moved to `scaffold` |
| Preview | `defaultdave-<hash>.vercel.app` per PR | The PR branch; Keystatic GitHub mode writes to that branch | Anyone with the URL (Hobby has no preview protection); nothing sensitive is on it | moved to `scaffold` |
| Production | `https://davidfleming.me`, `www` redirecting to apex | `main` | Public | moved to `launch` |

## Repository rules

| Rule | Setting | Done |
|---|---|---|
| Default branch protected | `main` ruleset from project-setup.md section E: PR required, no force push, no deletion, bypass = repository admin in `pull_request` mode, approval window on (1 approval, dismissed on push) until Dave closes it | moved to `merge-desk` |
| Required checks | CI job names (format:check, lint, typecheck, test, build, knip, e2e) and `scope-manifest` pinned to Actions (15368); `review-agent`, `qa-agent`, `spec-compliance`, `a11y-audit` pinned to the `defaultdave-agents` App id. Each added once the thing that posts it exists (`scaffold`, then `merge-desk`) | moved to `merge-desk` |
| Who can merge, and how | Auto-merge (squash) once every required check and the approval are green; agents queue it as the App through `scripts/merge-desk/agent-git.ts`. Dave merges `merge-desk` and workflow changes by bypass. Keystatic's GitHub mode commits content straight to `main` under Dave's login; the ruleset's PR requirement is bypassed for that path by the admin role only | moved to `merge-desk` |
| Repo settings | Public; squash only, delete branch on merge, auto-merge on; secret scanning, push protection, private vulnerability reporting, Dependabot alerts on (section A) | [x] read back 2026-11-06 |
| Who can deploy to production | A merge to `main`. No manual promotions, no `vercel --prod` from a laptop | moved to `scaffold` |

## Agent access

What the agents' sandbox needs so the gates can run: network hosts, local ports, the database and the browser for QA.

| Need | Setting | Tested by | Done |
|---|---|---|---|
| Package registry | `registry.npmjs.org` (allowed by default in the sandbox) | `pnpm install` in a fresh clone | moved to `scaffold` |
| Dev server port | `3000` on localhost | `pnpm dev` then `curl -I localhost:3000` | moved to `scaffold` |
| Playwright browser for the smoke run | Chromium already installed; `--trace off` | `pnpm test:e2e` | moved to `scaffold` |
| Agents push and open PRs only as the App | `.claude/settings.local.json` allows exactly the four merge-desk commands (section F); raw `git push` and `gh pr` keep prompting | `bun scripts/merge-desk/agent-git.ts push main` is refused; the dry run in the `merge-desk` ticket | moved to `merge-desk` |
| Keystatic GitHub mode is never exercised by an agent | Agents run local mode only; the GitHub App secrets are not in the agents' `.env` | `grep -c KEYSTATIC .env` in the agent worktree returns 0 | moved to `cms` |

## Dry run

| Date | Walked by | Rows that failed or were unclear | Fixed |
|---|---|---|---|
| 2026-11-06 | portfolio-pm (Opus 5.5), read-only checks via `gh` and Vercel | (1) Repo settings: none applied yet (merge methods, auto-merge, delete-on-merge, secret scanning, push protection, private vulnerability reporting, Dependabot alerts all off). (2) No ruleset. Required checks cannot be required until `scaffold` and `merge-desk` post them; a `pull_request`-mode bypass also blocks direct pushes to `main`, which the PM bookkeeping and the Keystatic row both assume. (3) Keystatic App is created from Keystatic's own setup screen, so it needs the spike or `cms` running. (4) No Vercel project; linking an empty repo has nothing to build, so create it at `scaffold`; Analytics and Speed Insights follow the project. (5) `davidfleming.me` available, $13.99 first year, $20 renewal (matches the quote). (6) `~/.config/defaultdave-agents/` does not exist; the App is not created. (7) Every Agent access row needs `scaffold` or `merge-desk` code. (8) Music host undecided (Blocked on Dave). | Repo and board rows ticked; the rest pending Dave's call on sequencing |
| 2026-11-06 | portfolio-pm (Opus 5.5), read-back after Dave's console steps | Repo settings all on (squash only, delete on merge, auto-merge, secret scanning, push protection, private vulnerability reporting, Dependabot alerts). App `defaultdave-agents` (ID unchanged) has checks, statuses, contents, issues, pull requests write and metadata read. `app.conf` exists, key path resolves, but the file is mode 644. Domain not bought yet (still available). Hobby figures verified on the docs pages. | Repo settings and App rows ticked; left: domain, music host, `app.conf` mode 600 |
| 2026-11-06 | portfolio-pm (Opus 5.5), read-back after the purchase | `davidfleming.me` is on the Vercel team, renew on, nameservers verified, expires 2027-11-06. `app.conf` is mode 600. | Domain row ticked; left: music host |
| 2026-11-06 | portfolio-pm (Opus 5.5), close-out | Music host named: Bandcamp. Every row doable before `scaffold` is ticked; the rest name the unit they moved to. | `preflight` closed |
