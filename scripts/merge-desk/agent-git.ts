// The agents' only route to GitHub (ADR 0001). Every call uses the App token, never Dave's login.
//   /Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/agent-git push <branch>
//   /Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/agent-git pr <base> <title> --body '<text>'
//   /Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/agent-git automerge <pr number or branch>
//   /Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/agent-git review <pr number or branch>
//   /Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/agent-git issue-comment <issue number> --body '<text>'
//   /Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/agent-git issue-body <issue number> --body '<text>'   (replaces the body)
//   /Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/agent-git pr-body <pr number or branch> --body '<text>'   (replaces the body)
// Every git and gh child starts through ./safe-exec.ts: fixed binary, environment built from nothing, token in
// a file under the engine root and never in env or argv.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
// @ts-expect-error TS5097: Node needs the .ts extension, and the root tsconfig does not allow it
import { DEFAULT_CONF, mintToken } from "./app-token.ts";
import {
  type ChildResult,
  defaultEngineRoot,
  type Deps as SafeDeps,
  EXPECTED_COMMON_DIR,
  GH,
  GIT,
  gitRead,
  locateWorktree,
  Refused,
  REPO_HTTPS_URL,
  runGh,
  runGit,
  withRunDir,
  writeGhHosts,
  writeGitAuth,
  // @ts-expect-error TS5097: Node needs the .ts extension, and the root tsconfig does not allow it
} from "./safe-exec.ts";

export { Refused };

export const REPO = "defaultdave/defaultdave";
/** The owner's login. An approval from it counts because agents author PRs as the App, not as the owner. */
export const REVIEWER = "defaultdave";
/** ADR rule 3: unit/<unit-id>[-<slug>], pm/<slug>, revert/pr-<n>, and nothing else. */
const BRANCH_PATTERN =
  /^(unit\/[a-z0-9][a-z0-9-]*|pm\/[a-z0-9][a-z0-9-]*|revert\/pr-[0-9]+)$/;
const PR_NUMBER = /^[1-9][0-9]*$/;
const OBJECT_ID = /^([0-9a-f]{40}|[0-9a-f]{64})$/;

export interface Deps extends SafeDeps {
  gh: string;
  /** Root of the per-run directories; not writable from the sandbox. */
  engineRoot: string;
  /** Where `push` sends the commit. */
  pushUrl: string;
  /** The untrusted worktree: supplies the branch name and commits only. */
  cwd: string;
  token: () => Promise<string>;
  /** Extra git config for the push only. Tests use it for protocol.file.allow; realDeps sets none. */
  gitConfig: readonly (readonly [key: string, value: string])[];
  print: (text: string) => void;
}

/** Only unit/…, pm/… and revert/pr-<n> branches may be pushed; main never. */
export function assertPushable(branch: string): void {
  if (!BRANCH_PATTERN.test(branch) || branch.endsWith("-")) {
    throw new Refused(
      `refused: ${branch} is not a unit/<id>[-<slug>], pm/<slug>, or revert/pr-<n> branch`,
    );
  }
}

export function assertBase(base: string): void {
  if (base !== "main")
    throw new Refused(`refused: base must be main, not ${base}`);
}

function must(result: ChildResult, what: string): ChildResult {
  if (result.code !== 0)
    throw new Error(`${what} failed (exit ${String(result.code)})`);
  return result;
}

/** Pushes the local commit of `branch` to the repository URL from a bare repo in the engine run dir. */
export async function push(branch: string, deps: Deps): Promise<void> {
  assertPushable(branch);
  const { commonDir } = locateWorktree(deps.cwd, deps);
  const rev = gitRead(
    deps.cwd,
    [
      "rev-parse",
      "--verify",
      "--quiet",
      "--end-of-options",
      `refs/heads/${branch}^{commit}`,
    ],
    deps,
  );
  const sha = rev.stdout.trim();
  if (rev.code !== 0 || !OBJECT_ID.test(sha))
    throw new Refused(`refused: ${branch} is not a local branch`);
  await withRunDir(deps.engineRoot, async (runDir) => {
    const bare = join(runDir, "push.git");
    must(
      runGit(deps, ["init", "--bare", "--template=", bare], {
        runDir,
        cwd: runDir,
        quiet: true,
      }),
      "git init",
    );
    mkdirSync(join(bare, "objects", "info"), { recursive: true });
    writeFileSync(
      join(bare, "objects", "info", "alternates"),
      `${join(commonDir, "objects")}\n`,
    );
    const authFile = writeGitAuth(runDir, await deps.token());
    const pushed = must(
      runGit(
        deps,
        [
          "push",
          "--no-verify",
          "--porcelain",
          deps.pushUrl,
          `${sha}:refs/heads/${branch}`,
        ],
        {
          runDir,
          cwd: bare,
          authFile,
          extraConfig: deps.gitConfig,
        },
      ),
      "git push",
    );
    deps.print(pushed.stdout);
  });
}

