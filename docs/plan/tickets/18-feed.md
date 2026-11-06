# RSS feed for Articles and Musings (would-like; first to cut)

Plan unit `feed` · Route: agent fan-out · Depends on: `page-writing`, `merge-desk` · Expected 1.2 rounds (1 / 1 / 2), 15 owner minutes, about 0.6 elapsed days

## Outcome

Readers can subscribe to Articles and Musings at /feed.xml.

## Acceptance criteria

- [ ] /feed.xml is a valid RSS 2.0 feed of articles and musings newest first; canonical posts link to the original
- [ ] <link rel="alternate" type="application/rss+xml"> in the root layout
- [ ] Feed validates with a standard validator (link the result in the PR)
- [ ] Quality gates pass: build, lint, typecheck, test

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - /feed.xml is a valid RSS 2.0 feed of articles and musings newest first; canonical posts link to the original
    - <link rel="alternate" type="application/rss+xml"> in the root layout
    - Feed validates with a standard validator (link the result in the PR)
    - Quality gates: build, lint, typecheck, test
  OUT OF SCOPE:
    - Newsletter (non-goal)
    - Everything under "Will not do" in docs/plan/brief.md
  in_scope_globs:
    - src/app/feed.xml/**
    - src/app/layout.tsx
```

## Intended precedent

listPosts from the content layer.

## Open questions

None. First unit to cut if the appetite bites.
