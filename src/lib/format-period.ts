const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** "2026-04" to "Apr 2026". Throws on anything that is not an ISO month. */
function formatMonth(iso: string): string {
  const [, year, month] = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(iso) ?? [];
  const name = MONTHS[Number(month) - 1];
  if (year === undefined || name === undefined) {
    throw new Error(`Not an ISO month (YYYY-MM): "${iso}"`);
  }
  return `${name} ${year}`;
}

/** "Apr 2026 to Aug 2026" for a closed period, "since Sep 2026" for an open one. */
export function formatPeriod(period: { from: string; to?: string }): string {
  const from = formatMonth(period.from);
  return period.to === undefined
    ? `since ${from}`
    : `${from} to ${formatMonth(period.to)}`;
}