type GhCall = (args: string[], input?: Buffer) => ChildResult;

/** A run dir with the token written as gh's hosts.yml, and a runner for gh calls in it. */
async function withGh<T>(
  deps: Deps,
  fn: (gh: GhCall) => Promise<T> | T,
): Promise<T> {
  return withRunDir(deps.engineRoot, async (runDir) => {
    const configDir = writeGhHosts(runDir, await deps.token());
    return fn((args, input) =>
      runGh(deps.gh, args, { runDir, configDir, input }),
    );
  });
}

/** Runs a gh call that changes something and echoes its output. */
function ghWrite(
  deps: Deps,
  gh: GhCall,
  args: string[],
  what: string,
  input?: Buffer,
): void {
  deps.print(must(gh(args, input), what).stdout);
}

/** Opens a PR from the checked-out branch. The body comes from `--body`, like the other writers. */
export async function pr(
  base: string,
  title: string,
  bodyArgs: string[],
  deps: Deps,
): Promise<void> {
  assertBase(base);
  const bytes = parseBody(bodyArgs);
  locateWorktree(deps.cwd, deps);
  const symbolic = gitRead(
    deps.cwd,
    ["symbolic-ref", "--short", "-q", "HEAD"],
    deps,
  );
  const head = symbolic.stdout.trim();
  if (symbolic.code !== 0)
    throw new Refused("refused: HEAD is not on a branch");
  assertPushable(head);
  await withGh(deps, (gh) => {
    ghWrite(
      deps,
      gh,
      [
        "pr",
        "create",
        "--repo",
        REPO,
        "--base",
        base,
        "--head",
        head,
        `--title=${title}`,
        "--body-file",
        "-",
      ],
      "gh pr create",
      bytes,
    );
  });
}

