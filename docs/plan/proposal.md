# Proposal: davidfleming.me

Prepared 2026-11-06 for Dave Fleming, by Dave Fleming. A personal project, so the client and the team are the same person; the proposal is kept because it is the one-page version of the plan.

## What you get

Recruiters and hiring managers who follow the link from your resume or LinkedIn see shipped work, performance case studies and code within two minutes. Measure: the link is in every application from launch day, and at least one interviewer references the site unprompted.

| Capability | What a user can do when it ships |
|---|---|
| Home | Read one positioning paragraph, see the featured case study, reach every section in a click |
| Work | Scan every project as a card; read the ResortPass checkout and performance case study in full, with measured results |
| Articles | Read the Tuscany Rule and the CrUX performance article; follow links to pieces published elsewhere |
| Musings | Read short posts in the same shape as Articles |
| Music | See every release with notes and play it in place, with nothing loading until asked |
| About | Read who Dave is and reach him by mail, LinkedIn or GitHub |
| Editing | Dave edits every section at `/keystatic` from any browser, signed in with GitHub; each save commits and redeploys. Or edits the MDX locally with Claude Code |
| Design | One design settled before code, in two renderings compared: a Figma file and an interactive Claude Design artifact; one token source of truth signed off |
| Quality | Lighthouse 95 or better on every page, WCAG 2.2 AA, previews on every PR, CI gates plus agent review checks required on `main`, agents acting as a GitHub App (ADR 0001) |

## What is not included

- Comments, newsletter, contact form. Contact is mailto, LinkedIn and GitHub links.
- Site search and tag filtering.
- An in-site AI assistant, or any CMS auth beyond Keystatic's GitHub login. Claude Code on the repo covers the editing help for now.
- Custom analytics, A/B tests, i18n. Vercel Analytics only.
- Self-hosted audio or a custom player. Embeds only.
- Redirect domains. One domain, `davidfleming.me`.

Anything on this list is a phase-2 issue, filed in the tail unit.

## How long

> Critical path is preflight, scaffold, merge-desk, shell, page-work, seo-perf, qa-pass, launch, tail: about 1.9 weeks of calendar time, range 1.7 to 2.2. The design, the Keystatic spike, cms, three of the five pages, the four writing units and the RSS feed are off it. One engineer with no agents is about 4.4 weeks serial. The floor is 1.9 weeks; more people add nothing. At 30 hours a week, Dave's own time is 2.4 weeks, so Dave's hours set the date, not the graph. The first walkable milestone, Home, the Work list and the ResortPass case study live at davidfleming.me, has a floor of 1.2 weeks and needs about 48 hours of Dave's time.

The range is built from a three-point estimate on every unit and checked against Ramble (36 units with recorded actuals, which closed at 29% of their likely estimates). This plan's serial total is 1.8 times what Ramble's per-unit rate predicts, which is expected: Ramble's units were agent-built, and most of this plan's hours are Dave designing and writing. The timing is a measurement to take, not a promise to keep: outside work is logged with scripts/track.sh, inside work from transcript timestamps. It is re-estimated at each milestone below and should narrow as the work runs.

## Options

| Staffing | Duration | What binds it |
|---|---|---|
| Dave alone, no agents | 4.0 weeks (20.1 days) | Everything runs serially |
| Dave + agent fan-out (chosen) | 2.2 weeks (11.0 days) | Dave's capacity: the design and writing units and review of agent work |
| Dave + one more engineer + agents | 1.7 weeks (8.7 days) | Engineer capacity |
| Dave + three more + agents | 1.7 weeks (8.6 days) | The critical path: this is the floor |
| Dave + four more + agents | 1.7 weeks (8.6 days) | No further gain: the path is saturated |

Agent-built units are estimated in review rounds at 0.5 elapsed days a round, with Dave's minutes per unit recorded separately (about 5 hours across the eight agent units). Rounds per unit, owner minutes, owner hours a week and the round length are assumptions until the delta log measures them, after the third agent-built unit merges.

Token budget for the eight fan-out units: eight `/senior` sessions on Sonnet plus one review pass each; at Ramble's measured rates that is a few dollars per unit, well under $50 for the project. Recorded by `token-audit` as it runs.

## Milestones

| # | Milestone | You can see | Target week (range) |
|---|---|---|---|
| 0 | Designed | A Figma file and a Claude Design artifact of the same tokens, components and six layouts; one token source of truth signed off | Day 2 to 3 |
| 1 | Walkable | `davidfleming.me` serves Home, the Work list and the ResortPass case study; the link goes into applications | End of week 1 (floor 0.9 weeks; needs about 36 of Dave's hours that week) |
| 2 | Content complete | Articles, Musings, Music and About are live with real content; every page proofread on a preview | Mid week 2 |
| 3 | Launched | Lighthouse 95 on every page, analytics recording, link in the resume and on LinkedIn, 48 hours clean | End of week 2 (range 1.5 to 1.9 weeks of calendar; 2.1 weeks of Dave's hours) |
| 4 | Tail closed | Placeholders gone, CSP enforced, phase-2 issues filed, delta log read-back written | Week 3, after one week of clean CSP reports |

## What we need from you

| Item | By | What waits on it |
|---|---|---|
| Vercel and GitHub accounts; buy `davidfleming.me`; create the Keystatic GitHub App; walk `preflight.md` | Day 1 | Every build unit |
| Decide the design: compare the Figma file and the Claude Design artifact, sign off one token source of truth | Day 3 | `shell`, every page |
| Decide: music host and release list (open question 1) | Day 3 | `content-music` |
| Decide: can ResortPass be named (open question 4) | Day 3 | `content-work` publishing |
| Headshot and bio, or text-only About (open question 2) | Day 5 | `content-home-about` |
| List of published pieces with URLs (open question 3) | Day 5 | `content-writing` |
| About 36 hours in week 1 and 26 in week 2, logged with scripts/track.sh for work outside Claude | Throughout | The date |

## Assumptions

| Assumption | If it turns out wrong |
|---|---|
| Keystatic GitHub mode runs on the current Next.js release | Local mode only (edit on the laptop, push), or Payload at about +3 days |
| Vercel Hobby covers a personal portfolio | Pro at $20 a month |
| ResortPass can be told anonymized, as the CrUX article does | Performance narrative without client identifiers; gallery perf leads |
| At least one embed host allows embedding the releases | Music lists outbound links |
| `davidfleming.me` still available at purchase | `defaultdave.me` or `defaultdave.dev`; nothing else changes |
| 0.5 days a round, 1 to 2 rounds per agent unit, about 40 minutes of Dave per unit | Calibrated after the third agent merge; the date moves with it |
| The design unit stays at a token set, five components and six layouts in both renderings | It eats the appetite; cap it at the estimate and finish the rest in code |

## After launch

Launch is when `davidfleming.me` carries traffic and the link is in applications. The plan finishes later, at:

- the tail unit: placeholders removed, CSP enforced, phase-2 issues filed (Experiments section, more case studies, in-site AI assistant, self-hosted audio), and the delta log read-back written with a reference-class entry for the next plan;
- Dave owns the site afterwards; content changes go through `/keystatic` or a PR, and nothing needs a build unit again.

## Terms

Not applicable. Direct costs: domain $13.99 first year then $20 a year; Vercel Hobby $0; agent tokens under $50 for the build.
