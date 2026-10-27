/**
 * The sky's light, season and weather for a Sri Lankan day: pure data and colour arithmetic,
 * shared by every painter (mobile Skia, web canvas, explore). Colours and timings are first
 * sketches from the living sky prototype (docs/Core/design/2026-10-26-world-model.md), tuned by
 * eye, not measured.
 */

export type ScenePhase = 'predawn' | 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night';
export type SceneSeason = 'maha' | 'harvest' | 'inter1' | 'yala' | 'inter2';
export type SceneWeather = 'clear' | 'cloudy' | 'drizzle' | 'monsoon' | 'storm' | 'mist';

export interface SeasonSpec {
  readonly id: SceneSeason;
  /** Months it covers, 0 for January. */
  readonly months: readonly number[];
  /** The paddy's colour in daylight. */
  readonly paddy: string;
}

export interface WeatherSpec {
  readonly id: SceneWeather;
  /** How much of the sky the cloud covers, 0 to 1. */
  readonly cloud: number;
  /** How much the light dims, 0 to 1. */
  readonly dim: number;
  /** Rain drops on a phone-sized scene at the richest tier. */
  readonly rain: number;
  readonly lightning: boolean;
  readonly mist: boolean;
}

export const SEASONS: readonly SeasonSpec[] = [
  { id: 'maha', months: [11, 0, 1], paddy: '#6E9A3A' },
  { id: 'harvest', months: [2], paddy: '#C7A13E' },
  { id: 'inter1', months: [3], paddy: '#9DA94A' },
  { id: 'yala', months: [4, 5, 6, 7], paddy: '#5E9A3C' },
  { id: 'inter2', months: [8, 9, 10], paddy: '#7BAA48' },
];

export const WEATHER: Readonly<Record<SceneWeather, WeatherSpec>> = {
  clear: { id: 'clear', cloud: 0.15, dim: 0, rain: 0, lightning: false, mist: false },
  cloudy: { id: 'cloudy', cloud: 0.65, dim: 0.18, rain: 0, lightning: false, mist: false },
  drizzle: { id: 'drizzle', cloud: 0.8, dim: 0.28, rain: 40, lightning: false, mist: false },
  monsoon: { id: 'monsoon', cloud: 1, dim: 0.42, rain: 120, lightning: false, mist: false },
  storm: { id: 'storm', cloud: 1, dim: 0.55, rain: 140, lightning: true, mist: false },
  mist: { id: 'mist', cloud: 0.45, dim: 0.1, rain: 0, lightning: false, mist: true },
};

/** Sky colour stops through the day, by minute after midnight. */
const SKY_STOPS: readonly { minute: number; top: string; horizon: string }[] = [
  { minute: 0, top: '#070C1A', horizon: '#18223A' },
  { minute: 290, top: '#0E1630', horizon: '#2E3558' },
  { minute: 345, top: '#3A4A7C', horizon: '#C98A7E' },
  { minute: 385, top: '#6F8AB8', horizon: '#F6C29A' },
  { minute: 450, top: '#8FB4DC', horizon: '#FBE0BE' },
  { minute: 600, top: '#7FB1E0', horizon: '#E4EEF0' },
  { minute: 780, top: '#6FA6DA', horizon: '#EEF2EA' },
  { minute: 930, top: '#86ABD2', horizon: '#F4E2B6' },
  { minute: 1040, top: '#5D6AA6', horizon: '#F1A869' },
  { minute: 1090, top: '#3E3E78', horizon: '#E07F5E' },
  { minute: 1130, top: '#22234A', horizon: '#7A4A62' },
  { minute: 1200, top: '#0D1430', horizon: '#26304E' },
  { minute: 1440, top: '#070C1A', horizon: '#18223A' },
];

/** Sunrise and sunset near Colombo, minutes after midnight (fixed for now; true sky is later). */
export const SUNRISE_MINUTE = 365;
export const SUNSET_MINUTE = 1090;

