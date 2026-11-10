// The only place merge-desk starts git or gh. Every child runs a fixed binary, with an environment built from
// nothing and fixed git config, so the worktree, its .git and the caller's environment cannot run code, redirect
// traffic or switch off TLS. The App token reaches a child only through a 0600 file in a 0700 directory under
// the engine root, never through the environment or argv. Imports `node:` built-ins only.
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  type Stats,
  writeFileSync,
} from "node:fs";
import { userInfo } from "node:os";
import { join, resolve, sep } from "node:path";

export const GIT = "/Library/Developer/CommandLineTools/usr/bin/git";
export const GH = "/opt/homebrew/bin/gh";
export const NODE = "/opt/homebrew/bin/node";
// prettier-ignore
export const EXPECTED_COMMON_DIR = "/Users/davidfleming/Workspace/defaultdave/.git";
export const REPO_HTTPS_URL = "https://github.com/defaultdave/defaultdave.git";

/** Git config every child gets through GIT_CONFIG_COUNT, which outranks every config file. */
export const HARDENING_KEYS: readonly (readonly [
  key: string,
  value: string,
])[] = [
  ["core.hooksPath", "/dev/null"],
  ["core.fsmonitor", "false"],
  ["core.askPass", ""],
  ["core.editor", "false"],
  ["sequence.editor", "false"],
  ["core.pager", "cat"],
  ["core.sshCommand", "false"],
  ["credential.helper", ""],
  ["http.proxy", ""],
  ["http.sslVerify", "true"],
  ["http.followRedirects", "false"],
  ["protocol.allow", "never"],
  ["protocol.https.allow", "always"],
  ["submodule.recurse", "false"],
  ["push.recurseSubmodules", "no"],
  ["fetch.recurseSubmodules", "false"],
  ["commit.gpgSign", "false"],
  ["tag.gpgSign", "false"],
  ["transfer.fsckObjects", "true"],
];

/** A refusal: the caller asked for something this engine never does. */
export class Refused extends Error {}

export interface Deps {
  git: string;
  expectedCommonDir: string;
}

export interface ChildResult {
  code: number;
  stdout: string;
  stderr: string;
}

const SAFE_PATH = "/usr/bin:/bin:/usr/sbin:/sbin";
const REPO_SLUG = "defaultdave/defaultdave";
const SAME_REPO_URL =
  /^https:\/\/github\.com\/defaultdave\/defaultdave(\.git)?$/;
