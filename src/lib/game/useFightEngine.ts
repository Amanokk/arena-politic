import { useCallback, useEffect, useRef, useState } from "react";
import { sfx } from "./sfx";
import type {
  ActionKind,
  ConnStatus,
  GameState,
  GiftEvent,
  Settings,
  Side,
} from "./types";

export type AnimState = "idle" | "punch" | "kick" | "special" | "hit" | "ko" | "win";

export interface RawGift {
  user: string;
  gift: string;
  count?: number;
  coins?: number;
}

const other = (s: Side): Side => (s === "left" ? "right" : "left");

export function useFightEngine(settings: Settings) {
  const [state, setState] = useState<GameState>(() => ({
    hp: { left: settings.maxHp, right: settings.maxHp },
    energy: { left: 0, right: 0 },
    maxHp: settings.maxHp,
    hits: 0,
    ko: null,
    feed: [],
    status: "offline",
    buffUntil: 0,
  }));
  const [anim, setAnim] = useState<Record<Side, AnimState>>({
    left: "idle",
    right: "idle",
  });
  const [screenFx, setScreenFx] = useState<"none" | "shake" | "flash" | "mega">("none");
  const alternate = useRef<Side>("left");
  const timers = useRef<number[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  const setStatus = useCallback((status: ConnStatus) => {
    setState((s) => (s.status === status ? s : { ...s, status }));
  }, []);

  const reset = useCallback(() => {
    setAnim({ left: "idle", right: "idle" });
    setScreenFx("none");
    setState((s) => ({
      ...s,
      hp: { left: settings.maxHp, right: settings.maxHp },
      energy: { left: 0, right: 0 },
      maxHp: settings.maxHp,
      hits: 0,
      ko: null,
      buffUntil: 0,
    }));
  }, [settings.maxHp]);

  const playAction = useCallback(
    (attacker: Side, action: ActionKind) => {
      const defender = other(attacker);
      const pose: AnimState =
        action === "special" || action === "fx"
          ? "special"
          : action === "kick"
            ? "kick"
            : "punch";

      const hit = (i: number) => {
        later(() => {
          setAnim((a) => ({ ...a, [attacker]: pose }));
          if (action !== "buff" && action !== "heal") {
            setAnim((a) => ({ ...a, [defender]: "hit" }));
          }
          later(() => {
            setAnim((a) => ({
              ...a,
              [attacker]: a[attacker] === "ko" ? "ko" : "idle",
              [defender]: a[defender] === "ko" ? "ko" : "idle",
            }));
          }, 260);
        }, i * 300);
      };

      if (action === "combo") {
        [0, 1, 2].forEach(hit);
        sfx.combo();
      } else {
        hit(0);
        sfx[action === "kick" ? "kick" : action === "punch" ? "punch" : action]();
      }

      if (action === "special" || action === "combo") setScreenFx("shake");
      else if (action === "fx") setScreenFx("mega");
      else if (action === "buff" || action === "heal") setScreenFx("flash");
      else setScreenFx("shake");
      later(() => setScreenFx("none"), action === "fx" ? 1200 : 450);
    },
    [later],
  );

  const applyGift = useCallback(
    (raw: RawGift) => {
      const rule =
        settings.rules.find(
          (r) => r.gift.toLowerCase() === raw.gift.trim().toLowerCase(),
        ) ?? settings.rules[0];
      if (!rule) return;

      let attacker: Side;
      if (rule.target === "auto") {
        attacker = alternate.current;
        alternate.current = other(alternate.current);
      } else {
        attacker = rule.target;
      }

      const count = raw.count ?? 1;
      const coins = raw.coins ?? 0;

      setState((s) => {
        if (s.ko) return s;
        const buffed = Date.now() < s.buffUntil;
        const base = (rule.damage * count + coins * 0.5) * (buffed ? 2 : 1);
        const damage = Math.round(rule.action === "buff" || rule.action === "heal" ? 0 : base);
        const defender = other(attacker);

        const hp = { ...s.hp };
        if (rule.action === "heal") {
          hp[attacker] = Math.min(s.maxHp, hp[attacker] + 120 * count);
        } else {
          hp[defender] = Math.max(0, hp[defender] - damage);
        }

        const energy = { ...s.energy };
        energy[attacker] = Math.min(100, energy[attacker] + rule.energy * count);

        const ev: GiftEvent = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          user: raw.user,
          gift: raw.gift,
          count,
          coins,
          at: Date.now(),
          target: attacker,
          action: rule.action,
          damage,
        };

        const ko = hp.left === 0 ? "right" : hp.right === 0 ? "left" : null;
        if (ko) {
          sfx.ko();
          sfx.crowd();
          setAnim({
            left: ko === "left" ? "win" : "ko",
            right: ko === "right" ? "win" : "ko",
          });
          later(() => reset(), 5000);
        }

        return {
          ...s,
          hp,
          energy,
          hits: s.hits + 1,
          ko,
          feed: [ev, ...s.feed].slice(0, 40),
          buffUntil:
            rule.action === "buff" ? Date.now() + 20000 * count : s.buffUntil,
        };
      });

      playAction(attacker, rule.action);
    },
    [later, playAction, reset, settings.rules],
  );

  useEffect(() => {
    setState((s) =>
      s.maxHp === settings.maxHp
        ? s
        : {
            ...s,
            maxHp: settings.maxHp,
            hp: { left: settings.maxHp, right: settings.maxHp },
          },
    );
  }, [settings.maxHp]);

  return { state, anim, screenFx, applyGift, reset, setStatus };
}
