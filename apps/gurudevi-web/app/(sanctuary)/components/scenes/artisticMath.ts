/**
 * Mathematical & Geometric Utilities for Artistic Natural Scenery
 *
 * Provides organic harmonic curves, naturalistic foliage branching,
 * and wave/ripple harmonics so SVG landscapes avoid digital rigidity.
 */

export const roundTo = (v: number, decimals = 1): number => {
  const f = 10 ** decimals;
  return Math.round(v * f) / f;
};

/**
 * Multi-harmonic ridge function: combines fundamental and non-integer harmonic
 * frequencies to simulate natural topography, mountain slopes, and water waves.
 */
export function harmonicValue(
  x: number,
  seed = 0,
  harmonics: ReadonlyArray<{ freq: number; amp: number; phase: number }> = [
    { freq: 1.0, amp: 0.55, phase: 0.0 },
    { freq: 2.37, amp: 0.28, phase: 1.7 },
    { freq: 5.12, amp: 0.12, phase: 0.6 },
    { freq: 11.4, amp: 0.05, phase: 2.9 },
  ],
): number {
  let sum = 0;
  for (const h of harmonics) {
    sum += Math.sin(x * h.freq + h.phase + seed) * h.amp;
  }
  return sum;
}

/**
 * Generates an organic, flowing horizontal ridge/shore path with smooth Bezier tension.
 */
export function createHarmonicPath(
  startX: number,
  endX: number,
  baseY: number,
  amplitude: number,
  seed = 0,
  step = 24,
  harmonics?: ReadonlyArray<{ freq: number; amp: number; phase: number }>,
): string {
  const points: { x: number; y: number }[] = [];
  const range = Math.max(1, endX - startX);

  for (let x = startX; x <= endX; x += step) {
    const t = (x - startX) / range;
    const offset = harmonicValue(t * Math.PI * 2, seed, harmonics) * amplitude;
    points.push({ x: roundTo(x), y: roundTo(baseY + offset) });
  }

  // Ensure exact endpoint
  const lastPoint = points[points.length - 1];
  if (!lastPoint || lastPoint.x < endX) {
    const offset = harmonicValue(Math.PI * 2, seed, harmonics) * amplitude;
    points.push({ x: endX, y: roundTo(baseY + offset) });
  }

  if (points.length < 2) return `M${startX} ${baseY}`;

  const firstPt = points[0];
  if (!firstPt) return `M${startX} ${baseY}`;

  // Smooth Catmull-Rom or cubic spline conversion
  let d = `M${firstPt.x} ${firstPt.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)] ?? points[0]!;
    const p1 = points[i] ?? points[0]!;
    const p2 = points[i + 1] ?? points[points.length - 1]!;
    const p3 = points[Math.min(points.length - 1, i + 2)] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C${roundTo(cp1x)} ${roundTo(cp1y)}, ${roundTo(cp2x)} ${roundTo(cp2y)}, ${p2.x} ${p2.y}`;
  }

  return d;
}

/**
 * Organic Lotus Pad shape with natural cleft, radial vein lines, and slight asymmetry.
 */
export interface LotusPadData {
  readonly path: string;
  readonly veins: readonly string[];
  readonly rimHighlight: string;
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
}

export function createLotusPad(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rotation = 0,
): LotusPadData {
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const pt = (x: number, y: number) => ({
    x: roundTo(cx + x * cos - y * sin),
    y: roundTo(cy + x * sin + y * cos),
  });

  const pStart = pt(0, -ry * 0.2);
  const pCleftLeft = pt(-rx * 0.45, -ry * 0.85);
  const pFarLeft = pt(-rx, 0);
  const pBottom = pt(0, ry);
  const pFarRight = pt(rx, 0);
  const pCleftRight = pt(-rx * 0.2, -ry * 0.95);

  const path = `M${pStart.x} ${pStart.y} L${pCleftLeft.x} ${pCleftLeft.y} C${roundTo(pFarLeft.x * 0.9)} ${roundTo(pCleftLeft.y * 1.1)}, ${pFarLeft.x} ${roundTo(pFarLeft.y * 0.5)}, ${pFarLeft.x} ${pFarLeft.y} C${pFarLeft.x} ${roundTo(pBottom.y * 0.8)}, ${roundTo(pBottom.x - rx * 0.4)} ${pBottom.y}, ${pBottom.x} ${pBottom.y} C${roundTo(pBottom.x + rx * 0.4)} ${pBottom.y}, ${pFarRight.x} ${roundTo(pBottom.y * 0.8)}, ${pFarRight.x} ${pFarRight.y} C${pFarRight.x} ${roundTo(pCleftRight.y * 0.5)}, ${roundTo(pFarRight.x * 0.8)} ${pCleftRight.y}, ${pCleftRight.x} ${pCleftRight.y} Z`;

  const veins = [
    `M${pStart.x} ${pStart.y} Q${roundTo(pStart.x * 0.6 + pFarLeft.x * 0.4)} ${roundTo(pStart.y * 0.6 + pFarLeft.y * 0.4)} ${pFarLeft.x} ${pFarLeft.y}`,
    `M${pStart.x} ${pStart.y} Q${roundTo(pStart.x * 0.5 + pBottom.x * 0.5)} ${roundTo(pStart.y * 0.5 + pBottom.y * 0.5)} ${pBottom.x} ${pBottom.y}`,
    `M${pStart.x} ${pStart.y} Q${roundTo(pStart.x * 0.6 + pFarRight.x * 0.4)} ${roundTo(pStart.y * 0.6 + pFarRight.y * 0.4)} ${pFarRight.x} ${pFarRight.y}`,
    `M${pStart.x} ${pStart.y} Q${roundTo(pStart.x * 0.7 + pCleftLeft.x * 0.3)} ${roundTo(pStart.y * 0.7 + pCleftLeft.y * 0.3)} ${pCleftLeft.x} ${pCleftLeft.y}`,
  ];

  const rimHighlight = `M${pFarLeft.x} ${pFarLeft.y} C${pFarLeft.x} ${roundTo(pBottom.y * 0.8)}, ${roundTo(pBottom.x - rx * 0.4)} ${pBottom.y}, ${pBottom.x} ${pBottom.y} C${roundTo(pBottom.x + rx * 0.4)} ${pBottom.y}, ${pFarRight.x} ${roundTo(pBottom.y * 0.8)}, ${pFarRight.x} ${pFarRight.y}`;

  return { path, veins, rimHighlight, cx, cy, rx, ry };
}
