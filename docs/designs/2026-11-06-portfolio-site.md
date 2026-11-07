# Design: davidfleming.me portfolio site

Status: Draft for review · 2026-11-06 · Repo `defaultdave` · Brief: `docs/plan/brief.md`

## Problem Statement

Dave is job searching and has no single public link that shows shipped work, performance case studies, writing and code together. Applications go out with LinkedIn and GitHub only, and interviewers have to assemble the story themselves. The content exists (articles, retrospectives, demo repos, side projects) but is scattered across a vault, repos and LinkedIn posts.

## Goals / Non-Goals

**Goals**

- A recruiter or hiring manager reaches shipped work, one deep case study and code within two minutes of landing.
- Six sections: Home, Work, Articles, Musings, Music, About. Each is a static page built from content in the repo.
- Dave edits every section through a hosted admin (Keystatic at `/keystatic`) or by editing MDX directly; both paths commit to git and redeploy.
- Lighthouse 95 or better on every public page; WCAG 2.2 AA; no layout shift from embeds.
- Ships inside a two-week appetite at about 15 hours a week, with the first milestone (Home, Work, one case study) live in week one.

**Non-goals** (from the brief; any of these is a separate conversation)

- Comments, newsletter, contact form. Contact is mailto, LinkedIn and GitHub links.
- Site search and tag filtering.
- An in-site AI assistant, or any CMS auth beyond Keystatic's GitHub login.
- Custom analytics, A/B tests, i18n.
- Self-hosted audio or a custom player.
- Redirect domains.

## Proposed Solution

### Architecture in one paragraph

A Next.js App Router site, fully static. Content lives in `content/` as MDX and YAML, owned by Keystatic's schema. At build time a thin content layer reads the collections through Keystatic's reader, validates shape, and hands typed records to server components. Every public route is prerendered; a content commit (from the Keystatic admin in GitHub mode, or a direct edit) triggers a Vercel redeploy. The only runtime code paths are Keystatic's admin UI and its API route, both behind GitHub login. There is no database and no runtime API of our own.

### The four seams