const MINUTES_PER_DAY = 1440;
const SYNODIC_MONTH_DAYS = 29.530588853;
/** A known new moon: 2000-01-06 18:14 UTC. */
const NEW_MOON_REFERENCE_MS = Date.UTC(2000, 0, 6, 18, 14);

export function clampMinute(minute: number): number {
  if (!Number.isFinite(minute)) return 0;
  const whole = Math.floor(minute) % MINUTES_PER_DAY;
  return whole < 0 ? whole + MINUTES_PER_DAY : whole;
}

/** The same six phases as `@repo/ui/context` `getTemporalPhase`, from a minute instead of a clock. */
export function phaseOfMinute(minute: number): ScenePhase {
  const hour = clampMinute(minute) / 60;
  if (hour >= 4 && hour < 6) return 'predawn';
  if (hour >= 6 && hour < 9) return 'dawn';
  if (hour >= 9 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}

export function isDarkPhase(phase: ScenePhase): boolean {
  return phase === 'predawn' || phase === 'dusk' || phase === 'night';
}

export function seasonOfMonth(month: number): SceneSeason {
  const found = SEASONS.find((season) => season.months.includes(((month % 12) + 12) % 12));
  return found?.id ?? 'maha';
}

export function seasonSpec(id: SceneSeason): SeasonSpec {
  return SEASONS.find((season) => season.id === id) ?? (SEASONS[0] as SeasonSpec);
}

/** The moon's age as a share of its cycle: 0 new, 0.5 full (a poya day), back to 1. */
export function moonPhaseAt(date: Date): number {
  const days = (date.getTime() - NEW_MOON_REFERENCE_MS) / 86_400_000;
  const age = days % SYNODIC_MONTH_DAYS;
  return (age < 0 ? age + SYNODIC_MONTH_DAYS : age) / SYNODIC_MONTH_DAYS;
}

export function isPoya(moonPhase: number): boolean {
  return moonPhase > 0.47 && moonPhase < 0.53;
}

/** How much daylight there is, 0 at night to 1 at full day, with an hour's soft edge each side. */
export function daylightAt(minute: number): number {
  const m = clampMinute(minute);
  if (m < SUNRISE_MINUTE - 50 || m > SUNSET_MINUTE + 50) return 0;
  if (m < SUNRISE_MINUTE + 60) return Math.max(0, (m - (SUNRISE_MINUTE - 50)) / 110);
  if (m > SUNSET_MINUTE - 60) return Math.max(0, (SUNSET_MINUTE + 50 - m) / 110);
  return 1;
}

export interface Celestial {
  readonly body: 'sun' | 'moon';
  /** Across the scene, 0 at the left edge to 1 at the right. */
  readonly x: number;
  /** Height above the horizon as a share of the sky's height, 0 on the horizon. */
  readonly lift: number;
}

/** Where the sun or moon is: one arc by day, one by night. */
export function celestialAt(minute: number): Celestial {
  const m = clampMinute(minute);
  const day = m >= SUNRISE_MINUTE - 20 && m <= SUNSET_MINUTE + 20;
  const raw = day
    ? (m - SUNRISE_MINUTE) / (SUNSET_MINUTE - SUNRISE_MINUTE)
    : ((m - SUNSET_MINUTE + MINUTES_PER_DAY) % MINUTES_PER_DAY) /
      (MINUTES_PER_DAY - (SUNSET_MINUTE - SUNRISE_MINUTE));
  const t = Math.max(-0.05, Math.min(1.05, raw));
  return {
    body: day ? 'sun' : 'moon',
    x: 0.08 + t * 0.84,
    lift: Math.sin(Math.PI * Math.max(0, Math.min(1, t))) * 0.78,
  };
}

/** The light itself: what the sun, moon, stars, mist and rain are made of. */
export const SCENE_LIGHT = {
  sunDisc: '#FFF6DE',
  sunLow: '#FFB070',
  moonDisc: '#F3F1E8',
  moonGlow: '#DCE3F2',
  star: '#FFFAEB',
  mist: '#F2F5F6',
  rainVeil: '#C8D0D8',
  cloudDay: '#FFFFFF',
  cloudNight: '#3A4458',
  white: '#FFFFFF',
  firefly: '#EEF696',
} as const;

/* ---------- colour arithmetic (6-digit hex only) ---------- */

function channels(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16),
  ];
}

