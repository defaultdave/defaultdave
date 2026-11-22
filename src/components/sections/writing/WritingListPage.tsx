import { listPosts } from "../../../content";
import type { PostCollection } from "../../../content/types";
import { formatDate } from "../../../lib/format-date";
import { formatReadingTime } from "../../../lib/reading-time";
import { PostList, type PostListItem } from "./PostList";
import styles from "./WritingListPage.module.css";
import { WRITING } from "./collections";
import { readPostSource } from "./post-source";

/** The Musings title: highlighter stripe, thought bubbles and a squiggle (all decorative). */
function MusingsHeading({ title }: { title: string }) {
  return (
    <div className={styles.musingsHead}>
      <h1 className={[styles.title, styles.musingsTitle].join(" ")}>{title}</h1>
      <span
        className={[styles.bubble, styles.bubble1].join(" ")}
        aria-hidden="true"
      />
      <span
        className={[styles.bubble, styles.bubble2].join(" ")}
        aria-hidden="true"
      />
      <span
        className={[styles.bubble, styles.bubble3].join(" ")}
        aria-hidden="true"
      />
      <svg
        className={styles.squiggle}
        width="240"
        height="16"
        viewBox="0 0 240 16"
        aria-hidden="true"
      >
        <path
          d="M2 9 C 22 1, 32 15, 52 8 S 82 1, 102 8 S 132 15, 152 8 S 182 1, 202 8 S 228 14, 238 6"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

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
      ...(post.body
        ? {
            readingTime: formatReadingTime(
              await readPostSource(collection, post.slug),
            ),
          }
        : {}),
    })),
  );
  return (
    <div className={styles.page}>
      {collection === "musings" ? (
        <MusingsHeading title={WRITING[collection].title} />
      ) : (
        <h1 className={styles.title}>{WRITING[collection].title}</h1>
      )}
      <PostList posts={items} basePath={WRITING[collection].path} />
    </div>
  );
}
