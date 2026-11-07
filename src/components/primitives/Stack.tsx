import type { ReactNode } from "react";

import styles from "./Stack.module.css";

type Gap = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

type StackProps = {
  children: ReactNode;
  /** Step on the spacing scale (`--space-<gap>`). */
  gap?: Gap;
  as?: "div" | "section" | "ul" | "ol";
};

/** Vertical rhythm: lays children out in a column with one gap between them. */
export function Stack({ children, gap = 4, as: Element = "div" }: StackProps) {
  return (
    <Element className={styles.stack} data-gap={gap}>
      {children}
    </Element>
  );
}
