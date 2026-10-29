/**
 * Small, dependency-free colour helpers for the world layer.
 *
 * The world layer is shared by React Native (mobile) and the DOM (web), so it
 * must not import React, React Native or app code. Everything here is pure.
 */

export type Rgb = readonly [number, number, number];

function clamp255(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/** Parse `#rgb` or `#rrggbb` into channels. Throws on anything else. */
export function parseHex(hex: string): Rgb {
  const h = hex.trim().replace(/^#/, '');
  if (!/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(h)) {
    throw new Error(`world/color: expected #rgb or #rrggbb, got "${hex}"`);
  }
  if (h.length === 3) {
    return [parseInt(h[0]! + h[0]!, 16), parseInt(h[1]! + h[1]!, 16), parseInt(h[2]! + h[2]!, 16)];
  }
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function toHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((c) => clamp255(c).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

/** Mix two hex colours. `amount` 0 returns `a`, 1 returns `b`. */
export function mix(a: string, b: string, amount: number): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  const t = Math.max(0, Math.min(1, amount));
  return toHex([
    ca[0] + (cb[0] - ca[0]) * t,
    ca[1] + (cb[1] - ca[1]) * t,
    ca[2] + (cb[2] - ca[2]) * t,
  ]);
}

/** `rgba(r,g,b,a)` from a hex colour. */
export function alpha(hex: string, opacity: number): string {
  const [r, g, b] = parseHex(hex);
  const a = Math.max(0, Math.min(1, opacity));
  return `rgba(${r},${g},${b},${Number(a.toFixed(3))})`;
}

/** `"r,g,b"` triple, for `rgba(var(--x), a)` patterns on the web. */
export function rgbTriple(hex: string): string {
  return parseHex(hex).join(',');
}

function channelToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

/** WCAG 2.x contrast ratio between two opaque hex colours (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
