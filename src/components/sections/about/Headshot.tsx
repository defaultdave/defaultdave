import Image from "next/image";

import type { Image as ImageContent } from "../../../content/types";
import styles from "./Headshot.module.css";

/** A square portrait. Nothing renders without an image, so the page keeps no empty column. */
export function Headshot({ image }: { image: ImageContent | undefined }) {
  if (!image) return null;
  return (
    <div className={styles.frame}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority
        sizes="(min-width: 48rem) 14rem, 10rem"
        className={styles.image}
      />
    </div>
  );
}
