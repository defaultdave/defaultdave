# STATUS: davidfleming.me

Current state only. History is in `DECISIONS.md` and `delta-log.md`. Kept under 25 KB by `scripts/pm.sh check`.

Updated 2026-11-12 by pm (Opus 5.5): swarm 2 landed: `feed` (#69), `seo-perf` A (#70) and B (#72) merged, #62 merged (#71, bypass). #17 closed by accident (a PR body said it does not close #17) and needs reopening; piece C (Lighthouse CI) building on `unit/seo-perf-lighthouse`. New unit `cleanup` (DECISIONS 2026-11-12). GitHub repo: `defaultdave/defaultdave`, public; issues #1 to #21 are the plan tickets, #66 is a split from `seo-perf`. Project board: [#20](https://github.com/users/defaultdave/projects/20). Domain `davidfleming.me` live on Vercel project `defaultdave`.

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
| `analytics` | done | agent fan-out | 1 | #66 | #67 | | merged 2026-11-11 (40b81e1); #66 closed; Actuals row written; nit open: pin `@vercel/analytics` exactly (piece B pins Speed Insights) |
| `cleanup` | todo | agent fan-out | | (to file) | | Dave | scope addition 2026-11-12; issue draft in the PM scratchpad; starts when its issue exists and the bookkeeping PR adding the unit to `plan.json` merges |
| `content-work` | todo | human only | | #13 | | Dave | needs Blocked item 3 |
| `content-writing` | todo | human only | | #14 | | Dave | needs Blocked item 5 |
| `content-music` | todo | human only | | #15 | | Dave | needs Blocked item 2 |
| `content-home-about` | todo | human only | | #16 | | Dave | needs Blocked item 4 |
| `seo-perf` | in progress | agent fan-out | 1 | #17 | #70, #72 | PM | A merged 2026-11-12 (b45d3e2, OG images in Inter, architecture-audit advisory red); B merged (02e63b1, first-load JS 185.1 kB under the 190 kB budget); C Lighthouse CI building on `unit/seo-perf-lighthouse` (worktree `seo-perf-lighthouse`), Dave pushes (workflow file). #17 needs reopening. One Actuals row when C closes |
| `feed` | done | agent fan-out | 1 | #18 | #69 | | merged 2026-11-12 (7c1c85a); #18 closed; Actuals row written; criteria confirmed in a #18 comment; nit: re-run the W3C validator on the live feed after deploy |
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

1. Dave: reopen #17, file the `cleanup` issue, commit this bookkeeping; the PM pushes it and opens the PR as the App. Then piece C (Lighthouse CI) goes to Dave to push, and `cleanup` starts.
2. After A and B merge: piece C (`seo-perf-lighthouse`, `.github/workflows/lighthouse.yml` and `lighthouserc.*`) built locally; Dave pushes and merges it (workflow files are his).
3. `cleanup` unit covers the carried review follow-ups (DECISIONS 2026-11-12).
4. Dave: confirm #7 criterion 5 and close #7; forwarding address at `davidfleming.me`; bio text. Milestone 1 still needs `content-work` (#13, Dave's).
5. Carried, not builds: PR screenshots for #52 to #56 only if wanted; Amendment sections on #9 and #11 bodies; architecture-audit B2 on `page-work` (filter-by-kind into `src/lib`), `linkTarget()` into `src/lib`, featured slug dropped silently, list dates without `<time>`; review-agent size rule edit in `vig/global/agents/review.md` is Dave's.
6. Session sandbox quirks: `git worktree add`, `pnpm install` and `agent-git pr` need the sandbox off; `gh` cannot read its config in the sandbox (read public issues with `curl` to api.github.com); a command that names the launcher path anywhere but first word is denied by `command-guard`.

## Next chat

**Before you start:** if not done: reopen #17, file the `cleanup` issue, merge the bookkeeping PR; push piece C from the `seo-perf-lighthouse` worktree.

**Run:** `/pm` in a new desktop chat in `~/Workspace/defaultdave`.

**Model and effort:** Sonnet, medium.

**Prompt:** Read `docs/plan/STATUS.md`, the tail of `DECISIONS.md` and the Amendment comments on #17. Swarm 2 is merged except piece C (Lighthouse CI, `unit/seo-perf-lighthouse`, workflow file the owner pushes). When C merges, write one `seo-perf` Actuals row (rounds from PRs #70 and #72 check runs plus C) and close #17. Start `cleanup` under the standing call once its issue exists and `plan.json` on main has the unit: one `senior` in its own worktree, gates from a clean `.next`, PR as the App, review, verdicts posted. Don't commit.
