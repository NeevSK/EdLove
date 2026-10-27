/**
 * Recipe values -> React Native styles.
 *
 * The only place native code turns world recipes into style objects, so every
 * component draws edges, radii, glows and type the same way.
 */

import { Platform, type TextStyle, type ViewStyle } from 'react-native';
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
  const size = (sizeOverride ?? t.size) * scale;
  const lineHeight = ((t.lineHeight * size) / t.size) * (script ? SCRIPT_LINE_HEIGHT : 1);
  const drawn = draw(face, t, size, world.mode === 'dark');
  const ready = available.has(drawn.fontFamily);
  const fallback = t.family === 'serif' && !script ? SYSTEM_SERIF : undefined;
  return {
    fontSize: Math.round(size * 10) / 10,
    lineHeight: Math.round(lineHeight),
    letterSpacing: script ? 0 : t.letterSpacing,
    // Without an italic face, italic roles stay upright: a slanted roman reads as a mistake.
    fontStyle: !script && t.italic && !ready ? 'italic' : 'normal',
    textTransform: !script && t.uppercase ? 'uppercase' : 'none',
    ...(ready
      ? {
          fontFamily: drawn.fontFamily,
          ...(Object.keys(drawn.axes).length > 0 ? { fontVariationSettings: drawn.axes } : null),
        }
      : { ...(fallback ? { fontFamily: fallback } : null), fontWeight: t.weight }),
    ...(t.color ? { color: t.color } : null),
  };
}
