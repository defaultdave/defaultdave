# STATUS: davidfleming.me

Current state only. History is in `DECISIONS.md` and `delta-log.md`. Kept under 25 KB by `scripts/pm.sh check`.

Updated 2026-11-11 by pm (Opus 5.5): piece 4 cutover under way; blocks (b) to (e) applied, block (a) not; preconditions 1 to 3 hold (2 after moving GitHub credentials out of the keychain); block (a) applied, `command-guard` registered; open question 1 and the dry run next. GitHub repo: `defaultdave/defaultdave`, public; issues #1 to #21 are the tickets (no local copies; DECISIONS 2026-11-06), #1 to #6 closed (#7 closes once Dave confirms its criterion 5). Project board: [#20](https://github.com/users/defaultdave/projects/20), all 21 issues added; Route and Milestone fields not set up yet. Domain: `davidfleming.me` bought; Vercel project `defaultdave` live, domain not attached yet. Plan: 21 units; owner time 72 h, 2.4 weeks at 30 h/wk, accepted as a measurement.

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
| `page-home` | todo | agent fan-out | | #8 | | | swarm, after shell + cms |
| `page-work` | todo | agent fan-out | | #9 | | | swarm |
| `page-writing` | todo | agent fan-out | | #10 | | | swarm |
| `page-music` | todo | agent fan-out | | #11 | | | swarm |
| `page-about` | todo | agent fan-out | | #12 | | | swarm |
| `content-work` | todo | human only | | #13 | | Dave | needs Blocked item 3 |
| `content-writing` | todo | human only | | #14 | | Dave | needs Blocked item 5 |
| `content-music` | todo | human only | | #15 | | Dave | needs Blocked item 2 |
| `content-home-about` | todo | human only | | #16 | | Dave | needs Blocked item 4 |
| `seo-perf` | todo | agent fan-out | | #17 | | | after the five pages |
| `feed` | todo | agent fan-out | | #18 | | | first to cut if the appetite bites |
| `qa-pass` | todo | human-led | | #19 | | | |
| `launch` | todo | human-led | | #20 | | | |
| `tail` | todo | human-led | | #21 | | | |

## Blocked on Dave

1. ~~Attach domain~~ done 2026-11-08.
2. `content-music` unblocked: Bandcamp `davidfleming.bandcamp.com` (DECISIONS 2026-11-08).
3. ResortPass naming: Dave is reviewing what the case study names; anonymized until he confirms (password-lock is the fallback).
4. About: headshot supplied; still need the bio text, or confirm text-only.
5. `content-writing` unblocked: three LinkedIn pulse URLs (DECISIONS 2026-11-08).
6. Footer email: Dave wants an address at `davidfleming.me` (forwarding alias; set up before launch).

