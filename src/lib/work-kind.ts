type OfKind<T, K extends string> =
  Extract<T, { kind: K }> extends never
    ? T & { kind: K }
    : Extract<T, { kind: K }>;

/** Case studies, in the order they arrive. Only these have a page of their own. */
export function caseStudies<T extends { kind: string }>(
  entries: readonly T[],
): OfKind<T, "case-study">[] {
  return entries.filter(
    (e): e is OfKind<T, "case-study"> & T => e.kind === "case-study",
  );
}

/** Cards, in the order they arrive. */
export function cards<T extends { kind: string }>(
  entries: readonly T[],
): OfKind<T, "card">[] {
  return entries.filter((e): e is OfKind<T, "card"> & T => e.kind === "card");
}
