"use client";

import { usePathname } from "next/navigation";

import { Nav } from "./Nav";

/**
 * The only client component in the shell. The root layout cannot see the
 * request path, so this reads it and hands it to the pure Nav.
 */
export function SiteNav() {
  return <Nav pathname={usePathname()} />;
}
