# About page from the about singleton

Plan unit `page-about` · Route: agent fan-out · Depends on: `shell`, `cms`, `design` · Expected 1.2 rounds (1 / 1 / 2), 15 owner minutes, about 0.6 elapsed days

## Outcome

A visitor reads who Dave is and how to reach him.

## Acceptance criteria

- [ ] /about renders bio MDX, optional headshot with next/image, and the links list from the about singleton
- [ ] Missing headshot renders text-only with no layout gap
- [ ] External links carry rel="noopener" and the visually hidden "(opens in new tab)" only when target is _blank
- [ ] Quality gates pass: build, lint, typecheck, test

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - /about renders bio MDX, optional headshot with next/image, and the links list from the about singleton
    - Missing headshot renders text-only with no layout gap
    - External links carry rel="noopener" and the visually hidden "(opens in new tab)" only when target is _blank
    - Quality gates: build, lint, typecheck, test
  OUT OF SCOPE:
    - Contact form (non-goal)
    - Bio text (content-home-about)
    - Everything under "Will not do" in docs/plan/brief.md
  in_scope_globs:
    - src/app/about/**
    - src/components/sections/about/**
```

## Intended precedent

page-home.

## Open questions

None.
