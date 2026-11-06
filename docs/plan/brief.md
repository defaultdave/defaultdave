# Project Brief: davidfleming.me (repo `defaultdave`)

Recorded 2026-11-06 from three intake rounds with Dave in Claude Code, plus a CMS and domain research pass the same day.

## Outcome

Recruiters and hiring managers who follow the link from Dave's resume or LinkedIn see shipped work, performance case studies and code within two minutes. Measure: the link is in every application from launch day, and at least one interviewer references the site unprompted.

## Appetite and the first milestone

- Appetite: 2 weeks at about 30 hours a week (about 60 hours), raised from 15 and then 25 at the range review on 2026-11-06, first because the writing units cannot be delegated and then to hold the design unit. Dave's words: do not worry horribly about the timing estimate; the point is to measure reality. Scope is cut to fit it; the plan does not grow past it. Interview prep still outranks the site on any given day.
- First walkable milestone: Home, the Work list and one full case study (ResortPass checkout and performance work), live at `davidfleming.me`, wanted by the end of week 1 so it can go into applications.
- Discovery conversation: held 2026-11-06 with Dave, in three rounds of up to four questions each. Appetite, milestone, domain, CMS, AI scope, music hosting and non-goals all came from those rounds, not from the written ask.

## People

| Role | Who | Decides |
|---|---|---|
| Decision-maker | Dave Fleming | Scope, date, budget |
| Day-to-day contact | Dave | |
| Users | Recruiters, hiring managers, interviewing engineers; secondarily peers and readers of the articles | |
| Other teams or vendors touching it | Vercel (hosting, domain, analytics), GitHub (repo, Keystatic auth), embed hosts for music | |

## Today

- What exists now: no portfolio site. Public surface is LinkedIn and the `defaultdave` GitHub account. The content exists but is scattered: the CrUX performance article draft (Sep 2026, anonymized) and its demo repo, the Tuscany Rule article (also posted on LinkedIn), the ResortPass delivery story and retrospectives in the vault, the vig/dev-team agent orchestration work, and a dozen side projects with READMEs.
- What hurts, and what triggered this work now: the job search re-opened 2026-08-31 and there is no single link that shows shipped work and thinking together. Every application goes out with LinkedIn and GitHub only.
- System to retire when this ships: none.

## Scope signals

| Must have | Would like | Will not do (non-goals) |
|---|---|---|
| Home page with a one-paragraph positioning statement and links to each section | Experiments section linking live demos (react-perf-pitfalls, gallery-perf-demo) | Comments, newsletter, contact form; contact is mailto, LinkedIn and GitHub links |
| Work list: ResortPass, gallery perf + CrUX article, vig/dev-team, side-project cards (xair, robo-advisor, Harp-Diem, others) | Second and third case studies (gallery perf, vig) as full write-ups | Site search and tag filtering |
| One full case study: ResortPass checkout and perf work, anonymized and NDA-safe | RSS feed for Articles | In-site AI assistant (deferred; Claude Code edits the repo locally) |
| Articles: Tuscany Rule, CrUX performance article, links to published pieces with canonical URLs | Dark mode following the system setting | CMS auth beyond Keystatic's GitHub login; no custom admin |
| Musings: short posts, same collection shape as Articles | OG image per page | Custom analytics, A/B tests, i18n; Vercel Analytics free tier only |
| Music: a releases list with embeds (Bandcamp, SoundCloud, Spotify or YouTube) and notes | | Self-hosted audio or a custom player |
| About: bio, headshot, how to reach Dave | | Redirect domains; one domain only |
| Keystatic CMS mounted at `/keystatic`, GitHub mode, editing every collection | | |
| Deployed on Vercel at `davidfleming.me`, previews per PR, Vercel Analytics on | | |
| Lighthouse 95+ on every public page, WCAG 2.2 AA, no CLS from embeds | | |

## Constraints

