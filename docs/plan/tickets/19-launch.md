# Domain live on production, link into resume and LinkedIn, analytics verified

Plan unit `launch` · Route: human-led · Depends on: `qa-pass` · Expected 0.5 days (0.25 / 0.5 / 1)

## Outcome

davidfleming.me serves the site, analytics records visits, and the link is in the resume and on LinkedIn.

## Acceptance criteria

- [ ] Production deployment from main; apex and www resolve, www redirects to apex, HTTPS valid
- [ ] Vercel Analytics shows the first pageviews; Speed Insights reporting
- [ ] Keystatic GitHub mode edits one entry on production and the redeploy lands
- [ ] Resume PDF and LinkedIn headline link to davidfleming.me
- [ ] Exit criterion for the staged ramp: 48 hours with no runtime error in Vercel logs and no broken-link report

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - Production deployment from main; apex and www resolve, www redirects to apex, HTTPS valid
    - Vercel Analytics shows the first pageviews; Speed Insights reporting
    - Keystatic GitHub mode edits one entry on production and the redeploy lands
    - Resume PDF and LinkedIn headline link to davidfleming.me
    - Exit criterion for the staged ramp: 48 hours with no runtime error in Vercel logs and no broken-link report
  OUT OF SCOPE:
    - Code changes (go through qa-pass)
    - Everything under "Will not do" in docs/plan/brief.md
  in_scope_globs:
    - docs/plan/delta-log.md
```

## Intended precedent

None.

## Open questions

None.
