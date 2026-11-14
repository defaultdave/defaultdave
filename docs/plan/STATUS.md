# STATUS: davidfleming.me

Current state only. History is in `DECISIONS.md` and `delta-log.md`. Kept under 25 KB by `scripts/pm.sh check`.

Updated 2026-11-14 by pm (Fable 5.2): PRs #84 (work cards), #86 (home and about copy) and #88 (music release) merged; #14 and #15 amended; PR #91 (content-writing: table support, the CrUX and Tuscany Rule articles, two published pieces) in review with checks posted. 2026-11-13: swarm 3 (content drafts) ran as one workflow, 26 agents; drafts sit uncommitted in worktrees `content-work-cards`, `content-writing`, `content-music`, `content-home-about` (branches `unit/<same>`), the worktree hook refused the agents' fixes, so the PM applied the verified edits by shell on Dave's go; cards and home/about pass every gate, music and writing fail only the `seed.test.ts` counts outside their globs; state per unit in Next item 1. Earlier the same day (Opus 5.5): issue and board check. Every done unit's issue is closed and shows Done on board #20; open are #7 (Dave confirms), #13 to #16 (content), #19 to #21 (tail) and #42 (merge-desk revert follow-up). `content-work` case study merged as PR #80 (`Refs #13`, so #13 stays open for the cards); design fix for metric cards and work tags merged as PR #81, design audit against the artifact still to run. Earlier: swarm 2 closed. `feed` (#69), `seo-perf` (#70, #72, #75, plus #76 for the Lighthouse SEO miss on `/`), #62 (#71) and `cleanup` (#77) merged; Lighthouse CI green on main; #17 and #73 closed. Every agent unit that can run is done; what remains is the owner's content and the owner-led tail. GitHub repo: `defaultdave/defaultdave`, public; issues #1 to #21 are the plan tickets. Project board: [#20](https://github.com/users/defaultdave/projects/20). Domain `davidfleming.me` live on Vercel project `defaultdave`.

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
| `content-work` | in progress | human only | 2 | #13 | #80, #84 | Dave | case study merged 2026-11-12 (d285391) at `content/work/marketplace-checkout/index.mdx`, replacing the placeholder (Amendment on #13); #13 open, no criteria ticked yet; project cards (criterion 2) and Dave's read on the preview URL still to do |
| `content-writing` | in review | human only | 1 | #14 | #91 | Dave | table support, CrUX article, Tuscany Rule entry, two LinkedIn entries; checks posted on 2114f03; Dave decides whether the Tuscany article shows in full |
| `content-music` | in progress | human only | 1 | #15 | #88 | Dave | one Bandcamp release merged 2026-11-14; #15 open until Dave sees the embed on the live site and closes it |
| `content-home-about` | in progress | human only | 3 | #16 | #86 | Dave | copy merged 2026-11-14 (c15d075); #16 open for the mailto link and the headshot |
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

