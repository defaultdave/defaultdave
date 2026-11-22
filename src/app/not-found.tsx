import type { Metadata } from "next";

import { LinkButton } from "@/components/primitives/LinkButton";
import { RequestedPath } from "@/components/layout/RequestedPath";
import Link from "next/link";

import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/** The 404 page: a browser-style error page, with the gear spinning in its icon. */
export default function NotFound() {
  return (
    <section className={styles.page}>
      <svg
        className={styles.icon}
        width="72"
        height="80"
        viewBox="0 0 72 80"
        aria-hidden="true"
      >
        <path
          d="M8 4 H44 L60 20 V76 H8 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M44 4 V20 H60"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <g className={styles.gear}>
          <circle
            cx="46"
            cy="58"
            r="7"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="M46 45 V49 M46 67 V71 M33 58 H37 M55 58 H59 M36.8 48.8 L39.6 51.6 M52.4 64.4 L55.2 67.2 M36.8 67.2 L39.6 64.4 M52.4 51.6 L55.2 48.8"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <h1 className={styles.heading}>This page can’t be found</h1>
      <RequestedPath />
      <p className={styles.code}>HTTP ERROR 404</p>
      <div className={styles.actions}>
        <LinkButton href="/">Go home</LinkButton>
        <Link href="/">Restore defaults</Link>
      </div>
      <details className={styles.details}>
        <summary>Details</summary>
        <p>
          Every setting on this site is left at default, this error page
          included. The page you asked for is the one thing that isn’t here.
        </p>
      </details>
    </section>
  );
}
