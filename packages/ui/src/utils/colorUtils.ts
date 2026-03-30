/**
 * colorUtils \u2014 WCAG-compliant color math for the adaptive Sanctuary theme.
 *
 * Used by useTheme() to compute text colors that automatically adapt when
 * the phase accent changes (Saffron \u2192 Sage \u2192 Blue \u2192 Gold \u2192 etc.) so that
 * text is always legible regardless of which accent is active.
 *
 * WCAG 2.1 contrast requirements:
 *   AA  \u2014 normal text  : 4.5 : 1
 *   AA  \u2014 large text   : 3.0 : 1
 *   AAA \u2014 normal text  : 7.0 : 1
 */

/** Parse hex (#RGB / #RRGGBB / #RGBA / #RRGGBBAA) \u2192 [r, g, b] in 0-255 */
export function hexToRgb(hex: string): [number, number, number] {
  if (!hex || typeof hex !== 'string') {
    throw new Error(`colorUtils.hexToRgb: expected a hex string, got ${typeof hex} (${String(hex)})`);
  }
  const h = hex.replace(/^#/, '');
  if (!/^[0-9a-fA-F]{3,8}$/.test(h)) {
    throw new Error(`colorUtils.hexToRgb: invalid hex color "${hex}"`);
  }
  if (h.length === 3 || h.length === 4) {
    return [
      parseInt(h[0]! + h[0]!, 16),
      parseInt(h[1]! + h[1]!, 16),
      parseInt(h[2]! + h[2]!, 16),
    ];
  }
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Convert hex + alpha \u2192 `rgba(r,g,b,a)` string */
export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

interface ParsedColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, value));
}

function componentToHex(value: number): string {
  return clampChannel(Math.round(value)).toString(16).padStart(2, '0');
}

function parseCssColor(color: string): ParsedColor {
  if (!color || typeof color !== 'string') {
    throw new Error(`colorUtils.parseCssColor: expected a color string, got ${typeof color}`);
  }

  const value = color.trim();

  if (value.startsWith('#')) {
    const [r, g, b] = hexToRgb(value);
    return { r, g, b, a: 1 };
  }

  const rgbaMatch = value.match(/^rgba?\(([^)]+)\)$/i);
  if (!rgbaMatch) {
    throw new Error(`colorUtils.parseCssColor: unsupported color "${color}"`);
  }

  const parts = rgbaMatch[1]!.split(',').map((part) => part.trim());
  if (parts.length < 3) {
    throw new Error(`colorUtils.parseCssColor: invalid rgb/rgba color "${color}"`);
  }

  const r = Number.parseFloat(parts[0] ?? '0');
  const g = Number.parseFloat(parts[1] ?? '0');
  const b = Number.parseFloat(parts[2] ?? '0');
  const alpha = parts[3] !== undefined ? Number.parseFloat(parts[3]) : 1;

  return {
    r: clampChannel(r),
    g: clampChannel(g),
    b: clampChannel(b),
    a: Math.max(0, Math.min(1, Number.isFinite(alpha) ? alpha : 1)),
  };
}

