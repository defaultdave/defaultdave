import { describe, expect, it } from "vitest";
import {
  buildCheckRun,
  CHECK_NAMES,
  conclusionFromVerdict,
  fetchPrFiles,
  NOT_APPLICABLE_SUMMARY,
  postBookkeeping,
  postCheck,
  postVerdict,
  REQUIRED_CHECKS,
  SUMMARY_LIMIT,
} from "./post-check";

const SHA = "a".repeat(40);
const input = {
  name: "review-agent",
  sha: SHA,
  conclusion: "success",
  summary: "looks fine",
};

interface Seen {
  url: string;
  method: string;
  body: Record<string, unknown> | null;
}

/** A fake GitHub: routes by path, records every request. */
function fakeGithub(routes: Record<string, unknown>, status = 200) {
  const seen: Seen[] = [];
  const fake = ((url: URL | string, init?: RequestInit) => {
    const href = String(url);
    const path = href.replace("https://api.github.com", "");
    seen.push({
      url: href,
      method: init?.method ?? "GET",
      body: init?.body
        ? (JSON.parse(init.body as string) as Record<string, unknown>)
        : null,
    });
    const hit = Object.entries(routes).find(([route]) =>
      path.startsWith(route),
    );
    return Promise.resolve(
      new Response(JSON.stringify(hit?.[1] ?? {}), {
        status: hit ? status : 404,
      }),
    );
  }) as unknown as typeof fetch;
  return { fake, seen };
}

const posts = (seen: Seen[]) =>
  seen.filter((request) => request.method === "POST");

describe("buildCheckRun", () => {
  it("builds a completed check run with the title and summary", () => {
    expect(buildCheckRun(input)).toEqual({
      name: "review-agent",
      head_sha: SHA,
      status: "completed",
      conclusion: "success",
      output: { title: "review-agent: success", summary: "looks fine" },
    });
  });

  it.each([
    "review-agent",
    "qa-agent",
    "spec-compliance",
    "a11y-audit",
    "architecture-audit",
    "perf-check",
  ])("accepts %s", (name) => {
    expect(buildCheckRun({ ...input, name }).name).toBe(name);
  });

  it("lists the four required checks and the two advisory ones", () => {
    expect([...REQUIRED_CHECKS]).toEqual([
      "review-agent",
      "qa-agent",
      "spec-compliance",
      "a11y-audit",
    ]);
    expect(CHECK_NAMES).toHaveLength(6);
  });

  it("cuts the summary to 65,000 characters", () => {
    expect(
      buildCheckRun({ ...input, summary: "x".repeat(SUMMARY_LIMIT + 500) })
        .output.summary,
    ).toHaveLength(SUMMARY_LIMIT);
  });

  it.each([
    [{ name: "scope-manifest" }, "name"],
    [{ name: "review" }, "name"],
    [{ conclusion: "neutral" }, "conclusion"],
    [{ sha: "abc123" }, "--sha"],
  ])("rejects %j", (patch, message) => {
    expect(() => buildCheckRun({ ...input, ...patch })).toThrow(message);
  });
});

describe("postCheck", () => {
  it("posts to this repo's check-runs endpoint with the token", async () => {
    const { fake, seen } = fakeGithub({
      "/repos/defaultdave/defaultdave/check-runs": {},
    });
    await postCheck(input, "ghs_fake", fake);
    expect(seen[0]?.url).toBe(
      "https://api.github.com/repos/defaultdave/defaultdave/check-runs",
    );
    expect(seen[0]?.body?.name).toBe("review-agent");
  });

  it("fails with the status when GitHub refuses", async () => {
    const { fake } = fakeGithub({ "/repos": {} }, 403);
    await expect(postCheck(input, "ghs_fake", fake)).rejects.toThrow(
      "HTTP 403",
    );
  });
});

