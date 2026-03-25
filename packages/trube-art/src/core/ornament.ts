import { clamp } from './color';

export const TRUBE_ORNAMENT_NAMES = ['filigree', 'constellation', 'vein'] as const;
export type TrubeOrnamentName = typeof TRUBE_ORNAMENT_NAMES[number];

export interface TrubeOrnamentSpec {
  kind: 'trube-ornament';
  name: TrubeOrnamentName;
  seed?: number;
  density?: number;
  opacity?: number;
}

export interface TrubeResolvedOrnamentSpec {
  kind: 'trube-ornament';
  name: TrubeOrnamentName;
  seed: number;
  density: number;
  opacity: number;
}

export interface TrubeOrnamentNode {
  x: number;
  y: number;
  r: number;
  alpha: number;
}

export interface TrubeOrnamentEdge {
  from: number;
  to: number;
  alpha: number;
  width: number;
}

export interface TrubeResolvedOrnament {
  spec: TrubeResolvedOrnamentSpec;
  nodes: TrubeOrnamentNode[];
  edges: TrubeOrnamentEdge[];
}

function createRng(seed: number) {
  let value = seed >>> 0;

  return () => {
    value = (1664525 * value + 1013904223) >>> 0;
    return value / 0xffffffff;
  };
}

function buildConstellation(random: () => number, density: number): TrubeResolvedOrnament {
  const count = Math.max(8, Math.round(10 + density * 18));
  const nodes: TrubeOrnamentNode[] = Array.from({ length: count }, () => ({
    x: clamp(random(), 0.06, 0.94),
    y: clamp(random(), 0.08, 0.92),
    r: 1.2 + random() * 3.4,
    alpha: 0.18 + random() * 0.45,
  }));

  const edges: TrubeOrnamentEdge[] = [];
  for (let index = 0; index < nodes.length - 1; index += 1) {
    edges.push({
      from: index,
      to: index + 1,
      alpha: 0.08 + random() * 0.16,
      width: 0.6 + random() * 1,
    });
  }

  return {
    spec: {
      kind: 'trube-ornament',
      name: 'constellation',
      seed: 0,
      density,
      opacity: 1,
    },
    nodes,
    edges,
  };
}

function buildFiligree(random: () => number, density: number): TrubeResolvedOrnament {
  const nodes: TrubeOrnamentNode[] = [];
  const edges: TrubeOrnamentEdge[] = [];
  const strands = Math.max(3, Math.round(3 + density * 4));
  let cursor = 0;

  for (let strand = 0; strand < strands; strand += 1) {
    const originX = 0.12 + strand * (0.7 / Math.max(1, strands - 1));
    const points = Math.max(5, Math.round(5 + density * 5));

    for (let point = 0; point < points; point += 1) {
      nodes.push({
        x: clamp(originX + (random() - 0.5) * 0.12, 0.06, 0.94),
        y: clamp(0.1 + (point / Math.max(1, points - 1)) * 0.8 + (random() - 0.5) * 0.05, 0.08, 0.92),
        r: 0.9 + random() * 2.2,
        alpha: 0.12 + random() * 0.25,
      });

      if (point > 0) {
        edges.push({
          from: cursor - 1,
          to: cursor,
          alpha: 0.08 + random() * 0.12,
          width: 0.8 + random() * 0.8,
        });
      }

      if (point > 1 && random() > 0.55) {
        edges.push({
          from: cursor - 2,
          to: cursor,
          alpha: 0.06 + random() * 0.08,
          width: 0.5 + random() * 0.5,
        });
      }

      cursor += 1;
    }
  }

  return {
    spec: {
      kind: 'trube-ornament',
      name: 'filigree',
      seed: 0,
      density,
      opacity: 1,
    },
    nodes,
    edges,
  };
}

function buildVein(random: () => number, density: number): TrubeResolvedOrnament {
  const nodes: TrubeOrnamentNode[] = [];
  const edges: TrubeOrnamentEdge[] = [];
  const ribs = Math.max(4, Math.round(4 + density * 4));

  nodes.push({ x: 0.18, y: 0.1, r: 1.4, alpha: 0.28 });
  nodes.push({ x: 0.82, y: 0.9, r: 1.6, alpha: 0.32 });
  edges.push({ from: 0, to: 1, alpha: 0.16, width: 1.4 });

  for (let rib = 0; rib < ribs; rib += 1) {
    const anchorX = 0.22 + rib * (0.56 / Math.max(1, ribs - 1));
    const anchorY = 0.18 + rib * (0.56 / Math.max(1, ribs - 1));
    const top = nodes.length;
    nodes.push({
      x: clamp(anchorX - 0.12 - random() * 0.1, 0.06, 0.94),
      y: clamp(anchorY - 0.08 - random() * 0.08, 0.08, 0.92),
      r: 0.9 + random() * 1.4,
      alpha: 0.14 + random() * 0.16,
    });
    nodes.push({
      x: clamp(anchorX + 0.08 + random() * 0.1, 0.06, 0.94),
      y: clamp(anchorY + 0.04 + random() * 0.08, 0.08, 0.92),
      r: 0.9 + random() * 1.4,
      alpha: 0.14 + random() * 0.16,
    });
    edges.push({ from: 0, to: top, alpha: 0.1 + random() * 0.08, width: 0.8 + random() * 0.5 });
    edges.push({ from: 1, to: top + 1, alpha: 0.1 + random() * 0.08, width: 0.8 + random() * 0.5 });
  }

  return {
    spec: {
      kind: 'trube-ornament',
      name: 'vein',
      seed: 0,
      density,
      opacity: 1,
    },
    nodes,
    edges,
  };
}

export function ornament(
  name: TrubeOrnamentName,
  options: Omit<TrubeOrnamentSpec, 'kind' | 'name'> = {},
): TrubeResolvedOrnamentSpec {
  return {
    kind: 'trube-ornament',
    name,
    seed: options.seed ?? 1,
    density: clamp(options.density ?? 0.5, 0.1, 1),
    opacity: clamp(options.opacity ?? 1, 0.05, 1),
  };
}

export function resolveOrnament(spec: TrubeOrnamentSpec): TrubeResolvedOrnament {
  const resolved = ornament(spec.name, spec);
  const random = createRng(resolved.seed);

  const base =
    resolved.name === 'filigree'
      ? buildFiligree(random, resolved.density)
      : resolved.name === 'vein'
        ? buildVein(random, resolved.density)
        : buildConstellation(random, resolved.density);

  return {
    spec: resolved,
    nodes: base.nodes.map((node) => ({
      ...node,
      alpha: node.alpha * resolved.opacity,
    })),
    edges: base.edges.map((edge) => ({
      ...edge,
      alpha: edge.alpha * resolved.opacity,
    })),
  };
}
