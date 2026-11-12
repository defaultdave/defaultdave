import type { Metadata } from "next";

import { ReleaseList } from "@/components/sections/music/ReleaseList";
import { listReleases } from "@/content";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Music",
  description: "Releases by David Fleming, newest first, with notes.",
};

export default async function MusicPage() {
  const releases = await listReleases();
  return (
    <div className={styles.page}>
      <h1>Music</h1>
      <ReleaseList releases={releases} />
    </div>
  );
}
