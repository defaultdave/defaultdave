import Image from "next/image";
import Link from "next/link";

import type { WorkEntry } from "../../../content/types";
import { formatPeriod } from "../../../lib/format-period";
import { Metric } from "../../mdx/Metric";
import { MdxBody } from "../../mdx/MdxBody";
import { LinkButton } from "../../primitives/LinkButton";
import { Tag, popTone } from "../../primitives/Tag";
import styles from "./CaseStudy.module.css";

const COVER = { width: 1200, height: 630 } as const;

/** The case-study page: back link, title block, cover, headline metrics, body, links. */
export function CaseStudy({ entry }: { entry: WorkEntry }) {
  const Body = entry.body;
  return (
    <article className={styles.study}>
      <Link href="/work" className={styles.back}>
        Back to Work
      </Link>
      <header className={styles.header}>
        <h1 className={styles.title}>{entry.title}</h1>
        <p className={styles.meta}>
          {entry.role}, {formatPeriod(entry.period)}
        </p>
        <p>{entry.summary}</p>
        {entry.stack.length > 0 ? (
          <ul className={styles.tags} aria-label="Stack">
            {entry.stack.map((tag, i) => (
              <li key={tag}>
                <Tag tone={popTone(i)}>{tag}</Tag>
              </li>
            ))}
          </ul>
        ) : null}
      </header>
      {entry.cover ? (
        <Image
          className={styles.cover}
          src={entry.cover.src}
          alt={entry.cover.alt}
          width={COVER.width}
          height={COVER.height}
          sizes="(min-width: 48rem) 48rem, 100vw"
          priority
        />
      ) : null}
      {entry.metrics?.length ? (
        <div className={styles.metrics}>
          {entry.metrics.map((m) => (
            <Metric
              key={m.label}
              label={m.label}
              value={m.value}
              {...(m.note ? { note: m.note } : {})}
            />
          ))}
        </div>
      ) : null}
      {Body ? <MdxBody body={Body} /> : null}
      {entry.links.length > 0 ? (
        <section aria-labelledby="case-study-links">
          <h2 id="case-study-links" className={styles.linksHeading}>
            Links
          </h2>
          <ul className={styles.links}>
            {entry.links.map((link) => (
              <li key={link.href}>
                <LinkButton href={link.href} variant="secondary">
                  {link.label}
                </LinkButton>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
