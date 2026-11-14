# STATUS: davidfleming.me

Current state only. History is in `DECISIONS.md` and `delta-log.md`. Kept under 25 KB by `scripts/pm.sh check`.

Updated 2026-11-13 by pm (Opus 5.5): issue and board check. Every done unit's issue is closed and shows Done on board #20; open are #7 (Dave confirms), #13 to #16 (content), #19 to #21 (tail) and #42 (merge-desk revert follow-up). `content-work` case study merged as PR #80 (`Refs #13`, so #13 stays open for the cards); design fix for metric cards and work tags merged as PR #81, design audit against the artifact still to run. Earlier: swarm 2 closed. `feed` (#69), `seo-perf` (#70, #72, #75, plus #76 for the Lighthouse SEO miss on `/`), #62 (#71) and `cleanup` (#77) merged; Lighthouse CI green on main; #17 and #73 closed. Every agent unit that can run is done; what remains is the owner's content and the owner-led tail. GitHub repo: `defaultdave/defaultdave`, public; issues #1 to #21 are the plan tickets. Project board: [#20](https://github.com/users/defaultdave/projects/20). Domain `davidfleming.me` live on Vercel project `defaultdave`.

MILESTONE: 1 Walkable (exit: Home, the Work list and the ResortPass case study live at davidfleming.me). 0 Designed reached 2026-11-06

## Units

State: todo, in progress, in review, done, cut, parked. Round counts review rounds posted. Owner is who holds the next move.

| Unit | State | Route | Round | Issue | PR | Owner | Note |
|---|---|---|---|---|---|---|---|
| `preflight` | done | human only | | #1 | | | closed 2026-11-06; music host Bandcamp |
| `design` | done | human only | | #2 | | | signed off 2026-11-06 on the artifact (v21); Figma dropped |
| `keystatic-spike` | done | human only | | #3 | | | closed 2026-11-07; decision GitHub mode (DECISIONS 2026-11-07); local half by a senior, GitHub half by Dave (commit df2e09b on a scratch repo, scratch repo and App deleted); findings in `docs/plan/spikes/keystatic.md` |
| `scaffold` | done | human-led | 2 | #4 | #22 | | merged 2026-11-06 (348b25e); production deploy green; Dave attaches `davidfleming.me` in Vercel; `minimatch` advisory ignored until 2027-01-06 (#23); Node 26 merged (#24) |
| `merge-desk` | done | human-led | 1 | #5 | #25 | | closed 2026-11-07; Actuals row written; dry run passed (DECISIONS 2026-11-06); follow-up (App-backed `issue-comment`, `issue-body`, `pr-body` in `agent-git.ts`, DECISIONS 2026-11-07) building on `unit/merge-desk-app-writes` in `.claude/worktrees/app-writes`, protected paths so Dave pushes |
| `shell` | done | agent fan-out | 3 | #6 | #29, #30 | | merged 2026-11-07 (PR #30 at 13ac9c6, squash ff3ef9e); #6 criteria ticked; Actuals row written; worktrees `shell` and `shell-primitives` removed 2026-11-07 (verdicts archived in the PM scratchpad; branches `unit/shell-*` kept) |
| `cms` | done | human-led | 1 | #7 | #35 | Dave | merged 2026-11-08 (c080f48); criteria ticked in #7 except 5 (secrets live nowhere else; Dave confirms, then closes the issue); Actuals row written; GitHub-mode edit proven on the live site (28e5079, reverted in #36) |
| `page-home` | done | agent fan-out | 1 | #8 | #54 | | merged 2026-11-11 (4cbbe7e); one review round, CI e2e covers the h1 and axe criterion; issue #8 closes with the PR |
| `page-work` | done | agent fan-out | 2 | #9 | #53 | | merged 2026-11-11 (fa469c0); AC 5 amended (DECISIONS 2026-11-11); `architecture-audit` failed, advisory (follow-up needs `src/lib` files); #9 closed 2026-11-12 |
| `page-writing` | done | agent fan-out | 1 | #10 | #56 | | merged 2026-11-11 (fd38fdc); CI failed lint and knip on the first push, one fix commit; list date has no `<time>` element (nit) |
| `page-music` | done | agent fan-out | 1 | #11 | #55 | | merged 2026-11-11 (2081e18); Lighthouse CLS assertion moved to `seo-perf` (DECISIONS); real embeddable URLs come with `content-music` |
| `page-about` | done | agent fan-out | 1 | #12 | #52 | | merged 2026-11-11 (dceecfa); first page of the swarm |
| `analytics` | done | agent fan-out | 1 | #66 | #67 | | merged 2026-11-11 (40b81e1); #66 closed; Actuals row written; nit open: pin `@vercel/analytics` exactly (piece B pins Speed Insights) |
| `cleanup` | done | agent fan-out | 1 | #73 | #77 | | merged 2026-11-12 (f1ed3d7); #73 closed; Actuals row written |
| `content-work` | in progress | human only | | #13 | #80 | Dave | case study merged 2026-11-12 (d285391) at `content/work/marketplace-checkout/index.mdx`, replacing the placeholder (Amendment on #13); #13 open, no criteria ticked yet; project cards (criterion 2) and Dave's read on the preview URL still to do |
| `content-writing` | todo | human only | | #14 | | Dave | needs Blocked item 5 |
| `content-music` | todo | human only | | #15 | | Dave | needs Blocked item 2 |
| `content-home-about` | todo | human only | | #16 | | Dave | needs Blocked item 4 |
| `seo-perf` | done | agent fan-out | 1 | #17 | #70, #72, #75, #76 | | merged 2026-11-12 (b45d3e2, 02e63b1, 74cd951, d47c444); #17 closed; Actuals row written |
| `feed` | done | agent fan-out | 1 | #18 | #69 | | merged 2026-11-12 (7c1c85a); #18 closed; Actuals row written; criteria confirmed in a #18 comment; nit: re-run the W3C validator on the live feed after deploy |
| `qa-pass` | todo | human-led | | #19 | | | |
| `launch` | todo | human-led | | #20 | | | |
| `tail` | todo | human-led | | #21 | | | |

