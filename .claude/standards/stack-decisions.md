# Stack Decisions

Project copy for `defaultdave` (davidfleming.me), filled by `plan-project` on 2026-11-06. `senior` and `review` read this file; a blank cell means the default in `~/.claude/standards/react-nextjs.md` applies.

## Stack

| Item | This project |
|---|---|
| Framework and version | Next.js, latest stable at setup (16.x on 2026-11-06; confirm in `preflight`), App Router only |
| React version | 19, the version Next.js pins |
| Package manager (SET-14, SET-16) | pnpm, with `packageManager` pinned in `package.json` |
| Node version (`engines`) | 26 LTS, matching Vercel's default (moved from 22 on 2026-11-06; 22 reaches end of life in April 2027) |
| Hosting and deploy target | Vercel Hobby, Git integration from `defaultdave/defaultdave`, production on `main`, previews per PR |
| Backend contract (REST, GraphQL, RPC) and who owns it | None. Content is MDX and YAML in `content/`, read at build time through Keystatic's reader. No runtime API |
| Web only, or web and mobile | Web only, responsive |
| Analytics, monitoring, and feature-flag vendors (each gets a wrapper, ARCH-8) | Vercel Analytics and Speed Insights, behind one `analytics` wrapper. No flags vendor |
| Design system or component library | None. A small token set (type scale, spacing, two colour palettes) in CSS custom properties, components in CSS Modules. Storybook (dev only, added in `shell` 2026-11-06) records components and their states; the signed-off Claude Design artifact is the design record |
| CMS | Keystatic, GitHub mode in production, local mode in development, mounted at `/keystatic`. Collections: `work`, `articles`, `musings`, `music`; singletons: `home`, `about` |

## Decisions

| Rule | Decide | Default | This project |
|---|---|---|---|
| SET-1 | Where project files live: outside `app/`, colocated in route folders, or split by feature | Outside `app/`, under `src/` | Outside `app/`, under `src/`; content outside `src/` in `content/` |
| SET-2 | The feature count past which code is grouped by feature | A handful | Group by layer; the site has six sections and no features in the product sense |
| SET-6 | `exactOptionalPropertyTypes` on or off | Decide at setup | On |
| SET-8 | typescript-eslint set: `recommended`, `strict`, or a type-checked set | `recommended` | `strict-type-checked` |
| SET-11 | Formatter | Prettier | Prettier |
| SET-21 | Unused-code tool | Knip | Knip |
| SET-22 | Route and page-prop types from `next typegen` | On | On |
| DATA-4 | Schema library | Zod | Keystatic's own schema for content; Zod only if a runtime boundary appears |
| DATA-10 | Caching model: `cacheComponents: true` with `'use cache'`, or `force-cache` with `revalidate` | Decide before the first cached fetch | Fully static. Every public route is prerendered at build; a content commit triggers a redeploy. No ISR, no runtime fetch |
| DATA-13 | Client-side data library | None until components share a browser cache | None |
| FORM-6 | Which interactions get optimistic UI | Decide per interaction | None; the site has no forms |
| FORM-8 | Which requests can be retried, and so carry an idempotency key | Decide per write endpoint | None; no write endpoints |
| STATE-11 | Reducers for state that handlers update together | On | On, though little client state is expected |
| STATE-14 | React Compiler on or off | Decide at setup | On |
| TEST-2 | Unit and component test runner | Vitest (Jest stays in a repo that already has it) | Vitest; Playwright for one smoke run per public route |
| TEST-5 | Network mocking: MSW or stubbed `fetch` | Decide at setup | Not needed; no network calls in tests |
| TEST-16 | Mutation check on agent-written tests: by hand or with a tool | By hand | By hand, in review |
| UI-2 | Styling system: CSS Modules or Tailwind | CSS Modules beside the component | CSS Modules beside the component |
| PERF-6 | Bundle analyzer | Decide before the first dependency review | `@next/bundle-analyzer`, run in the `qa-pass` unit |
| PERF-7 | Hand memoization | Follows STATE-14: none in new code when the compiler is on | None |
| SEC-10 | Content Security Policy | Report-only first | Report-only first; embed hosts (music) and Vercel Analytics are the only third-party origins |

## Departures

Fixed rules this project cannot follow yet, each with the reason and the condition for removing the exception.

| Rule | Reason | Remove when |
|---|---|---|
| none | | |

## Architecture notes

Decided by Dave on 2026-11-07, from the `shell` round 2 architecture-audit.

- **B2 and one-line expressions.** A short expression (about one line) that is used once and will not repeat may stay in a component body. Extract to a tested function when logic grows past that or a second caller appears. `Wordmark`'s colour index is the reference case and stays inline.
- **Co-location.** Plain functions and data sit beside the components that use them (`nav-items.ts`, `contact-links.ts`) and beside the styles they read (`src/styles/parse-tokens.ts`). There is no `lib/` folder for the layout and primitives.

