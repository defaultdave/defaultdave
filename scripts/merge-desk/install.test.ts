// Runs install.sh end to end against a fixture repo, with --test-prefix under the temp dir. No test reaches GitHub
// or mints a token. launcher.test.ts carries a copy of the fixture builder: this directory has no shared test helper.
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
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const HERE = import.meta.dirname;
const INSTALL_SH = join(HERE, "install.sh");
const real = (name: string) => readFileSync(join(HERE, name), "utf8");
const DUMP =
  "process.stdout.write(JSON.stringify({ env: process.env, argv: process.argv.slice(2), cwd: process.cwd() }));\n";

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

/** The repo's safe-exec.ts with the constants a fixture cannot share rewritten. */
export function patchSafeExec(source: string, commonDir: string): string {
  return source.replace(
    /(export const EXPECTED_COMMON_DIR\s*=\s*)"[^"]*"/,
    `$1${JSON.stringify(commonDir)}`,
  );
}

interface Fixture {
  root: string;
  prefix: string;
  home: string;
  work: string;
  source: string;
  stubs: string;
  script: string;
  sha: string;
  bin: string;
  exportDir: string;
}

function makeFixture(
  options: {
    files?: Record<string, string | null>;
    appKey?: string | null;
  } = {},
): Fixture {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "md-install-")));
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
  mkdirSync(join(work, "scripts", "merge-desk", "nested"), { recursive: true });
  git(work, "init", "-q", "-b", "main");
  git(
    work,
    "remote",
    "add",
    "origin",
    "https://github.com/defaultdave/defaultdave.git",
  );

  const files: Record<string, string | null> = {
    "agent-git.ts": DUMP,
    "post-check.ts": DUMP,
    "worktree.ts": real("worktree.ts"),
    "command-guard.ts": real("command-guard.ts"),
    "safe-exec.ts": patchSafeExec(real("safe-exec.ts"), join(work, ".git")),
    "install.sh": real("install.sh"),
    "ruleset-main.json": "{}\n",
    "nested/data.json": '{"n":1}\n',
    ...options.files,
  };
  for (const [name, content] of Object.entries(files)) {
    if (content !== null)
      writeFileSync(join(work, "scripts", "merge-desk", name), content);
  }
  git(work, "add", "-A");
  git(work, "commit", "-q", "-m", "fixture");
  git(work, "clone", "-q", "--bare", ".", source);

  symlinkSync(process.execPath, join(stubs, "node"));
  writeFileSync(join(stubs, "gh"), "#!/bin/sh\nexit 0\n", { mode: 0o755 });
  const gitPath = spawnSync("/bin/sh", ["-c", "command -v git"], {
    encoding: "utf8",
  }).stdout.trim();
  symlinkSync(realpathSync(gitPath), join(stubs, "git"));
  const appKey =
    options.appKey === undefined
      ? join(home, ".config", "defaultdave-agents", "missing.pem")
      : options.appKey;
  writeFileSync(
    join(home, ".config", "defaultdave-agents", "app.conf"),
    `APP_ID=1\nAPP_INSTALLATION_ID=2\n${appKey === null ? "" : `APP_KEY=${appKey}\n`}`,
  );
  copyFileSync(INSTALL_SH, script);
  const sha = git(work, "rev-parse", "HEAD");
  return {
    root,
    prefix,
    home,
    work,
    source,
    stubs,
    script,
    sha,
    bin: join(prefix, "bin", "defaultdave"),
    exportDir: join(prefix, sha),
  };
}

function baseArgs(f: Fixture): string[] {
  return [
    f.sha,
    "--checkout",
    f.work,
    "--test-prefix",
    f.prefix,
    "--test-source",
    f.source,
    "--test-home",
    f.home,
    "--test-bin",
    f.stubs,
    "--yes",
  ];
}

