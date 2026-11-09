import styles from "./Figure.module.css";

/** An image with alt text and an optional caption. */
export function Figure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className={styles.figure}>
      {/* Plain img: intrinsic size is unknown at authoring time; seo-perf revisits sizing. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.image} src={src} alt={alt} loading="lazy" />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
