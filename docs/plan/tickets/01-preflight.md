# Accounts, domain, GitHub App, Hobby caps and secrets, from preflight.md

Plan unit `preflight` · Route: human only · Depends on: none · Expected 0.5 days (0.25 / 0.5 / 1)

## Outcome

Every account, plan tier, cap, secret and repository rule the build needs exists and is recorded in docs/plan/preflight.md, so no build unit stops to set something up.

## Acceptance criteria

- [x] Every row in docs/plan/preflight.md that can be done before `scaffold` is ticked, with the dry-run row filled first; the rest say which unit they moved to (re-estimate 2026-11-06)
- [x] davidfleming.me is bought through Vercel (or the fallback domain is, and brief.md and stack-decisions.md are updated); attaching it to the project moves to `scaffold`
- [x] Repo settings from project-setup.md section A are applied: squash only, delete branch on merge, auto-merge on, secret scanning, push protection, private vulnerability reporting, Dependabot alerts
- [x] The shared `defaultdave-agents` App (Ramble's `ramble-agents-defaultdave`, renamed; App ID unchanged) has Checks, Commit statuses, Contents, Pull requests and Issues read and write and nothing else, `defaultdave/defaultdave` is added to its installation, and `~/.config/defaultdave-agents/app.conf` holds its ids with `APP_KEY` pointing at the existing key (mode 600)
- [x] Each Hobby cap is verified on vercel.com/pricing at walk time and has a stated workaround in the runbook; the music host row names the host

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - Every row in docs/plan/preflight.md that can be done before `scaffold` is ticked, with the dry-run row filled first; the rest say which unit they moved to (re-estimate 2026-11-06)
    - davidfleming.me is bought through Vercel (or the fallback domain is, and brief.md and stack-decisions.md are updated); attaching it to the project moves to `scaffold`
    - Repo settings from project-setup.md section A are applied: squash only, delete branch on merge, auto-merge on, secret scanning, push protection, private vulnerability reporting, Dependabot alerts
    - The shared `defaultdave-agents` App (Ramble's `ramble-agents-defaultdave`, renamed; App ID unchanged) has Checks, Commit statuses, Contents, Pull requests and Issues read and write and nothing else, `defaultdave/defaultdave` is added to its installation, and `~/.config/defaultdave-agents/app.conf` holds its ids with `APP_KEY` pointing at the existing key (mode 600)
    - Each Hobby cap is verified on vercel.com/pricing at walk time and has a stated workaround in the runbook; the music host row names the host
  OUT OF SCOPE:
    - scaffold (no code is written here)
    - Any content
    - Everything under "Will not do" in docs/plan/brief.md
  in_scope_globs:
    - docs/plan/preflight.md
    - .env.example
```

## Intended precedent

templates/preflight.md in the plan-project skill; the Services table is already drafted.

## Open questions

Which music host (brief open question 1) decides the last Services row. Dave answers before the dry run.

## Notes from the plan

Dave walks preflight.md after the agent dry-runs it. Hobby caps: 100 deploys a day, 100 GB bandwidth a month, 6,000 build minutes a month, 1 concurrent build.
