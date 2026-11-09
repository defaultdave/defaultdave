// The agents' only route to GitHub (ADR 0001). Every call uses the App token, never Dave's login.
//   node scripts/merge-desk/agent-git.ts push <branch>
//   node scripts/merge-desk/agent-git.ts pr <base> <title> <body-file>
//   node scripts/merge-desk/agent-git.ts automerge <pr number or branch>
//   node scripts/merge-desk/agent-git.ts review <pr number or branch>
//   node scripts/merge-desk/agent-git.ts issue-comment <issue number> --body '<text>'
//   node scripts/merge-desk/agent-git.ts issue-body <issue number> --body '<text>'   (replaces the body)
//   node scripts/merge-desk/agent-git.ts pr-body <pr number or branch> --body '<text>'   (replaces the body)
import { spawnSync } from "node:child_process";
// @ts-expect-error TS5097: Node needs the .ts extension, and the root tsconfig does not allow it
import { mintToken } from "./app-token.ts";

export const REPO = "defaultdave/defaultdave";
/** The owner's login. An approval from it counts because agents author PRs as the App, not as the owner. */
export const REVIEWER = "defaultdave";
/** ADR rule 3: unit/<unit-id>[-<slug>], pm/<slug>, revert/pr-<n>, and nothing else. */
const BRANCH_PATTERN =
  /^(unit\/[a-z0-9][a-z0-9-]*|pm\/[a-z0-9][a-z0-9-]*|revert\/pr-[0-9]+)$/;

export class Refused extends Error {}

export interface RunResult {
  code: number;
  stdout: string;
}