function install(
  f: Fixture,
  options: {
    args?: string[];
    script?: string;
    env?: Record<string, string>;
  } = {},
) {
  const result = spawnSync(
    "bash",
    [options.script ?? f.script, ...(options.args ?? baseArgs(f))],
    {
      encoding: "utf8",
      env: asEnv({
        HOME: f.home,
        PATH: "/usr/bin:/bin",
        TMPDIR: tmpdir(),
        ...options.env,
      }),
    },
  );
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}

/** The args with one flag (and its value) removed. */
function without(args: string[], flag: string, hasValue = true): string[] {
  const at = args.indexOf(flag);
  return args.filter((_, i) => i < at || i >= at + (hasValue ? 2 : 1));
}

function refused(result: ReturnType<typeof install>, message: RegExp | string) {
  expect(result.code).toBe(1);
  expect(result.stderr).toMatch(/install: refused: /);
  expect(result.stderr).toMatch(
    typeof message === "string"
      ? new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      : message,
  );
}

function snapshot(dir: string): string[] {
  return readdirSync(dir, { recursive: true })
    .map(String)
    .sort()
    .map((path) => {
      const stat = statSync(join(dir, path), { throwIfNoEntry: false });
      return `${path} ${String(stat?.ino)} ${String(stat?.mtimeMs)}`;
    });
}

describe("install: refusals before any clone", () => {
  const f = makeFixture();

  it.each([
    ["a short sha", f.sha.slice(0, 12)],
    ["a ref name", "main"],
    ["an uppercase sha", f.sha.toUpperCase()],
  ])("refuses %s", (_name, sha) => {
    refused(
      install(f, { args: [sha, ...baseArgs(f).slice(1)] }),
      "40-character lowercase",
    );
  });

  it.each([
    ["--test-source", "--test-source", true],
    ["--test-home", "--test-home", true],
    ["--test-bin", "--test-bin", true],
    ["--yes", "--yes", false],
  ])("refuses %s without --test-prefix", (_name, flag, hasValue) => {
    const args = without(baseArgs(f), "--test-prefix");
    const keep = args.indexOf(flag);
    const onlyThis = [
      f.sha,
      "--checkout",
      f.work,
      ...args.slice(keep, keep + (hasValue ? 2 : 1)),
    ];
    refused(install(f, { args: onlyThis }), "need --test-prefix");
  });

  it("refuses a prefix under a temp root without --test-prefix", () => {
    const result = install(f, {
      args: [f.sha, "--checkout", f.work],
      env: { HOME: join(f.root, "elsewhere") },
    });
    refused(result, "under ~/Workspace or a temp root");
  });

  it("refuses when $HOME is not the passwd home", () => {
    refused(
      install(f, { env: { HOME: join(f.root, "not-home") } }),
      "passwd home",
    );
  });

  it("refuses when HOME is not the passwd home of the real user", () => {
    const args = without(without(baseArgs(f), "--test-home"), "--yes", false);
    refused(install(f, { args: [...args, "--yes"] }), "passwd home");
  });

  it("refuses a script that is not under <prefix>/.staging/", () => {
    const stray = join(f.root, "install.sh");
    copyFileSync(INSTALL_SH, stray);
    refused(install(f, { script: stray }), "not under");
  });

  it("refuses when the prefix does not exist", () => {
    const args = [
      ...without(baseArgs(f), "--test-prefix"),
      "--test-prefix",
      join(f.root, "none"),
    ];
    refused(install(f, { args }), "does not exist");
  });

  it("refuses a checkout that is not the git root", () => {
    const sub = join(f.work, "scripts");
    refused(
      install(f, {
        args: [
          f.sha,
          ...baseArgs(f)
            .slice(1)
            .map((a) => (a === f.work ? sub : a)),
        ],
      }),
      "common dir",
    );
  });

  it("refuses a linked worktree as the checkout", () => {
    const linked = join(f.root, "linked");
    git(f.work, "worktree", "add", "-q", "-b", "other", linked);
    refused(
      install(f, { args: baseArgs(f).map((a) => (a === f.work ? linked : a)) }),
      "common dir",
    );
  });

  it("refuses an app.conf with no .pem or .key key", () => {
    refused(
      install(makeFixture({ appKey: join(tmpdir(), "key.txt") })),
      "does not end in .pem or .key",
    );
  });

  it("refuses an app.conf with no APP_KEY", () => {
    refused(
      install(makeFixture({ appKey: null })),
      "does not end in .pem or .key",
    );
  });

  it("refuses a missing app.conf", () => {
    const other = makeFixture();
    rmSync(join(other.home, ".config", "defaultdave-agents", "app.conf"));
    refused(install(other), "app.conf");
  });

  it("refuses a gh under a temp root outside the test prefix", () => {
    const outside = join(f.root, "outside");
    mkdirSync(outside);
    for (const name of ["node", "git"])
      symlinkSync(realpathSync(join(f.stubs, name)), join(outside, name));
    writeFileSync(join(outside, "gh"), "#!/bin/sh\nexit 0\n", { mode: 0o755 });
    const args = baseArgs(f).map((a) => (a === f.stubs ? outside : a));
    refused(
      install(f, { args }),
      /gh resolves to .*outside\/gh, under ~\/Workspace or a temp root/,
    );
  });

  it("refuses a node older than 24.2", () => {
    const other = makeFixture();
    rmSync(join(other.stubs, "node"));
    writeFileSync(join(other.stubs, "node"), "#!/bin/sh\necho 24.1.9\n", {
      mode: 0o755,
    });
    refused(install(other), "older than 24.2");
  });

  it("refuses without a terminal and without --yes", () => {
    refused(
      install(f, { args: without(baseArgs(f), "--yes", false) }),
      "no terminal",
    );
  });
});

