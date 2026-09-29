import type { GameState, GiftEvent, Settings, Side } from "./types";

export type BusMessage =
  | { type: "state"; state: GameState }
  | { type: "settings"; settings: Settings }
  | { type: "reset" }
  | { type: "hello" }
  | { type: "manual"; gift: string; user: string; target?: Side };

const CHANNEL = "combate-de-presidentes";

export function createBus(onMessage: (m: BusMessage) => void) {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return { post: (_m: BusMessage) => {}, close: () => {} };
  }
  const ch = new BroadcastChannel(CHANNEL);
  ch.onmessage = (e) => onMessage(e.data as BusMessage);
  return {
    post: (m: BusMessage) => ch.postMessage(m),
    close: () => ch.close(),
  };
}

export type { GiftEvent };
