"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./EmbedFacade.module.css";

type EmbedPlayerProps = {
  title: string;
  hostLabel: string;
  src: string;
};

/**
 * Fills the facade's fixed box. Shows a play button until clicked; the iframe,
 * and so the host's scripts, only exists after that. Focus moves to the iframe
 * because the button it replaces is gone.
 */
export function EmbedPlayer({ title, hostLabel, src }: EmbedPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (playing) frame.current?.focus();
  }, [playing]);

  if (playing) {
    return (
      <iframe
        ref={frame}
        className={styles.frame}
        src={src}
        title={`${title} on ${hostLabel}`}
        allow="autoplay; encrypted-media; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  return (
    <button
      type="button"
      className={styles.play}
      onClick={() => {
        setPlaying(true);
      }}
    >
      <span aria-hidden="true" className={styles.disc}>
        <svg width="22" height="22" viewBox="0 0 22 22">
          <path d="M6 3 L19 11 L6 19 Z" fill="currentColor" />
        </svg>
      </span>
      <span className={styles.label}>
        <span className={styles.name}>
          Load the {hostLabel} player for {title}
        </span>
        <span className={styles.hint}>
          Loads from {hostLabel} when you press play.
        </span>
      </span>
    </button>
  );
}
