import type { ComponentPropsWithoutRef } from "react";

import styles from "./Table.module.css";

/**
 * A Markdown table. The wrapper scrolls sideways when the table is wider than
 * the column, so the page never does; it is a named, focusable group so a
 * keyboard user can scroll it. A group, since a named region is a landmark and
 * every table would add one with the same name.
 */
export function Table(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div
      className={styles.scroll}
      role="group"
      aria-label="Table"
      // A scrollable container must be reachable by keyboard.
      tabIndex={0}
    >
      <table {...props} className={styles.table} />
    </div>
  );
}

/** A header cell. Markdown tables only have a header row, so every one heads a column. */
export function TableHeaderCell(props: ComponentPropsWithoutRef<"th">) {
  return <th scope="col" {...props} />;
}
