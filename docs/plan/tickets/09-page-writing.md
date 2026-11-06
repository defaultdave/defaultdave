# Articles and Musings lists and post template with canonical handling

Plan unit `page-writing` · Route: agent fan-out · Depends on: `shell`, `cms`, `design` · Expected 2.2 rounds (1 / 2 / 4), 45 owner minutes, about 1.1 elapsed days

## Outcome

A visitor can browse Articles and Musings as lists and read each post, and a post first published elsewhere shows a summary with an outbound link and a canonical tag.

## Acceptance criteria

- [ ] /articles and /musings list posts newest first with title, date, summary and reading time; one shared list component
- [ ] /articles/[slug] and /musings/[slug] share one post template with a back link
- [ ] A post with canonical renders summary, "Read on <host>" link, and <link rel="canonical"> to the original; one without renders the MDX body
- [ ] Reading time and date formatting in src/lib with table-driven tests
- [ ] Empty collection renders a one-line "Nothing here yet" state
- [ ] Quality gates pass: build, lint, typecheck, test

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - /articles and /musings list posts newest first with title, date, summary and reading time; one shared list component
    - /articles/[slug] and /musings/[slug] share one post template with a back link
    - A post with canonical renders summary, "Read on <host>" link, and <link rel="canonical"> to the original; one without renders the MDX body
    - Reading time and date formatting in src/lib with table-driven tests
    - Empty collection renders a one-line "Nothing here yet" state
    - Quality gates: build, lint, typecheck, test
  OUT OF SCOPE:
    - RSS (feed)
    - Tag filtering or search (non-goals)
    - Article text (content-writing)
    - Everything under "Will not do" in docs/plan/brief.md
  in_scope_globs:
    - src/app/articles/**
    - src/app/musings/**
    - src/components/sections/writing/**
    - src/lib/reading-time.ts
    - src/lib/reading-time.test.ts
    - src/lib/format-date.ts
    - src/lib/format-date.test.ts
```

## Intended precedent

New pattern; page-work's detail template if it lands first.

## Open questions

None.

## Notes from the plan

Same as page-work: sibling page, routed to agent fan-out.
