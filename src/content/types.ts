import type { MDXContent } from "mdx/types";

export type { MDXContent };

export type Link = { label: string; href: string };
export type Metric = { label: string; value: string; note?: string };
export type Image = { src: string; alt: string };

export type WorkEntry = {
  slug: string;
  title: string;
  summary: string;
  role: string;
  /** ISO months, like 2026-03. */
  period: { from: string; to?: string };
  stack: string[];
  links: Link[];
  featured: boolean;
  order: number;
  cover?: Image;
  metrics?: Metric[];
  /** Present only for case studies. */
  body?: MDXContent;
  kind: "case-study" | "card";
};

export type Post = {
  slug: string;
  title: string;
  summary: string;
  /** ISO dates. */
  publishedAt: string;
  updatedAt?: string;
  /** Set when first published elsewhere. */
  canonical?: { url: string; host: string };
  body: MDXContent;
};

export type PostCollection = "articles" | "musings";

export type Release = {
  slug: string;
  title: string;
  year: number;
  host: "bandcamp" | "soundcloud" | "spotify" | "youtube";
  embedUrl: string;
  aspect: "16:9" | "1:1" | "auto";
  notes?: MDXContent;
};

export type Home = {
  headline: string;
  intro: MDXContent;
  /** Work slugs. */
  featuredWork: string[];
};

export type About = {
  bio: MDXContent;
  headshot?: Image;
  links: Link[];
};
