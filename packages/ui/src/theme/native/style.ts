/**
 * Recipe values -> React Native styles.
 *
 * The only place native code turns world recipes into style objects, so every
 * component draws edges, radii, glows and type the same way.
 */

import { Platform, type TextStyle, type ViewStyle } from 'react-native';
import { contrastColor } from 'react-native-reanimated';
import type {
  Edge,
  FaceSpec,
  FontWeight,
  Glow,
  Radius,
  ResolvedWorld,
  Shadow,
  TypeStyle,
  WorldLanguage,
} from '../types';

export function radiusStyle(r: Radius): ViewStyle {
  if (typeof r === 'number') return { borderRadius: r };
  return {
    borderTopLeftRadius: r[0],
    borderTopRightRadius: r[1],
    borderBottomRightRadius: r[2],
    borderBottomLeftRadius: r[3],
  };
}

/** Shrink a radius for something drawn `by` pixels inside it (an inner frame). */
export function insetRadius(r: Radius, by: number): Radius {
  if (typeof r === 'number') return Math.max(0, r - by);
  return [
    Math.max(0, r[0] - by),
    Math.max(0, r[1] - by),
    Math.max(0, r[2] - by),
    Math.max(0, r[3] - by),
  ];
}

export function edgeStyle(edge: Edge | null): ViewStyle {
  return edge ? { borderWidth: edge.width, borderColor: edge.color } : {};
}

export function glowStyle(glow: Glow | null): ViewStyle {
  if (!glow) return {};
  return {
    shadowColor: glow.color,
    shadowOpacity: glow.opacity,
    shadowRadius: glow.radius / 2,
    shadowOffset: { width: 0, height: 0 },
    // Android 9+ (our floor) tints elevation shadows with shadowColor.
    elevation: Platform.OS === 'android' ? 3 : 0,
  };
}

export function shadowStyle(shadow: Shadow | null): ViewStyle {
  if (!shadow) return {};
  return {
    shadowColor: shadow.color,
    shadowOpacity: shadow.opacity,
    shadowRadius: shadow.radius / 2,
    shadowOffset: { width: 0, height: shadow.offsetY / 2 },
    elevation: Platform.OS === 'android' ? Math.round(shadow.radius / 4) : 0,
  };
}

/* ---------- Dynamic Worklet Contrast ---------- */

/**
 * Worklet-safe contrast ink resolver leveraging Reanimated's `contrastColor()`.
 * Evaluates the WCAG relative luminance of `backgroundHex` and returns either
 * the world's dark ink or light onLamp ink to mathematically guarantee legibility.
 */
export function contrastInk(backgroundHex: string, world: ResolvedWorld): string {
  'worklet';
  const choice = contrastColor(backgroundHex);
  if (choice === 'white') {
    return world.mode === 'dark' ? world.tokens.ink : world.tokens.onLamp;
  }
  return world.mode === 'light' ? world.tokens.ink : world.tokens.onLamp;
}

/* ---------- Type ---------- */

/*
 * Every world's faces are embedded at build time (the expo-font plugin in
 * apps/gurudevi-mobile/app.json), so they are there at first paint. On the
 * web, or on a dev client built before a face was added, a face may be
 * missing: until it is known to be available, text uses the platform serif
 * and the system sans, so nothing waits on fonts or draws in a wrong face.
 */

const SYSTEM_SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: undefined });
const WEIGHT_ORDER: readonly FontWeight[] = ['400', '500', '600', '700'];

let available = new Set<string>();

/** Mark embedded or loaded font names as ready to draw with. */
export function registerAvailableFonts(names: Iterable<string>): void {
  const next = new Set(available);
  for (const name of names) next.add(name);
  if (next.size === available.size) return;
  available = next;
  fontEpoch += 1;
  for (const listener of fontListeners) listener();
}

export function isFontAvailable(name: string): boolean {
  return available.has(name);
}

/* Fonts can become available after the first paint (web). Components read
   the registry through `useWorld`, which subscribes here so text re-renders once. */
let fontEpoch = 0;
const fontListeners = new Set<() => void>();

export function subscribeWorldFonts(listener: () => void): () => void {
  fontListeners.add(listener);
  return () => {
    fontListeners.delete(listener);
  };
}

export function getWorldFontEpoch(): number {
  return fontEpoch;
}

/**
 * The person's reading settings, applied to every word the kit draws: a size scale, a weight
 * nudge (on the variable `wght` axis, so it stays true bold, never faked), extra tracking and
 * line spacing. Changing them re-renders text through the same epoch as fonts.
 */
export interface Reading {
  /** 0.85 to 1.5. */
  scale: number;
  /** Added to the `wght` axis: -100 to +150. */
  weight: number;
  /** Extra letter spacing in em: 0 to 0.08. */
  tracking: number;
  /** Line height factor: 1 to 1.5. */
  lines: number;
}

export const STANDARD_READING: Reading = { scale: 1, weight: 0, tracking: 0, lines: 1 };

let reading: Reading = STANDARD_READING;

export function getReading(): Reading {
  return reading;
}

