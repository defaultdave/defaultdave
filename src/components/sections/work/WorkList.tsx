import type { WorkEntry as WorkEntryData } from "../../../content/types";
import { Stack } from "../../primitives/Stack";
import styles from "./WorkList.module.css";
import { WorkEntry } from "./WorkEntry";

function Group({
  id,
  heading,
  entries,
}: {
  id: string;
  heading: string;
  entries: readonly WorkEntryData[];
}) {
  if (entries.length === 0) return null;
  return (
    <section className={styles.group} aria-labelledby={id}>
      <h2 id={id} className={styles.heading}>
        {heading}
      </h2>
      <Stack as="ul" gap={5}>
        {entries.map((entry) => (
          <li key={entry.slug} className={styles.item}>
            <WorkEntry entry={entry} />
          </li>
        ))}
      </Stack>
    </section>
  );
}

/** The Work list: case studies first, then cards. Each group keeps the order it arrives in. */
export function WorkList({ entries }: { entries: readonly WorkEntryData[] }) {
  return (
    <div className={styles.list}>
      <Group
        id="work-case-studies"
        heading="Case studies"
        entries={entries.filter((e) => e.kind === "case-study")}
      />
      <Group
        id="work-other-projects"
        heading="Other projects"
        entries={entries.filter((e) => e.kind === "card")}
      />
    </div>
  );
}
