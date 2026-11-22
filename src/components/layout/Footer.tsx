import Link from "next/link";

import styles from "./Footer.module.css";
import { CONTACT_LINKS } from "./contact-links";

/** The contentinfo landmark: contact links, then the "settings left at default" line. */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.contact}>
        <p className={styles.lead}>Get in touch:</p>
        <nav aria-label="Contact">
          <ul className={styles.list}>
            {CONTACT_LINKS.map(({ href, label }) => (
              <li key={href}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className={styles.defaults}>
        All settings left at default.
        {/* Hidden everywhere by globals.css; /music reveals it. */}
        <span data-room-only="bar"> Except this room.</span>{" "}
        <Link href="/">Restore defaults</Link>
      </p>
    </footer>
  );
}
