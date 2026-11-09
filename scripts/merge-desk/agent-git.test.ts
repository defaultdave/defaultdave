import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  automerge,
  type Deps,
  gitAuthEnv,
  issueBody,
  issueComment,
  MAX_BODY_CHARS,
  pr,
  prBody,
  push,
  Refused,
  review,
  type RunResult,
  spawnCommand,
} from "./agent-git";

const VIEW_OK = '{"headRefName":"unit/merge-desk","baseRefName":"main"}';
const HTTPS = "https://github.com/defaultdave/defaultdave.git\n";

function fakeDeps(
  options: { branch?: string; view?: string; remote?: string } = {},
) {
  const calls: {
    command: string[];
    env: Record<string, string>;
    input?: Buffer | undefined;
  }[] = [];
  const deps: Deps = {
    token: () => Promise.resolve("ghs_fake"),
    currentBranch: () => options.branch ?? "unit/merge-desk",
    run: (command, env, input): RunResult => {
      calls.push({ command, env, input });
      if (command[1] === "remote")
        return { code: 0, stdout: options.remote ?? HTTPS };
      const isView = command[1] === "pr" && command[2] === "view";
      return { code: 0, stdout: isView ? (options.view ?? VIEW_OK) : "" };
    },
  };
  return { deps, calls };
}

describe("push", () => {
  it("sends an allowed branch with the token in the environment, not the command line", async () => {
    const { deps, calls } = fakeDeps();
    await push("unit/merge-desk", deps);
    expect(calls).toHaveLength(2);
    expect(calls[1]?.command).toEqual([
      "git",
      "push",
      "origin",
      "refs/heads/unit/merge-desk:refs/heads/unit/merge-desk",
    ]);
    expect(calls[1]?.command.join(" ")).not.toContain("ghs_fake");
    expect(calls[1]?.env.GIT_CONFIG_VALUE_1).toBe(
      gitAuthEnv("ghs_fake").GIT_CONFIG_VALUE_1,
    );
    expect(calls[1]?.env.GIT_CONFIG_KEY_0).toBe("credential.helper");
  });

  it.each([
    "unit/merge-desk",
    "unit/merge-desk-port",
    "pm/status-2026-11-06",
    "revert/pr-12",
  ])("allows %s", async (branch) => {
    const { deps, calls } = fakeDeps();
    await push(branch, deps);
    expect(calls).toHaveLength(2);
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
  ])("refuses %p and runs nothing", async (branch) => {
    const { deps, calls } = fakeDeps();
    await expect(push(branch, deps)).rejects.toBeInstanceOf(Refused);
    expect(calls).toHaveLength(0);
  });

  it.each([
    "git@github.com:defaultdave/defaultdave.git\n",
    `${HTTPS}git@github.com:defaultdave/defaultdave.git\n`,
    "https://github.com/someone/else.git\n",
    "",
  ])(
    "refuses when the push URLs are %p and never mints a token",
    async (remote) => {
      const { deps, calls } = fakeDeps({ remote });
      await expect(push("unit/merge-desk", deps)).rejects.toBeInstanceOf(
        Refused,
      );
      expect(calls.every((call) => call.command[1] === "remote")).toBe(true);
      expect(
        calls.some(
          (call) => "GH_TOKEN" in call.env || "GIT_CONFIG_COUNT" in call.env,
        ),
      ).toBe(false);
    },
  );

  it("surfaces a failing command as an error without the token", async () => {
    const { deps } = fakeDeps();
    deps.run = (command) =>
      command[1] === "remote"
        ? { code: 0, stdout: HTTPS }
        : { code: 128, stdout: "" };
    const error = await push("unit/merge-desk", deps).catch((e: unknown) => e);
    expect((error as Error).message).toBe("git push failed (exit 128)");
  });
});

describe("pr", () => {
  it("opens from the current branch into main", async () => {
    const { deps, calls } = fakeDeps();
    await pr("main", "merge-desk: scripts", "/tmp/body.md", deps);
    expect(calls[0]?.command).toEqual([
      "gh",
      "pr",
      "create",
      "--repo",
      "defaultdave/defaultdave",
      "--base",
      "main",
      "--head",
      "unit/merge-desk",
      "--title",
      "merge-desk: scripts",
      "--body-file",
      "/tmp/body.md",
    ]);
    expect(calls[0]?.env.GH_TOKEN).toBe("ghs_fake");
  });

  it.each(["integration", "release", ""])("refuses base %p", async (base) => {
    const { deps, calls } = fakeDeps();
    await expect(pr(base, "t", "b", deps)).rejects.toBeInstanceOf(Refused);
    expect(calls).toHaveLength(0);
  });

  it.each(["main", "feature/x"])("refuses a head of %s", async (branch) => {
    const { deps, calls } = fakeDeps({ branch });
    await expect(pr("main", "t", "b", deps)).rejects.toBeInstanceOf(Refused);
    expect(calls).toHaveLength(0);
  });
});

