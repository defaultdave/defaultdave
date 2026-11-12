import { listPosts } from "../../content";
import type { PostCollection } from "../../content/types";
import { buildFeed, type FeedPost } from "./build-feed";

export const dynamic = "force-static";

const COLLECTIONS: PostCollection[] = ["articles", "musings"];

export async function GET() {
  const lists = await Promise.all(
    COLLECTIONS.map(async (collection): Promise<FeedPost[]> => {
      const posts = await listPosts(collection);
      return posts.map((post) => ({ ...post, collection }));
    }),
  );
  return new Response(buildFeed(lists.flat()), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
