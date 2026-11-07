import styles from "./Footer.module.css";
import { CONTACT_LINKS } from "./contact-links";

/** The contentinfo landmark, with the contact links. */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.lead}>Get in touch</p>
      <nav aria-label="Contact">
        <ul className={styles.list}>
          {CONTACT_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a href={href} className={styles.link}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
