# Home page from the home singleton and featured work

Plan unit `page-home` · Route: agent fan-out · Depends on: `shell`, `cms`, `design`, `merge-desk` · Expected 1.2 rounds (1 / 1 / 2), 20 owner minutes, about 0.6 elapsed days

## Outcome

A visitor landing on / reads the positioning paragraph, sees the featured case study and one card per section, and can reach every section in one click.

## Acceptance criteria

- [ ] / renders headline and intro from the home singleton and the featured work entries by slug, in order
- [ ] One card per section (Work, Articles, Musings, Music, About) linking to its route
- [ ] Exactly one h1; passes the axe check in the smoke run
- [ ] Empty featuredWork renders the sections without a featured block (no error)
- [ ] Quality gates pass: build, lint, typecheck, test

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - / renders headline and intro from the home singleton and the featured work entries by slug, in order
    - One card per section (Work, Articles, Musings, Music, About) linking to its route
    - Exactly one h1; passes the axe check in the smoke run
    - Empty featuredWork renders the sections without a featured block (no error)
    - Quality gates: build, lint, typecheck, test
  OUT OF SCOPE:
    - shell layout and primitives
    - Other pages
    - Content text (content-home-about)
    - Everything under "Will not do" in docs/plan/brief.md
  in_scope_globs:
    - src/app/page.tsx
    - src/components/sections/home/**
```

## Intended precedent

Primitives from shell; data from src/content/getHome.

## Open questions

None.
