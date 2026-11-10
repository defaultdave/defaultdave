// Runs the installed launchers against a fixture export. The fixture's agent-git.ts and post-check.ts dump their
// env, argv and cwd; worktree.ts and command-guard.ts are the repo's own; safe-exec.ts is the repo's with
// EXPECTED_COMMON_DIR rewritten to the fixture checkout. install.test.ts carries a copy of the fixture builder.
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const HERE = import.meta.dirname;
const real = (name: string) => readFileSync(join(HERE, name), "utf8");
const DUMP =
  "process.stdout.write(JSON.stringify({ env: process.env, argv: process.argv.slice(2), cwd: process.cwd() }));\n";
const SIX = ["HOME", "LANG", "LOGNAME", "PATH", "TMPDIR", "USER"];

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) {
    spawnSync("find", [root, "-type", "d", "-exec", "chmod", "u+w", "{}", "+"]);
    rmSync(root, { recursive: true, force: true });
  }
});

function git(cwd: string, ...args: string[]): string {
  const result = spawnSync(
    "git",
    [
      "-c",
      "user.name=t",
      "-c",
      "user.email=t@t",
      "-c",
      "commit.gpgsign=false",
      ...args,
    ],
    {
      cwd,
      encoding: "utf8",
      env: asEnv({
        PATH: process.env.PATH ?? "/usr/bin:/bin",
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_CONFIG_GLOBAL: "/dev/null",
      }),
    },
  );
  if (result.status !== 0)
    throw new Error(`git ${args.join(" ")}: ${result.stderr}`);
  return result.stdout.trim();
}

interface Launchers {
  root: string;
  prefix: string;
  home: string;
  work: string;
  bin: string;
  exportDir: string;
  stubs: string;
}

/** Builds the fixture repo, installs it under a test prefix and returns the paths. */
function installed(): Launchers {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "md-launch-")));
  roots.push(root);
  const prefix = join(root, "pfx");
  const home = join(root, "home");
  const work = join(root, "work");
  const source = join(root, "src.git");
  const stubs = join(prefix, "stubs");
  const script = join(prefix, ".staging", "boot", "install.sh");
  mkdirSync(dirname(script), { recursive: true });
  mkdirSync(stubs);
  mkdirSync(join(home, ".config", "defaultdave-agents"), { recursive: true });
  mkdirSync(join(work, "scripts", "merge-desk"), { recursive: true });
  git(work, "init", "-q", "-b", "main");
  git(
    work,
    "remote",
    "add",
    "origin",
    "https://github.com/defaultdave/defaultdave",
  );
  const files: Record<string, string> = {
    "agent-git.ts": DUMP,
    "post-check.ts": DUMP,
    "worktree.ts": real("worktree.ts"),
    "command-guard.ts": real("command-guard.ts"),
    "safe-exec.ts": real("safe-exec.ts")
      .replace(
        /(export const EXPECTED_COMMON_DIR\s*=\s*)"[^"]*"/,
        `$1${JSON.stringify(join(work, ".git"))}`,
      )
      .replace(/(export const GIT\s*=\s*)"[^"]*"/, '$1"/usr/bin/git"'),
  };
  for (const [name, content] of Object.entries(files))
    writeFileSync(join(work, "scripts", "merge-desk", name), content);
  git(work, "add", "-A");
  git(work, "commit", "-q", "-m", "fixture");
  git(work, "clone", "-q", "--bare", ".", source);
  symlinkSync(process.execPath, join(stubs, "node"));
  writeFileSync(join(stubs, "gh"), "#!/bin/sh\nexit 0\n", { mode: 0o755 });
  const gitPath = spawnSync("/bin/sh", ["-c", "command -v git"], {
    encoding: "utf8",
  }).stdout.trim();
  symlinkSync(realpathSync(gitPath), join(stubs, "git"));
  writeFileSync(
    join(home, ".config", "defaultdave-agents", "app.conf"),
    `APP_ID=1\nAPP_INSTALLATION_ID=2\nAPP_KEY=${join(home, "missing.pem")}\n`,
  );
  copyFileSync(join(HERE, "install.sh"), script);
  const sha = git(work, "rev-parse", "HEAD");
  const result = spawnSync(
    "bash",
    [
      script,
      sha,
      "--checkout",
      work,
      "--test-prefix",
      prefix,
      "--test-source",
      source,
      "--test-home",
      home,
      "--test-bin",
      stubs,
      "--yes",
    ],
    {
      encoding: "utf8",
      env: asEnv({
        HOME: home,
        PATH: "/usr/bin:/bin",
        TMPDIR: tmpdir(),
      }),
    },
  );
  if (result.status !== 0) throw new Error(`install failed: ${result.stderr}`);
  return {
    root,
    prefix,
    home,
    work,
    bin: join(prefix, "bin", "defaultdave"),
    exportDir: join(prefix, sha),
    stubs,
  };
}

