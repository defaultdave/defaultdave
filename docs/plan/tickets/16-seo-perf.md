# Sitemap, robots, OG images, per-page metadata, Speed Insights, bundle analyzer, Lighthouse 95

Plan unit `seo-perf` · Route: agent fan-out · Depends on: `page-home`, `page-work`, `page-writing`, `page-music`, `page-about` · Expected 2.0 rounds (1 / 2 / 3), 30 owner minutes, about 1.0 elapsed days

## Outcome

Every public page is indexable, shares well, and scores 95 or better in Lighthouse; the admin is hidden from crawlers.

## Acceptance criteria

- [ ] sitemap.xml lists every public route; robots.txt disallows /keystatic and /api/keystatic
- [ ] Per-page metadata: title, description, OG and Twitter tags from content; one static OG image per section in public/og/
- [ ] Vercel Analytics and Speed Insights mounted through one src/lib/analytics wrapper
- [ ] CSP report-only header listing self, Vercel, and the four embed hosts' frame origins
- [ ] Lighthouse CI in GitHub Actions on /, the first case study and /music, asserting 95 on each category and CLS 0
- [ ] @next/bundle-analyzer wired as a script; first-load JS on / under 100 kB documented in the PR
- [ ] Quality gates pass: build, lint, typecheck, test

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - sitemap.xml lists every public route; robots.txt disallows /keystatic and /api/keystatic
    - Per-page metadata: title, description, OG and Twitter tags from content; one static OG image per section in public/og/
    - Vercel Analytics and Speed Insights mounted through one src/lib/analytics wrapper
    - CSP report-only header listing self, Vercel, and the four embed hosts' frame origins
    - Lighthouse CI in GitHub Actions on /, the first case study and /music, asserting 95 on each category and CLS 0
    - @next/bundle-analyzer wired as a script; first-load JS on / under 100 kB documented in the PR
    - Quality gates: build, lint, typecheck, test
  OUT OF SCOPE:
    - Dynamic OG image generation
    - Custom analytics (non-goal)
    - Enforcing CSP (tail)
    - Everything under "Will not do" in docs/plan/brief.md
  in_scope_globs:
    - src/app/sitemap.ts
    - src/app/robots.ts
    - src/lib/analytics/**
    - src/lib/metadata.ts
    - public/og/**
    - next.config.*
    - .github/workflows/lighthouse.yml
    - lighthouserc.*
```

## Intended precedent

Shell's default metadata.

## Open questions

None.

## Notes from the plan

Mechanical once pages exist; routed to agent fan-out though it sits on the path.
