import { execFileSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir, userInfo } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  automerge,
  type Deps,
  issueBody,
  issueComment,
  main,
  MAX_BODY_CHARS,
  pr,
  prBody,
  push,
  realDeps,
  Refused,
  review,
} from "./agent-git";
import {
  defaultEngineRoot,
  EXPECTED_COMMON_DIR,
  GH,
  GIT,
  REPO_HTTPS_URL,
} from "./safe-exec";

const TOKEN = "ghs_FAKE_token_0123456789";
const REPO = "defaultdave/defaultdave";
const BRANCH = "unit/merge-desk";
const VIEW_OK = {
  number: 42,
  headRefName: BRANCH,
  baseRefName: "main",
  isCrossRepository: false,
  headRepositoryOwner: { id: "x", login: "defaultdave" },
};
/** The macOS CLT git when present, else the first git on the PATH. */
const REAL_GIT = existsSync(GIT)
  ? GIT
  : execFileSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).trim();

const scratchDirs: string[] = [];
afterEach(() => {
  vi.unstubAllEnvs();
  for (const dir of scratchDirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

/** Test-side git: a clean environment, never the code under test. */
function git(cwd: string, ...args: string[]): string {
  return execFileSync(REAL_GIT, args, {
    cwd,
    encoding: "utf8",
    env: {
      PATH: "/usr/bin:/bin",
      NODE_ENV: "test",
      GIT_CONFIG_GLOBAL: "/dev/null",
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_AUTHOR_NAME: "t",
      GIT_AUTHOR_EMAIL: "t@example.com",
      GIT_COMMITTER_NAME: "t",
      GIT_COMMITTER_EMAIL: "t@example.com",
    },
  }).trim();
}

function script(path: string, body: string): string {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, `#!/bin/sh\n${body}\n`);
  chmodSync(path, 0o755);
  return path;
}

interface Fixture {
  scratch: string;
  root: string;
  gitDir: string;
  sha: string;
  remote: string;
  rec: string;
  marker: string;
  /** A repository the code under test must never touch. */
  decoy: string;
  gitWrapper: string;
  ghFake: string;
}

function makeFixture(): Fixture {
  const scratch = realpathSync(mkdtempSync(join(tmpdir(), "agent-git-")));
  scratchDirs.push(scratch);
  const root = join(scratch, "repo");
  mkdirSync(root);
  git(root, "init", "-q", "-b", "main");
  writeFileSync(join(root, "a.txt"), "a");
  git(root, "add", "a.txt");
  git(root, "commit", "-q", "-m", "one");
  git(root, "checkout", "-q", "-b", BRANCH);
  writeFileSync(join(root, "a.txt"), "b");
  git(root, "commit", "-q", "-am", "two");
  git(root, "remote", "add", "origin", REPO_HTTPS_URL);
  const remote = join(scratch, "remote.git");
  git(scratch, "init", "-q", "--bare", "-b", "main", remote);
  const decoy = join(scratch, "decoy.git");
  git(scratch, "init", "-q", "--bare", "-b", "main", decoy);
  const rec = join(scratch, "rec");
  mkdirSync(rec);
  writeFileSync(join(rec, "view.json"), JSON.stringify(VIEW_OK));
  // Each fake records its environment, cwd, argv and stdin, numbered per call.
  const record = (tool: string) =>
    `REC='${rec}'
n=$(cat "$REC/${tool}n" 2>/dev/null || echo 0); n=$((n+1)); echo $n > "$REC/${tool}n"
env > "$REC/${tool}-$n-env"; pwd -P > "$REC/${tool}-$n-cwd"; printf '%s\\n' "$@" > "$REC/${tool}-$n-argv"`;
  const gitWrapper = script(
    join(scratch, "bin", "git"),
    `${record("git")}
[ -f "$GIT_CONFIG_GLOBAL" ] && cp -p "$GIT_CONFIG_GLOBAL" "$REC/git-$n-global"
[ -f "$PWD/objects/info/alternates" ] && cp "$PWD/objects/info/alternates" "$REC/git-$n-alternates"
exec '${REAL_GIT}' "$@"`,
  );
  const ghFake = script(
    join(scratch, "bin", "gh"),
    `${record("gh")}
cat > "$REC/gh-$n-stdin"
cp -p "$GH_CONFIG_DIR/hosts.yml" "$REC/gh-$n-hosts" 2>/dev/null
ls -ld "$GH_CONFIG_DIR" > "$REC/gh-$n-dir" 2>/dev/null
[ -f "$REC/fail" ] && exit 1
if [ "$1 $2" = "pr view" ]; then cat "$REC/view.json"; else echo "https://example.test/ok"; fi`,
  );
  return {
    scratch,
    root,
    gitDir: join(root, ".git"),
    sha: git(root, "rev-parse", "HEAD"),
    remote,
    rec,
    marker: join(scratch, "MARKER"),
    decoy,
    gitWrapper,
    ghFake,
  };
}

function makeDeps(fx: Fixture, overrides: Partial<Deps> = {}): Deps {
  return {
    git: fx.gitWrapper,
    gh: fx.ghFake,
    expectedCommonDir: fx.gitDir,
    engineRoot: join(fx.scratch, "engine"),
    pushUrl: `file://${fx.remote}`,
    cwd: fx.root,
    gitConfig: [["protocol.file.allow", "always"]],
    print: () => undefined,
    token: () => Promise.resolve(TOKEN),
    ...overrides,
  };
}

interface Call {
  argv: string[];
  env: Record<string, string>;
  cwd: string;
  stdin: string;
}
const SHELL_NOISE = new Set(["PWD", "SHLVL", "_", "OLDPWD"]);

function readCalls(fx: Fixture, tool: "gh" | "git"): Call[] {
  const counter = join(fx.rec, `${tool}n`);
  const count = existsSync(counter) ? Number(readFileSync(counter, "utf8")) : 0;
  return Array.from({ length: count }, (_, index) => {
    const base = join(fx.rec, `${tool}-${String(index + 1)}`);
    const text = (suffix: string) =>
      existsSync(`${base}-${suffix}`)
        ? readFileSync(`${base}-${suffix}`, "utf8")
        : "";
    const env: Record<string, string> = {};
    for (const line of text("env").split("\n")) {
      const at = line.indexOf("=");
      const key = line.slice(0, at);
      if (at > 0 && !SHELL_NOISE.has(key)) env[key] = line.slice(at + 1);
    }
    return {
      argv: text("argv").split("\n").slice(0, -1),
      env,
      cwd: text("cwd").trim(),
      stdin: text("stdin"),
    };
  });
}

/** Names of every file under the engine root, or null when the root does not exist. */
function engineEntries(deps: Deps): string[] | null {
  return existsSync(deps.engineRoot) ? readdirSync(deps.engineRoot) : null;
}

function everything(call: Call): string {
  return JSON.stringify([call.argv, call.env, call.cwd]);
}

function listTree(dir: string): string {
  return readdirSync(dir, { recursive: true })
    .map(String)
    .sort()
    .map((name) => `${name}:${String(statSync(join(dir, name)).size)}`)
    .join("\n");
}

describe("push", () => {
  it("sends the branch commit from a bare repo in the run dir, with the auth file and no token in env or argv", async () => {
    const fx = makeFixture();
    const deps = makeDeps(fx);
    await push(BRANCH, deps);

    expect(git(fx.scratch, "--git-dir", fx.remote, "rev-parse", BRANCH)).toBe(
      fx.sha,
    );
    const calls = readCalls(fx, "git");
    const names = calls.map((call) => call.argv[0]);
    expect(names).toEqual([
      "rev-parse",
      "remote",
      "remote",
      "config",
      "rev-parse",
      "init",
      "push",
    ]);
    const init = calls[5];
    const sent = calls[6];
    expect(init?.argv.slice(0, 3)).toEqual(["init", "--bare", "--template="]);
    expect(init?.argv[3]).toMatch(/\/run-[^/]+\/push\.git$/);
    expect(sent?.argv).toEqual([
      "push",
      "--no-verify",
      "--porcelain",
      `file://${fx.remote}`,
      `${fx.sha}:refs/heads/${BRANCH}`,
    ]);
    expect(sent?.cwd.endsWith("/push.git")).toBe(true);
    expect(readFileSync(join(fx.rec, "git-7-alternates"), "utf8")).toBe(
      `${join(fx.gitDir, "objects")}\n`,
    );
    const authFile = join(fx.rec, "git-7-global");
    expect(readFileSync(authFile, "utf8")).toBe(
      `[http "https://github.com/"]\n\textraHeader = Authorization: Basic ${Buffer.from(`x-access-token:${TOKEN}`).toString("base64")}\n`,
    );
    expect(statSync(authFile).mode & 0o777).toBe(0o600);
    expect(sent?.env.GIT_CONFIG_GLOBAL).toMatch(
      /\/run-[^/]+\/\.secret-auth\/gitconfig$/,
    );
    for (const call of calls) expect(everything(call)).not.toContain(TOKEN);
    expect(engineEntries(deps)).toEqual([]);
  });

  it.each([
    "unit/merge-desk",
    "unit/merge-desk-port",
    "pm/status-2026-11-06",
    "revert/pr-12",
  ])("allows %s", async (branch) => {
    const fx = makeFixture();
    git(fx.root, "update-ref", `refs/heads/${branch}`, "HEAD");
    await push(branch, makeDeps(fx));
    expect(git(fx.scratch, "--git-dir", fx.remote, "rev-parse", branch)).toBe(
      fx.sha,
    );
  });

  it.each([
    "main",
    "integration",
    "sync/2026-11-06",
    "feature/x",
    "unit/",
    "unit/Merge",
    "unit/a/b",
    "unit/x/../main",
    "unit/x-",
    "pm/",
    "pm/a/b",
    "revert/12",
    "revert/pr-",
    "revert/pr-1x",
    "--force",
    "origin/main",
    "",
  ])("refuses %p and touches nothing", async (branch) => {
    const fx = makeFixture();
    const deps = makeDeps(fx);
    await expect(push(branch, deps)).rejects.toBeInstanceOf(Refused);
    expect(readCalls(fx, "git")).toHaveLength(0);
    expect(engineEntries(deps)).toBeNull();
  });

  it("refuses an allowed name with no local branch, and touches no path", async () => {
    const fx = makeFixture();
    const deps = makeDeps(fx);
    await expect(push("unit/ghost", deps)).rejects.toBeInstanceOf(Refused);
    expect(engineEntries(deps)).toBeNull();
  });

  it("reports a failing push without the token, and removes the run dir", async () => {
    const fx = makeFixture();
    const deps = makeDeps(fx, { pushUrl: `file://${fx.scratch}/missing.git` });
    const error = await push(BRANCH, deps).catch((e: unknown) => e);
    expect((error as Error).message).toMatch(/^git push failed \(exit \d+\)$/);
    expect(engineEntries(deps)).toEqual([]);
  });
});

describe("pr", () => {
  it("opens from the checked-out branch into main with the body on stdin and no path for gh", async () => {
    const fx = makeFixture();
    const deps = makeDeps(fx);
    await pr("main", "merge-desk: scripts", ["--body", "the body\n"], deps);
    const [call] = readCalls(fx, "gh");
    expect(call?.argv).toEqual([
      "pr",
      "create",
      "--repo",
      REPO,
      "--base",
      "main",
      "--head",
      BRANCH,
      "--title=merge-desk: scripts",
      "--body-file",
      "-",
    ]);
    expect(call?.stdin).toBe("the body\n");
    expect(engineEntries(deps)).toEqual([]);
  });

  it("keeps a title that starts with a dash inside one --title= argument", async () => {
    const fx = makeFixture();
    await pr("main", "--web", ["--body", "b"], makeDeps(fx));
    expect(readCalls(fx, "gh")[0]?.argv).toContain("--title=--web");
  });

  it("accepts a revert branch head", async () => {
    const fx = makeFixture();
    git(fx.root, "checkout", "-q", "-b", "revert/pr-3");
    await pr("main", "Revert: x", ["--body", "b"], makeDeps(fx));
    expect(readCalls(fx, "gh")[0]?.argv).toContain("revert/pr-3");
  });

  it.each([
    ["a base other than main", ["integration", "t", "--body", "b"]],
    ["an empty base", ["", "t", "--body", "b"]],
    ["no body", ["main", "t"]],
    ["a file path", ["main", "t", "body.md"]],
    ["the - form", ["main", "t", "-"]],
    ["--body=<text>", ["main", "t", "--body=x"]],
    ["an empty body", ["main", "t", "--body", ""]],
    ["extra arguments", ["main", "t", "--body", "a", "b"]],
    [
      "an over-long body",
      ["main", "t", "--body", "x".repeat(MAX_BODY_CHARS + 1)],
    ],
  ])("refuses %s and touches nothing", async (_name, args) => {
    const fx = makeFixture();
    const deps = makeDeps(fx);
    const [base = "", title = "", ...rest] = args;
    await expect(pr(base, title, rest, deps)).rejects.toBeInstanceOf(Refused);
    expect(readCalls(fx, "gh")).toHaveLength(0);
    expect(engineEntries(deps)).toBeNull();
  });

  it.each(["main", "feature/x"])("refuses a head of %s", async (branch) => {
    const fx = makeFixture();
    git(fx.root, "checkout", "-q", "-B", branch);
    const deps = makeDeps(fx);
    await expect(pr("main", "t", ["--body", "b"], deps)).rejects.toBeInstanceOf(
      Refused,
    );
    expect(engineEntries(deps)).toBeNull();
  });

  it("refuses a detached HEAD", async () => {
    const fx = makeFixture();
    git(fx.root, "checkout", "-q", "--detach");
    const deps = makeDeps(fx);
    await expect(pr("main", "t", ["--body", "b"], deps)).rejects.toBeInstanceOf(
      Refused,
    );
    expect(engineEntries(deps)).toBeNull();
  });
});

const lookups = [
  {
    name: "automerge",
    call: (target: string, deps: Deps) => automerge(target, deps),
    final: (n: string) => [
      "pr",
      "merge",
      n,
      "--repo",
      REPO,
      "--auto",
      "--squash",
    ],
  },
  {
    name: "review",
    call: (target: string, deps: Deps) => review(target, deps),
    final: (n: string) => [
      "pr",
      "edit",
      n,
      "--repo",
      REPO,
      "--add-reviewer",
      "defaultdave",
    ],
  },
  {
    name: "pr-body",
    call: (target: string, deps: Deps) =>
      prBody(target, ["--body", "hi"], deps),
    final: (n: string) => ["pr", "edit", n, "--repo", REPO, "--body-file", "-"],
  },
];

describe("automerge, review and pr-body", () => {
  it.each(lookups)(
    "$name views the PR first, then acts on its number, not the caller's text",
    async ({ call, final }) => {
      const fx = makeFixture();
      const deps = makeDeps(fx);
      await call("revert/pr-3", deps);
      const calls = readCalls(fx, "gh");
      expect(calls[0]?.argv).toEqual([
        "pr",
        "view",
        "revert/pr-3",
        "--repo",
        REPO,
        "--json",
        "number,headRefName,baseRefName,isCrossRepository,headRepositoryOwner",
      ]);
      expect(calls[1]?.argv).toEqual(final("42"));
      expect(calls[1]?.argv).not.toContain("--admin");
      expect(calls).toHaveLength(2);
    },
  );

  it.each(lookups)("$name accepts a PR number", async ({ call }) => {
    const fx = makeFixture();
    await call("42", makeDeps(fx));
    expect(readCalls(fx, "gh")[0]?.argv[2]).toBe("42");
  });

  it.each([
    ["a cross-repo PR", { isCrossRepository: true }],
    ["another owner", { headRepositoryOwner: { login: "someone" } }],
    ["no owner", { headRepositoryOwner: null }],
    ["an unknown head", { headRefName: "feature/x" }],
    ["a head of main", { headRefName: "main" }],
    ["another base", { baseRefName: "integration" }],
  ])("%s is refused after the view and never acted on", async (_n, patch) => {
    for (const { call } of lookups) {
      const fx = makeFixture();
      writeFileSync(
        join(fx.rec, "view.json"),
        JSON.stringify({ ...VIEW_OK, ...patch }),
      );
      await expect(call("42", makeDeps(fx))).rejects.toBeInstanceOf(Refused);
      expect(readCalls(fx, "gh")).toHaveLength(1);
    }
  });

  it.each([
    "https://github.com/someone/else/pull/1",
    "-x",
    "--admin",
    "0",
    "01",
    "main",
    "feature/x",
    "",
  ])("refuses the target %p without a gh call or a path", async (target) => {
    for (const { call } of lookups) {
      const fx = makeFixture();
      const deps = makeDeps(fx);
      await expect(call(target, deps)).rejects.toBeInstanceOf(Refused);
      expect(readCalls(fx, "gh")).toHaveLength(0);
      expect(engineEntries(deps)).toBeNull();
    }
  });

  it("fails when the lookup fails", async () => {
    const fx = makeFixture();
    writeFileSync(join(fx.rec, "fail"), "");
    const deps = makeDeps(fx);
    await expect(automerge("42", deps)).rejects.toThrow("gh pr view failed");
    expect(engineEntries(deps)).toEqual([]);
  });
});

describe("issue and PR body writes", () => {
  const writers = [
    {
      name: "issueComment",
      call: issueComment,
      target: "12",
      expected: ["issue", "comment", "12"],
    },
    {
      name: "issueBody",
      call: issueBody,
      target: "12",
      expected: ["issue", "edit", "12"],
    },
    {
      name: "prBody",
      call: prBody,
      target: "42",
      expected: ["pr", "edit", "42"],
    },
  ];
  const LITERAL =
    'it\'s "quoted"\nline two $(id) `id` ${HOME} \\n ; | > & é\u{1F600}';

  it.each(writers)(
    "$name passes the --body text to gh on stdin, byte for byte, with no token in env or argv",
    async ({ call, target, expected }) => {
      const fx = makeFixture();
      await call(target, ["--body", LITERAL], makeDeps(fx));
      const calls = readCalls(fx, "gh");
      const last = calls[calls.length - 1];
      expect(last?.argv).toEqual([
        ...expected,
        "--repo",
        REPO,
        "--body-file",
        "-",
      ]);
      expect(last?.stdin).toBe(LITERAL);
      expect(last?.argv).not.toContain(LITERAL);
      for (const seen of calls) expect(everything(seen)).not.toContain(TOKEN);
    },
  );

  const bad: [string, string[]][] = [
    ["a missing --body", []],
    ["--body with no value", ["--body"]],
    ["the old - form", ["-"]],
    ["a file path", ["body.md"]],
    ["the --body=<text> spelling", ["--body=hello"]],
    ["an extra argument", ["--body", "hello", "world"]],
    ["a flag before --body", ["--repo", "--body", "hello"]],
    ["an empty body", ["--body", ""]],
    ["a whitespace-only body", ["--body", " \n\t\n"]],
  ];
  it.each(bad)(
    "every writer refuses %s and touches nothing",
    async (_n, rest) => {
      for (const { call, target } of writers) {
        const fx = makeFixture();
        const deps = makeDeps(fx);
        await expect(call(target, rest, deps)).rejects.toBeInstanceOf(Refused);
        expect(readCalls(fx, "gh")).toHaveLength(0);
        expect(engineEntries(deps)).toBeNull();
      }
    },
  );

  it("names --body when it refuses the old - form", async () => {
    const fx = makeFixture();
    await expect(issueComment("1", ["-"], makeDeps(fx))).rejects.toThrow(
      /--body/,
    );
  });

  it.each([
    ["exactly 65,536 characters", MAX_BODY_CHARS, true],
    ["65,537 characters", MAX_BODY_CHARS + 1, false],
  ])("the limit: %s", async (_n, size, accepted) => {
    const fx = makeFixture();
    const deps = makeDeps(fx);
    const run = issueComment("1", ["--body", "x".repeat(size)], deps);
    if (accepted) {
      await run;
      expect(readCalls(fx, "gh")[0]?.stdin).toHaveLength(size);
    } else {
      await expect(run).rejects.toThrow(/65,?536 characters/);
      expect(engineEntries(deps)).toBeNull();
    }
  });

  it("counts characters, not bytes", async () => {
    const fx = makeFixture();
    await issueComment(
      "1",
      ["--body", "é".repeat(MAX_BODY_CHARS)],
      makeDeps(fx),
    );
    expect(readCalls(fx, "gh")).toHaveLength(1);
  });

  it.each(["0", "-1", "1.5", "abc", "12 ", "--repo", ""])(
    "issue commands refuse the issue number %p",
    async (issue) => {
      const fx = makeFixture();
      const deps = makeDeps(fx);
      await expect(
        issueComment(issue, ["--body", "hi"], deps),
      ).rejects.toBeInstanceOf(Refused);
      await expect(
        issueBody(issue, ["--body", "hi"], deps),
      ).rejects.toBeInstanceOf(Refused);
      expect(engineEntries(deps)).toBeNull();
    },
  );

  it("echoes gh's output through print", async () => {
    const fx = makeFixture();
    const printed: string[] = [];
    await issueComment(
      "1",
      ["--body", "hi"],
      makeDeps(fx, { print: (text) => printed.push(text) }),
    );
    expect(printed).toEqual(["https://example.test/ok\n"]);
  });
});

describe("the gh child", () => {
  const HOSTILE = {
    GH_TOKEN: "evil-gh-token",
    GITHUB_TOKEN: "evil-github-token",
    GH_HOST: "evil.example.com",
    GH_CONFIG_DIR: "/evil/gh",
    GH_DEBUG: "api",
    GH_REPO: "someone/else",
    PAGER: "/evil/pager",
    EDITOR: "/evil/editor",
    VISUAL: "/evil/visual",
    BROWSER: "/evil/browser",
    HTTPS_PROXY: "http://127.0.0.1:9",
    ALL_PROXY: "http://127.0.0.1:9",
    SSL_CERT_FILE: "/evil/ca.pem",
    SSL_CERT_DIR: "/evil",
    GODEBUG: "x=1",
    DEBUG: "*",
    NODE_OPTIONS: "--require /evil.js",
    DEVELOPER_DIR: "/evil",
    SDKROOT: "/evil",
    TOOLCHAINS: "evil",
    HOME: "/evil",
    TMPDIR: "/evil/tmp",
    PATH: "/evil/bin",
    DEFAULTDAVE_APP_CONF: "/evil/app.conf",
  };

  it("runs GH in the run dir with exactly the designed environment, whatever the parent has", async () => {
    const fx = makeFixture();
    for (const [key, value] of Object.entries(HOSTILE)) vi.stubEnv(key, value);
    const deps = makeDeps(fx);
    await issueComment("5", ["--body", "hi"], deps);
    const [call] = readCalls(fx, "gh");
    const run = call?.cwd ?? "";
    expect(run).toMatch(/\/engine\/run-[^/]+$/);
    expect(call?.env).toEqual({
      PATH: "/usr/bin:/bin:/usr/sbin:/sbin",
      HOME: userInfo().homedir,
      TMPDIR: run,
      LANG: "C",
      LC_ALL: "C",
      GH_HOST: "github.com",
      GH_CONFIG_DIR: `${run}/.secret-gh`,
      GH_PROMPT_DISABLED: "1",
      GH_NO_UPDATE_NOTIFIER: "1",
      GH_NO_EXTENSION_UPDATE_NOTIFIER: "1",
      GH_PAGER: "cat",
      NO_COLOR: "1",
    });
    expect(call?.argv).toContain("--repo");
  });

  it("writes the token only to hosts.yml, 0600 in a 0700 directory, and removes it afterwards", async () => {
    const fx = makeFixture();
    const deps = makeDeps(fx);
    await issueComment("5", ["--body", "hi"], deps);
    const hosts = join(fx.rec, "gh-1-hosts");
    expect(readFileSync(hosts, "utf8")).toContain(`oauth_token: ${TOKEN}`);
    expect(statSync(hosts).mode & 0o777).toBe(0o600);
    expect(readFileSync(join(fx.rec, "gh-1-dir"), "utf8")).toMatch(
      /^drwx------/,
    );
    expect(everything(readCalls(fx, "gh")[0] as Call)).not.toContain(TOKEN);
    expect(engineEntries(deps)).toEqual([]);
  });

  it("removes the run dir when gh fails", async () => {
    const fx = makeFixture();
    writeFileSync(join(fx.rec, "fail"), "");
    const deps = makeDeps(fx);
    await expect(issueComment("5", ["--body", "hi"], deps)).rejects.toThrow(
      "gh issue comment failed (exit 1)",
    );
    expect(engineEntries(deps)).toEqual([]);
  });
});

describe("the engine root", () => {
  it("is created 0700 on the first spawn", async () => {
    const fx = makeFixture();
    const deps = makeDeps(fx);
    await issueComment("5", ["--body", "hi"], deps);
    expect(statSync(deps.engineRoot).mode & 0o777).toBe(0o700);
  });

  it("is refused when it is a symlink, and nothing runs", async () => {
    const fx = makeFixture();
    const deps = makeDeps(fx);
    mkdirSync(join(fx.scratch, "elsewhere"));
    symlinkSync(join(fx.scratch, "elsewhere"), deps.engineRoot);
    await expect(
      issueComment("5", ["--body", "hi"], deps),
    ).rejects.toBeInstanceOf(Refused);
    expect(readCalls(fx, "gh")).toHaveLength(0);
    expect(readdirSync(join(fx.scratch, "elsewhere"))).toEqual([]);
  });

  it("is refused when group or others can write to it", async () => {
    const fx = makeFixture();
    const deps = makeDeps(fx);
    mkdirSync(deps.engineRoot);
    chmodSync(deps.engineRoot, 0o770);
    await expect(
      issueComment("5", ["--body", "hi"], deps),
    ).rejects.toBeInstanceOf(Refused);
    expect(readCalls(fx, "gh")).toHaveLength(0);
  });

  it.each([
    ["no arguments", []],
    ["an unknown subcommand", ["merge", "1"]],
    ["push with two branches", ["push", "unit/a", "unit/b"]],
    ["a refused branch", ["push", "main"]],
    ["a refused target", ["automerge", "-x"]],
    ["a refused base", ["pr", "dev", "t", "--body", "b"]],
    ["a bad body", ["issue-comment", "1", "body.md"]],
  ])("%s exits nonzero and leaves a missing root absent", async (_n, argv) => {
    const fx = makeFixture();
    const deps = makeDeps(fx);
    expect(await main(argv, deps)).not.toBe(0);
    expect(existsSync(deps.engineRoot)).toBe(false);
    expect(readCalls(fx, "gh")).toHaveLength(0);
  });

  it("exits 2 for a refusal and 1 for any other failure", async () => {
    const fx = makeFixture();
    const deps = makeDeps(fx);
    expect(await main(["push", "main"], deps)).toBe(2);
    expect(await main(["bogus"], deps)).toBe(1);
  });
});

describe("realDeps", () => {
  it("creates and stats nothing", () => {
    const root = defaultEngineRoot();
    const before = existsSync(root);
    realDeps();
    expect(existsSync(root)).toBe(before);
  });

  it.runIf(process.platform === "darwin")(
    "takes binaries, common dir, push URL and engine root from constants",
    () => {
      const deps = realDeps();
      expect(deps).toMatchObject({
        git: GIT,
        gh: GH,
        expectedCommonDir: EXPECTED_COMMON_DIR,
        pushUrl: REPO_HTTPS_URL,
        engineRoot: join(
          userInfo().homedir,
          "Library/Caches/defaultdave-merge-desk",
        ),
        gitConfig: [],
      });
    },
  );

  it.runIf(process.platform === "darwin")("points at a git that exists", () => {
    expect(existsSync(GIT)).toBe(true);
  });
});

describe("a hostile repository and parent environment", () => {
  const HOOKS = [
    "pre-push",
    "reference-transaction",
    "post-index-change",
    "post-checkout",
    "post-merge",
    "pre-commit",
    "fsmonitor-watchman",
  ];

  /** Makes a script that leaves the marker if anything ever runs it. */
  const trap = (fx: Fixture, name = "trap") =>
    script(join(fx.scratch, "traps", name), `touch '${fx.marker}'`);
  const hooksDir = (fx: Fixture) => {
    for (const hook of HOOKS) trap(fx, join("hooks", hook));
    return join(fx.scratch, "traps", "hooks");
  };
  const set = (fx: Fixture, key: string, value: string) => {
    git(fx.root, "config", key, value);
  };
  const include = (fx: Fixture) => {
    const file = join(fx.scratch, "inc.cfg");
    writeFileSync(
      file,
      `[core]\n\thooksPath = ${hooksDir(fx)}\n\tfsmonitor = ${trap(fx)}\n`,
    );
    return file;
  };

  const inRepo: Record<string, (fx: Fixture) => void> = {
    "hook files": (fx) => {
      for (const hook of HOOKS)
        script(join(fx.gitDir, "hooks", hook), `touch '${fx.marker}'`);
    },
    "core.hooksPath": (fx) => {
      set(fx, "core.hooksPath", hooksDir(fx));
    },
    "config.worktree": (fx) => {
      set(fx, "extensions.worktreeConfig", "true");
      writeFileSync(
        join(fx.gitDir, "config.worktree"),
        `[core]\n\thooksPath = ${hooksDir(fx)}\n\tfsmonitor = ${trap(fx)}\n`,
      );
    },
    "core.fsmonitor": (fx) => {
      set(fx, "core.fsmonitor", trap(fx));
    },
    "credential.helper": (fx) => {
      set(fx, "credential.helper", trap(fx));
    },
    "include.path": (fx) => {
      set(fx, "include.path", include(fx));
    },
    "includeIf gitdir": (fx) => {
      set(fx, `includeIf.gitdir:${fx.root}/.path`, include(fx));
    },
    "gpg signing": (fx) => {
      set(fx, "gpg.program", trap(fx));
      set(fx, "commit.gpgsign", "true");
      set(fx, "tag.gpgsign", "true");
    },
    "filter and merge drivers": (fx) => {
      writeFileSync(join(fx.root, ".gitattributes"), "* filter=x merge=x\n");
      set(fx, "filter.x.smudge", trap(fx));
      set(fx, "filter.x.clean", trap(fx));
      set(fx, "filter.x.process", trap(fx));
      set(fx, "merge.x.driver", trap(fx));
    },
    "transport and pager config": (fx) => {
      set(fx, "core.sshCommand", trap(fx));
      set(fx, "core.gitProxy", trap(fx));
      set(fx, "core.pager", trap(fx));
      set(fx, "http.proxy", "http://127.0.0.1:9");
      set(fx, "http.sslCAInfo", join(fx.scratch, "missing.pem"));
      set(fx, "remote.origin.receivepack", trap(fx));
      set(fx, "remote.origin.uploadpack", trap(fx));
    },
  };

  const parentEnv = (fx: Fixture): Record<string, string> => {
    const execPath = join(fx.scratch, "exec");
    for (const name of ["git-remote-file", "git-receive-pack", "git-rev-parse"])
      script(join(execPath, name), `touch '${fx.marker}'`);
    return {
      GIT_DIR: fx.decoy,
      GIT_WORK_TREE: join(fx.scratch, "traps"),
      GIT_COMMON_DIR: fx.decoy,
      GIT_INDEX_FILE: join(fx.scratch, "index"),
      GIT_OBJECT_DIRECTORY: join(fx.decoy, "objects"),
      GIT_ALTERNATE_OBJECT_DIRECTORIES: join(fx.decoy, "objects"),
      GIT_NAMESPACE: "evil",
      GIT_CEILING_DIRECTORIES: fx.scratch,
      GIT_EXEC_PATH: execPath,
      GIT_TEMPLATE_DIR: join(fx.scratch, "traps"),
      GIT_CONFIG_COUNT: "1",
      GIT_CONFIG_KEY_0: "core.hooksPath",
      GIT_CONFIG_VALUE_0: hooksDir(fx),
      GIT_CONFIG_PARAMETERS: `'core.hooksPath=${hooksDir(fx)}'`,
      GIT_CONFIG_GLOBAL: include(fx),
      GIT_CONFIG_SYSTEM: include(fx),
      GIT_ASKPASS: trap(fx),
      SSH_ASKPASS: trap(fx),
      GIT_SSH: trap(fx),
      GIT_SSH_COMMAND: trap(fx),
      GIT_PROXY_COMMAND: trap(fx),
      GIT_SSL_NO_VERIFY: "1",
      GIT_SSL_CAINFO: join(fx.scratch, "missing.pem"),
      GIT_TRACE: join(fx.scratch, "trace"),
      GIT_TRACE_CURL: join(fx.scratch, "trace-curl"),
      GIT_CURL_VERBOSE: "1",
      HTTPS_PROXY: "http://127.0.0.1:9",
      https_proxy: "http://127.0.0.1:9",
      HOME: "/evil",
      TMPDIR: "/evil/tmp",
      DEVELOPER_DIR: "/evil",
      PATH: `${join(fx.scratch, "traps", "hooks")}:${process.env.PATH ?? ""}`,
    };
  };

  const scenarios: [string, (fx: Fixture) => void][] = [
    ...Object.entries(inRepo),
    [
      "parent environment variables",
      (fx) => {
        for (const [key, value] of Object.entries(parentEnv(fx)))
          vi.stubEnv(key, value);
      },
    ],
  ];

  it.each(scenarios)(
    "%s: push and pr run no program, touch no decoy, and the right commit lands",
    async (_name, arrange) => {
      const fx = makeFixture();
      arrange(fx);
      const decoyBefore = listTree(fx.decoy);
      const deps = makeDeps(fx);
      await push(BRANCH, deps);
      await pr("main", "t", ["--body", "b"], deps);
      expect(existsSync(fx.marker)).toBe(false);
      expect(existsSync(join(fx.scratch, "trace"))).toBe(false);
      expect(existsSync(join(fx.scratch, "trace-curl"))).toBe(false);
      expect(listTree(fx.decoy)).toBe(decoyBefore);
      expect(git(fx.scratch, "--git-dir", fx.remote, "rev-parse", BRANCH)).toBe(
        fx.sha,
      );
    },
  );

  it("every git child gets exactly the designed environment, whatever the parent has", async () => {
    const fx = makeFixture();
    for (const [key, value] of Object.entries(parentEnv(fx)))
      vi.stubEnv(key, value);
    await push(BRANCH, makeDeps(fx));
    const calls = readCalls(fx, "git");
    expect(calls).toHaveLength(7);
    for (const [index, call] of calls.entries()) {
      const isPush = index === 6;
      const run = call.env.TMPDIR ?? "";
      const keys = Object.keys(call.env).filter(
        (key) => !/^GIT_CONFIG_(KEY|VALUE)_\d+$/.test(key),
      );
      expect(keys.sort()).toEqual(
        [
          "GIT_CONFIG_COUNT",
          "GIT_CONFIG_GLOBAL",
          "GIT_CONFIG_NOSYSTEM",
          "GIT_NO_REPLACE_OBJECTS",
          "GIT_OPTIONAL_LOCKS",
          "GIT_PROTOCOL_FROM_USER",
          "GIT_TERMINAL_PROMPT",
          "HOME",
          "LANG",
          "LC_ALL",
          "PATH",
          "TMPDIR",
        ].sort(),
      );
      expect(call.env).toMatchObject({
        PATH: "/usr/bin:/bin:/usr/sbin:/sbin",
        HOME: userInfo().homedir,
        LANG: "C",
        LC_ALL: "C",
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_TERMINAL_PROMPT: "0",
        GIT_NO_REPLACE_OBJECTS: "1",
        GIT_OPTIONAL_LOCKS: "0",
        GIT_PROTOCOL_FROM_USER: "0",
        GIT_CONFIG_KEY_0: "core.hooksPath",
        GIT_CONFIG_VALUE_0: "/dev/null",
      });
      if (isPush)
        expect(call.env.GIT_CONFIG_GLOBAL).toBe(
          `${run}/.secret-auth/gitconfig`,
        );
      else expect(call.env.GIT_CONFIG_GLOBAL).toBe("/dev/null");
      expect(everything(call)).not.toContain(TOKEN);
    }
  });

  it.each([
    [
      "url.<base>.insteadOf",
      (fx: Fixture) => {
        set(fx, `url.file://${fx.decoy}.insteadOf`, "https://github.com/");
      },
    ],
    [
      "url.<base>.pushInsteadOf",
      (fx: Fixture) => {
        set(fx, `url.file://${fx.decoy}.pushInsteadOf`, "https://github.com/");
      },
    ],
    [
      "an unrelated url.<base>.insteadOf",
      (fx: Fixture) => {
        set(fx, "url.https://example.com/.insteadOf", "ex:");
      },
    ],
    [
      "remote.origin.pushurl",
      (fx: Fixture) => {
        set(fx, "remote.origin.pushurl", `file://${fx.decoy}`);
      },
    ],
    [
      "an SSH origin",
      (fx: Fixture) => {
        set(
          fx,
          "remote.origin.url",
          "git@github.com:defaultdave/defaultdave.git",
        );
      },
    ],
    [
      "another repository's origin",
      (fx: Fixture) => {
        set(fx, "remote.origin.url", "https://github.com/someone/else.git");
      },
    ],
  ])(
    "%s: push and pr are refused and the decoy is untouched",
    async (_n, arrange) => {
      const fx = makeFixture();
      arrange(fx);
      const decoyBefore = listTree(fx.decoy);
      const deps = makeDeps(fx);
      await expect(push(BRANCH, deps)).rejects.toBeInstanceOf(Refused);
      await expect(
        pr("main", "t", ["--body", "b"], deps),
      ).rejects.toBeInstanceOf(Refused);
      expect(listTree(fx.decoy)).toBe(decoyBefore);
      expect(engineEntries(deps)).toBeNull();
      expect(readCalls(fx, "gh")).toHaveLength(0);
    },
  );

  it("refuses a worktree of another repository", async () => {
    const fx = makeFixture();
    const other = join(fx.scratch, "other");
    mkdirSync(other);
    git(other, "init", "-q", "-b", "main");
    git(other, "remote", "add", "origin", REPO_HTTPS_URL);
    const deps = makeDeps(fx, { cwd: other });
    await expect(push(BRANCH, deps)).rejects.toThrow(/another repository/);
    expect(engineEntries(deps)).toBeNull();
  });

  it("works from a linked worktree", async () => {
    const fx = makeFixture();
    const linked = join(fx.scratch, "linked");
    git(fx.root, "worktree", "add", "-q", "-b", "unit/linked", linked);
    const deps = makeDeps(fx, { cwd: linked });
    await push("unit/linked", deps);
    await pr("main", "t", ["--body", "b"], deps);
    expect(readCalls(fx, "gh")[0]?.argv).toContain("unit/linked");
  });

  it.each([
    ["automerge", (deps: Deps) => automerge("42", deps)],
    ["review", (deps: Deps) => review("42", deps)],
    ["pr-body", (deps: Deps) => prBody("42", ["--body", "b"], deps)],
    ["issue-comment", (deps: Deps) => issueComment("1", ["--body", "b"], deps)],
    ["issue-body", (deps: Deps) => issueBody("1", ["--body", "b"], deps)],
  ])("%s never runs git", async (_n, run) => {
    const fx = makeFixture();
    await run(makeDeps(fx));
    expect(readCalls(fx, "git")).toHaveLength(0);
  });
});
