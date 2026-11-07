import Link from "next/link";

import styles from "./Wordmark.module.css";

const NAME = "David Fleming";
const COLOUR_COUNT = 5;

/** "David Fleming" set in type, one colour per letter. Typography, not a logo. */
export function Wordmark() {
  return (
    <Link href="/" className={styles.wordmark} aria-label={`${NAME}, home`}>
      {NAME.split("").map((char, index) => {
        if (char === " ") return " ";
        // Colour by position among the letters, so the space does not shift the cycle.
        const colour =
          NAME.slice(0, index).replaceAll(" ", "").length % COLOUR_COUNT;
        return (
          <span
            key={index}
            className={styles.letter}
            data-colour={colour}
            aria-hidden="true"
          >
            {char}
          </span>
        );
      })}
    </Link>
  );
}