function toHex(c: readonly number[]): string {
  return `#${c
    .map((v) => {
      const n = Math.max(0, Math.min(255, Math.round(v)));
      return n.toString(16).padStart(2, '0');
    })
    .join('')
    .toUpperCase()}`;
}

export function mixHex(a: string, b: string, t: number): string {
  const x = channels(a);
  const y = channels(b);
  return toHex([0, 1, 2].map((i) => (x[i] ?? 0) + ((y[i] ?? 0) - (x[i] ?? 0)) * t));
}

export function greyHex(hex: string, t: number): string {
  const c = channels(hex);
  const g = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
  return toHex(c.map((v) => v + (g - v) * t));
}

/** WCAG relative luminance, 0 to 1. */
export function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function skyStopsAt(minute: number): { top: string; horizon: string } {
  const m = clampMinute(minute);
  for (let i = 0; i < SKY_STOPS.length - 1; i++) {
    const a = SKY_STOPS[i];
    const b = SKY_STOPS[i + 1];
    if (a && b && m >= a.minute && m <= b.minute) {
      const t = (m - a.minute) / (b.minute - a.minute);
      return { top: mixHex(a.top, b.top, t), horizon: mixHex(a.horizon, b.horizon, t) };
    }
  }
  const first = SKY_STOPS[0] as (typeof SKY_STOPS)[number];
  return { top: first.top, horizon: first.horizon };
}

export interface SkyPalette {
  readonly top: string;
  readonly horizon: string;
  readonly hillFar: string;
  readonly hillNear: string;
  readonly land: string;
  readonly paddy: string;
  readonly water: string;
  /** The sun or moon's halo, warmed by the world's glow. */
  readonly halo: string;
}

/** The sky's colours for a minute, season and weather, warmed a little by the world's glow. */
export function skyPaletteAt(
  minute: number,
  season: SceneSeason,
  weather: SceneWeather,
  worldGlow: string,
): SkyPalette {
  const wx = WEATHER[weather];
  const light = daylightAt(minute);
  const stops = skyStopsAt(minute);
  let top = mixHex(greyHex(stops.top, wx.cloud * 0.55), '#5A6372', wx.dim * 0.55 * light);
  let horizon = mixHex(greyHex(stops.horizon, wx.cloud * 0.5), '#8E96A0', wx.dim * 0.5 * light);
  top = mixHex(top, worldGlow, 0.08);
  horizon = mixHex(horizon, worldGlow, 0.16);
  if (light < 0.2) {
    top = mixHex(top, '#05080F', wx.dim * 0.4);
    horizon = mixHex(horizon, '#0B1220', wx.dim * 0.4);
  }
  const paddyDay = seasonSpec(season).paddy;
  const night = '#0A1410';
  const land = mixHex(
    night,
    greyHex(mixHex(paddyDay, '#3F6A30', 0.25), wx.dim * 0.4),
    Math.max(0.08, light * (1 - wx.dim * 0.35)),
  );
  const hillFar = mixHex(horizon, mixHex(top, '#2B3A4A', 0.3), 0.45);
  return {
    top,
    horizon,
    hillFar,
    hillNear: mixHex(hillFar, land, 0.55),
    land,
    paddy: mixHex(
      night,
      greyHex(paddyDay, wx.dim * 0.35),
      Math.max(0.1, light * (1 - wx.dim * 0.3)),
    ),
    water: mixHex(horizon, top, 0.35),
    halo: mixHex('#FFE3A8', worldGlow, 0.25),
  };
}
