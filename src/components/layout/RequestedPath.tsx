"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const clientPath = () => window.location.pathname;
// The prerendered 404 does not know which URL was asked for.
const serverPath = () => null;

/**
 * The path the visitor asked for, as "davidfleming.me/path", set in bold.
 * Renders nothing on the server and until hydration, and nothing when the path
 * is unknown, so the page never shows a path it invented.
 */
export function RequestedPath() {
  const path = useSyncExternalStore(subscribe, clientPath, serverPath);
  if (path === null || path === "" || path === "/_not-found") return null;
  return (
    <p>
      Nothing lives at <strong>davidfleming.me{path}</strong>.
    </p>
  );
}