describe("conclusionFromVerdict", () => {
  it.each([
    ["review", "REVIEW_VERDICT=APPROVE", "success"],
    ["review", "REVIEW_VERDICT=APPROVE_WITH_NITS", "success"],
    ["review", "REVIEW_VERDICT=REQUEST_CHANGES", "failure"],
    ["review", "**REVIEW_VERDICT:** APPROVE", "success"],
    ["qa", "QA_VERDICT=PASS", "success"],
    ["qa", "QA_VERDICT=FAIL", "failure"],
    ["spec-compliance", "SPEC_COMPLIANCE_VERDICT=APPROVE", "success"],
    ["a11y-audit", "A11Y_VERDICT=REQUEST_CHANGES", "failure"],
    ["architecture-audit", "ARCH_VERDICT=APPROVE", "success"],
    ["perf-check", "PERF_VERDICT=APPROVE", "success"],
  ])("%s with %s is %s", (agent, line, expected) => {
    expect(conclusionFromVerdict(agent, `# Report\n\n${line}\n`)).toBe(
      expected,
    );
  });

  it("is a failure when any verdict line fails, even after an approve", () => {
    expect(
      conclusionFromVerdict(
        "review",
        "REVIEW_VERDICT=APPROVE\nREVIEW_VERDICT=REQUEST_CHANGES",
      ),
    ).toBe("failure");
  });

  it.each([
    ["no verdict line", "review", "all good"],
    ["BLOCKED", "review", "REVIEW_VERDICT=BLOCKED"],
    ["another agent's key", "qa", "REVIEW_VERDICT=APPROVE"],
    ["a value from the wrong set", "qa", "QA_VERDICT=APPROVE"],
    [
      "the template line",
      "review",
      "Emit REVIEW_VERDICT=APPROVE|APPROVE_WITH_NITS|REQUEST_CHANGES",
    ],
    ["a prefix of a value", "review", "REVIEW_VERDICT=APPROVEX"],
  ])("throws for %s and so posts nothing", (_label, agent, text) => {
    expect(() => conclusionFromVerdict(agent, text)).toThrow();
  });

  it("throws for an unknown agent", () => {
    expect(() => conclusionFromVerdict("scope-manifest", "x")).toThrow(
      "--agent",
    );
  });
});

describe("postVerdict", () => {
  const options = (
    read: (path: string) => string | null,
    agent = "review",
  ) => ({
    agent,
    sha: SHA,
    dir: ".team-verdicts",
    token: "ghs_fake",
    read,
  });

  it("posts review.md as review-agent with the file as the summary", async () => {
    const { fake, seen } = fakeGithub({
      "/repos/defaultdave/defaultdave/check-runs": {},
    });
    const paths: string[] = [];
    const text = "Looks fine.\nREVIEW_VERDICT=APPROVE\n";
    const result = await postVerdict({
      ...options((path) => (paths.push(path), text)),
      fetch: fake,
    });
    expect(paths).toEqual([".team-verdicts/review.md"]);
    expect(result).toBe("review-agent: success");
    expect(posts(seen)[0]?.body).toMatchObject({
      name: "review-agent",
      conclusion: "success",
      output: { summary: text },
    });
  });

  it.each([
    ["qa", "qa-agent", "QA_VERDICT=FAIL", "failure"],
    ["a11y-audit", "a11y-audit", "A11Y_VERDICT=APPROVE", "success"],
  ])("posts %s under %s", async (agent, name, line, conclusion) => {
    const { fake, seen } = fakeGithub({ "/repos": {} });
    await postVerdict({ ...options(() => line, agent), fetch: fake });
    expect(posts(seen)[0]?.body).toMatchObject({ name, conclusion });
  });

  it("posts nothing when the verdict file is missing", async () => {
    const { fake, seen } = fakeGithub({ "/repos": {} });
    expect(
      await postVerdict({ ...options(() => null), fetch: fake }),
    ).toBeNull();
    expect(seen).toHaveLength(0);
  });

  it("posts nothing when the file has no usable verdict", async () => {
    const { fake, seen } = fakeGithub({ "/repos": {} });
    await expect(
      postVerdict({ ...options(() => "REVIEW_VERDICT=BLOCKED"), fetch: fake }),
    ).rejects.toThrow();
    expect(seen).toHaveLength(0);
  });
});

