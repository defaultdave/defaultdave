export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/articles", label: "Articles" },
  { href: "/musings", label: "Musings" },
  { href: "/music", label: "Music" },
  { href: "/about", label: "About" },
] as const;

/**
 * True when `pathname` is the item's section: the home item matches only "/",
 * every other item matches its own path and anything below it ("/work/slug").
 */
export function isCurrent(pathname: string | null, href: string): boolean {
  if (pathname === null) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
