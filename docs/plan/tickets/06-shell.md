# Layout, nav, footer, tokens, primitives, metadata defaults, a11y skeleton

Plan unit `shell` · Route: agent fan-out · Depends on: `scaffold`, `design`, `merge-desk` · Expected 2.2 rounds (1 / 2 / 4), 60 owner minutes, about 1.1 elapsed days

## Outcome

Every page shares one layout: wordmark, six-item nav, footer with contact links, type and spacing tokens, light and dark palettes by system preference, and the accessibility skeleton (skip link, landmarks, focus styles).

## Acceptance criteria

- [ ] Round one delivers src/styles/tokens.css generated from the Figma variables and the primitives matching the Figma components; the round closes when Dave checks them against the file
- [ ] Layout renders header, nav, main, footer landmarks; skip link is first in tab order and visible on focus
- [ ] Nav marks the current section with aria-current="page"
- [ ] Palettes meet 4.5:1 for text and 3:1 for UI in both modes; a unit test asserts the token pairs
- [ ] Primitives exist with CSS Modules: Stack, Prose, Card, Tag, LinkButton; each has one component test
- [ ] Default metadata (title template, description, OG defaults) set in the root layout
- [ ] No client component except the theme attribute setter, if one is needed at all
- [ ] Quality gates pass: build, lint, typecheck, test

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - Round one delivers only src/styles/tokens.css (type scale, spacing, two palettes) and a rendered sample page; the round closes when Dave approves the tokens
    - Layout renders header, nav, main, footer landmarks; skip link is first in tab order and visible on focus
    - Nav marks the current section with aria-current="page"
    - Palettes meet 4.5:1 for text and 3:1 for UI in both modes; a unit test asserts the token pairs
    - Primitives exist with CSS Modules: Stack, Prose, Card, Tag, LinkButton; each has one component test
    - Default metadata (title template, description, OG defaults) set in the root layout
    - No client component except the theme attribute setter, if one is needed at all
    - Quality gates: build, lint, typecheck, test
  OUT OF SCOPE:
    - Section pages (page-*)
    - Content layer (cms)
    - OG images per page (seo-perf)
    - A dark-mode toggle (non-goal)
    - Everything under "Will not do" in docs/plan/brief.md
  in_scope_globs:
    - src/styles/**
    - src/components/primitives/**
    - src/components/layout/**
    - src/app/layout.tsx
    - src/app/globals.css
```

## Intended precedent

The Figma file from design, linked under seam 4 of docs/designs/2026-11-06-portfolio-site.md. Token names map one to one.

## Open questions

None. The token approval gate replaces a design review.

## Notes from the plan

Agent fan-out with a gate: round one delivers tokens.css and the type scale only; Dave approves before the primitives are built. Design call kept with Dave, typing with the agent.
