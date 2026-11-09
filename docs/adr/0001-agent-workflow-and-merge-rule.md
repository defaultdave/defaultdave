# ADR 0001: Agent workflow and merge rule

- **Status:** Accepted 2026-11-06 by Dave, with all eight amendments from the portfolio-pm review (listed at the end). Proposed 2026-11-06 by the planning session.
- **Depends on:** `docs/plan/plan-report.md` (routes), `.claude/standards/stack-decisions.md`
- **Model:** Ramble ADR 0010 and its merge-desk runbook, with the second tier removed.

## Context

The plan routes eight units to agent fan-out and the rest to Dave. Dave wants this repo run like any project: agents under hard gates, a GitHub trail per unit, actuals recorded. Ramble showed that agents reviewing agents works when the review verdict is a required status check posted by a GitHub App, not a PR approval from Dave's own login, and that Dave's gate time is what sets the date.

## Decision

1. **Identity.** Agents act as the `defaultdave-agents` GitHub App (one App shared across Dave's projects, tokens restricted to this repo when minted) through `scripts/merge-desk/agent-git.ts` and `post-check.ts`. Never Dave's `gh` login. The App has Checks, Commit statuses, Contents, Pull requests and Issues; no Administration, Workflows, Secrets. The App key is a `.pem` file, which the session sandbox denies reading, so the merge-desk commands run outside the sandbox: they are listed in `.claude/settings.local.json` (gitignored, Dave applies) as the only allowed and sandbox-excluded commands. Nothing else in a session reads the key. Issue comments, issue body edits and PR body edits go through the same script with the body on stdin (`agent-git.ts issue-comment <n> - < body.md`, or a heredoc), so the script opens no body file.
2. **One tier.** Every unit PRs into `main`. This site has no money, auth or data paths, so no `integration` branch and no weekly promotion.
3. **Branches.** Every agent branch is `unit/<unit-id>-<slug>`, `pm/<slug>` or `revert/pr-<n>`, and nothing else; `agent-git.ts` refuses any other name and `main`. The PM's `senior` worktrees use `unit/<unit-id>-<slug>` (for example `unit/merge-desk-port`), not `senior/<n>-<slug>`.
4. **Required checks on `main`:**
   - CI, pinned to GitHub Actions: `format:check`, `lint`, `typecheck`, `test`, `build`, `knip`, `e2e`.
   - Security, pinned to GitHub Actions: `analyze` (CodeQL), `scan` (Gitleaks), `scan-pr` (OSV-Scanner).
   - `scope-manifest`, pinned to GitHub Actions: the title names a plan unit or starts with `PM bookkeeping:`, the branch matches, protected paths are untouched.
   - Four agent checks, pinned to the App: `review-agent`, `qa-agent`, `spec-compliance`, `a11y-audit`. `architecture-audit` and `perf-check` run but are advisory.
5. **Who posts the agent checks.** `/review-pr <pr-url>` runs review, qa and the specialists and writes their verdicts to `.team-verdicts/`; `post-check.ts` then posts each verdict under its check name (`review` as `review-agent`, `qa` as `qa-agent`, `spec-compliance`, `a11y-audit`, and the two advisory ones). `/review-swarm` is advisory only and posts no required check. A required check without a verdict file stays pending; it is never posted green by hand.
6. **Bookkeeping PRs.** A `PM bookkeeping:` PR on a `pm/` branch may change only the bookkeeping paths (rule 8). When `scope-check` confirms that, `post-check.ts` posts all four agent checks as success with the summary "not applicable: bookkeeping only", since there is no code or UI to review. Any other file in the PR fails `scope-manifest` first, so the shortcut cannot carry code.
7. **Approval window on at the start.** The ruleset requires one approval, dismissed on push; agents request Dave's review and queue auto-merge, so his approval merges. The repo setting "Allow auto-merge" is on (Dave's setting). Dave closes the window with `approval-window.sh off` once the first few merges have shown the checks hold, and not before Ramble's tokens are restricted (Consequences); after that the checks alone merge and agents request him only for escalations.
8. **Protected paths** (fail `scope-manifest`): `.github/`, `.claude/`, `CLAUDE.md`, `scripts/merge-desk/`, `docs/adr/`, `docs/plan/`. The bookkeeping paths are the exception, and only a `PM bookkeeping:` PR into `main` may change them: `docs/plan/STATUS.md`, `docs/plan/DECISIONS.md`, `docs/plan/delta-log.md`, `docs/plan/time-log.csv`, `docs/plan/plan.json` and `docs/plan/plan-report.md` (calibration and Re-estimates only, each matched by a `delta-log.md` row), and `.claude/agent-memory/portfolio-pm/**` (the PM's public memory).
9. **Still Dave's, always:** the App, rulesets, secrets, repo settings, Vercel settings, the domain, bypass merges, cutting or parking units, and these rules. Workflow files need his push, because the App has no `workflows` permission. The ruleset's only bypass actor is the repository admin role (Dave alone on a personal repo) with bypass mode `always`, so he can still push a commit straight to `main` and merge any PR as break-glass.
10. **Revert path:** `scripts/merge-desk/revert.sh <pr>` opens a revert PR on `revert/pr-<n>` through the same checks.
11. **Reviews cost rounds.** A round is a blocking finding from a required check that sends the unit back to its builder; non-blocking findings go into the check summary as follow-ups. Rounds per unit are the delta log's unit of measure for agent-built work.

## Alternatives

- **Dave merges everything by hand.** The plan's own finding: his hours set the date, and every extra gate is on the critical path.
- **Two tiers as on Ramble.** Nothing here needs the second tier, and it caused Ramble's branch-deletion incident.
- **Claude Code Action in CI for the agent checks.** Unattended and metered; start with local sessions posting checks, move the narrow checks to Actions if volume calls for it.
- **Bypass mode `pull_request`.** Dave could then bypass only through a PR, so every bookkeeping commit and every emergency fix would need one. `always` matches Ramble and keeps his break-glass.
- **Bookkeeping PRs merged by Dave's bypass.** Works, but puts a click of Dave's on every status update, which the approval window is meant to remove.

## Consequences

- The `merge-desk` unit lands by Dave's bypass, since the rule it sets up does not exist until it merges.
- A required check is added only once the thing that posts it exists: CI and security names after `scaffold`, agent checks after `post-check.ts`.
- `scope-manifest` is commit-scoped; a superseded PR is closed before auto-merge is queued on its replacement.
- **A green agent check proves a check was posted, not that someone independent judged the work.** The builder and the reviewer act as the same App with the same key on the same machine. The approval window covers this at the start; after it closes, trust rests on the PM checking each issue's criteria at close.
- **Ramble's tokens are not restricted yet** (DECISIONS 2026-11-06), and the agent checks here are pinned to the shared App id, so a Ramble agent could post a passing check on a portfolio PR. Restricting Ramble's `app-token.ts` to `defaultdave/ramble` is a precondition for closing the approval window here.
- The merge-desk commands run outside the sandbox. Their own refusals (branch names, no `main`, no `--admin`) are the only guard on them, which is why they are the only commands excluded.

## Amendments (accepted 2026-11-06, from the portfolio-pm review)

1. **Branch names** (rule 3, new): one pattern for agent branches; PM worktrees move from `senior/<n>-<slug>` to `unit/<unit-id>-<slug>`. Without it `agent-git.ts` refuses the push and `scope-manifest` fails every PR. The worktree line in `.claude/agents/portfolio-pm.md` changed to match.
2. **Bookkeeping PRs and the agent checks** (rule 6, new): bookkeeping-only PRs get "not applicable" agent checks, because the four required agent checks have nothing to judge in a STATUS edit.
3. **Bypass mode `always`** (rule 9): issue #5 named `pull_request`, which ends Dave's direct pushes to `main`.
4. **PM paths in the bookkeeping list** (rule 8): the PM's public memory and the planned calibration of `plan.json` and `plan-report.md` were protected with no exception.
5. **Sandbox** (rule 1): the App key is a `.pem` the sandbox cannot read; the merge-desk commands are excluded from it and nothing else is.
6. **Security scans required** (rule 4): CodeQL, Gitleaks and OSV run on every PR but were not required.
7. **Who posts which check** (rule 5, new): `/review-pr` verdicts map to check names through `post-check.ts`; `/review-swarm` is advisory.
8. **Shared-App spoofing** (Consequences, rule 7): any holder of an App token can post a passing check; Ramble's tokens must be restricted before the approval window closes. Also notes the "Allow auto-merge" repo setting.

Issue #5 carries a dated Amendment section (2026-11-06) for the branch pattern, bypass mode, bookkeeping paths, sandbox exclusion, the required security checks, and the bookkeeping "not applicable" posting in `post-check.ts`.
