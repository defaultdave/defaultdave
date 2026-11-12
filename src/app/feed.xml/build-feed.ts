import type { Post, PostCollection } from "../../content/types";
import { SITE_URL } from "../../lib/metadata";
import { sortPostsNewestFirst } from "../../lib/sort";

export type FeedPost = Post & { collection: PostCollection };

const FEED = {
  title: "David Fleming",
  description:
    "Articles and musings by David Fleming. Articles first published elsewhere link to the original.",
  path: "/feed.xml",
} as const;

// XML 1.0 forbids most control characters, even escaped.
const ILLEGAL_XML_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g;

/** Escape text for an XML text node or attribute value. */
export function escapeXml(text: string): string {
  return text
    .replace(ILLEGAL_XML_CHARS, "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** RFC 822 date, as RSS 2.0 requires. Throws on an unparseable date. */
export function toRfc822(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid publishedAt date: ${isoDate}`);
  }
  return date.toUTCString();
}

/** The post's page on this site. */
function postUrl(post: Pick<FeedPost, "collection" | "slug">): string {
  return `${SITE_URL}/${post.collection}/${post.slug}`;
}

function buildItem(post: FeedPost): string {
  const permalink = postUrl(post);
  return [
    "    <item>",
    `      <title>${escapeXml(post.title)}</title>`,
    `      <link>${escapeXml(post.canonical?.url ?? permalink)}</link>`,
    `      <guid isPermaLink="true">${escapeXml(permalink)}</guid>`,
    `      <pubDate>${toRfc822(post.publishedAt)}</pubDate>`,
    `      <description>${escapeXml(post.summary)}</description>`,
    "    </item>",
  ].join("\n");
}

/** RSS 2.0 document for the given posts, newest first. */
export function buildFeed(posts: readonly FeedPost[]): string {
  const sorted = sortPostsNewestFirst(posts);
  const newest = sorted[0];
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(FEED.title)}</title>`,
    `    <link>${SITE_URL}/</link>`,
    `    <description>${escapeXml(FEED.description)}</description>`,
    "    <language>en-us</language>",
    ...(newest
      ? [`    <lastBuildDate>${toRfc822(newest.publishedAt)}</lastBuildDate>`]
      : []),
    `    <atom:link href="${SITE_URL}${FEED.path}" rel="self" type="application/rss+xml"/>`,
    ...sorted.map(buildItem),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
