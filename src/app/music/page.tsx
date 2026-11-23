import type { Metadata } from "next";
import Image from "next/image";

import { FontPreload } from "@/components/sections/music/FontPreload";
import { ReleaseList } from "@/components/sections/music/ReleaseList";
import { listReleases } from "@/content";
import { pageMetadata } from "@/lib/metadata";
import "@/styles/room-bar.css";
import styles from "./page.module.css";

// The display font is a file under public/fonts with its @font-face in this
// route's CSS. A next/font preload made every route fetch the file, so the
// preload lives in this page only (see FontPreload for why it is not a plain
// preload here). With font-display: optional the font either paints from the
// first frame or not at all, so it can't shift the page.
const FONT_URL = "/fonts/dm-serif-display-latin.woff2";

export const metadata: Metadata = pageMetadata({
  title: "Music",
  description: "Releases by David Fleming, newest first, with notes.",
  path: "/music",
  section: "music",
});

export default async function MusicPage() {
  const releases = await listReleases();
  return (
    <div className={styles.page} data-room="bar">
      <FontPreload href={FONT_URL} />
      <div className={styles.photo} aria-hidden="true">
        <Image
          className={styles.photoImage}
          src="/images/music/music-room-640.webp"
          alt=""
          width={640}
          height={960}
          unoptimized
        />
        <span className={styles.tint} />
        <span className={styles.dim} />
        <span className={styles.glow} />
      </div>
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
        <label className={styles.pause}>
          <input className={styles.pauseInput} type="checkbox" />
          Pause motion
        </label>
      </div>
      <ReleaseList releases={releases} />
      <p className={styles.credit}>
        Photo: <a href="http://www.kmestudio12.com/">Morgan Shortell</a>
      </p>
    </div>
  );
}
