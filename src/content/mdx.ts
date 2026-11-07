import { evaluate } from "@mdx-js/mdx";
import type { MDXContent } from "mdx/types";
import * as runtime from "react/jsx-runtime";
import { visit } from "unist-util-visit";

import type { Root } from "mdast";

/** The only JSX elements an entry body may use. Registered in src/components/mdx. */
export const MDX_COMPONENT_NAMES = ["Callout", "Metric", "Figure"] as const;

type NodeLike = {
  type: string;
  name?: string | null;
  attributes?: { type: string; value?: unknown }[];
};

const FORBIDDEN_TYPES: Record<string, string> = {
  html: "raw HTML",
  mdxjsEsm: "import or export statements",
  mdxFlowExpression: "expressions",
  mdxTextExpression: "expressions",
};

/**
 * Remark plugin that rejects everything in an MDX body except Markdown and the
 * registered components: no raw HTML tags, no unregistered JSX, no expressions,
 * no imports, no spread or expression attributes.
 */
function restrictToRegisteredComponents(
  allowed: readonly string[] = MDX_COMPONENT_NAMES,
) {
  return (tree: Root) => {
    visit(tree, (raw) => {
      const node = raw as NodeLike;
      const forbidden = FORBIDDEN_TYPES[node.type];
      if (forbidden) throw new Error(`${forbidden} are not allowed in content`);
      if (
        node.type === "mdxJsxFlowElement" ||
        node.type === "mdxJsxTextElement"
      ) {
        if (!node.name || !allowed.includes(node.name)) {
          throw new Error(
            `<${node.name ?? ""}> is not a registered component (allowed: ${allowed.join(", ")})`,
          );
        }
        if (
          node.attributes?.some(
            (a) =>
              a.type !== "mdxJsxAttribute" ||
              (a.value != null && typeof a.value !== "string"),
          )
        ) {
          throw new Error(
            `<${node.name}> may only have plain string attributes`,
          );
        }
      }
    });
  };
}

/** Compile an MDX body to a component. Throws on anything the restriction rejects. */
export async function compileMdx(source: string): Promise<MDXContent> {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [restrictToRegisteredComponents],
  });
  return Content;
}
