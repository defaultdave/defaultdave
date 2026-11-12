// Posts completed check runs as the defaultdave-agents App (ADR 0001 rules 5 and 6). There is no by-hand
// "post green": a check comes from a /review-pr verdict file, or from bookkeeping mode.
//   /Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/post-check verdict --agent <review|qa|spec-compliance|a11y-audit|architecture-audit|perf-check> --sha <head sha> [--dir .team-verdicts]
//   /Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave/post-check bookkeeping --pr <number> --sha <head sha>
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
// @ts-expect-error TS5097: Node needs the .ts extension, and the root tsconfig does not allow it
import { DEFAULT_CONF, mintToken } from "./app-token.ts";
// @ts-expect-error TS5097: Node needs the .ts extension, and the root tsconfig does not allow it
import { checkScope } from "./scope-check.ts";
import {
  type Deps as SafeDeps,
  EXPECTED_COMMON_DIR,
  GIT,
  gitRead,
  locateWorktree,
  // @ts-expect-error TS5097: Node needs the .ts extension, and the root tsconfig does not allow it
} from "./safe-exec.ts";

export const REPO = "defaultdave/defaultdave";
/** Required on `main`, pinned to the App. */
export const REQUIRED_CHECKS = [
  "review-agent",
  "qa-agent",
  "spec-compliance",
  "a11y-audit",
] as const;
/** Run on every PR but advisory. */
export const ADVISORY_CHECKS = ["architecture-audit", "perf-check"] as const;
export const CHECK_NAMES: readonly string[] = [
  ...REQUIRED_CHECKS,
  ...ADVISORY_CHECKS,
];
export const CONCLUSIONS = ["success", "failure"] as const;
export const SUMMARY_LIMIT = 65_000;
export const NOT_APPLICABLE_SUMMARY = "not applicable: bookkeeping only";
export const DEFAULT_VERDICT_DIR = ".team-verdicts";
/** GitHub stops listing a PR's files at 3000, so a larger PR cannot be proven bookkeeping-only. */
const FILE_LIST_CEILING = 3000;

interface VerdictSource {
  /** Check name posted under. */
  check: string;
  /** The verdict key the agent emits, as defined in its agent file. */
  key: string;
  pass: readonly string[];
  fail: readonly string[];
}

/** ADR rule 5: `review` posts as `review-agent`, `qa` as `qa-agent`, specialists under their own names. */
export const VERDICTS: Record<string, VerdictSource> = {
  review: {
    check: "review-agent",
    key: "REVIEW_VERDICT",
    pass: ["APPROVE", "APPROVE_WITH_NITS"],
    fail: ["REQUEST_CHANGES"],
  },
  qa: { check: "qa-agent", key: "QA_VERDICT", pass: ["PASS"], fail: ["FAIL"] },
  "spec-compliance": {
    check: "spec-compliance",
    key: "SPEC_COMPLIANCE_VERDICT",
    pass: ["APPROVE"],
    fail: ["REQUEST_CHANGES"],
  },
  "a11y-audit": {
    check: "a11y-audit",
    key: "A11Y_VERDICT",
    pass: ["APPROVE"],
    fail: ["REQUEST_CHANGES"],
  },
  "architecture-audit": {
    check: "architecture-audit",
    key: "ARCH_VERDICT",
    pass: ["APPROVE"],
    fail: ["REQUEST_CHANGES"],
  },
  "perf-check": {
    check: "perf-check",
    key: "PERF_VERDICT",
    pass: ["APPROVE"],
    fail: ["REQUEST_CHANGES"],
  },
};

export interface CheckInput {
  name: string;
  sha: string;
  conclusion: string;
  summary: string;
}

/** Validates the input and builds the check-runs request body. */
export function buildCheckRun(input: CheckInput) {
  if (!CHECK_NAMES.includes(input.name))
    throw new Error(`name must be one of ${CHECK_NAMES.join(", ")}`);
  if (!(CONCLUSIONS as readonly string[]).includes(input.conclusion)) {
    throw new Error(`conclusion must be one of ${CONCLUSIONS.join(", ")}`);
  }
  if (!/^[0-9a-f]{40}$/.test(input.sha))
    throw new Error("--sha must be a full 40-character commit sha");
  return {
    name: input.name,
    head_sha: input.sha,
    status: "completed",
    conclusion: input.conclusion,
    output: {
      title: `${input.name}: ${input.conclusion}`,
      summary: input.summary.slice(0, SUMMARY_LIMIT),
    },
  };
}

const API_HEADERS = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
});

