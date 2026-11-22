import type { Metadata } from "next";
import { DM_Serif_Display } from "next/font/google";

import { ReleaseList } from "@/components/sections/music/ReleaseList";
import { listReleases } from "@/content";
import { pageMetadata } from "@/lib/metadata";
import "@/styles/room-bar.css";
import styles from "./page.module.css";

// Used here and nowhere else. No preload: the bundler shares this route's CSS
// (and so the @font-face) with other routes, and a preload would make every
// route fetch the file. Without one, only a page that renders the family does.
const displayFont = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--music-font-display",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = pageMetadata({
  title: "Music",
  description: "Releases by David Fleming, newest first, with notes.",
  path: "/music",
  section: "music",
});

export default async function MusicPage() {
  const releases = await listReleases();
  return (
    <div
      className={[displayFont.variable, styles.page].join(" ")}
      data-room="bar"
    >
      <div className={styles.smoke} aria-hidden="true">
        <span className={styles.puff} />
        <span className={styles.puff} />
        <span className={styles.puff} />
        <span className={styles.puff} />
      </div>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Now playing</p>
        <h1 className={styles.title}>Music</h1>
        <div className={styles.rule} aria-hidden="true" />
      </div>
      <ReleaseList releases={releases} />
    </div>
  );
}
