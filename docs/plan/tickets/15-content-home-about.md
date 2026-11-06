# Positioning paragraph, bio, headshot, contact links

Plan unit `content-home-about` · Route: human only · Depends on: `cms` · Expected 0.3 days (0.1 / 0.25 / 0.5)

## Outcome

Home has the positioning paragraph and About has the bio, headshot and links.

## Acceptance criteria

- [ ] content/home.yaml: headline, intro, featuredWork slugs
- [ ] content/about.yaml: bio, optional headshot in public/, links (GitHub, LinkedIn, mailto)
- [ ] No hedging language (the self-downplaying check); AI references only tied to concrete work (vig, dev-team)

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - content/home.yaml: headline, intro, featuredWork slugs
    - content/about.yaml: bio, optional headshot in public/, links (GitHub, LinkedIn, mailto)
    - No hedging language (the self-downplaying check); AI references only tied to concrete work (vig, dev-team)
  OUT OF SCOPE:
    - Templates (page-home, page-about)
    - Everything under "Will not do" in docs/plan/brief.md
  in_scope_globs:
    - content/home.yaml
    - content/about.yaml
    - public/about/**
```

## Intended precedent

Resume positioning choices already settled.

## Open questions

Brief open question 2: headshot ready or text-only.

## Notes from the plan

One paragraph, one bio, links.
