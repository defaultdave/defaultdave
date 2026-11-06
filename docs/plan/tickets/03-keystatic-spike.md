# Prove Keystatic GitHub mode on the current Next.js App Router release

Plan unit `keystatic-spike` · Route: human only · Depends on: none · Expected 0.5 days (0.25 / 0.5 / 1)

## Outcome

A yes or a no, with evidence, on whether Keystatic GitHub mode runs on the Next.js release the scaffold will use; and if no, the fallback the cms unit takes.

## Acceptance criteria

- [ ] A throwaway app on the current Next.js release mounts Keystatic at /keystatic in local mode and edits one entry
- [ ] The same app in GitHub mode, against a scratch repo, commits one edit through the GitHub App
- [ ] Findings written to docs/plan/spikes/keystatic.md: versions, errors hit, workarounds, and the decision (GitHub mode / local mode only / Payload)
- [ ] The cms unit estimate is revisited in plan.json and the report rerun

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - A throwaway app on the current Next.js release mounts Keystatic at /keystatic in local mode and edits one entry
    - The same app in GitHub mode, against a scratch repo, commits one edit through the GitHub App
    - Findings written to docs/plan/spikes/keystatic.md: versions, errors hit, workarounds, and the decision (GitHub mode / local mode only / Payload)
    - The cms unit estimate is revisited in plan.json and the report rerun
  OUT OF SCOPE:
    - The real app (scaffold, cms)
    - Everything under "Will not do" in docs/plan/brief.md
  in_scope_globs:
    - docs/plan/spikes/keystatic.md
    - docs/plan/plan.json
    - docs/plan/plan-report.md
```

## Intended precedent

Keystatic docs, Next.js App Router guide.

## Open questions

None once preflight has issued the GitHub App. The local-mode half runs before that.

## Notes from the plan

Runs beside preflight; needs the GitHub App from preflight only for the GitHub-mode half, so start with local mode.
