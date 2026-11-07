import { describe, expect, it } from "vitest";
import {
  automerge,
  type Deps,
  gitAuthEnv,
  pr,
  push,
  Refused,
  review,
  type RunResult,
} from "./agent-git";

const VIEW_OK = '{"headRefName":"unit/merge-desk","baseRefName":"main"}';
const HTTPS = "https://github.com/defaultdave/defaultdave.git\n";

function fakeDeps(
  options: { branch?: string; view?: string; remote?: string } = {},
) {
  const calls: { command: string[]; env: Record<string, string> }[] = [];
  const deps: Deps = {
    token: () => Promise.resolve("ghs_fake"),
    currentBranch: () => options.branch ?? "unit/merge-desk",
    run: (command, env): RunResult => {
      calls.push({ command, env });
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