export async function postCheck(
  input: CheckInput,
  token: string,
  doFetch: typeof fetch = fetch,
): Promise<void> {
  const response = await doFetch(
    `https://api.github.com/repos/${REPO}/check-runs`,
    {
      method: "POST",
      headers: API_HEADERS(token),
      body: JSON.stringify(buildCheckRun(input)),
    },
  );
  if (!response.ok)
    throw new Error(
      `GitHub refused the check run: HTTP ${String(response.status)}`,
    );
}

/**
 * Reads the conclusion from a verdict file. Any failing verdict line makes it a failure; otherwise it needs at
 * least one passing line. No line, or a line that is neither (for example BLOCKED), throws: nothing is posted.
 */
export function conclusionFromVerdict(
  agent: string,
  text: string,
): "success" | "failure" {
  const source = VERDICTS[agent];
  if (!source)
    throw new Error(
      `--agent must be one of ${Object.keys(VERDICTS).join(", ")}`,
    );
  // The lookahead skips the agent file's template line "KEY=APPROVE|REQUEST_CHANGES".
  const found = [
    ...text.matchAll(
      new RegExp(`${source.key}\\s*[=:]\\s*\\**\\s*([A-Z_]+)(?![A-Z_|])`, "g"),
    ),
  ].map((match) => match[1] ?? "");
  if (found.length === 0)
    throw new Error(`no ${source.key} line in the verdict file`);
  const unknown = found.filter(
    (value) => !source.pass.includes(value) && !source.fail.includes(value),
  );
  if (unknown.length > 0)
    throw new Error(
      `${source.key} is ${unknown.join(", ")}, which is not a verdict to post`,
    );
  return found.some((value) => source.fail.includes(value))
    ? "failure"
    : "success";
}

export interface VerdictOptions {
  agent: string;
  sha: string;
  dir: string;
  token: string;
  /** Returns the file's text, or null when it does not exist. */
  read: (path: string) => string | null;
  fetch?: typeof fetch;
}

/** Posts `<dir>/<agent>.md` under its check name. A missing file posts nothing and returns null. */
export async function postVerdict(
  options: VerdictOptions,
): Promise<string | null> {
  const source = VERDICTS[options.agent];
  if (!source)
    throw new Error(
      `--agent must be one of ${Object.keys(VERDICTS).join(", ")}`,
    );
  const text = options.read(join(options.dir, `${options.agent}.md`));
  if (text === null) return null;
  const conclusion = conclusionFromVerdict(options.agent, text);
  await postCheck(
    { name: source.check, sha: options.sha, conclusion, summary: text },
    options.token,
    options.fetch,
  );
  return `${source.check}: ${conclusion}`;
}

interface PullRequest {
  title: string;
  base: { ref: string };
  head: { ref: string; sha: string };
}

async function getJson<T>(
  url: URL,
  token: string,
  doFetch: typeof fetch,
): Promise<T> {
  const response = await doFetch(url, { headers: API_HEADERS(token) });
  if (!response.ok)
    throw new Error(
      `GitHub refused ${url.pathname}: HTTP ${String(response.status)}`,
    );
  return (await response.json()) as T;
}

/** Every path a PR touches, both sides of a rename, paged 100 at a time. */
export async function fetchPrFiles(
  pr: number,
  token: string,
  doFetch: typeof fetch,
): Promise<string[]> {
  const files: string[] = [];
  for (let page = 1; ; page++) {
    const url = new URL(
      `https://api.github.com/repos/${REPO}/pulls/${String(pr)}/files`,
    );
    url.search = new URLSearchParams({
      per_page: "100",
      page: String(page),
    }).toString();
    const batch = await getJson<
      { filename: string; previous_filename?: string }[]
    >(url, token, doFetch);
    for (const file of batch)
      files.push(
        file.filename,
        ...(file.previous_filename ? [file.previous_filename] : []),
      );
    if (batch.length < 100) return files;
    if (page * 100 >= FILE_LIST_CEILING)
      throw new Error(
        `PR ${String(pr)} has ${String(FILE_LIST_CEILING)}+ files; cannot confirm it is bookkeeping only`,
      );
  }
}

export interface BookkeepingOptions {
  pr: number;
  sha: string;
  token: string;
  fetch?: typeof fetch;
}

/**
 * ADR rule 6: posts the four required agent checks as success, "not applicable: bookkeeping only", but only when
 * the same scope rules the `scope-manifest` check runs pass this PR as bookkeeping on its current head.
 */
