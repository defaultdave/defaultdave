/**
 * The line shown on the 404 page for the path the visitor asked for, as
 * "davidfleming.me/path". Returns null when the path is unknown (not yet read
 * on the client, empty, or the internal not-found route), so the page never
 * shows a path it invented.
 */
export function requestedPathLabel(path: string | null): string | null {
  if (path === null || path === "" || path === "/_not-found") return null;
  return `davidfleming.me${path}`;
}
