/**
 * Recipe values -> React Native styles.
 *
 * The only place native code turns world recipes into style objects, so every
 * component draws edges, radii, glows and type the same way.
 */

import { Platform, type TextStyle, type ViewStyle } from 'react-native';
import type { Edge, Glow, Radius, Shadow, TypeStyle, WorldLanguage } from '../types';

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

interface FontRegistry {
  serif: { regular?: string; italic?: string; medium?: string };
  sans: { regular?: string; medium?: string; semibold?: string; bold?: string };
  /** Script fonts used when the person reads in Sinhala or Tamil. */
  si: { serif?: string; sans?: string };
  ta: { serif?: string; sans?: string };
}

const SYSTEM_SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: undefined });

let fonts: FontRegistry = { serif: {}, sans: {}, si: {}, ta: {} };

/**
 * Register loaded font family names (e.g. from @expo-google-fonts). Until
 * registered, components use the platform's serif and the system sans, so
 * nothing breaks while fonts load or on devices where loading failed.
 */
export function registerWorldFonts(partial: Partial<FontRegistry>): void {
  fonts = {
    serif: { ...fonts.serif, ...partial.serif },
    sans: { ...fonts.sans, ...partial.sans },
    si: { ...fonts.si, ...partial.si },
    ta: { ...fonts.ta, ...partial.ta },
  };
  fontEpoch += 1;
  for (const listener of fontListeners) listener();
}

/* Fonts usually arrive after the first paint. Components read the registry
   through `useWorld`, which subscribes here so text re-renders once. */
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

function familyFor(
  t: Pick<TypeStyle, 'family' | 'weight' | 'italic'>,
  lang: WorldLanguage,
): {
  fontFamily?: string;
  registered: boolean;
} {
  if (lang === 'si' || lang === 'ta') {
    const f = fonts[lang][t.family];
    return { fontFamily: f, registered: !!f };
  }
  if (t.family === 'serif') {
    const f = t.italic
      ? fonts.serif.italic
      : t.weight === '400'
        ? fonts.serif.regular
        : fonts.serif.medium;
    return f
      ? { fontFamily: f, registered: true }
      : { fontFamily: SYSTEM_SERIF, registered: false };
  }
  const byWeight = {
    '400': fonts.sans.regular,
    '500': fonts.sans.medium,
    '600': fonts.sans.semibold,
    '700': fonts.sans.bold,
  } as const;
  const f = byWeight[t.weight];
  return { fontFamily: f, registered: !!f };
}

/** Sinhala and Tamil need more line height and never take italics or capitals. */
const SCRIPT_LINE_HEIGHT = 1.25;

export function typeStyle(
  t: Omit<TypeStyle, 'color'> & { color?: string },
  lang: WorldLanguage,
  sizeOverride?: number,
): TextStyle {
  const script = lang === 'si' || lang === 'ta';
  const size = sizeOverride ?? t.size;
  const lineHeight = Math.round((t.lineHeight * size) / t.size) * (script ? SCRIPT_LINE_HEIGHT : 1);
  const { fontFamily, registered } = familyFor(t, lang);
  return {
    fontSize: size,
    lineHeight: Math.round(lineHeight),
    letterSpacing: script ? 0 : t.letterSpacing,
    fontStyle: !script && t.italic && !registered ? 'italic' : 'normal',
    textTransform: !script && t.uppercase ? 'uppercase' : 'none',
    ...(fontFamily ? { fontFamily } : null),
    // A registered font file already carries its weight; adding fontWeight can make Android fall back.
    ...(registered ? null : { fontWeight: t.weight }),
    ...(t.color ? { color: t.color } : null),
  };
}
