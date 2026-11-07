# STATUS: davidfleming.me

Current state only. History is in `DECISIONS.md` and `delta-log.md`. Kept under 25 KB by `scripts/pm.sh check`.

Updated 2026-11-07 by portfolio-pm (Sonnet 5.5), `merge-desk` closed, `shell` round 2 started. GitHub repo: `defaultdave/defaultdave`, public; issues #1 to #21 are the tickets (no local copies; DECISIONS 2026-11-06), #1, #2, #4 and #5 closed. Project board: [#20](https://github.com/users/defaultdave/projects/20), all 21 issues added; Route and Milestone fields not set up yet. Domain: `davidfleming.me` bought; Vercel project `defaultdave` live, domain not attached yet. Plan: 21 units; owner time 72 h, 2.4 weeks at 30 h/wk, accepted as a measurement.

MILESTONE: 1 Walkable (exit: Home, the Work list and the ResortPass case study live at davidfleming.me). 0 Designed reached 2026-11-06

## Units

State: todo, in progress, in review, done, cut, parked. Round counts review rounds posted. Owner is who holds the next move.

| Unit | State | Route | Round | Issue | PR | Owner | Note |
|---|---|---|---|---|---|---|---|
| `preflight` | done | human only | | #1 | | | closed 2026-11-06; music host Bandcamp |
| `design` | done | human only | | #2 | | | signed off 2026-11-06 on the artifact (v21); Figma dropped |
| `keystatic-spike` | todo | human only | | #3 | | Dave | session card proposed 2026-11-06 |
| `scaffold` | done | human-led | 2 | #4 | #22 | | merged 2026-11-06 (348b25e); production deploy green; Dave attaches `davidfleming.me` in Vercel; `minimatch` advisory ignored until 2027-01-06 (#23); Node 26 merged (#24) |
| `merge-desk` | done | human-led | 1 | #5 | #25 | | closed 2026-11-07; Actuals row written; dry run passed (DECISIONS 2026-11-06) |
| `shell` | in review | agent fan-out | 2 | #6 | #30 | Dave | round 1 (tokens, type scale, noindex `/tokens` sample page; #6 amended 2026-11-07) merged 2026-11-07 (64d9a4b) after review 1 at 2e91bde failed spec-compliance and a11y-audit (DECISIONS 2026-11-07) and review 2 at a4ee027 passed; round 2 (layout, primitives, Storybook, contrast test; `SiteNav` approved) PR #30 (`unit/shell-primitives`, head cc69a61). `/review-pr` re-run on cc69a61: review APPROVE_WITH_NITS, qa PASS, spec-compliance APPROVE, a11y-audit APPROVE, perf-check APPROVE, architecture-audit REQUEST_CHANGES (advisory, Wordmark colour index in the component body). All six posted as the App; your review requested; auto-merge queued; CI green. Waiting on Dave's approval |
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
7. PR #30 body has no images. Standing rule (2026-11-07): visual PRs carry images, with before and after for changes to existing pages. Afters exist in the worktree's `.team-verdicts/screenshots/`; the befores need capturing from `main`.

## Next

Round 3 is committed locally on `unit/shell-primitives` (13ac9c6, not pushed): parse-tokens throws on a missing block, Storybook outline derived from the token map. Gates pass here (lint, typecheck, 237 tests, build, build-storybook). Dave pushes it, runs `/review-pr` on PR #30 (the verdicts on cc69a61 are stale), and the PM posts the six verdicts on the new head. Then Dave approves. PR images deferred by Dave (rule stands, DECISIONS 2026-11-07).

## Next chat

**Before you start:** commit the bookkeeping to `main` and push (or let the PM print the PR route).

**Run:** `/portfolio-pm` in `~/Workspace/defaultdave` (terminal: `claude --agent portfolio-pm`).

**Model and effort:** Sonnet, medium.

**Prompt:** PR #30 (`shell` round 3, head 13ac9c6 once pushed, supersedes cc69a61) was reviewed, its verdicts posted and auto-merge queued; if not, post them first (`post-check.ts`, KEY=VALUE line first); check `gh pr view 30` for merged state. If merged: write `shell`'s Actuals row in `docs/plan/delta-log.md` (rounds: round 1 two reviews on PR #29, round 2 two `/review-pr` runs on PR #30 plus one CI fix; owner minutes from transcript timestamps plus `scripts/track.sh sum shell`), close #6, move its board card to Done, remove the stale worktrees `.claude/worktrees/shell` and `.claude/worktrees/shell-primitives` with Dave's go, and check the swarm gates (`cms` must be merged; the `keystatic-spike` (#3) and `cms` (#7) come first). Carry as suggestions, not builds: README and CLAUDE.md do not mention the Storybook scripts; Wordmark colour index and `LinkButton` `isInternalHref` belong in tested functions, and Wordmark hex colours could be tokens; `parse-tokens.ts` should throw on a missing block; `.storybook/preview.tsx` hardcodes `--effect-outline`; footer links want `min-block-size: 24px`; remove the `glob` override when Storybook moves to the 0.9 docgen plugin; check whether the `GHSA-g3hv-75wg-m249` ignore in `osv-scanner.toml` is now unused; footer email unconfirmed; a `post-check.ts` verdict needs a `KEY=VALUE` line that the review agents' files omit, so prepend it or fix the agents. Don't commit bookkeeping.

**Swarm (standing call, DECISIONS 2026-11-06: start it the moment the gates hold, no ask):** the five `page-*` units go out as one `senior` subagent each, in their own worktrees, only after `scaffold`, `merge-desk` and `cms` are merged, the design is signed off, the ruleset requires the CI and agent checks, and the merge-desk dry run has passed. Each pushes and opens its PR through `scripts/merge-desk/agent-git.ts` as the App; reviewers post verdicts with `post-check.ts`.
