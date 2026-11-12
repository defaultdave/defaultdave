import type { ReactNode } from "react";

import styles from "./Tag.module.css";

const POPS = ["pop-1", "pop-2", "pop-3", "pop-4"] as const;

type TagProps = {
  children: ReactNode;
  /** `neutral` is an outline on the surface; a pop fills with that colour and ink text. */
  tone?: "neutral" | (typeof POPS)[number];
};

/**
 * The pop tone for the tag at `index` in a list, cycling through the four pops
 * the way the design's work cards do.
 * @param index - The tag's position in its list, from 0.
 * @returns `pop-1` to `pop-4`.
 */
export function popTone(index: number): (typeof POPS)[number] {
  return POPS[index % POPS.length] ?? POPS[0];
}

/** A small pill label, for stack names and categories. */
export function Tag({ children, tone = "neutral" }: TagProps) {
  return (
    <span className={styles.tag} data-tone={tone}>
      {children}
    </span>
  );
}
