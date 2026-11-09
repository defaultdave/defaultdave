# STATUS: davidfleming.me

Current state only. History is in `DECISIONS.md` and `delta-log.md`. Kept under 25 KB by `scripts/pm.sh check`.

Updated 2026-11-08 by pm (Sonnet 5.5), `cms` closed (PR #35), Blocked items answered, engine fix decided. GitHub repo: `defaultdave/defaultdave`, public; issues #1 to #21 are the tickets (no local copies; DECISIONS 2026-11-06), #1 to #6 closed (#7 closes once Dave confirms its criterion 5). Project board: [#20](https://github.com/users/defaultdave/projects/20), all 21 issues added; Route and Milestone fields not set up yet. Domain: `davidfleming.me` bought; Vercel project `defaultdave` live, domain not attached yet. Plan: 21 units; owner time 72 h, 2.4 weeks at 30 h/wk, accepted as a measurement.

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
| `cms` | done | human-led | 1 | #7 | #35 | Dave | merged 2026-11-08 (c080f48); criteria ticked in #7 except 5 (secrets live nowhere else; Dave confirms, then closes the issue); Actuals row written; GitHub-mode edit proven on the live site (28e5079, reverted in #36) |
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

1. ~~Attach domain~~ done 2026-11-08.
2. `content-music` unblocked: Bandcamp `davidfleming.bandcamp.com` (DECISIONS 2026-11-08).
3. ResortPass naming: Dave is reviewing what the case study names; anonymized until he confirms (password-lock is the fallback).
4. About: headshot supplied; still need the bio text, or confirm text-only.
5. `content-writing` unblocked: three LinkedIn pulse URLs (DECISIONS 2026-11-08).
6. Footer email: Dave wants an address at `davidfleming.me` (forwarding alias; set up before launch).

7. Security, pre-existing (Dave: fix it now, 2026-11-08): the merge-desk allow rules and sandbox exclusions in `.claude/settings.local.json` match cwd-relative script paths that agents can edit or shadow, so an agent can run its own code outside the sandbox with no prompt (found 2026-11-07, verdict `app-writes/.team-verdicts/review-workflow-r2.md`). Decided 2026-11-07: the shared-engine RFC (PR #31) lands before the swarm; until then no unattended agent runs.

## Next

1. Sandbox gap, smallest fix (DECISIONS 2026-11-08), in order: (0) finish the stdin round on `unit/merge-desk-app-writes` (`.claude/worktrees/app-writes`, not pushed; verdicts `r1` to `r4`), Dave pushes; (1) spike done 2026-11-08: the exclusion matches an absolute launcher path only as `<path> *`, and `~/.local/share/` is unwritable from the sandbox (DECISIONS 2026-11-08); (2) git hardening in `agent-git.ts` and `revert.sh`, stacked on 0; (3) `install` for this repo; (4) cutover of `settings.local` and a dry run, then the swarm gate is held. Tickets for 2 and 3 not filed yet.
2. Dave: confirm #7 criterion 5, close #7; set up a forwarding address at `davidfleming.me`; bio text; ResortPass naming call.
3. Then the swarm. Gates not held: engine unbuilt, swarm paused while Dave reworks the PM agents. `plan.mjs` rejects `plan.json` (unit `preflight` kind; `rounds` estimates need days): fix before the next re-estimate. Carried suggestions, not builds: README and CLAUDE.md do not mention the Storybook scripts; `LinkButton` `isInternalHref` wants a tested function; footer links want `min-block-size: 24px`; remove the `glob` override when Storybook moves to the 0.9 docgen plugin; check whether the `GHSA-g3hv-75wg-m249` ignore in `osv-scanner.toml` is unused; `post-check.ts` needs a `KEY=VALUE` first line the review agents' files omit; stale worktrees (`merge-desk`, `objective-stonebraker-fefca0`, `github-pr-screenshots-skill-5a3f0d`, `keystatic-config-collections-and-singlet`) and branches `unit/shell-*` to remove with Dave's go; `ROOT_BLOCK` in `parse-tokens.ts`; `Wordmark` hex comment; tests `__dirname` vs `import.meta.dirname`; Storybook `fontCss`; Footer story padding.

## Next chat

**Before you start:** push and merge the bookkeeping PR (branch `revert-keystatic-test`); confirm #7 criterion 5.

**Run:** `/pm` in a new desktop chat in `~/Workspace/defaultdave`.

**Model and effort:** Sonnet, medium (Opus, high if the engine ticket needs a design call).

**Prompt:** Read `docs/plan/STATUS.md` Next item 1. File the tickets for pieces 2 (git hardening) and 3 (`install`) as issues with scope manifests; then print the `/senior` command for the app-writes stdin round. Don't commit.

**Swarm (standing call, DECISIONS 2026-11-06: start it the moment the gates hold, no ask):** the five `page-*` units go out as one `senior` subagent each, in their own worktrees, only after `scaffold`, `merge-desk` and `cms` are merged, the design is signed off, the ruleset requires the CI and agent checks, and the merge-desk dry run has passed. Each pushes and opens its PR through `scripts/merge-desk/agent-git.ts` as the App, and writes issue comments and body edits through it too; reviewers post verdicts with `post-check.ts`.
