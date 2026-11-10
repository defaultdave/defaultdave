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
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, expectTypeOf, it } from "vitest";
import {
  type ChildResult,
  type Deps,
  EXPECTED_COMMON_DIR,
  ensureEngineRoot,
  GH,
  ghEnv,
  GIT,
  gitEnv,
  gitRead,
  HARDENING_KEYS,
  locateWorktree,
  NODE,
  Refused,
  REPO_HTTPS_URL,
  runGh,
  runGit,
  withRunDir,
  writeGhHosts,
  writeGitAuth,
} from "./safe-exec";

const here = dirname(fileURLToPath(import.meta.url));
const source = (name: string) => readFileSync(join(here, name), "utf8");
const REAL_GIT = existsSync(GIT)
  ? GIT
  : execFileSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).trim();

const scratchDirs: string[] = [];
afterEach(() => {
  for (const dir of scratchDirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

function scratch(): string {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "safe-exec-")));
  scratchDirs.push(dir);
  return dir;
}

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

/** A repository whose origin is the real HTTPS URL. */
function makeRepo(dir: string, origin = REPO_HTTPS_URL) {
  mkdirSync(dir);
  git(dir, "init", "-q", "-b", "main");
  writeFileSync(join(dir, "a.txt"), "a");
  git(dir, "add", "a.txt");
  git(dir, "commit", "-q", "-m", "one");
  git(dir, "remote", "add", "origin", origin);
  return { dir, gitDir: join(dir, ".git") };
}

function fakeGit(dir: string, body: string): string {
  const path = join(dir, "fake-git");
  writeFileSync(path, `#!/bin/sh\n${body}\n`);
  chmodSync(path, 0o755);
  return path;
}

describe("the frozen interface", () => {
  it("has the agreed types", () => {
    expectTypeOf<Deps>().toEqualTypeOf<{
      git: string;
      expectedCommonDir: string;
    }>();
    expectTypeOf(GIT).toBeString();
    expectTypeOf(GH).toBeString();
    expectTypeOf(NODE).toBeString();
    expectTypeOf(EXPECTED_COMMON_DIR).toBeString();
    expectTypeOf(REPO_HTTPS_URL).toBeString();
    expectTypeOf(HARDENING_KEYS).toEqualTypeOf<
      readonly (readonly [key: string, value: string])[]
    >();
    expectTypeOf(gitRead).toEqualTypeOf<
      (
        cwd: string,
        args: readonly string[],
        deps?: Pick<Deps, "git">,
      ) => { code: number; stdout: string; stderr: string }
    >();
    expectTypeOf(locateWorktree).toEqualTypeOf<
      (
        cwd: string,
        deps?: Pick<Deps, "git" | "expectedCommonDir">,
      ) => { commonDir: string }
    >();
  });

  it("pins the constants", () => {
    expect([GIT, GH, NODE, EXPECTED_COMMON_DIR, REPO_HTTPS_URL]).toEqual([
      "/Library/Developer/CommandLineTools/usr/bin/git",
      "/opt/homebrew/bin/gh",
      "/opt/homebrew/bin/node",
      "/Users/davidfleming/Workspace/defaultdave/.git",
      "https://github.com/defaultdave/defaultdave.git",
    ]);
  });

  it("declares each constant on one line piece 3's grep can find, with prettier-ignore above EXPECTED_COMMON_DIR", () => {
    const lines = source("safe-exec.ts").split("\n");
    for (const name of ["GIT", "GH", "EXPECTED_COMMON_DIR", "REPO_HTTPS_URL"]) {
      const matching = lines.filter(
        (line) =>
          /^export const (GIT|GH|EXPECTED_COMMON_DIR|REPO_HTTPS_URL) = "[^"]+";$/.test(
            line,
          ) && line.startsWith(`export const ${name} =`),
      );
      expect(matching, name).toHaveLength(1);
    }
    const at = lines.findIndex((line) =>
      line.startsWith("export const EXPECTED_COMMON_DIR ="),
    );
    expect(lines[at - 1]).toBe("// prettier-ignore");
  });

  it("pins HARDENING_KEYS", () => {
    expect(HARDENING_KEYS).toEqual([
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
    ]);
  });
});

