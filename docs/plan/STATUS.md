# STATUS: davidfleming.me

Current state only. History is in `DECISIONS.md` and `delta-log.md`. Kept under 25 KB by `scripts/pm.sh check`.

Updated 2026-11-06 by the planning session (Claude Code, Fable 5.1). GitHub repo: not created. Project board: not created. Domain: not bought.

MILESTONE: 0 Designed (exit: one token source of truth signed off from the Figma file and the Claude Design artifact)

## Units

State: todo, in progress, in review, done, cut, parked. Round counts review rounds posted. Owner is who holds the next move.

| Unit | State | Route | Round | Issue | PR | Owner | Note |
|---|---|---|---|---|---|---|---|
| `preflight` | todo | human only | | | | Dave | walk `preflight.md` after the dry run; buy davidfleming.me; create the Keystatic GitHub App |
| `design` | todo | human only | | | | Dave | session card proposed 2026-11-06: Figma file + Claude Design artifact, compared |
| `keystatic-spike` | todo | human only | | | | Dave | session card proposed 2026-11-06 |
| `scaffold` | todo | human-led | | | | | after preflight |
| `shell` | todo | agent fan-out | | | | | after scaffold and design sign-off |
| `cms` | todo | human-led | | | | | after scaffold and the spike |
| `page-home` | todo | agent fan-out | | | | | swarm, after shell + cms |
| `page-work` | todo | agent fan-out | | | | | swarm |
| `page-writing` | todo | agent fan-out | | | | | swarm |
| `page-music` | todo | agent fan-out | | | | | swarm |
| `page-about` | todo | agent fan-out | | | | | swarm |
| `content-work` | todo | human only | | | | Dave | needs decision 4 |
| `content-writing` | todo | human only | | | | Dave | needs decision 3 |
| `content-music` | todo | human only | | | | Dave | needs decision 1 |
| `content-home-about` | todo | human only | | | | Dave | needs decision 2 |
| `seo-perf` | todo | agent fan-out | | | | | after the five pages |
| `feed` | todo | agent fan-out | | | | | first to cut if the appetite bites |
| `qa-pass` | todo | human-led | | | | | |
| `launch` | todo | human-led | | | | | |
| `tail` | todo | human-led | | | | | |

## Blocked on Dave

1. Commit the plan, create the GitHub repo and push (unblocks issues and the board).
2. Create the GitHub Project and give the PM its number (unblocks `scripts/pm.sh board`).
3. Walk `docs/plan/preflight.md`: Vercel project, domain, GitHub App, branch protection (unblocks every build unit).
4. Decide: which music host and release list (unblocks `content-music`).
5. Decide: can ResortPass be named, or anonymized as in the CrUX article (unblocks publishing `content-work`).
6. Headshot and bio, or text-only About (unblocks `content-home-about`).
7. List of published pieces with URLs (unblocks `content-writing`).

## Next

Start the `design` unit (the session card, or `/portfolio-pm start design`) and walk `preflight.md` alongside it. Log outside time with `scripts/track.sh start design`.

## Next chat

**Before you start:** commit the plan (command below); create the repo and push; optionally create the GitHub Project.

**Run:** `/portfolio-pm` in a new chat in `~/Workspace/defaultdave` (terminal: `claude --agent portfolio-pm`).

**Model and effort:** Sonnet, medium. The planning chat ran on Fable; the PM does not need it. Switch to Opus only for a design call or a re-estimate.

**Prompt:** Read `docs/plan/STATUS.md`, `docs/plan/plan-report.md` (Critical path and Execution model), and `docs/plan/tickets/01-preflight.md` to `03-keystatic-spike.md`. Give the start report. Then: if the repo and project exist, run `scripts/pm.sh issues` and create the issues, record their numbers in the Units table, and print the `scripts/pm.sh board` lines; otherwise print the repo and project commands. Then dry-run `preflight.md` with Dave row by row. Don't commit; print the command.

**Swarm later:** the five `page-*` units go out as one `/senior docs/plan/tickets/<nn>-<id>.md` session each, in their own worktrees, only after `scaffold` and `cms` are merged, the design is signed off, CI runs the four gates, and `preflight.md` is fully ticked.
