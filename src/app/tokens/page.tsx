import type { Metadata } from "next";
import type { CSSProperties } from "react";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Tokens",
  robots: { index: false, follow: false },
};

const colours = [
  "bg",
  "text",
  "muted",
  "accent",
  "visited",
  "border",
  "rule",
  "focus",
  "mark",
  "mark-text",
  "button",
] as const;
const typeSteps = [
  ["display", "Display sample heading"],
  ["h1", "H1 sample heading"],
  ["h2", "H2 sample heading"],
  ["h3", "H3 sample heading"],
  ["body", "Body: running text in posts and case studies"],
  ["small", "Small: meta, captions, labels"],
  ["mono", "const lcp = 1.8;"],
] as const;
const spaces = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

const sansFont = "var(--font-sans)";
const monoFont = "var(--font-mono)";
const fonts = [
  [
    "--font-sans",
    "var(--font-sans)",
    "The quick brown fox jumps over the lazy dog",
  ],
  ["--font-mono", "var(--font-mono)", "const lcp = 1.8;"],
  ["--font-whimsy", "var(--font-whimsy)", "Musings, in italic serif"],
] as const;

const fill = (token: string): CSSProperties => ({
  background: `var(--color-${token})`,
});

function Swatch({ token }: { token: string }) {
  return (
    <div className={styles.swatch}>
      <div className={styles.chip} style={fill(token)} />
      <span className={styles.name}>--color-{token}</span>
    </div>
  );
}

export default function TokensPage() {
  return (
    <div className={styles.page}>
      <h1>Tokens</h1>

      <section className={styles.section}>
        <h2>Colour</h2>
        <div className={styles.grid}>
          {colours.map((t) => (
            <Swatch key={t} token={t} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Fonts</h2>
        {fonts.map(([name, family, sample]) => (
          <div key={name} className={styles.row}>
            <span className={styles.name}>{name}</span>
            <span
              style={{
                fontFamily: family,
                fontStyle: name === "--font-whimsy" ? "italic" : "normal",
              }}
            >
              {sample}
            </span>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2>Type scale</h2>
        {typeSteps.map(([step, sample]) => (
          <div key={step} className={styles.row}>
            <span className={styles.name}>--type-{step}-*</span>
            <span
              style={{
                fontFamily: step === "mono" ? monoFont : sansFont,
                fontSize: `var(--type-${step}-size)`,
                lineHeight: `var(--type-${step}-line)`,
                fontWeight: `var(--type-${step}-weight)`,
                letterSpacing: `var(--type-${step}-tracking)`,
              }}
            >
              {sample}
            </span>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2>Spacing</h2>
        {spaces.map((n) => (
          <div key={n} className={styles.row}>
            <span className={styles.name}>--space-{n}</span>
            <span
              className={styles.bar}
              style={{ width: `var(--space-${n})` }}
            />
          </div>
        ))}
      </section>
    </div>
  );
}
