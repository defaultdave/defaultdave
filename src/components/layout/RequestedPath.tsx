"use client";

import { useSyncExternalStore } from "react";

import { requestedPathLabel } from "./requested-path";

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
  const label = requestedPathLabel(path);
  if (label === null) return null;
  return (
    <p>
      Nothing lives at <strong>{label}</strong>.
    </p>
  );
}