1. Swarm 3 (2026-11-13). Full result, the verified fix list and the two parked posts: `.claude/agent-memory-local/pm/swarm-3/` in the main checkout (gitignored, moved there 2026-11-14; `workflow-result.json`, `content-writing/`). They stay out of the repo: it is public, and the Tuscany Rule text is not cleared to publish.
   - `content-work` cards (#13): five cards in `content-work-cards`, verified edits applied (vig lineage and scope-manifest wording; vig, xair and robo-advisor repo links removed, the repos are private; stale test count dropped), `seed.test.ts` work count set to 6 (in #13's amended scope); all gates pass; PR #84 opened by the App (`Refs #13`), head bd496cc after one fix commit (a fact check found the Harp Diem card linking the unregistered harpdiem.com, an unmerged AWS stack and a wrong tuning count); review round 2 approved and all six agent checks are posted as success on bd496cc; Dave approved and it merged 2026-11-14 (squash 00bc7b2). #13 stays open for his read of every entry. Dave to settle: the Sole developer role where Copilot and Claude identities authored commits, and whether the gallery-perf demo (a fictional resort day-pass brand) sits too close to the former client.
   - `content-writing` (#14): PR #91 opened by the App (`Refs #14`) from branch `unit/content-writing-posts`, head 2114f03, one review round, all six agent checks posted, CI green. Contents: `remark-gfm` table support (second Amendment on #14, DECISIONS 2026-11-14); the CrUX article as a full post, figures settled from Dave's data breakdown on his "best judgments"; `tuscany-rule`, ported from the article he published on LinkedIn (the PM's reading of his answer, waits on his confirmation); two LinkedIn summary entries. Open for Dave: the post template links out for any post with a canonical URL, so the Tuscany body is in the file but not shown, and showing it needs a `PostPage.tsx` change outside #14; one sentence in the CrUX desktop paragraph was written by a reviewer in his voice; three named fixes come from PRs closed unmerged; PR screenshots not attached. Follow-ups, not filed: a URL scheme allowlist in the MDX restriction (data: and vbscript: link targets pass today, predates this PR); the vault chart sources still carry the old labels; Keystatic drops table column alignment on save. Posted verdicts archived in `.claude/agent-memory-local/pm/pr-91-verdicts/`. The older worktree `.claude/worktrees/content-writing` (branch `unit/content-writing`) holds superseded uncommitted drafts and can be removed.
   - `content-music` (#15): #15 amended (DECISIONS 2026-11-14). PR #88 opened by the App (`Refs #15`), head 83d4b57, one review round: the Bandcamp profile lists exactly one release (a track, released 2026-03-18), verified against the live page; browser QA on a local build loaded the player in the facade with layout shift 0. All six agent checks posted as success; Dave approved and it merged 2026-11-14. #15 stays open until he sees the embed load on the live site. Nits: the aspect auto box is 160px and the player 120px; the title is the Bandcamp title with his name and three exclamation marks; the track page credits four other musicians the entry leaves out.
   - `content-home-about` (#16): PR #86 merged 2026-11-14 (c15d075) after three review rounds; two fact checks pulled the copy back inside the resume and the published case study. Open on #16: the mailto link and the headshot (the Keystatic field writes to `public/images/about/`). Dave accepted by merging, and can still change: About links the LinkedIn profile that names the client; the bio points at the music page; "more than ten years" on Home.
   - Audits (read-only): #81 put tags in JetBrains Mono, which the design doc reserves for code (should-fix, Dave's call); `e2e/smoke.spec.ts` runs axe on `/` only, so `qa-pass` (#19) needs specs for every route; no `not-found.tsx`; card links named only "Read".
   - Lesson: run `/pm` from the main checkout. In a desktop worktree session a PreToolUse hook refuses Write and Edit on every other worktree, for the PM and its subagents.
2. Milestone 1 needs `content-work` (#13, Dave's). The case study is live at `/work/marketplace-checkout` (merged in #80); Dave reads it there for voice and NDA, then picks the cards for the other projects (criterion 2), then reads every entry on the preview URL and #13 closes.
3. `lighthouse` stays advisory, not required (DECISIONS 2026-11-12); revisit at `launch`.
4. Dave: confirm #7 criterion 5 (Keystatic App secrets only in the Vercel env store and local `.env`) and close #7; put the forwarding address in the footer; workshop the bio text (`content-home-about`, #16). `content-writing` (#14) and `content-music` (#15) are unblocked.
5. Small follow-ups, not filed: card links could carry the card title in their accessible name; re-run the W3C feed validator on the live `/feed.xml`; design audit of #81 against the artifact; #42 (revert through `agent-git.ts`) is open and unscheduled; the CSP is report-only with no report endpoint, so read violations in the browser console (on `/keystatic` especially) before the tail enforces it. Carried from before: PR screenshots for #52 to #56 only if wanted; Amendment sections on #9 and #11; review-agent size rule edit in `vig/global/agents/review.md` is Dave's.
6. Merged worktrees to remove when convenient: `feed`, `seo-perf-meta`, `seo-perf-perf`, `seo-perf-lighthouse`, `launcher-refs`, `cleanup`, `page-home-link-text`.
7. Session sandbox quirks: `git worktree add`, `pnpm install` and `agent-git` need the sandbox off; in a worktree installed outside the sandbox, `pnpm add` fails on a store mismatch, so the owner runs dependency adds; `gh` cannot read its config in the sandbox (read public issues with `curl` to api.github.com); a command that names the launcher path anywhere but first word is denied by `command-guard`; a new branch from `origin/main` needs `--no-track` (the sandbox cannot write `.git/config`).

## Next chat

**Before you start:** read PR #91 and approve it or ask for changes; say whether the Tuscany Rule article should show in full on the site; check the Music page on the live site and close #15 if the embed loads; decide the public email address for the footer and the About mailto link.

**Run:** `/pm` in a new desktop chat opened on the main checkout `~/Workspace/defaultdave` (not a worktree session, see the lesson in Next item 1).

**Model and effort:** Sonnet, medium.

**Prompt:** Read `docs/plan/STATUS.md` (Next item 1) and the tail of `DECISIONS.md`. Every content unit has a PR merged or in review: work cards (#84), home and about (#86), music (#88) and content-writing (#91, check its state with `gh pr view 91` first). If the owner wants the Tuscany Rule article shown in full, that is a small change to `src/components/sections/writing/PostPage.tsx` (render the body and keep the link to the original) and needs an Amendment or its own ticket before a `senior` builds it. Then close out what keeps #13 to #16 open (the owner's reads, the mailto link, the headshot), file the follow-ups listed in Next item 1 if the owner wants them, and start `qa-pass` (#19), which first needs e2e specs with axe for every route. Remove the merged worktrees when the owner agrees. Keep `STATUS.md` current. Don't commit.
