import type { Release } from "../../../content/types";
import { EmbedFacade } from "../../embed-facade/EmbedFacade";
import { resolveEmbed } from "../../embed-facade/hosts";
import { MdxBody } from "../../mdx/MdxBody";
import { Tag } from "../../primitives/Tag";
import styles from "./Releases.module.css";

/** One release: heading, year and host badge, the embed facade, then notes. */
export function ReleaseItem({ release }: { release: Release }) {
  const { label, src } = resolveEmbed(release.host, release.embedUrl);
  return (
    <article className={styles.release}>
      <header className={styles.header}>
        <h2 className={styles.title}>{release.title}</h2>
        <p className={styles.meta}>
          <time dateTime={String(release.year)}>{release.year}</time>
          <Tag>{label}</Tag>
        </p>
      </header>
      <EmbedFacade
        title={release.title}
        hostLabel={label}
        src={src}
        aspect={release.aspect}
      />
      {release.notes ? <MdxBody body={release.notes} /> : null}
    </article>
  );
}
