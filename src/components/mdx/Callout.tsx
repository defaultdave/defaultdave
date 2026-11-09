import type { ReactNode } from "react";

import styles from "./Callout.module.css";

export type CalloutTone = "note" | "warning";

/** An aside inside a body: a note or a warning. */
export function Callout({
  tone = "note",
  children,
}: {
  tone?: CalloutTone;
  children?: ReactNode;
}) {
  return (
    <aside className={[styles.callout, styles[tone]].join(" ")}>
      {children}
    </aside>
  );
}
