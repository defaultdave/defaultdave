# ADR 0001: Agent workflow and merge rule

- **Status:** Proposed 2026-11-06 by the planning session; Dave accepts or amends before the `merge-desk` unit creates the ruleset.
- **Depends on:** `docs/plan/plan-report.md` (routes), `.claude/standards/stack-decisions.md`
- **Model:** Ramble ADR 0010 and its merge-desk runbook, with the second tier removed.

## Context

The plan routes eight units to agent fan-out and the rest to Dave. Dave wants this repo run like any project: agents under hard gates, a GitHub trail per unit, actuals recorded. Ramble showed that agents reviewing agents works when the review verdict is a required status check posted by a GitHub App, not a PR approval from Dave's own login, and that Dave's gate time is what sets the date.

## Decision

1. **Identity.** Agents act as the `defaultdave-agents` GitHub App through `scripts/merge-desk/agent-git.ts` and `post-check.ts`. Never Dave's `gh` login. The App has Checks, Commit statuses, Contents, Pull requests and Issues; no Administration, Workflows, Secrets.
2. **One tier.** Every unit PRs into `main`. This site has no money, auth or data paths, so no `integration` branch and no weekly promotion.
3. **Required checks on `main`:** the CI jobs (format:check, lint, typecheck, test, build, knip, e2e), `scope-manifest` (title names a plan unit, branch matches, protected paths untouched), and four agent checks posted by the App: `review-agent`, `qa-agent`, `spec-compliance`, `a11y-audit`. `architecture-audit` and `perf-check` run but are advisory.
4. **Approval window on at the start.** The ruleset requires one approval, dismissed on push; agents request Dave's review and queue auto-merge, so his approval merges. Dave closes the window with `approval-window.sh off` once the first few merges have shown the checks hold; after that the checks alone merge and agents request him only for escalations.
5. **Still Dave's, always:** the App, rulesets, secrets, repo settings, Vercel settings, the domain, bypass merges, cutting or parking units, and these rules. Workflow files need his push, because the App has no `workflows` permission.
6. **Protected paths** (fail `scope-manifest`): `.github/`, `.claude/`, `CLAUDE.md`, `scripts/merge-desk/`, `docs/adr/`, `docs/plan/` except the bookkeeping files (`STATUS.md`, `DECISIONS.md`, `delta-log.md`, `time-log.csv`), which a `PM bookkeeping:` PR may change.
7. **Revert path:** `scripts/merge-desk/revert.sh <pr>` opens a revert PR through the same checks.
8. **Reviews cost rounds.** A round is a blocking finding from a required check that sends the unit back to its builder; non-blocking findings go into the check summary as follow-ups. Rounds per unit are the delta log's unit of measure for agent-built work.

## Alternatives

- **Dave merges everything by hand.** The plan's own finding: his hours set the date, and every extra gate is on the critical path.
- **Two tiers as on Ramble.** Nothing here needs the second tier, and it caused Ramble's branch-deletion incident.
- **Claude Code Action in CI for the agent checks.** Unattended and metered; start with local sessions posting checks, move the narrow checks to Actions if volume calls for it.

## Consequences

- The `merge-desk` unit lands by Dave's bypass, since the rule it sets up does not exist until it merges.
- A required check is added only once the thing that posts it exists: CI names after `scaffold`, agent checks after `post-check.ts`.
- `scope-manifest` is commit-scoped; a superseded PR is closed before auto-merge is queued on its replacement.
