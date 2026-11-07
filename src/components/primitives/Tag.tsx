import type { ReactNode } from "react";

import styles from "./Tag.module.css";

type TagProps = {
  children: ReactNode;
  /** `neutral` is an outline on the surface; a pop fills with that colour and ink text. */
  tone?: "neutral" | "pop-1" | "pop-2" | "pop-3" | "pop-4";
};

/** A small pill label, for stack names and categories. */
export function Tag({ children, tone = "neutral" }: TagProps) {
  return (
    <span className={styles.tag} data-tone={tone}>
      {children}
    </span>
  );
}
