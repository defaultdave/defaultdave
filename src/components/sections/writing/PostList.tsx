import { Card } from "../../primitives/Card";
import styles from "./PostList.module.css";

export type PostListItem = {
  slug: string;
  title: string;
  summary: string;
  /** Formatted date, such as "Jan 5, 2026". */
  date: string;
  /** Machine-readable form of `date`. */
  isoDate: string;
  /** Omitted when the post lives elsewhere and its body here is not the article. */
  readingTime?: string;
};

type PostListProps = {
  posts: readonly PostListItem[];
  /** Route of the collection, such as "/articles". */
  basePath: string;
};

/** The list shared by /articles and /musings. Posts arrive newest first. */
export function PostList({ posts, basePath }: PostListProps) {
  if (posts.length === 0) {
    return <p>Nothing here yet.</p>;
  }
  return (
    <div className={styles.grid}>
      {posts.map((post) => (
        <Card
          key={post.slug}
          title={post.title}
          subtitle={[post.date, post.readingTime].filter(Boolean).join(" · ")}
          description={post.summary}
          href={`${basePath}/${post.slug}`}
          linkLabel="Read"
          headingLevel={2}
        />
      ))}
    </div>
  );
}
