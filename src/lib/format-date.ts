const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

const formatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/**
 * Format an ISO date (`2026-01-05`) as "Jan 5, 2026". Read in UTC so the day
 * never shifts with the build machine's time zone. Throws on anything that is
 * not a real calendar date.
 */
export function formatDate(iso: string): string {
  const match = DATE_ONLY.exec(iso);
  if (!match) throw new Error(`Not an ISO date (YYYY-MM-DD): ${iso}`);
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    throw new Error(`Not a real calendar date: ${iso}`);
  }
  return formatter.format(date);
}
