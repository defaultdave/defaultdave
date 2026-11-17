import Link from "next/link";

import type { Post } from "../../../content/types";
import { formatDate } from "../../../lib/format-date";
import { MdxBody } from "../../mdx/MdxBody";
import { LinkButton } from "../../primitives/LinkButton";
import styles from "./PostPage.module.css";

type PostPageProps = {
  post: Post;
  /** Where the back link goes, such as "/articles". */
  backPath: string;
  backLabel: string;
  /** Omitted for a post with no body here. */
  readingTime?: string;
};

/**
 * The post template shared by /articles/[slug] and /musings/[slug]. A post
 * with a body shows it, under a line naming the original when it was first
 * published elsewhere. A post without a body shows its summary and a link out.
 */
export function PostPage({
  post,
  backPath,
  backLabel,
  readingTime,
}: PostPageProps) {
  const { canonical } = post;
  return (
    <article className={styles.post}>
      <Link href={{ pathname: backPath }} className={styles.back}>
        <span aria-hidden="true">{"←"} </span>
        {backLabel}
      </Link>
      <header className={styles.header}>
        <h1 className={styles.title}>{post.title}</h1>
        <p className={styles.meta}>
          <time dateTime={post.publishedAt}>
            {formatDate(post.publishedAt)}
          </time>
          {post.updatedAt ? (
            <>
              {" · Updated "}
              <time dateTime={post.updatedAt}>
                {formatDate(post.updatedAt)}
              </time>
            </>
          ) : null}
          {readingTime ? ` · ${readingTime}` : null}
        </p>
        {canonical && post.body ? (
          <p className={styles.origin}>
            First published on <a href={canonical.url}>{canonical.host}</a>
          </p>
        ) : null}
      </header>
      {post.body ? (
        <MdxBody body={post.body} />
      ) : (
        <div className={styles.elsewhere}>
          <p className={styles.summary}>{post.summary}</p>
          {canonical ? (
            <div>
              <LinkButton href={canonical.url}>
                Read on {canonical.host}
              </LinkButton>
            </div>
          ) : null}
        </div>
      )}
    </article>
  );
}
