import { APCAcontrast, sRGBtoY } from 'apca-w3';
import { parse, formatHex, converter } from 'culori';
import { getContrastRatio } from './colorUtils';

/**
 * a11yUtils  Modern Accessibility Infrastructure for the Sanctuary.
 *
 * Supports:
 * - WCAG 2.1 (Relative Luminance / Contrast Ratio) - Legacy AA/AAA
 * - APCA (Accessible Perceptual Contrast Algorithm) - Future of WCAG 3
 * - Color space conversions for perceptual math (Oklch)
 */

interface ContrastResult {
  ratio: number;
  apca: number;
  passesAA: boolean;
  passesAAA: boolean;
  apcaRating: string;
}

/**
 * Convert any culori-parseable color to hex.
 */
export function toHex(color: string): string {
  const c = parse(color);
  return c ? formatHex(c) : '#000000';
}

/**
 * APCA Contrast calculation.
 * Returns a score between -108 and 106.
 */
export function getAPCAContrast(fg: string, bg: string): number {
  const f = parse(fg);
  const b = parse(bg);
  if (!f || !b) return 0;

  const fgRgb = converter('rgb')(f);
  const bgRgb = converter('rgb')(b);

  // apca-w3 expects 0-255 or uses sRGBtoY
  // Native apca-w3 implementation:
  const fY = sRGBtoY([fgRgb.r * 255, fgRgb.g * 255, fgRgb.b * 255]);
  const bY = sRGBtoY([bgRgb.r * 255, bgRgb.g * 255, bgRgb.b * 255]);

  return Number(APCAcontrast(fY, bY));
}

/**
 * APCA Level Rating based on score.
 * Lc 90: Preferred for body text.
 * Lc 75: Minimum for body text.
 * Lc 60: Minimum for large text / headlines.
 * Lc 45: Minimum for non-text graphics.
 */
export function getAPCARating(score: number): string {
  const abs = Math.abs(score);
  if (abs >= 90) return 'Silver/Gold (Excellent)';
  if (abs >= 75) return 'Bronze (Body Text Minimum)';
  if (abs >= 60) return 'Large Text Minimum';
  if (abs >= 45) return 'Graphic/UI Only';
  return 'Fail';
}

/**
 * Unified accessibility check.
 */
export function checkAccessibility(fg: string, bg: string): ContrastResult {
  const ratio = getContrastRatio(fg, bg);
  const apca = getAPCAContrast(fg, bg);

  return {
    ratio,
    apca,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7.0,
    apcaRating: getAPCARating(apca),
  };
}

/**
 * Finds the best text color for a given background from a set of candidates.
 * Prioritizes APCA score over legacy WCAG ratio.
 */
export function getBestText(
  bg: string,
  candidates: string[] = ['#2A2318', '#FCF9F2', '#FFFFFF', '#000000'],
): string {
  let bestColor = candidates[0] || '#000000';
  let bestApca = -Infinity;

  for (const fg of candidates) {
    const score = Math.abs(getAPCAContrast(fg, bg));
    if (score > bestApca) {
      bestApca = score;
      bestColor = fg;
    }
  }
  return bestColor;
}
