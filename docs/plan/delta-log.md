# Delta Log: davidfleming.me portfolio site

## Estimate of record

Recorded 2026-11-06, before the first commit. These rows stay as written; a revision is a new dated row under Re-estimates.

| Unit | Route | o | m | p | In | Owner min | Expected (days) |
|---|---|---|---|---|---|---|---|
| `preflight` | human only | 0.25 | 0.5 | 1 | days |  | 0.5 |
| `design` | human only | 0.75 | 1.5 | 2.5 | days |  | 1.5 |
| `keystatic-spike` | human only | 0.25 | 0.5 | 1 | days |  | 0.5 |
| `scaffold` | human-led | 0.25 | 0.5 | 1 | days |  | 0.5 |
| `merge-desk` | human-led | 0.5 | 1 | 2 | days |  | 1.1 |
| `shell` | agent fan-out | 1 | 2 | 4 | rounds | 60 | 1.1 |
| `cms` | human-led | 0.5 | 1 | 2 | days |  | 1.1 |
| `page-home` | agent fan-out | 1 | 1 | 2 | rounds | 20 | 0.6 |
| `page-work` | agent fan-out | 1 | 2 | 4 | rounds | 60 | 1.1 |
| `page-writing` | agent fan-out | 1 | 2 | 4 | rounds | 45 | 1.1 |
| `page-music` | agent fan-out | 1 | 2 | 3 | rounds | 45 | 1.0 |
| `page-about` | agent fan-out | 1 | 1 | 2 | rounds | 15 | 0.6 |
| `content-work` | human only | 0.5 | 1 | 2 | days |  | 1.1 |
| `content-writing` | human only | 0.25 | 0.5 | 1 | days |  | 0.5 |
| `content-music` | human only | 0.25 | 0.5 | 1 | days |  | 0.5 |
| `content-home-about` | human only | 0.1 | 0.25 | 0.5 | days |  | 0.3 |
| `seo-perf` | agent fan-out | 1 | 2 | 3 | rounds | 30 | 1.0 |
| `feed` | agent fan-out | 1 | 1 | 2 | rounds | 15 | 0.6 |
| `qa-pass` | human-led | 0.5 | 0.75 | 1.5 | days |  | 0.8 |
| `launch` | human-led | 0.25 | 0.5 | 1 | days |  | 0.5 |
| `tail` | human-led | 0.25 | 0.5 | 1 | days |  | 0.5 |

- Critical path: `preflight -> scaffold -> merge-desk -> shell -> page-work -> seo-perf -> qa-pass -> launch -> tail`
- Range on the path: 1.7 to 2.2 weeks (expected 1.9; 9.7 days)
- Staffing chosen: 1 engineer + agent fan-out
- Owner time: 72 hours at 30 hours a week, 2.4 weeks, against a floor of 1.9 weeks and an appetite of 2 weeks. Dave's call on 2026-11-06: do not worry horribly about the timing estimate; measure reality. The 21st unit, `merge-desk`, was added the same day at his request (run it like any project).
- First milestone (Home, Work, ResortPass case study live): floor 1.2 weeks, owner time 1.6 weeks (about 48 hours)
- Assumed: 0.5 days a round; 30 owner hours a week; join buffer 0.5 days; no days-estimated agent units, so no review fraction
- Route overrides: `scaffold` pinned human-led (foundation); `shell`, `page-work`, `page-writing`, `seo-perf` pinned agent fan-out (uncertainty 1; on the path only as the longest of parallel siblings)
- Reference class: Ramble, 36 units at 0.55 actual days per unit predicts 10.9 serial days; this plan's serial total is 20.1, 1.84 times that. Ramble's actuals closed at 29% of likely; if that holds here, the build units finish early and the writing and design units set the date.

## Time tracker

Two sources, kept apart in the `where` column of `docs/plan/time-log.csv`:

