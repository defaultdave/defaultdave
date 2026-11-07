# STATUS: davidfleming.me

Current state only. History is in `DECISIONS.md` and `delta-log.md`. Kept under 25 KB by `scripts/pm.sh check`.

Updated 2026-11-06 by portfolio-pm (Opus 5.5). GitHub repo: `defaultdave/defaultdave`, public; issues #1 to #21 are the tickets (no local copies; DECISIONS 2026-11-06), #1 and #2 closed. Project board: [#20](https://github.com/users/defaultdave/projects/20), all 21 issues added; Route and Milestone fields not set up yet. Domain: `davidfleming.me` bought, attached at `scaffold`. Plan: 21 units; owner time 72 h, 2.4 weeks at 30 h/wk, accepted as a measurement.

MILESTONE: 1 Walkable (exit: Home, the Work list and the ResortPass case study live at davidfleming.me). 0 Designed reached 2026-11-06

## Units

State: todo, in progress, in review, done, cut, parked. Round counts review rounds posted. Owner is who holds the next move.

| Unit | State | Route | Round | Issue | PR | Owner | Note |
|---|---|---|---|---|---|---|---|
| `preflight` | done | human only | | #1 | | | closed 2026-11-06; music host Bandcamp |
| `design` | done | human only | | #2 | | | signed off 2026-11-06 on the artifact (v21); Figma dropped |
| `keystatic-spike` | todo | human only | | #3 | | Dave | session card proposed 2026-11-06 |
| `scaffold` | todo | human-led | | #4 | | Dave + /senior | next; attaches `davidfleming.me`; carries the CI and security workflows |
| `merge-desk` | todo | human-led | | #5 | | Dave + /senior | GitHub App, ruleset, merge-desk scripts ported from Ramble; ADR 0001 to accept first; merges by bypass |
| `shell` | todo | agent fan-out | | #6 | | | after scaffold and merge-desk; builds to the artifact, now carries Storybook |
| `cms` | todo | human-led | | #7 | | | after scaffold and the spike; now also creates the Keystatic GitHub App |
| `page-home` | todo | agent fan-out | | #8 | | | swarm, after shell + cms |
| `page-work` | todo | agent fan-out | | #9 | | | swarm |
| `page-writing` | todo | agent fan-out | | #10 | | | swarm |
| `page-music` | todo | agent fan-out | | #11 | | | swarm |
| `page-about` | todo | agent fan-out | | #12 | | | swarm |
| `content-work` | todo | human only | | #13 | | Dave | needs decision 3 |
| `content-writing` | todo | human only | | #14 | | Dave | needs decision 5 |
| `content-music` | todo | human only | | #15 | | Dave | needs decision 2 |
| `content-home-about` | todo | human only | | #16 | | Dave | needs decision 4 |
| `seo-perf` | todo | agent fan-out | | #17 | | | after the five pages |
| `feed` | todo | agent fan-out | | #18 | | | first to cut if the appetite bites |
| `qa-pass` | todo | human-led | | #19 | | | |
| `launch` | todo | human-led | | #20 | | | |
| `tail` | todo | human-led | | #21 | | | |

## Blocked on Dave

1. Accept or amend `docs/adr/0001-agent-workflow-and-merge-rule.md`: one tier, approval window on, four agent checks (unblocks `merge-desk`).
2. Decide: which Bandcamp releases, and any release notes (unblocks `content-music`).
3. Decide: can ResortPass be named, or anonymized as in the CrUX article (unblocks publishing `content-work`).
4. Headshot and bio, or text-only About (unblocks `content-home-about`).
5. List of published pieces with URLs (unblocks `content-writing`).

## Next

Start `scaffold` (#4) with `/senior #4`: Dave decides, the session types; it attaches `davidfleming.me` to the new Vercel project. `keystatic-spike` (#3) can run beside it.

## Next chat

**Before you start:** commit and push the bookkeeping.

**Run:** `/senior #4` in a new chat in `~/Workspace/defaultdave` for `scaffold`; `/portfolio-pm` in another for bookkeeping (terminal: `claude --agent portfolio-pm`).

**Model and effort:** Sonnet, medium, for both.

**Prompt:** Implement issue #4 (`scaffold`) on `defaultdave/defaultdave`: the issue body is the ticket and its scope manifest. Build to `.claude/standards/stack-decisions.md`. Attach `davidfleming.me` to the Vercel project as the ticket says; Dave clicks anything in the Vercel or GitHub console. Tick criteria in the issue body as they hold. Stop before push and print the push and PR commands.

**Swarm (standing call, DECISIONS 2026-11-06: start it the moment the gates hold, no ask):** the five `page-*` units go out as one `/senior #<n>` session each, in their own worktrees, only after `scaffold`, `merge-desk` and `cms` are merged, the design is signed off, the ruleset requires the CI and agent checks, and the merge-desk dry run has passed. Each session pushes and opens its PR through `scripts/merge-desk/agent-git.ts` as the App; reviewers post verdicts with `post-check.ts`.
