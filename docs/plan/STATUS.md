# STATUS: davidfleming.me

Current state only. History is in `DECISIONS.md` and `delta-log.md`. Kept under 25 KB by `scripts/pm.sh check`.

Updated 2026-11-06 by portfolio-pm (Opus 5.5), ADR 0001 review. GitHub repo: `defaultdave/defaultdave`, public; issues #1 to #21 are the tickets (no local copies; DECISIONS 2026-11-06), #1, #2 and #4 closed. Project board: [#20](https://github.com/users/defaultdave/projects/20), all 21 issues added; Route and Milestone fields not set up yet. Domain: `davidfleming.me` bought; Vercel project `defaultdave` live, domain not attached yet. Plan: 21 units; owner time 72 h, 2.4 weeks at 30 h/wk, accepted as a measurement.

MILESTONE: 1 Walkable (exit: Home, the Work list and the ResortPass case study live at davidfleming.me). 0 Designed reached 2026-11-06

## Units

State: todo, in progress, in review, done, cut, parked. Round counts review rounds posted. Owner is who holds the next move.

| Unit | State | Route | Round | Issue | PR | Owner | Note |
|---|---|---|---|---|---|---|---|
| `preflight` | done | human only | | #1 | | | closed 2026-11-06; music host Bandcamp |
| `design` | done | human only | | #2 | | | signed off 2026-11-06 on the artifact (v21); Figma dropped |
| `keystatic-spike` | todo | human only | | #3 | | Dave | session card proposed 2026-11-06 |
| `scaffold` | done | human-led | 2 | #4 | #22 | | merged 2026-11-06 (348b25e); production deploy green; Dave attaches `davidfleming.me` in Vercel; `minimatch` advisory ignored until 2027-01-06 (#23); Node 26 merged (#24) |
| `merge-desk` | todo | human-led | | #5 | | Dave + /senior | GitHub App, ruleset, merge-desk scripts ported from Ramble; ADR 0001 to accept first; merges by bypass |
| `shell` | todo | agent fan-out | | #6 | | | after scaffold and merge-desk; builds to the artifact, now carries Storybook |
| `cms` | todo | human-led | | #7 | | | after scaffold and the spike; now also creates the Keystatic GitHub App |
| `page-home` | todo | agent fan-out | | #8 | | | swarm, after shell + cms |
| `page-work` | todo | agent fan-out | | #9 | | | swarm |
| `page-writing` | todo | agent fan-out | | #10 | | | swarm |
| `page-music` | todo | agent fan-out | | #11 | | | swarm |
| `page-about` | todo | agent fan-out | | #12 | | | swarm |
| `content-work` | todo | human only | | #13 | | Dave | needs decision 4 |
| `content-writing` | todo | human only | | #14 | | Dave | needs decision 6 |
| `content-music` | todo | human only | | #15 | | Dave | needs decision 3 |
| `content-home-about` | todo | human only | | #16 | | Dave | needs decision 5 |
| `seo-perf` | todo | agent fan-out | | #17 | | | after the five pages |
| `feed` | todo | agent fan-out | | #18 | | | first to cut if the appetite bites |
| `qa-pass` | todo | human-led | | #19 | | | |
| `launch` | todo | human-led | | #20 | | | |
| `tail` | todo | human-led | | #21 | | | |

## Blocked on Dave

1. Attach `davidfleming.me` in the Vercel project's Domains.
2. Accept or amend `docs/adr/0001-agent-workflow-and-merge-rule.md` (unblocks `merge-desk`). PM review 2026-11-06 found eight amendments: branch names (`senior/` vs `unit/`), bookkeeping PRs vs the agent checks, bypass mode `always`, PM memory and calibration paths protected, App key `.pem` unreadable in the sandbox, security scans not required, which tool posts which check, a shared-App check spoofing gap.
3. Decide: which Bandcamp releases, and any release notes (unblocks `content-music`).
4. Decide: can ResortPass be named, or anonymized as in the CrUX article (unblocks publishing `content-work`).
5. Headshot and bio, or text-only About (unblocks `content-home-about`).
6. List of published pieces with URLs (unblocks `content-writing`).

## Next

Dave attaches the domain (item 1), then accepts or amends ADR 0001 (item 2) so `merge-desk` (#5) can start as a `senior` subagent from the PM chat. `keystatic-spike` (#3) can run beside it.

## Next chat

**Before you start:** commit the bookkeeping; decide on the eight ADR 0001 amendments (Blocked item 2).

**Run:** `/portfolio-pm` in `~/Workspace/defaultdave` (terminal: `claude --agent portfolio-pm`).

**Model and effort:** Sonnet, medium.

**Prompt:** Apply the ADR 0001 amendments Dave accepted (`docs/adr/0001-agent-workflow-and-merge-rule.md`), set its Status to Accepted with the date, log it in `DECISIONS.md`, and add a dated Amendment section to issue #5 for any criterion the amendments change (branch pattern, bypass mode, bookkeeping paths, sandbox, required security checks). Then start `merge-desk` (#5) as a background `senior` subagent per the orchestrator rule. Don't commit.

**Swarm (standing call, DECISIONS 2026-11-06: start it the moment the gates hold, no ask):** the five `page-*` units go out as one `senior` subagent each, in their own worktrees, only after `scaffold`, `merge-desk` and `cms` are merged, the design is signed off, the ruleset requires the CI and agent checks, and the merge-desk dry run has passed. Each pushes and opens its PR through `scripts/merge-desk/agent-git.ts` as the App; reviewers post verdicts with `post-check.ts`.
