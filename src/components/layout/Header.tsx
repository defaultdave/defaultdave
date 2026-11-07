import type { ReactNode } from "react";

import styles from "./Header.module.css";
import { Wordmark } from "./Wordmark";

/** The banner: wordmark on the left, navigation (passed as children) on the right. */
export function Header({ children }: { children: ReactNode }) {
  return (
    <header className={styles.header}>
      <Wordmark />
      {children}
    </header>
  );
}
