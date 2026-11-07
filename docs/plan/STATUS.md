# STATUS: davidfleming.me

Current state only. History is in `DECISIONS.md` and `delta-log.md`. Kept under 25 KB by `scripts/pm.sh check`.

Updated 2026-11-07 by portfolio-pm (Opus 5.5), merge-desk dry run passed, `shell` round 1 in review (#29). GitHub repo: `defaultdave/defaultdave`, public; issues #1 to #21 are the tickets (no local copies; DECISIONS 2026-11-06), #1, #2 and #4 closed. Project board: [#20](https://github.com/users/defaultdave/projects/20), all 21 issues added; Route and Milestone fields not set up yet. Domain: `davidfleming.me` bought; Vercel project `defaultdave` live, domain not attached yet. Plan: 21 units; owner time 72 h, 2.4 weeks at 30 h/wk, accepted as a measurement.

MILESTONE: 1 Walkable (exit: Home, the Work list and the ResortPass case study live at davidfleming.me). 0 Designed reached 2026-11-06

## Units

State: todo, in progress, in review, done, cut, parked. Round counts review rounds posted. Owner is who holds the next move.

| Unit | State | Route | Round | Issue | PR | Owner | Note |
|---|---|---|---|---|---|---|---|
| `preflight` | done | human only | | #1 | | | closed 2026-11-06; music host Bandcamp |
| `design` | done | human only | | #2 | | | signed off 2026-11-06 on the artifact (v21); Figma dropped |
| `keystatic-spike` | todo | human only | | #3 | | Dave | session card proposed 2026-11-06 |
| `scaffold` | done | human-led | 2 | #4 | #22 | | merged 2026-11-06 (348b25e); production deploy green; Dave attaches `davidfleming.me` in Vercel; `minimatch` advisory ignored until 2027-01-06 (#23); Node 26 merged (#24) |
| `merge-desk` | in progress | human-led | | #5 | #25 | PM | dry run passed (DECISIONS 2026-11-06; PRs #26 merged, #27 blocked, #28 revert opened, #27 and #28 closed unmerged 2026-11-07); #5 criteria all ticked except Ramble tokens (not this unit's); close #5 after the Actuals row |
| `shell` | in review | agent fan-out | 2 | #6 | #29 | Dave | round 1 (tokens, type scale, noindex `/tokens` sample page; #6 amended 2026-11-07) on `unit/shell-tokens`; review 1 at 2e91bde failed spec-compliance and a11y-audit (DECISIONS 2026-11-07), review 2 at a4ee027 all four agent checks and CI green; auto-merge queued (squash); waits on Dave's re-approval; primitives are round 2 |
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

## Next

Dave re-approves PR #29 at a4ee027 (check `/tokens` dark borders on the new preview); auto-merge then lands it. Dave attaches the domain (item 1) meanwhile. `keystatic-spike` (#3) can run beside it.

## Next chat

**Before you start:** commit and push the bookkeeping to `main`; PR #29 merged.

**Run:** `/portfolio-pm` in `~/Workspace/defaultdave` (terminal: `claude --agent portfolio-pm`).

**Model and effort:** Sonnet, medium.

**Prompt:** Close `merge-desk`: write its Actuals row in `docs/plan/delta-log.md` (rounds from PR #25's check runs; owner minutes from transcript timestamps plus `scripts/track.sh sum merge-desk`), close #5, and move its board card to Done. Then start `shell` (#6) round 2 as a background `senior` in `.claude/worktrees/shell` on a fresh `unit/shell-primitives` branch from `main`: landmarks and skip link, nav `aria-current`, the contrast unit test, primitives Stack, Prose, Card, Tag and LinkButton with tests, Storybook, default metadata, and a `:focus-visible` rule; carry the round 1 advisories (rem type sizes, a dark value or a pops-only note for `--color-ink`). Check the diff against #6's `in_scope_globs`, run the gates, open the PR through merge-desk. Don't commit bookkeeping.

**Swarm (standing call, DECISIONS 2026-11-06: start it the moment the gates hold, no ask):** the five `page-*` units go out as one `senior` subagent each, in their own worktrees, only after `scaffold`, `merge-desk` and `cms` are merged, the design is signed off, the ruleset requires the CI and agent checks, and the merge-desk dry run has passed. Each pushes and opens its PR through `scripts/merge-desk/agent-git.ts` as the App; reviewers post verdicts with `post-check.ts`.