## Blocked on Dave

1. ~~Attach domain~~ done 2026-11-08.
2. `content-music` unblocked: Bandcamp `davidfleming.bandcamp.com` (DECISIONS 2026-11-08).
3. ~~ResortPass naming~~ decided 2026-11-11: stays anonymized (DECISIONS); `content-work` is unblocked on this.
4. About: headshot supplied; still need the bio text, or confirm text-only.
5. `content-writing` unblocked: three LinkedIn pulse URLs (DECISIONS 2026-11-08).
6. ~~Footer email~~ forwarding at `davidfleming.me` working (Dave, 2026-11-12); the footer still needs the address.

7. ~~Security, sandbox gap~~ closed 2026-11-11 (piece 4 cutover and launcher dry run, DECISIONS). Was: pre-existing (Dave: fix it now, 2026-11-08): the merge-desk allow rules and sandbox exclusions in `.claude/settings.local.json` match cwd-relative script paths that agents can edit or shadow, so an agent can run its own code outside the sandbox with no prompt (found 2026-11-07, verdict `app-writes/.team-verdicts/review-workflow-r2.md`). Decided 2026-11-07: the shared-engine RFC (PR #31) lands before the swarm; until then no unattended agent runs.

## Next

1. Milestone 1 needs `content-work` (#13, Dave's). The case study is live at `/work/marketplace-checkout` (merged in #80); Dave reads it there for voice and NDA, then picks the cards for the other projects (criterion 2), then reads every entry on the preview URL and #13 closes.
2. `lighthouse` stays advisory, not required (DECISIONS 2026-11-12); revisit at `launch`.
3. Dave: confirm #7 criterion 5 (Keystatic App secrets only in the Vercel env store and local `.env`) and close #7; put the forwarding address in the footer; workshop the bio text (`content-home-about`, #16). `content-writing` (#14) and `content-music` (#15) are unblocked.
4. Small follow-ups, not filed: card links could carry the card title in their accessible name; re-run the W3C feed validator on the live `/feed.xml`; design audit of #81 against the artifact; #42 (revert through `agent-git.ts`) is open and unscheduled; the CSP is report-only with no report endpoint, so read violations in the browser console (on `/keystatic` especially) before the tail enforces it. Carried from before: PR screenshots for #52 to #56 only if wanted; Amendment sections on #9 and #11; review-agent size rule edit in `vig/global/agents/review.md` is Dave's.
5. Merged worktrees to remove when convenient: `feed`, `seo-perf-meta`, `seo-perf-perf`, `seo-perf-lighthouse`, `launcher-refs`, `cleanup`, `page-home-link-text`.
6. Session sandbox quirks: `git worktree add`, `pnpm install` and `agent-git` need the sandbox off; in a worktree installed outside the sandbox, `pnpm add` fails on a store mismatch, so the owner runs dependency adds; `gh` cannot read its config in the sandbox (read public issues with `curl` to api.github.com); a command that names the launcher path anywhere but first word is denied by `command-guard`; a new branch from `origin/main` needs `--no-track` (the sandbox cannot write `.git/config`).

## Next chat

**Before you start:** read the live case study at `/work/marketplace-checkout` for voice and NDA; pick which side projects get cards beyond gallery-perf, vig/dev-team, xair, robo-advisor and Harp-Diem.

**Run:** `/pm` in a new desktop chat in `~/Workspace/defaultdave`.

**Model and effort:** Sonnet, medium.

**Prompt:** Read `docs/plan/STATUS.md` and the tail of `DECISIONS.md`. Every agent unit that can run is merged and Lighthouse CI is green on main. Continue `content-work` (#13): the case study merged in PR #80 and lives in `content/work/marketplace-checkout/index.mdx` (read the Amendment on #13). Draft the project cards for criterion 2 in `content/work/<slug>/index.mdx` with kind card, from each repo's README and the owner's picks, ResortPass staying order 1; run the gates; open the PR with `Closes #13` only once the owner has read every entry on the preview URL, otherwise `Refs #13`. Keep `STATUS.md` current. Don't commit.
