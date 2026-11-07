import { describe, expect, it } from "vitest";
import { checkScope, parseUnits, type ScopeInput } from "./scope-check";

const units = parseUnits(
  JSON.stringify({
    units: [
      { id: "merge-desk" },
      { id: "page-home" },
      { id: "page" },
      { id: "seo-perf" },
    ],
  }),
);

const baseInput: ScopeInput = {
  title: "merge-desk: ports the scripts",
  base: "main",
  head: "unit/merge-desk",
  changedFiles: ["scripts/other/a.ts", "src/app/page.tsx"],
  units,
};
const check = (patch: Partial<ScopeInput>) =>
  checkScope({ ...baseInput, ...patch });
const bookkeeping = (patch: Partial<ScopeInput>) =>
  check({
    title: "PM bookkeeping: status",
    head: "pm/status",
    changedFiles: ["docs/plan/STATUS.md"],
    ...patch,
  });

describe("parseUnits", () => {
  it("reads the ids", () => {
    expect([...units]).toEqual(["merge-desk", "page-home", "page", "seo-perf"]);
  });

  it.each(["{}", '{"units":"x"}', '{"units":[{}]}', '{"units":[{"id":""}]}'])(
    "rejects %s",
    (json) => {
      expect(() => parseUnits(json)).toThrow();
    },
  );
});

describe("base", () => {
  it("passes a unit PR into main", () => {
    const verdict = check({});
    expect(verdict).toMatchObject({ ok: true, kind: "unit" });
  });

  it.each(["integration", "release"])("fails a PR into %s", (base) => {
    expect(check({ base }).ok).toBe(false);
    expect(bookkeeping({ base }).ok).toBe(false);
  });
});

describe("title", () => {
  it.each([
    ["no unit id", "Fix things"],
    ["an unknown unit id", "ghost: nope"],
    ["an id that only prefixes another", "merge: nope"],
    ["an uppercase id", "Merge-Desk: nope"],
    ["a revert of a title without a unit id", "Revert: Fix things"],
  ])("fails with %s", (_label, title) => {
    expect(check({ title }).ok).toBe(false);
  });

  it("passes a hyphenated unit id from its own branch, with or without a slug", () => {
    expect(check({ title: "page-home: hero", head: "unit/page-home" }).ok).toBe(
      true,
    );
    expect(
      check({ title: "page-home: hero", head: "unit/page-home-hero" }).ok,
    ).toBe(true);
  });
});

describe("branch must match the title", () => {
  it.each([
    "feature/x",
    "unit/page-home",
    "unit/merge-deskx",
    "unit/Merge-Desk",
    "pm/merge-desk",
    "main",
    "unit/",
  ])("fails %s for a merge-desk title", (head) => {
    expect(check({ head }).ok).toBe(false);
  });

  it("passes a slug on the unit id", () => {
    expect(check({ head: "unit/merge-desk-port" }).ok).toBe(true);
  });

  it("picks the longest unit id, so unit/page-home-x belongs to page-home, not page", () => {
    expect(check({ title: "page: x", head: "unit/page-home-x" }).ok).toBe(
      false,
    );
    expect(check({ title: "page-home: x", head: "unit/page-home-x" }).ok).toBe(
      true,
    );
    expect(check({ title: "page: x", head: "unit/page-wide" }).ok).toBe(true);
  });
});

describe("revert PRs", () => {
  it.each(["Revert: merge-desk: x", "Revert: Revert: merge-desk: x"])(
    "%s passes from revert/pr-<n>",
    (title) => {
      expect(check({ title, head: "revert/pr-12" })).toMatchObject({
        ok: true,
        kind: "revert",
      });
    },
  );

  it.each(["unit/merge-desk", "revert/pr-1x", "revert/12", "revert/pr-"])(
    "fails from %s",
    (head) => {
      expect(check({ title: "Revert: merge-desk: x", head }).ok).toBe(false);
    },
  );

  it("is held to the protected paths like any unit PR", () => {
    expect(
      check({
        title: "Revert: merge-desk: x",
        head: "revert/pr-3",
        changedFiles: [".github/a.yml"],
      }).ok,
    ).toBe(false);
  });

  it("a revert of a bookkeeping PR is not kind bookkeeping, so its agent checks are real", () => {
    const verdict = check({
      title: "Revert: PM bookkeeping: x",
      head: "revert/pr-3",
      changedFiles: ["docs/plan/STATUS.md"],
    });
    expect(verdict).toMatchObject({ ok: true, kind: "revert" });
  });
});

