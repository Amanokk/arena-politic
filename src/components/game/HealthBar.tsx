import type { Side } from "@/lib/game/types";

interface Props {
  name: string;
  portrait: string;
  hp: number;
  maxHp: number;
  energy: number;
  side: Side;
}

export function HealthBar({ name, portrait, hp, maxHp, energy, side }: Props) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const mirrored = side === "right";

  return (
    <div
      className={`flex min-w-0 items-center gap-1 sm:gap-2 ${mirrored ? "flex-row-reverse" : "flex-row"}`}
    >
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-sm border-2 border-primary bg-card sm:h-14 sm:w-14">
        <img src={portrait} alt={name} className="h-full w-full object-cover pixelated" />
      </div>
      <div className="min-w-0 flex-1">
        <div
          className={`mb-1 truncate font-display text-[7px] tracking-wider text-foreground drop-shadow-[0_2px_0_rgba(0,0,0,0.9)] sm:text-[10px] ${
            mirrored ? "text-right" : "text-left"
          }`}
        >
          {name}
        </div>
        <div className="h-4 w-full border-2 border-primary bg-secondary/80 p-[2px] sm:h-5">
          <div
            className={`hp-bar h-full transition-[width] duration-300 ease-out ${
              mirrored ? "ml-auto" : ""
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 h-2 w-full border border-arcade/70 bg-secondary/70 p-[1px]">
          <div
            className={`h-full bg-arcade transition-[width] duration-300 ${
              mirrored ? "ml-auto" : ""
            } ${energy >= 100 ? "anim-energy" : ""}`}
            style={{ width: `${energy}%` }}
          />
        </div>
      </div>
    </div>
  );
}
