// The agents' only route to GitHub (ADR 0001). Every call uses the App token, never Dave's login.
//   node scripts/merge-desk/agent-git.ts push <branch>
//   node scripts/merge-desk/agent-git.ts pr <base> <title> <body-file>
//   node scripts/merge-desk/agent-git.ts automerge <pr number or branch>
//   node scripts/merge-desk/agent-git.ts review <pr number or branch>
//   node scripts/merge-desk/agent-git.ts issue-comment <issue number> <body-file>
//   node scripts/merge-desk/agent-git.ts issue-body <issue number> <body-file>   (replaces the body)
//   node scripts/merge-desk/agent-git.ts pr-body <pr number or branch> <body-file>   (replaces the body)
import { spawnSync } from "node:child_process";
import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
} from "node:fs";
import { tmpdir } from "node:os";
import {
  basename,
  dirname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";
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
  /** The repo root as derived from this script's own location, never from git or the cwd. */
  repoRoot: () => string;
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
  const bytes = readBodyFile(bodyFile, deps);
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
    "-",
  ];
  must(
    deps.run(command, { GH_TOKEN: await deps.token() }, bytes),
    "gh pr create",
  );
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

function isInside(root: string, file: string): boolean {
  const rel = relative(root, file);
  return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
}

function realOrNull(path: string): string | null {
  try {
    return realpathSync(path);
  } catch {
    return null;
  }
}

/** The repo root from where this script lives (scripts/merge-desk/ is two levels down), resolved through symlinks. */
export function scriptRoot(moduleUrl: string): string {
  return realpathSync(resolve(dirname(fileURLToPath(moduleUrl)), "..", ".."));
}

const SECRET_SEGMENTS = new Set([".ssh", ".aws", ".gnupg"]);

/** Mirrors the sandbox read-deny list: names that hold credentials. */
function isSecretPath(real: string): boolean {
  const name = basename(real);
  if (real.split(sep).some((segment) => SECRET_SEGMENTS.has(segment)))
    return true;
  if (name === ".env.example" || name === ".env.sample") return false;
  return (
    name === ".env" ||
    name.startsWith(".env.") ||
    /\.(pem|key|p12|pfx)$/.test(name) ||
    name === "credentials.json" ||
    name.startsWith(".secret") ||
    name.startsWith("id_rsa") ||
    name.startsWith("id_ed25519")
  );
}

/**
 * A body file is public text. This command is pre-allowed and sandbox-excluded, so it must not be a way
 * to post an arbitrary file. The path is checked, then opened once (no symlink followed) and the bytes
 * are read from that descriptor; the caller sends those bytes on stdin, never the path, so the file
 * cannot change between the check and the send.
 */
export function readBodyFile(bodyFile: string, deps: Deps): Buffer {
  let info;
  try {
    info = lstatSync(bodyFile);
  } catch {
    throw new Refused("refused: body file is missing");
  }
  if (info.isSymbolicLink())
    throw new Refused("refused: body file is a symbolic link");
  const real = realpathSync(bodyFile);
  const roots = [deps.repoRoot(), tmpdir(), process.env.TMPDIR ?? ""]
    .filter(Boolean)
    .map(realOrNull)
    .filter((root): root is string => root !== null);
  if (!roots.some((root) => isInside(root, real)))
    throw new Refused(
      "refused: body file is outside the repo and the temp directory",
    );
  if (isSecretPath(real))
    throw new Refused("refused: body file has a secret-file name");
  let fd: number;
  try {
    fd = openSync(real, constants.O_RDONLY | constants.O_NOFOLLOW);
  } catch {
    throw new Refused("refused: body file cannot be opened");
  }
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.size === 0)
      throw new Refused("refused: body file is not a non-empty regular file");
    const bytes = readFileSync(fd);
    if (bytes.length === 0)
      throw new Refused("refused: body file is not a non-empty regular file");
    if (bytes.includes("PRIVATE KEY"))
      throw new Refused("refused: body file contains a private key marker");
    return bytes;
  } finally {
    closeSync(fd);
  }
}

/** Posts a comment on an issue as the App. */
export async function issueComment(
  issue: string,
  bodyFile: string,
  deps: Deps,
): Promise<void> {
  assertIssueNumber(issue);
  const bytes = readBodyFile(bodyFile, deps);
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
  bodyFile: string,
  deps: Deps,
): Promise<void> {
  assertIssueNumber(issue);
  const bytes = readBodyFile(bodyFile, deps);
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
  bodyFile: string,
  deps: Deps,
): Promise<void> {
  assertTarget(target);
  const bytes = readBodyFile(bodyFile, deps);
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
    repoRoot: () => scriptRoot(import.meta.url),
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
    else if (command === "issue-comment" && args.length === 2)
      await issueComment(args[0] ?? "", args[1] ?? "", deps);
    else if (command === "issue-body" && args.length === 2)
      await issueBody(args[0] ?? "", args[1] ?? "", deps);
    else if (command === "pr-body" && args.length === 2)
      await prBody(args[0] ?? "", args[1] ?? "", deps);
    else {
      throw new Error(
        "usage: agent-git.ts push <branch> | pr <base> <title> <body-file> | automerge <pr or branch> | review <pr or branch> | issue-comment <issue> <body-file> | issue-body <issue> <body-file> | pr-body <pr or branch> <body-file>",
      );
    }
  } catch (error) {
    console.error((error as Error).message);
    process.exit(error instanceof Refused ? 2 : 1);
  }
}
