import type { Metadata } from "next";
import type { CSSProperties } from "react";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Tokens",
  robots: { index: false, follow: false },
};

const surfaceColours = [
  "bg",
  "surface",
  "text",
  "muted",
  "border",
  "accent",
  "focus",
  "on-accent",
  "ink",
] as const;
const pops = ["pop-1", "pop-2", "pop-3", "pop-4"] as const;
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
const radii = ["sm", "md", "pill"] as const;

const sansFont = "var(--font-inter), system-ui, sans-serif";
const monoFont = "var(--font-mono)";

const fill = (token: string): CSSProperties => ({
  background: `var(--color-${token})`,
});

function Swatch({ token, inkText }: { token: string; inkText?: boolean }) {
  return (
    <div className={styles.swatch}>
      <div className={styles.chip} style={fill(token)}>
        {inkText ? <span className={styles.ink}>Aa ink text</span> : null}
      </div>
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
          {surfaceColours.map((t) => (
            <Swatch key={t} token={t} />
          ))}
          {pops.map((t) => (
            <Swatch key={t} token={t} inkText />
          ))}
        </div>
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

      <section className={styles.section}>
        <h2>Radii</h2>
        <div className={styles.boxes}>
          {radii.map((r) => (
            <div
              key={r}
              className={styles.box}
              style={{ borderRadius: `var(--radius-${r})` }}
            >
              <span className={styles.name}>--radius-{r}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Effects</h2>
        <div className={styles.boxes}>
          <div className={styles.box}>
            <span className={styles.name}>--effect-outline</span>
          </div>
          <div className={[styles.box, styles.shadow].join(" ")}>
            <span className={styles.name}>--effect-shadow</span>
          </div>
        </div>
      </section>
    </div>
  );
}
