import { useCallback, useEffect, useRef } from "react";
import type { ConnStatus } from "./types";
import type { RawGift } from "./useFightEngine";

/**
 * Cliente WebSocket compatível com TikFinity ("TikTok Live Events" em
 * ws://localhost:21213/) e com qualquer ponte que envie JSON de presentes.
 * Formatos aceitos:
 *  { event: "gift", data: { uniqueId, giftName, repeatCount, diamondCount, repeatEnd } }
 *  { type: "gift", user, gift, count, coins }
 */
export function useTikTokLive(opts: {
  url: string;
  enabled: boolean;
  onGift: (g: RawGift) => void;
  onStatus: (s: ConnStatus) => void;
}) {
  const { url, enabled, onGift, onStatus } = opts;
  const socket = useRef<WebSocket | null>(null);
  const retry = useRef<number | null>(null);
  const attempts = useRef(0);
  const cbs = useRef({ onGift, onStatus });
  cbs.current = { onGift, onStatus };

  const parse = useCallback((payload: unknown): RawGift | null => {
    if (!payload || typeof payload !== "object") return null;
    const m = payload as Record<string, unknown>;
    const kind = String(m.event ?? m.type ?? "").toLowerCase();
    if (kind && kind !== "gift") return null;
    const data = (m.data as Record<string, unknown>) ?? m;
    const gift = data.giftName ?? data.gift ?? data.giftname;
    if (!gift) return null;
    const repeatEnd = data.repeatEnd;
    const giftType = data.giftType ?? data.gift_type;
    // presentes "streakable" só contam no fim da sequência
    if (giftType === 1 && repeatEnd === false) return null;
    return {
      user: String(data.nickname ?? data.uniqueId ?? data.user ?? "anônimo"),
      gift: String(gift),
      count: Number(data.repeatCount ?? data.count ?? 1) || 1,
      coins: Number(data.diamondCount ?? data.coins ?? 0) || 0,
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!enabled || !url) {
      socket.current?.close();
      socket.current = null;
      cbs.current.onStatus("offline");
      return;
    }

    let closed = false;

    const connect = () => {
      cbs.current.onStatus(attempts.current === 0 ? "connecting" : "reconnecting");
      let ws: WebSocket;
      try {
        ws = new WebSocket(url);
      } catch {
        schedule();
        return;
      }
      socket.current = ws;

      ws.onopen = () => {
        attempts.current = 0;
        cbs.current.onStatus("online");
      };
      ws.onmessage = (e) => {
        try {
          const g = parse(JSON.parse(String(e.data)));
          if (g) cbs.current.onGift(g);
        } catch {
          /* ignora payload inválido */
        }
      };
      ws.onerror = () => ws.close();
      ws.onclose = () => {
        if (closed) return;
        schedule();
      };
    };

    const schedule = () => {
      attempts.current += 1;
      cbs.current.onStatus("reconnecting");
      const delay = Math.min(15000, 1000 * attempts.current);
      retry.current = window.setTimeout(connect, delay);
    };

    connect();

    return () => {
      closed = true;
      if (retry.current) window.clearTimeout(retry.current);
      socket.current?.close();
      socket.current = null;
    };
  }, [enabled, url, parse]);
}
