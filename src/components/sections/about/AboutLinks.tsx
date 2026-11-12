import type { Link } from "../../../content/types";
import { linkTarget } from "../../../lib/link-target";
import styles from "./AboutLinks.module.css";

/** The "how to reach me" list. A new-tab link gets `rel="noopener"` and a hidden notice. */
export function AboutLinks({ links }: { links: readonly Link[] }) {
  if (links.length === 0) return null;
  return (
    <ul className={styles.list} aria-label="Links">
      {links.map(({ label, href }) => {
        const target = linkTarget(href);
        return (
          <li key={`${label}-${href}`}>
            <a
              href={href}
              className={styles.link}
              {...(target ? { target, rel: "noopener" } : {})}
            >
              {label}
              {target ? (
                <span className={styles.hidden}> (opens in new tab)</span>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
