import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { createBus, type BusMessage } from "@/lib/game/bus";
import {
  DEFAULT_SETTINGS,
  FIGHTERS,
  getFighter,
  loadSettings,
  saveSettings,
} from "@/lib/game/fighters";
import { sfx } from "@/lib/game/sfx";
import type { ActionKind, GameState, GiftRule, Settings, Side } from "@/lib/game/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Combate de Presidentes | Painel do Streamer" },
      {
        name: "description",
        content:
          "Painel de controle do Combate de Presidentes: conecte sua TikTok LIVE, mapeie presentes para golpes e controle a luta no overlay do OBS.",
      },
      { property: "og:title", content: "Combate de Presidentes | Painel do Streamer" },
      {
        property: "og:description",
        content:
          "Luta em tempo real movida por presentes da TikTok LIVE, com overlay transparente para OBS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PanelPage,
});

const ACTIONS: ActionKind[] = [
  "punch",
  "kick",
  "special",
  "combo",
  "buff",
  "fx",
  "heal",
];

const ACTION_LABEL: Record<ActionKind, string> = {
  punch: "Soco",
  kick: "Chute",
  special: "Especial",
  combo: "Combo x3",
  buff: "Dano x2 (20s)",
  fx: "Efeito forte",
  heal: "Cura",
};

function PanelPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [state, setState] = useState<GameState | null>(null);
  const [overlayUrl, setOverlayUrl] = useState("/overlay");
  const busRef = useRef<{ post: (m: BusMessage) => void; close: () => void } | null>(
    null,
  );

  useEffect(() => {
    setSettings(loadSettings());
    setOverlayUrl(`${window.location.origin}/overlay`);
    const bus = createBus((m) => {
      if (m.type === "state") setState(m.state);
    });
    busRef.current = bus;
    return () => bus.close();
  }, []);

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      busRef.current?.post({ type: "settings", settings: next });
      return next;
    });
  };

  const updateRule = (i: number, patch: Partial<GiftRule>) => {
    const rules = settings.rules.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    update({ rules });
  };

  const left = useMemo(() => getFighter(settings.leftFighter), [settings.leftFighter]);
  const right = useMemo(
    () => getFighter(settings.rightFighter),
    [settings.rightFighter],
  );

  const status = state?.status ?? "offline";
  const statusColor =
    status === "online"
      ? "bg-accent"
      : status === "offline"
        ? "bg-destructive"
        : "bg-primary";

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-8">
      <header className="mx-auto mb-6 flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-base text-primary md:text-xl">
            COMBATE DE PRESIDENTES
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Painel do streamer · overlay movido por presentes da TikTok LIVE
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`} />
          {status === "online"
            ? "Conectado à live"
            : status === "connecting"
              ? "Conectando..."
              : status === "reconnecting"
                ? "Reconectando..."
                : "Desconectado"}
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel p-5">
          <h2 className="mb-4 font-display text-[11px] text-primary">CONEXÃO</h2>
          <label className="mb-1 block text-sm text-muted-foreground">
            Seu @ do TikTok
          </label>
          <input
            value={settings.username}
            onChange={(e) => update({ username: e.target.value.replace("@", "") })}
            placeholder="seu_usuario"
            className="mb-4 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <label className="mb-1 block text-sm text-muted-foreground">
            WebSocket de eventos (TikFinity / Streamer.bot)
          </label>
          <input
            value={settings.wsUrl}
            onChange={(e) => update({ wsUrl: e.target.value })}
            placeholder="ws://localhost:21213/"
            className="w-full rounded-md border border-input bg-secondary px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Abra o TikFinity no PC, ative o servidor de eventos e mantenha o app
            aberto. O overlay se conecta sozinho e reconecta se cair.
          </p>

          <h2 className="mb-3 mt-6 font-display text-[11px] text-primary">OVERLAY</h2>
          <div className="flex flex-wrap items-center gap-2">
            <code className="flex-1 truncate rounded-md border border-border bg-secondary px-3 py-2 font-mono text-xs">
              {overlayUrl}
            </code>
            <button
              onClick={() => navigator.clipboard?.writeText(overlayUrl)}
              className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Copiar
            </button>
            <a
              href="/overlay"
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-border px-3 py-2 text-sm transition hover:bg-secondary"
            >
              Abrir
            </a>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            No OBS: Fonte → Navegador → cole a URL, 1920x1080 (ou 1280x720) e marque
            "CSS personalizado" vazio. O fundo já é transparente.
          </p>

          <h2 className="mb-3 mt-6 font-display text-[11px] text-primary">LUTADORES</h2>
          <div className="grid grid-cols-2 gap-3">
            {(["leftFighter", "rightFighter"] as const).map((key) => (
              <div key={key}>
                <label className="mb-1 block text-xs text-muted-foreground">
                  {key === "leftFighter" ? "Esquerda" : "Direita"}
                </label>
                <select
                  value={settings[key]}
                  onChange={(e) => update({ [key]: e.target.value } as Partial<Settings>)}
                  className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm"
                >
                  {FIGHTERS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Volume dos efeitos: {Math.round(settings.volume * 100)}%
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.volume}
                onChange={(e) => update({ volume: Number(e.target.value) })}
                className="w-full accent-[var(--primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Vida de cada lutador
              </label>
              <input
                type="number"
                min={200}
                step={100}
                value={settings.maxHp}
                onChange={(e) => update({ maxHp: Number(e.target.value) || 1000 })}
                className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => {
                sfx.unlock();
                busRef.current?.post({ type: "reset" });
              }}
              className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition hover:opacity-90"
            >
              Reiniciar luta
            </button>
            <button
              onClick={() => update({ rules: DEFAULT_SETTINGS.rules })}
              className="rounded-md border border-border px-4 py-2 text-sm transition hover:bg-secondary"
            >
              Restaurar presentes padrão
            </button>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="mb-4 font-display text-[11px] text-primary">PLACAR AO VIVO</h2>
          <div className="grid grid-cols-2 gap-3">
            {([["left", left], ["right", right]] as const).map(([side, f]) => (
              <div key={side} className="rounded-md border border-border bg-secondary/50 p-3">
                <img
                  src={f.sprites.portrait}
                  alt={f.name}
                  className="mb-2 h-16 w-full rounded object-cover pixelated"
                />
                <div className="font-display text-[9px]">{f.name}</div>
                <div className="mt-2 h-3 w-full rounded-sm border border-primary/60 p-[1px]">
                  <div
                    className="hp-bar h-full rounded-[1px] transition-[width]"
                    style={{
                      width: `${
                        state ? (state.hp[side as Side] / state.maxHp) * 100 : 100
                      }%`,
                    }}
                  />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {state ? state.hp[side as Side] : settings.maxHp} HP · energia{" "}
                  {state ? state.energy[side as Side] : 0}%
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Golpes nesta live: <strong>{state?.hits ?? 0}</strong>
          </p>

          <h2 className="mb-3 mt-6 font-display text-[11px] text-primary">
            TESTAR PRESENTES
          </h2>
          <div className="flex flex-wrap gap-2">
            {settings.rules.map((r) => (
              <button
                key={r.gift}
                onClick={() => {
                  sfx.unlock();
                  busRef.current?.post({ type: "manual", gift: r.gift, user: "teste" });
                }}
                className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs transition hover:border-primary"
              >
                {r.gift}
              </button>
            ))}
          </div>

          <h2 className="mb-3 mt-6 font-display text-[11px] text-primary">
            HISTÓRICO DA LIVE
          </h2>
          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            {(state?.feed ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground">
                Nenhum presente recebido ainda. Deixe o overlay aberto em outra aba.
              </p>
            )}
            {(state?.feed ?? []).map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between rounded border border-border/60 bg-secondary/40 px-2 py-1 text-xs"
              >
                <span className="truncate">
                  @{ev.user} · {ev.gift} x{ev.count}
                </span>
                <span className="text-muted-foreground">
                  {ACTION_LABEL[ev.action]} {ev.damage > 0 ? `-${ev.damage}` : ""}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-5 lg:col-span-2">
          <h2 className="mb-4 font-display text-[11px] text-primary">
            MAPEAMENTO DE PRESENTES
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="pb-2">Presente</th>
                  <th className="pb-2">Quem ataca</th>
                  <th className="pb-2">Ação</th>
                  <th className="pb-2">Dano</th>
                  <th className="pb-2">Energia</th>
                </tr>
              </thead>
              <tbody>
                {settings.rules.map((r, i) => (
                  <tr key={i} className="border-t border-border/60">
                    <td className="py-2 pr-2">
                      <input
                        value={r.gift}
                        onChange={(e) => updateRule(i, { gift: e.target.value })}
                        className="w-40 rounded border border-input bg-secondary px-2 py-1"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        value={r.target}
                        onChange={(e) =>
                          updateRule(i, { target: e.target.value as GiftRule["target"] })
                        }
                        className="rounded border border-input bg-secondary px-2 py-1"
                      >
                        <option value="left">{left.name}</option>
                        <option value="right">{right.name}</option>
                        <option value="auto">Alternado</option>
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        value={r.action}
                        onChange={(e) =>
                          updateRule(i, { action: e.target.value as ActionKind })
                        }
                        className="rounded border border-input bg-secondary px-2 py-1"
                      >
                        {ACTIONS.map((a) => (
                          <option key={a} value={a}>
                            {ACTION_LABEL[a]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        value={r.damage}
                        onChange={(e) =>
                          updateRule(i, { damage: Number(e.target.value) || 0 })
                        }
                        className="w-20 rounded border border-input bg-secondary px-2 py-1"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        value={r.energy}
                        onChange={(e) =>
                          updateRule(i, { energy: Number(e.target.value) || 0 })
                        }
                        className="w-20 rounded border border-input bg-secondary px-2 py-1"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() =>
              update({
                rules: [
                  ...settings.rules,
                  { gift: "Novo presente", target: "auto", action: "punch", damage: 40, energy: 5 },
                ],
              })
            }
            className="mt-4 rounded-md border border-border px-3 py-2 text-sm transition hover:bg-secondary"
          >
            + Adicionar presente
          </button>
        </section>
      </div>
    </div>
  );
}
