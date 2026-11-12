# STATUS: davidfleming.me

Current state only. History is in `DECISIONS.md` and `delta-log.md`. Kept under 25 KB by `scripts/pm.sh check`.

Updated 2026-11-11 by pm (Opus 5.5): calibration done (path 1.1 to 1.3 weeks, was 1.7 to 2.2; delta-log Calibration and Re-estimates); `plan.mjs` accepts `plan.json` again. #66 (Vercel Analytics behind the wrapper) built by one `senior`, PR #67 open as the App. Page swarm merged (#52 to #56). GitHub repo: `defaultdave/defaultdave`, public; issues #1 to #21 are the plan tickets, #66 is a split from `seo-perf` (DECISIONS 2026-11-11). Project board: [#20](https://github.com/users/defaultdave/projects/20). Domain `davidfleming.me` live on Vercel project `defaultdave`.

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
| `analytics` | in review | agent fan-out | 1 | #66 | #67 | Dave | round 1 at a95873f: review-agent (approve with nits: caret version), qa-agent (PM, browser pane), spec-compliance, a11y-audit posted green; CI green except `scope-manifest` (no `analytics` unit in `plan.json` on main, fixed by the bookkeeping PR); criteria 1 to 5 confirmed in a #66 comment, 6 is Dave's after deploy |
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
3. ~~ResortPass naming~~ decided 2026-11-11: stays anonymized (DECISIONS); `content-work` is unblocked on this.
4. About: headshot supplied; still need the bio text, or confirm text-only.
5. `content-writing` unblocked: three LinkedIn pulse URLs (DECISIONS 2026-11-08).
6. Footer email: Dave wants an address at `davidfleming.me` (forwarding alias; set up before launch).

7. Security, pre-existing (Dave: fix it now, 2026-11-08): the merge-desk allow rules and sandbox exclusions in `.claude/settings.local.json` match cwd-relative script paths that agents can edit or shadow, so an agent can run its own code outside the sandbox with no prompt (found 2026-11-07, verdict `app-writes/.team-verdicts/review-workflow-r2.md`). Decided 2026-11-07: the shared-engine RFC (PR #31) lands before the swarm; until then no unattended agent runs.

## Next

1. PR #67 (#66): reviewed, four agent checks green. Order: merge the bookkeeping PR from `pm/analytics-calibration` (adds unit `analytics` to `plan.json`), then re-run `scope-manifest` on #67 (any PR edit re-triggers it; it runs from main), then Dave approves and merges #67, confirms events in the Vercel Analytics dashboard (criterion 6) and closes #66. Optional nit: pin `@vercel/analytics` to `2.0.1`.
2. `seo-perf` (#17): calibrated to 0.1 / 0.2 / 0.3 days, but its scope grew (Lighthouse CI config, `Figure` sizing, CSP frame origins, sitemap routes; DECISIONS 2026-11-11) and the CSP now takes the analytics origins from PR #67. Dave confirms the estimate, then it fans out with `feed` (#18).
3. Launcher leftovers, issue #62 (old-form calls in `revert.sh`, usage comments in `agent-git.ts` and `post-check.ts`); `scripts/merge-desk/` is protected, so Dave pushes and bypass-merges.
4. Dave: confirm #7 criterion 5 and close #7; forwarding address at `davidfleming.me`; bio text. Milestone 1 still needs `content-work` (#13, Dave's).
5. Carried, not builds: PR screenshots for #52 to #56 only if wanted; Amendment sections on #9 and #11 bodies; architecture-audit B2 on `page-work` (filter-by-kind into `src/lib`), `linkTarget()` into `src/lib`, featured slug dropped silently, list dates without `<time>`; Speed Insights needs its own ticket if wanted (through the same wrapper); review-agent size rule edit in `vig/global/agents/review.md` is Dave's.
6. Session sandbox quirks (this chat): `git worktree add` and `pnpm install` need the sandbox off (the `.claude/settings*.json` write rule hits checkouts and a package in `node_modules`); `agent-git pr` needs it off too (cache `mkdtemp` under `~/Library/Caches`), and runs from the unit's worktree because it takes the current branch.

## Next chat

**Before you start:** merge the `pm/analytics-calibration` bookkeeping PR, re-run `scope-manifest` on #67, approve and merge #67, then check the Vercel Analytics dashboard for events.

**Run:** `/pm` in a new desktop chat in `~/Workspace/defaultdave`.

**Model and effort:** Sonnet, medium.

**Prompt:** Read `docs/plan/STATUS.md` and the tail of `DECISIONS.md`. Confirm PR #67 merged and #66 closed (criterion 6 is the owner's dashboard check); write its Actuals row in `delta-log.md` (rounds from the PR's check runs). Then bring Dave the `seo-perf` (#17) estimate to confirm (calibrated 0.1 / 0.2 / 0.3 days, scope grew per DECISIONS 2026-11-11, CSP origins from PR #67: script and events same origin, nothing new for production), and once he confirms, start `seo-perf` and `feed` (#18) under the standing call, each `senior` running lint, typecheck, test, build, format:check and knip from a clean `.next`. Don't commit.
