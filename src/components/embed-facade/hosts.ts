import type { Release } from "../../content/types";

type EmbedHost = Release["host"];

type HostInfo = {
  label: string;
  /** Domains a frame URL for this host may sit on (the domain and its subdomains). */
  domains: readonly string[];
};

/**
 * The only hosts an embed may come from. Mirrors the `host` options in
 * `keystatic.config.ts`; the CSP in `seo-perf` lists the same frame origins.
 */
const HOSTS: Record<EmbedHost, HostInfo> = {
  bandcamp: { label: "Bandcamp", domains: ["bandcamp.com"] },
  soundcloud: { label: "SoundCloud", domains: ["soundcloud.com"] },
  spotify: { label: "Spotify", domains: ["spotify.com"] },
  youtube: {
    label: "YouTube",
    domains: ["youtube.com", "youtube-nocookie.com"],
  },
};

function isKnownHost(host: string): host is EmbedHost {
  return Object.hasOwn(HOSTS, host);
}

/**
 * Resolve a release's host to its display label and a vetted frame URL. Throws
 * on an unknown host, a URL that is not https, or a URL off the host's domains,
 * so bad content fails the build instead of reaching a visitor.
 */
export function resolveEmbed(
  host: string,
  embedUrl: string,
): { label: string; src: string } {
  if (!isKnownHost(host)) {
    throw new Error(`Unknown embed host "${host}"`);
  }
  const { label, domains } = HOSTS[host];
  let url: URL;
  try {
    url = new URL(embedUrl);
  } catch {
    throw new Error(`Embed URL for ${label} is not a URL: "${embedUrl}"`);
  }
  const onHost = domains.some(
    (d) => url.hostname === d || url.hostname.endsWith(`.${d}`),
  );
  if (url.protocol !== "https:" || !onHost) {
    throw new Error(
      `Embed URL "${embedUrl}" must be https on ${domains.join(" or ")} for host ${host}`,
    );
  }
  return { label, src: url.href };
}