1. **Server and client boundary.** Every page and section is a server component. Client components are limited to: the Keystatic admin (vendor), the music embed facade (click-to-load iframe), the theme attribute setter (system dark mode), and the analytics wrapper. Nothing else ships client JavaScript.
2. **Data access layer.** `src/content/` is the only module that imports Keystatic's reader. It exposes one typed function per collection and singleton (signatures below). Pages never read the filesystem or Keystatic directly. This is the layer that would change if the CMS ever changed; nothing above it would.
3. **Presentation logic.** Formatting (dates, reading time, metric display, external-link detection) lives in `src/lib/` as pure functions with unit tests. Components receive formatted props and render. MDX components (callouts, metric blocks, figure) live in `src/components/mdx/` and are registered once.
4. **Design-system primitives.** Settled first in the `design` unit in a Claude Design artifact (https://claude.ai/artifact/8Npi9s5Yboe47QzQ7vrJDP, version 21, signed off by Dave 2026-11-06; choices in `docs/designs/2026-11-06-design-comparison.md`): colour, type and spacing variables for light and dark, five components, six layouts at 1280 and 390. No Figma file (dropped by Dave 2026-11-06: cost and an extra source of truth to keep in sync, with no designer in the loop). The artifact is the design record; in code, `tokens.css` is the source of truth for tokens and Storybook for components and their states. The token file holds CSS custom properties named one to one from the artifact's token map, two palettes selected by `prefers-color-scheme` with no toggle. Primitives: `Stack`, `Prose`, `Card`, `Tag`, `Button`-as-link. CSS Modules beside each component. No component library.

### Content model

Signatures only. Keystatic's schema is the source of truth; these are the shapes the content layer returns.

```ts
type Link = { label: string; href: string }
type Metric = { label: string; value: string; note?: string }

type WorkEntry = {
  slug: string; title: string; summary: string
  role: string; period: { from: string; to?: string }   // ISO months
  stack: string[]; links: Link[]
  featured: boolean; order: number
  cover?: { src: string; alt: string }
  metrics?: Metric[]
  body: MDXContent                                        // present only for case studies
  kind: 'case-study' | 'card'
}

type Post = {
  slug: string; title: string; summary: string
  publishedAt: string; updatedAt?: string                 // ISO dates
  canonical?: { url: string; host: string }               // set when first published elsewhere
  body: MDXContent
}
// collections `articles` and `musings` share the Post shape

type Release = {
  slug: string; title: string; year: number
  host: 'bandcamp' | 'soundcloud' | 'spotify' | 'youtube'
  embedUrl: string; aspect: '16:9' | '1:1' | 'auto'
  notes?: MDXContent
}

type Home  = { headline: string; intro: MDXContent; featuredWork: string[] /* slugs */ }
type About = { bio: MDXContent; headshot?: { src: string; alt: string }; links: Link[] }
```

Content layer API:

```ts
getHome(): Promise<Home>
getAbout(): Promise<About>
listWork(): Promise<WorkEntry[]>            // sorted by featured, then order
getWork(slug: string): Promise<WorkEntry | null>
listPosts(collection: 'articles' | 'musings'): Promise<Post[]>   // newest first
getPost(collection, slug): Promise<Post | null>
listReleases(): Promise<Release[]>          // newest year first
```

### Routes

| Route | Source | Notes |
|---|---|---|
| `/` | `home` singleton + featured `work` | |
| `/work` | `work` collection | Case studies first, then cards |
| `/work/[slug]` | one `work` entry with `kind: 'case-study'` | Cards have no detail page; `generateStaticParams` filters them out |
| `/articles`, `/articles/[slug]` | `articles` | A post with `canonical` renders a summary and an outbound link, plus `<link rel="canonical">` |
| `/musings`, `/musings/[slug]` | `musings` | Same template as articles |
| `/music` | `music` collection | Embed facade per release |
| `/about` | `about` singleton | |
| `/keystatic/[[...params]]`, `/api/keystatic/[...params]` | Keystatic | GitHub mode in production, local mode in development; `robots` disallow |
| `/sitemap.xml`, `/robots.txt` | generated | |
| `/feed.xml` | `articles` + `musings` | Would-like; one unit, cut first if the appetite bites |

### File structure

```
content/                 # MDX + YAML, owned by Keystatic
  work/  articles/  musings/  music/  home.yaml  about.yaml
public/                  # headshot, covers, OG images
src/
  app/                   # routes only; each page.tsx calls src/content and renders components
  content/               # the data access layer (seam 2); the only importer of @keystatic/core/reader
  components/            # primitives, sections, mdx/
  lib/                   # pure formatting and sorting (seam 3), unit-tested
  styles/                # tokens.css, globals.css
keystatic.config.ts
```

### Music embeds

A server-rendered facade: title, host badge, a fixed-aspect box sized from `aspect`, and a "Play" button. On click, a client component swaps in the host's iframe. No third-party script loads until the visitor asks. CSP (report-only first) lists each host's frame origin.

### Deploy and editing flow

```
Dave edits in /keystatic (GitHub mode) ──commit──▶ main ──▶ Vercel build ──▶ production
Dave edits MDX locally (Claude Code)   ──PR──▶ preview URL ──merge──▶ main ──▶ production
```

Keystatic GitHub mode needs a GitHub App with contents write on the repo and three environment variables in Vercel. The preflight runbook owns that setup.

## Alternatives Considered

| Alternative | Why not |
|---|---|
| **Payload 3** (CMS inside the app, Postgres on Neon, Blob storage, community AI plugin) | A real CMS with drafts and a media library, but it adds a database, two more services and about three days of setup to a 5-day appetite. Payload Cloud is closed to new projects. The AI plugin is beta and the in-site assistant is a non-goal for v1 anyway. |
| **Sanity** (hosted, AI Assist) | Polished editor and the only option with an AI assistant built in, but content leaves the repo, the free plan has hard caps, and AI Assist likely sits on the $15/month Growth plan. Dave already edits markdown in a vault; a hosted document store buys little. |
| **Plain MDX, no CMS** | Cheapest. Rejected because Dave asked for a hosted admin he can use away from the laptop, and Keystatic adds that for a config file and one route. The content layer keeps this option open: deleting Keystatic later changes one module. |
| **Astro instead of Next.js** | A strong fit for a content site, but the stack decisions, standards, review agents and interview positioning are all Next.js. Not worth a second framework. |
| **Dark-mode toggle** | A toggle needs client state, persistence and a flash-prevention script. Following `prefers-color-scheme` costs one media query. |

## Implementation Phases

Mapped one-to-one to units in `docs/plan/plan.json`.

1. `preflight`, `design` and `keystatic-spike` in parallel: the Figma file and the Claude Design artifact settle tokens, components and layouts, compared; accounts, domain, GitHub App, Hobby-tier caps; prove Keystatic GitHub mode on the current Next.js release.
2. `scaffold`: Next.js, pnpm, strict TypeScript, ESLint strict-type-checked, Prettier, Knip, Vitest, Playwright smoke, GitHub Actions running build, lint, typecheck, test; Vercel linked.
3. `shell`: layout, nav, footer, tokens, primitives, metadata defaults, skip link, focus styles.
4. `cms`: Keystatic config, collections and singletons, content layer with types, MDX pipeline and components.
5. Pages, fan-out: `page-home`, `page-work`, `page-writing`, `page-music`, `page-about`. Each depends on `shell` and `cms` only.
6. Content, Dave only: `content-work`, `content-writing`, `content-music`, `content-home-about`.
7. `seo-perf`: sitemap, robots, OG images, per-page metadata, Speed Insights, bundle analyzer, Lighthouse pass. `feed` as the would-like.
8. `qa-pass`, `launch` (domain live, link into resume and LinkedIn, analytics verified), `tail` (remove placeholders, file would-likes as issues, delta read-back).

## Testing Strategy

- **Unit (Vitest):** `src/lib/` pure functions, table-driven, one test per behaviour: date formatting, sorting (featured then order; newest first), reading time, canonical detection, aspect-to-padding mapping. The content layer gets one test per collection against a fixture `content/` tree: valid shape in, typed records out; a malformed entry fails the build with the file path in the message.
- **Component (Vitest + Testing Library):** the embed facade (renders no iframe until click; iframe has `title`), the post template with and without `canonical`, the card versus case-study rendering.
- **Smoke (Playwright, in CI):** every public route returns 200 and has exactly one `h1`; `/keystatic` is excluded from the sitemap and `robots`.
- **Accessibility:** axe run inside the Playwright smoke on every public route; zero serious or critical.
- **Performance:** Lighthouse CI on `/`, `/work/[first case study]`, `/music`; budget 95 on each category; CLS 0 on `/music` before any click.
- **Mutation check:** by hand in review, per the stack decisions.

## Security Considerations

- No user input anywhere on the public site. No forms, no query parameters that affect rendering.
- Keystatic admin is gated by GitHub OAuth through the GitHub App; only repo collaborators can write. The three Keystatic secrets live in Vercel's env store (Production and Preview) and local `.env`, never in the repo or a chat.
- CSP report-only from day one, listing self, Vercel Analytics and the embed hosts' frame origins. Enforce after one week of clean reports (tail).
- External links from content open with `rel="noopener"`; MDX is authored only by Dave, so raw HTML stays disabled in the MDX pipeline anyway.
- Content constraint, not code: ResortPass material stays anonymized; nothing from the Multi Media loop.

## Accessibility

- **Keyboard:** skip link to main; visible focus ring on every interactive element; the embed facade's Play button is a real `<button>`; after loading an iframe, focus moves to it.
- **Screen readers:** one `h1` per page; landmarks `header`, `nav`, `main`, `footer`; each iframe has a `title` naming the release; the host badge is text, not icon-only; external links carry visually hidden "(opens in new tab)" only when they do.
- **Contrast:** tokens checked at 4.5:1 for text and 3:1 for UI in both palettes before `shell` closes.
- **Focus management:** client-side navigation moves focus to the new page's `h1`.
- **Forms:** none. **Error announcement:** none needed; no interactive state beyond the facade.
- **Motion:** no animation beyond focus transitions; `prefers-reduced-motion` honoured if any is added.

## UX notes

- Navigation is one flat bar with six items plus a wordmark; no sidebar, no breadcrumbs needed at two levels deep. Detail pages carry a "Back to Work" or "Back to Articles" link above the title.
- Home leads with one positioning paragraph and the featured case study, then one card per section. Reading time on posts. Period and role on work entries.
- Lists are short by design; without search or filters they stay under about fifteen items each, which is the honest size of the content.

## Open Questions

| # | Question | Who answers | Blocks |
|---|---|---|---|
| 1 | Does Keystatic GitHub mode run cleanly on the Next.js release current at setup? | `keystatic-spike` | `cms` |
| 2 | Which host do the music embeds come from, and are there release notes? Host: Bandcamp (2026-11-06); release list and notes still open | Dave | `content-music` |
| 3 | Can ResortPass be named, or does it stay anonymized as in the CrUX article? | Dave | `content-work` |
| 4 | Headshot and bio ready, or text-only About at launch? | Dave | `content-home-about` |
| 5 | Is `/feed.xml` in or cut? | Dave at the range review | `feed` |

## Handoff Checklist

- [ ] Brief confirmed (done 2026-11-06)
- [ ] This design reviewed by Dave
- [ ] `plan.json` runs clean; critical path and range confirmed
- [ ] `preflight.md` walked as a dry run, then for real
- [ ] `keystatic-spike` closed with a yes or a fallback
- [ ] Tickets written with scope manifests; fan-out tickets have no open questions
