import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import {
  automerge,
  type Deps,
  gitAuthEnv,
  issueBody,
  issueComment,
  pr,
  prBody,
  push,
  Refused,
  review,
  type RunResult,
  scriptRoot,
} from "./agent-git";

const dir = mkdtempSync(join(tmpdir(), "agent-git-"));
const body = join(dir, "body.md");
const empty = join(dir, "empty.md");
const keyed = join(dir, "keyed.md");
const link = join(dir, "link.md");
writeFileSync(body, "hello\n");
writeFileSync(empty, "");
writeFileSync(keyed, "x\n-----BEGIN OPENSSH PRIVATE KEY-----\n");
symlinkSync(body, link);
afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

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
    repoRoot: () => process.cwd(),
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
    await pr("main", "merge-desk: scripts", body, deps);
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
      "-",
    ]);
    expect(calls[0]?.input?.toString()).toBe("hello\n");
    expect(calls[0]?.env.GH_TOKEN).toBe("ghs_fake");
  });

  it.each(["integration", "release", ""])("refuses base %p", async (base) => {
    const { deps, calls } = fakeDeps();
    await expect(pr(base, "t", body, deps)).rejects.toBeInstanceOf(Refused);
    expect(calls).toHaveLength(0);
  });

  it.each(["main", "feature/x"])("refuses a head of %s", async (branch) => {
    const { deps, calls } = fakeDeps({ branch });
    await expect(pr("main", "t", body, deps)).rejects.toBeInstanceOf(Refused);
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
    "$name builds the gh command with the App token in the environment",
    async ({ call, target, expected }) => {
      const { deps, calls } = fakeDeps();
      await call(target, body, deps);
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
      expect(calls[0]?.command.join(" ")).not.toContain(body);
      expect(calls[0]?.env.GH_TOKEN).toBe("ghs_fake");
    },
  );

  it.each(["0", "-1", "1.5", "abc", "12 ", "--repo", ""])(
    "issue commands refuse the issue number %p",
    async (issue) => {
      const { deps, calls } = fakeDeps();
      await expect(issueComment(issue, body, deps)).rejects.toBeInstanceOf(
        Refused,
      );
      await expect(issueBody(issue, body, deps)).rejects.toBeInstanceOf(
        Refused,
      );
      expect(calls).toHaveLength(0);
    },
  );

  it("pr-body refuses a flag-like target", async () => {
    const { deps, calls } = fakeDeps();
    await expect(prBody("--web", body, deps)).rejects.toBeInstanceOf(Refused);
    expect(calls).toHaveLength(0);
  });

  it.each([
    ["a missing file", join(dir, "nope.md")],
    ["an empty file", empty],
    ["a directory", dir],
    ["a symbolic link", link],
    ["a file outside the repo and tmpdir", "/etc/hosts"],
    ["a file containing a private key marker", keyed],
  ])("refuses %s as the body file", async (_label, file) => {
    const { deps, calls } = fakeDeps();
    await expect(issueComment("12", file, deps)).rejects.toBeInstanceOf(
      Refused,
    );
    await expect(issueBody("12", file, deps)).rejects.toBeInstanceOf(Refused);
    await expect(prBody("42", file, deps)).rejects.toBeInstanceOf(Refused);
    await expect(pr("main", "t", file, deps)).rejects.toBeInstanceOf(Refused);
    expect(calls).toHaveLength(0);
  });

  it("accepts a file inside the repo root", async () => {
    const { deps, calls } = fakeDeps();
    await issueComment("12", join(process.cwd(), "package.json"), deps);
    expect(calls).toHaveLength(1);
  });

  it("refuses a repo file when the repo root is elsewhere", async () => {
    const { deps, calls } = fakeDeps();
    deps.repoRoot = () => dir;
    await expect(
      issueComment("12", join(process.cwd(), "package.json"), deps),
    ).rejects.toBeInstanceOf(Refused);
    expect(calls).toHaveLength(0);
  });

  it("states the reason, not the file contents", async () => {
    const { deps } = fakeDeps();
    const error = await issueComment("12", keyed, deps).catch(
      (e: unknown) => e,
    );
    expect((error as Error).message).toBe(
      "refused: body file contains a private key marker",
    );
  });

  it.each(writers)(
    "$name propagates a failing gh exit",
    async ({ call, target }) => {
      const { deps } = fakeDeps();
      deps.run = () => ({ code: 1, stdout: "" });
      await expect(call(target, body, deps)).rejects.toThrow(
        /failed \(exit 1\)/,
      );
    },
  );

  it.each(writers)(
    "$name sends the bytes read before the token was minted, even if the file is swapped",
    async ({ call, target }) => {
      const file = join(dir, "swap.md");
      writeFileSync(file, "original\n");
      const { deps, calls } = fakeDeps();
      deps.token = () => {
        writeFileSync(file, "swapped\n");
        return Promise.resolve("ghs_fake");
      };
      await call(target, file, deps);
      expect(calls[0]?.input?.toString()).toBe("original\n");
      expect(calls[0]?.command).not.toContain(file);
    },
  );

  it.each([
    ".env",
    ".env.local",
    "server.pem",
    "deploy.key",
    "bundle.p12",
    "bundle.pfx",
    "credentials.json",
    ".secrets",
    "id_rsa",
    "id_rsa.pub",
    "id_ed25519",
    ".ssh/notes.md",
    ".aws/notes.md",
    ".gnupg/notes.md",
  ])("refuses the secret-style path %s", async (name) => {
    const file = join(dir, name);
    mkdirSync(join(file, ".."), { recursive: true });
    writeFileSync(file, "dummy\n");
    const { deps, calls } = fakeDeps();
    await expect(issueComment("12", file, deps)).rejects.toThrow(
      "refused: body file has a secret-file name",
    );
    expect(calls).toHaveLength(0);
  });

  it.each([".env.example", ".env.sample"])("accepts %s", async (name) => {
    const file = join(dir, name);
    writeFileSync(file, "dummy\n");
    const { deps, calls } = fakeDeps();
    await issueComment("12", file, deps);
    expect(calls).toHaveLength(1);
  });
});

describe("scriptRoot", () => {
  it("is two levels above the script, resolved, regardless of the cwd", () => {
    const root = join(dir, "checkout");
    mkdirSync(join(root, "scripts", "merge-desk"), { recursive: true });
    const url = pathToFileURL(
      join(root, "scripts", "merge-desk", "agent-git.ts"),
    ).href;
    expect(scriptRoot(url)).toBe(realpathSync(root));
  });
});