describe("static properties of the merge-desk scripts", () => {
  const files = readdirSync(here).filter(
    (name) => name.endsWith(".ts") && !name.endsWith(".test.ts"),
  );
  const specifiers = (name: string) =>
    [...source(name).matchAll(/^\s*(?:import|\}) .*?from "([^"]+)"/gm)].map(
      (match) => match[1],
    );

  it("lets only safe-exec.ts and scope-check.ts import node:child_process", () => {
    const importers = files.filter((name) =>
      specifiers(name).includes("node:child_process"),
    );
    expect(importers.sort()).toEqual(["safe-exec.ts", "scope-check.ts"]);
  });

  it("gives every spawnSync an env and a cwd", () => {
    const text = source("safe-exec.ts");
    const calls = [...text.matchAll(/spawnSync\(/g)];
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) {
      const body = text.slice(call.index, text.indexOf("});", call.index));
      expect(body).toMatch(/\benv:/);
      expect(body).toMatch(/\bcwd:/);
    }
  });

  it.each([
    ["agent-git.ts", ["./app-token.ts", "./safe-exec.ts"]],
    ["post-check.ts", ["./app-token.ts", "./safe-exec.ts", "./scope-check.ts"]],
    ["safe-exec.ts", []],
  ])("%s imports only node: modules and %j", (name, allowed) => {
    for (const specifier of specifiers(name))
      expect(
        specifier?.startsWith("node:") === true ||
          allowed.includes(specifier ?? ""),
        `${name} imports ${specifier ?? ""}`,
      ).toBe(true);
  });

  it.each(["agent-git.ts", "post-check.ts", "safe-exec.ts"])(
    "%s never reads the process environment",
    (name) => {
      expect(source(name)).not.toContain("process.env");
    },
  );
});

describe("child environments", () => {
  it("builds a git env from nothing, with the hardening keys in order", () => {
    const env = gitEnv({ tmpdir: "/run" });
    expect(env).toMatchObject({
      PATH: "/usr/bin:/bin:/usr/sbin:/sbin",
      HOME: userInfo().homedir,
      TMPDIR: "/run",
      LANG: "C",
      LC_ALL: "C",
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: "/dev/null",
      GIT_TERMINAL_PROMPT: "0",
      GIT_NO_REPLACE_OBJECTS: "1",
      GIT_OPTIONAL_LOCKS: "0",
      GIT_PROTOCOL_FROM_USER: "0",
      GIT_CONFIG_COUNT: String(HARDENING_KEYS.length),
    });
    HARDENING_KEYS.forEach(([key, value], index) => {
      expect(env[`GIT_CONFIG_KEY_${String(index)}`]).toBe(key);
      expect(env[`GIT_CONFIG_VALUE_${String(index)}`]).toBe(value);
    });
    expect(Object.keys(env)).toHaveLength(12 + 2 * HARDENING_KEYS.length);
  });

  it("appends extra config after the hardening keys, so it wins", () => {
    const env = gitEnv({
      tmpdir: "/run",
      extraConfig: [["protocol.file.allow", "always"]],
      globalConfig: "/auth",
    });
    const last = String(HARDENING_KEYS.length);
    expect(env.GIT_CONFIG_COUNT).toBe(String(HARDENING_KEYS.length + 1));
    expect(env[`GIT_CONFIG_KEY_${last}`]).toBe("protocol.file.allow");
    expect(env.GIT_CONFIG_GLOBAL).toBe("/auth");
  });

  it("builds the gh env with the config dir and no token", () => {
    expect(ghEnv("/run", "/run/.secret-gh")).toEqual({
      PATH: "/usr/bin:/bin:/usr/sbin:/sbin",
      HOME: userInfo().homedir,
      TMPDIR: "/run",
      LANG: "C",
      LC_ALL: "C",
      GH_HOST: "github.com",
      GH_CONFIG_DIR: "/run/.secret-gh",
      GH_PROMPT_DISABLED: "1",
      GH_NO_UPDATE_NOTIFIER: "1",
      GH_NO_EXTENSION_UPDATE_NOTIFIER: "1",
      GH_PAGER: "cat",
      NO_COLOR: "1",
    });
  });
});