export interface Deps {
  token: () => Promise<string>;
  /** `input`, when given, is written to the command's stdin. */
  run: (
    command: string[],
    env: Record<string, string>,
    input?: Buffer,
  ) => RunResult;
  currentBranch: () => string;
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

/** Git config passed through the environment so the token never appears in a command line or URL. */
export function gitAuthEnv(token: string): Record<string, string> {
  const basic = Buffer.from(`x-access-token:${token}`).toString("base64");
  return {
    GIT_CONFIG_COUNT: "2",
    GIT_CONFIG_KEY_0: "credential.helper",
    GIT_CONFIG_VALUE_0: "",
    GIT_CONFIG_KEY_1: "http.https://github.com/.extraheader",
    GIT_CONFIG_VALUE_1: `Authorization: Basic ${basic}`,
    GIT_TERMINAL_PROMPT: "0",
  };
}

function must(result: RunResult, what: string): RunResult {
  if (result.code !== 0)
    throw new Error(`${what} failed (exit ${String(result.code)})`);
  return result;
}

const HTTPS_REMOTE = new RegExp(`^https://github\\.com/${REPO}(\\.git)?$`);

/** The App token rides an HTTPS header, so a push URL that is SSH (or another repo) would use Dave's own login. */
export function assertHttpsRemote(deps: Deps): void {
  const result = deps.run(
    ["git", "remote", "get-url", "--push", "--all", "origin"],
    {},
  );
  const urls = result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (
    result.code !== 0 ||
    urls.length === 0 ||
    !urls.every((url) => HTTPS_REMOTE.test(url))
  ) {
    throw new Refused(
      `refused: every push URL of origin must be https://github.com/${REPO}`,
    );
  }
}

export async function push(branch: string, deps: Deps): Promise<void> {
  assertPushable(branch);
  assertHttpsRemote(deps);
  must(
    deps.run(
      ["git", "push", "origin", `refs/heads/${branch}:refs/heads/${branch}`],
      gitAuthEnv(await deps.token()),
    ),
    "git push",
  );
}

export async function pr(
  base: string,
  title: string,
  bodyFile: string,
  deps: Deps,
): Promise<void> {
  assertBase(base);
  const head = deps.currentBranch();
  assertPushable(head);
  const command = [
    "gh",
    "pr",
    "create",
    "--repo",
    REPO,
    "--base",
    base,
    "--head",
    head,
    "--title",
    title,
    "--body-file",
    bodyFile,
  ];
  must(deps.run(command, { GH_TOKEN: await deps.token() }), "gh pr create");
}

function assertTarget(target: string): void {
  if (target.startsWith("-"))
    throw new Refused(`refused: ${target} is not a PR number or branch`);
}

/** Queues squash auto-merge as the App. Never `--admin`; refuses a PR that is not an agent branch into main. */
export async function automerge(target: string, deps: Deps): Promise<void> {
  assertTarget(target);
  const token = await deps.token();
  const view = must(
    deps.run(
      [
        "gh",
        "pr",
        "view",
        target,
        "--repo",
        REPO,
        "--json",
        "headRefName,baseRefName",
      ],
      {
        GH_TOKEN: token,
      },
    ),
    "gh pr view",
  );
  const { headRefName, baseRefName } = JSON.parse(view.stdout) as {
    headRefName: string;
    baseRefName: string;
  };
  assertPushable(headRefName);
  assertBase(baseRefName);
  must(
    deps.run(
      ["gh", "pr", "merge", target, "--repo", REPO, "--auto", "--squash"],
      { GH_TOKEN: token },
    ),
    "gh pr merge",
  );
}

/** Requests the owner's review as the App: every PR while approvals are required, and escalations after. */
export async function review(target: string, deps: Deps): Promise<void> {
  assertTarget(target);
  must(
    deps.run(
      ["gh", "pr", "edit", target, "--repo", REPO, "--add-reviewer", REVIEWER],
      {
        GH_TOKEN: await deps.token(),
      },
    ),
    "gh pr edit",
  );
}

function assertIssueNumber(issue: string): void {
  if (!/^[1-9][0-9]*$/.test(issue))
    throw new Refused(`refused: ${issue} is not a positive issue number`);
}

/** GitHub's limit for an issue, comment or PR body, in characters. */
export const MAX_BODY_CHARS = 65_536;

/**
 * The body of issue-comment, issue-body and pr-body is one argv element after `--body`, so the
 * command line is the only input: no shell sees it here, and this script opens no file and reads
 * no stdin. `--body=<text>`, the old `-` form and extra arguments are refused. (`pr` still hands
 * a path to gh; that is outside this guarantee.)
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
  must(
    deps.run(
      ["gh", "issue", "comment", issue, "--repo", REPO, "--body-file", "-"],
      { GH_TOKEN: await deps.token() },
      bytes,
    ),
    "gh issue comment",
  );
}

/** Replaces an issue body as the App (ticking criteria, adding Amendment sections). */
export async function issueBody(
  issue: string,
  bodyArgs: string[],
  deps: Deps,
): Promise<void> {
  assertIssueNumber(issue);
  const bytes = parseBody(bodyArgs);
  must(
    deps.run(
      ["gh", "issue", "edit", issue, "--repo", REPO, "--body-file", "-"],
      { GH_TOKEN: await deps.token() },
      bytes,
    ),
    "gh issue edit",
  );
}

/** Replaces a PR body as the App. */
export async function prBody(
  target: string,
  bodyArgs: string[],
  deps: Deps,
): Promise<void> {
  assertTarget(target);
  const bytes = parseBody(bodyArgs);
  must(
    deps.run(
      ["gh", "pr", "edit", target, "--repo", REPO, "--body-file", "-"],
      { GH_TOKEN: await deps.token() },
      bytes,
    ),
    "gh pr edit",
  );
}

function realDeps(): Deps {
  let cached: Promise<string> | null = null;
  const spawn = (
    command: string[],
    env: Record<string, string>,
    input?: Buffer,
  ): RunResult => {
    const [file, ...args] = command;
    const result = spawnSync(file ?? "", args, {
      env: { ...process.env, ...env },
      encoding: "utf8",
      input,
      stdio: [input ? "pipe" : "ignore", "pipe", "inherit"],
    });
    return { code: result.status ?? 1, stdout: result.stdout };
  };
  return {
    token: () => (cached ??= mintToken()),
    run: (command, env, input) => {
      const result = spawn(command, env, input);
      if (command[0] === "gh" && command[2] !== "view")
        process.stdout.write(result.stdout);
      return result;
    },
    currentBranch: () =>
      spawn(["git", "branch", "--show-current"], {}).stdout.trim(),
  };
}

if (import.meta.main) {
  const [command, ...args] = process.argv.slice(2);
  try {
    const deps = realDeps();
    if (command === "push" && args.length === 1)
      await push(args[0] ?? "", deps);
    else if (command === "pr" && args.length === 3)
      await pr(args[0] ?? "", args[1] ?? "", args[2] ?? "", deps);
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
    else {
      throw new Error(
        "usage: agent-git.ts push <branch> | pr <base> <title> <body-file> | automerge <pr or branch> | review <pr or branch> | issue-comment <issue> --body <text> | issue-body <issue> --body <text> | pr-body <pr or branch> --body <text>",
      );
    }
  } catch (error) {
    console.error((error as Error).message);
    process.exit(error instanceof Refused ? 2 : 1);
  }
}
