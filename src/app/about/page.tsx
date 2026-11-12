import type { Metadata } from "next";

import { getAbout } from "../../content";
import { AboutContent } from "../../components/sections/about/AboutContent";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const about = await getAbout();
  return (
    <>
      <h1>About</h1>
      <AboutContent about={about} />
    </>
  );
}