describe("gitRead", () => {
  it.each([
    ["fetch", ["fetch", "origin"]],
    ["push", ["push", "origin", "main"]],
    ["a config write", ["config", "user.name", "x"]],
    ["config --unset", ["config", "--unset", "user.name"]],
    ["a symbolic-ref write", ["symbolic-ref", "HEAD", "refs/heads/x"]],
    ["remote add", ["remote", "add", "x", "y"]],
    ["a leading -c", ["-c", "core.pager=x", "rev-parse", "HEAD"]],
    ["status", ["status"]],
    ["nothing", []],
  ])("refuses %s before running anything", (_n, args) => {
    expect(() => gitRead(here, args, { git: "/does/not/exist" })).toThrow(
      /^refused:/,
    );
  });

  it("returns a nonzero exit instead of throwing", () => {
    const dir = scratch();
    const repo = makeRepo(join(dir, "r"));
    const result = gitRead(repo.dir, ["config", "--get", "no.such"], {
      git: REAL_GIT,
    });
    expect(result.code).toBe(1);
  });

  it.each([
    [["rev-parse", "--verify", "HEAD"], 0],
    [["symbolic-ref", "--short", "-q", "HEAD"], 0],
    [["remote", "get-url", "origin"], 0],
    [["config", "--get", "remote.origin.url"], 0],
    [["config", "--get-regexp", "^remote"], 0],
  ])("runs the read-only call %j", (args, code) => {
    const dir = scratch();
    const repo = makeRepo(join(dir, "r"));
    expect(gitRead(repo.dir, args, { git: REAL_GIT }).code).toBe(code);
  });
});

describe("locateWorktree", () => {
  it("returns the constant for a worktree of the repo, from the checkout and from a linked worktree", () => {
    const dir = scratch();
    const repo = makeRepo(join(dir, "r"));
    const deps = { git: REAL_GIT, expectedCommonDir: repo.gitDir };
    expect(locateWorktree(repo.dir, deps)).toEqual({ commonDir: repo.gitDir });
    const linked = join(dir, "linked");
    git(repo.dir, "worktree", "add", "-q", "-b", "unit/l", linked);
    expect(locateWorktree(linked, deps)).toEqual({ commonDir: repo.gitDir });
  });

  it("refuses another repository's common dir", () => {
    const dir = scratch();
    const repo = makeRepo(join(dir, "r"));
    const other = makeRepo(join(dir, "o"));
    expect(() =>
      locateWorktree(other.dir, {
        git: REAL_GIT,
        expectedCommonDir: repo.gitDir,
      }),
    ).toThrow(/^refused: this worktree belongs to another repository/);
  });

  it.each([
    ["a newline", "printf '/tmp/x\\n/tmp/y/.git\\n'"],
    ["a double quote", "printf '/tmp/a\"b/.git\\n'"],
    ["a control character", "printf '/tmp/a\\001b/.git\\n'"],
    ["a relative path", "printf '.git\\n'"],
    ["no output", "exit 0"],
    ["a failure", "exit 1"],
  ])("refuses a common dir with %s", (_n, body) => {
    const dir = scratch();
    expect(() =>
      locateWorktree(dir, {
        git: fakeGit(dir, body),
        expectedCommonDir: "/tmp/x/.git",
      }),
    ).toThrow(/^refused:/);
  });

  it.each([
    ["an SSH fetch URL", "git@github.com:defaultdave/defaultdave.git"],
    ["another repo", "https://github.com/someone/else.git"],
    ["a longer path", "https://github.com/defaultdave/defaultdave-x.git"],
    ["http", "http://github.com/defaultdave/defaultdave.git"],
  ])("refuses %s as origin", (_n, origin) => {
    const dir = scratch();
    const repo = makeRepo(join(dir, "r"), origin);
    expect(() =>
      locateWorktree(repo.dir, {
        git: REAL_GIT,
        expectedCommonDir: repo.gitDir,
      }),
    ).toThrow(/^refused: every fetch and push URL/);
  });

  it("accepts the URL without .git", () => {
    const dir = scratch();
    const repo = makeRepo(
      join(dir, "r"),
      "https://github.com/defaultdave/defaultdave",
    );
    expect(
      locateWorktree(repo.dir, {
        git: REAL_GIT,
        expectedCommonDir: repo.gitDir,
      }),
    ).toEqual({ commonDir: repo.gitDir });
  });

  it("refuses a second push URL", () => {
    const dir = scratch();
    const repo = makeRepo(join(dir, "r"));
    git(
      repo.dir,
      "remote",
      "set-url",
      "--add",
      "--push",
      "origin",
      REPO_HTTPS_URL,
    );
    git(
      repo.dir,
      "remote",
      "set-url",
      "--add",
      "--push",
      "origin",
      "file:///decoy",
    );
    expect(() =>
      locateWorktree(repo.dir, {
        git: REAL_GIT,
        expectedCommonDir: repo.gitDir,
      }),
    ).toThrow(/^refused: every fetch and push URL/);
  });

  it.each(["insteadOf", "pushInsteadOf"])("refuses any %s", (key) => {
    const dir = scratch();
    const repo = makeRepo(join(dir, "r"));
    git(repo.dir, "config", `url.https://example.com/.${key}`, "ex:");
    expect(() =>
      locateWorktree(repo.dir, {
        git: REAL_GIT,
        expectedCommonDir: repo.gitDir,
      }),
    ).toThrow(/^refused: the repository rewrites URLs/);
  });
});

