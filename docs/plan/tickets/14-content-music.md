# Release list with embed links and notes

Plan unit `content-music` · Route: human only · Depends on: `cms` · Expected 0.5 days (0.25 / 0.5 / 1)

## Outcome

Music lists every release Dave wants public, with a working embed for each.

## Acceptance criteria

- [ ] content/music/*.yaml: one per release with title, year, host, embedUrl, aspect and notes
- [ ] Every embedUrl loads in the facade on the preview URL
- [ ] A release that cannot be embedded is listed with an outbound link in notes and no embedUrl

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - content/music/*.yaml: one per release with title, year, host, embedUrl, aspect and notes
    - Every embedUrl loads in the facade on the preview URL
    - A release that cannot be embedded is listed with an outbound link in notes and no embedUrl
  OUT OF SCOPE:
    - Player component (page-music)
    - Everything under "Will not do" in docs/plan/brief.md
  in_scope_globs:
    - content/music/**
```

## Intended precedent

None.

## Open questions

Brief open question 1: which host, and is there a release list.

## Notes from the plan

Dave's. Uncertainty 2: embed host not yet chosen.
