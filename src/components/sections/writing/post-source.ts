import { readFile } from "node:fs/promises";
import path from "node:path";

import type { PostCollection } from "../../../content/types";

/**
 * The raw MDX of a post, for counting words. The content layer returns the
 * body already compiled, so reading time reads the file it came from.
 */
export function readPostSource(
  collection: PostCollection,
  slug: string,
): Promise<string> {
  return readFile(
    path.join(process.cwd(), "content", collection, slug, "index.mdx"),
    "utf8",
  );
}