describe("install: refusals from the clone and the archive", () => {
  it("refuses a sha that is not on main", () => {
    const f = makeFixture();
    refused(
      install(f, { args: ["0".repeat(40), ...baseArgs(f).slice(1)] }),
      "not a commit on main",
    );
  });

  it("refuses a commit that is not an ancestor of main", () => {
    const f = makeFixture();
    git(f.work, "checkout", "-q", "-b", "side");
    writeFileSync(join(f.work, "scripts", "merge-desk", "side.json"), "{}\n");
    git(f.work, "add", "-A");
    git(f.work, "commit", "-q", "-m", "side");
    const side = git(f.work, "rev-parse", "HEAD");
    git(f.work, "checkout", "-q", "main");
    git(f.work, "branch", "-q", "-D", "side");
    git(f.work, "clone", "-q", "--bare", ".", join(f.root, "src2.git"));
    const args = baseArgs(f).map((a) =>
      a === f.source ? join(f.root, "src2.git") : a,
    );
    refused(
      install(f, { args: [side, ...args.slice(1)] }),
      "not an ancestor of main",
    );
  });

  it("refuses an EXPECTED_COMMON_DIR that is not the checkout's", () => {
    const f = makeFixture({
      files: {
        "safe-exec.ts": patchSafeExec(
          real("safe-exec.ts"),
          "/somewhere/else/.git",
        ),
      },
    });
    refused(install(f), /EXPECTED_COMMON_DIR .* is \/somewhere\/else\/\.git/);
  });

  it("refuses a committed symlink", () => {
    const f = makeFixture();
    symlinkSync(
      "agent-git.ts",
      join(f.work, "scripts", "merge-desk", "link.ts"),
    );
    git(f.work, "add", "-A");
    git(f.work, "commit", "-q", "-m", "link");
    git(f.work, "push", "-q", f.source, "main:main");
    const sha = git(f.work, "rev-parse", "HEAD");
    refused(
      install(f, { args: [sha, ...baseArgs(f).slice(1)] }),
      "non-regular entry",
    );
  });

  it("refuses a committed package.json", () => {
    const f = makeFixture({ files: { "package.json": "{}\n" } });
    refused(install(f), "commits a package.json");
  });

  it.each([
    [
      "a bare package",
      'import x from "left-pad";\nexport const y = x;\n',
      "'left-pad'",
    ],
    [
      "a node module without the node: prefix",
      'import { readFileSync } from "fs";\nexport const y = readFileSync;\n',
      "'fs'",
    ],
    ["a parent path", 'export * from "../x.ts";\n', "'../x.ts'"],
    ["a subdirectory path", 'import "./nested/x.ts";\n', "'./nested/x.ts'"],
    ["a test file", 'import "./agent-git.test.ts";\n', "'./agent-git.test.ts'"],
    ["a .js file", 'import "./x.js";\n', "'./x.js'"],
    [
      "a dynamic import",
      'export const y = await import("node:fs");\n',
      "dynamic import",
    ],
    [
      "a require",
      'const y = require("node:fs");\nexport { y };\n',
      "dynamic import",
    ],
    [
      "an import split across lines",
      'import { a } from\n  "./agent-git.ts";\n',
      "splits an import",
    ],
  ])("refuses a non-test .ts with %s", (_name, source, message) => {
    const f = makeFixture({ files: { "bad.ts": source } });
    refused(install(f), message);
  });

  it("accepts imports of node: modules and sibling .ts files, and test files that import anything", () => {
    const f = makeFixture({
      files: {
        "ok.ts":
          '// Built from nothing, never copied from\n/* or the usual import\n */\nimport { readFileSync } from "node:fs";\nimport { join } from "node:path";\nimport { x } from "./other.ts";\nexport { readFileSync, join, x };\n',
        "other.ts": "export const x = 1;\n",
        "ok.test.ts":
          'import { it } from "vitest";\nit("x", () => undefined);\n',
      },
    });
    expect(install(f).code).toBe(0);
  });

  it("accepts the repo's own sources", () => {
    const own: Record<string, string> = {};
    for (const name of readdirSync(HERE)) {
      if (name.endsWith(".ts") && !name.endsWith(".test.ts"))
        own[name] = name === "safe-exec.ts" ? "" : real(name);
    }
    const f = makeFixture({ files: own });
    const patched = patchSafeExec(real("safe-exec.ts"), join(f.work, ".git"));
    writeFileSync(
      join(f.work, "scripts", "merge-desk", "safe-exec.ts"),
      patched,
    );
    git(f.work, "add", "-A");
    git(f.work, "commit", "-q", "-m", "real sources");
    git(f.work, "push", "-q", f.source, "main:main");
    const sha = git(f.work, "rev-parse", "HEAD");
    const result = install(f, { args: [sha, ...baseArgs(f).slice(1)] });
    expect(result.stderr).not.toMatch(/refused/);
    expect(result.code).toBe(0);
  });
});

