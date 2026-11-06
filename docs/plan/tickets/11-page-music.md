# Music releases list with click-to-load embed facade

Plan unit `page-music` · Route: agent fan-out · Depends on: `shell`, `cms`, `design`, `merge-desk` · Expected 2.0 rounds (1 / 2 / 3), 45 owner minutes, about 1.0 elapsed days

## Outcome

A visitor sees every release on /music with notes and can play it in place; nothing from the embed host loads until they ask.

## Acceptance criteria

- [ ] /music lists releases newest year first with title, year, host badge and notes
- [ ] Each release renders a server-side facade: fixed-aspect box from the aspect field, title, host, and a real <button> labelled "Play <title>"
- [ ] On click a client component swaps in the host iframe with a title attribute; focus moves to it
- [ ] CLS on /music is 0 before any click (Lighthouse CI assertion)
- [ ] Hosts are limited to the four in the schema; an unknown host fails the build
- [ ] Quality gates pass: build, lint, typecheck, test

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - /music lists releases newest year first with title, year, host badge and notes
    - Each release renders a server-side facade: fixed-aspect box from the aspect field, title, host, and a real <button> labelled "Play <title>"
    - On click a client component swaps in the host iframe with a title attribute; focus moves to it
    - CLS on /music is 0 before any click (Lighthouse CI assertion)
    - Hosts are limited to the four in the schema; an unknown host fails the build
    - Quality gates: build, lint, typecheck, test
  OUT OF SCOPE:
    - Self-hosted audio or a custom player (non-goal)
    - CSP headers (seo-perf lists the hosts)
    - Release data (content-music)
    - Everything under "Will not do" in docs/plan/brief.md
  in_scope_globs:
    - src/app/music/**
    - src/components/sections/music/**
    - src/components/embed-facade/**
```

## Intended precedent

New pattern; design doc "Music embeds".

## Open questions

None. The host list is fixed by the schema; which one Dave uses is content.

## Notes from the plan

Same as page-work: sibling page, routed to agent fan-out. Embed facade is the one non-trivial component.
