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
