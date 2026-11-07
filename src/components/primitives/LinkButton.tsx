import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./LinkButton.module.css";

type LinkButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
};

/**
 * A link styled as a pill button. Paths that start with `/` use next/link
 * (as a UrlObject, which skips typedRoutes until the section pages exist);
 * anything else (https:, mailto:) is a plain anchor.
 */
export function LinkButton({
  href,
  children,
  variant = "primary",
}: LinkButtonProps) {
  const className = [
    styles.button,
    variant === "primary" ? styles.primary : styles.secondary,
  ].join(" ");
  if (href.startsWith("/")) {
    return (
      <Link href={{ pathname: href }} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
