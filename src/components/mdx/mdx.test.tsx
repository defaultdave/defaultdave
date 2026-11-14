import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { compileMdx } from "../../content/mdx";
import { MdxBody } from "./MdxBody";

async function render(source: string) {
  return renderToStaticMarkup(<MdxBody body={await compileMdx(source)} />);
}

describe("MDX pipeline", () => {
  it("renders Markdown and the three registered components", async () => {
    const html = await render(
      [
        "# Title",
        "",
        '<Callout tone="warning">Careful</Callout>',
        "",
        '<Metric label="LCP" value="1.2 s" note="p75" />',
        "",
        '<Figure src="/a.png" alt="A chart" caption="Fig 1" />',
      ].join("\n"),
    );
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<aside");
    expect(html).toContain("Careful");
    expect(html).toContain("<dt");
    expect(html).toContain("1.2 s");
    expect(html).toContain('alt="A chart"');
    expect(html).toContain("<figcaption>Fig 1</figcaption>");
  });

  it.each([
    ["raw HTML tag", "<div>hi</div>"],
    ["inline raw HTML", "text <span>hi</span>"],
    ["script tag", "<script>alert(1)</script>"],
    ["unregistered component", "<Banner />"],
    ["fragment", "<>x</>"],
    ["expression", "{1 + 1}"],
    ["import", 'import X from "x"\n\nhi'],
    ["expression attribute", "<Metric label={'a'} value=\"1\" />"],
    ["spread attribute", '<Metric {...props} label="a" value="1" />'],
  ])("rejects %s", async (_name, source) => {
    await expect(compileMdx(source)).rejects.toThrow();
  });
});

describe("GFM tables", () => {
  const table = [
    "| Metric | Before | After |",
    "| :----- | -----: | :---: |",
    "| LCP    |  4.1 s | 2.3 s |",
    "| INP    | 310 ms | 180 ms |",
  ].join("\n");

  it("renders a table with header and body cells", async () => {
    const html = await render(table);
    expect(html).toContain("<table");
    expect(html).toContain("<thead>");
    expect(html).toContain("<tbody>");
    expect(html.match(/<th /g)).toHaveLength(3);
    expect(html.match(/<td/g)).toHaveLength(6);
    expect(html).toContain(">Metric</th>");
    expect(html).toContain(">4.1 s</td>");
  });

  it("marks every header cell as a column header", async () => {
    const html = await render(table);
    expect(html.match(/<th scope="col"/g)).toHaveLength(3);
  });

  it("carries the alignment row to header and body cells", async () => {
    const html = await render(table);
    expect(html).toContain('<th scope="col" style="text-align:left">Metric');
    expect(html).toContain('<th scope="col" style="text-align:right">Before');
    expect(html).toContain('<th scope="col" style="text-align:center">After');
    expect(html).toContain('<td style="text-align:right">4.1 s</td>');
    expect(html).toContain('<td style="text-align:center">2.3 s</td>');
  });

  it("leaves a column without an alignment marker unstyled", async () => {
    const html = await render("| A |\n| - |\n| b |");
    expect(html).toContain('<th scope="col">A</th>');
    expect(html).toContain("<td>b</td>");
  });

  it("wraps the table in a named, focusable scroll group", async () => {
    const html = await render(table);
    expect(html).toMatch(
      /<div class="[^"]*" role="group" aria-label="Table" tabindex="0"><table/,
    );
  });

  it("keeps an escaped pipe inside inline code in one cell", async () => {
    const html = await render(
      ["| Type | Note |", "| - | - |", "| `a \\| b` | union |"].join("\n"),
    );
    expect(html).toContain("<td><code>a | b</code></td>");
    expect(html.match(/<td/g)).toHaveLength(2);
  });

  it("splits the cell at an unescaped pipe inside inline code", async () => {
    const html = await render(
      ["| Type | Note |", "| - | - |", "| `a | b` | union |"].join("\n"),
    );
    expect(html).not.toContain("<code>");
    expect(html).toContain("<td>`a</td><td>b`</td>");
  });

  it.each([
    ["raw HTML in a cell", "| A |\n| - |\n| <b>x</b> |"],
    ["line break tag in a cell", "| A |\n| - |\n| x<br>y |"],
    ["script tag in a cell", "| A |\n| - |\n| <script>alert(1)</script> |"],
    ["unregistered component in a cell", "| A |\n| - |\n| <Banner /> |"],
    ["expression in a cell", "| A |\n| - |\n| {1 + 1} |"],
    ["expression in a header cell", "| {x} |\n| - |\n| a |"],
    ["raw table tag", "<table><tr><td>x</td></tr></table>"],
  ])("rejects %s", async (_name, source) => {
    await expect(compileMdx(source)).rejects.toThrow();
  });
});

describe("other GFM syntax", () => {
  it("links a bare URL", async () => {
    const html = await render("See https://example.com/a for more.");
    expect(html).toContain(
      '<a href="https://example.com/a">https://example.com/a</a>',
    );
  });

  it("renders double-tilde strikethrough as del", async () => {
    expect(await render("~~old~~ new")).toContain("<del>old</del>");
  });

  it("leaves single tildes literal", async () => {
    const html = await render("From ~7,800 to ~500.");
    expect(html).toContain("From ~7,800 to ~500.");
    expect(html).not.toContain("<del>");
  });

  it.each([
    ["footnote", "Text.[^1]\n\n[^1]: The note."],
    ["task list", "- [ ] todo\n- [x] done"],
  ])("rejects a %s", async (_name, source) => {
    await expect(compileMdx(source)).rejects.toThrow(/not allowed in content/);
  });

  it("renders an ordinary list", async () => {
    expect(await render("- one\n- two")).toContain("<li>one</li>");
  });
});

describe("Figure", () => {
  const frame = (html: string) => html.match(/aspect-ratio:([^;"]+)/)?.[1];

  it.each([
    ["no dimensions", "", "1600 / 900", "1600", "900"],
    [
      "string dimensions",
      ' width="800" height="400"',
      "800 / 400",
      "800",
      "400",
    ],
    [
      "invalid dimensions",
      ' width="wide" height="-2"',
      "1600 / 900",
      "1600",
      "900",
    ],
  ])(
    "renders next/image with a reserved box for %s",
    async (_n, attrs, ratio, w, h) => {
      const html = await render(`<Figure src="/a.png" alt="A"${attrs} />`);
      expect(frame(html)).toBe(ratio);
      expect(html).toContain(`width="${w}"`);
      expect(html).toContain(`height="${h}"`);
      expect(html).toContain('alt="A"');
    },
  );
});