function assertTarget(target: string): void {
  if (PR_NUMBER.test(target)) return;
  try {
    assertPushable(target);
  } catch {
    throw new Refused(`refused: ${target} is not a PR number or branch`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const PR_FIELDS =
  "number,headRefName,baseRefName,isCrossRepository,headRepositoryOwner";

/**
 * Looks the PR up and refuses unless it is a same-repo PR from an agent branch into main. Returns its number,
 * which every later call uses instead of the caller's text.
 */
function resolvePr(gh: GhCall, target: string): string {
  const view = must(
    gh(["pr", "view", target, "--repo", REPO, "--json", PR_FIELDS]),
    "gh pr view",
  );
  const parsed: unknown = JSON.parse(view.stdout);
  if (!isRecord(parsed)) throw new Error("gh pr view returned no object");
  const owner = parsed.headRepositoryOwner;
  const login = isRecord(owner) ? owner.login : undefined;
  if (parsed.isCrossRepository !== false || login !== REVIEWER)
    throw new Refused(`refused: ${target} is not a same-repo PR of ${REPO}`);
  if (typeof parsed.headRefName !== "string")
    throw new Error("gh pr view returned no head branch");
  assertPushable(parsed.headRefName);
  if (typeof parsed.baseRefName !== "string")
    throw new Error("gh pr view returned no base branch");
  assertBase(parsed.baseRefName);
  const number = parsed.number;
  if (typeof number !== "number" || !Number.isInteger(number) || number < 1)
    throw new Error("gh pr view returned no PR number");
  return String(number);
}

/** Queues squash auto-merge as the App. Never `--admin`; refuses a PR that is not an agent branch into main. */
export async function automerge(target: string, deps: Deps): Promise<void> {
  assertTarget(target);
  await withGh(deps, (gh) => {
    const number = resolvePr(gh, target);
    ghWrite(
      deps,
      gh,
      ["pr", "merge", number, "--repo", REPO, "--auto", "--squash"],
      "gh pr merge",
    );
  });
}

/** Requests the owner's review as the App: every PR while approvals are required, and escalations after. */
export async function review(target: string, deps: Deps): Promise<void> {
  assertTarget(target);
  await withGh(deps, (gh) => {
    const number = resolvePr(gh, target);
    ghWrite(
      deps,
      gh,
      ["pr", "edit", number, "--repo", REPO, "--add-reviewer", REVIEWER],
      "gh pr edit",
    );
  });
}

function assertIssueNumber(issue: string): void {
  if (!PR_NUMBER.test(issue))
    throw new Refused(`refused: ${issue} is not a positive issue number`);
}

/** GitHub's limit for an issue, comment or PR body, in characters. */
export const MAX_BODY_CHARS = 65_536;

/**
 * The body of pr, issue-comment, issue-body and pr-body is one argv element after `--body`, so the
 * command line is the only input: no shell sees it here, and this script opens no file and reads
 * no stdin. `--body=<text>`, the old `-` form and extra arguments are refused.
 */
export function parseBody(rest: string[]): Buffer {
  const [flag, text, ...extra] = rest;
  if (flag === undefined)
    throw new Refused("refused: pass the body as --body '<text>'");
  if (flag !== "--body")
    throw new Refused(
      `refused: expected --body '<text>' after the target, not ${flag}`,
    );
  if (text === undefined)
    throw new Refused("refused: --body needs a value: --body '<text>'");
  if (extra.length > 0)
    throw new Refused(
      "refused: the body must be one argument; single-quote it: --body '<text>'",
    );
  if (text.trim() === "") throw new Refused("refused: the body is empty");
  const length = Array.from(text).length;
  if (length > MAX_BODY_CHARS)
    throw new Refused(
      `refused: the body is ${String(length)} characters; the limit is ${String(MAX_BODY_CHARS)} characters`,
    );
  return Buffer.from(text, "utf8");
}

/** Posts a comment on an issue as the App. */
export async function issueComment(
  issue: string,
  bodyArgs: string[],
  deps: Deps,
): Promise<void> {
  assertIssueNumber(issue);
  const bytes = parseBody(bodyArgs);
  await withGh(deps, (gh) => {
    ghWrite(
      deps,
      gh,
      ["issue", "comment", issue, "--repo", REPO, "--body-file", "-"],
      "gh issue comment",
      bytes,
    );
  });
}

/** Replaces an issue body as the App (ticking criteria, adding Amendment sections). */
export async function issueBody(
  issue: string,
  bodyArgs: string[],
  deps: Deps,
): Promise<void> {
  assertIssueNumber(issue);
  const bytes = parseBody(bodyArgs);
  await withGh(deps, (gh) => {
    ghWrite(
      deps,
      gh,
      ["issue", "edit", issue, "--repo", REPO, "--body-file", "-"],
      "gh issue edit",
      bytes,
    );
  });
}

/** Replaces a PR body as the App. */
export async function prBody(
  target: string,
  bodyArgs: string[],
  deps: Deps,
): Promise<void> {
  assertTarget(target);
  const bytes = parseBody(bodyArgs);
  await withGh(deps, (gh) => {
    const number = resolvePr(gh, target);
    ghWrite(
      deps,
      gh,
      ["pr", "edit", number, "--repo", REPO, "--body-file", "-"],
      "gh pr edit",
      bytes,
    );
  });
}

/**
 * The live dependencies, from constants only: binaries, common dir, push URL and engine root. Touches no
 * path; the engine root is checked and created only when a subcommand is about to spawn.
 *
 * @returns Deps backed by the App token and the fixed binaries.
 */
export function realDeps(): Deps {
  let cached: Promise<string> | null = null;
  return {
    git: GIT,
    gh: GH,
    expectedCommonDir: EXPECTED_COMMON_DIR,
    pushUrl: REPO_HTTPS_URL,
    engineRoot: defaultEngineRoot(),
    cwd: process.cwd(),
    gitConfig: [],
    print: (text) => process.stdout.write(text),
    token: () => (cached ??= mintToken({ confPath: DEFAULT_CONF })),
  };
}

const USAGE =
  "usage: agent-git.ts push <branch> | pr <base> <title> --body <text> | automerge <pr or branch> | review <pr or branch> | issue-comment <issue> --body <text> | issue-body <issue> --body <text> | pr-body <pr or branch> --body <text>";

/** Runs one subcommand. Returns the exit code: 0 done, 2 refused, 1 any other failure. */
export async function main(argv: string[], deps: Deps): Promise<number> {
  const [command, ...args] = argv;
  try {
    if (command === "push" && args.length === 1)
      await push(args[0] ?? "", deps);
    else if (command === "pr" && args.length >= 2)
      await pr(args[0] ?? "", args[1] ?? "", args.slice(2), deps);
    else if (command === "automerge" && args.length === 1)
      await automerge(args[0] ?? "", deps);
    else if (command === "review" && args.length === 1)
      await review(args[0] ?? "", deps);
    else if (command === "issue-comment" && args[0] !== undefined)
      await issueComment(args[0], args.slice(1), deps);
    else if (command === "issue-body" && args[0] !== undefined)
      await issueBody(args[0], args.slice(1), deps);
    else if (command === "pr-body" && args[0] !== undefined)
      await prBody(args[0], args.slice(1), deps);
    else throw new Error(USAGE);
    return 0;
  } catch (error) {
    console.error((error as Error).message);
    return error instanceof Refused ? 2 : 1;
  }
}

if (import.meta.main) {
  process.exit(await main(process.argv.slice(2), realDeps()));
}
