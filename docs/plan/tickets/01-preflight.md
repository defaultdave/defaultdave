# Accounts, domain, GitHub App, Hobby caps and secrets, from preflight.md

Plan unit `preflight` · Route: human only · Depends on: none · Expected 0.5 days (0.25 / 0.5 / 1)

## Outcome

Every account, plan tier, cap, secret and repository rule the build needs exists and is recorded in docs/plan/preflight.md, so no build unit stops to set something up.

## Acceptance criteria

- [ ] Every row in docs/plan/preflight.md is ticked, with the dry-run row filled first
- [ ] davidfleming.me is bought through Vercel and attached to the project (or the fallback domain is, and brief.md and stack-decisions.md are updated)
- [ ] The GitHub App for Keystatic exists; its three secrets are in the Vercel env store (Production, Preview) and local .env, and nowhere else
- [ ] main is protected with the four required checks named; Dave is the only merger
- [ ] Each Hobby cap has a stated workaround in the runbook

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - Every row in docs/plan/preflight.md is ticked, with the dry-run row filled first
    - davidfleming.me is bought through Vercel and attached to the project (or the fallback domain is, and brief.md and stack-decisions.md are updated)
    - The GitHub App for Keystatic exists; its three secrets are in the Vercel env store (Production, Preview) and local .env, and nowhere else
    - main is protected with the four required checks named; Dave is the only merger
    - Each Hobby cap has a stated workaround in the runbook
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
