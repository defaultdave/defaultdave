import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Prose } from "./Prose";

describe("Prose", () => {
  it("wraps its children without changing them", () => {
    const html = renderToStaticMarkup(
      <Prose>
        <h2>Heading</h2>
        <p>Body</p>
      </Prose>,
    );
    expect(html).toMatch(
      /^<div class="[^"]+"><h2>Heading<\/h2><p>Body<\/p><\/div>$/,
    );
  });
});
