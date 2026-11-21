import Link from "next/link";

import styles from "./Wordmark.module.css";

const NAME = "DefaultDave";

/** "DefaultDave" in the text colour, then a blinking cursor. Typography, not a logo. */
export function Wordmark() {
  return (
    <Link href="/" className={styles.wordmark} aria-label={`${NAME}, home`}>
      {NAME}
      <span className={styles.caret} aria-hidden="true" />
    </Link>
  );
}
