import type { ReactNode } from "react";

import styles from "./Prose.module.css";

/** Long-form content at a readable measure, with spacing for rendered Markdown or MDX. */
export function Prose({ children }: { children: ReactNode }) {
  return <div className={styles.prose}>{children}</div>;
}
