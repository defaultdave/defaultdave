# Tuscany Rule port, CrUX article final pass, published pieces with canonical URLs

Plan unit `content-writing` · Route: human only · Depends on: `cms` · Expected 0.5 days (0.25 / 0.5 / 1)

## Outcome

Articles has the Tuscany Rule and the CrUX performance article as full posts, plus every published piece Dave wants listed, each pointing at its original.

## Acceptance criteria

- [ ] content/articles/tuscany-rule.mdoc ported from ~/Workspace/tuscany-rule/TUSCANY-RULE.md with canonical set to the LinkedIn post
- [ ] content/articles/<crux-slug>.mdoc from the Sep 2026 draft after a final pass; anonymization kept
- [ ] One entry per published piece from brief open question 3, with canonical url and host, summary only
- [ ] At least one musing in content/musings so the section is not empty, or the section ships with the empty state by Dave's call
- [ ] Dave reads each on the preview URL before closing

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - content/articles/tuscany-rule.mdoc ported from ~/Workspace/tuscany-rule/TUSCANY-RULE.md with canonical set to the LinkedIn post
    - content/articles/<crux-slug>.mdoc from the Sep 2026 draft after a final pass; anonymization kept
    - One entry per published piece from brief open question 3, with canonical url and host, summary only
    - At least one musing in content/musings so the section is not empty, or the section ships with the empty state by Dave's call
    - Dave reads each on the preview URL before closing
  OUT OF SCOPE:
    - Templates (page-writing)
    - New writing beyond porting and the final pass
    - Everything under "Will not do" in docs/plan/brief.md
  in_scope_globs:
    - content/articles/**
    - content/musings/**
    - public/articles/**
```

## Intended precedent

The existing article files.

## Open questions

Brief open question 3: the list of published URLs.

## Notes from the plan

Tuscany Rule and the CrUX draft exist; this is porting, a final pass, and a list of URLs.
