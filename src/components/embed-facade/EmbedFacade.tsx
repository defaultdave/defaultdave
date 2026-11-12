import { EmbedPlayer } from "./EmbedPlayer";
import styles from "./EmbedFacade.module.css";

type EmbedAspect = "16:9" | "1:1" | "auto";

type EmbedFacadeProps = {
  title: string;
  /** The `host` field; unknown values never reach this component. */
  hostLabel: string;
  /** A vetted frame URL from `resolveEmbed`. */
  src: string;
  aspect: EmbedAspect;
};

/**
 * Server-rendered stand-in for a host's player. The box has its final size
 * from first paint (no layout shift when the iframe arrives) and nothing from
 * the host loads until the visitor presses play.
 */
export function EmbedFacade({
  title,
  hostLabel,
  src,
  aspect,
}: EmbedFacadeProps) {
  return (
    <div className={styles.box} data-aspect={aspect}>
      <EmbedPlayer title={title} hostLabel={hostLabel} src={src} />
    </div>
  );
}
