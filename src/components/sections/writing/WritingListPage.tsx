import { listPosts } from "../../../content";
import type { PostCollection } from "../../../content/types";
import { formatDate } from "../../../lib/format-date";
import { formatReadingTime } from "../../../lib/reading-time";
import { PostList, type PostListItem } from "./PostList";
import styles from "./WritingListPage.module.css";
import { WRITING } from "./collections";
import { readPostSource } from "./post-source";

/** The body of /articles and /musings: heading plus the shared list. */
export async function WritingListPage({
  collection,
}: {
  collection: PostCollection;
}) {
  const posts = await listPosts(collection);
  const items: PostListItem[] = await Promise.all(
    posts.map(async (post) => ({
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      date: formatDate(post.publishedAt),
      isoDate: post.publishedAt,
      ...(post.canonical
        ? {}
        : {
            readingTime: formatReadingTime(
              await readPostSource(collection, post.slug),
            ),
          }),
    })),
  );
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{WRITING[collection].title}</h1>
      <PostList posts={items} basePath={WRITING[collection].path} />
    </div>
  );
}
