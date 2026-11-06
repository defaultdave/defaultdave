# Cross-page QA: axe, Lighthouse CI, Playwright smoke, content proofread

Plan unit `qa-pass` · Route: human-led · Depends on: `seo-perf`, `feed`, `content-work`, `content-writing`, `content-music`, `content-home-about` · Expected 0.8 days (0.5 / 0.75 / 1.5)

## Outcome

The whole site, with real content, passes accessibility, performance and smoke checks, and Dave has proofread every page on a preview URL.

## Acceptance criteria

- [ ] axe reports zero serious or critical on every public route
- [ ] Lighthouse CI green on its three pages; spot-check the rest by hand
- [ ] Playwright smoke green on every route, including 404 for a card slug under /work
- [ ] Every page proofread by Dave on the preview URL; fixes filed and merged
- [ ] Keyboard walk of every page: skip link, nav, facade button, back links
- [ ] Bundle report attached to the PR

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - axe reports zero serious or critical on every public route
    - Lighthouse CI green on its three pages; spot-check the rest by hand
    - Playwright smoke green on every route, including 404 for a card slug under /work
    - Every page proofread by Dave on the preview URL; fixes filed and merged
    - Keyboard walk of every page: skip link, nav, facade button, back links
    - Bundle report attached to the PR
  OUT OF SCOPE:
    - New features
    - Launch steps
    - Everything under "Will not do" in docs/plan/brief.md
  in_scope_globs:
    - e2e/**
    - src/**
    - content/**
```

## Intended precedent

~/.claude/agents qa agent for the Playwright pass; a11y-audit specialist for the diff.

## Open questions

None.