export async function postBookkeeping(
  options: BookkeepingOptions,
): Promise<string[]> {
  const doFetch = options.fetch ?? fetch;
  const pull = await getJson<PullRequest>(
    new URL(`https://api.github.com/repos/${REPO}/pulls/${String(options.pr)}`),
    options.token,
    doFetch,
  );
  if (pull.head.sha !== options.sha) {
    throw new Error(
      `refused: PR ${String(options.pr)} head is ${pull.head.sha}, not ${options.sha}`,
    );
  }
  const verdict = checkScope({
    title: pull.title,
    base: pull.base.ref,
    head: pull.head.ref,
    changedFiles: await fetchPrFiles(options.pr, options.token, doFetch),
    units: new Set(), // a bookkeeping title never consults the unit list
  });
  if (!verdict.ok)
    throw new Error(`refused: scope-check fails this PR: ${verdict.reason}`);
  if (verdict.kind !== "bookkeeping") {
    throw new Error(
      `refused: scope-check passes this PR as ${verdict.kind}, not as bookkeeping`,
    );
  }
  for (const name of REQUIRED_CHECKS) {
    await postCheck(
      {
        name,
        sha: options.sha,
        conclusion: "success",
        summary: NOT_APPLICABLE_SUMMARY,
      },
      options.token,
      doFetch,
    );
  }
  return REQUIRED_CHECKS.map(
    (name) => `${name}: success (${NOT_APPLICABLE_SUMMARY})`,
  );
}

function readIfPresent(path: string): string | null {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

/**
 * A verdict file describes the checked-out commit, so refuse to post it on any other sha. The worktree is
 * located first: only a worktree of this repository is asked for its HEAD.
 */
export function localHead(
  cwd: string,
  deps: Pick<SafeDeps, "git" | "expectedCommonDir">,
): string {
  locateWorktree(cwd, deps);
  const result = gitRead(cwd, ["rev-parse", "HEAD"], deps);
  if (result.code !== 0) throw new Error("git rev-parse HEAD failed");
  return result.stdout.trim();
}

export interface Deps extends SafeDeps {
  /** The untrusted worktree the verdict describes. */
  cwd: string;
  token: () => Promise<string>;
}

/** The live dependencies: fixed git, the constant common dir, and an App token minted from an explicit conf path. */
export function realDeps(): Deps {
  return {
    git: GIT,
    expectedCommonDir: EXPECTED_COMMON_DIR,
    cwd: process.cwd(),
    token: () => mintToken({ confPath: DEFAULT_CONF }),
  };
}

const USAGE =
  "usage: post-check.ts verdict --agent <name> --sha <sha> [--dir <dir>] | bookkeeping --pr <n> --sha <sha>";

/** Runs one mode. Returns the exit code: 0 done, 1 any failure. */
export async function main(argv: string[], deps: Deps): Promise<number> {
  try {
    const { values, positionals } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        agent: { type: "string" },
        sha: { type: "string" },
        dir: { type: "string", default: DEFAULT_VERDICT_DIR },
        pr: { type: "string" },
      },
    });
    const [mode] = positionals;
    if (!values.sha) throw new Error("--sha is required");
    if (mode === "verdict") {
      if (!values.agent) throw new Error("--agent is required");
      // Validate before touching the worktree or minting a token.
      if (!VERDICTS[values.agent])
        throw new Error(
          `--agent must be one of ${Object.keys(VERDICTS).join(", ")}`,
        );
      if (values.sha !== localHead(deps.cwd, deps))
        throw new Error(
          "refused: --sha is not the checked-out commit the verdict describes",
        );
      const options = {
        agent: values.agent,
        sha: values.sha,
        dir: values.dir,
        read: readIfPresent,
      };
      if (readIfPresent(join(values.dir, `${values.agent}.md`)) === null) {
        console.error(`no ${values.dir}/${values.agent}.md; posted nothing`);
      } else {
        console.log(
          `posted ${(await postVerdict({ ...options, token: await deps.token() })) ?? ""} on ${values.sha.slice(0, 7)}`,
        );
      }
    } else if (mode === "bookkeeping") {
      const pr = Number(values.pr);
      if (!Number.isInteger(pr) || pr <= 0)
        throw new Error("--pr must be a PR number");
      for (const line of await postBookkeeping({
        pr,
        sha: values.sha,
        token: await deps.token(),
      }))
        console.log(`posted ${line}`);
    } else {
      throw new Error(USAGE);
    }
    return 0;
  } catch (error) {
    console.error((error as Error).message);
    return 1;
  }
}

if (import.meta.main) {
  process.exit(await main(process.argv.slice(2), realDeps()));
}
