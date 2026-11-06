# Design: a Figma file and a Claude Design artifact of the same tokens, components and six layouts, compared

Plan unit `design` · Route: human only · Depends on: none · Expected 1.5 days (0.75 / 1.5 / 2.5)

## Outcome

The look of the site is settled before any component is coded, in two renderings of one design: a Figma file (variables, components, layouts) and an interactive Claude Design artifact Dave can try options in. Dave compares the two, picks or merges, and signs off one source of truth for the tokens. Shell and every page unit build to it.

## Acceptance criteria

- [ ] A new Figma file `davidfleming.me`, created through the Figma MCP, with pages: Foundations, Components, Layouts
- [ ] A Claude Design artifact of the same tokens, components and layouts, with at least two switchable options where Dave wants to compare (for example two type pairings, two accent colours, nav placement)
- [ ] A short comparison note in docs/designs/: what each rendering got right, which is the source of truth for tokens, and what the other contributed
- [ ] Foundations: colour variables for light and dark modes (background, surface, text, muted text, accent, focus ring), a type scale (display, h1, h2, h3, body, small, mono) bound to text styles, and a spacing scale; contrast checked at 4.5:1 text and 3:1 UI in both modes
- [ ] Components with variants: Nav (desktop, mobile, current item), Card (work card, section card), Post header (with and without canonical), Embed facade (idle, loaded), Footer
- [ ] Layouts at 1280 and 390 wide: Home, Work list, Case study, Articles list and post, Music, About
- [ ] Variables and styles are named so `tokens.css` can be generated from them one to one
- [ ] Dave signs off on the file; the file link is recorded in docs/designs/2026-11-06-portfolio-site.md under seam 4

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - Figma file with Foundations, Components, Layouts pages
    - Claude Design artifact with switchable options
    - Comparison note naming the token source of truth
    - Colour, type and spacing variables for light and dark, contrast checked
    - Five components with the listed variants
    - Six layouts at desktop and mobile
    - Naming that maps one to one onto tokens.css
    - Sign-off and link recorded in the design doc
  OUT OF SCOPE:
    - Any code (shell, page-*)
    - Illustration, logo work, or a brand beyond a wordmark
    - A dark-mode toggle (follows system; non-goal)
    - Content writing (content-*)
    - Prototyping interactions beyond the facade's two states
  in_scope_globs:
    - docs/designs/2026-11-06-portfolio-site.md
```

## Intended precedent

New. Dave decides. For Figma the agent uses the Figma MCP with `figma-generate-library` (variables, components) and `figma-generate-design` (layouts). For the Claude Design artifact it starts from the Design artifact type (`Artifact quickstart`, intent design). Keep both small: the appetite has about nine hours for this unit, and the comparison is the point, not polish.

## Open questions

None. New Figma file via the MCP (decided 2026-11-06); Claude Design as the second rendering.

## Notes from the plan

Added 2026-11-06 at Dave's request after the range review. Two renderings of one design, compared; one source of truth for tokens signed off. Shell and every page depend on it. Timing is measured, not promised: Dave logs start and stop times in docs/plan/time-log.csv.
