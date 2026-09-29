export type Side = "left" | "right";

export type ActionKind =
  | "punch"
  | "kick"
  | "special"
  | "combo"
  | "buff"
  | "fx"
  | "heal";

export interface FighterDef {
  id: string;
  name: string;
  tagline: string;
  accent: string;
  sprites: {
    idle: string;
    punch: string;
    kick: string;
    special: string;
    victory: string;
    portrait: string;
  };
}

export interface GiftRule {
  gift: string;
  /** "sender" = personagem do lado configurado; "left"/"right" = fixo */
  target: Side | "auto";
  action: ActionKind;
  damage: number;
  energy: number;
}

export interface Settings {
  username: string;
  wsUrl: string;
  volume: number;
  rules: GiftRule[];
  leftFighter: string;
  rightFighter: string;
  maxHp: number;
}

export interface GiftEvent {
  id: string;
  user: string;
  gift: string;
  count: number;
  coins: number;
  at: number;
  target: Side;
  action: ActionKind;
  damage: number;
}

export type ConnStatus = "offline" | "connecting" | "online" | "reconnecting";

export interface GameState {
  hp: Record<Side, number>;
  energy: Record<Side, number>;
  maxHp: number;
  hits: number;
  ko: Side | null;
  feed: GiftEvent[];
  status: ConnStatus;
  buffUntil: number;
}