const FOREIGN_CHARACTER = /[\u0000-\u001f\u007f"]/;
/** Where a read-only git call sees a temp dir that cannot be written. */
const NO_TMP = "/var/empty";

type ConfigPairs = readonly (readonly [key: string, value: string])[];

/** The environment shared by every child: nothing is inherited. */
function baseEnv(tmpdir: string): Record<string, string> {
  return {
    PATH: SAFE_PATH,
    HOME: userInfo().homedir,
    TMPDIR: tmpdir,
    LANG: "C",
    LC_ALL: "C",
  };
}

export interface GitEnvOptions {
  tmpdir: string;
  /** The auth file on a push; /dev/null otherwise. */
  globalConfig?: string | undefined;
  /** Config appended after HARDENING_KEYS, so it wins. Tests use it for protocol.file.allow. */
  extraConfig?: ConfigPairs | undefined;
}

export function gitEnv(options: GitEnvOptions): Record<string, string> {
  const config = [...HARDENING_KEYS, ...(options.extraConfig ?? [])];
  const env: Record<string, string> = {
    ...baseEnv(options.tmpdir),
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: options.globalConfig ?? "/dev/null",
    GIT_TERMINAL_PROMPT: "0",
    GIT_NO_REPLACE_OBJECTS: "1",
    GIT_OPTIONAL_LOCKS: "0",
    GIT_PROTOCOL_FROM_USER: "0",
    // A partial-clone config in the repository must not turn a missing object into a fetch from its promisor remote.
    GIT_NO_LAZY_FETCH: "1",
    GIT_CONFIG_COUNT: String(config.length),
  };
  config.forEach(([key, value], index) => {
    env[`GIT_CONFIG_KEY_${String(index)}`] = key;
    env[`GIT_CONFIG_VALUE_${String(index)}`] = value;
  });
  return env;
}

export function ghEnv(
  runDir: string,
  configDir: string,
): Record<string, string> {
  return {
    ...baseEnv(runDir),
    GH_HOST: "github.com",
    GH_CONFIG_DIR: configDir,
    GH_PROMPT_DISABLED: "1",
    GH_NO_UPDATE_NOTIFIER: "1",
    GH_NO_EXTENSION_UPDATE_NOTIFIER: "1",
    GH_PAGER: "cat",
    NO_COLOR: "1",
  };
}

interface SpawnOptions {
  cwd: string;
  env: Record<string, string>;
  input?: Buffer | undefined;
}

function spawnChild(
  file: string,
  args: readonly string[],
  options: SpawnOptions,
): ChildResult {
  const result = spawnSync(file, args, {
    cwd: options.cwd,
    // Next augments ProcessEnv with NODE_ENV; a child env built from nothing has none, and must not.
    env: options.env as NodeJS.ProcessEnv,
    encoding: "utf8",
    input: options.input,
    stdio: [options.input ? "pipe" : "ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error)
    throw new Error(`could not run ${file}: ${result.error.message}`);
  return {
    code: result.status ?? 1,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

/** Forwards a child's stderr to ours; it carries gh's and git's own error text, never the token. */
function forwardStderr(result: ChildResult): ChildResult {
  if (result.stderr) process.stderr.write(result.stderr);
  return result;
}

function isReadOnly(args: readonly string[]): boolean {
  const [verb, sub] = args;
  if (verb === "rev-parse") return true;
  if (verb === "remote") return sub === "get-url";
  if (verb === "config") return sub === "--get" || sub === "--get-regexp";
  if (verb === "symbolic-ref") {
    return args
      .slice(1)
      .every((arg) => ["--short", "-q", "--quiet", "HEAD"].includes(arg));
  }
  return false;
}

/**
 * Hardened git in `cwd`, no auth file. Only rev-parse, symbolic-ref (read form), remote get-url and
 * config --get/--get-regexp; anything else throws `refused:`. Nonzero exits are returned.
 */
export function gitRead(
  cwd: string,
  args: readonly string[],
  deps: Pick<Deps, "git"> = { git: GIT },
): { code: number; stdout: string; stderr: string } {
  if (!isReadOnly(args))
    throw new Refused(`refused: git ${args.join(" ")} is not a read-only call`);
  return spawnChild(deps.git, args, {
    cwd,
    env: gitEnv({ tmpdir: NO_TMP }),
  });
}

/**
 * Checks that `cwd` is a worktree of this repo and returns the constant common dir, never git's output.
 * The cwd is untrusted: it supplies only the branch name and commits, and only the read-only calls below
 * run in it. Every child env carries GIT_NO_LAZY_FETCH=1, so a promisor remote in the worktree's config
 * cannot start a fetch, and none of these calls touches the index or runs hooks.
 */
export function locateWorktree(
  cwd: string,
  deps: Pick<Deps, "git" | "expectedCommonDir"> = {
    git: GIT,
    expectedCommonDir: EXPECTED_COMMON_DIR,
  },
): { commonDir: string } {
  const common = gitRead(
    cwd,
    ["rev-parse", "--path-format=absolute", "--git-common-dir"],
    deps,
  );
  const reported = common.stdout.replace(/\n$/, "");
  if (
    common.code !== 0 ||
    !reported.startsWith("/") ||
    FOREIGN_CHARACTER.test(reported)
  ) {
    throw new Refused("refused: the git common dir is not an absolute path");
  }
  let real: string;
  try {
    real = realpathSync(reported);
  } catch {
    throw new Refused("refused: the git common dir does not exist");
  }
  if (real !== deps.expectedCommonDir)
    throw new Refused(`refused: this worktree belongs to another repository`);

  const urls = [
    gitRead(cwd, ["remote", "get-url", "origin"], deps),
    gitRead(cwd, ["remote", "get-url", "--all", "--push", "origin"], deps),
  ];
  for (const url of urls) {
    const lines = url.stdout.split("\n").filter((line) => line !== "");
    if (
      url.code !== 0 ||
      lines.length === 0 ||
      !lines.every((line) => SAME_REPO_URL.test(line))
    ) {
      throw new Refused(
        `refused: every fetch and push URL of origin must be https://github.com/${REPO_SLUG}`,
      );
    }
  }
  const rewrites = gitRead(
    cwd,
    ["config", "--get-regexp", "^url\\..*\\.(push)?insteadof$"],
    deps,
  );
  if (rewrites.code !== 1 || rewrites.stdout !== "") {
    throw new Refused(
      "refused: the repository rewrites URLs (url.<base>.insteadOf or pushInsteadOf)",
    );
  }
  return { commonDir: deps.expectedCommonDir };
}

/** `<home>/Library/Caches/defaultdave-merge-desk`: not writable from the sandbox. */
export function defaultEngineRoot(): string {
  return join(
    userInfo().homedir,
    "Library",
    "Caches",
    "defaultdave-merge-desk",
  );
}

function lstatOrNull(path: string): Stats | null {
  try {
    return lstatSync(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

/** Creates the root 0700 if missing, then refuses a symlink, a foreign owner or group/other write access. */
export function ensureEngineRoot(
  root: string,
  uid: number = userInfo().uid,
): void {
  let stat = lstatOrNull(root);
  if (stat === null) {
    mkdirSync(root, { recursive: true, mode: 0o700 });
    chmodSync(root, 0o700);
    stat = lstatSync(root);
  }
  if (stat.isSymbolicLink() || !stat.isDirectory())
    throw new Refused(`refused: ${root} is not a plain directory`);
  if (stat.uid !== uid) throw new Refused(`refused: ${root} is not yours`);
  if ((stat.mode & 0o022) !== 0)
    throw new Refused(`refused: ${root} is writable by others`);
}

/** Checks the root, makes `run-XXXX` inside it, runs `fn`, and removes the directory however `fn` ends. */
export async function withRunDir<T>(
  engineRoot: string,
  fn: (runDir: string) => Promise<T> | T,
): Promise<T> {
  ensureEngineRoot(engineRoot);
  const runDir = mkdtempSync(join(engineRoot, "run-"));
  try {
    return await fn(runDir);
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
}

const TOKEN_SHAPE = /^[!-~]+$/;

function assertToken(token: string): void {
  if (!TOKEN_SHAPE.test(token)) throw new Error("the App token is malformed");
}

/** Writes the push credentials as a git config file. Returns its path, for GIT_CONFIG_GLOBAL. */
export function writeGitAuth(runDir: string, token: string): string {
  assertToken(token);
  const dir = join(runDir, ".secret-auth");
  mkdirSync(dir, { mode: 0o700 });
  const file = join(dir, "gitconfig");
  const basic = Buffer.from(`x-access-token:${token}`).toString("base64");
  writeFileSync(
    file,
    `[http "https://github.com/"]\n\textraHeader = Authorization: Basic ${basic}\n`,
    { mode: 0o600 },
  );
  return file;
}

/** Writes gh's hosts.yml. Returns the directory, for GH_CONFIG_DIR. */
export function writeGhHosts(runDir: string, token: string): string {
  assertToken(token);
  const dir = join(runDir, ".secret-gh");
  mkdirSync(dir, { mode: 0o700 });
  writeFileSync(
    join(dir, "hosts.yml"),
    `github.com:\n    oauth_token: ${token}\n    git_protocol: https\n    user: x-access-token\n`,
    { mode: 0o600 },
  );
  return dir;
}

function insideRunDir(runDir: string, path: string): boolean {
  const root = resolve(runDir);
  const target = resolve(path);
  return target === root || target.startsWith(root + sep);
}

export interface GitRunOptions {
  runDir: string;
  /** Must be the run dir or inside it: the only git call given the auth file never runs anywhere else. */
  cwd: string;
  authFile?: string | undefined;
  extraConfig?: ConfigPairs | undefined;
  quiet?: boolean | undefined;
}

/** Hardened git in an engine-owned directory (the bare repo a push runs from). */
export function runGit(
  deps: Pick<Deps, "git">,
  args: readonly string[],
  options: GitRunOptions,
): ChildResult {
  if (!insideRunDir(options.runDir, options.cwd))
    throw new Refused("refused: this git call must run in the engine run dir");
  const result = spawnChild(deps.git, args, {
    cwd: options.cwd,
    env: gitEnv({
      tmpdir: options.runDir,
      globalConfig: options.authFile,
      extraConfig: options.extraConfig,
    }),
  });
  return options.quiet ? result : forwardStderr(result);
}

export interface GhRunOptions {
  runDir: string;
  configDir: string;
  input?: Buffer | undefined;
}

/** gh in the run dir. The arguments must name the repository, and never hold the token. */
export function runGh(
  gh: string,
  args: readonly string[],
  options: GhRunOptions,
): ChildResult {
  const at = args.indexOf("--repo");
  if (at < 0 || args[at + 1] !== REPO_SLUG)
    throw new Refused(`refused: gh must run with --repo ${REPO_SLUG}`);
  return forwardStderr(
    spawnChild(gh, args, {
      cwd: options.runDir,
      env: ghEnv(options.runDir, options.configDir),
      input: options.input,
    }),
  );
}
