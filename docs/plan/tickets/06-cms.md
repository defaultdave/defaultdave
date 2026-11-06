# Keystatic config, collections and singletons, typed content layer, MDX pipeline

Plan unit `cms` · Route: human-led · Depends on: `scaffold`, `keystatic-spike` · Expected 1.1 days (0.5 / 1 / 2)

## Outcome

Dave can edit every collection and singleton at /keystatic (local mode in development, GitHub mode on Vercel), and pages receive typed records from one content module that is the only importer of Keystatic.

## Acceptance criteria

- [ ] keystatic.config.ts defines collections work, articles, musings, music and singletons home, about, matching the shapes in the design doc
- [ ] src/content/ exposes getHome, getAbout, listWork, getWork, listPosts, getPost, listReleases with the documented sorting; nothing outside src/content imports @keystatic/core/reader
- [ ] MDX pipeline renders body fields with registered components (Callout, Metric, Figure) and raw HTML disabled
- [ ] A malformed entry fails the build with the file path in the error (one test with a fixture tree proves it)
- [ ] /keystatic edits an entry in local mode; on a preview deployment, GitHub mode commits an edit through the App
- [ ] /keystatic and /api/keystatic are excluded from robots and sitemap (placeholder until seo-perf, documented)
- [ ] One seed entry per collection so the pages can render
- [ ] Quality gates pass: build, lint, typecheck, test

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - keystatic.config.ts defines collections work, articles, musings, music and singletons home, about, matching the shapes in the design doc
    - src/content/ exposes getHome, getAbout, listWork, getWork, listPosts, getPost, listReleases with the documented sorting; nothing outside src/content imports @keystatic/core/reader
    - MDX pipeline renders body fields with registered components (Callout, Metric, Figure) and raw HTML disabled
    - A malformed entry fails the build with the file path in the error (one test with a fixture tree proves it)
    - /keystatic edits an entry in local mode; on a preview deployment, GitHub mode commits an edit through the App
    - /keystatic and /api/keystatic are excluded from robots and sitemap (placeholder until seo-perf, documented)
    - One seed entry per collection so the pages can render
    - Quality gates: build, lint, typecheck, test
  OUT OF SCOPE:
    - Page layouts and lists (page-*)
    - Real content (content-*)
    - Any AI route (non-goal)
    - Everything under "Will not do" in docs/plan/brief.md
  in_scope_globs:
    - keystatic.config.ts
    - src/content/**
    - src/components/mdx/**
    - src/app/keystatic/**
    - src/app/api/keystatic/**
    - content/**
    - .env.example
```

## Intended precedent

docs/plan/spikes/keystatic.md from the spike; design doc seam 2.

## Open questions

Open until keystatic-spike closes: GitHub mode yes/no.

## Notes from the plan

Human-led on the path. Keystatic schema and content-layer types are the architecture of the site.
