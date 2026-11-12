import type { Release } from "../../../content/types";
import { ReleaseItem } from "./ReleaseItem";
import styles from "./Releases.module.css";

/** Releases in the order given (the content layer sorts newest year first). */
export function ReleaseList({ releases }: { releases: readonly Release[] }) {
  if (releases.length === 0) {
    return <p>No releases yet.</p>;
  }
  return (
    <ul className={styles.list}>
      {releases.map((release) => (
        <li key={release.slug}>
          <ReleaseItem release={release} />
        </li>
      ))}
    </ul>
  );
}
