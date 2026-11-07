// The `scope-manifest` check (ADR 0001 rules 3, 6, 8). Reads git metadata and the plan record only; it never
// runs code from the PR. Env: PR_TITLE, BASE_REF, HEAD_REF, PR_HEAD (a local ref for the PR head).
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

export const PROTECTED = [
  ".github/",
  ".claude/",
  "CLAUDE.md",
  "scripts/merge-desk/",
  "docs/adr/",
  "docs/plan/",
];
/** Exact files a `PM bookkeeping:` PR may change. */
export const BOOKKEEPING_FILES = [
  "docs/plan/STATUS.md",
  "docs/plan/DECISIONS.md",
  "docs/plan/delta-log.md",
  "docs/plan/time-log.csv",
  "docs/plan/plan.json",
  "docs/plan/plan-report.md",
];
/** The PM's public memory: any file under this folder is bookkeeping. */
export const BOOKKEEPING_PREFIXES = [".claude/agent-memory/pm/"];
/** Calibration and Re-estimates edit these; each must come with a delta-log.md row. */
export const NEEDS_DELTA_LOG = [
  "docs/plan/plan.json",
  "docs/plan/plan-report.md",
];
export const DELTA_LOG = "docs/plan/delta-log.md";

/** `bookkeeping` is the only kind that may get "not applicable" agent checks (post-check.ts). */
export type Kind = "unit" | "bookkeeping" | "revert";
export type Verdict =
  { ok: true; reason: string; kind: Kind } | { ok: false; reason: string };

export interface ScopeInput {
  title: string;
  base: string;
  head: string;
  /** Files changed by the PR (git diff --name-only --no-renames base...head). */
  changedFiles: string[];
  /** Unit ids from docs/plan/plan.json. */
  units: ReadonlySet<string>;
}

/** Reads the unit ids from the text of docs/plan/plan.json. */
export function parseUnits(json: string): Set<string> {
  const parsed = JSON.parse(json) as { units?: { id?: unknown }[] };
  if (!Array.isArray(parsed.units))
    throw new Error("plan.json must have a units list");
  const ids = new Set<string>();
  for (const unit of parsed.units) {
    if (typeof unit.id !== "string" || unit.id === "")
      throw new Error("every plan.json unit needs an id");
    ids.add(unit.id);
  }
  return ids;
}

const fail = (reason: string): Verdict => ({ ok: false, reason });
const lower = (path: string) => path.toLowerCase();

const UNIT_TITLE = /^([a-z0-9][a-z0-9-]*):/;
const UNIT_BRANCH = /^unit\/([a-z0-9][a-z0-9-]*)$/;
const PM_BRANCH = /^pm\/[a-z0-9][a-z0-9-]*$/;
const REVERT_BRANCH = /^revert\/pr-[0-9]+$/;

/** The longest known unit id that the branch names: `unit/<id>` or `unit/<id>-<slug>`. */
function branchUnit(
  head: string,
  units: ReadonlySet<string>,
): string | undefined {
  const rest = UNIT_BRANCH.exec(head)?.[1];
  if (rest === undefined) return undefined;
  return [...units]
    .filter((id) => rest === id || rest.startsWith(`${id}-`))
    .sort((a, b) => b.length - a.length)[0];
}

const isBookkeepingPath = (file: string) =>
  BOOKKEEPING_FILES.includes(file) ||
  BOOKKEEPING_PREFIXES.some((prefix) => file.startsWith(prefix));

export function checkScope(input: ScopeInput): Verdict {
  const { base, head, changedFiles, units } = input;

  // 1. One tier: every PR targets main.
  if (base !== "main") return fail(`A PR must target main, not ${base}.`);

  // 2. The title names a unit, or is PM bookkeeping. Branch and title must agree.
  const revert = input.title.startsWith("Revert: ");
  const title = input.title.replace(/^(Revert: )+/, "");
  const bookkeeping = title.startsWith("PM bookkeeping:");
  const unitId = UNIT_TITLE.exec(title)?.[1];
  if (!bookkeeping && (unitId === undefined || !units.has(unitId))) {
    return fail(
      `Title must start with a unit id from plan.json (for example "merge-desk: …") or "PM bookkeeping:". Got: ${input.title}`,
    );
  }
  if (revert) {
    // revert.sh names its branch revert/pr-N; the unit id in the title is copied from the reverted PR.
    if (!REVERT_BRANCH.test(head))
      return fail(
        `A revert PR must come from a revert/pr-<number> branch, not ${head}.`,
      );
  } else if (bookkeeping) {
    if (!PM_BRANCH.test(head))
      return fail(
        `A bookkeeping PR must come from a pm/<slug> branch, not ${head}.`,
      );
  } else if (branchUnit(head, units) !== unitId) {
    return fail(
      `Branch ${head} must be unit/${unitId ?? ""}[-slug] to match the title's unit ${unitId ?? ""}.`,
    );
  }

  // 3. Paths. A bookkeeping PR may change only the bookkeeping paths; everything else may not touch protected ones.
  if (bookkeeping) {
    const stray = changedFiles.filter((file) => !isBookkeepingPath(file));
    if (stray.length > 0) {
      return fail(
        `A bookkeeping PR may touch only ${[...BOOKKEEPING_FILES, ...BOOKKEEPING_PREFIXES.map((p) => `${p}**`)].join(", ")}. Also changed: ${stray.join(", ")}`,
      );
    }
    if (
      changedFiles.some((file) => NEEDS_DELTA_LOG.includes(file)) &&
      !changedFiles.includes(DELTA_LOG)
    ) {
      return fail(
        `Changing ${NEEDS_DELTA_LOG.join(" or ")} needs a matching row in ${DELTA_LOG}.`,
      );
    }
    return {
      ok: true,
      kind: revert ? "revert" : "bookkeeping",
      reason:
        "Bookkeeping PR touches only the plan record and the PM's memory.",
    };
  }
  // Compared case-insensitively: a macOS checkout treats Docs/Plan and docs/plan as one folder.
  // An entry ending in "/" is a folder; any other entry is one exact file.
  const touched = changedFiles.filter((file) =>
    PROTECTED.some((path) =>
      path.endsWith("/")
        ? lower(file).startsWith(lower(path))
        : lower(file) === lower(path),
    ),
  );
  if (touched.length > 0)
    return fail(
      `Protected paths changed (Dave edits these): ${touched.join(", ")}`,
    );

  return {
    ok: true,
    kind: revert ? "revert" : "unit",
    reason: `${unitId ?? ""} into ${base}.`,
  };
}

function git(args: string[]): string {
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.status !== 0)
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr.trim()}`);
  return result.stdout;
}

if (import.meta.main) {
  try {
    const {
      PR_TITLE = "",
      BASE_REF = "",
      HEAD_REF = "",
      PR_HEAD = "pr-head",
    } = process.env;
    if (!BASE_REF || !HEAD_REF)
      throw new Error("BASE_REF and HEAD_REF are required");
    const changedFiles = git([
      "diff",
      "--name-only",
      "-z",
      "--no-renames",
      `origin/${BASE_REF}...${PR_HEAD}`,
    ])
      .split("\0")
      .filter(Boolean);
    const verdict = checkScope({
      title: PR_TITLE,
      base: BASE_REF,
      head: HEAD_REF,
      changedFiles,
      units: parseUnits(readFileSync("docs/plan/plan.json", "utf8")),
    });
    console.log(verdict.reason);
    process.exit(verdict.ok ? 0 : 1);
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
}