describe("automerge", () => {
  it("sets squash auto-merge and never passes --admin", async () => {
    const { deps, calls } = fakeDeps();
    await automerge("42", deps);
    const merge = calls.find((call) => call.command[2] === "merge");
    expect(merge?.command).toEqual([
      "gh",
      "pr",
      "merge",
      "42",
      "--repo",
      "defaultdave/defaultdave",
      "--auto",
      "--squash",
    ]);
    expect(merge?.command).not.toContain("--admin");
  });

  it.each([
    [
      '{"headRefName":"feature/x","baseRefName":"main"}',
      "head is not an agent branch",
    ],
    ['{"headRefName":"main","baseRefName":"main"}', "head is main"],
    [
      '{"headRefName":"unit/x","baseRefName":"integration"}',
      "base is not main",
    ],
  ])("refuses %s (%s) and does not merge", async (view) => {
    const { deps, calls } = fakeDeps({ view });
    await expect(automerge("99", deps)).rejects.toBeInstanceOf(Refused);
    expect(calls.some((call) => call.command[2] === "merge")).toBe(false);
  });

  it.each(["--admin", "-R"])(
    "refuses the flag-like argument %s",
    async (target) => {
      const { deps, calls } = fakeDeps();
      await expect(automerge(target, deps)).rejects.toBeInstanceOf(Refused);
      expect(calls).toHaveLength(0);
    },
  );
});

describe("review", () => {
  it("requests the owner as reviewer with the App token", async () => {
    const { deps, calls } = fakeDeps();
    await review("42", deps);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.command).toEqual([
      "gh",
      "pr",
      "edit",
      "42",
      "--repo",
      "defaultdave/defaultdave",
      "--add-reviewer",
      "defaultdave",
    ]);
    expect(calls[0]?.env.GH_TOKEN).toBe("ghs_fake");
  });

  it("refuses an argument that looks like a flag", async () => {
    const { deps, calls } = fakeDeps();
    await expect(review("--remove-reviewer", deps)).rejects.toBeInstanceOf(
      Refused,
    );
    expect(calls).toHaveLength(0);
  });
});

describe("issue and PR body writes", () => {
  const writers = [
    {
      name: "issueComment",
      call: issueComment,
      target: "12",
      expected: ["gh", "issue", "comment", "12"],
    },
    {
      name: "issueBody",
      call: issueBody,
      target: "12",
      expected: ["gh", "issue", "edit", "12"],
    },
    {
      name: "prBody",
      call: prBody,
      target: "42",
      expected: ["gh", "pr", "edit", "42"],
    },
  ];

  it.each(writers)(
    "$name sends the --body text to gh on stdin with the App token in the environment",
    async ({ call, target, expected }) => {
      const { deps, calls } = fakeDeps();
      await call(target, ["--body", "hello\n"], deps);
      expect(calls).toHaveLength(1);
      expect(calls[0]?.command).toEqual([
        ...expected,
        "--repo",
        "defaultdave/defaultdave",
        "--body-file",
        "-",
      ]);
      expect(calls[0]?.input?.toString()).toBe("hello\n");
      expect(calls[0]?.command.join(" ")).not.toContain("ghs_fake");
      expect(calls[0]?.env.GH_TOKEN).toBe("ghs_fake");
    },
  );

  const LITERAL =
    'it\'s "quoted"\nline two $(id) `id` ${HOME} \\n ; | > & \u00e9\u{1F600}';
  it.each(writers)(
    "$name passes quotes, newlines, $() and backticks to gh byte for byte",
    async ({ call, target }) => {
      const { deps, calls } = fakeDeps();
      await call(target, ["--body", LITERAL], deps);
      expect(calls[0]?.input).toEqual(Buffer.from(LITERAL, "utf8"));
      expect(calls[0]?.command).not.toContain(LITERAL);
    },
  );

  const bad: [string, string[]][] = [
    ["a missing --body", []],
    ["--body with no value", ["--body"]],
    ["the old - form", ["-"]],
    ["a file path", ["body.md"]],
    ["the --body=<text> spelling", ["--body=hello"]],
    ["an extra argument", ["--body", "hello", "world"]],
    ["an unquoted multi-word body", ["--body", "a", "b", "c"]],
    ["a flag before --body", ["--repo", "--body", "hello"]],
    ["an empty body", ["--body", ""]],
    ["a whitespace-only body", ["--body", " \n\t\n"]],
  ];
  it.each(bad)("every writer refuses %s and runs nothing", async (_n, rest) => {
    for (const { call, target } of writers) {
      const { deps, calls } = fakeDeps();
      await expect(call(target, rest, deps)).rejects.toBeInstanceOf(Refused);
      expect(calls).toHaveLength(0);
    }
  });

  it("refuses the old - form with a message that names --body", async () => {
    const { deps } = fakeDeps();
    await expect(issueComment("1", ["-"], deps)).rejects.toThrow(/--body/);
  });

  it.each([
    ["exactly 65,536 characters", MAX_BODY_CHARS, true],
    ["65,537 characters", MAX_BODY_CHARS + 1, false],
  ])("the limit: %s", async (_n, size, accepted) => {
    for (const { call, target } of writers) {
      const { deps, calls } = fakeDeps();
      const run = call(target, ["--body", "x".repeat(size)], deps);
      if (accepted) {
        await run;
        expect(calls[0]?.input?.length).toBe(size);
      } else {
        await expect(run).rejects.toThrow(/65536 characters|65,536 characters/);
        expect(calls).toHaveLength(0);
      }
    }
  });

  it("counts characters, not bytes", async () => {
    const { deps, calls } = fakeDeps();
    await issueComment("1", ["--body", "\u00e9".repeat(MAX_BODY_CHARS)], deps);
    expect(calls).toHaveLength(1);
  });

  it.each(["0", "-1", "1.5", "abc", "12 ", "--repo", ""])(
    "issue commands refuse the issue number %p",
    async (issue) => {
      const { deps, calls } = fakeDeps();
      await expect(
        issueComment(issue, ["--body", "hi"], deps),
      ).rejects.toBeInstanceOf(Refused);
      await expect(
        issueBody(issue, ["--body", "hi"], deps),
      ).rejects.toBeInstanceOf(Refused);
      expect(calls).toHaveLength(0);
    },
  );

  it("pr-body refuses a flag-like target", async () => {
    const { deps, calls } = fakeDeps();
    await expect(
      prBody("--web", ["--body", "hi"], deps),
    ).rejects.toBeInstanceOf(Refused);
    expect(calls).toHaveLength(0);
  });
});

