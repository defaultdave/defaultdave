import type { MDXComponents } from "mdx/types";

import type { MDX_COMPONENT_NAMES } from "../../content/mdx";
import { Callout } from "./Callout";
import { Figure } from "./Figure";
import { Metric } from "./Metric";

/**
 * The components an entry body may use, registered once. The keys must match
 * the names the content layer allows, so a body cannot reference anything else.
 */
export const mdxComponents = {
  Callout,
  Metric,
  Figure,
} satisfies MDXComponents &
  Record<(typeof MDX_COMPONENT_NAMES)[number], unknown>;
