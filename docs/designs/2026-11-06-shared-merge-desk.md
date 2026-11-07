# Design: one shared merge-desk engine for Dave's projects

Status: Draft for Dave's decision · 2026-11-06 · Repos `defaultdave/defaultdave` and `defaultdave/ramble` · Rules of record: ADR 0001 (this repo), ADR 0010 and `docs/plan/merge-desk-runbook.md` (Ramble)

Sources read: Ramble's `scripts/merge-desk/` at `9efeb48`, this repo's `scripts/merge-desk/` and `.github/workflows/scope-manifest.yml` on `unit/merge-desk` (PR #25, open, not merged when this was written), ADR 0001 as amended in PR #25, Ramble ADR 0010, Ramble's merge-desk runbook, `docs/plan/DECISIONS.md` (2026-11-06 rows), and `vig/global/skills/plan-project/references/project-setup.md`.

## Problem Statement

Every project that runs agents under the merge rule carries its own copy of the guard that judges those agents: token minting, the guarded push and PR path, check posting, and the scope rule. Two copies exist after one port, and they already disagree on things that matter. Ramble's tokens are not restricted to its repo, so a Ramble agent can post a passing check on a portfolio PR. Ramble's `post-check.ts` still accepts a hand-picked `--conclusion success`, which ADR 0001 rule 5 forbids here. A fix made in one copy does not reach the other, and the plan-project runbook tells every new project to port a third copy.

The guard also lives where the agents work. The merge-desk commands run outside the sandbox because they read the App key, but they run from the agent's own working tree. An agent that edits `scripts/merge-desk/agent-git.ts` locally and then runs it gets arbitrary code outside the sandbox with the key readable. The protected-path rule stops that edit from merging. It does not stop the edit from running.

## Goals / Non-Goals

**Goals**

- One copy of the engine, in a repo only Dave can push to, used by every project.
- Each project keeps only what GitHub or the project must hold: its workflow files and one small config file.
- What judges a project's PRs changes only when Dave moves that project's pin. A change to the shared repo alone changes nothing anywhere.
- The commands that run outside the sandbox run code the sandbox cannot write.
- The portfolio's critical path (page swarm after `scaffold`, `merge-desk`, `cms`) is not delayed by any step here.

**Non-Goals**

- Changing the merge rule itself: tiers, required checks, approval window, bypass mode and bookkeeping rules stay as each project's ADR has them.
- A hosted service (a webhook App that posts `scope-manifest` itself). Possible later; not needed to remove the copies.
- Moving PM state out of the project repos. That is the `ramble-pm` precedent, but a separate question.
- Merging the vig squad merge desk (`/merge-desk` in vig) with this engine.
- Moving the agent checks to GitHub Actions. ADR 0001 Alternatives already parks that.
- Writing the engine or editing ADRs, workflows or settings. This doc proposes; units implement.

## What is engine and what is config

The two copies share one design. Most of the line-count difference is formatting (Prettier here, none on Ramble) and runtime (Node type stripping here, Bun on Ramble). Below, "engine" is logic that would be identical in every project; "config" is what a project declares.

### `app-token.ts`

| Engine | Config |
|---|---|
| `KEY=VALUE` conf parsing, RS256 App JWT (`iat` minus 60 s, `exp` plus 9 min, `iss` Client ID or App ID), installation-token request, discard a token that came back with more repositories than asked (portfolio only today) | The repo the token is restricted to (`defaultdave` here; Ramble asks for none, so its tokens reach every repo on the installation) |
| | Conf location and key names: here `~/.config/defaultdave-agents/app.conf` with `APP_ID`, `APP_INSTALLATION_ID`, `APP_KEY`, `APP_CLIENT_ID`; Ramble `~/.config/ramble-agents/app.conf` with `RAMBLE_`-prefixed keys. One App since the rename (DECISIONS 2026-11-06), so this should become one conf, not config |

### `agent-git.ts`

| Engine | Config |
|---|---|
| Token passed to git through `GIT_CONFIG_*` env (never in a URL or argv), HTTPS-only push URL check, `push`, `pr`, `automerge`, `review`, refusal of flag-like targets, `Refused` exit code 2, injected `Deps` for tests | `REPO` and `REVIEWER` |
| | Branch patterns: here `unit/<id>[-slug]`, `pm/<slug>`, `revert/pr-<n>`; Ramble also `sync/…`, with unit ids `U-<n><letters>` |
| | Allowed bases: `main` here; `main` and `integration` on Ramble |
| | Heads never merged by an agent: `integration` on Ramble (promotion) |
| | Merge method rule: squash everywhere, except Ramble's sync PRs (`main` or `sync/*` into `integration`), which use a merge commit |
| Differences that should be settled once, in the engine: the portfolio refuses a PR or auto-merge whose head is not an agent branch; Ramble checks only "not `integration`" and "head is not base". Take the portfolio's stricter form. | |

### `post-check.ts`

| Engine | Config |
|---|---|
| Check-run body validation (name in list, conclusion `success` or `failure`, full 40-char sha, 65,000-char summary), posting as the App | `REPO` |
| Verdict mode (portfolio only): reads `.team-verdicts/<agent>.md`, maps each global agent's verdict key (`REVIEW_VERDICT`, `QA_VERDICT`, `SPEC_COMPLIANCE_VERDICT`, `A11Y_VERDICT`, `ARCH_VERDICT`, `PERF_VERDICT`) to a conclusion, refuses `BLOCKED` or no line, refuses a sha that is not the checked-out commit. The verdict keys belong to the global agents in `vig/global/agents/`, so the map is engine, not project | Which checks are required and which advisory: here `review-agent`, `qa-agent`, `spec-compliance`, `a11y-audit` required, `architecture-audit` and `perf-check` advisory; Ramble requires `architecture-audit` instead of `a11y-audit` |
| Bookkeeping mode (portfolio only): re-runs the scope rule on the PR's live file list and head, then posts the required checks as "not applicable: bookkeeping only" | Whether bookkeeping mode is on (ADR 0001 rule 6; Ramble has no such rule yet) |
| Ramble's raw `--name --conclusion --summary-file` mode is removed. It is a by-hand green, which ADR 0001 rule 5 forbids. | |

### `scope-check.ts`

| Engine | Config |
|---|---|
| Title parse, `Revert: ` handling, branch and title must name the same unit, bookkeeping title prefix, bookkeeping allowlist, protected paths compared case-insensitively (a trailing `/` means folder, anything else one exact file, the portfolio's form), changed files from `git diff --name-only -z --no-renames base...head`, exit 0 or 1 with one reason line | Where unit ids come from: `docs/plan/plan.json` `units[].id` here; `docs/plan/units.yaml` `units[].id` with a `review` tier field on Ramble |
| | Unit id shape: `[a-z0-9][a-z0-9-]*` here; `U-[0-9]+[a-z]*` on Ramble |
| | Protected paths (the same six in both today: `.github/`, `.claude/`, `CLAUDE.md`, `scripts/merge-desk/`, `docs/adr/`, `docs/plan/`) |
| | Bookkeeping files and prefixes: here six `docs/plan/` files plus `.claude/agent-memory/portfolio-pm/`; Ramble `units.yaml`, `STATUS.md`, `delta-log.md` |
| | Files that need a `delta-log.md` row (here `plan.json`, `plan-report.md`) |
| Field-level diff of a structured plan file (Ramble: bookkeeping may change only `status`, `actual_days`, `dave_minutes`, `tokens`, `note` in `units.yaml`). Generic: "in file F, a bookkeeping PR may change only fields X" | The file and its allowed fields |
| Tier routing, promotion refusal, sync PR rule and the "carries integration commits" probe (Ramble only). Generic once expressed as: a tier field, a base per tier, a promotion pair Dave merges, a sync rule | Ramble declares two tiers, `integration`, promotion and sync; the portfolio declares none |

### Shell scripts and settings

| File | Engine | Config |
|---|---|---|
| `revert.sh` | Refuse a non-number, refuse a merge commit (more than one parent), branch `revert/pr-<n>`, revert, push, PR, review request, auto-merge. Take the portfolio's form (`--repo` on every read, number check, review request) | Repo; which bases a revert may target |
| `approval-window.sh` | Read the ruleset, set approvals and dismiss-on-push, write it back | Which rulesets: by name here (`main: merge desk`), by hard-coded ids `25513279` and `25513280` on Ramble. Select by name everywhere |
| `ruleset-main.json` | None; it is data | Ruleset name, required CI and security check names (pinned to GitHub Actions, `integration_id` 15368), agent check names (pinned to the App id). Ramble keeps its ruleset only inline in the runbook |
| `settings.local.proposal.json` | None | The four allowed and sandbox-excluded commands, which today name repo-relative script paths and the runtime (`node` here, `bun` on Ramble) |
| `scope-manifest.yml` | The job shape (see below) | Branches it runs on (`main` here; `main`, `integration` on Ramble), runtime setup |

Two runtime facts the engine has to absorb: Ramble's `scope-check.ts` parses YAML with `Bun.YAML`, which Node lacks, and the portfolio's copy is pure `node:` built-ins. Everything else in both copies runs on either runtime.

## Proposed Solution

### Shape

```
defaultdave/merge-desk            (new, Dave-only push; App not installed)
  engine/        app-token, agent-git, post-check, scope-check, revert, approval-window, config loader
  install        Dave's command: puts a pinned engine where the sandbox cannot write
  ruleset        renders a project's ruleset JSON from its config
  tests/         engine tests, plus one fixture set per known project config

each project repo
  .github/workflows/scope-manifest.yml   (GitHub requires it here; Dave's push only)
  .github/merge-desk.json                (the small config file, with the engine pin)
  everything else under scripts/merge-desk/ is deleted

Dave's machine
  ~/.local/share/defaultdave-merge-desk/<sha>/          one read-only engine per pinned sha
  ~/.local/share/defaultdave-merge-desk/bin/<project>/  per-project launchers, generated by install
  ~/.config/defaultdave-agents/app.conf                 one conf for the one App
```

### The config file

One JSON file per project at `.github/merge-desk.json`. Under `.github/` because both projects already protect that folder in `scope-manifest`, so an agent's PR cannot change the file, and the check reads it from the base branch, so a PR cannot change its own judge. Its shape, as a type signature only:

```ts
interface MergeDeskConfig {
  engine: { repo: "defaultdave/merge-desk"; sha: string }; // the pin, full 40-char sha
  repo: `${string}/${string}`;
  reviewer: string;
  runtime: "node" | "bun";
  units: {
    source: { kind: "json" | "yaml"; path: string; idField: string; tierField?: string };
    idPattern: string;
  };
  branches: { unit: string; pm: string; revert: string; sync?: string };
  tiers?: Record<string, { base: string }>;        // absent: one tier, base "main"
  promotion?: { head: string; base: string };       // Dave merges; agents never
  protectedPaths: string[];                         // "/" suffix = folder
  bookkeeping: {
    titlePrefix: string;
    files: string[];
    prefixes: string[];
    needsDeltaLog?: { files: string[]; log: string };
    fieldRules?: { file: string; allowedFields: string[] }[];
    notApplicableChecks: boolean;                   // ADR 0001 rule 6
  };
  checks: {
    ci: string[];                                   // pinned to GitHub Actions in the ruleset
    agentRequired: string[];
    agentAdvisory: string[];
  };
  rulesets: { name: string; branch: string }[];
}
```

The App conf path, the verdict keys and the GitHub API details are engine constants, not config.

### What has to stay in each repo

- **`.github/workflows/scope-manifest.yml`.** GitHub runs workflows only from the repo's own `.github/workflows/`. The App has no Workflows permission, so only Dave can change it. The other CI and security workflows stay as they are.
- **`.github/merge-desk.json`.** The config above.
- **The check names in the live ruleset.** Rulesets are GitHub settings, not files. The shared repo renders the JSON from the config, and Dave applies it with his login as today.
- Each project's ADR and runbook, which now point at the shared repo for the engine instead of describing scripts in the tree.

### `scope-manifest` on `pull_request_target`, pinned

The job keeps its name, `scope-manifest`, so no ruleset changes. It keeps the current guarantees (runs from the base branch, reads PR metadata only, executes nothing from the PR) and adds a second checkout:

1. Check out the base branch, as today, with full history.
2. Read `engine.sha` from the base branch's `.github/merge-desk.json`. Refuse anything that is not a full 40-character sha, so a branch or tag name cannot slip in.
3. Check out `defaultdave/merge-desk` at that sha into a folder outside the project tree, without persisting credentials.
4. Fetch the PR head as a ref, as today.
5. Set up the runtime from the config (Node from `.nvmrc`; Bun on Ramble), with no package install. The engine has no dependencies, so nothing is fetched at run time beyond the pinned checkout.
6. Run the engine's scope check with the config path and the same env (`PR_TITLE`, `BASE_REF`, `HEAD_REF`, `PR_HEAD`).

Why the pin is a sha in the project, not a branch or tag in the shared repo: with `ref: main` (or a movable tag), one push to the shared repo would change what judges every project's open PRs at once, without a commit in any project showing it. With the sha in each project's base branch, the judge changes only through a commit Dave makes to that project, which shows up in its history and can be reverted alone. Projects move one at a time.

The pin lives in the config file, not as a literal in the workflow, so CI and Dave's local install read the same value. The workflow file still needs Dave's push for anything else.

A reusable workflow (`uses: defaultdave/merge-desk/...@<sha>`) was considered and set aside; see Alternatives.

### Sandbox allow and exclude paths

Today `.claude/settings.local.json` (gitignored, Dave applies) allows and excludes from the sandbox four repo-relative commands, `node scripts/merge-desk/agent-git.ts`, `post-check.ts`, `app-token.ts` and `revert.sh`. Those paths resolve inside the working tree, which the sandbox can write (`.` and all of `/Users/davidfleming/Workspace` are in its write allowlist).

After extraction:

- `install <project>` (Dave runs it, outside any agent session) fetches the engine at the project's pinned sha into `~/.local/share/defaultdave-merge-desk/<sha>/`, makes it read-only, and writes per-project launchers to `~/.local/share/defaultdave-merge-desk/bin/<project>/`: `agent-git`, `post-check`, `app-token`, `revert`. That folder is outside the sandbox's write allowlist.
- Each launcher fixes the project (repo name and token restriction) and the engine sha inside itself, clears `NODE_OPTIONS`, `NODE_PATH` and similar loader variables before starting the runtime, and reads the project's config from a copy that `install` snapshotted from `origin/main`. If the working-tree config differs from the snapshot, it warns and uses the snapshot.
- `.claude/settings.local.json` then allows and excludes exactly those four absolute launcher paths, for example `/Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/agent-git`. Nothing repo-relative stays in either list.
- Dave adds the install folder to the file tools' deny rules (`Edit` and `Write`), so the sandbox is not the only barrier between an agent and the engine it runs.

What this fixes: an agent can no longer rewrite the code that runs outside the sandbox. And because the launcher, not an argument, names the project, a Ramble session cannot mint a portfolio token, since the portfolio launcher is not on Ramble's allow or exclude list.

What it does not fix on its own: the excluded commands still run git over the agent's working tree and `.git` (see Security Considerations).

### The shared repo's own ruleset

`defaultdave/merge-desk` is the guard that judges the agents, so agents must not be able to change it:

- **The App is not installed on it.** The installation stays on "only select repositories". This is the main control: with no installation, no App token can reach the repo at all.
- **A ruleset on `main`:** no deletion, no force push, and restrict updates, with the repository admin role (Dave) as the only bypass actor. On a personal repo only Dave has write access anyway; the ruleset also guards against a later collaborator or a misconfigured install.
- **Its own CI** runs the engine tests under Node and Bun on every push. It is advisory for Dave, since he is the only writer, but a pin should point at a green sha. `install` refuses a sha whose combined status is not green.
- **No agent edits.** Agents may draft engine changes as patches in a scratch clone and print the diff. Dave reviews, commits and pushes from his own login, where `git push` prompts every time. Dave's development clone should sit outside the sandbox write allowlist, or in its deny list, as `vig/global/skills` already is.
- **Pins as the second gate.** Even a bad commit on the shared `main` reaches no project until Dave bumps that project's `engine.sha`. That bump is a commit Dave makes to `.github/merge-desk.json`, and the project's own `scope-manifest` rejects it from an agent, since `.github/` is protected.

### What changes in ADR 0001 (and the matching Ramble rules)

Proposed wording for Dave to accept or amend; this doc edits neither ADR.

- **Rule 1, Identity.** "Agents act as the `defaultdave-agents` App through the shared engine (`defaultdave/merge-desk`) at the sha pinned in `.github/merge-desk.json`, via the per-project launchers in `~/.local/share/defaultdave-merge-desk/bin/defaultdave/`. `.claude/settings.local.json` allows and sandbox-excludes exactly those four launchers. The engine is installed read-only, outside every path the sandbox can write." The App permissions sentence, the `.pem` sentence and "Nothing else in a session reads the key" stay.
- **Rule 8, Protected paths.** The list stays as it is. `scripts/merge-desk/` stays in it after the folder is deleted, so a re-added local copy fails `scope-manifest`. `.github/merge-desk.json` is already covered by `.github/`. Add one sentence: "The engine's code is protected by the shared repo's ruleset and by the pin, not by this list."
- **Follow-on edits** that name `scripts/merge-desk/`: rules 5, 6, 7 and 10, the Consequences bullet on the merge-desk commands running outside the sandbox, and the Ramble-tokens bullet. The tokens bullet resolves once Ramble runs the shared engine, because token restriction becomes engine behaviour.
- **Ramble.** ADR 0010 has no numbered rules. Its merge-rule section names "a merge desk" as a precondition, and the equivalents of rules 1 and 8 are in `docs/plan/merge-desk-runbook.md`: section A and B1 (identity, `agent-git.ts`) and B1 check 4 (protected paths and bookkeeping files). The same two edits apply there, plus the conf change from `~/.config/ramble-agents/` with `RAMBLE_` keys to the shared `defaultdave-agents` conf. Ramble's D1 settings block changes the same way as this repo's.
- **The plan-project runbook** (`vig/global/skills/plan-project/references/project-setup.md`, sections D to F) changes from "port the scripts" to "write the config, add the workflow, run `install`". That is a vig change and out of scope here.

## Alternatives Considered

- **Keep a copy per project and sync by hand (status quo).** Rejected. After one port the copies already differ on token restriction, by-hand posting, PR head checks and revert safety, and every new project adds a copy.
- **An npm package** (GitHub Packages or npm), versioned. Rejected. It adds a registry credential and a package install inside a `pull_request_target` job. Locally, the code would sit in `node_modules`, inside the agent-writable tree, so it would keep the tampering problem.
- **A git submodule pinned in each project.** The pin is good: the gitlink is a file change in a protected path. Rejected anyway. The working-tree copy is still agent-writable, and submodules add friction to the worktree-per-unit flow every agent uses.
- **A reusable workflow** called at a sha. Set aside for now. GitHub names a called job's check `<caller> / <called>`, which would rename `scope-manifest` in both rulesets: the same trap the README flags for `scan-pr`. A public caller also cannot call a workflow in a private repo. It does not cover the local commands either, so the engine checkout is needed regardless.
- **Put the engine in `vig/global/`,** beside the agents whose verdicts it posts. Rejected. vig is a repo agents build in, with its own squad merge desk, and its `main` moves for reasons unrelated to the guard, so pins would churn. The guard should sit in a repo whose only writer is Dave.
- **One App per project** (the PM's earlier recommendation). Not reopened: Dave chose one App on 2026-11-06. The engine's per-project token restriction is what makes one App safe.

## Implementation Phases

Ordered so the portfolio's critical path never waits on this work.

0. **Now, unchanged.** Dave merges PR #25 as is, by bypass. Settings, auto-merge setting, ruleset and dry run follow as the README says. The page swarm runs on the in-repo copy. Nothing below blocks it.
1. **Ramble token restriction, separately and soon.** A small Ramble change gives its `app-token.ts` the portfolio's repository restriction. It is the precondition for closing this repo's approval window (ADR 0001 Consequences) and should not wait for the extraction. It touches `scripts/merge-desk/`, so it lands by Dave's bypass on Ramble.
2. **Build the shared repo, off the critical path.** Seed it from the portfolio copy, the more hardened one. Add the config loader, the tier, promotion and sync features from Ramble, the field-rule feature, the launchers, `install` and `ruleset`, plus fixture tests for both projects' configs. Port both copies' tests; every Ramble scope-check case must pass against Ramble's config. Dave creates the repo, its ruleset and its CI.
3. **Shadow run on the portfolio.** Dave adds a second workflow, `scope-manifest-shared`, that runs the pinned engine and posts a check the ruleset does not require. It runs beside the real `scope-manifest` until both agree on a set number of PRs (open question 4), bookkeeping and revert PRs included.
4. **Portfolio cutover, in a gap.** At a point with no unit PR in flight (after the page swarm merges, or between units), Dave lands one bypass PR: `scope-manifest.yml` runs the engine and keeps its name, the shadow workflow goes, `.github/merge-desk.json` is added and `scripts/merge-desk/` is deleted. He then runs `install defaultdave` and swaps the settings to the launcher paths, and the ADR 0001 amendment lands as bookkeeping. Rollback is one revert of that PR plus the old settings block.
5. **Ramble shadow, then cutover,** after its launch-ready milestone (Dec 2, late case Dec 8), not during the Sprint 2 stabilization. It follows the same steps, plus the conf move and Ramble's runbook edits. The cutover is also when Ramble's by-hand `post-check --conclusion` callers (`ramble-pm.md`, the runbook, the nightly self-improvement task) move to verdict mode.
6. **Later projects** start on the engine. The plan-project runbook is updated in vig.

## Testing Strategy

- **Engine unit tests:** the union of both copies' tests (about 1,000 lines on the portfolio side, 500 on Ramble's), run under Node and Bun in the shared repo's CI.
- **Config fixtures:** for each project config, a table of titles, branches, bases and changed-file lists with the expected verdict, taken from both copies' current tests. The two configs together must reproduce every current verdict.
- **Config loader:** malformed or missing fields, a non-sha pin, unknown keys, a protected path without a trailing `/` matching only that exact file.
- **Launcher tests:** a launcher refuses a config whose `repo` differs from its own; `NODE_OPTIONS` set by the caller has no effect; `install` refuses a red sha and writes read-only files.
- **Shadow comparison** (phases 3 and 5): both checks on every PR, mismatches listed; cutover only after zero mismatches over the agreed count.
- **Dry run after each cutover,** as in the README's step 6: a `pm/dry-run` PR merges; a PR with one failing check does not; revert works; `agent-git push main` is refused; a run of the other project's launcher from this repo is refused or prompts.
- **Ruleset render:** for each project, the rendered JSON equals the live ruleset (`gh api .../rulesets/<id>`) apart from ids and timestamps.

## Security Considerations

- **Judge integrity.** Three layers: the App is not installed on the shared repo; the pin is a sha in each project's protected `.github/`; `scope-manifest` reads config and engine only from the base branch and the pinned checkout, and runs nothing from the PR.
- **Tamper-proof local engine.** The excluded commands resolve to read-only files outside the sandbox write allowlist, behind file-tool deny rules.
- **Cross-project tokens.** The launcher fixes the repo the token is restricted to. Since one App now spans several repos, this becomes the main control on cross-project spoofing, in place of each copy remembering to restrict.
- **Found while writing, not tested, and present in both current copies:** the excluded commands run `git` unsandboxed over the agent's `.git`, which the sandbox can write. `git push` runs the repo's `pre-push` hook, and `revert.sh`'s `git switch` runs `post-checkout`. Both run with the key readable, and the push hook also sees the auth header in the environment. Repo-level git config (`core.hooksPath`, `core.fsmonitor`, `http.proxy` with `http.sslVerify=false`) gives the same reach. Moving the engine does not close this. The engine should run every git call with hooks and fsmonitor off and TLS verification forced on. `revert` should do its git work in a fresh temporary clone the engine controls, not in the agent's checkout. This hardening is worth doing in PR #25's copy and Ramble's now, as its own change, not only at extraction.
- **Supply chain.** No dependencies in the engine; pinned action shas in the workflow (the portfolio pins them, Ramble's `scope-manifest.yml` uses `@v7` and `@v2` tags and should be pinned at cutover).
- **Secrets.** None in the shared repo or the config. The App key stays at the path in `app.conf`, readable only by the launchers.

## Open Questions

1. **Public or private shared repo?** Public is recommended: the CI checkout of a private repo needs a token or deploy key inside a `pull_request_target` job, which is the riskiest place to put a secret. The engine holds no secrets, and the portfolio is public already.
2. **Name.** `defaultdave/merge-desk` matches the folder name but collides with vig's `/merge-desk` command, which is a different thing. `defaultdave/agent-gate` avoids that.
3. **Runtime for Ramble.** Keep Bun for Ramble's jobs and launchers, so `Bun.YAML` reads `units.yaml`, or have Ramble also emit a JSON units file so the engine is Node-only. Bun is the smaller change; Node-only is the simpler engine.
4. **Shadow length.** A count of PRs (say 15, with at least one bookkeeping and one revert) or a time box.
5. **Does `sandbox.excludedCommands` match on a full absolute path exactly as written?** The launcher design assumes it does. Verify in a terminal `claude` session before phase 4.
6. **Local config source.** The snapshot taken at `install` is safe but needs a re-install after Dave changes the config. Reading the working-tree copy is convenient but agent-writable, with CI as the only backstop. The snapshot is recommended.
7. **Ruleset ownership.** Render from config (recommended: check names declared once) or keep a hand-kept JSON per project.
8. **Bookkeeping "not applicable" checks for Ramble.** The engine supports them; whether Ramble adopts ADR 0001 rule 6 is a Ramble decision.

## Recommendation

Accept the extraction as designed: a public, Dave-only shared repo with no App installation; a sha pin in each project's `.github/merge-desk.json`; per-project read-only launchers outside the sandbox's reach; the portfolio cut over first, in a gap after the page swarm; Ramble after its December milestone. Do phase 1 (Ramble token restriction) and the git-hardening item from Security Considerations now, as separate changes, since both close live gaps that the extraction would otherwise leave open for weeks. Merge PR #25 as is.

## Handoff Checklist

- [ ] Dave accepts, amends or rejects this design and answers open questions 1 to 3 and 5.
- [ ] Phase 1 (Ramble token restriction) ticketed in Ramble.
- [ ] Git-hardening follow-up ticketed against this repo's and Ramble's copies.
- [ ] Shared repo created by Dave, with its ruleset and CI, and the App installation confirmed to exclude it.
- [ ] Engine unit written with a scope manifest (phase 2), with both projects' configs as fixtures.
- [ ] ADR 0001 amendment text (rule 1, rule 8, follow-on edits) and the Ramble runbook edits drafted for Dave at cutover time.
- [ ] Cutover gap chosen with the portfolio PM against the page-swarm schedule.
