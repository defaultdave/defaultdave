"use client";

import { preload } from "react-dom";

/**
 * Hints the display font into the document head of /music and nowhere else.
 *
 * It is a client component on purpose. Called from a server component,
 * preload() (and a plain preload <link>) becomes a hint in the page's RSC
 * payload, and <Link> prefetch from every other route runs that hint, so each
 * route would fetch the font. A client component's output is not part of the
 * payload: the server render of /music puts the hint in <head>, where the
 * preload scanner finds it first, and a client navigation to /music calls it
 * when the page renders. Nothing renders to the DOM.
 */
export function FontPreload({ href }: { href: string }) {
  preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return null;
}
