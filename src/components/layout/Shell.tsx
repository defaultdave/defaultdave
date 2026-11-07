import type { ReactNode } from "react";

import { Footer } from "./Footer";
import { Header } from "./Header";
import styles from "./Shell.module.css";
import { SiteNav } from "./SiteNav";
import { SkipLink } from "./SkipLink";

/** The page frame every route shares: skip link, header, main, footer. */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <SkipLink />
      <Header>
        <SiteNav />
      </Header>
      <main id="main" tabIndex={-1} className={styles.main}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
