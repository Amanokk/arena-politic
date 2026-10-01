import type { FighterDef, Side } from "@/lib/game/types";
import type { AnimState } from "@/lib/game/useFightEngine";

interface Props {
  fighter: FighterDef;
  anim: AnimState;
  side: Side;
}

export function FighterSprite({ fighter, anim, side }: Props) {
  const mirrored = side === "right";
  const sprite =
    anim === "punch"
      ? fighter.sprites.punch
      : anim === "kick"
        ? fighter.sprites.kick
        : anim === "special"
          ? fighter.sprites.special
          : anim === "win"
            ? fighter.sprites.victory
            : fighter.sprites.idle;

  const animClass =
    anim === "idle"
      ? "anim-idle"
      : anim === "hit"
        ? "anim-hit"
        : anim === "ko"
          ? "anim-ko"
          : anim === "win"
            ? "anim-win"
            : "";

  return (
    <div
      className="relative flex h-full min-h-0 w-full items-end justify-center"
      style={{ transform: mirrored ? "scaleX(-1)" : undefined }}
    >
      {anim === "special" && (
        <div
          className="anim-blast pointer-events-none absolute bottom-[18%] left-1/2 h-24 w-56"
          style={{
            background:
              "radial-gradient(closest-side, var(--brasil-yellow), var(--brasil-green) 55%, transparent 80%)",
            filter: "blur(2px)",
          }}
        />
      )}
      <img
        src={sprite}
        alt={fighter.name}
        style={
          {
            "--knock": mirrored ? "14px" : "-14px",
            "--fall": mirrored ? "-80deg" : "80deg",
          } as React.CSSProperties
        }
        className={`pixelated max-h-full max-w-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.55)] ${animClass}`}
      />
    </div>
  );
}
