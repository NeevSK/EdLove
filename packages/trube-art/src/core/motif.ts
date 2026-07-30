import { clamp } from '@repo/trube-art/core/color';

export const TRUBE_MOTIF_NAMES = ['lotus-sketch', 'branch-flow', 'tide-lines'] as const;
export type TrubeMotifName = (typeof TRUBE_MOTIF_NAMES)[number];

export type TrubeMotifStyle = 'draft' | 'ink' | 'luminous';

export interface TrubeMotifSpec {
  kind: 'trube-motif';
  name: TrubeMotifName;
  seed?: number;
  density?: number;
  opacity?: number;
  style?: TrubeMotifStyle;
}

export interface TrubeResolvedMotifSpec {
  kind: 'trube-motif';
  name: TrubeMotifName;
  seed: number;
  density: number;
  opacity: number;
  style: TrubeMotifStyle;
}

export interface TrubeMotifStroke {
  svg: string;
  width: number;
  alpha: number;
}

export interface TrubeResolvedMotif {
  spec: TrubeResolvedMotifSpec;
  strokes: TrubeMotifStroke[];
  sdf: string; // High-fidelity SDF representation for Tier 1/2
}

function createRng(seed: number) {
  let value = seed >>> 0;

  return () => {
    value = (1664525 * value + 1013904223) >>> 0;
    return value / 0xffffffff;
  };
}

function jitter(random: () => number, amount: number): number {
  return (random() - 0.5) * amount;
}

function lotusMotif(random: () => number, density: number): TrubeMotifStroke[] {
  const petals = Math.max(5, Math.round(5 + density * 4));
  const strokes: TrubeMotifStroke[] = [];
  const centerX = 50;
  const centerY = 56;
  const radius = 20 + density * 6;

  for (let index = 0; index < petals; index += 1) {
    const ratio = petals === 1 ? 0.5 : index / (petals - 1);
    const baseX = 18 + ratio * 64;
    const tipX = baseX + jitter(random, 2.5);
    const tipY = 18 + jitter(random, 3.5);
    const leftCtrlX = baseX - radius * 0.25 + jitter(random, 3);
    const rightCtrlX = baseX + radius * 0.25 + jitter(random, 3);
    const bellyY = 58 + jitter(random, 2.5);

    strokes.push({
      svg: `M ${centerX} ${centerY} C ${leftCtrlX} ${bellyY}, ${tipX - 6} ${tipY + 10}, ${tipX} ${tipY} C ${tipX + 6} ${tipY + 10}, ${rightCtrlX} ${bellyY}, ${centerX} ${centerY}`,
      width: 1 + random() * 0.7,
      alpha: 0.16 + random() * 0.12,
    });
  }

  strokes.push({
    svg: `M ${centerX - 18} ${centerY + 12} Q ${centerX} ${centerY - 2} ${centerX + 18} ${centerY + 12}`,
    width: 1.2,
    alpha: 0.18,
  });

  strokes.push({
    svg: `M ${centerX} ${centerY + 8} Q ${centerX + jitter(random, 3)} ${76 + jitter(random, 2)} ${centerX - 2 + jitter(random, 2)} ${92}`,
    width: 1.05,
    alpha: 0.16,
  });

  return strokes;
}

function branchMotif(random: () => number, density: number): TrubeMotifStroke[] {
  const branches = Math.max(4, Math.round(4 + density * 5));
  const strokes: TrubeMotifStroke[] = [
    {
      svg: `M 24 92 Q 36 70 49 49 T 80 12`,
      width: 1.5,
      alpha: 0.2,
    },
  ];

  for (let index = 0; index < branches; index += 1) {
    const anchor = 0.18 + index * (0.58 / Math.max(1, branches - 1));
    const x = 24 + anchor * 56;
    const y = 90 - anchor * 62;
    const dir = index % 2 === 0 ? -1 : 1;
    const tipX = x + dir * (10 + random() * 10);
    const tipY = y - (8 + random() * 10);

    strokes.push({
      svg: `M ${x} ${y} Q ${x + dir * 6 + jitter(random, 3)} ${y - 6 + jitter(random, 3)} ${tipX} ${tipY}`,
      width: 0.9 + random() * 0.5,
      alpha: 0.12 + random() * 0.1,
    });
  }

  return strokes;
}

function tideMotif(random: () => number, density: number): TrubeMotifStroke[] {
  const lines = Math.max(4, Math.round(4 + density * 5));
  const strokes: TrubeMotifStroke[] = [];

  for (let index = 0; index < lines; index += 1) {
    const y = 24 + index * (48 / Math.max(1, lines - 1));
    strokes.push({
      svg: `M 10 ${y} C ${24 + jitter(random, 4)} ${y - 6 + jitter(random, 3)}, ${46 + jitter(random, 5)} ${y + 8 + jitter(random, 3)}, ${68} ${y} S ${88 + jitter(random, 4)} ${y - 4 + jitter(random, 3)}, 94 ${y + 2}`,
      width: 0.9 + random() * 0.6,
      alpha: 0.1 + random() * 0.08,
    });
  }

  return strokes;
}

export function motif(
  name: TrubeMotifName,
  options: Omit<TrubeMotifSpec, 'kind' | 'name'> = {},
): TrubeResolvedMotifSpec {
  return {
    kind: 'trube-motif',
    name,
    seed: options.seed ?? 1,
    density: clamp(options.density ?? 0.5, 0.1, 1),
    opacity: clamp(options.opacity ?? 1, 0.05, 1),
    style: options.style ?? 'draft',
  };
}

function lotusSDF(_random: () => number, density: number): string {
  // 2026 Mandate: Kells Principle Jittered SDF
  // This is a string-based representation that the C++/WebGPU drivers will parse.
  const petals = Math.max(5, Math.round(5 + density * 4));
  return `lotus(petals:${petals},jitter:${0.05 + density * 0.02})`;
}

export function resolveMotif(spec: TrubeMotifSpec): TrubeResolvedMotif {
  const resolved = motif(spec.name, spec);
  const random = createRng(resolved.seed);
  const base =
    resolved.name === 'branch-flow'
      ? branchMotif(random, resolved.density)
      : resolved.name === 'tide-lines'
        ? tideMotif(random, resolved.density)
        : lotusMotif(random, resolved.density);

  const styleMultiplier = resolved.style === 'ink' ? 1.3 : resolved.style === 'luminous' ? 1.05 : 1;

  // Tier 1/2 SDF Generation
  const sdf =
    resolved.name === 'lotus-sketch'
      ? lotusSDF(random, resolved.density)
      : `${resolved.name}(density:${resolved.density})`;

  return {
    spec: resolved,
    strokes: base.map((stroke) => ({
      ...stroke,
      width: stroke.width * styleMultiplier,
      alpha: stroke.alpha * resolved.opacity,
    })),
    sdf,
  };
}
