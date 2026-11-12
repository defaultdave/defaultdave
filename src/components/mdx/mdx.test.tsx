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
