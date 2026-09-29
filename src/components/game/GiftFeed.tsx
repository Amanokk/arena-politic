import type { GiftEvent } from "@/lib/game/types";

const LABEL: Record<string, string> = {
  punch: "SOCO",
  kick: "CHUTE",
  special: "ESPECIAL",
  combo: "COMBO x3",
  buff: "DANO x2",
  fx: "IMPACTO",
  heal: "CURA",
};

export function GiftFeed({ items }: { items: GiftEvent[] }) {
  return (
    <div className="flex w-56 flex-col gap-1">
      {items.slice(0, 6).map((ev) => (
        <div
          key={ev.id}
          className="panel animate-fade-in px-2 py-1 text-xs shadow-lg backdrop-blur-sm"
          style={{
            borderLeft: `4px solid ${
              ev.target === "left" ? "var(--team-red)" : "var(--team-blue)"
            }`,
          }}
        >
          <div className="truncate font-semibold text-primary">@{ev.user}</div>
          <div className="truncate text-muted-foreground">
            {ev.gift} x{ev.count} · {LABEL[ev.action] ?? ev.action}
            {ev.damage > 0 && (
              <span className="ml-1 font-bold text-destructive">-{ev.damage}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
