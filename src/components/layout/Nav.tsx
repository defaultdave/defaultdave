import Link from "next/link";

import styles from "./Nav.module.css";
import { isCurrent, NAV_ITEMS } from "./nav-items";

/** The primary navigation. Pure: pass the current pathname, or null for none. */
export function Nav({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Primary">
      <ul className={styles.list}>
        {NAV_ITEMS.map(({ href, label }) => (
          <li key={href}>
            {/* A UrlObject skips typedRoutes, which only knows routes that exist so far. */}
            <Link
              href={{ pathname: href }}
              className={styles.link}
              aria-current={isCurrent(pathname, href) ? "page" : undefined}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
