import type { MDXComponents } from "mdx/types";

import type { MDX_COMPONENT_NAMES } from "../../content/mdx";
import { Callout } from "./Callout";
import { Figure } from "./Figure";
import { Metric } from "./Metric";
import { Table, TableHeaderCell } from "./Table";

/**
 * The components an entry body may use, registered once. The capitalised keys
 * must match the names the content layer allows, so a body cannot reference
 * anything else. The lowercase keys replace the elements Markdown itself
 * renders; a body cannot write them as tags.
 */
export const mdxComponents = {
  Callout,
  Metric,
  Figure,
  table: Table,
  th: TableHeaderCell,
} satisfies MDXComponents &
  Record<(typeof MDX_COMPONENT_NAMES)[number], unknown>;
