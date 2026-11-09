import type { MDXContent } from "../../content/types";
import { Prose } from "../primitives/Prose";
import { mdxComponents } from "./registry";

/** Render a compiled entry body with the registered components inside `Prose`. */
export function MdxBody({ body }: { body: MDXContent }) {
  const Body = body;
  return (
    <Prose>
      <Body components={mdxComponents} />
    </Prose>
  );
}
