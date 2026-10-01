import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FighterSprite } from "@/components/game/FighterSprite";
import { GiftFeed } from "@/components/game/GiftFeed";
import { HealthBar } from "@/components/game/HealthBar";
import { createBus, type BusMessage } from "@/lib/game/bus";
import { getFighter, loadSettings } from "@/lib/game/fighters";
import { setVolume } from "@/lib/game/sfx";
import type { Settings } from "@/lib/game/types";
import { useFightEngine } from "@/lib/game/useFightEngine";
import { useTikTokLive } from "@/lib/game/useTikTokLive";

export const Route = createFileRoute("/overlay")({
  head: () => ({
    meta: [
      { title: "Overlay | Combate de Presidentes" },
      {
        name: "description",
        content:
          "Overlay transparente do Combate de Presidentes para OBS: barras de vida, golpes e presentes da TikTok LIVE em tempo real.",
      },
      { property: "og:title", content: "Overlay | Combate de Presidentes" },
      {
        property: "og:description",
        content: "Overlay de luta em tempo real movido por presentes da TikTok LIVE.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OverlayPage,
});

const STATUS_LABEL = {
  offline: "DESCONECTADO",
  connecting: "CONECTANDO",
  online: "CONECTADO",
  reconnecting: "RECONECTANDO",
} as const;

function OverlayPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  useEffect(() => {
    setSettings(loadSettings());
    const prev = document.body.style.background;
    document.body.style.background = "transparent";
    return () => {
      document.body.style.background = prev;
    };
  }, []);

  if (!settings) return <div className="min-h-screen overlay-root" />;
  return <OverlayGame initial={settings} />;
}

function OverlayGame({ initial }: { initial: Settings }) {
  const [settings, setSettings] = useState(initial);
  const { state, anim, screenFx, applyGift, reset, setStatus } =
    useFightEngine(settings);

  const left = useMemo(() => getFighter(settings.leftFighter), [settings.leftFighter]);
  const right = useMemo(
    () => getFighter(settings.rightFighter),
    [settings.rightFighter],
  );

  useEffect(() => setVolume(settings.volume), [settings.volume]);

  useTikTokLive({
    url: settings.wsUrl,
    enabled: Boolean(settings.wsUrl && settings.username),
    onGift: applyGift,
    onStatus: setStatus,
  });

  const busRef = useRef<{ post: (m: BusMessage) => void; close: () => void } | null>(
    null,
  );
  useEffect(() => {
    const bus = createBus((m) => {
      if (m.type === "settings") setSettings(m.settings);
      if (m.type === "reset") reset();
      if (m.type === "manual") applyGift({ user: m.user, gift: m.gift, count: 1 });
    });
    busRef.current = bus;
    bus.post({ type: "hello" });
    return () => bus.close();
  }, [applyGift, reset]);

  useEffect(() => {
    busRef.current?.post({ type: "state", state });
  }, [state]);

  const buffed = state.buffUntil > Date.now();

  return (
    <div
      className={`overlay-root relative min-h-screen w-full overflow-hidden ${
        screenFx === "shake" ? "anim-shake" : screenFx === "mega" ? "anim-mega" : ""
      }`}
    >
      {screenFx !== "none" && (
        <div
          className="pointer-events-none absolute inset-0 z-30"
          style={{
            animation: "flash-screen 0.5s ease-out",
            background:
              screenFx === "mega"
                ? "radial-gradient(circle, var(--brasil-yellow), transparent 70%)"
                : "rgba(255,255,255,0.7)",
          }}
        />
      )}

      {/* HUD topo */}
      <div className="absolute inset-x-0 top-0 z-20 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-1 p-2 sm:gap-4 sm:p-4">
        <div className="min-w-0">
          <HealthBar
            name={left.name}
            portrait={left.sprites.portrait}
            hp={state.hp.left}
            maxHp={state.maxHp}
            energy={state.energy.left}
            side="left"
          />
        </div>
        <div className="mt-1 shrink-0 text-center sm:mt-2">
          <div className="font-display text-xs text-primary drop-shadow-[0_2px_0_rgba(0,0,0,0.9)]">
            {state.hits}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            golpes
          </div>
          <div
            className={`mt-1 font-display text-[8px] ${
              state.status === "online" ? "text-accent" : "text-destructive"
            }`}
          >
            {STATUS_LABEL[state.status]}
          </div>
        </div>
        <div className="min-w-0">
          <HealthBar
            name={right.name}
            portrait={right.sprites.portrait}
            hp={state.hp.right}
            maxHp={state.maxHp}
            energy={state.energy.right}
            side="right"
          />
        </div>
      </div>

      {buffed && (
        <div className="absolute left-1/2 top-28 z-20 -translate-x-1/2 font-display text-[10px] text-primary anim-energy">
          DANO x2
        </div>
      )}

      {/* Arena */}
      <div className="absolute inset-x-0 bottom-[8vh] top-24 z-10 grid grid-cols-2 items-end gap-2 px-3 sm:bottom-8 sm:top-28 sm:gap-8 sm:px-[7vw] portrait:bottom-[12vh]">
        <div className="h-[min(52vh,560px)] min-h-0 min-w-0">
          <FighterSprite fighter={left} anim={anim.left} side="left" />
        </div>
        <div className="h-[min(52vh,560px)] min-h-0 min-w-0">
          <FighterSprite fighter={right} anim={anim.right} side="right" />
        </div>
      </div>

      {/* Feed lateral */}
      <div className="absolute bottom-3 left-2 z-20 scale-75 origin-bottom-left sm:bottom-6 sm:left-4 sm:scale-100">
        <GiftFeed items={state.feed} />
      </div>

      {/* Último presente */}
      {state.feed[0] && (
        <div
          key={state.feed[0].id}
          className="anim-float absolute bottom-[34vh] left-1/2 z-20 -translate-x-1/2 text-center sm:bottom-40"
        >
          <div className="font-display text-sm text-primary drop-shadow-[0_3px_0_rgba(0,0,0,0.9)]">
            @{state.feed[0].user}
          </div>
          <div className="font-display text-[10px] text-foreground drop-shadow-[0_2px_0_rgba(0,0,0,0.9)]">
            {state.feed[0].gift} x{state.feed[0].count}
          </div>
        </div>
      )}

      {state.ko && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className="anim-kopop text-center">
            <div className="font-display text-6xl text-destructive drop-shadow-[0_6px_0_rgba(0,0,0,0.9)]">
              K.O.
            </div>
            <div className="mt-3 font-display text-sm text-primary drop-shadow-[0_3px_0_rgba(0,0,0,0.9)]">
              {(state.ko === "left" ? left : right).name} VENCEU
            </div>
            <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
              nova luta em 5s
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
