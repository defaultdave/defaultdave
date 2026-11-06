# Agent identity and merge desk: GitHub App, rulesets with required checks, agent-git, post-check, scope-manifest, revert

Plan unit `merge-desk` · Route: human-led · Depends on: `preflight`, `scaffold` · Expected 1.1 days (0.5 / 1 / 2)

## Outcome

Agents push unit branches, open PRs, post review verdicts as check runs and queue auto-merge as the `defaultdave-agents` GitHub App, never with Dave's login; `main` accepts a PR only when every CI gate, the scope-manifest check, the four agent checks and (while the approval window is open) Dave's approval are green. The setup follows `~/.claude/skills/plan-project/references/project-setup.md`, sections B, D, E and F.

## Acceptance criteria

- [ ] Dave has created the `defaultdave-agents` App (Checks, Commit statuses, Contents, Pull requests, Issues read and write; nothing else), installed it on `defaultdave/defaultdave` only, and recorded the ids in `~/.config/defaultdave-agents/app.conf` with the key at `app-key.pem` mode 600 (preflight rows)
- [ ] `scripts/merge-desk/app-token.ts`, `agent-git.ts`, `post-check.ts`, `scope-check.ts`, `revert.sh`, `approval-window.sh` ported from `ramble/scripts/merge-desk/` with one tier (base `main` only; no `integration`, no sync or promotion rules), `REPO` and `REVIEWER` set, `CHECK_NAMES` = review-agent, qa-agent, spec-compliance, a11y-audit, branch pattern `unit/<id>-*`, `pm/*`, `revert/*`
- [ ] `scope-check.ts` reads unit ids from `docs/plan/plan.json`; protected paths are `.github/`, `.claude/`, `CLAUDE.md`, `scripts/merge-desk/`, `docs/adr/`, `docs/plan/` except the bookkeeping files `docs/plan/STATUS.md`, `docs/plan/DECISIONS.md`, `docs/plan/delta-log.md`, `docs/plan/time-log.csv`
- [ ] Unit tests ported and green: token minting against a mocked endpoint, every scope-check rule, every refusal in agent-git
- [ ] `.github/workflows/scope-manifest.yml` on `pull_request_target`, runs the base branch's script against PR metadata only
- [ ] Dave has created the `main` ruleset from section E with the CI job names, `scope-manifest`, and the four agent checks pinned to the App id, approval window on, bypass mode `pull_request`; read back with `gh api repos/defaultdave/defaultdave/rulesets`
- [ ] `.claude/settings.local.json` (gitignored) allows only the four merge-desk commands
- [ ] Dry run passed and recorded in `docs/plan/DECISIONS.md`: a `pm/dry-run` PR merges after checks plus Dave's approval; a PR with one failing check does not; `revert.sh` works; `agent-git.ts push main` is refused
- [ ] This unit's own PR merges by Dave's bypass, since the rule it sets up does not exist until it lands; said in the PR body
- [ ] Quality gates pass: build, lint, typecheck, test

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - Port the six merge-desk scripts with tests, one tier
    - scope-check reads plan.json; protected and bookkeeping paths as listed
    - scope-manifest workflow
    - settings.local.json allow list (Dave applies)
    - Dry run of merge, block, revert, refusal
    - Ruleset JSON prepared for Dave to run; App steps are Dave's
  OUT OF SCOPE:
    - A second tier or integration branch
    - Nightly smoke (no promotion branch here)
    - Any application code (shell, page-*)
    - Changing user-level permissions.ask
  in_scope_globs:
    - scripts/merge-desk/**
    - .github/workflows/scope-manifest.yml
    - docs/plan/DECISIONS.md
```

## Intended precedent

`ramble/scripts/merge-desk/*.ts` and their tests; `ramble/.github/workflows/scope-manifest.yml`; `ramble/docs/plan/merge-desk-runbook.md`. The rules of record are `docs/adr/0001-agent-workflow-and-merge-rule.md` in this repo.

## Open questions

Dave accepts ADR 0001 (one tier, approval window on at the start, the four agent checks) before the ruleset is created. Everything else is settled by the runbook.

## Notes from the plan

Added 2026-11-06: Dave wants the portfolio run like any project, on the Ramble model. Ported from ramble/scripts/merge-desk with the integration tier removed (one tier, main only). Human-led: Dave creates the App and the rulesets, /senior ports the scripts. Every agent fan-out unit depends on it.