function launch(
  l: Launchers,
  name: string,
  args: string[] = [],
  options: { cwd?: string; env?: Record<string, string>; input?: string } = {},
) {
  const result = spawnSync(join(l.bin, name), args, {
    cwd: options.cwd ?? l.work,
    encoding: "utf8",
    env: asEnv({
      HOME: l.home,
      PATH: "/usr/bin:/bin",
      ...options.env,
    }),
    ...(options.input === undefined ? {} : { input: options.input }),
  });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}

interface Dump {
  env: Record<string, string>;
  argv: string[];
  cwd: string;
}
const dump = (stdout: string) => JSON.parse(stdout) as Dump;

function unlock(path: string) {
  chmodSync(dirname(path), 0o755);
  chmodSync(path, 0o644);
}

describe("agent-git and post-check launchers", () => {
  const l = installed();
  const marker = join(l.root, "marker");
  const hostile: Record<string, string> = {
    NODE_OPTIONS: `--require ${join(l.root, "preload.cjs")}`,
    BASH_ENV: join(l.root, "bashenv.sh"),
    "BASH_FUNC_git%%": "() { echo hijacked; }",
    GIT_DIR: "/nowhere",
    GH_TOKEN: "ghp_fake",
    HTTPS_PROXY: "http://127.0.0.1:9",
    DEFAULTDAVE_APP_CONF: "/nowhere/app.conf",
  };
  writeFileSync(
    join(l.root, "preload.cjs"),
    `require("node:fs").writeFileSync(${JSON.stringify(marker)}, "node");\n`,
  );
  writeFileSync(join(l.root, "bashenv.sh"), `echo bash > ${marker}\n`);

  it.each(["agent-git", "post-check"])(
    "runs %s's target under exactly six env keys",
    (name) => {
      const result = launch(l, name, [], { env: hostile });
      expect(result.code).toBe(0);
      const { env } = dump(result.stdout);
      // macOS adds this one itself to every process it starts.
      delete env.__CF_USER_TEXT_ENCODING;
      const user = spawnSync("id", ["-un"], { encoding: "utf8" }).stdout.trim();
      expect(Object.keys(env).sort()).toEqual(SIX);
      expect(env).toEqual({
        HOME: l.home,
        USER: user,
        LOGNAME: user,
        TMPDIR: `${l.prefix}/tmp`,
        PATH: "/usr/bin:/bin",
        LANG: "en_US.UTF-8",
      });
      expect(existsSync(marker)).toBe(false);
    },
  );

  it("passes agent arguments to the target only, and keeps the cwd", () => {
    const result = launch(l, "agent-git", [
      "issue-comment",
      "1",
      "--body",
      "it's fine",
    ]);
    expect(result.code).toBe(0);
    const out = dump(result.stdout);
    expect(out.argv).toEqual(["issue-comment", "1", "--body", "it's fine"]);
    expect(out.cwd).toBe(l.work);
  });

  it("runs the exported target, never a worktree copy", () => {
    const shadow = join(l.work, "scripts", "merge-desk", "agent-git.ts");
    writeFileSync(
      shadow,
      `require("node:fs").writeFileSync(${JSON.stringify(marker)}, "shadow");\n`,
    );
    const result = launch(l, "agent-git");
    expect(result.code).toBe(0);
    expect(dump(result.stdout).argv).toEqual([]);
    expect(existsSync(marker)).toBe(false);
  });

  it("never runs a node found on the caller's PATH", () => {
    const fake = join(l.root, "fakebin");
    mkdirSync(fake);
    writeFileSync(join(fake, "node"), `#!/bin/sh\necho fake > ${marker}\n`, {
      mode: 0o755,
    });
    const result = launch(l, "agent-git", [], {
      env: { PATH: `${fake}:/usr/bin:/bin` },
    });
    expect(result.code).toBe(0);
    expect(existsSync(marker)).toBe(false);
  });

  it("refuses outside any worktree with one preflight line and exit 3, before the target runs", () => {
    const result = launch(l, "agent-git", ["push", "x"], { cwd: l.root });
    expect(result.code).toBe(3);
    expect(result.stdout).toBe("");
    expect(result.stderr).toMatch(/^preflight: .+\n$/);
  });

  it("refuses a foreign repository with exit 3", () => {
    const foreign = join(l.root, "foreign");
    mkdirSync(foreign);
    git(foreign, "init", "-q");
    expect(launch(l, "post-check", [], { cwd: foreign }).code).toBe(3);
  });

  it("accepts a linked worktree of the checkout", () => {
    const linked = join(l.root, "linked");
    git(l.work, "worktree", "add", "-q", "-b", "unit/x", linked);
    expect(launch(l, "agent-git", [], { cwd: linked }).code).toBe(0);
  });

  describe.each([
    [
      "a foreign origin URL",
      ["remote", "set-url", "origin", "https://github.com/someone/else"],
    ],
    [
      "an SSH origin URL",
      [
        "remote",
        "set-url",
        "origin",
        "git@github.com:defaultdave/defaultdave.git",
      ],
    ],
    [
      "an SSH push URL",
      [
        "remote",
        "set-url",
        "--push",
        "origin",
        "git@github.com:defaultdave/defaultdave.git",
      ],
    ],
    [
      "an insteadOf rewrite",
      ["config", "url.ssh://git@github.com/.insteadOf", "https://github.com/"],
    ],
  ])("with %s", (_name, gitArgs) => {
    it("exits 3 and does not run the target", () => {
      const own = installed();
      git(own.work, ...gitArgs);
      const result = launch(own, "agent-git", ["push", "x"]);
      expect(result.code).toBe(3);
      expect(result.stdout).toBe("");
      expect(result.stderr).toMatch(/^preflight: /);
    });
  });
});

