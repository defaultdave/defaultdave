# STATUS: davidfleming.me

Current state only. History is in `DECISIONS.md` and `delta-log.md`. Kept under 25 KB by `scripts/pm.sh check`.

Updated 2026-11-07 by portfolio-pm (Opus 5.5), `shell` closed, App-writes follow-up and `keystatic-spike` local half running as seniors. GitHub repo: `defaultdave/defaultdave`, public; issues #1 to #21 are the tickets (no local copies; DECISIONS 2026-11-06), #1, #2, #4, #5 and #6 closed. Project board: [#20](https://github.com/users/defaultdave/projects/20), all 21 issues added; Route and Milestone fields not set up yet. Domain: `davidfleming.me` bought; Vercel project `defaultdave` live, domain not attached yet. Plan: 21 units; owner time 72 h, 2.4 weeks at 30 h/wk, accepted as a measurement.

MILESTONE: 1 Walkable (exit: Home, the Work list and the ResortPass case study live at davidfleming.me). 0 Designed reached 2026-11-06

## Units

State: todo, in progress, in review, done, cut, parked. Round counts review rounds posted. Owner is who holds the next move.

| Unit | State | Route | Round | Issue | PR | Owner | Note |
|---|---|---|---|---|---|---|---|
| `preflight` | done | human only | | #1 | | | closed 2026-11-06; music host Bandcamp |
| `design` | done | human only | | #2 | | | signed off 2026-11-06 on the artifact (v21); Figma dropped |
| `keystatic-spike` | in progress | human only (criterion 1 re-routed to a senior, DECISIONS 2026-11-07) | | #3 | | senior, then Dave | senior builds local mode in `~/Workspace/keystatic-spike-scratch` and drafts `docs/plan/spikes/keystatic.md`; Dave does the GitHub-mode commit and the decision |
| `scaffold` | done | human-led | 2 | #4 | #22 | | merged 2026-11-06 (348b25e); production deploy green; Dave attaches `davidfleming.me` in Vercel; `minimatch` advisory ignored until 2027-01-06 (#23); Node 26 merged (#24) |
| `merge-desk` | done | human-led | 1 | #5 | #25 | | closed 2026-11-07; Actuals row written; dry run passed (DECISIONS 2026-11-06); follow-up (App-backed `issue-comment`, `issue-body`, `pr-body` in `agent-git.ts`, DECISIONS 2026-11-07) building on `unit/merge-desk-app-writes` in `.claude/worktrees/app-writes`, protected paths so Dave pushes |
| `shell` | done | agent fan-out | 3 | #6 | #29, #30 | | merged 2026-11-07 (PR #30 at 13ac9c6, squash ff3ef9e); #6 criteria ticked; Actuals row written; stale worktrees `shell` and `shell-primitives` await Dave's go to remove |
| `cms` | todo | human-led | | #7 | | | after scaffold and the spike; now also creates the Keystatic GitHub App |
| `page-home` | todo | agent fan-out | | #8 | | | swarm, after shell + cms |
| `page-work` | todo | agent fan-out | | #9 | | | swarm |
| `page-writing` | todo | agent fan-out | | #10 | | | swarm |
| `page-music` | todo | agent fan-out | | #11 | | | swarm |
| `page-about` | todo | agent fan-out | | #12 | | | swarm |
| `content-work` | todo | human only | | #13 | | Dave | needs Blocked item 3 |
| `content-writing` | todo | human only | | #14 | | Dave | needs Blocked item 5 |
| `content-music` | todo | human only | | #15 | | Dave | needs Blocked item 2 |
| `content-home-about` | todo | human only | | #16 | | Dave | needs Blocked item 4 |
| `seo-perf` | todo | agent fan-out | | #17 | | | after the five pages |
| `feed` | todo | agent fan-out | | #18 | | | first to cut if the appetite bites |
| `qa-pass` | todo | human-led | | #19 | | | |
| `launch` | todo | human-led | | #20 | | | |
| `tail` | todo | human-led | | #21 | | | |

## Blocked on Dave

1. Attach `davidfleming.me` in the Vercel project's Domains.
2. Decide: which Bandcamp releases, and any release notes (unblocks `content-music`).
3. Decide: can ResortPass be named, or anonymized as in the CrUX article (unblocks publishing `content-work`).
4. Headshot and bio, or text-only About (unblocks `content-home-about`).
5. List of published pieces with URLs (unblocks `content-writing`).
6. Footer email: confirm `defaultdave@gmail.com` is the public one (`src/components/layout/contact-links.ts`).

