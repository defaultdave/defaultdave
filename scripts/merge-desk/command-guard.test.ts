import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error TS5097: Node needs the .ts extension, and the root tsconfig does not allow it
import { check, defaultBin, judge } from "./command-guard.ts";

const BIN = "/Users/test/.local/share/defaultdave-merge-desk/bin/defaultdave/";
const AG = `${BIN}agent-git`;
const PC = `${BIN}post-check`;

describe("check: allowed", () => {
  it.each([
    ["no launcher named", "git status"],
    ["a launcher with no arguments", AG],
    ["plain words", `${AG} push unit/merge-desk-install`],
    [
      "a quoted title and body",
      `${AG} pr main 'unit: a title (x)' --body 'a & b'`,
    ],
    [
      "a body with an escaped apostrophe and a $(",
      `${AG} issue-comment 41 --body 'it'\\''s fine $(x)'`,
    ],
    [
      "a multi-line body",
      `${AG} issue-body 41 --body 'line one\nline two\n\`tick\` "q"'`,
    ],
    [
      "post-check with a quoted sha",
      `${PC} verdict --agent review --sha 'abc123'`,
    ],
    ["post-check with plain flags", `${PC} bookkeeping --pr 12 --sha abc123`],
    [
      "the launcher named inside a quoted body",
      `${AG} issue-comment 1 --body '${AG} done'`,
    ],
  ])("%s", (_name, command) => {
    expect(check(command, BIN)).toBeNull();
  });
});

describe("check: denied", () => {
  it.each([
    ["command substitution", `${AG} push $(whoami)`],
    ["$((", `${AG} push $((1+1))`],
    ["${", `${AG} push \${HOME}`],
    ["backticks", `${AG} push \`whoami\``],
    ["<(", `${AG} push <(x)`],
    [">(", `${AG} push >(x)`],
    ["double quotes", `${AG} issue-comment 1 --body "hi"`],
    ["a semicolon", `${AG} push x; id`],
    ["an ampersand", `${AG} push x & id`],
    ["a pipe", `${AG} push x | cat`],
    ["a redirect out", `${AG} push x > out`],
    ["a redirect in", `${AG} push x < in`],
    ["a newline outside quotes", `${AG} push x\nid`],
    ["a tilde", `${AG} push ~/x`],
    ["a tab", `${AG} push\tx`],
    ["a glob", `${AG} push *`],
    ["a bare backslash", `${AG} push a\\ b`],
    [
      "an unquoted apostrophe left open",
      `${AG} issue-comment 1 --body 'oops $(x)`,
    ],
    ["a quote closed too early", `${AG} issue-comment 1 --body 'it's $(id)'`],
    ["an env prefix", `FOO=1 ${AG} push x`],
    ["cd then the launcher", `cd x && ${AG} push y`],
    ["bash -c", `bash -c '${AG} push y'`],
    ["a launcher not first", `echo hi ${AG} push y`],
    ["a leading space", ` ${AG} push y`],
    ["a longer launcher name", `${AG}-evil push y`],
    ["the revert launcher", `${BIN}revert '1'`],
    ["the command-guard launcher", `${BIN}command-guard`],
    ["a doubled slash", `${BIN}/agent-git push y`],
  ])("%s", (_name, command) => {
    expect(check(command, BIN)).toEqual(expect.any(String));
  });

  it("gives one line naming the first offender", () => {
    expect(check(`${AG} push $(id)`, BIN)).toBe(
      "`$` (expansion) outside single quotes",
    );
  });
});

describe("judge", () => {
  const payload = (command: unknown, tool = "Bash") =>
    JSON.stringify({ tool_name: tool, tool_input: { command } });

  it.each([
    ["a non-Bash tool", payload(`${AG} push $(id)`, "Edit"), false],
    ["a clean Bash call", payload(`${AG} push x`), false],
    ["a Bash call not naming the launchers", payload("ls"), false],
    ["a denied Bash call", payload(`${AG} push $(id)`), true],
    ["input that is not JSON", "nope", true],
    ["JSON that is not an object", "7", true],
    ["a Bash call with no command", payload(undefined), true],
  ])("%s", (_name, input, denied) => {
    expect(judge(input, BIN) !== null).toBe(denied);
  });
});

describe("defaultBin", () => {
  it("is the bin dir beside the export dir", () => {
    expect(defaultBin("/p/share/abc")).toBe("/p/share/bin/defaultdave/");
  });
});

describe("as a hook process", () => {
  const run = (command: string) =>
    spawnSync(
      process.execPath,
      [new URL("./command-guard.ts", import.meta.url).pathname, BIN],
      {
        input: JSON.stringify({ tool_name: "Bash", tool_input: { command } }),
        encoding: "utf8",
      },
    );

  it("exits 0 silently for an allowed command", () => {
    const result = run(`${AG} push x`);
    expect([result.status, result.stdout, result.stderr]).toEqual([0, "", ""]);
  });

  it("exits 2 with one reason line for a denied command", () => {
    const result = run(`${AG} push $(id)`);
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/^command-guard: denied: .+\n$/);
  });
});

describe("source", () => {
  it("imports no child_process", () => {
    const source = readFileSync(
      new URL("./command-guard.ts", import.meta.url),
      "utf8",
    );
    expect(source).not.toContain("child_process");
  });
});
