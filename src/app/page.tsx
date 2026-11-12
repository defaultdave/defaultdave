import { getHome, getWork } from "../content";
import { HomeSections } from "../components/sections/home/HomeSections";

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
