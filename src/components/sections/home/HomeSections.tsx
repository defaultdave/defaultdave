import type { MDXContent, WorkEntry } from "../../../content/types";
import { MdxBody } from "../../mdx/MdxBody";
import { Card } from "../../primitives/Card";
import { Stack } from "../../primitives/Stack";
import styles from "./HomeSections.module.css";
import { SECTION_CARDS } from "./section-cards";

type HomeSectionsProps = {
  headline: string;
  intro: MDXContent;
  /** Featured work entries, already resolved from slugs and in display order. */
  featuredWork: readonly WorkEntry[];
};

/** The home page body: headline and intro, an optional featured block, one card per section. */
export function HomeSections({
  headline,
  intro,
  featuredWork,
}: HomeSectionsProps) {
  return (
    <Stack gap={9}>
      <Stack gap={5} as="section">
        <h1 className={styles.headline}>{headline}</h1>
        <MdxBody body={intro} />
      </Stack>
      {featuredWork.length > 0 ? (
        <section aria-labelledby="featured-work">
          <Stack gap={6}>
            <h2 id="featured-work">Featured work</h2>
            <div className={styles.grid}>
              {featuredWork.map((entry) => (
                <Card
                  key={entry.slug}
                  title={entry.title}
                  subtitle={entry.role}
                  description={entry.summary}
                  tags={entry.stack}
                  href={`/work/${entry.slug}`}
                  linkLabel="Read the case study"
                />
              ))}
            </div>
          </Stack>
        </section>
      ) : null}
      <section aria-labelledby="sections">
        <Stack gap={6}>
          <h2 id="sections">Explore</h2>
          <div className={styles.grid}>
            {SECTION_CARDS.map((card) => (
              <Card key={card.href} {...card} />
            ))}
          </div>
        </Stack>
      </section>
    </Stack>
  );
}
