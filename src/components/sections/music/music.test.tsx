import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Release } from "../../../content/types";
import { ReleaseList } from "./ReleaseList";

const release = (over: Partial<Release> = {}): Release => ({
  slug: "night-drive",
  title: "Night Drive",
  year: 2025,
  host: "bandcamp",
  embedUrl: "https://example.bandcamp.com/album/night-drive",
  aspect: "1:1",
  ...over,
});

describe("ReleaseList", () => {
  it("renders each release with title, year, host badge and a play button", () => {
    const html = renderToStaticMarkup(
      <ReleaseList
        releases={[
          release(),
          release({
            slug: "b",
            title: "Older",
            year: 2019,
            host: "spotify",
            embedUrl: "https://open.spotify.com/embed/album/b",
          }),
        ]}
      />,
    );
    expect(html).toContain(">Night Drive</h2>");
    expect(html).toContain("2025");
    expect(html).toContain(">Bandcamp</span>");
    expect(html).toContain(">Spotify</span>");
    expect(html.match(/<button/g)).toHaveLength(2);
    expect(html).not.toContain("<iframe");
  });

  it("keeps the order it is given, newest year first", () => {
    const html = renderToStaticMarkup(
      <ReleaseList
        releases={[
          release({ title: "New", year: 2025 }),
          release({ slug: "o", title: "Old", year: 2010 }),
        ]}
      />,
    );
    expect(html.indexOf(">New</h2>")).toBeLessThan(html.indexOf(">Old</h2>"));
  });

  it("fails the render for a release with an unknown host", () => {
    const bad = { ...release(), host: "vimeo" } as unknown as Release;
    expect(() =>
      renderToStaticMarkup(<ReleaseList releases={[bad]} />),
    ).toThrow(/Unknown embed host/);
  });

  it("says so when there are no releases", () => {
    expect(renderToStaticMarkup(<ReleaseList releases={[]} />)).toContain(
      "No releases yet.",
    );
  });
});
