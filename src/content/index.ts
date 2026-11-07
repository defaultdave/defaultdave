import { createReader } from "@keystatic/core/reader";

import config from "../../keystatic.config";
import {
  sortPostsNewestFirst,
  sortReleasesNewestFirst,
  sortWork,
} from "../lib/sort";
import { compileMdx } from "./mdx";
import type {
  About,
  Home,
  Image,
  Link,
  MDXContent,
  Metric,
  Post,
  PostCollection,
  Release,
  WorkEntry,
} from "./types";

export type * from "./types";

type Body = () => Promise<string>;

/** Repo-relative path of the file a collection entry or singleton lives in. */
function entryFile(
  pathPattern: string | undefined,
  slug: string | null,
  ext = "mdx",
) {
  if (pathPattern === undefined) throw new Error("collection has no path");
  const dir = slug === null ? pathPattern : pathPattern.replace("*", slug);
  return `${dir.replace(/\/$/, "")}/index.${ext}`;
}

/** Run a read, naming the offending file in the error when it fails. */
async function withFile<T>(file: string, read: () => Promise<T>): Promise<T> {
  try {
    return await read();
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    throw new Error(`Invalid content in ${file}: ${reason}`, { cause });
  }
}

async function compileBody(body: Body): Promise<MDXContent> {
  return compileMdx(await body());
}

async function compileOptionalBody(
  body: Body,
): Promise<MDXContent | undefined> {
  const source = await body();
  return source.trim() === "" ? undefined : compileMdx(source);
}

function toImage(image: {
  src: string | null;
  alt: string;
}): Image | undefined {
  if (!image.src) return undefined;
  if (!image.alt.trim()) throw new Error(`image ${image.src} needs alt text`);
  return { src: image.src, alt: image.alt };
}

function toLinks(links: readonly Link[]): Link[] {
  return links.map(({ label, href }) => ({ label, href }));
}

function toMetrics(
  metrics: readonly { label: string; value: string; note: string }[],
): Metric[] | undefined {
  if (metrics.length === 0) return undefined;
  return metrics.map(({ label, value, note }) => ({
    label,
    value,
    ...(note ? { note } : {}),
  }));
}

/**
 * The content layer (seam 2). The only module that imports Keystatic's reader.
 * `root` is the directory that holds `content/`; tests point it at a fixture tree.
 */
export function createContent(root: string = process.cwd()) {
  const reader = createReader(root, config);
  const at = (file: string) => `${root}/${file}`;

  async function readWork(slug: string): Promise<WorkEntry | null> {
    const file = at(entryFile(config.collections.work.path, slug));
    return withFile(file, async () => {
      const e = await reader.collections.work.read(slug);
      if (!e) return null;
      return {
        slug,
        title: e.title,
        summary: e.summary,
        role: e.role,
        period: {
          from: e.period.from,
          ...(e.period.to ? { to: e.period.to } : {}),
        },
        stack: [...e.stack],
        links: toLinks(e.links),
        featured: e.featured,
        order: e.order,
        ...optional("cover", toImage(e.cover)),
        ...optional("metrics", toMetrics(e.metrics)),
        ...(e.kind === "case-study" ? { body: await compileBody(e.body) } : {}),
        kind: e.kind,
      };
    });
  }

  async function readPost(
    collection: PostCollection,
    slug: string,
  ): Promise<Post | null> {
    const file = at(entryFile(config.collections[collection].path, slug));
    return withFile(file, async () => {
      const e = await reader.collections[collection].read(slug);
      if (!e) return null;
      return {
        slug,
        title: e.title,
        summary: e.summary,
        publishedAt: e.publishedAt,
        ...(e.updatedAt ? { updatedAt: e.updatedAt } : {}),
        ...(e.canonicalUrl
          ? {
              canonical: {
                url: e.canonicalUrl,
                host: new URL(e.canonicalUrl).hostname,
              },
            }
          : {}),
        body: await compileBody(e.body),
      };
    });
  }

  async function readRelease(slug: string): Promise<Release | null> {
    const file = at(entryFile(config.collections.music.path, slug));
    return withFile(file, async () => {
      const e = await reader.collections.music.read(slug);
      if (!e) return null;
      return {
        slug,
        title: e.title,
        year: e.year,
        host: e.host,
        embedUrl: e.embedUrl,
        aspect: e.aspect,
        ...optional("notes", await compileOptionalBody(e.notes)),
      };
    });
  }

  return {
    getHome: async (): Promise<Home> => {
      const file = at(entryFile(config.singletons.home.path, null));
      return withFile(file, async () => {
        const e = await reader.singletons.home.readOrThrow();
        return {
          headline: e.headline,
          intro: await compileBody(e.intro),
          featuredWork: e.featuredWork.filter((s): s is string => s !== null),
        };
      });
    },

    getAbout: async (): Promise<About> => {
      const file = at(entryFile(config.singletons.about.path, null));
      return withFile(file, async () => {
        const e = await reader.singletons.about.readOrThrow();
        return {
          bio: await compileBody(e.bio),
          ...optional("headshot", toImage(e.headshot)),
          links: toLinks(e.links),
        };
      });
    },

    /** Featured first, then `order`. */
    listWork: async (): Promise<WorkEntry[]> => {
      const slugs = await reader.collections.work.list();
      const entries = await Promise.all(slugs.map(readWork));
      return sortWork(entries.filter((e) => e !== null));
    },

    getWork: readWork,

    /** Newest first. */
    listPosts: async (collection: PostCollection): Promise<Post[]> => {
      const slugs = await reader.collections[collection].list();
      const posts = await Promise.all(
        slugs.map((s) => readPost(collection, s)),
      );
      return sortPostsNewestFirst(posts.filter((p) => p !== null));
    },

    getPost: readPost,

    /** Newest year first. */
    listReleases: async (): Promise<Release[]> => {
      const slugs = await reader.collections.music.list();
      const releases = await Promise.all(slugs.map(readRelease));
      return sortReleasesNewestFirst(releases.filter((r) => r !== null));
    },
  };
}

/** Spread helper for `exactOptionalPropertyTypes`: omit the key when undefined. */
function optional<K extends string, V>(
  key: K,
  value: V | undefined,
): { [P in K]?: V } {
  return value === undefined ? {} : ({ [key]: value } as { [P in K]?: V });
}

const content = createContent();

export const getHome = content.getHome;
export const getAbout = content.getAbout;
export const listWork = content.listWork;
export const getWork = content.getWork;
export const listPosts = content.listPosts;
export const getPost = content.getPost;
export const listReleases = content.listReleases;
