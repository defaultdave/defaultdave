// PreToolUse hook for Bash. Reads the hook JSON on stdin. A command that names the launcher directory runs outside
// the sandbox, so it must be one launcher call whose only unquoted text is plain words: no expansion, no operator.
// Exit 0 allows (silently); exit 2 denies with one reason line on stderr. A command that does not name the launcher
// directory passes untouched.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const LAUNCHERS = ["agent-git", "post-check"] as const;
/** Unquoted characters that may appear after the launcher name. */
const PLAIN = /^[A-Za-z0-9_./:=@+, -]$/;

const FORBIDDEN: Record<string, string> = {
  $: "`$` (expansion) outside single quotes",
  "`": "backtick outside single quotes",
  '"': "double quote outside single quotes",
  ";": "`;` outside single quotes",
  "&": "`&` outside single quotes",
  "|": "`|` outside single quotes",
  ">": "`>` outside single quotes",
  "<": "`<` outside single quotes",
  "(": "`(` outside single quotes",
  "~": "`~` outside single quotes",
  "\n": "newline outside single quotes",
};

/** The launcher directory with a trailing slash, from the install layout: <prefix>/<sha>/command-guard.ts. */
export function defaultBin(dir: string = import.meta.dirname): string {
  return `${join(dirname(dir), "bin", "defaultdave")}/`;
}

/** Returns the denial reason, or null when the command may run. `bin` ends with a slash. */
export function check(command: string, bin: string): string | null {
  if (!command.includes(bin)) return null;
  if (command.startsWith(`${bin}revert`))
    return "there is no revert launcher; Dave runs scripts/merge-desk/revert.sh by hand";
  const launcher = LAUNCHERS.map((name) => `${bin}${name}`).find(
    (path) =>
      command.startsWith(path) &&
      (command.length === path.length || command[path.length] === " "),
  );
  if (launcher === undefined)
    return `the first word must be exactly ${bin}agent-git or ${bin}post-check (no env prefix, cd, bash -c or pipe before it)`;
  let quoted = false;
  for (let i = launcher.length; i < command.length; i++) {
    const char = command[i] ?? "";
    if (quoted) {
      if (char === "'") quoted = false;
    } else if (char === "'") {
      quoted = true;
    } else if (char === "\\") {
      if (command[i + 1] !== "'")
        return "backslash outside single quotes (only \\' is allowed)";
      i++;
    } else if (!PLAIN.test(char)) {
      return (
        FORBIDDEN[char] ??
        `character ${JSON.stringify(char)} outside single quotes`
      );
    }
  }
  if (quoted) return "unterminated single quote";
  return null;
}

/** Reads the hook payload; returns the denial reason or null. Unreadable input is denied. */
export function judge(input: string, bin: string): string | null {
  let payload: unknown;
  try {
    payload = JSON.parse(input);
  } catch {
    return "hook input is not JSON";
  }
  if (typeof payload !== "object" || payload === null) {
    return "hook input is not an object";
  }
  const { tool_name: tool, tool_input: toolInput } = payload as {
    tool_name?: unknown;
    tool_input?: { command?: unknown } | null;
  };
  if (tool !== "Bash") return null;
  const command = toolInput?.command;
  if (typeof command !== "string") return "Bash input has no command string";
  return check(command, bin);
}

if (import.meta.main) {
  const reason = judge(
    readFileSync(0, "utf8"),
    process.argv[2] ?? defaultBin(),
  );
  if (reason !== null) {
    process.stderr.write(`command-guard: denied: ${reason}\n`);
    process.exit(2);
  }
}
