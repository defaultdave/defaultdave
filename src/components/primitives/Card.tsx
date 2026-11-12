import { LinkButton } from "./LinkButton";
import styles from "./Card.module.css";
import { Tag, popTone } from "./Tag";

const HEADINGS = { 2: "h2", 3: "h3", 4: "h4" } as const;

type CardProps = {
  title: string;
  /** One line under the title, such as a period and role. Optional. */
  subtitle?: string;
  description: string;
  /** Tags on the row above the link. Omit for a section card. */
  tags?: readonly string[];
  href: string;
  linkLabel: string;
  /** The heading level of the title, so a card fits the page's outline. */
  headingLevel?: 2 | 3 | 4;
};

/**
 * A summary card. Content builds from the top (title, subtitle, description);
 * tags and the link sit on their own rows, which line up across cards when the
 * parent is a grid.
 */
export function Card({
  title,
  subtitle,
  description,
  tags,
  href,
  linkLabel,
  headingLevel = 3,
}: CardProps) {
  const Heading = HEADINGS[headingLevel];
  return (
    <article className={styles.card}>
      <div className={styles.content}>
        <Heading className={styles.title}>{title}</Heading>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.tags}>
        {tags?.length ? (
          <ul className={styles.tagList}>
            {tags.map((tag, i) => (
              <li key={tag}>
                <Tag tone={popTone(i)}>{tag}</Tag>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className={styles.link}>
        <LinkButton href={href} variant="secondary">
          {linkLabel}
        </LinkButton>
      </div>
    </article>
  );
}