describe("pins", () => {
  it("exits 4 before node runs when gh changed", () => {
    const l = installed();
    writeFileSync(join(l.stubs, "gh"), "#!/bin/sh\necho changed\n");
    const result = launch(l, "agent-git");
    expect(result).toEqual({
      code: 4,
      stdout: "",
      stderr: "pin: gh changed; rerun install\n",
    });
  });

  it.each([
    [0, "node"],
    [2, "git"],
  ])("exits 4 when .hashes entry %i (%s) is altered", (index, label) => {
    const l = installed();
    const hashes = join(l.bin, ".hashes");
    unlock(hashes);
    const lines = readFileSync(hashes, "utf8").split("\n");
    lines[index] =
      `${"0".repeat(64)} ${(lines[index] ?? "").split(" ")[1] ?? ""}`;
    writeFileSync(hashes, lines.join("\n"));
    for (const name of ["agent-git", "post-check", "command-guard"]) {
      const result = launch(l, name, [], { input: "{}" });
      expect(result).toEqual({
        code: 4,
        stdout: "",
        stderr: `pin: ${label} changed; rerun install\n`,
      });
    }
  });

  it("exits 4 when a pinned binary is missing", () => {
    const l = installed();
    rmSync(join(l.stubs, "gh"));
    expect(launch(l, "post-check").code).toBe(4);
  });
});

describe("command-guard launcher", () => {
  const l = installed();
  const hook = (command: string) =>
    launch(l, "command-guard", [], {
      input: JSON.stringify({ tool_name: "Bash", tool_input: { command } }),
    });

  it("allows a single-quoted launcher call, silently", () => {
    expect(
      hook(`${l.bin}/agent-git issue-comment 1 --body 'it'\\''s fine $(x)'`),
    ).toEqual({ code: 0, stdout: "", stderr: "" });
  });

  it("passes a command that does not name the launcher directory", () => {
    expect(hook("git status").code).toBe(0);
  });

  it.each([
    ["a substitution", `${l.bin}/agent-git push $(id)`],
    ["the revert launcher", `${l.bin}/revert '1'`],
    ["a launcher after cd", `cd x && ${l.bin}/agent-git push y`],
  ])("denies %s with exit 2 and one line", (_name, command) => {
    const result = hook(command);
    expect(result.code).toBe(2);
    expect(result.stderr).toMatch(/^command-guard: denied: .+\n$/);
  });
});

describe("smoke", () => {
  it("prints usage and exits non-zero for the repo's agent-git.ts with no arguments", () => {
    const dir = realpathSync(mkdtempSync(join(tmpdir(), "md-smoke-")));
    roots.push(dir);
    for (const name of readdirSync(HERE)) {
      if (name.endsWith(".ts") && !name.endsWith(".test.ts"))
        copyFileSync(join(HERE, name), join(dir, name));
    }
    writeFileSync(join(dir, "package.json"), '{"type":"module"}\n');
    const result = spawnSync(process.execPath, [join(dir, "agent-git.ts")], {
      encoding: "utf8",
      env: asEnv({ PATH: "/usr/bin:/bin" }),
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/usage: agent-git\.ts/);
  });
});

describe("sources", () => {
  it.each(["agent-git.ts", "post-check.ts", "worktree.ts", "command-guard.ts"])(
    "%s has no non-comment line running node scripts/merge-desk/",
    (name) => {
      const code = real(name)
        .split("\n")
        .filter((line) => !/^\s*(\/\/|\/?\*)/.test(line));
      expect(
        code.filter((line) => /node\s+scripts\/merge-desk\//.test(line)),
      ).toEqual([]);
    },
  );
});

/** spawn wants NODE_ENV in a ProcessEnv; a cleared child env has none. */
function asEnv(vars: Record<string, string | undefined>): NodeJS.ProcessEnv {
  return vars as NodeJS.ProcessEnv;
}
