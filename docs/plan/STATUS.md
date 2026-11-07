# STATUS: davidfleming.me

Current state only. History is in `DECISIONS.md` and `delta-log.md`. Kept under 25 KB by `scripts/pm.sh check`.

Updated 2026-11-07 by pm (Sonnet 5.5), `shell` closeout finished and `keystatic-spike` closed (GitHub mode), App-writes follow-up and `keystatic-spike` local half running as seniors. GitHub repo: `defaultdave/defaultdave`, public; issues #1 to #21 are the tickets (no local copies; DECISIONS 2026-11-06), #1, #2, #3, #4, #5 and #6 closed. Project board: [#20](https://github.com/users/defaultdave/projects/20), all 21 issues added; Route and Milestone fields not set up yet. Domain: `davidfleming.me` bought; Vercel project `defaultdave` live, domain not attached yet. Plan: 21 units; owner time 72 h, 2.4 weeks at 30 h/wk, accepted as a measurement.

MILESTONE: 1 Walkable (exit: Home, the Work list and the ResortPass case study live at davidfleming.me). 0 Designed reached 2026-11-06

## Units

State: todo, in progress, in review, done, cut, parked. Round counts review rounds posted. Owner is who holds the next move.

| Unit | State | Route | Round | Issue | PR | Owner | Note |
|---|---|---|---|---|---|---|---|
| `preflight` | done | human only | | #1 | | | closed 2026-11-06; music host Bandcamp |
| `design` | done | human only | | #2 | | | signed off 2026-11-06 on the artifact (v21); Figma dropped |
| `keystatic-spike` | done | human only | | #3 | | | closed 2026-11-07; decision GitHub mode (DECISIONS 2026-11-07); local half by a senior, GitHub half by Dave (commit df2e09b on a scratch repo, scratch repo and App deleted); findings in `docs/plan/spikes/keystatic.md` |
| `scaffold` | done | human-led | 2 | #4 | #22 | | merged 2026-11-06 (348b25e); production deploy green; Dave attaches `davidfleming.me` in Vercel; `minimatch` advisory ignored until 2027-01-06 (#23); Node 26 merged (#24) |
| `merge-desk` | done | human-led | 1 | #5 | #25 | | closed 2026-11-07; Actuals row written; dry run passed (DECISIONS 2026-11-06); follow-up (App-backed `issue-comment`, `issue-body`, `pr-body` in `agent-git.ts`, DECISIONS 2026-11-07) building on `unit/merge-desk-app-writes` in `.claude/worktrees/app-writes`, protected paths so Dave pushes |
| `shell` | done | agent fan-out | 3 | #6 | #29, #30 | | merged 2026-11-07 (PR #30 at 13ac9c6, squash ff3ef9e); #6 criteria ticked; Actuals row written; worktrees `shell` and `shell-primitives` removed 2026-11-07 (verdicts archived in the PM scratchpad; branches `unit/shell-*` kept) |
| `cms` | todo | human-led | | #7 | | Dave | ready: amended 2026-11-07 from the spike (DECISIONS 2026-11-07); run `/senior #7` where Dave decides and the agent types; creates the real Keystatic GitHub App (Dave's hands for the console and secrets) |
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
2. `cms` (#7, human-led): amended and ready. Dave runs `/senior #7` in a new desktop chat in this directory; the Keystatic GitHub App for `davidfleming.me` and its Vercel secrets are his console steps, so keep those for last.
3. Then the shared merge-desk engine (RFC PR #31 merged, engine not built; DECISIONS 2026-11-07), then the swarm. Gates not held: `cms` unmerged, engine unbuilt, swarm paused while Dave reworks the PM agents. `plan.mjs` rejects `plan.json` (unit `preflight` kind; `rounds` estimates need days): fix before the next re-estimate.

## Next chat

**Before you start:** merge the `merge-desk` follow-up PR; commit this bookkeeping (branch `claude/portfolio-pm-automation-abe358`).

**Run:** `/senior #7` in a new desktop chat in `~/Workspace/defaultdave` (PM bookkeeping afterwards with `/pm`).

**Model and effort:** Sonnet, medium.

**Prompt:** `cms` (#7) is amended and ready; the next chat is `/senior #7`, not `/pm`. In `/pm`, once it merges: record actuals, check the swarm gates. Fix `plan.mjs` against `plan.json` (the unit `preflight` kind and the `rounds` estimates) and rerun the report. Carry as suggestions, not builds: README and CLAUDE.md do not mention the Storybook scripts; `LinkButton` `isInternalHref` belongs in a tested function; footer links want `min-block-size: 24px`; remove the `glob` override when Storybook moves to the 0.9 docgen plugin; check whether the `GHSA-g3hv-75wg-m249` ignore in `osv-scanner.toml` is now unused; footer email unconfirmed; `post-check.ts` needs a `KEY=VALUE` first line that the review agents' files omit; stale worktree `merge-desk` (and local branches `unit/shell-tokens`, `unit/shell-primitives`) to remove with Dave's go; round 3 nits, none blocking: `ROOT_BLOCK` in `parse-tokens.ts` takes the first `:root` once the dark block is removed (breaks if a `max-width` block precedes it); `Wordmark` hex values want a comment (or tokens) and its colour index a tested function when it grows; tests use `__dirname` where `import.meta.dirname` fits; Storybook `fontCss` repeats the font variable names; `.storybook/preview.tsx` Footer story decorator padding. Don't commit bookkeeping.

**Swarm (standing call, DECISIONS 2026-11-06: start it the moment the gates hold, no ask):** the five `page-*` units go out as one `senior` subagent each, in their own worktrees, only after `scaffold`, `merge-desk` and `cms` are merged, the design is signed off, the ruleset requires the CI and agent checks, and the merge-desk dry run has passed. Each pushes and opens its PR through `scripts/merge-desk/agent-git.ts` as the App, and writes issue comments and body edits through it too; reviewers post verdicts with `post-check.ts`.
