import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { compileMdx } from "../../../content/mdx";
import type { WorkEntry as WorkEntryData } from "../../../content/types";
import { CaseStudy } from "./CaseStudy";
import { WorkEntry } from "./WorkEntry";
import { WorkList } from "./WorkList";

const entry = (over: Partial<WorkEntryData> = {}): WorkEntryData => ({
  slug: "x",
  title: "Entry X",
  summary: "What it was.",
  role: "Lead",
  period: { from: "2026-04", to: "2026-08" },
  stack: ["React", "Next.js"],
  links: [{ label: "Repo", href: "https://example.com/repo" }],
  featured: false,
  order: 1,
  kind: "card",
  ...over,
});

describe("WorkEntry", () => {
  it("renders a card: title, role, period, summary, tags, links, no detail link", () => {
    const html = renderToStaticMarkup(<WorkEntry entry={entry()} />);
    expect(html).toContain("Entry X");
    expect(html).toContain("Lead, Apr 2026 to Aug 2026");
    expect(html).toContain("What it was.");
    expect(html).toContain(">Next.js</span>");
    expect(html).toContain('href="https://example.com/repo"');
    expect(html).not.toContain("/work/x");
  });

  it("renders a case study with a link to its page and a sized cover", () => {
    const html = renderToStaticMarkup(
      <WorkEntry
        entry={entry({
          kind: "case-study",
          period: { from: "2026-09" },
          cover: { src: "/images/work/a.png", alt: "A screen" },
        })}
      />,
    );
    expect(html).toContain("since Sep 2026");
    expect(html).toContain('href="/work/x"');
    expect(html).toContain('alt="A screen"');
    expect(html).toContain('width="1200"');
    expect(html).toContain('height="630"');
  });
});

describe("WorkList", () => {
  it("puts case studies before cards, keeping each group's order", () => {
    const html = renderToStaticMarkup(
      <WorkList
        entries={[
          entry({ slug: "c1", title: "Card One" }),
          entry({ slug: "s1", title: "Study One", kind: "case-study" }),
          entry({ slug: "c2", title: "Card Two" }),
          entry({ slug: "s2", title: "Study Two", kind: "case-study" }),
        ]}
      />,
    );
    const at = (t: string) => html.indexOf(t);
    expect(at("Study One")).toBeLessThan(at("Study Two"));
    expect(at("Study Two")).toBeLessThan(at("Card One"));
    expect(at("Card One")).toBeLessThan(at("Card Two"));
  });

  it("names each section by a heading whose id matches aria-labelledby", () => {
    const html = renderToStaticMarkup(
      <WorkList
        entries={[entry(), entry({ slug: "s", kind: "case-study" })]}
      />,
    );
    const sections = [
      ...html.matchAll(/<section[^>]*aria-labelledby="([^"]*)"/g),
    ];
    expect(sections).toHaveLength(2);
    const names = sections.map(([, id = ""]) => {
      expect(id).toMatch(/^[a-z-]+$/);
      return new RegExp(`<h2[^>]*id="${id}"[^>]*>([^<]*)</h2>`).exec(html)?.[1];
    });
    expect(names).toEqual(["Case studies", "Other projects"]);
  });

  it("omits a group heading when the group is empty", () => {
    const html = renderToStaticMarkup(<WorkList entries={[entry()]} />);
    expect(html).not.toContain("Case studies");
    expect(html).toContain("Other projects");
  });
});

describe("CaseStudy", () => {
  it("renders the back link, h1, MDX body with Metric and Figure, and links", async () => {
    const body = await compileMdx(
      [
        "Body paragraph.",
        "",
        '<Metric label="LCP" value="1.2 s" />',
        "",
        '<Figure src="/a.png" alt="A chart" />',
      ].join("\n"),
    );
    const html = renderToStaticMarkup(
      <CaseStudy
        entry={entry({
          kind: "case-study",
          body,
          metrics: [{ label: "Speed", value: "2x" }],
        })}
      />,
    );
    expect(html).toContain('href="/work"');
    expect(html).toContain("Back to Work");
    expect(html).toMatch(/<h1[^>]*>Entry X<\/h1>/);
    expect(html).toContain("Body paragraph.");
    expect(html).toContain("1.2 s");
    expect(html).toContain('alt="A chart"');
    expect(html).toContain("2x");
    expect(html).toContain('href="https://example.com/repo"');
  });
});