describe("the engine root and run dir", () => {
  it("creates a missing root 0700", () => {
    const root = join(scratch(), "engine");
    ensureEngineRoot(root);
    expect(statSync(root).mode & 0o777).toBe(0o700);
  });

  it("refuses a symlink, a foreign owner and group or other write access", () => {
    const dir = scratch();
    mkdirSync(join(dir, "real"));
    symlinkSync(join(dir, "real"), join(dir, "link"));
    expect(() => {
      ensureEngineRoot(join(dir, "link"));
    }).toThrow(Refused);
    const mine = join(dir, "mine");
    ensureEngineRoot(mine);
    expect(() => {
      ensureEngineRoot(mine, userInfo().uid + 1);
    }).toThrow(/is not yours/);
    chmodSync(mine, 0o720);
    expect(() => {
      ensureEngineRoot(mine);
    }).toThrow(/writable by others/);
    chmodSync(mine, 0o750);
    expect(() => {
      ensureEngineRoot(mine);
    }).not.toThrow();
  });

  it("refuses a file in place of the root", () => {
    const file = join(scratch(), "file");
    writeFileSync(file, "");
    expect(() => {
      ensureEngineRoot(file);
    }).toThrow(Refused);
  });

  it("removes the run dir and its secret files after success and after a throw", async () => {
    const root = join(scratch(), "engine");
    let seen = "";
    await withRunDir(root, (run) => {
      seen = run;
      writeGitAuth(run, "tok");
      writeGhHosts(run, "tok");
      expect(readdirSync(run).sort()).toEqual([".secret-auth", ".secret-gh"]);
    });
    expect(existsSync(seen)).toBe(false);
    await expect(
      withRunDir(root, (run) => {
        writeGhHosts(run, "tok");
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    expect(readdirSync(root)).toEqual([]);
  });

  it("writes the secret files 0600 in 0700 directories", async () => {
    await withRunDir(join(scratch(), "engine"), (run) => {
      const auth = writeGitAuth(run, "tok");
      const hosts = join(writeGhHosts(run, "tok"), "hosts.yml");
      expect(statSync(auth).mode & 0o777).toBe(0o600);
      expect(statSync(hosts).mode & 0o777).toBe(0o600);
      expect(statSync(join(run, ".secret-auth")).mode & 0o777).toBe(0o700);
      expect(statSync(join(run, ".secret-gh")).mode & 0o777).toBe(0o700);
    });
  });

  it.each(["a b", "a\nb", "", "a\u007fb"])(
    "refuses a malformed token %p",
    async (token) => {
      await withRunDir(join(scratch(), "engine"), (run) => {
        expect(() => writeGitAuth(run, token)).toThrow(/malformed/);
        expect(() => writeGhHosts(run, token)).toThrow(/malformed/);
      });
    },
  );

  it("runs network git only inside the run dir", async () => {
    const root = join(scratch(), "engine");
    await withRunDir(root, (run) => {
      expect(() =>
        runGit({ git: REAL_GIT }, ["push"], { runDir: run, cwd: here }),
      ).toThrow(Refused);
      expect(() =>
        runGit({ git: REAL_GIT }, ["push"], { runDir: run, cwd: `${run}-x` }),
      ).toThrow(Refused);
    });
  });

  it("runs gh only with --repo defaultdave/defaultdave", async () => {
    await withRunDir(join(scratch(), "engine"), (run) => {
      const options = { runDir: run, configDir: run };
      for (const args of [[], ["pr", "list"], ["--repo", "other/x"]])
        expect(() => runGh("/does/not/exist", args, options)).toThrow(Refused);
    });
  });

  it("reports a binary that cannot run", async () => {
    await withRunDir(join(scratch(), "engine"), (run) => {
      const result: () => ChildResult = () =>
        runGh("/does/not/exist", ["--repo", "defaultdave/defaultdave"], {
          runDir: run,
          configDir: run,
        });
      expect(result).toThrow(/could not run/);
    });
  });
});