describe("install: the export and the launchers", () => {
  const f = makeFixture();
  // A working-tree edit and an untracked file must not reach the export.
  writeFileSync(
    join(f.work, "scripts", "merge-desk", "agent-git.ts"),
    "// edited after the commit\n",
  );
  writeFileSync(
    join(f.work, "scripts", "merge-desk", "untracked.ts"),
    "export {};\n",
  );
  const first = install(f);

  it("succeeds", () => {
    expect(first.stderr).not.toMatch(/refused/);
    expect(first.code).toBe(0);
  });

  it("equals the archive at the sha plus package.json", () => {
    const tracked = git(
      f.work,
      "ls-tree",
      "-r",
      "--name-only",
      f.sha,
      "scripts/merge-desk/",
    )
      .split("\n")
      .map((p) => p.replace("scripts/merge-desk/", ""));
    const files = readdirSync(f.exportDir, {
      recursive: true,
      withFileTypes: true,
    })
      .filter((e) => e.isFile())
      .map((e) => join(e.parentPath, e.name).slice(f.exportDir.length + 1))
      .sort();
    expect(files).toEqual([...tracked, "package.json"].sort());
    for (const name of tracked) {
      expect(readFileSync(join(f.exportDir, name), "utf8")).toBe(
        git(f.work, "show", `${f.sha}:scripts/merge-desk/${name}`) +
          (name.endsWith("\n") ? "" : "\n"),
      );
    }
    expect(readFileSync(join(f.exportDir, "package.json"), "utf8")).toBe(
      '{"type":"module"}\n',
    );
    expect(
      readFileSync(join(f.exportDir, "agent-git.ts"), "utf8"),
    ).not.toContain("edited after");
  });

  it("makes files 444 and directories 555", () => {
    const modes = (path: string) => statSync(path).mode & 0o777;
    expect(modes(f.exportDir)).toBe(0o555);
    expect(modes(join(f.exportDir, "nested"))).toBe(0o555);
    expect(modes(join(f.exportDir, "agent-git.ts"))).toBe(0o444);
    expect(modes(join(f.exportDir, "nested", "data.json"))).toBe(0o444);
    expect(modes(join(f.exportDir, "package.json"))).toBe(0o444);
    expect(modes(join(f.prefix, "tmp"))).toBe(0o700);
  });

  it("writes exactly three launchers and stage scripts, .path/node and .hashes", () => {
    const listing = readdirSync(f.bin, { recursive: true }).map(String).sort();
    expect(listing).toEqual(
      [
        ".hashes",
        ".path",
        ".path/node",
        ".stage",
        ".stage/agent-git",
        ".stage/command-guard",
        ".stage/post-check",
        "agent-git",
        "command-guard",
        "post-check",
      ].sort(),
    );
    expect(existsSync(join(f.bin, "app-token"))).toBe(false);
    expect(existsSync(join(f.bin, "revert"))).toBe(false);
  });

  it("sets launcher modes to 555 and .hashes to 444", () => {
    const modes = (path: string) => statSync(path).mode & 0o777;
    for (const name of ["agent-git", "post-check", "command-guard"]) {
      expect(modes(join(f.bin, name))).toBe(0o555);
      expect(modes(join(f.bin, ".stage", name))).toBe(0o555);
    }
    expect(modes(join(f.bin, ".hashes"))).toBe(0o444);
    expect(modes(f.bin)).toBe(0o555);
  });

  it("writes the launcher shape from the ticket", () => {
    const user = spawnSync("id", ["-un"], { encoding: "utf8" }).stdout.trim();
    expect(readFileSync(join(f.bin, "agent-git"), "utf8")).toBe(
      `#!/bin/bash -p\n# Generated by scripts/merge-desk/install.sh for ${f.sha}. Do not edit; rerun install.\n` +
        `exec /usr/bin/env -i HOME=${f.home} USER=${user} LOGNAME=${user} TMPDIR=${f.prefix}/tmp PATH=/usr/bin:/bin LANG=en_US.UTF-8 \\\n` +
        `  /bin/bash -p ${f.bin}/.stage/agent-git "$@"\n`,
    );
    const stage = readFileSync(join(f.bin, ".stage", "agent-git"), "utf8");
    expect(stage.split("\n").slice(0, 3)).toEqual([
      "#!/bin/bash -p",
      `# Generated by scripts/merge-desk/install.sh for ${f.sha}. Do not edit; rerun install.`,
      "set -euo pipefail",
    ]);
    expect(stage).toContain(
      `${f.bin}/.path/node ${f.exportDir}/worktree.ts < /dev/null\n`,
    );
    expect(stage).toContain(`exec /usr/bin/env -i HOME=${f.home}`);
    expect(stage).toContain(
      `${f.bin}/.path/node ${f.exportDir}/agent-git.ts "$@"\n`,
    );
    const guard = readFileSync(join(f.bin, ".stage", "command-guard"), "utf8");
    expect(guard).not.toContain("worktree.ts");
    expect(guard).toContain(`${f.exportDir}/command-guard.ts ${f.bin}/\n`);
  });

  it("points .path/node at the node realpath and pins node, gh and git by sha256", () => {
    expect(realpathSync(join(f.bin, ".path", "node"))).toBe(
      realpathSync(process.execPath),
    );
    const sum = (path: string) =>
      spawnSync("/usr/bin/shasum", ["-a", "256", path], {
        encoding: "utf8",
      }).stdout.split(" ")[0];
    const lines = readFileSync(join(f.bin, ".hashes"), "utf8")
      .trim()
      .split("\n");
    expect(lines).toEqual(
      [
        realpathSync(process.execPath),
        join(f.stubs, "gh"),
        realpathSync(join(f.stubs, "git")),
      ].map((path) => `${String(sum(path))} ${path}`),
    );
  });

  it("leaves everything alone on a same-sha rerun", () => {
    const before = [...snapshot(f.bin), ...snapshot(f.exportDir)];
    const again = install(f);
    expect(again.code).toBe(0);
    expect([...snapshot(f.bin), ...snapshot(f.exportDir)]).toEqual(before);
    expect(again.stdout).toBe(first.stdout);
  });

  it("refuses a <sha>/ that differs from a fresh export, and names it", () => {
    const other = makeFixture();
    expect(install(other).code).toBe(0);
    chmodSync(other.exportDir, 0o755);
    chmodSync(join(other.exportDir, "ruleset-main.json"), 0o644);
    writeFileSync(
      join(other.exportDir, "ruleset-main.json"),
      '{"tampered":true}\n',
    );
    refused(
      install(other),
      new RegExp(`${other.exportDir} exists and differs`),
    );
  });

  it("adds a dir, replaces bin and keeps the old dir for a new sha", () => {
    const other = makeFixture();
    expect(install(other).code).toBe(0);
    writeFileSync(
      join(other.work, "scripts", "merge-desk", "ruleset-main.json"),
      '{"v":2}\n',
    );
    git(other.work, "add", "-A");
    git(other.work, "commit", "-q", "-m", "second");
    git(other.work, "push", "-q", other.source, "main:main");
    const next = git(other.work, "rev-parse", "HEAD");
    const result = install(other, {
      args: [next, ...baseArgs(other).slice(1)],
    });
    expect(result.code).toBe(0);
    expect(result.stderr).toContain(
      `Changes to scripts/merge-desk/ since the installed pin ${other.sha}`,
    );
    expect(result.stderr).toMatch(/[0-9a-f]{7} t second/);
    expect(existsSync(other.exportDir)).toBe(true);
    expect(existsSync(join(other.prefix, next))).toBe(true);
    expect(readFileSync(join(other.bin, "agent-git"), "utf8")).toContain(
      `for ${next}.`,
    );
    expect(
      readFileSync(join(other.bin, ".stage", "agent-git"), "utf8"),
    ).toContain(`${other.prefix}/${next}/agent-git.ts`);
    expect(readdirSync(join(other.prefix, "bin"))).toEqual(["defaultdave"]);
  });
});

