# Design comparison and sign-off

Unit `design` (issue defaultdave/defaultdave#2). Signed off by Dave on 2026-11-06.

- **Claude Design artifact:** https://claude.ai/artifact/8Npi9s5Yboe47QzQ7vrJDP (version 21). The explorer board has switches for every option below.
- **Figma file:** dropped by Dave on 2026-11-06.
  - Why: Figma costs money and needs an MCP server. It would be a second source of truth to keep in sync, and no designer is editing by hand.
  - Instead: the artifact is the design record. In code, `tokens.css` is the source of truth for tokens and Storybook for components and their states.
  - Revisit: if a designer or client needs to edit outside code.

## How we got here

Each round kept the earlier options switchable so they could be compared side by side.

| Round | Compared | Picked |
|---|---|---|
| 1 | Type: Inter vs Source Serif 4 headings on Inter. Accent: indigo vs terracotta. Nav: bar vs stacked. Density: roomy 68ch vs compact 60ch | Inter, indigo, bar, compact |
| 2 | Card layout: fixed rows per field vs content built from the top | Built from the top (see Cards below) |
| 3 | A style quiz unrelated to the site, scoring four directions (patch, poster, playground, liner notes) | Playground |
| 4 | Palette: foam on black vs classic playground. Music page: red-gold rings vs plain | Foam on black, red-gold rings |
| 4.1 | Card hover movement on or off; wordmark size | Cards still on hover; larger wordmark |

## Signed-off direction

- **Style:** Playground. 2px outlines, 14px radius, hard offset shadows, pill buttons and tags, headings at weight 800.
- **Palette:** foam on black, dark first. The palette is set by `prefers-color-scheme`, with no toggle.
  - Dark: bg `#1A1718`, surface `#262123`, text `#F4EFEA`, muted `#B3AAA4`, border `#4A4245`, shadow `#3CC8B4`.
  - Light: bg `#FFF7EE`, with the playground ink border and shadow.
  - Pops: `#FF6FB5`, `#3CC8B4`, `#FF8A3D`, `#5BB8FF`. Text on a pop is always ink `#18181B`.
  - Accent: indigo `#3949C9` light, `#93A2FF` dark.
- **Wordmark:** "David Fleming" set in type, with each letter in a different colour and a slight tilt. The letters straighten on hover. The link carries `aria-label`, and the letter spans are `aria-hidden`. Sizes: 30px in the bar nav, 26px on mobile.
  - Letter colours, dark: `#FF6FB5 #3CC8B4 #FF8A3D #5BB8FF #FFD84D`.
  - Letter colours, light: `#C2367F #0E7C6E #B5520F #1F6FB8 #3949C9`.
  - The wordmark is typography, not a logo.
- **Music page:** its own look. The hero band runs from `#4A0C0A` through `#8E1D17` and `#B8341F` to `#D49A3A`, with decorative rings and splatter marked `aria-hidden`. The heading is white and the intro is `#FBE9E2`. The idle player carries a faint ring pattern. On Play, the player box turns deep red and the splatter pops in.
- **Type:** Inter for everything, with JetBrains Mono for code.
  - Desktop: display 56/62, h1 40/48, h2 28/36, h3 20/28, body 17/28, small 14/20.
  - Mobile: 38/44, 30/36, 23/30, 19/26, 17/28, 14/20.
- **Spacing:** compact scale 4, 8, 12, 16, 20, 24, 32, 40, 64. Prose measure 60ch.
- **Nav:** a bar, with the current item as a pill. On mobile the links wrap, with no menu button and no client JavaScript.
- **Cards:**
  - Content builds from the top: title (2 lines), subtitle (1 line, optional), description (3 lines). With no subtitle, the description moves up.
  - Tags and the link sit on subgrid rows at the bottom, so they line up across a grid.
  - Every card in a grid is the same height, and overflow ends in an ellipsis.
- **Motion:** springy hovers on nav items, pill buttons and the wordmark letters. Cards do not move. Everything is turned off under `prefers-reduced-motion`.

## Contrast

Checked by calculation for every pair in both schemes. Text pairs meet 4.5:1 and UI pairs meet 3:1.
- Foam dark: text 15.6:1, muted 7.8:1, accent 7.5:1, focus 10.1:1, ink on each pop at least 6.9:1.
- Foam light: muted 6.75:1, accent 6.66:1, focus 7.11:1, every letter colour at least 4.74:1.
- Music band: white on the darkest stop 15.6:1 and on `#B8341F` 5.9:1; `#FBE9E2` on `#B0401F` 4.96:1.
- The live checks are on the Tokens page of the artifact.

## Token names

Names map one to one onto `tokens.css`. A slash in a variable name becomes a dash in the custom property.
- `color/bg` becomes `--color-bg`. Light values go in `:root`, and dark values go in `@media (prefers-color-scheme: dark)`.
- The rest follow the same pattern: `color/surface|text|muted|border|accent|focus|on-accent`, `color/pop-1..4`, `type/<step>/size|line`, `space/1..9`, `layout/measure`, `radius/sm|md|pill`, `effect/outline`, `effect/shadow`.

## Not covered here

The shell and page units build this in code. Copy in the mocks is placeholder only.
