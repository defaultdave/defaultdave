import type { Metadata } from "next";

import { pageMetadata } from "@/lib/metadata";
import { getAbout } from "../../content";
import { AboutContent } from "../../components/sections/about/AboutContent";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: "About David Fleming: a short bio and where to find him.",
  path: "/about",
  section: "about",
});

export default async function AboutPage() {
  const about = await getAbout();
  return (
    <>
      <h1>About</h1>
      <AboutContent about={about} />
    </>
  );
}