describe("install: the printed blocks", () => {
  const f = makeFixture();
  const result = install(f);
  const ws = join(f.home, "Workspace");
  const common = join(f.work, ".git");
  const t = (line: string) => `  ${line}  [TEST]`;

  it("warns that this is a test run", () => {
    expect(result.stderr).toContain("TEST MODE");
  });

  it("prints blocks (a) to (e) as exact strings, each entry marked", () => {
    expect(result.stdout).toBe(
      [
        `Installed ${f.sha}: export ${f.exportDir}, launchers ${f.bin}/`,
        "Nothing below is applied. Apply it yourself at the cutover (README, After the cutover).",
        "TEST: these entries come from a test install and must not be applied.",
        "",
        `(a) Add to ${f.work}/.claude/settings.local.json`,
        "permissions.allow:",
        t(`Bash(${f.bin}/agent-git *)`),
        t(`Bash(${f.bin}/post-check *)`),
        "sandbox.excludedCommands:",
        t(`${f.bin}/agent-git *`),
        t(`${f.bin}/post-check *`),
        "hooks.PreToolUse, a Bash matcher whose hook command is:",
        t(`${f.bin}/command-guard`),
        "",
        `(b) Remove from ${f.work}/.claude/settings.local.json`,
        "permissions.allow:",
        t("Bash(node scripts/merge-desk/agent-git.ts *)"),
        t("Bash(node scripts/merge-desk/post-check.ts *)"),
        t("Bash(node scripts/merge-desk/app-token.ts)"),
        t("Bash(scripts/merge-desk/revert.sh *)"),
        t("Bash(gh pr *)"),
        t("Bash(gh api *)"),
        t("Bash(gh project *)"),
        "sandbox.excludedCommands:",
        t("node scripts/merge-desk/agent-git.ts"),
        t("node scripts/merge-desk/post-check.ts"),
        t("node scripts/merge-desk/app-token.ts"),
        t("scripts/merge-desk/revert.sh"),
        "",
        `(c) Add to the sandbox read-deny (sandbox.filesystem.denyRead) of ${f.work}/.claude/settings.local.json`,
        t("~/.config/defaultdave-agents"),
        t("~/.config/gh"),
        "",
        `(d) Remove from ${ws}/.claude/settings.local.json every permissions.allow entry that starts with`,
        t("Bash(git push"),
        t("Bash(gh pr "),
        t("Bash(gh api"),
        t("Bash(gh issue"),
        t("Bash(gh secret"),
        t("Bash(gh run"),
        "",
        `(e) Add to the sandbox write-deny (sandbox.filesystem.denyWrite) of ${f.home}/.claude/settings.json`,
        t(`${ws}/.claude/**`),
        t(`${ws}/**/.claude/settings*.json`),
        t("**/.claude/hooks/**"),
        t("**/.mcp.json"),
        t(`${ws}/vig/.claude/**`),
        t(`${common}/hooks/**`),
        t(`${common}/config`),
        t(`${common}/worktrees/*/config.worktree`),
        "",
      ].join("\n"),
    );
  });

  it("adds no allow or exclusion that names app-token, revert, gh or git push (block (a))", () => {
    const blockA = result.stdout.split("\n(b)")[0] ?? "";
    for (const word of ["app-token", "revert", "gh ", "git push"])
      expect(blockA).not.toContain(word);
  });
});

