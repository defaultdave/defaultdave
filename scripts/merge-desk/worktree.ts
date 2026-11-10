// Launcher preflight: confirms the working directory is a worktree of this repo before an excluded command runs.
// A correctness guard, not the boundary: the launcher pins and the sandbox are the boundary. Takes no arguments.
// Git runs only through safe-exec.ts, which owns the hardened child env.
// @ts-expect-error TS5097: Node needs the .ts extension, and the root tsconfig does not allow it
import { locateWorktree } from "./safe-exec.ts";

export const REFUSED_EXIT = 3;

type Locate = (cwd: string) => unknown;

/** Returns the exit code: 0 on success, 3 with one `preflight:` line on a `refused:` error, 1 on anything else. */
export function preflight(
  cwd: string,
  locate: Locate = locateWorktree,
  write: (line: string) => void = (line) => process.stderr.write(line),
): number {
  try {
    locate(cwd);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const oneLine = message.replace(/\s*\n\s*/g, " ").trim();
    if (oneLine.startsWith("refused:")) {
      write(`preflight: ${oneLine.slice("refused:".length).trim()}\n`);
      return REFUSED_EXIT;
    }
    write(`preflight: unexpected error: ${oneLine}\n`);
    return 1;
  }
}

if (import.meta.main) {
  if (process.argv.length > 2) {
    process.stderr.write("preflight: takes no arguments\n");
    process.exit(2);
  }
  process.exit(preflight(process.cwd()));
}
