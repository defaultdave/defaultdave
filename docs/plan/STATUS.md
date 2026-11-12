# STATUS: davidfleming.me

Current state only. History is in `DECISIONS.md` and `delta-log.md`. Kept under 25 KB by `scripts/pm.sh check`.

Updated 2026-11-11 by pm (Sonnet 5.5): the swarm ran. All five page PRs are merged (#52, #53, #54, #55, #56) and the bookkeeping PR #57 with them. GitHub repo: `defaultdave/defaultdave`, public; issues #1 to #21 are the tickets (no local copies; DECISIONS 2026-11-06), #1 to #6 closed (#7 closes once Dave confirms its criterion 5). Project board: [#20](https://github.com/users/defaultdave/projects/20), all 21 issues added; Route and Milestone fields not set up yet. Domain: `davidfleming.me` bought; Vercel project `defaultdave` live, domain attached 2026-11-08. Plan: 21 units; owner time 72 h, 2.4 weeks at 30 h/wk, accepted as a measurement.

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
| `page-home` | done | agent fan-out | 1 | #8 | #54 | | merged 2026-11-11 (4cbbe7e); one review round, CI e2e covers the h1 and axe criterion; issue #8 closes with the PR |
| `page-work` | done | agent fan-out | 2 | #9 | #53 | | merged 2026-11-11 (fa469c0); AC 5 amended (DECISIONS 2026-11-11); `architecture-audit` failed, advisory (follow-up needs `src/lib` files); issue #9 still open on GitHub until closed by hand or by `Closes #9` lag, check |
| `page-writing` | done | agent fan-out | 1 | #10 | #56 | | merged 2026-11-11 (fd38fdc); CI failed lint and knip on the first push, one fix commit; list date has no `<time>` element (nit) |
| `page-music` | done | agent fan-out | 1 | #11 | #55 | | merged 2026-11-11 (2081e18); Lighthouse CLS assertion moved to `seo-perf` (DECISIONS); real embeddable URLs come with `content-music` |
| `page-about` | done | agent fan-out | 1 | #12 | #52 | | merged 2026-11-11 (dceecfa); first page of the swarm |
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

1. Launcher leftovers: the `scripts/merge-desk/README.md` rewrite landed (#61). Issue #62 covers the old-form calls still in `revert.sh` and the usage comments in `agent-git.ts` and `post-check.ts`; `scope-manifest.yml:40` keeps the old form on purpose (CI runs from the checkout). `scripts/merge-desk/` is protected, so Dave pushes and bypass-merges the PR. The sandbox-gap work (#40, #41, cutover, dry run) is done; its history is in DECISIONS.
2. Dave: confirm #7 criterion 5, close #7; set up a forwarding address at `davidfleming.me`; bio text; ResortPass naming call.
3. Swarm done: all five page units merged. Dave-owned follow-ups: PR screenshots via `pr-images` (none of #52 to #56 carries images, and they are merged, so add them only if wanted); body Amendment sections on issues #9 and #11 (comments are posted; the launcher guard refuses the quotes in the bodies); `seo-perf` (#17) picks up the Lighthouse CI config, `Figure` sizing, CSP frame origins and sitemap routes (DECISIONS 2026-11-11), estimate to confirm before it starts. Carried suggestions, not builds: architecture-audit B2 findings on `page-work` (move filter-by-kind into `src/lib`); `linkTarget()` into `src/lib`; a featured slug that resolves to nothing is dropped silently; list dates have no `<time>` element on /articles and /musings; `plan.mjs` rejects `plan.json` (unit `preflight` kind; every unit's `estimate` needs o, m and p in days, the rounds-based ones are rejected): fix before calibrating.
4. Review-agent size rule settled (DECISIONS 2026-11-11): tests leave the changed-line count. Dave applies the one-line edit in `vig/global/agents/review.md` (sandbox blocks the PM); until then the old rule still fires. Verdict keys: from #40 round 4 the prompt names the agent's own key (`REVIEW_VERDICT=`, `ARCH_VERDICT=`); check again on the next real `/review-pr`.

## Next chat

**Before you start:** close #7 once you confirm its criterion 5; the content inputs in Blocked on Dave (bio text, ResortPass naming, forwarding address); handle #62 (Next 1) when you want it, it is not blocking. The page swarm is done (#52 to #56, bookkeeping #58); do not start it again.

**Run:** `/pm` in a new desktop chat in `~/Workspace/defaultdave`.

**Model and effort:** Sonnet, medium.

**Prompt:** Read `docs/plan/STATUS.md` and the tail of `DECISIONS.md`. All five page PRs are merged. Calibration is due (the card says after the third agent-built unit merges; `shell` and four page units have): medians into `plan.json` assumptions, `calibrated` set, rerun `plan.mjs` (fix its `preflight` rejection first), a Re-estimate row. Then check what milestone 1 (Walkable) still needs: `content-work` is Dave's. Next fan-out after the pages is `seo-perf` (#17, scope grew, see DECISIONS 2026-11-11) and `feed` (#18): confirm the `seo-perf` estimate with Dave first. Don't commit.

**Agent gates for the next swarm (DECISIONS 2026-11-11):** tell each `senior` to run lint, typecheck, test, build, format:check and knip from a clean `.next` before committing; two of five page units failed CI lint on `PageProps` types that only exist after a build.