- **outside:** work Dave does away from Claude (reading, Figma, writing, console setup). Logged by hand with `scripts/track.sh start <unit>` and `scripts/track.sh stop`; `scripts/track.sh sum` totals minutes per unit.
- **inside:** owner minutes spent in Claude sessions, from message timestamps in the project's transcripts. Not logged by hand; extracted at each unit's close (starting point: the Ramble audit's `extract_messages.py` in the vault).

The Actuals table's Owner min column is the sum of both for the unit. A unit with an empty cell says which source is missing.

## Actuals

One row as each unit closes. Rounds come from the unit's check runs or verdict files, fails included; owner minutes from the owner's message timestamps. Leave a cell blank only when its source is missing, and say which.

| Unit | Started | Finished | Actual (days) | Expected (days) | Rounds | Owner min | Delta | Why |
|---|---|---|---|---|---|---|---|---|
| `preflight` | 2026-11-06 | 2026-11-06 | 0.1 | 0.5 | n/a (human only) | 33 (5 outside from `track.sh`, the timer row corrected to Dave's estimate; 28 inside from message timestamps) | -0.4 | The dry run moved every row that needs code or a running app to `scaffold`, `cms`, `merge-desk` and `seo-perf`; what was left was console clicks and three decisions |
| `design` | 2026-11-06 | 2026-11-06 | 0.2 | 1.5 | n/a (human only) | 59 (inside, from Dave's message timestamps in the design session; no `track.sh` row) | -1.3 | Figma dropped after the first rounds, so one rendering instead of two; seven option rounds on the artifact in one sitting |
| `scaffold` | 2026-11-06 | 2026-11-06 | 0.2 | 0.5 | 2 CI runs on PR #22 (the first blocked by a `.gitignore` conflict with `main`; then 9 of 10 green, OSV failing on a missing base lockfile) | 24 (inside, from Dave's message timestamps; no `track.sh` row) | -0.3 | A `senior` subagent built it in one pass (6 min agent time); Dave's minutes were the push, PR, Vercel import and merge |
| `merge-desk` | 2026-11-06 | 2026-11-07 | 0.1 | 1.1 | 1 CI run set on PR #25 (head 84bdaa2), all green; no review verdict files (human-led); dry run PRs #26 to #28 not counted | blank (no `track.sh` row; Dave's message timestamps for the unit are in another session's transcript, not read here) | -1.0 | Start is ADR 0001 acceptance (22:59 ET), finish is the dry run merge of #26 (23:56 ET). ADR amendments plus ported scripts went in one PR; three gaps found in review were fixed before the first agent PR |
| `shell` | 2026-11-07 | 2026-11-07 | 0.5 | 1.2 | 5 review runs: 2 on PR #29 (2e91bde failed spec-compliance and a11y-audit, a4ee027 passed) and 3 `/review-pr` runs on PR #30 (2f38672, cc69a61, 13ac9c6, the last all six APPROVE or advisory), plus 1 CI fix (osv `glob` override) | about 85 (inside only: Dave's shell-related message timestamps, 04:56 to 16:34 UTC, each gap capped at 10 min; 163 if every message in the window counts, which includes ADR 0002, the App-writes follow-up and the keystatic spike; 0 outside, no `track.sh` row for `shell`) | -0.7 | PR #29 opened 05:15 UTC, PR #30 merged 16:34 UTC. Within the likely 2 rounds a PR; the two token fixes and the three round-3 advisories were small. Images deferred by Dave |
| `cms` | 2026-11-07 | 2026-11-08 | 1.0 | 1.1 | 1 CI run set on PR #35 (head before squash c080f48), 14 of 14 checks green; PR #34 closed unmerged and replaced by #35; no review verdict files (human-led) | blank (no `track.sh` row; Dave's message timestamps for the unit are in the `/senior #7` session transcript, not read here) | -0.1 | Within 25% of expected. The spike findings were already in the issue, so the build was one pass; Dave's console steps (GitHub App, three Vercel secrets) and a live GitHub-mode edit (28e5079, reverted in #36) closed it. Criterion 5 (secrets live nowhere else) awaits Dave |
| `page-about` | 2026-11-11 | 2026-11-11 | 0.1 | 0.6 | 1 review run (review APPROVE_WITH_NITS, spec-compliance, a11y-audit, architecture-audit and perf-check APPROVE; `qa-agent` posted by the PM from a browser-pane check); 1 CI run set on PR #52 (head ad42b72), 15 of 15 green | blank (no `track.sh` row; Dave's approval time is not measured here) | -0.5 | Smallest page; one senior built it in about 3 minutes. The delay to merge was PR authorship (the first branch carried a bookkeeping commit and Dave opened the earlier PRs under his own login), not the unit |
| `page-home` | 2026-11-11 | 2026-11-11 | 0.1 | 0.6 | 1 review run (review APPROVE_WITH_NITS, spec-compliance and a11y-audit APPROVE, `qa-agent` by the PM); 1 CI run set on PR #54 (head 0869a8b), 15 of 15 green including the e2e smoke and axe job | blank (no `track.sh` row) | -0.5 | One senior pass; the Playwright browsers were not installed in the agent's sandbox, so the axe criterion was proven by the CI e2e job |
| `page-music` | 2026-11-11 | 2026-11-11 | 0.1 | 1.0 | 1 review run (review APPROVE_WITH_NITS, spec-compliance and a11y-audit APPROVE, `qa-agent` by the PM in the browser pane); 1 CI run set on PR #55 (head 4d92978), 15 of 15 green | blank (no `track.sh` row) | -0.9 | The agent measured CLS 0 in a browser before PR; the Lighthouse assertion moved to `seo-perf` (DECISIONS 2026-11-11) |
| `page-writing` | 2026-11-11 | 2026-11-11 | 0.2 | 1.1 | 1 review run (review APPROVE_WITH_NITS, spec-compliance and a11y-audit APPROVE, `qa-agent` by the PM); 2 CI run sets on PR #56: head b8ae115 failed lint and knip, head 4ddc630 15 of 15 green | blank (no `track.sh` row) | -0.9 | The first push failed lint on `PageProps<...>` types (generated by `next typegen`, absent on a clean checkout) and knip on an unused export; one fix commit. Same lint cause as `page-work` (#53) |
| `page-work` | 2026-11-11 | 2026-11-11 | 0.2 | 1.1 | 2 review runs (round 1 at 2a1f2a0: review APPROVE_WITH_NITS, a11y-audit and perf-check APPROVE, spec-compliance REQUEST_CHANGES on criterion 5, architecture-audit REQUEST_CHANGES; round 2 at 26a150f: review, spec-compliance, a11y-audit APPROVE, `qa-agent` by the PM); 3 CI run sets on PR #53: head 078355b failed lint, head 2a1f2a0 green, head 26a150f green | blank (no `track.sh` row) | -0.9 | First push failed lint on `PageProps<...>` types (generated by `next typegen`, absent on a clean checkout); the spec-compliance failure on AC 5 was resolved by an owner amendment (DECISIONS 2026-11-11), the `aria-labelledby` ids with spaces were fixed in round 2 |

## Calibration

Once, after the third agent-built unit merges (likely `shell`, `page-home`, `page-about`). Set the medians below into `plan.json`, set `assumptions.calibrated`, run the script, and add the result as a Re-estimate row.

| Date | Units measured | Median rounds | Median days a round | Median owner min | Owner hours a week (so far) | New path range | New owner-time weeks |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

## Measures

One row a week. Targets are starting points for an agent-built project; set the project's own at the launch check.

| Week of | Owner hours | Orchestrator share of cost (Opus share) | Rounds per unit, median / p90 | Defects after merge per merged PR (found by eye) | Owner queue: open / oldest (days) | Starting context / status file size | Repeated corrections |
|---|---|---|---|---|---|---|---|
| Target | at or under 30 | under 30% (Opus only in design chats) | 1 / 2 | under 1 (0) | 5 / 3 | under 50K / under 25 KB | 0 |
| | | | | | | | |

How each is collected:
- **Owner hours:** `scripts/track.sh sum` for outside work, plus the owner's message timestamps across the project's transcripts for inside work (starting point: the Ramble audit's `extract_messages.py` in the vault).
- **Cost shares:** `~/.claude/bin/token-audit --by agent --project defaultdave`.
- **Rounds:** verdict files in `.team-verdicts/` or check runs per unit, fails included.
- **Defects after merge:** issues filed against merged code, divided by PRs merged that week; separately, defects Dave found by looking.
- **Owner queue:** open items waiting on Dave, with the date each was raised.
- **Starting context / status file:** not applicable unless a status file is introduced; if one is, `wc -c` on it.
- **Repeated corrections:** owner messages that repeat a correction already given; any count above 0 becomes a check, not more prose.

## Re-estimates

One row per milestone, after updating `plan.json` and running the script again.

| Date | Milestone | Remaining range (weeks) | Owner-time weeks | What changed |
|---|---|---|---|---|
| 2026-11-06 | 0 Designed (scope change, not a milestone) | 1.7 to 2.2 (unchanged) | 2.4 (unchanged) | `preflight` split after its dry run: rows that need code or a running app moved to `cms` (Keystatic App and secrets, new criterion), `scaffold` (Vercel project, local and preview rows), `merge-desk` (ruleset, agent access) and `seo-perf` (analytics). Tickets 01 and 07 and `plan.json` notes updated; estimates and routes unchanged, report rerun with no change |
| 2026-11-06 | 1 Walkable (scope change, not a milestone) | 1.7 to 2.2 (unchanged) | 2.4 (unchanged) | ADR 0001 accepted with eight amendments; issue #5 amended (branch pattern, bypass mode `always`, wider bookkeeping paths, bookkeeping "not applicable" checks in `post-check.ts`, sandbox exclusion, CodeQL, Gitleaks and OSV required). Small additions inside the existing scripts; `merge-desk` estimate and `plan.json` unchanged |
| 2026-11-06 | 0 Designed (scope change, not a milestone) | 1.7 to 2.2 (unchanged) | 2.4 (unchanged) | One shared agents App instead of a new one: tickets 01 and 05 reworded, `merge-desk` gains a repo-restricted token criterion; ADR 0001 (still Proposed) amended. Estimates unchanged |
| 2026-11-07 | 1 Walkable (scope change, not a milestone) | not recomputed | not recomputed | Added outside the plan: `merge-desk` follow-up, App-backed issue and PR write commands in `agent-git.ts` (DECISIONS 2026-11-07); `keystatic-spike` criterion 1 re-routed to a `senior` |
| 2026-11-07 | 1 Walkable (scope change, not a milestone) | 1.7 to 2.2 (unchanged); report not rerun | 2.4 (unchanged) | `keystatic-spike` closed: GitHub mode passed, so the `cms` estimate (0.5 / 1 / 2 days) and scores stay; `plan.json` notes only. `plan.mjs` now rejects `plan.json` (unit `preflight` kind, and `rounds` estimates on `shell`, `page-*`, `seo-perf`, `feed` need days), so `plan-report.md` is as of 2026-11-06; fix before the next real re-estimate |
| 2026-11-11 | 1 Walkable (scope change, not a milestone) | 1.7 to 2.2 (unchanged); report not rerun | 2.4 (unchanged) | AC 5 of #9 and the Lighthouse assertion of #11 deferred to `seo-perf` (#17): `seo-perf` gains a Lighthouse CI config, `Figure` image sizing, CSP frame origins and sitemap routes. `seo-perf` estimate not changed yet; Dave to confirm it before the unit starts. `plan.json` not edited (the `plan.mjs` rejection is open in STATUS) |

## Read-back

Written when the tail unit closes.

- Furthest off, by how much, and why:
- Work that was never on the plan:
- Measured: days a round, owner minutes per agent-built unit, owner hours a week:
- Measures that missed their target, and what changed because of it:
- Change to make to the next plan:
- Reference-class entry for the next plan: `{ "name": "davidfleming.me portfolio", "units": 21, "days": <actual serial days> }`
| 2026-11-06 | 0 Designed reached | not recomputed: `plan.mjs` takes no actuals; `preflight` and `design` closed 1.7 days under their expected 2.0 | 2.4 (not recomputed) | Figma dropped from `design` (scope cut); `shell` (#6) amended to build to the artifact and its token map; `plan.json` notes updated. Storybook named but not added to any unit (open, Blocked on Dave) |
| 2026-11-06 | 1 Walkable (scope change, not a milestone) | 1.7 to 2.2 (unchanged); critical path 1.9 to 2.0 | 2.4 (unchanged) | Storybook added to `shell` (#6): rounds 1 / 2 / 5 (was 1 / 2 / 4), owner minutes 75 (was 60). Issue amended, `plan.json` updated, report rerun |
