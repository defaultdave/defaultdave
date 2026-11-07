import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Card } from "./Card";

const base = {
  title: "Checkout rebuild",
  description: "Cut checkout time in half.",
  href: "/work/checkout",
  linkLabel: "Read the case study",
} as const;

describe("Card", () => {
  it("renders a work card: heading, subtitle, tags and link", () => {
    const html = renderToStaticMarkup(
      <Card
        {...base}
        subtitle="2023 to 2025, Lead"
        tags={["React", "Performance"]}
      />,
    );
    expect(html).toMatch(/<h3[^>]*>Checkout rebuild<\/h3>/);
    expect(html).toContain("2023 to 2025, Lead");
    expect(html).toContain(">React</span>");
    expect(html).toContain(">Performance</span>");
    expect(html).toContain('href="/work/checkout"');
    expect(html).toContain(">Read the case study</a>");
  });

  it("renders a section card: no subtitle, no tag list", () => {
    const html = renderToStaticMarkup(<Card {...base} />);
    expect(html).not.toContain("<ul");
    expect(html).toContain("Cut checkout time in half.");
  });

  it("uses the heading level it is given", () => {
    expect(renderToStaticMarkup(<Card {...base} headingLevel={2} />)).toMatch(
      /<h2[ >]/,
    );
  });
});