7. Security, pre-existing: the merge-desk allow rules and sandbox exclusions in `.claude/settings.local.json` match cwd-relative script paths that agents can edit or shadow, so an agent can run its own code outside the sandbox with no prompt (found 2026-11-07, verdict `app-writes/.team-verdicts/review-workflow-r2.md`). Decided 2026-11-07: the shared-engine RFC (PR #31) lands before the swarm; until then no unattended agent runs.

## Next

1. `merge-desk` follow-up on `unit/merge-desk-app-writes` (`.claude/worktrees/app-writes`, 5 commits to d54b41e, not pushed; gates pass, 291 tests). Guard rounds in the worktree's `.team-verdicts/review-workflow-r1.md` to `r4.md`: root and secret-name fixes hold; the body-file path check still loses a narrow race (r4). Next round: take the body on stdin (`-`) so the sandboxed caller reads the file and `agent-git.ts` opens none, after confirming a stdin redirect keeps the allow rule and sandbox exclusion. `.claude/agents/portfolio-pm.md` still carries the round-1 wording; Dave is reworking the PM agents, so leave it or drop it from the branch. Protected paths: Dave pushes and bypass-merges. Do not merge before the stdin round.
2. `keystatic-spike` (#3): criterion 1 passed (local mode on next 16.4.5; evidence in `docs/plan/spikes/keystatic.md`, scratch app `~/Workspace/keystatic-spike-scratch`). Dave runs the GitHub-mode half from that file, then decides GitHub mode / local only / Payload. PM then does criterion 4 (cms estimate in `plan.json`, report rerun).
3. Then `cms` (#7, human-led), the shared merge-desk engine (RFC PR #31, before the swarm, DECISIONS 2026-11-07), then the swarm. Paused 2026-11-07 while Dave reworks the PM agents.

## Next chat

**Before you start:** merge the `merge-desk` follow-up PR; commit this bookkeeping (branch `claude/portfolio-pm-automation-abe358`).

**Run:** `/pm` in `~/Workspace/defaultdave` (terminal: `claude --agent pm`).

**Model and effort:** Sonnet, medium.

**Prompt:** From now on post issue comments and body edits with `node scripts/merge-desk/agent-git.ts issue-comment|issue-body <n> <file>` (file in the repo or $TMPDIR), not `gh issue comment|edit`. Post the #3 progress comment that way (criterion 1 ticked 2026-11-07, evidence `docs/plan/spikes/keystatic.md`). If Dave has run the spike's GitHub-mode half, record his decision in `DECISIONS.md`, tick #3 criteria 2 and 3, do criterion 4 (revisit the `cms` estimate in `docs/plan/plan.json`, rerun `node ~/.claude/skills/plan-project/bin/plan.mjs docs/plan/plan.json > docs/plan/plan-report.md`, add a Re-estimate row), close #3, and prepare `cms` (#7): carry the spike's findings into its build prompt (`allowedDevOrigins: ['127.0.0.1']` in `next.config.ts`; the two Keystatic routes are dynamic, so settle them against the fully static goal). Carry as suggestions, not builds: README and CLAUDE.md do not mention the Storybook scripts; `LinkButton` `isInternalHref` belongs in a tested function; footer links want `min-block-size: 24px`; remove the `glob` override when Storybook moves to the 0.9 docgen plugin; check whether the `GHSA-g3hv-75wg-m249` ignore in `osv-scanner.toml` is now unused; footer email unconfirmed; `post-check.ts` needs a `KEY=VALUE` first line that the review agents' files omit; stale worktrees `shell`, `shell-primitives`, `merge-desk` to remove with Dave's go. Don't commit bookkeeping.

**Swarm (standing call, DECISIONS 2026-11-06: start it the moment the gates hold, no ask):** the five `page-*` units go out as one `senior` subagent each, in their own worktrees, only after `scaffold`, `merge-desk` and `cms` are merged, the design is signed off, the ruleset requires the CI and agent checks, and the merge-desk dry run has passed. Each pushes and opens its PR through `scripts/merge-desk/agent-git.ts` as the App, and writes issue comments and body edits through it too; reviewers post verdicts with `post-check.ts`.
