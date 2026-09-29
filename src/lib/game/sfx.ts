let ctx: AudioContext | null = null;
let volume = 0.6;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType,
  gain = 0.3,
  slideTo?: number,
) {
  const a = ac();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, a.currentTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, a.currentTime + dur);
  g.gain.setValueAtTime(gain * volume, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  osc.connect(g).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + dur);
}

function noise(dur: number, gain = 0.4) {
  const a = ac();
  if (!a) return;
  const buffer = a.createBuffer(1, a.sampleRate * dur, a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const src = a.createBufferSource();
  const g = a.createGain();
  g.gain.value = gain * volume;
  src.buffer = buffer;
  src.connect(g).connect(a.destination);
  src.start();
}

export const sfx = {
  punch() {
    noise(0.15, 0.5);
    tone(180, 0.12, "square", 0.25, 60);
  },
  kick() {
    noise(0.2, 0.45);
    tone(120, 0.18, "sawtooth", 0.25, 50);
  },
  special() {
    tone(220, 0.5, "sawtooth", 0.3, 880);
    setTimeout(() => noise(0.4, 0.5), 120);
  },
  combo() {
    [0, 120, 240].forEach((d) => setTimeout(() => sfx.punch(), d));
  },
  buff() {
    tone(440, 0.3, "triangle", 0.25, 1320);
  },
  heal() {
    tone(660, 0.25, "sine", 0.25, 990);
  },
  fx() {
    tone(90, 0.6, "sawtooth", 0.35, 30);
    noise(0.6, 0.5);
  },
  ko() {
    tone(300, 0.9, "square", 0.35, 60);
    setTimeout(() => noise(1.2, 0.5), 150);
  },
  crowd() {
    noise(1.4, 0.25);
  },
  unlock() {
    ac();
  },
};
