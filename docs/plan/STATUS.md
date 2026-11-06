# STATUS: davidfleming.me

Current state only. History is in `DECISIONS.md` and `delta-log.md`. Kept under 25 KB by `scripts/pm.sh check`.

Updated 2026-11-06 by portfolio-pm (Opus 5.5). GitHub repo: `defaultdave/defaultdave`, public; issues #1 to #21 open, one per ticket. Project board: [#20](https://github.com/users/defaultdave/projects/20), all 21 issues added; Route and Milestone fields not set up yet. Domain: not bought. Plan: 21 units; owner time 72 h, 2.4 weeks at 30 h/wk, accepted as a measurement.

MILESTONE: 0 Designed (exit: one token source of truth signed off from the Figma file and the Claude Design artifact)

## Units

State: todo, in progress, in review, done, cut, parked. Round counts review rounds posted. Owner is who holds the next move.

| Unit | State | Route | Round | Issue | PR | Owner | Note |
|---|---|---|---|---|---|---|---|
| `preflight` | done | human only | | #1 | | | closed 2026-11-06; music host Bandcamp |
| `design` | in progress | human only | | #2 | | Dave | session card proposed 2026-11-06: Figma file + Claude Design artifact, compared |
| `keystatic-spike` | todo | human only | | #3 | | Dave | session card proposed 2026-11-06 |
| `scaffold` | todo | human-led | | #4 | | | unblocked; attaches `davidfleming.me`; carries the CI and security workflows |
| `merge-desk` | todo | human-led | | #5 | | Dave + /senior | GitHub App, ruleset, merge-desk scripts ported from Ramble; ADR 0001 to accept first; merges by bypass |
| `shell` | todo | agent fan-out | | #6 | | | after scaffold, merge-desk and design sign-off |
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

Start `design` (#2): Dave runs the design session (Figma file plus Claude Design artifact, compared) and logs outside time with `scripts/track.sh start design`. `keystatic-spike` and `scaffold` can run beside it.

## Next chat

**Before you start:** commit and push the bookkeeping.

**Run:** `/portfolio-pm` in a new chat in `~/Workspace/defaultdave` (terminal: `claude --agent portfolio-pm`), then hand `design` to its own session.

**Model and effort:** Sonnet, medium for the PM. The `design` session runs on Opus, medium: it is a design call.

**Prompt:** Read `docs/plan/STATUS.md`, `docs/plan/tickets/02-design.md` and `docs/designs/2026-11-06-portfolio-site.md`. Give the start report. `preflight` closed 2026-11-06 (#1); `design` (#2) is in progress. Start the `design` session from ticket 02: a Figma file `davidfleming.me` (Foundations, Components, Layouts) through the Figma MCP and a Claude Design artifact of the same tokens with switchable options, then the comparison note in `docs/designs/`. Done is Dave's sign-off with the file link recorded under seam 4. Don't commit; print the command.

**Swarm later:** the five `page-*` units go out as one `/senior docs/plan/tickets/<nn>-<id>.md` session each, in their own worktrees, only after `scaffold`, `merge-desk` and `cms` are merged, the design is signed off, the ruleset requires the CI and agent checks, and the merge-desk dry run has passed. Each session pushes and opens its PR through `scripts/merge-desk/agent-git.ts` as the App; reviewers post verdicts with `post-check.ts`.
