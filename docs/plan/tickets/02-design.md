# Design: a Claude Design artifact of the tokens, components and six layouts, with switchable options

Plan unit `design` · Route: human only · Depends on: none · Expected 1.5 days (0.75 / 1.5 / 2.5)

**Status:** signed off by Dave 2026-11-06 on artifact https://claude.ai/artifact/8Npi9s5Yboe47QzQ7vrJDP (version 21). Figma dropped the same day (see Amendment).

## Outcome

The look of the site is settled before any component is coded, in an interactive Claude Design artifact Dave can try options in. Dave compares the options, picks, and signs off one design. In code, `tokens.css` is the source of truth for tokens and Storybook for components and their states. Shell and every page unit build to it.

## Acceptance criteria

- [x] ~~A new Figma file `davidfleming.me`, created through the Figma MCP, with pages: Foundations, Components, Layouts~~ (dropped 2026-11-06, see Amendment)
- [x] A Claude Design artifact of the tokens, components and layouts, with at least two switchable options where Dave wants to compare (type pairing, accent colour, nav placement, density, style, palette, Music page)
- [x] A short comparison note in docs/designs/: `docs/designs/2026-11-06-design-comparison.md`, covering the rounds, the signed-off direction and the token source of truth
- [x] Foundations: colour variables for light and dark modes (background, surface, text, muted text, accent, focus ring), a type scale (display, h1, h2, h3, body, small, mono), and a spacing scale; contrast checked at 4.5:1 text and 3:1 UI in both modes
- [x] Components with variants: Nav (desktop, mobile, current item), Card (work card, section card), Post header (with and without canonical), Embed facade (idle, loaded), Footer
- [x] Layouts at 1280 and 390 wide: Home, Work list, Case study, Articles list and post, Music, About
- [x] Tokens are named so `tokens.css` maps onto them one to one (map in the comparison note)
- [x] Dave signs off on the design; the artifact link is recorded in docs/designs/2026-11-06-portfolio-site.md under seam 4

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - Claude Design artifact with switchable options
    - Comparison note naming the token source of truth
    - Colour, type and spacing variables for light and dark, contrast checked
    - Five components with the listed variants
    - Six layouts at desktop and mobile
    - Naming that maps one to one onto tokens.css
    - Sign-off and link recorded in the design doc
  OUT OF SCOPE:
    - A Figma file (dropped 2026-11-06)
    - Any code (shell, page-*)
    - Illustration, logo work, or a brand beyond a wordmark
    - A dark-mode toggle (follows system; non-goal)
    - Content writing (content-*)
    - Prototyping interactions beyond the facade's two states
  in_scope_globs:
    - docs/designs/2026-11-06-portfolio-site.md
    - docs/designs/2026-11-06-design-comparison.md
```

## Amendment 2026-11-06: Figma dropped

Dave dropped the Figma file after the artifact rounds.
- **Why:** Figma costs money and needs an MCP server that never got past sign-in. It would be a second source of truth to keep in sync, and no designer is editing by hand.
- **Instead:** the artifact is the design record. In code, `tokens.css` is the source of truth for tokens and Storybook for components and their states.
- **Revisit:** if a designer or client needs to edit outside code.

## Intended precedent

New. Dave decides. For the Claude Design artifact the agent starts from the Design artifact type (`Artifact quickstart`, intent design). Keep it small: the appetite has about nine hours for this unit, and the comparison is the point, not polish.

## Open questions

None. Figma was originally planned as a second rendering through the MCP (decided 2026-11-06) and then dropped the same day.

## Notes from the plan

Added 2026-11-06 at Dave's request after the range review. Originally two renderings of one design, compared; amended to the artifact alone. Shell and every page depend on it. Timing is measured, not promised: Dave logs start and stop times in docs/plan/time-log.csv.
