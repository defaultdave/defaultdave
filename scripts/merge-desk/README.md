# merge-desk

How agents push, open PRs, post review verdicts and queue auto-merge on `defaultdave/defaultdave` as the `defaultdave-agents` GitHub App, never with Dave's login. The rules of record are `docs/adr/0001-agent-workflow-and-merge-rule.md`. One tier: every PR targets `main`.

Scripts run on Node (type stripping, no build): `node scripts/merge-desk/<script>.ts`. Tests are `*.test.ts` beside each script and run in `pnpm test`.

| Script                       | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app-token.ts`               | Mints a one-hour installation token from `~/.config/defaultdave-agents/app.conf` (`APP_ID`, `APP_INSTALLATION_ID`, `APP_KEY`, optional `APP_CLIENT_ID`), restricted to this repo through the `repositories` field. Prints only the token.                                                                                                                                                                                                                                                                                                                                                              |
| `agent-git.ts`               | `push <branch>`, `pr main <title> <body-file>`, `automerge <pr>`, `review <pr>`, `issue-comment <issue> --body '<text>'`, `issue-body <issue> --body '<text>'`, `pr-body <pr> --body '<text>'` (the last three take the body as one argument, read no stdin and no file, and refuse an empty body, one over 65,536 characters, `--body=<text>`, the `-` form and extra arguments; `pr` still takes a body-file path). Allows only `unit/<unit-id>[-<slug>]`, `pm/<slug>`, `revert/pr-<n>`; refuses `main`, any other base, non-HTTPS push URLs, and flag-like targets. Merges squash, never `--admin`. |
| `post-check.ts`              | `verdict --agent <name> --sha <sha>` posts `.team-verdicts/<name>.md` under its check name (`review` as `review-agent`, `qa` as `qa-agent`; `spec-compliance`, `a11y-audit`, `architecture-audit`, `perf-check` under their own). A missing file posts nothing; a file with no usable verdict line (or `BLOCKED`) posts nothing and exits 1. `bookkeeping --pr <n> --sha <sha>` posts the four required checks as "not applicable: bookkeeping only", and only when the scope rules pass the PR as bookkeeping on that head.                                                                           |
| `scope-check.ts`             | The `scope-manifest` check: title, branch, base and path rules (ADR rules 3, 6, 8). Unit ids come from `docs/plan/plan.json`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `revert.sh <pr>`             | Opens a revert PR on `revert/pr-<n>` through the same checks.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `approval-window.sh on\|off` | Dave only. Sets the ruleset's required approvals to 1 (dismissed on push) or 0.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

`.github/workflows/scope-manifest.yml` runs `scope-check.ts` on `pull_request_target`, from the base branch, against PR metadata only.

## What Dave runs

Each step needs Dave's `gh` login; the App cannot change settings. Nothing here has been applied.

1. **Auto-merge setting** (ADR rule 7), then read it back:

   ```bash
   gh repo edit defaultdave/defaultdave --enable-auto-merge --enable-squash-merge --delete-branch-on-merge
   gh api repos/defaultdave/defaultdave -q .allow_auto_merge
   ```

2. **Check names.** Open any recent PR's checks and confirm the names match `ruleset-main.json`. `scan-pr` is a job that calls a reusable workflow, and GitHub can name its check `scan-pr / <inner job>`; if it does, change that `context` to the name shown. A required name that never appears blocks every PR.

3. **Create the `main` ruleset.** This fills the four agent checks with the App id from `app.conf` and posts the result. Preview first by dropping the last line.

   ```bash
   source ~/.config/defaultdave-agents/app.conf
   jq --argjson app "$APP_ID" '(.rules[].parameters.required_status_checks[]? | select(.integration_id == "APP_ID") | .integration_id) = $app' scripts/merge-desk/ruleset-main.json |
     gh api -X POST repos/defaultdave/defaultdave/rulesets --input -
   ```

   Read it back: `gh api repos/defaultdave/defaultdave/rulesets`. It requires a PR, one approval dismissed on push, no force push or deletion, and the checks above. The only bypass actor is the repository admin role (`actor_id` 5) in mode `always`, so Dave can still push to `main` and merge any PR.

4. **Let the agents run the four commands outside the sandbox.** Copy the proposal into the gitignored local settings (merge by hand if the file already has entries):

   ```bash
   cp scripts/merge-desk/settings.local.proposal.json .claude/settings.local.json
   ```

   It allows, and excludes from the sandbox, only the four merge-desk commands. The App key is a `.pem` the sandbox cannot read, so these commands cannot run inside it; their own refusals are the guard on them.

5. **This unit's PR** merges by Dave's bypass, since the rule it sets up does not exist until it lands: `gh pr merge <n> --admin --squash --delete-branch`.

6. **Dry run** (after steps 1 to 4): a `pm/dry-run` PR merges after the checks and Dave's approval; a PR with one failing check does not; `revert.sh` works; `agent-git.ts push main` is refused.

7. **Closing the approval window** (`scripts/merge-desk/approval-window.sh off`) waits until Ramble's tokens are restricted to `defaultdave/ramble` (ADR Consequences).

## How an agent uses it

```bash
node scripts/merge-desk/agent-git.ts push unit/<unit-id>-<slug>
node scripts/merge-desk/agent-git.ts pr main "<unit-id>: <title>" <body-file>
node scripts/merge-desk/agent-git.ts review <pr>      # while the approval window is open
node scripts/merge-desk/agent-git.ts automerge <pr>
node scripts/merge-desk/agent-git.ts issue-comment <issue> --body '<text>'   # comment on an issue as the App
node scripts/merge-desk/agent-git.ts issue-body <issue> --body '<text>'      # replace an issue body (tick criteria, add an Amendment)
node scripts/merge-desk/agent-git.ts pr-body <pr> --body '<text>'            # replace a PR body
# after /review-pr <pr-url> writes .team-verdicts/*.md, for each agent:
node scripts/merge-desk/post-check.ts verdict --agent review --sha "$(git rev-parse HEAD)"
# a PM bookkeeping PR instead:
node scripts/merge-desk/post-check.ts bookkeeping --pr <n> --sha "$(git rev-parse HEAD)"
```

Body arguments for `issue-comment`, `issue-body` and `pr-body`:

- Single-quote the body. Write a literal single quote as `'\''`.
- Do not use a redirect, heredoc or pipe. Any of them takes the command out of the sandbox exclusion, so it runs sandboxed and cannot reach GitHub.
- Known hole, tracked for the git-hardening piece: the excluded command line runs unsandboxed, so any `$()` or backticks the shell sees outside single quotes execute outside the sandbox, including one after an unescaped apostrophe in a single-quoted body or anywhere in an unquoted body. Writing every literal quote as `'\''` is what keeps the body inert. Same hole as every excluded `... *` rule.

A required check with no verdict file stays pending. It is never posted green by hand.
