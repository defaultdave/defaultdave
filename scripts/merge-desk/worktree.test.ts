import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error TS5097: Node needs the .ts extension, and the root tsconfig does not allow it
import { preflight } from "./worktree.ts";

function run(locate: (cwd: string) => unknown) {
  const lines: string[] = [];
  const code = preflight("/some/cwd", locate, (line) => lines.push(line));
  return { code, lines };
}

describe("preflight", () => {
  it("exits 0 and says nothing when the worktree is found", () => {
    expect(run(() => ({ commonDir: "/x/.git" }))).toEqual({
      code: 0,
      lines: [],
    });
  });

  it("passes the working directory to locateWorktree", () => {
    const seen: string[] = [];
    preflight(
      "/some/cwd",
      (cwd) => seen.push(cwd),
      () => undefined,
    );
    expect(seen).toEqual(["/some/cwd"]);
  });

  it.each([
    [
      "a refusal",
      "refused: not a worktree of /x/.git",
      "not a worktree of /x/.git",
    ],
    ["a multi-line refusal", "refused: first\nsecond", "first second"],
  ])("maps %s to one preflight line and exit 3", (_name, message, shown) => {
    const result = run(() => {
      throw new Error(message);
    });
    expect(result).toEqual({ code: 3, lines: [`preflight: ${shown}\n`] });
  });

  it("fails closed with exit 1 on any other error", () => {
    const result = run(() => {
      throw new Error("spawn ENOENT");
    });
    expect(result.code).toBe(1);
    expect(result.lines).toEqual([
      "preflight: unexpected error: spawn ENOENT\n",
    ]);
  });
});

describe("as a process", () => {
  const script = new URL("./worktree.ts", import.meta.url).pathname;

  it("takes no arguments", () => {
    const result = spawnSync(process.execPath, [script, "extra"], {
      encoding: "utf8",
    });
    expect([result.status, result.stderr]).toEqual([
      2,
      "preflight: takes no arguments\n",
    ]);
  });
});

describe("source", () => {
  const source = readFileSync(
    new URL("./worktree.ts", import.meta.url),
    "utf8",
  );

  it("imports no child_process and reaches git only through safe-exec", () => {
    expect(source).not.toContain("child_process");
    expect(source).toContain('from "./safe-exec.ts"');
  });
});