| Constraint | Value | Fixed or flexible |
|---|---|---|
| Outside date (launch, contract, promise) | None hard. Soft: the link is wanted in applications as soon as the first milestone is live | Flexible |
| People available, and hours per week | Dave, about 30 hours a week for two weeks, logged in docs/plan/time-log.csv; agent sessions (`/senior`, review swarm) for low-uncertainty units | Fixed |
| Stack the client has fixed | Next.js App Router, Vercel, Keystatic (git-based CMS), MDX content in the repo | Fixed |
| Compliance, security, privacy | ResortPass material must stay anonymized and NDA-safe, and the prototype-and-docs origin story must be told accurately. Nothing company-sourced from the Multi Media LLC loop. No secrets in chat or in the repo | Fixed |
| Environments and access needed | GitHub repo `defaultdave/defaultdave`; Vercel Hobby project linked to it; domain bought through Vercel; a GitHub App for Keystatic | Fixed |
| Review and sign-off turnaround | Dave, same day | Flexible |

## The client supplies

| Item | By when | Blocks |
|---|---|---|
| Designs | Two renderings of one design made in the `design` unit before any component is coded: a Figma file (via the Figma MCP) and an interactive Claude Design artifact, compared; Dave signs off one token source of truth | `shell`, every `page-*` |
| API access and documentation | Vercel account, GitHub account, domain purchase | `preflight` |
| Content and copy | ResortPass case study draft, Tuscany Rule article (exists), CrUX article final pass, list of published pieces with URLs, project blurbs, music embed links, bio and headshot | `content-work`, `content-writing`, `content-music`, `about` |
| Test accounts and data | None needed | |

Credentials are requested through the provider's own console and never written into this file or the repo.

## Planning bar

- [ ] Over two weeks of work for one person (about 30 hours of Dave's time, under the bar on its own)
- [x] Over one person, or more than one team touching it (Dave plus agent sessions on fan-out units; the plan's routes and gates exist for this)
- [x] An outside date (soft: the first milestone is wanted in applications within the week)
- [ ] A replacement: an old system to retire

Two boxes ticked, one of them soft. Dave asked for the full plan explicitly, so every artifact is produced.

## Assumptions

| # | Assumption | If it is wrong | Owner | Confirm by |
|---|---|---|---|---|
| 1 | Keystatic's GitHub mode works with the current Next.js App Router release without patches | Fall back to Keystatic local mode (edit on the laptop, commit, push) and park the hosted admin; or swap to Payload, which adds about 3 days | Dave | `preflight` dry run |
| 2 | Vercel Hobby covers a personal portfolio (non-commercial) with room to spare on bandwidth and build minutes | Move to Pro at $20 a month | Dave | `preflight` |
| 3 | The ResortPass story can be told with the client anonymized, as the CrUX article already does | Case study becomes a performance narrative without client identifiers; gallery perf becomes the lead case study | Dave | `content-work` |
| 4 | Music is reachable through at least one embed host that allows third-party embedding | Music section ships as a list of outbound links | Dave | `content-music` |
| 5 | `davidfleming.me` is still available at purchase time (open on 2026-11-06 at $13.99 first year, $20 renewal) | Buy `defaultdave.me` or `defaultdave.dev` instead; nothing else changes | Dave | `preflight` |
| 6 | The design unit (Figma file plus Claude Design artifact) stays at a token set, five components and six layouts, about a day and a half of Dave's time | It becomes the thing that eats the appetite; cap it at the estimate and finish the rest in code | Dave | `design` |

## Open with the client

| # | Question | Blocks unit | Asked on | Answer |
|---|---|---|---|---|
| 1 | Which music host do the embeds come from, and is there a release list already? | `content-music` | 2026-11-06 | |
| 2 | Is there a headshot and a current bio paragraph, or does the About page launch text-only? | `about` | 2026-11-06 | |
| 3 | Which published pieces (LinkedIn, Medium, dev.to) should be listed, with URLs? | `content-writing` | 2026-11-06 | |
| 4 | Can ResortPass be named in the case study, or does it stay "a hospitality marketplace" as in the article? | `content-work` | 2026-11-06 | |
