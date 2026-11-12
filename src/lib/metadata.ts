import type { Metadata } from "next";

export const SITE_URL = "https://davidfleming.me";
export const SITE_NAME = "David Fleming";

type OgSection = "home" | "work" | "articles" | "musings" | "music" | "about";

type SocialInput = {
  /** A plain title takes the layout's "%s | David Fleming" template; `absolute` skips it. */
  title: string | { absolute: string };
  description: string;
  /** Route path, like /work/aurora. Becomes the OpenGraph url. */
  path: string;
  /** Picks the static image in public/og/. */
  section: OgSection;
  type?: "website" | "article";
  /** ISO date, for articles. */
  publishedTime?: string;
};

const IMAGE = { width: 1200, height: 630 } as const;

/**
 * OpenGraph and Twitter tags. A page's `openGraph` replaces the layout's
 * wholesale, so site name, locale and type are repeated here.
 */
export function socialMetadata(
  input: SocialInput,
): Pick<Metadata, "openGraph" | "twitter"> {
  const imageUrl = `/og/${input.section}.png`;
  const alt = `${SITE_NAME}: ${input.section === "home" ? "personal site" : input.section}`;
  return {
    openGraph: {
      type: input.type ?? "website",
      siteName: SITE_NAME,
      locale: "en_US",
      title: input.title,
      description: input.description,
      url: input.path,
      images: [{ url: imageUrl, ...IMAGE, alt }],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [{ url: imageUrl, alt }],
    },
  };
}

/** Title, description, canonical and social tags for one page. */
export function pageMetadata(
  input: SocialInput & {
    /** Overrides the canonical link, for a post first published elsewhere. */
    canonical?: string;
  },
): Metadata {
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.canonical ?? input.path },
    ...socialMetadata(input),
  };
}
