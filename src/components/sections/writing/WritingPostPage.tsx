import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPost, listPosts } from "../../../content";
import type { PostCollection } from "../../../content/types";
import { formatReadingTime } from "../../../lib/reading-time";
import { PostPage } from "./PostPage";
import { WRITING } from "./collections";
import { readPostSource } from "./post-source";

/** Slugs to prerender for a collection. */
export async function postParams(collection: PostCollection) {
  const posts = await listPosts(collection);
  return posts.map(({ slug }) => ({ slug }));
}

/** Page title, description and, for a post first published elsewhere, the canonical link. */
export async function postMetadata(
  collection: PostCollection,
  slug: string,
): Promise<Metadata> {
  const post = await getPost(collection, slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    ...(post.canonical
      ? { alternates: { canonical: post.canonical.url } }
      : {}),
  };
}

/** The route body for /articles/[slug] and /musings/[slug]. */
export async function WritingPostPage({
  collection,
  slug,
}: {
  collection: PostCollection;
  slug: string;
}) {
  const post = await getPost(collection, slug);
  if (!post) notFound();
  const readingTime = post.canonical
    ? undefined
    : formatReadingTime(await readPostSource(collection, slug));
  return (
    <PostPage
      post={post}
      backPath={WRITING[collection].path}
      backLabel={WRITING[collection].title}
      {...(readingTime ? { readingTime } : {})}
    />
  );
}