describe("fetchPrFiles", () => {
  it("pages until a short page and includes both sides of a rename", async () => {
    const page = (n: number) =>
      Array.from({ length: 100 }, (_, i) => ({
        filename: `f${String(n)}-${String(i)}.md`,
      }));
    const pages = [
      page(1),
      [{ filename: "new.md", previous_filename: "old.md" }],
    ];
    const requested: string[] = [];
    const fake = ((url: URL) => {
      requested.push(url.search);
      return Promise.resolve(
        new Response(JSON.stringify(pages[requested.length - 1]), {
          status: 200,
        }),
      );
    }) as unknown as typeof fetch;
    const files = await fetchPrFiles(7, "t", fake);
    expect(files).toHaveLength(102);
    expect(files.slice(-2)).toEqual(["new.md", "old.md"]);
    expect(requested).toEqual(["?per_page=100&page=1", "?per_page=100&page=2"]);
  });

  it("refuses a PR at GitHub's 3000-file ceiling", async () => {
    const full = JSON.stringify(
      Array.from({ length: 100 }, () => ({ filename: "a" })),
    );
    const fake = (() =>
      Promise.resolve(
        new Response(full, { status: 200 }),
      )) as unknown as typeof fetch;
    await expect(fetchPrFiles(7, "t", fake)).rejects.toThrow("3000");
  });
});

describe("postBookkeeping", () => {
  const pull = (patch: Record<string, unknown> = {}) => ({
    title: "PM bookkeeping: status",
    base: { ref: "main" },
    head: { ref: "pm/status", sha: SHA },
    ...patch,
  });
  const run = (routes: Record<string, unknown>, sha = SHA) => {
    const github = fakeGithub(routes);
    const result = postBookkeeping({
      pr: 9,
      sha,
      token: "ghs_fake",
      fetch: github.fake,
    });
    return { ...github, result };
  };
  const GOOD = {
    "/repos/defaultdave/defaultdave/pulls/9/files": [
      { filename: "docs/plan/STATUS.md" },
    ],
    "/repos/defaultdave/defaultdave/pulls/9": pull(),
    "/repos/defaultdave/defaultdave/check-runs": {},
  };

  it("posts the four required checks as success, not applicable, when scope-check passes it as bookkeeping", async () => {
    const { result, seen } = run(GOOD);
    expect(await result).toHaveLength(4);
    const bodies = posts(seen).map((request) => request.body);
    expect(bodies.map((body) => body?.name)).toEqual([...REQUIRED_CHECKS]);
    for (const body of bodies) {
      expect(body).toMatchObject({
        conclusion: "success",
        output: { summary: NOT_APPLICABLE_SUMMARY },
      });
    }
  });

  it.each([
    [
      "a code file rides along",
      {
        files: [{ filename: "docs/plan/STATUS.md" }, { filename: "src/a.ts" }],
      },
    ],
    [
      "a protected file rides along",
      { files: [{ filename: ".github/workflows/ci.yml" }] },
    ],
    [
      "the branch is not pm/",
      { pull: pull({ head: { ref: "unit/merge-desk", sha: SHA } }) },
    ],
    ["the title is a unit title", { pull: pull({ title: "merge-desk: x" }) }],
    ["the base is not main", { pull: pull({ base: { ref: "integration" } }) }],
    [
      "it is a revert of bookkeeping",
      {
        pull: pull({
          title: "Revert: PM bookkeeping: x",
          head: { ref: "revert/pr-2", sha: SHA },
        }),
      },
    ],
  ])("refuses and posts nothing when %s", async (_label, patch) => {
    const routes = {
      ...GOOD,
      "/repos/defaultdave/defaultdave/pulls/9/files":
        "files" in patch
          ? patch.files
          : GOOD["/repos/defaultdave/defaultdave/pulls/9/files"],
      "/repos/defaultdave/defaultdave/pulls/9":
        "pull" in patch
          ? patch.pull
          : GOOD["/repos/defaultdave/defaultdave/pulls/9"],
    };
    const { result, seen } = run(routes);
    await expect(result).rejects.toThrow("refused");
    expect(posts(seen)).toHaveLength(0);
  });

  it("refuses when --sha is not the PR's current head", async () => {
    const { result, seen } = run(GOOD, "b".repeat(40));
    await expect(result).rejects.toThrow("head is");
    expect(posts(seen)).toHaveLength(0);
  });
});
