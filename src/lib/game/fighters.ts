import type { FighterDef, GiftRule, Settings } from "./types";

import lulaIdle from "@/assets/lula-idle.png.asset.json";
import lulaPunch from "@/assets/lula-punch.png.asset.json";
import lulaKick from "@/assets/lula-kick.png.asset.json";
import lulaSpecial from "@/assets/lula-special.png.asset.json";
import lulaVictory from "@/assets/lula-victory.png.asset.json";
import lulaPortrait from "@/assets/lula-portrait.png.asset.json";

import flavioIdle from "@/assets/flavio-idle.png.asset.json";
import flavioPunch from "@/assets/flavio-punch.png.asset.json";
import flavioKick from "@/assets/flavio-kick.png.asset.json";
import flavioSpecial from "@/assets/flavio-special.png.asset.json";
import flavioVictory from "@/assets/flavio-victory.png.asset.json";
import flavioPortrait from "@/assets/flavio-portrait.png.asset.json";

export const FIGHTERS: FighterDef[] = [
  {
    id: "lula",
    name: "LULA",
    tagline: "O povo é a minha força",
    accent: "var(--team-red)",
    sprites: {
      idle: lulaIdle.url,
      punch: lulaPunch.url,
      kick: lulaKick.url,
      special: lulaSpecial.url,
      victory: lulaVictory.url,
      portrait: lulaPortrait.url,
    },
  },
  {
    id: "flavio",
    name: "FLÁVIO BOLSONARO",
    tagline: "Brasil acima de tudo",
    accent: "var(--team-blue)",
    sprites: {
      idle: flavioIdle.url,
      punch: flavioPunch.url,
      kick: flavioKick.url,
      special: flavioSpecial.url,
      victory: flavioVictory.url,
      portrait: flavioPortrait.url,
    },
  },
];

export function getFighter(id: string): FighterDef {
  return FIGHTERS.find((f) => f.id === id) ?? FIGHTERS[0];
}

export const DEFAULT_RULES: GiftRule[] = [
  { gift: "Rose", target: "left", action: "punch", damage: 40, energy: 6 },
  { gift: "White Rose", target: "right", action: "punch", damage: 40, energy: 6 },
  { gift: "Doughnut", target: "left", action: "special", damage: 220, energy: 25 },
  { gift: "Capybara", target: "right", action: "special", damage: 220, energy: 25 },
  { gift: "Mini Dino", target: "auto", action: "combo", damage: 150, energy: 18 },
  { gift: "Perfume", target: "auto", action: "buff", damage: 0, energy: 20 },
  { gift: "Sunglasses", target: "auto", action: "fx", damage: 60, energy: 12 },
  { gift: "Galaxy", target: "auto", action: "fx", damage: 400, energy: 50 },
  { gift: "TikTok", target: "auto", action: "kick", damage: 60, energy: 8 },
  { gift: "Heart Me", target: "auto", action: "heal", damage: 0, energy: 10 },
];

export const DEFAULT_SETTINGS: Settings = {
  username: "",
  wsUrl: "ws://localhost:21213/",
  volume: 0.6,
  rules: DEFAULT_RULES,
  leftFighter: "lula",
  rightFighter: "flavio",
  maxHp: 1000,
};

const KEY = "combate:settings";

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Settings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
}