7. Security, pre-existing (Dave: fix it now, 2026-11-08): the merge-desk allow rules and sandbox exclusions in `.claude/settings.local.json` match cwd-relative script paths that agents can edit or shadow, so an agent can run its own code outside the sandbox with no prompt (found 2026-11-07, verdict `app-writes/.team-verdicts/review-workflow-r2.md`). Decided 2026-11-07: the shared-engine RFC (PR #31) lands before the swarm; until then no unattended agent runs.

## Next

1. Sandbox gap, smallest fix (DECISIONS 2026-11-08), in order: (0) done 2026-11-09: app-writes merged as PR #39 (`--body <text>`, stdin path dropped), #38 closed; worktree `.claude/worktrees/app-writes` can go; (1) spike done 2026-11-08: the exclusion matches an absolute launcher path only as `<path> *`, and `~/.local/share/` is unwritable from the sandbox (DECISIONS 2026-11-08); (2) git hardening in `agent-git.ts` and `revert.sh`, stacked on 0; (3) `install` for this repo; (4) cutover of `settings.local` and a dry run, then the swarm gate is held. Filed 2026-11-10 at expanded scope (DECISIONS 2026-11-10): piece 2 is #40 (`.claude/worktrees/git-hardening`, `unit/merge-desk-git-hardening`), piece 3 is #41 (`.claude/worktrees/install`, `unit/merge-desk-install`, rebases onto #40), revert redesign deferred to #42. Built and reviewed 2026-11-10: #40 approved at round 4 (`unit/merge-desk-git-hardening`, 4 commits, b109825), #41 approved at round 2 (`unit/merge-desk-install`, 3 commits on top of #40, e8d3655); 473 merge-desk tests pass on the combined branch; verdicts in each worktree's `.team-verdicts/`; Amendments posted on #40 and #41. #40 merged 2026-11-10 as PR #44 (b0b975c, bypass; worktree `git-hardening` can go). #41 rebased onto `main` (fe95d84, diff byte-identical, 473 tests pass); merged 2026-11-10 as PR #45 (bypass; worktrees `git-hardening` and `install` can go). Then piece 4 (cutover, Dave), state 2026-11-11: installed at eeff79e (node 25.2.1 from Homebrew, `brew pin node`; `.nvmrc`/`engines` say 26, Dave decides relax or reinstall before block (a)); block (e) applied, 9 sandboxed write probes refused (precondition 1, sandbox half of 3); `core.hooksPath=/dev/null` and `core.fsmonitor=false` set repo-local, not global (global would stop Git LFS hooks in Operation-Get-A-Job); blocks (b), (c), (d) applied, spike exclusion removed, old files in `~/.local/share/defaultdave-merge-desk/rollback/`. Precondition 2 first failed (a sandboxed `git push --dry-run` authenticated through the `osxkeychain` helper; both GitHub keychain items were readable from the sandbox), then held 2026-11-11 after the fix: gh token in `~/.config/gh/hosts.yml` (`--insecure-storage`, read-denied), `gh auth setup-git` (gh is the github.com helper, `osxkeychain` cleared for that host), every GitHub keychain item deleted; sandboxed `gh api user`, plain push and forced-`osxkeychain` push all fail to authenticate. Node: keep 25 (DECISIONS 2026-11-11). Block (a) applied 2026-11-11 with `command-guard` registered; project `settings.local` allow holds only the two launcher entries after Dave removed five probe-approval leftovers 2026-11-11 (two were `security find-generic-password *` and `security dump-keychain *`). Next: open question 1 and the dry run in a fresh session. Open finding, not built: the sandbox can read the whole login keychain (`security` lookups work sandboxed), so any other secret stored there is reachable by a sandboxed process; GitHub's items are gone, others not audited. Not built: `install.sh` `git log` runs a pager (no `--no-pager`); an agent can repoint a worktree's `.git` file at a gitdir it controls, so Dave runs git only in the main checkout. Carried security nits, not built: pin `protocol.{ext,file,ssh,git}.allow=never` in `HARDENING_KEYS` (repo-level `protocol.<x>.allow` outranks `protocol.allow`); `install.sh` import scan is fooled by inline comments (`import x from /**/ "..."`); vacuous tests (`localHead` half of the promisor test, `BASH_FUNC_shasum%%` launcher case); README line that a pin mismatch blocks every Bash call until install reruns.
2. Dave: confirm #7 criterion 5, close #7; set up a forwarding address at `davidfleming.me`; bio text; ResortPass naming call.
3. Then the swarm. Gates not held: engine unbuilt, swarm paused while Dave reworks the PM agents. `plan.mjs` rejects `plan.json` (unit `preflight` kind; `rounds` estimates need days): fix before the next re-estimate. Carried suggestions, not builds: README and CLAUDE.md do not mention the Storybook scripts; `LinkButton` `isInternalHref` wants a tested function; footer links want `min-block-size: 24px`; remove the `glob` override when Storybook moves to the 0.9 docgen plugin; check whether the `GHSA-g3hv-75wg-m249` ignore in `osv-scanner.toml` is unused; `post-check.ts` needs a `KEY=VALUE` first line the review agents' files omit; stale worktrees (`merge-desk`, `objective-stonebraker-fefca0`, `github-pr-screenshots-skill-5a3f0d`, `keystatic-config-collections-and-singlet`) and branches `unit/shell-*` to remove with Dave's go; `ROOT_BLOCK` in `parse-tokens.ts`; `Wordmark` hex comment; tests `__dirname` vs `import.meta.dirname`; Storybook `fontCss`; Footer story padding.

4. Review-agent changes, first read on #40 (2026-11-10): the new size rule (over 1000 changed lines is Required) blocked all three rounds on size alone, counting about 1,800 test lines; Dave accepted one PR (DECISIONS 2026-11-10). Candidate tweak for Dave: leave tests out of the count, or make size Required only when the manifest does not accept it. Severity labels and the Size line came out as specified. Verdict keys: rounds 1 to 3 wrote `verdict=` because the PM's prompt asked for it, so `post-check.ts` (wants `REVIEW_VERDICT=`, `ARCH_VERDICT=`) would refuse them; from round 4 the prompt names the agent's own key. Check again on the next real `/review-pr`.

## Next chat

**Before you start:** nothing; blocks (a) to (e) are applied and the probe-approval leftovers are removed.

**Run:** `/pm` in a new desktop chat in `~/Workspace/defaultdave`.

**Model and effort:** Sonnet, medium.

**Prompt:** Read `docs/plan/STATUS.md` Next item 1 and #41's "For the piece 4 cutover" section. Blocks (a) to (e) are applied and preconditions 1 to 3 hold. Answer open question 1 with probes from this session: `command-guard` denies a launcher call with a `;`, `$(`, a double quote, an env prefix and `bash -c`, and allows a plain `agent-git` call; check that the deny holds even though the launcher is a sandbox-excluded command. Then walk Dave through the merge-desk dry run (README "What Dave runs" step 6, with no `revert.sh` until #42). Then list the doc rewrites that still name `node scripts/merge-desk/...` (CLAUDE.md, `.claude/pm.md`, ADR 0001 rules 1 and 10, vig agents and skills, README step 6) for one bookkeeping PR. Don't commit.

**Swarm (standing call, DECISIONS 2026-11-06: start it the moment the gates hold, no ask):** the five `page-*` units go out as one `senior` subagent each, in their own worktrees, only after `scaffold`, `merge-desk` and `cms` are merged, the design is signed off, the ruleset requires the CI and agent checks, and the merge-desk dry run has passed. Each pushes and opens its PR through `scripts/merge-desk/agent-git.ts` as the App, and writes issue comments and body edits through it too; reviewers post verdicts with `post-check.ts`.