describe("protected paths", () => {
  it.each([
    ".github/workflows/x.yml",
    ".claude/settings.json",
    "CLAUDE.md",
    "scripts/merge-desk/agent-git.ts",
    "docs/adr/0002.md",
    "docs/plan/plan.json",
    "docs/plan/STATUS.md",
    "docs/plan/new-file.md",
    "docs/plan/DECISIONS.md",
  ])("a unit PR touching %s fails and names the file", (file) => {
    const verdict = check({ changedFiles: ["src/a.ts", file] });
    expect(verdict.ok).toBe(false);
    expect(verdict.reason).toContain(file);
  });

  it.each([
    "Docs/Plan/PLAN.json",
    "CLAUDE.MD",
    ".GitHub/workflows/x.yml",
    "Scripts/Merge-Desk/a.ts",
    ".CLAUDE/x",
  ])("matches case-insensitively (%s)", (file) => {
    expect(check({ changedFiles: [file] }).ok).toBe(false);
  });

  it("does not treat a lookalike as protected", () => {
    expect(
      check({
        changedFiles: [
          "docs/planning.md",
          "scripts/merge-desk-x/a.ts",
          "CLAUDE.md.bak",
        ],
      }).ok,
    ).toBe(true);
  });
});

describe("bookkeeping PRs", () => {
  it("passes on a pm/ branch touching the bookkeeping files and the PM's memory, as kind bookkeeping", () => {
    const verdict = bookkeeping({
      changedFiles: [
        "docs/plan/STATUS.md",
        "docs/plan/DECISIONS.md",
        "docs/plan/delta-log.md",
        "docs/plan/time-log.csv",
        ".claude/agent-memory/pm/notes.md",
        ".claude/agent-memory/pm/deep/sub.md",
      ],
    });
    expect(verdict).toMatchObject({ ok: true, kind: "bookkeeping" });
  });

  it.each(["docs/plan/plan.json", "docs/plan/plan-report.md"])(
    "passes %s when delta-log.md changes with it",
    (file) => {
      expect(
        bookkeeping({ changedFiles: [file, "docs/plan/delta-log.md"] }).ok,
      ).toBe(true);
    },
  );

  it.each(["docs/plan/plan.json", "docs/plan/plan-report.md"])(
    "fails %s without a delta-log.md row",
    (file) => {
      const verdict = bookkeeping({
        changedFiles: [file, "docs/plan/STATUS.md"],
      });
      expect(verdict.ok).toBe(false);
      expect(verdict.reason).toContain("delta-log.md");
    },
  );

  it.each([
    "src/app/page.tsx",
    "docs/plan/brief.md",
    "docs/plan/proposal.md",
    "docs/plan/preflight.md",
    "docs/adr/0001-agent-workflow-and-merge-rule.md",
    ".claude/agents/pm.md",
    ".claude/agent-memory/other-agent/x.md",
    ".claude/agent-memory/pm-x/x.md",
    ".claude/settings.json",
    ".github/workflows/ci.yml",
    "CLAUDE.md",
    "docs/plan/status.md",
  ])("fails when it also changes %s", (file) => {
    const verdict = bookkeeping({
      changedFiles: ["docs/plan/STATUS.md", file],
    });
    expect(verdict.ok).toBe(false);
    expect(verdict.reason).toContain(file);
  });

  it.each(["unit/merge-desk", "feature/x", "pm/", "pm/a/b", "main"])(
    "fails from branch %s",
    (head) => {
      expect(bookkeeping({ head }).ok).toBe(false);
    },
  );

  it("a unit title cannot ride a pm/ branch to reach bookkeeping paths", () => {
    expect(
      check({ head: "pm/status", changedFiles: ["docs/plan/STATUS.md"] }).ok,
    ).toBe(false);
  });
});
