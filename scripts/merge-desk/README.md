# merge-desk

How agents push, open PRs, post review verdicts and queue auto-merge on `defaultdave/defaultdave` as the `defaultdave-agents` GitHub App, never with Dave's login. The rules of record are `docs/adr/0001-agent-workflow-and-merge-rule.md`. One tier: every PR targets `main`.

Scripts run on Node (type stripping, no build): `node scripts/merge-desk/<script>.ts`. Tests are `*.test.ts` beside each script and run in `pnpm test`.

| Script                       | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app-token.ts`               | Dave only. Mints a one-hour installation token from `~/.config/defaultdave-agents/app.conf` (`APP_ID`, `APP_INSTALLATION_ID`, `APP_KEY`, optional `APP_CLIENT_ID`), restricted to this repo through the `repositories` field. Prints only the token. Run it only from the export, with the working directory outside `~/Workspace`: `<bin>/.path/node ~/.local/share/defaultdave-merge-desk/<sha>/app-token.ts`. Agents never run it.                                                                                                                                                                                                                                                                                                                                                            |
| `agent-git.ts`               | `push <branch>`, `pr main <title> --body '<text>'`, `automerge <pr>`, `review <pr>`, `issue-comment <issue> --body '<text>'`, `issue-body <issue> --body '<text>'`, `pr-body <pr> --body '<text>'` (the body is one argument after `--body`, read from no stdin and no file; an empty body, one over 65,536 characters, `--body=<text>`, the `-` form and extra arguments are refused). Allows only `unit/<unit-id>[-<slug>]`, `pm/<slug>`, `revert/pr-<n>`; refuses `main`, any other base, a worktree of another repository, any origin URL that is not `https://github.com/defaultdave/defaultdave`, and flag-like targets. `automerge`, `review` and `pr-body` first look the PR up and refuse unless it is a same-repo PR from an agent branch into `main`. Merges squash, never `--admin`. |
| `safe-exec.ts`               | The only module that starts `git` or `gh` for `agent-git.ts` and `post-check.ts`. See Hardening.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `post-check.ts`              | `verdict --agent <name> --sha <sha>` posts `.team-verdicts/<name>.md` under its check name (`review` as `review-agent`, `qa` as `qa-agent`; `spec-compliance`, `a11y-audit`, `architecture-audit`, `perf-check` under their own). A missing file posts nothing; a file with no usable verdict line (or `BLOCKED`) posts nothing and exits 1. `bookkeeping --pr <n> --sha <sha>` posts the four required checks as "not applicable: bookkeeping only", and only when the scope rules pass the PR as bookkeeping on that head.                                                                                                                                                                                                                                                                     |
| `scope-check.ts`             | The `scope-manifest` check: title, branch, base and path rules (ADR rules 3, 6, 8). Unit ids come from `docs/plan/plan.json`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `revert.sh <pr>`             | Unused until the revert ticket lands (#42). Revert a merged PR with the Revert button on GitHub, and run no local git in the shared checkout.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `approval-window.sh on\|off` | Dave only. Sets the ruleset's required approvals to 1 (dismissed on push) or 0.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

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
node scripts/merge-desk/agent-git.ts pr main '<unit-id>: <title>' --body '<text>'
node scripts/merge-desk/agent-git.ts review <pr>      # while the approval window is open
node scripts/merge-desk/agent-git.ts automerge <pr>
node scripts/merge-desk/agent-git.ts issue-comment <issue> --body '<text>'   # comment on an issue as the App
node scripts/merge-desk/agent-git.ts issue-body <issue> --body '<text>'      # replace an issue body (tick criteria, add an Amendment)
node scripts/merge-desk/agent-git.ts pr-body <pr> --body '<text>'            # replace a PR body
# after /review-pr <pr-url> writes .team-verdicts/*.md, for each agent:
node scripts/merge-desk/post-check.ts verdict --agent review --sha '<sha>'
# a PM bookkeeping PR instead:
node scripts/merge-desk/post-check.ts bookkeeping --pr <n> --sha '<sha>'
```

Body arguments for `pr`, `issue-comment`, `issue-body` and `pr-body`:

- Single-quote the body. Write a literal single quote as `'\''`.
- Do not use a redirect, heredoc or pipe. Any of them takes the command out of the sandbox exclusion, so it runs sandboxed and cannot reach GitHub.
- Known hole, closed by `command-guard` (built in piece 3, registered in piece 4): the excluded command line runs unsandboxed, so any `$()` or backticks the shell sees outside single quotes execute outside the sandbox, including one after an unescaped apostrophe in a single-quoted body or anywhere in an unquoted body. Writing every literal quote as `'\''` is what keeps the body inert until the guard is registered. Same hole as every excluded `... *` rule.

## Hardening

`agent-git.ts` and `post-check.ts` start every child through `safe-exec.ts`, so the worktree, its `.git` and the caller's environment cannot run code, redirect traffic or turn off TLS.

- **Fixed binaries.** `git` is the root-owned Command Line Tools binary and `gh` is `/opt/homebrew/bin/gh`, both by absolute path. Nothing is looked up on `PATH`.
- **Environment built from nothing.** A child gets `PATH`, `HOME` (from the passwd entry), `TMPDIR`, `LANG` and `LC_ALL`, plus fixed git or gh keys. Nothing is copied from the caller, so `GIT_DIR`, `GIT_CONFIG_*`, `GIT_EXEC_PATH`, proxy, TLS, trace, `GH_*` and `PATH` variables change nothing.
- **Fixed git config.** `HARDENING_KEYS` goes in through `GIT_CONFIG_COUNT`, which outranks the repository, `config.worktree`, includes and the global file. It switches off hooks, fsmonitor, editors, pagers, credential helpers, proxies, SSH commands, submodule recursion and signing, keeps TLS verification on, and allows only HTTPS.
- **The token is in files, not env or argv.** A push reads `<run>/.secret-auth/gitconfig` as its global config, and gh reads `<run>/.secret-gh/hosts.yml`. Files are 0600 in 0700 directories and match the sandbox read-deny `**/.secret*`, which a sandboxed process needs because it can read a same-user process's environment.
- **Engine directory.** Run directories live under `~/Library/Caches/defaultdave-merge-desk/`, which the sandbox cannot write. The root is created 0700 and refused if it is a symlink, owned by someone else or writable by group or others. It is touched only when a subcommand is about to spawn, after argument and refusal checks, and each run directory is removed however the command ends.
- **The worktree is untrusted.** It supplies the branch name and the commits, and only read-only calls run in it: `rev-parse`, `symbolic-ref`, `remote get-url` and `config --get`. Its common dir must be the constant `EXPECTED_COMMON_DIR`, and every fetch and push URL of `origin` must be the repository's HTTPS URL, with no `insteadOf` or `pushInsteadOf` anywhere.
- **Push runs elsewhere.** `push` makes a bare repo in the run dir, points its `alternates` at the shared object store, and pushes `<sha>:refs/heads/<branch>` to the constant HTTPS URL from there, never by remote name and never from the worktree.
- **gh arguments.** `--repo defaultdave/defaultdave` on every call, the body on stdin with `--body-file -`, the title as `--title=<title>`, and no path.
- **Not covered here: the parent Node process.** The token is minted and sent by `mintToken` and `post-check.ts` inside the launching process, so its own environment can capture it. The piece 3 launcher must scrub `NODE_OPTIONS`, `NODE_USE_ENV_PROXY`, `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`, `NODE_EXTRA_CA_CERTS`, `NODE_TLS_REJECT_UNAUTHORIZED`, `SSL_CERT_FILE` and `SSL_CERT_DIR` before it starts these scripts.

A required check with no verdict file stays pending. It is never posted green by hand.
