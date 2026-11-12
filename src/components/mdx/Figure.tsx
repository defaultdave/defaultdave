import Image from "next/image";

import styles from "./Figure.module.css";

/**
 * Box used when an entry gives no dimensions. The content schema has no width
 * or height field yet, so every Figure reserves a 16:9 box; the image sits
 * inside it with object-fit contain, so nothing shifts when it loads.
 */
const DEFAULT_WIDTH = 1600;
const DEFAULT_HEIGHT = 900;

/** MDX attributes are plain strings, so accept both and fall back on bad input. */
function dimension(value: number | string | undefined, fallback: number) {
  const n = typeof value === "string" ? Number(value) : value;
  return n !== undefined && Number.isInteger(n) && n > 0 ? n : fallback;
}

/**
 * An image with alt text and an optional caption. Renders next/image with
 * explicit width and height; the wrapper's aspect-ratio reserves the box.
 */
export function Figure({
  src,
  alt,
  caption,
  width,
  height,
}: {
  src: string;
  alt: string;
  caption?: string;
  width?: number | string;
  height?: number | string;
}) {
  const w = dimension(width, DEFAULT_WIDTH);
  const h = dimension(height, DEFAULT_HEIGHT);
  return (
    <figure className={styles.figure}>
      <div
        className={styles.frame}
        style={{ aspectRatio: `${String(w)} / ${String(h)}` }}
      >
        <Image
          className={styles.image}
          src={src}
          alt={alt}
          width={w}
          height={h}
          sizes="(min-width: 48rem) 42rem, 100vw"
        />
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
