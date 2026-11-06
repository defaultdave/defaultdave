# Remove placeholders and scaffolding, enforce CSP, file would-likes as issues, delta read-back

Plan unit `tail` · Route: human-led · Depends on: `launch` · Expected 0.5 days (0.25 / 0.5 / 1)

## Outcome

Placeholders and scaffolding are gone, CSP is enforced, the would-likes are filed as issues, and the delta log has its read-back.

## Acceptance criteria

- [ ] Seed entries and placeholder text removed from content/
- [ ] CSP switched from report-only to enforced after one week of clean reports
- [ ] Issues filed for: Experiments section, second and third case studies, dark-mode toggle (if ever), self-hosted audio, in-site AI assistant
- [ ] docs/plan/delta-log.md read-back written with a reference_class entry for the next plan
- [ ] Quality gates pass: build, lint, typecheck, test

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - Seed entries and placeholder text removed from content/
    - CSP switched from report-only to enforced after one week of clean reports
    - Issues filed for: Experiments section, second and third case studies, dark-mode toggle (if ever), self-hosted audio, in-site AI assistant
    - docs/plan/delta-log.md read-back written with a reference_class entry for the next plan
    - Quality gates: build, lint, typecheck, test
  OUT OF SCOPE:
    - Any of the filed would-likes
    - Everything under "Will not do" in docs/plan/brief.md
  in_scope_globs:
    - content/**
    - next.config.*
    - docs/plan/delta-log.md
```

## Intended precedent

templates/delta-log.md read-back section.

## Open questions

None.
