import type { About } from "../../../content/types";
import { MdxBody } from "../../mdx/MdxBody";
import { AboutLinks } from "./AboutLinks";
import styles from "./AboutContent.module.css";
import { Headshot } from "./Headshot";

/** Bio, optional headshot and links. Without a headshot the layout is one column. */
export function AboutContent({ about }: { about: About }) {
  return (
    <div
      className={styles.layout}
      data-has-headshot={about.headshot ? "" : undefined}
    >
      <Headshot image={about.headshot} />
      <div className={styles.text}>
        <MdxBody body={about.bio} />
        <AboutLinks links={about.links} />
      </div>
    </div>
  );
}