describe("install.sh source", () => {
  it("parses cleanly with bash and never sources app.conf", () => {
    expect(spawnSync("bash", ["-n", INSTALL_SH]).status).toBe(0);
    const source = readFileSync(INSTALL_SH, "utf8");
    expect(source).not.toMatch(/^\s*(source|\.)\s+.*app\.conf/m);
  });
});

describe("settings.local.proposal.json", () => {
  const BIN =
    "/Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave";
  const text = readFileSync(join(HERE, "settings.local.proposal.json"), "utf8");

  it("holds the block (a) entries, the hook and the block (c) read-denies", () => {
    expect(JSON.parse(text)).toEqual({
      permissions: {
        allow: [`Bash(${BIN}/agent-git *)`, `Bash(${BIN}/post-check *)`],
      },
      sandbox: {
        excludedCommands: [`${BIN}/agent-git *`, `${BIN}/post-check *`],
        filesystem: {
          denyRead: ["~/.config/defaultdave-agents", "~/.config/gh"],
        },
      },
      hooks: {
        PreToolUse: [
          {
            matcher: "Bash",
            hooks: [{ type: "command", command: `${BIN}/command-guard` }],
          },
        ],
      },
    });
  });

  it("names no app-token, revert, gh or git push", () => {
    for (const word of [
      "app-token",
      "revert",
      "gh ",
      "git push",
      "node scripts",
    ])
      expect(text).not.toContain(word);
  });
});

/** spawn wants NODE_ENV in a ProcessEnv; a cleared child env has none. */
function asEnv(vars: Record<string, string | undefined>): NodeJS.ProcessEnv {
  return vars as NodeJS.ProcessEnv;
}
