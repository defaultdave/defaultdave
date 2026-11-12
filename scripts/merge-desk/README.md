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

4. **Install the pinned launchers first** (the Install section below). The cutover (settings blocks (a) to (e)) and the dry run were done 2026-11-11, so agents call these launchers by absolute path.

5. **This unit's PR** merges by Dave's bypass, since the rule it sets up does not exist until it lands: `gh pr merge <n> --admin --squash --delete-branch`.

6. **Dry run** (after steps 1 to 4): a `pm/dry-run` PR merges after the checks and Dave's approval; a PR with one failing check does not; `revert.sh` works; `agent-git.ts push main` is refused.

7. **Closing the approval window** (`scripts/merge-desk/approval-window.sh off`) waits until Ramble's tokens are restricted to `defaultdave/ramble` (ADR Consequences).

## Install

Dave runs this, outside any agent session. It exports `scripts/merge-desk/` at a pinned sha from a fresh clone into `/Users/davidfleming/.local/share/defaultdave-merge-desk/<sha>/` (read-only) and writes the launchers `agent-git` and `post-check` and the hook command `command-guard` into `/Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/`. It prints the settings blocks and applies none of them. The working-tree `install.sh` is agent-editable, so the bootstrap runs the copy archived in the sha. The clone is anonymous (no credentials, no git config), so the repository must be readable without a login.

1. Make the staging directory:

   ```bash
   mkdir -p -m 700 /Users/davidfleming/.local/share/defaultdave-merge-desk/.staging
   ```

2. Clone `main` bare:

   ```bash
   git clone --bare --single-branch --branch main --no-tags https://github.com/defaultdave/defaultdave.git /Users/davidfleming/.local/share/defaultdave-merge-desk/.staging/boot.git
   ```

3. Choose the sha (a full 40-character commit on `main` you have reviewed), and take `install.sh` from it:

   ```bash
   git --git-dir=/Users/davidfleming/.local/share/defaultdave-merge-desk/.staging/boot.git show <sha>:scripts/merge-desk/install.sh > /Users/davidfleming/.local/share/defaultdave-merge-desk/.staging/install.sh
   ```

4. Run it:

   ```bash
   bash /Users/davidfleming/.local/share/defaultdave-merge-desk/.staging/install.sh <sha> --checkout /Users/davidfleming/Workspace/defaultdave
   ```

It lists the commits that touched `scripts/merge-desk/` since the installed pin and asks for `y`. It refuses a short sha or ref, a sha that is not on `main`, a script outside `.staging/`, a checkout whose git common dir is not `<checkout>/.git`, an `APP_KEY` not ending `.pem` or `.key`, a `node`, `gh` or `git` under `~/Workspace` or a temp root, a node older than 24.2, and an export that holds a symlink, a `package.json`, or a non-test `.ts` importing anything but `node:` modules and sibling `./<name>.ts` files. The import scan is a heuristic over the text, not a parser: it does not catch `createRequire`, `process.dlopen` or `new Worker`, so code merged to `main` is still reviewed by a person. A rerun at the same sha changes nothing; a new sha adds a directory, replaces the launchers and keeps the old directory. Each launcher pins `node`, `gh` and `git` by sha256: when one changes (a `brew upgrade`), `agent-git` and `post-check` exit 4 with `pin: <binary> changed; rerun install`, and you rerun step 4. `command-guard` exits 2 instead, with the same line, and exits 2 on any other failure of its stage or of node: a `PreToolUse` hook blocks only on exit 2, so a hook that exited 4 or 1 would let the command through. The pins cover the `node` executable, not the libraries it loads; those sit under `/opt/homebrew`, which the agent cannot write. The `--test-bin <dir>` flag (take node, gh and git from `<dir>`) is for the test suite and is refused without `--test-prefix`.

## After the cutover

Piece 4 (Dave's) applied blocks (a) to (e) that install printed; the cutover and dry run were done 2026-11-11. `settings.local.proposal.json` holds blocks (a) and (c). An agent calls the launchers by absolute path, one call per command, with every title and body in single quotes (write a literal single quote as `'\''`):

```bash
/Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/agent-git push unit/<unit-id>-<slug>
/Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/agent-git pr main '<title>' --body '<text>'
/Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/agent-git automerge <pr>
/Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/post-check verdict --agent review --sha <sha>
```

`command-guard` (a `PreToolUse` hook on Bash) denies any command that names the launcher directory unless the launcher is the first word and everything outside single quotes is plain words: no `$(`, backtick, `${`, double quote, `;`, `&`, `|`, redirect, newline, `~`, env prefix, `cd x && ...` or `bash -c '...'`. Run `app-token.ts` yourself; it prints a live token and has no launcher. There is no revert launcher yet: until the third ticket lands, Dave runs `scripts/merge-desk/revert.sh <n>` by hand in the main checkout.

## How an agent uses it

Absolute launcher path, one call per command, every title and body in single quotes:

```bash
/Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/agent-git push unit/<unit-id>-<slug>
/Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/agent-git pr main '<unit-id>: <title>' --body '<text>'
/Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/agent-git review <pr>      # while the approval window is open
/Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/agent-git automerge <pr>
/Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/agent-git issue-comment <issue> --body '<text>'   # comment on an issue as the App
/Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/agent-git issue-body <issue> --body '<text>'      # replace an issue body (tick criteria, add an Amendment)
/Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/agent-git pr-body <pr> --body '<text>'            # replace a PR body
# after /review-pr <pr-url> writes .team-verdicts/*.md, for each agent:
/Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/post-check verdict --agent review --sha '<sha>'
# a PM bookkeeping PR instead:
/Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/post-check bookkeeping --pr <n> --sha '<sha>'
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
