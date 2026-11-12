import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EmbedFacade } from "./EmbedFacade";
import { HOSTS, frameOrigins, resolveEmbed } from "./hosts";

describe("frameOrigins", () => {
  it.each(Object.entries(HOSTS))(
    "allows %s's domains and their subdomains",
    (_host, { domains }) => {
      const origins = frameOrigins();
      for (const d of domains) {
        expect(origins).toContain(`https://${d}`);
        expect(origins).toContain(`https://*.${d}`);
      }
    },
  );
});

describe("resolveEmbed", () => {
  it.each([
    ["bandcamp", "https://example.bandcamp.com/album/x", "Bandcamp"],
    ["soundcloud", "https://w.soundcloud.com/player/?url=x", "SoundCloud"],
    ["spotify", "https://open.spotify.com/embed/album/x", "Spotify"],
    ["youtube", "https://www.youtube-nocookie.com/embed/x", "YouTube"],
  ])("accepts %s on its own domain", (host, url, label) => {
    expect(resolveEmbed(host, url)).toEqual({ label, src: url });
  });

  it.each([
    ["an unknown host", "vimeo", "https://vimeo.com/1"],
    ["an inherited property name", "toString", "https://bandcamp.com/x"],
    ["a URL that is not a URL", "bandcamp", "not a url"],
    ["http instead of https", "bandcamp", "http://x.bandcamp.com/a"],
    [
      "a URL on another host's domain",
      "spotify",
      "https://youtube.com/embed/x",
    ],
    ["a lookalike domain", "bandcamp", "https://evilbandcamp.com/a"],
  ])("throws for %s", (_case, host, url) => {
    expect(() => resolveEmbed(host, url)).toThrow();
  });
});

describe("EmbedFacade", () => {
  const props = {
    title: "Night Drive",
    hostLabel: "Bandcamp",
    src: "https://example.bandcamp.com/album/night-drive",
  };

  it("renders a labelled button and no iframe or host URL before a click", () => {
    const html = renderToStaticMarkup(<EmbedFacade {...props} aspect="1:1" />);
    expect(html).toContain("<button");
    expect(html).toContain('type="button"');
    expect(html).toMatch(/Play (<!-- -->)?Night Drive/);
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("bandcamp.com");
  });

  it.each(["16:9", "1:1", "auto"] as const)(
    "sizes the box from aspect %s",
    (aspect) => {
      const html = renderToStaticMarkup(
        <EmbedFacade {...props} aspect={aspect} />,
      );
      expect(html).toContain(`data-aspect="${aspect}"`);
    },
  );
});