describe("agent-git.ts as a subprocess", () => {
  const script = join(dirname(fileURLToPath(import.meta.url)), "agent-git.ts");

  /**
   * Runs the real script with a missing app.conf, so a valid body stops at the token mint with no
   * network. stdin is a pipe that is never written or closed: a script that read it would hang.
   */
  function run(args: string[]) {
    return new Promise<{ code: number | null; stderr: string }>(
      (resolve, reject) => {
        const child = spawn(process.execPath, [script, ...args], {
          env: {
            ...process.env,
            DEFAULTDAVE_APP_CONF: "/nonexistent/app.conf",
          },
          stdio: ["pipe", "ignore", "pipe"],
        });
        let stderr = "";
        child.stderr.on("data", (chunk: Buffer) => {
          stderr += chunk.toString();
        });
        const timer = setTimeout(() => {
          child.kill("SIGKILL");
          reject(new Error("script hung: it is reading stdin"));
        }, 3_000);
        child.on("close", (code) => {
          clearTimeout(timer);
          resolve({ code, stderr });
        });
      },
    );
  }

  it.each(["issue-comment", "issue-body", "pr-body"])(
    "%s with a valid body goes on to the token mint without reading stdin",
    async (command) => {
      const { code, stderr } = await run([command, "1", "--body", "hello"]);
      expect(stderr).toContain("app.conf");
      expect(code).toBe(1);
    },
  );

  it.each([
    ["the old - form", ["issue-comment", "1", "-"], "--body"],
    ["an empty body", ["issue-body", "1", "--body", ""], "empty"],
    ["--body=<text>", ["pr-body", "1", "--body=x"], "--body"],
    ["a missing value", ["issue-comment", "1", "--body"], "needs a value"],
  ])("refuses %s with exit 2 without reading stdin", async (_n, args, text) => {
    const { code, stderr } = await run(args);
    expect(code).toBe(2);
    expect(stderr).toContain(text);
  });
});

describe("spawnCommand", () => {
  const echoStdin = [
    process.execPath,
    "-e",
    "process.stdout.write(require('fs').readFileSync(0))",
  ];

  it("delivers the exact input bytes, quotes and newlines included, to the child's stdin", () => {
    const body =
      'line one\nDave\'s "fix" $(echo x) `y`\n\nlast line, no newline';
    const result = spawnCommand(echoStdin, {}, Buffer.from(body, "utf8"));
    expect(result.code).toBe(0);
    expect(result.stdout).toBe(body);
  });

  it("gives the child an ignored stdin when there is no input", () => {
    const probe = [
      process.execPath,
      "-e",
      "const fs=require('fs');let n=-1;try{n=fs.readFileSync(0).length}catch{n=-1}process.stdout.write(String(n)+':'+fs.fstatSync(0).isFIFO())",
    ];
    const result = spawnCommand(probe, {});
    expect(result.stdout).not.toMatch(/:true$/);
  });

  it("returns the child's exit code", () => {
    expect(
      spawnCommand([process.execPath, "-e", "process.exit(3)"], {}).code,
    ).toBe(3);
  });
});
