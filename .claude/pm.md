---
project: defaultdave
mode: project
---

# PM card: defaultdave (davidfleming.me)

The project layer under the global `pm` agent (`~/.claude/agents/pm.md`). The agent is the job; this card is the project. Replaces the `portfolio-pm` agent and skill as of 2026-11-07.

## What this is
Dave's portfolio site. Next.js App Router on Vercel, Keystatic CMS, MDX content, fully static. In build: milestone 1 (Walkable) in progress.

## Where things live
- Plan (frozen 2026-11-06): `docs/plan/`; `brief.md`, `plan.json`, `plan-report.md`, `preflight.md`, `proposal.md`
- Status: `docs/plan/STATUS.md`, read whole; cap 25 KB; check: `scripts/pm.sh check`
- Decisions: `docs/plan/DECISIONS.md`; skim `tail -40` at start
- Delta log: `docs/plan/delta-log.md` (Actuals row when a unit closes, Re-estimates row at each milestone)
- Time log: `docs/plan/time-log.csv`; tracker: `scripts/track.sh start|stop|sum <unit>` for Dave's work outside Claude
- Design doc: `docs/designs/2026-11-06-portfolio-site.md`
- Standards: `.claude/standards/stack-decisions.md`, `~/.claude/standards/react-nextjs.md`
- Tickets: GitHub issues #1 to #21 on `defaultdave/defaultdave` (public), one per plan unit, each with a scope manifest; numbers in the Units table of `STATUS.md`. The issue is the only copy (no local ticket files since 2026-11-06). A PR closes its issue with `Closes #n`.
- Board: GitHub Project [#20](https://github.com/users/defaultdave/projects/20); fields Status (Todo, In progress, In review, Done), Route, Milestone; move items with `gh project item-edit`. `scripts/pm.sh board <project-number>` prints the item-add lines.
- Setup reference: `~/.claude/skills/plan-project/references/project-setup.md`

## Report top line
`MILESTONE: <0 Designed | 1 Walkable | 2 Content complete | 3 Launched | 4 Tail closed> (exit: ...)`. IN FLIGHT rows are unit, route, round, owner.

## Status file shape
Milestone line, Units table (id, state, route, round, issue, PR, owner), Blocked on Dave, Next, Next chat. Current state only.

## Done means
Acceptance criteria checked against the diff or artifact in the issue, not the agent's report. Files touched compared against the issue's `in_scope_globs` before review. Rounds from `.team-verdicts/` or the PR's check runs, fails included; outside minutes from `scripts/track.sh sum <unit>`; inside minutes from transcript timestamps. Calibrate once after the third agent-built unit merges: medians into `plan.json` assumptions, `calibrated` set, `node ~/.claude/skills/plan-project/bin/plan.mjs docs/plan/plan.json > docs/plan/plan-report.md`, a Re-estimate row; again at each milestone.

## Sequencing
Routes come from `plan-report.md`.

| Route | Units | How it runs |
|---|---|---|
| human only | preflight, design, keystatic-spike, content-* | Dave, with the PM or a session helping; `scripts/track.sh start <unit>` for his outside time |
| human-led | scaffold, merge-desk, cms, qa-pass, launch, tail | Dave in a `/senior <ticket>` session; he decides, it types |
| agent fan-out | shell, page-home, page-work, page-writing, page-music, page-about, seo-perf, feed | one `senior` per issue in its own worktree, started when its dependencies have a merged PR; review with `/review-pr <pr-url>` or `/review-swarm`, verdicts to `.team-verdicts/` and posted as checks |

Run order: preflight, design, keystatic-spike in parallel; scaffold; merge-desk (Dave accepts `docs/adr/0001-agent-workflow-and-merge-rule.md` first); cms and shell in parallel; the five pages as a swarm once shell and cms are merged and the design is signed off; content units whenever Dave has the hours; seo-perf and feed; qa-pass; launch; tail. Milestone 1 needs preflight, design, keystatic-spike, scaffold, shell, cms, page-home, page-work and content-work.

Gates before any agent unit (the plan skill's launch check): CI runs build, lint, typecheck and test (`scaffold`); the `main` ruleset requires them plus the agent checks and the merge-desk dry run has passed (`merge-desk`); `preflight.md` fully ticked; the ticket has acceptance criteria, scope globs and no open question.

**Standing call (Dave, 2026-11-06):** start fan-out work the moment its gates hold, without asking. Check the gates at every session start and after every merge; when they hold, start one `senior` per ready issue in its own worktree and tell Dave which started. Pushes, merges and approvals stay his.

## How implementation runs
**One orchestrator chat (Dave, 2026-11-06):** the PM chat is the hub. `/senior` work runs as background `senior` subagents from here, following the `/senior` skill's steps (worktree at `.claude/worktrees/<slug>` on branch `unit/<unit-id>-<slug>`, ADR 0001 rule 3; scope manifest; the agent; quality gates run here), not as separate sessions. Check each result against its issue and report in the chat. From the `merge-desk` unit on, agents push, open PRs, post checks (`scripts/merge-desk/post-check.ts`) and queue auto-merge only through `scripts/merge-desk/agent-git.ts` as the `defaultdave-agents` App, never with Dave's login (ADR 0001). Visual PRs carry before and after images via the `pr-images` skill.

## Tooling
- `scripts/pm.sh check` before every hand-off
- `scripts/pm.sh board <n>`: item-add lines for the board
- `scripts/track.sh start|stop|sum <unit>`
- `node ~/.claude/skills/plan-project/bin/plan.mjs docs/plan/plan.json > docs/plan/plan-report.md` after any `plan.json` change

## GitHub
`gh issue create|close|comment`, `gh pr create|merge|comment|edit` and `git push` prompt every time by Dave's permissions. Run bookkeeping ones (issues, project items) and let the prompt be the approval. For anything a human should decide (merge, push, settings, domain, deploy), print the exact command. Until `merge-desk` landed, issue edits ran under Dave's login; after it, as the App.

## Hard lines (in addition to the agent's)
- Never change GitHub or Vercel settings, attach the domain, or deploy. Print the command.
- Frozen plan files (`brief.md`, `proposal.md`) and issue acceptance criteria are read-only after 2026-11-06, except through a dated Re-estimate in `delta-log.md`, a matching `plan.json` change, and an Amendment section in the issue.
- Secrets: GitHub App and Vercel values go from the console into the env store and `.env` by Dave's hand.
- ResortPass material stays anonymized and NDA-safe unless `DECISIONS.md` records Dave's call to name it, and its origin story is told accurately (a dev-team stress test, not a response to client feedback). Nothing from the Multi Media LLC loop, ever.
- Published copy (site, README, PR text): no em dashes, no "not just X, it's Y", no hedging.

## Settled decisions
`docs/plan/DECISIONS.md`. Often needed: plan frozen 2026-11-06; issues are the only ticket copy; fan-out starts without asking once gates hold; one orchestrator chat; agents act as the App from `merge-desk` on.

## Lanes
none (one PM chat at a time; the orchestrator chat is the hub)

## Memory
- Public: `.claude/agent-memory/pm/` (committed; the repo is public, so write for a stranger)
- Private: `.claude/agent-memory-local/pm/` (gitignored)
