# STATUS: davidfleming.me

Current state only. History is in `DECISIONS.md` and `delta-log.md`. Kept under 25 KB by `scripts/pm.sh check`.

Updated 2026-11-06 by portfolio-pm (Opus 5.5). GitHub repo: `defaultdave/defaultdave`, public; issues #1 to #21 open, one per ticket. Project board: [#20](https://github.com/users/defaultdave/projects/20), all 21 issues added; Route and Milestone fields not set up yet. Domain: not bought. Plan: 21 units; owner time 72 h, 2.4 weeks at 30 h/wk, accepted as a measurement.

MILESTONE: 0 Designed (exit: one token source of truth signed off from the Figma file and the Claude Design artifact)

## Units

State: todo, in progress, in review, done, cut, parked. Round counts review rounds posted. Owner is who holds the next move.

| Unit | State | Route | Round | Issue | PR | Owner | Note |
|---|---|---|---|---|---|---|---|
| `preflight` | in progress | human only | | #1 | | Dave | dry run done and split 2026-11-06; repo settings, App and Hobby caps done 2026-11-06; left: buy domain, `app.conf` to mode 600, music host |
| `design` | todo | human only | | #2 | | Dave | session card proposed 2026-11-06: Figma file + Claude Design artifact, compared |
| `keystatic-spike` | todo | human only | | #3 | | Dave | session card proposed 2026-11-06 |
| `scaffold` | todo | human-led | | #4 | | | after preflight; carries the CI and security workflows |
| `merge-desk` | todo | human-led | | #5 | | Dave + /senior | GitHub App, ruleset, merge-desk scripts ported from Ramble; ADR 0001 to accept first; merges by bypass |
| `shell` | todo | agent fan-out | | #6 | | | after scaffold, merge-desk and design sign-off |
| `cms` | todo | human-led | | #7 | | | after scaffold and the spike; now also creates the Keystatic GitHub App |
| `page-home` | todo | agent fan-out | | #8 | | | swarm, after shell + cms |
| `page-work` | todo | agent fan-out | | #9 | | | swarm |
| `page-writing` | todo | agent fan-out | | #10 | | | swarm |
| `page-music` | todo | agent fan-out | | #11 | | | swarm |
| `page-about` | todo | agent fan-out | | #12 | | | swarm |
| `content-work` | todo | human only | | #13 | | Dave | needs decision 4 |
| `content-writing` | todo | human only | | #14 | | Dave | needs decision 3 |
| `content-music` | todo | human only | | #15 | | Dave | needs decision 1 |
| `content-home-about` | todo | human only | | #16 | | Dave | needs decision 2 |
| `seo-perf` | todo | agent fan-out | | #17 | | | after the five pages |
| `feed` | todo | agent fan-out | | #18 | | | first to cut if the appetite bites |
| `qa-pass` | todo | human-led | | #19 | | | |
| `launch` | todo | human-led | | #20 | | | |
| `tail` | todo | human-led | | #21 | | | |

## Blocked on Dave

1. Finish `preflight` (#1): buy `davidfleming.me`, `chmod 600` the `app.conf`, name the music host (item 3) (unblocks `scaffold`).
2. Accept or amend `docs/adr/0001-agent-workflow-and-merge-rule.md`: one tier, approval window on, four agent checks (unblocks `merge-desk`).
3. Decide: which music host and release list (unblocks `content-music`).
4. Decide: can ResortPass be named, or anonymized as in the CrUX article (unblocks publishing `content-work`).
5. Headshot and bio, or text-only About (unblocks `content-home-about`).
6. List of published pieces with URLs (unblocks `content-writing`).

## Next

Dave buys the domain and names the music host; then close #1 and start `design`. Log outside time with `scripts/track.sh start preflight` / `design`.

## Next chat

**Before you start:** commit and push the bookkeeping.

**Run:** `/portfolio-pm` in a new chat in `~/Workspace/defaultdave` (terminal: `claude --agent portfolio-pm`).

**Model and effort:** Sonnet, medium. The planning chat ran on Fable; the PM does not need it. Switch to Opus only for a design call or a re-estimate.

**Prompt:** Read `docs/plan/STATUS.md`, `docs/plan/plan-report.md` (Critical path and Execution model), and `docs/plan/tickets/01-preflight.md` to `03-keystatic-spike.md`. Give the start report. Issues #1 to #21 and project #20 exist; the preflight dry run is done and split (DECISIONS 2026-11-06). Check the domain is on the Vercel account and `app.conf` is mode 600, record the music host, tick what Dave finished, close #1 when its criteria hold, then start `design`. Don't commit; print the command.

**Swarm later:** the five `page-*` units go out as one `/senior docs/plan/tickets/<nn>-<id>.md` session each, in their own worktrees, only after `scaffold`, `merge-desk` and `cms` are merged, the design is signed off, the ruleset requires the CI and agent checks, the merge-desk dry run has passed, and `preflight` is closed. Each session pushes and opens its PR through `scripts/merge-desk/agent-git.ts` as the App; reviewers post verdicts with `post-check.ts`.
