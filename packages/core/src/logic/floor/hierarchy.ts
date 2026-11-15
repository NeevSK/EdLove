import type { FloorConfig } from './config';
import type { AreaInput, GroupInput, PieceInput } from './types';

/** w = time × attention × role × pin. */
export function weightOf(piece: PieceInput, config: FloorConfig): number {
  const t = config.weights.time[piece.time ?? 'anytime'];
  const a = piece.needsAttention ? config.weights.attention : 1;
  const r = piece.roleImportance ?? 1;
  const k = piece.pinned ? config.weights.pin : 1;
  return t * a * r * k;
}

const TIME_RANK = { now: 0, later: 1, anytime: 2 } as const;

/** May the system reorder inside this area? */
export function mayReorder(area: AreaInput | undefined, config: FloorConfig): boolean {
  if (config.reorder === 'everywhere') return true;
  if (config.reorder === 'never') return false;
  return !!area?.smart;
}

/**
 * Pieces of one group in reading order. Where the system may reorder, the
 * hierarchy keys decide (lit, time, attention, then saved order); elsewhere the
 * person's saved order wins and the hierarchy only changes size, never place.
 */
export function orderPieces(
  pieces: readonly PieceInput[],
  reorder: boolean,
  config: FloorConfig,
): PieceInput[] {
  const saved = (p: PieceInput, i: number) => p.savedIndex ?? 1000 + i;
  const indexed = pieces.map((p, i) => ({ p, i }));
  if (!reorder) return indexed.sort((a, b) => saved(a.p, a.i) - saved(b.p, b.i)).map((x) => x.p);
  const key = (p: PieceInput, i: number) =>
    config.hierarchy.map((k) => {
      if (k === 'lit') return p.lit ? 0 : 1;
      if (k === 'time') return TIME_RANK[p.time ?? 'anytime'];
      if (k === 'attention') return p.needsAttention ? 0 : 1;
      return saved(p, i);
    });
  return indexed
    .sort((a, b) => {
      const ka = key(a.p, a.i);
      const kb = key(b.p, b.i);
      for (let j = 0; j < ka.length; j++) {
        const d = (ka[j] ?? 0) - (kb[j] ?? 0);
        if (d !== 0) return d;
      }
      return a.i - b.i;
    })
    .map((x) => x.p);
}

/** Areas in the configured order; unknown areas after, as given. */
export function orderAreas(areas: readonly AreaInput[], config: FloorConfig): AreaInput[] {
  const rank = (a: AreaInput, i: number) => {
    const r = config.areaOrder.indexOf(a.id);
    return r < 0 ? config.areaOrder.length + i : r;
  };
  return areas
    .map((a, i) => ({ a, i }))
    .sort((x, y) => rank(x.a, x.i) - rank(y.a, y.i))
    .map((x) => x.a);
}

/** Groups of one area: by their strongest piece where reordering is allowed, else saved order. */
export function orderGroups(
  groups: readonly GroupInput[],
  weightOfGroup: (g: GroupInput) => number,
  reorder: boolean,
): GroupInput[] {
  const saved = (g: GroupInput, i: number) => g.savedIndex ?? 1000 + i;
  return groups
    .map((g, i) => ({ g, i }))
    .sort((a, b) =>
      reorder
        ? weightOfGroup(b.g) - weightOfGroup(a.g) || saved(a.g, a.i) - saved(b.g, b.i)
        : saved(a.g, a.i) - saved(b.g, b.i),
    )
    .map((x) => x.g);
}
