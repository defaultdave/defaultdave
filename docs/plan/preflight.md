# Preflight: davidfleming.me (repo `defaultdave`)

The setup the build needs before its first unit starts. The agent drafts this runbook and walks it as a dry run; Dave then does each row for real. Closes the `preflight` unit. Drafted 2026-11-06.

Secrets go from the provider straight into the Vercel env store and local `.env`. Never paste one into a chat, a ticket, or this file. The `secret-guard` hook blocks commands that name `.env`, so the values are typed by Dave, not by an agent.

## Services

| Service | Account (whose) | Plan or tier | Caps that bite on this tier | Workaround when a cap is hit | Secrets it issues | Where each secret lives | Done |
|---|---|---|---|---|---|---|---|
| GitHub repository `defaultdave/defaultdave` | Dave | Free, public (a portfolio repo is itself portfolio) | Actions minutes are unlimited on public repos; 2,000 a month if made private | Keep it public; CI runs build, lint, typecheck, test only | None | | [ ] |
| GitHub App for Keystatic (one per repo, created from Keystatic's setup screen in local mode) | Dave | Free | None | | Client ID, Client Secret, and a generated `KEYSTATIC_SECRET` | Vercel env store: Production and Preview; local `.env`. Client ID may be `NEXT_PUBLIC_` | [ ] |
| GitHub App `defaultdave-agents` (agent identity; project-setup.md section B) | Dave | Free | None | | App ID, Client ID, installation ID (not secret), one private key | Key at `~/.config/defaultdave-agents/app-key.pem` mode 600; ids in `app.conf` beside it; never in the repo | [ ] |
| GitHub Project board for `defaultdave/defaultdave` (section G) | Dave | Free | A GitHub App cannot edit a user-owned project | Board edits run under Dave's login; issue creation as the App | None | | [ ] |
| Vercel project `defaultdave`, Git-linked | Dave | Hobby (non-commercial personal use; a portfolio qualifies) | 100 deployments a day; 1 concurrent build; 100 GB bandwidth a month; 6,000 build minutes a month; 1 member. Verify current figures on vercel.com/pricing at walk time | Deploy cap: batch content commits, or push to a branch and merge once. Concurrent build: PRs queue, wait. Bandwidth: unreachable for this site | `VERCEL_TOKEN` only if the CLI is used from an agent; otherwise none | Not needed at launch | [ ] |
| Vercel Domains: `davidfleming.me` | Dave | $13.99 first year, $20 a year renewal (quoted 2026-11-06; re-check at purchase) | None | If taken at purchase time: `defaultdave.me` or `defaultdave.dev` (both open on 2026-11-06); update `brief.md` and `stack-decisions.md` | None | | [ ] |
| Vercel Web Analytics | Dave | Hobby inclusion | Monthly event cap on Hobby (verify the figure at walk time; it changed in 2025) | Accept the cap; the site is low-traffic | None; enabled per project | | [ ] |
| Vercel Speed Insights | Dave | Hobby inclusion | Monthly data-point cap on Hobby (verify) | Accept; sample rate can be lowered in the component | None | | [ ] |
| Lighthouse CI (GitHub Action, temporary public storage) | none | Free | Report links expire after 7 days | Re-run on demand; scores are also printed in the job log | None | | [ ] |
| Music embed host (Bandcamp, SoundCloud, Spotify or YouTube; open question 1 in the brief) | Dave | Free | Embedding must be allowed on the release; some hosts throttle unauthenticated embeds | Fall back to outbound links for that release | None | | [ ] |

## Environments

| Environment | URL | Database or branch | Who can see it | Done |
|---|---|---|---|---|
| Local | `http://localhost:3000`, Keystatic at `/keystatic` in local mode | Working tree `content/` | Dave | [ ] |
| Preview | `defaultdave-<hash>.vercel.app` per PR | The PR branch; Keystatic GitHub mode writes to that branch | Anyone with the URL (Hobby has no preview protection); nothing sensitive is on it | [ ] |
| Production | `https://davidfleming.me`, `www` redirecting to apex | `main` | Public | [ ] |

## Repository rules

| Rule | Setting | Done |
|---|---|---|
| Default branch protected | `main` ruleset from project-setup.md section E: PR required, no force push, no deletion, bypass = repository admin in `pull_request` mode, approval window on (1 approval, dismissed on push) until Dave closes it | [ ] |
| Required checks | CI job names (format:check, lint, typecheck, test, build, knip, e2e) and `scope-manifest` pinned to Actions (15368); `review-agent`, `qa-agent`, `spec-compliance`, `a11y-audit` pinned to the `defaultdave-agents` App id. Each added once the thing that posts it exists (`scaffold`, then `merge-desk`) | [ ] |
| Who can merge, and how | Auto-merge (squash) once every required check and the approval are green; agents queue it as the App through `scripts/merge-desk/agent-git.ts`. Dave merges `merge-desk` and workflow changes by bypass. Keystatic's GitHub mode commits content straight to `main` under Dave's login; the ruleset's PR requirement is bypassed for that path by the admin role only | [ ] |
| Repo settings | Public; squash only, delete branch on merge, auto-merge on; secret scanning, push protection, private vulnerability reporting, Dependabot alerts on (section A) | [ ] |
| Who can deploy to production | A merge to `main`. No manual promotions, no `vercel --prod` from a laptop | [ ] |

## Agent access

What the agents' sandbox needs so the gates can run: network hosts, local ports, the database and the browser for QA.

| Need | Setting | Tested by | Done |
|---|---|---|---|
| Package registry | `registry.npmjs.org` (allowed by default in the sandbox) | `pnpm install` in a fresh clone | [ ] |
| Dev server port | `3000` on localhost | `pnpm dev` then `curl -I localhost:3000` | [ ] |
| Playwright browser for the smoke run | Chromium already installed; `--trace off` | `pnpm test:e2e` | [ ] |
| Agents push and open PRs only as the App | `.claude/settings.local.json` allows exactly the four merge-desk commands (section F); raw `git push` and `gh pr` keep prompting | `bun scripts/merge-desk/agent-git.ts push main` is refused; the dry run in the `merge-desk` ticket | [ ] |
| Keystatic GitHub mode is never exercised by an agent | Agents run local mode only; the GitHub App secrets are not in the agents' `.env` | `grep -c KEYSTATIC .env` in the agent worktree returns 0 | [ ] |

## Dry run

| Date | Walked by | Rows that failed or were unclear | Fixed |
|---|---|---|---|
| | | | |