export function colorToHex(color: string): string {
  const { r, g, b } = parseCssColor(color);
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

export function compositeColorOverBackground(foreground: string, background: string): string {
  const fg = parseCssColor(foreground);
  const bg = parseCssColor(background);

  const alpha = fg.a;
  const r = fg.r * alpha + bg.r * (1 - alpha);
  const g = fg.g * alpha + bg.g * (1 - alpha);
  const b = fg.b * alpha + bg.b * (1 - alpha);

  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

/**
 * Extract `r,g,b` components as a bare string \u2014 for use inside CSS
 * `rgba(var(--action-rgb), 0.15)` patterns.
 */
export function hexToRgbComponents(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `${r},${g},${b}`;
}

/**
 * WCAG relative luminance (0 = black, 1 = white).
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getRelativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(colorToHex(hex)).map(c => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (r!) + 0.7152 * (g!) + 0.0722 * (b!);
}

/**
 * WCAG contrast ratio between two hex colors.
 * Returns a value between 1 (no contrast) and 21 (maximum contrast).
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Returns the text color that achieves the best WCAG contrast against the
 * given background color.  Tries three candidates:
 *   1. Ink Truth   #2A2318  (rich warm dark)
 *   2. Sacred White #FCF9F2 (warm off-white)
 *   3. Pure White  #FFFFFF  (brighter fallback \u2014 helps with mid-luminance
 *                            accents like Gurudevi Blue #3B82F6 and Violet
 *                            #8B5CF6 where neither ink nor vellum passes AA)
 *
 * Returns whichever candidate achieves the highest contrast ratio.
 * This always picks the best available option even when no colour passes
 * the WCAG AA threshold of 4.5:1 (e.g. the afternoon phase's blue accent).
 *
 * @param bgHex     \u2014 background / surface hex color
 * @param darkText  \u2014 dark candidate (default: Ink Truth #2A2318)
 * @param lightText \u2014 warm-light candidate (default: Sacred White #FCF9F2)
 */
export function getTextOnBackground(
  bgHex: string,
  darkText = '#2A2318',
  lightText = '#FCF9F2',
): string {
  try {
    // Include pure black as a 4th candidate so mid-luminance accents like
    // gurudeviBlue (#3B82F6) and gurudeviViolet (#8B5CF6) resolve to an
    // AA-passing foreground (\u22654.5:1) instead of Ink at ~4.2.
    const candidates = [darkText, lightText, '#FFFFFF', '#000000'];
    let best = darkText;
    let bestRatio = 0;
    for (const c of candidates) {
      const ratio = getContrastRatio(bgHex, c);
      if (ratio > bestRatio) {
        bestRatio = ratio;
        best = c;
      }
    }
    return best;
  } catch {
    // Fallback if hex is malformed (e.g. rgba string passed by accident)
    return lightText;
  }
}

/**
 * Same as getTextOnBackground but returns an explicit pass/fail flag
 * for WCAG AA alongside the chosen color.
 */
export function getAccessibleTextColor(
  bgHex: string,
  darkText = '#2A2318',
  lightText = '#FCF9F2',
): { color: string; ratio: number; passesAA: boolean } {
  const candidates = [darkText, lightText, '#FFFFFF', '#000000'];
  let best = darkText;
  let bestRatio = 0;
  for (const c of candidates) {
    const ratio = getContrastRatio(bgHex, c);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = c;
    }
  }
  return { color: best, ratio: bestRatio, passesAA: bestRatio >= 4.5 };
}

/** Mix two hex colors at a given ratio (0 = all hex1, 1 = all hex2) */
export function mixColors(hex1: string, hex2: string, ratio: number): string {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Lighten a hex color by mixing with white */
export function lighten(hex: string, amount: number): string {
  return mixColors(hex, '#FFFFFF', Math.min(1, Math.max(0, amount)));
}

/** Darken a hex color by mixing with black */
export function darken(hex: string, amount: number): string {
  return mixColors(hex, '#000000', Math.min(1, Math.max(0, amount)));
}

/** Whether a color passes WCAG AA for normal text (4.5:1) against another */
export function isWcagAA(fgHex: string, bgHex: string): boolean {
  return getContrastRatio(fgHex, bgHex) >= 4.5;
}

/** Whether a color passes WCAG AAA for normal text (7:1) against another */
export function isWcagAAA(fgHex: string, bgHex: string): boolean {
  return getContrastRatio(fgHex, bgHex) >= 7.0;
}

/**
 * Produce a "soft tint" of a hex color suitable for card backgrounds:
 * mixes the accent color with the current surface \u2014 white in light mode,
 * near-black (#111218) in dark mode \u2014 at a low ratio so it tints without
 * overwhelming.
 *
 * In light mode this returns the accent with `alpha` opacity (visually blends
 * against a white surface). In dark mode the same alpha would look far more
 * saturated, so we blend toward the dark surface color instead.
 *
 * @param accentHex  \u2014 the dominant accent color
 * @param isDark     \u2014 whether we're in dark mode
 * @param alpha      \u2014 opacity / blend weight (default 0.08 for subtle tint)
 */
export function accentSoftTint(
  accentHex: string,
  isDark: boolean,
  alpha = 0.08,
): string {
  if (!isDark) {
    // Light mode: transparent accent over white surface
    return hexToRgba(accentHex, alpha);
  }
  // Dark mode: blend accent toward near-black surface at the same weight.
  // We mix the accent color with #111218 (the dark background) so the tint
  // stays legible without over-saturating.
  const darkSurface = '#111218';
  return mixColors(accentHex, darkSurface, alpha);
}
