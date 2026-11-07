import type { Decorator, Preview } from "@storybook/nextjs-vite";

import tokensCss from "../src/styles/tokens.css?raw";
import { parseTokens, type TokenMap } from "../src/styles/parse-tokens";
import "../src/app/globals.css";
import "../src/styles/tokens.css";

/*
 * The site picks its palette from prefers-color-scheme and has no toggle, so a
 * story cannot ask the browser for dark mode. Instead every story renders in
 * two panels, one per palette, and each panel redeclares the token values from
 * tokens.css (parsed, not copied) under its own data-theme attribute.
 */
const { light, dark } = parseTokens(tokensCss);

function block(selector: string, tokens: TokenMap): string {
  const body = Object.entries(tokens)
    .map(([name, value]) => `${name}: ${value};`)
    .join(" ");
  // --effect-outline is in the parsed map too, so its var(--color-border) resolves against the panel.
  return `${selector} { ${body} }`;
}

// next/font sets these on <html> in the app; Storybook falls back to system fonts.
const fontCss =
  ":root { --font-inter: system-ui; --font-jetbrains-mono: ui-monospace; }";

const themeCss = [
  fontCss,
  block('[data-theme="light"]', light),
  block('[data-theme="dark"]', { ...light, ...dark }),
].join("\n");

const themes = ["light", "dark"] as const;

const withThemes: Decorator = (Story) => (
  <>
    <style>{themeCss}</style>
    {themes.map((theme) => (
      <section
        key={theme}
        data-theme={theme}
        aria-label={`${theme} theme`}
        style={{
          colorScheme: theme,
          background: "var(--color-bg)",
          color: "var(--color-text)",
          padding: "var(--space-5)",
        }}
      >
        <Story />
      </section>
    ))}
  </>
);

const preview: Preview = {
  decorators: [withThemes],
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
  },
};

export default preview;