/**
 * The phone's own text size and the person's reading size multiply. On an older teacher's phone
 * set to its largest text, with "Large and clear" on top, words would grow past three times their
 * designed size and stop fitting anywhere. So the total is held at this cap: the reading size is
 * always honoured, and the phone's size fills the room left under the cap.
 */
export const TEXT_GROWTH_CAP = 2.2;

/** How far the phone's text size may still grow words, given the reading size. */
export function systemTextAllowance(scale: number = reading.scale): number {
  return Math.max(1, TEXT_GROWTH_CAP / scale);
}

export function setReading(next: Partial<Reading>): void {
  const merged: Reading = {
    scale: Math.min(1.5, Math.max(0.85, next.scale ?? reading.scale)),
    weight: Math.min(150, Math.max(-100, next.weight ?? reading.weight)),
    tracking: Math.min(0.08, Math.max(0, next.tracking ?? reading.tracking)),
    lines: Math.min(1.5, Math.max(1, next.lines ?? reading.lines)),
  };
  if (JSON.stringify(merged) === JSON.stringify(reading)) return;
  reading = merged;
  fontEpoch += 1;
  for (const listener of fontListeners) listener();
}

function faceOf(world: ResolvedWorld, family: TypeStyle['family'], lang: WorldLanguage): FaceSpec {
  const faces = world.definition.faces;
  return lang === 'si' || lang === 'ta' ? faces[lang][family] : faces[family];
}

/** The face's choice for a weight, or the nearest lighter one it has. */
function weightOf(face: FaceSpec, weight: FontWeight): number | string | undefined {
  for (let i = WEIGHT_ORDER.indexOf(weight); i >= 0; i--) {
    const w = face.weights[WEIGHT_ORDER[i] as FontWeight];
    if (w !== undefined) return w;
  }
  return undefined;
}

interface Drawn {
  fontFamily: string;
  axes: Record<string, number>;
  italic: boolean;
}

function draw(
  face: FaceSpec,
  t: Pick<TypeStyle, 'weight' | 'italic'>,
  size: number,
  dark: boolean,
): Drawn {
  const w = weightOf(face, t.weight);
  const italic = t.italic && !!face.italic;
  // A static weight file has no italic of its own beyond the regular italic.
  const fontFamily = italic ? (face.italic as string) : typeof w === 'string' ? w : face.upright;
  const axes: Record<string, number> = { ...face.axes, ...(dark ? face.nightAxes : null) };
  if (typeof w === 'number') axes.wght = w;
  if (face.optical) axes.opsz = Math.min(face.optical[1], Math.max(face.optical[0], size));
  return { fontFamily, axes, italic };
}

/** A static weight moved by the reading nudge, one step per 100. */
function nudgedWeight(weight: FontWeight, nudge: number): FontWeight {
  const i = WEIGHT_ORDER.indexOf(weight) + Math.round(nudge / 100);
  return WEIGHT_ORDER[Math.min(WEIGHT_ORDER.length - 1, Math.max(0, i))] as FontWeight;
}

/** Sinhala and Tamil need more line height and never take capitals or tracking. */
const SCRIPT_LINE_HEIGHT = 1.25;

/**
 * A text recipe drawn in the world's faces. Weight comes from the `wght`
 * axis on variable faces (never `fontWeight`, which can make Android fake a
 * bold), optical size follows the font size, and a world's night axes apply
 * after dark.
 */
export function typeStyle(
  t: Omit<TypeStyle, 'color'> & { color?: string },
  lang: WorldLanguage,
  world: ResolvedWorld,
  sizeOverride?: number,
): TextStyle {
  const script = lang === 'si' || lang === 'ta';
  const face = faceOf(world, t.family, lang);
  const scale = face.scale ?? 1;
  const size = (sizeOverride ?? t.size) * scale * reading.scale;
  const lineHeight =
    ((t.lineHeight * size) / t.size) * (script ? SCRIPT_LINE_HEIGHT : 1) * reading.lines;
  const drawn = draw(face, t, size, world.mode === 'dark');
  if (reading.weight !== 0 && drawn.axes.wght !== undefined) {
    drawn.axes.wght = Math.min(900, Math.max(200, drawn.axes.wght + reading.weight));
  }
  const ready = available.has(drawn.fontFamily);
  const fallback = t.family === 'serif' && !script ? SYSTEM_SERIF : undefined;
  return {
    fontSize: Math.round(size * 10) / 10,
    lineHeight: Math.round(lineHeight),
    letterSpacing: script ? 0 : t.letterSpacing + reading.tracking * size,
    // Without an italic face, italic roles stay upright: a slanted roman reads as a mistake.
    fontStyle: !script && t.italic && !ready ? 'italic' : 'normal',
    textTransform: !script && t.uppercase ? 'uppercase' : 'none',
    ...(ready
      ? {
          fontFamily: drawn.fontFamily,
          ...(Object.keys(drawn.axes).length > 0 ? { fontVariationSettings: drawn.axes } : null),
        }
      : {
          ...(fallback ? { fontFamily: fallback } : null),
          fontWeight: nudgedWeight(t.weight, reading.weight),
        }),
    ...(t.color ? { color: t.color } : null),
  };
}
