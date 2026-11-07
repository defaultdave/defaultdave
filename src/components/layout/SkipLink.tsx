import styles from "./SkipLink.module.css";

/** Must be the first focusable element on the page. Targets the main landmark. */
export function SkipLink() {
  return (
    <a href="#main" className={styles.skip}>
      Skip to content
    </a>
  );
}
