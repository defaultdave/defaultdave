import Image from "next/image";

import type { WorkEntry as WorkEntryData } from "../../../content/types";
import { formatPeriod } from "../../../lib/format-period";
import { LinkButton } from "../../primitives/LinkButton";
import { Tag } from "../../primitives/Tag";
import styles from "./WorkEntry.module.css";

/** Cover images are laid out at this ratio whatever their file size, so no shift. */
const COVER = { width: 1200, height: 630 } as const;

/** One entry on the Work list: a case study (with a cover and a link to its page) or a card. */
export function WorkEntry({ entry }: { entry: WorkEntryData }) {
  const isCaseStudy = entry.kind === "case-study";
  return (
    <article className={styles.entry}>
      {isCaseStudy && entry.cover ? (
        <Image
          className={styles.cover}
          src={entry.cover.src}
          alt={entry.cover.alt}
          width={COVER.width}
          height={COVER.height}
          sizes="(min-width: 48rem) 36rem, 100vw"
        />
      ) : null}
      <div className={styles.body}>
        <h3 className={styles.title}>{entry.title}</h3>
        <p className={styles.meta}>
          {entry.role}, {formatPeriod(entry.period)}
        </p>
        <p className={styles.summary}>{entry.summary}</p>
        {entry.stack.length > 0 ? (
          <ul className={styles.tags} aria-label="Stack">
            {entry.stack.map((tag) => (
              <li key={tag}>
                <Tag>{tag}</Tag>
              </li>
            ))}
          </ul>
        ) : null}
        <ul className={styles.links} aria-label={`Links for ${entry.title}`}>
          {isCaseStudy ? (
            <li>
              <LinkButton href={`/work/${entry.slug}`}>
                Read the case study
              </LinkButton>
            </li>
          ) : null}
          {entry.links.map((link) => (
            <li key={link.href}>
              <LinkButton href={link.href} variant="secondary">
                {link.label}
              </LinkButton>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
