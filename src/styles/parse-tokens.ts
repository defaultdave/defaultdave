/*
 * Reads src/styles/tokens.css into plain records. The contrast test and the
 * Storybook theme decorator both use it, so neither keeps a second copy of the
 * token values.
 */

export type TokenMap = Record<string, string>;

const DARK_BLOCK =
  /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{([^}]*)\}\s*\}/;
const ROOT_BLOCK = /:root\s*\{([^}]*)\}/;

function declarations(block: string): TokenMap {
  const tokens: TokenMap = {};
  for (const match of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    const [, name, value] = match;
    if (name !== undefined && value !== undefined) tokens[name] = value.trim();
  }
  return tokens;
}

/**
 * Splits the stylesheet into the light values (the top-level :root block) and
 * the dark overrides (the prefers-color-scheme: dark block). The mobile type
 * scale block is ignored.
 */
export function parseTokens(css: string): { light: TokenMap; dark: TokenMap } {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const darkBlock = DARK_BLOCK.exec(withoutComments)?.[1];
  if (darkBlock === undefined) {
    throw new Error(
      "parseTokens: no @media (prefers-color-scheme: dark) { :root { ... } } block found",
    );
  }
  const rest = withoutComments.replace(DARK_BLOCK, "");
  const lightBlock = ROOT_BLOCK.exec(rest)?.[1];
  if (lightBlock === undefined) {
    throw new Error("parseTokens: no top-level :root { ... } block found");
  }
  return { light: declarations(lightBlock), dark: declarations(darkBlock) };
}
