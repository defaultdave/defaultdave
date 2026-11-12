import type { Metadata } from "next";

import { SITE_NAME, pageMetadata } from "@/lib/metadata";
import { getHome, getWork } from "../content";
import { HomeSections } from "../components/sections/home/HomeSections";

export const metadata: Metadata = pageMetadata({
  title: { absolute: SITE_NAME },
  description:
    "Personal site of David Fleming: work, articles, musings and music.",
  path: "/",
  section: "home",
});

export default async function HomePage() {
  const home = await getHome();
  const featured = await Promise.all(home.featuredWork.map((s) => getWork(s)));
  return (
    <HomeSections
      headline={home.headline}
      intro={home.intro}
      featuredWork={featured.filter((e) => e !== null)}
    />
  );
}
