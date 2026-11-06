# Work list and case-study template with metrics and figures

Plan unit `page-work` · Route: agent fan-out · Depends on: `shell`, `cms`, `design` · Expected 2.2 rounds (1 / 2 / 4), 60 owner minutes, about 1.1 elapsed days

## Outcome

A visitor can scan every work entry on /work and read a full case study at /work/[slug] with metrics, figures and links.

## Acceptance criteria

- [ ] /work lists case studies first, then cards, each with title, summary, role, period, stack tags and links
- [ ] /work/[slug] exists only for entries with kind case-study (generateStaticParams filters cards); a card slug returns 404
- [ ] Case-study template renders MDX body with Metric and Figure components, a back link, and the links list
- [ ] Period renders as "Apr 2026 to Aug 2026" or "since Sep 2026"; formatting lives in src/lib with a table-driven test
- [ ] Images use next/image with explicit dimensions; CLS 0 in the Lighthouse CI run
- [ ] Quality gates pass: build, lint, typecheck, test

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - /work lists case studies first, then cards, each with title, summary, role, period, stack tags and links
    - /work/[slug] exists only for entries with kind case-study (generateStaticParams filters cards); a card slug returns 404
    - Case-study template renders MDX body with Metric and Figure components, a back link, and the links list
    - Period renders as "Apr 2026 to Aug 2026" or "since Sep 2026"; formatting lives in src/lib with a table-driven test
    - Images use next/image with explicit dimensions; CLS 0 in the Lighthouse CI run
    - Quality gates: build, lint, typecheck, test
  OUT OF SCOPE:
    - The case-study text (content-work)
    - Articles template (page-writing)
    - OG images (seo-perf)
    - Everything under "Will not do" in docs/plan/brief.md
  in_scope_globs:
    - src/app/work/**
    - src/components/sections/work/**
    - src/lib/format-period.ts
    - src/lib/format-period.test.ts
```

## Intended precedent

Post template in page-writing if it lands first; otherwise new.

## Open questions

None.

## Notes from the plan

Uncertainty 1 and well-trodden; on the path only as the longest of five sibling pages. Routed to agent fan-out.
