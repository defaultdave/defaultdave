import type { Release } from "../../../content/types";
import { EmbedFacade } from "../../embed-facade/EmbedFacade";
import { resolveEmbed } from "../../embed-facade/hosts";
import { MdxBody } from "../../mdx/MdxBody";
import styles from "./Releases.module.css";

/** One release: year, title, the note, then the embed facade. */
export function ReleaseItem({ release }: { release: Release }) {
  const { label, src } = resolveEmbed(release.host, release.embedUrl);
  return (
    <article className={styles.release}>
      <p className={styles.year}>
        <time dateTime={String(release.year)}>{release.year}</time>
      </p>
      <div className={styles.body}>
        <h2 className={styles.title}>{release.title}</h2>
        {release.notes ? (
          <div className={styles.notes}>
            <MdxBody body={release.notes} />
          </div>
        ) : null}
        <EmbedFacade
          title={release.title}
          hostLabel={label}
          src={src}
          aspect={release.aspect}
        />
      </div>
    </article>
  );
}
