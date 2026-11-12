import type { PostCollection } from "../../../content/types";

type CollectionInfo = {
  /** Page heading and back-link label. */
  title: string;
  /** Route of the list page. */
  path: `/${PostCollection}`;
  /** Metadata description of the list page. */
  description: string;
};

export const WRITING: Record<PostCollection, CollectionInfo> = {
  articles: {
    title: "Articles",
    path: "/articles",
    description:
      "Longer pieces by David Fleming, and links to where they were first published.",
  },
  musings: {
    title: "Musings",
    path: "/musings",
    description: "Short posts by David Fleming.",
  },
};
