import styles from "./Metric.module.css";

/** One headline number with its label and an optional note. */
export function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <dl className={styles.metric}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{value}</dd>
      {note ? <dd className={styles.note}>{note}</dd> : null}
    </dl>
  );
}
