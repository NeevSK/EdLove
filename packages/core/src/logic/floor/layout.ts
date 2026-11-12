import { type FloorConfig, floorConfigWith } from './config';
import { mayReorder, orderAreas, orderGroups, orderPieces, weightOf } from './hierarchy';
import { choosePattern, PATTERNS } from './patterns';
import { orientationOf, screenBudget, shareByPriority, shareSpace, widthClassOf } from './space';
import type {
  AreaInput,
  DepthCue,
  FloorControls,
  FloorCost,
  FloorNode,
  FloorSpace,
  FloorTree,
  GroupInput,
  MotionLevel,
  PatternId,
  PieceInput,
  WorldFloorBias,
} from './types';

export interface FloorInput {
  room: string;
  areas: readonly AreaInput[];
  groups: readonly GroupInput[];
  pieces: readonly PieceInput[];
  space: FloorSpace;
  controls: FloorControls;
  world?: WorldFloorBias;
  config?: Partial<FloorConfig>;
}

const MOTION_RANK: Record<MotionLevel, number> = { none: 0, reduced: 1, full: 2 };
const leastMotion = (...levels: (MotionLevel | undefined)[]): MotionLevel =>
  levels
    .filter((m): m is MotionLevel => !!m)
    .reduce((lo, m) => (MOTION_RANK[m] < MOTION_RANK[lo] ? m : lo), 'full');

const NO_COST: FloorCost = { views: 0, pictures: 0, moves: false };
const addCost = (a: FloorCost, b: FloorCost): FloorCost => ({
  views: a.views + b.views,
  pictures: a.pictures + b.pictures,
  moves: a.moves || b.moves,
});

/** Height of a group's heading line, grown with the person's text size. */
const HEADING = 24;

interface PlannedGroup {
  group: GroupInput;
  area: AreaInput;
  pieces: PieceInput[];
  visible: PieceInput[];
  folded: PieceInput[];
  weight: number;
  pattern: PatternId;
  why: string[];
  width: number;
}

function columns(width: number, minW: number, gap: number): number {
  return Math.max(1, Math.floor((width + gap) / (minW + gap)));
}

/** Smallest and preferred height of a group under its pattern. */
function groupHeights(
  g: PlannedGroup,
  fontScale: number,
  gap: number,
): { min: number; preferred: number } {
  const head = HEADING * fontScale;
  const hOf = (p: PieceInput) => p.fit.min.h * fontScale;
  const prefOf = (p: PieceInput) => (p.fit.preferred?.h ?? p.fit.min.h) * fontScale;
  const shown = g.visible;
  const first = shown[0];
  if (!first) return { min: head, preferred: head };
  const minOne = head + hOf(first);
  switch (g.pattern) {
    case 'shelf':
    case 'circle-rail':
    case 'chip-rail': {
      const row = Math.max(...shown.map(prefOf));
      return { min: head + Math.max(...shown.map(hOf)), preferred: head + row };
    }
    case 'hero':
    case 'one-at-a-time':
      return { min: minOne, preferred: head + prefOf(first) };
    case 'tile-grid':
    case 'mixed-tiles': {
      const cols = columns(g.width, first.fit.min.w ?? 140, gap);
      const rows = Math.ceil(shown.length / cols);
      const rowH = Math.max(...shown.map(prefOf));
      return { min: minOne, preferred: head + rows * rowH + (rows - 1) * gap };
    }
    default: {
      const sum = shown.reduce((s, p) => s + prefOf(p), 0) + (shown.length - 1) * gap;
      return { min: minOne, preferred: head + sum };
    }
  }
}

/** How many of a group's visible pieces its given height can show (at least one). */
function piecesThatFit(g: PlannedGroup, size: number, fontScale: number, gap: number): number {
  const shown = g.visible;
  if (shown.length <= 1) return shown.length;
  const head = HEADING * fontScale;
  const prefOf = (p: PieceInput) => (p.fit.preferred?.h ?? p.fit.min.h) * fontScale;
  const room = size - head + 0.5;
  switch (g.pattern) {
    case 'shelf':
    case 'circle-rail':
    case 'chip-rail':
      return shown.length;
    case 'tile-grid':
    case 'mixed-tiles': {
      const cols = columns(g.width, shown[0]?.fit.min.w ?? 140, gap);
      const rowH = Math.max(...shown.map(prefOf));
      const rows = Math.max(1, Math.floor((room + gap) / (rowH + gap)));
      return Math.min(shown.length, rows * cols);
    }
    default: {
      let used = 0;
      let n = 0;
      for (const p of shown) {
        const next = used + (n > 0 ? gap : 0) + prefOf(p);
        if (n > 0 && next > room) break;
        used = next;
        n += 1;
      }
      return n;
    }
  }
}

function costOf(g: PlannedGroup, motion: MotionLevel): FloorCost {
  const pieces = g.visible.reduce((c, p) => addCost(c, p.fit.cost), NO_COST);
  const total = addCost(pieces, PATTERNS[g.pattern].cost);
  return motion === 'none' ? { ...total, moves: false } : total;
}

/**
 * Lays out one floor: who gets the screen, which pattern each group uses, what
 * shows on the first screen, what scrolls and what folds behind "See all",
 * and why. Pure: the same input always gives the same tree.
 */
export function layoutFloor(input: FloorInput): FloorTree {
  const config = floorConfigWith(input.config);
  const { space, controls, world } = input;
  const tier = config.tierByRoom[input.room] ?? 'standard';
  const screen = screenBudget(space, config.floorMinShare);
  const widthClass = widthClassOf(screen.floor.w);
  const orientation = orientationOf(space.width, space.height);
  const detail = controls.detail;
  const motion = leastMotion(controls.motion, world?.motion, config.motionByTier[detail]);
  const tierCues = config.depthByTier[detail];
  let depth: DepthCue[] = (world?.depthCues ?? tierCues).filter((c) => tierCues.includes(c));
  const gap = config.gaps.between;
  const cap = config.piecesPerGroup[tier];

  // Board: areas side by side, only on wide screens with room and detail to spare.
  const areas = orderAreas(input.areas, config).filter((a) =>
    input.groups.some((g) => g.area === a.id),
  );
  const boardFits =
    (widthClass === 'large' || widthClass === 'xlarge') &&
    areas.length >= 3 &&
    areas.length <= 5 &&
    detail !== 'essential';
  const floorPattern: 'stack' | 'board' = boardFits ? 'board' : 'stack';
  const areaWidth = floorPattern === 'board' ? screen.floor.w / areas.length : screen.floor.w;

  const planned: PlannedGroup[] = [];
  for (const area of areas) {
    const reorder = mayReorder(area, config);
    const groups = input.groups.filter((g) => g.area === area.id);
    const piecesOf = (g: GroupInput) => input.pieces.filter((p) => p.group === g.id);
    const groupWeight = (g: GroupInput) =>
      Math.max(0, ...piecesOf(g).map((p) => weightOf(p, config))) *
      (g.pinned ? config.weights.pin : 1);
    for (const group of orderGroups(groups, groupWeight, reorder)) {
      const pieces = orderPieces(piecesOf(group), reorder, config);
      if (pieces.length === 0) continue;
      const choice = choosePattern(
        group,
        pieces,
        areaWidth,
        space.fontScale,
        detail,
        config,
        world,
      );
      const showsAll = choice.pattern === 'grouped-list' && group.job === 'find';
      const limit = choice.pattern === 'one-at-a-time' ? 1 : showsAll ? pieces.length : cap;
      planned.push({
        group,
        area,
        pieces,
        visible: pieces.slice(0, limit),
        folded: pieces.slice(limit),
        weight: groupWeight(group),
        pattern: choice.pattern,
        why: [
          ...choice.why,
          reorder ? 'the system may order this area' : "kept in the person's order",
        ],
        width: areaWidth,
      });
    }
  }

  // Over budget: cheaper forms first, lowest weight first; then drop depth cues.
  const budget = controls.costBudget ?? config.budget[detail];
  const total = () => planned.reduce((c, g) => addCost(c, costOf(g, motion)), NO_COST);
  for (const g of [...planned].sort((a, b) => a.weight - b.weight)) {
    if (total().views <= budget) break;
    const cheaper = config.cheaper[g.pattern];
    if (cheaper) {
      g.why.push(`over the ${detail} budget, so ${cheaper} instead of ${g.pattern}`);
      g.pattern = cheaper;
    }
  }
  if (total().views > budget && depth.length > 0) depth = [];

  // First screen: up to the tier's group count, shared by weight; the rest scrolls.
  const firstCap = config.groupsOnFirstScreen[tier];
  const heights = new Map(planned.map((g) => [g.group.id, groupHeights(g, space.fontScale, gap)]));
  // In a stack the first screen is always a run from the top: a later group can
  // never sit above an earlier one, so the run ends at the first group whose
  // smallest size no longer fits (or at the tier's cap).
  const stackRun = (): PlannedGroup[] => {
    const run: PlannedGroup[] = [];
    let used = 0;
    for (const g of planned.slice(0, firstCap)) {
      const min = heights.get(g.group.id)?.min ?? HEADING;
      const next = used + (run.length > 0 ? config.gaps.group : 0) + min;
      if (run.length > 0 && next > screen.floor.h) break;
      run.push(g);
      used = next;
    }
    return run;
  };
  // A board's columns split a fixed screen (proportional share); a stack
  // scrolls, so the most important groups open fully first.
  const share = floorPattern === 'board' ? shareSpace : shareByPriority;
  const shareOf = (run: readonly PlannedGroup[]) =>
    share(
      Math.max(0, screen.floor.h - Math.max(0, run.length - 1) * config.gaps.group),
      run.map((g) => ({
        id: g.group.id,
        min: heights.get(g.group.id)?.min ?? HEADING,
        preferred: heights.get(g.group.id)?.preferred ?? HEADING,
        weight: g.weight,
      })),
    );
  let candidates = floorPattern === 'board' ? planned : stackRun();
  // A board gives every area its own full-height column, so each column is
  // shared among its own groups only.
  const boardShare = () => {
    const sizes: Record<string, number> = {};
    const folded: string[] = [];
    for (const area of areas) {
      const r = shareOf(planned.filter((g) => g.area.id === area.id));
      Object.assign(sizes, r.sizes);
      folded.push(...r.folded);
    }
    return { sizes, folded };
  };
  let shared = floorPattern === 'board' ? boardShare() : shareOf(candidates);
  // In a stack, a less important group never squeezes a more important one
  // above it: while one that outranks the last group is short of its
  // preferred size, the last group waits below the fold instead.
  while (floorPattern === 'stack' && candidates.length > 1) {
    const last = candidates[candidates.length - 1]!;
    const squeezed = candidates.some(
      (g) =>
        g.weight > last.weight &&
        (shared.sizes[g.group.id] ?? 0) < (heights.get(g.group.id)?.preferred ?? HEADING) - 0.5,
    );
    if (!squeezed) break;
    last.why.push(`waits below so a more important group above opens fully`);
    candidates = candidates.slice(0, -1);
    shared = shareOf(candidates);
  }
  const onFirst = new Set(
    candidates.map((g) => g.group.id).filter((id) => !shared.folded.includes(id)),
  );

  const pieceNode = (
    p: PieceInput,
    placement: FloorNode['placement'],
    width: number,
  ): FloorNode => ({
    id: p.id,
    level: 'piece',
    label: p.label,
    footprint: { w: width, h: (p.fit.preferred?.h ?? p.fit.min.h) * space.fontScale },
    weight: weightOf(p, config),
    cost: motion === 'none' ? { ...p.fit.cost, moves: false } : p.fit.cost,
    motion: p.lit ? motion : leastMotion(motion, 'reduced'),
    depth,
    placement,
    why: p.lit ? ['holds the lamp'] : [],
    children: [],
    piece: p,
  });

  // A group on the first screen shows only the pieces its share can hold;
  // the rest wait behind its See all instead of overflowing the fold.
  for (const g of planned) {
    const size = shared.sizes[g.group.id];
    if (!onFirst.has(g.group.id) || size === undefined) continue;
    const fits = piecesThatFit(g, size, space.fontScale, gap);
    if (fits < g.visible.length) {
      // A task is never put behind See all to save room; it stays in place.
      const keep = g.visible.filter((p, i) => i < fits || p.task);
      if (keep.length < g.visible.length) {
        g.folded = [...g.visible.filter((p) => !keep.includes(p)), ...g.folded];
        g.visible = keep;
        g.why.push(`its share of the first screen holds ${fits}; the rest are behind See all`);
      }
    }
  }

  const groupNodes = planned.map((g): FloorNode => {
    const placement = onFirst.has(g.group.id) ? 'first-screen' : 'below';
    const h = heights.get(g.group.id) ?? { min: HEADING, preferred: HEADING };
    const why = [...g.why];
    if (placement === 'below') why.push('after the first screen; reached by scrolling');
    if (g.folded.length > 0)
      why.push(`${g.folded.length} more behind See all (cap ${cap} for ${tier})`);
    return {
      id: g.group.id,
      level: 'group',
      label: g.group.label,
      pattern: g.pattern,
      footprint: { w: g.width, h: shared.sizes[g.group.id] ?? h.preferred },
      weight: g.weight,
      cost: costOf(g, motion),
      motion,
      depth,
      placement,
      why,
      children: [
        ...g.visible.map((p) => pieceNode(p, placement, g.width)),
        ...g.folded.map((p) => pieceNode(p, 'folded', g.width)),
      ],
    };
  });

  const areaNodes = areas.map((area): FloorNode => {
    const children = groupNodes.filter(
      (n) => planned.find((g) => g.group.id === n.id)?.area.id === area.id,
    );
    return {
      id: area.id,
      level: 'area',
      label: area.label,
      footprint: { w: areaWidth, h: children.reduce((s, c) => s + c.footprint.h, 0) },
      weight: Math.max(0, ...children.map((c) => c.weight)),
      cost: children.reduce((c, n) => addCost(c, n.cost), NO_COST),
      motion,
      depth,
      placement: children.some((c) => c.placement === 'first-screen') ? 'first-screen' : 'below',
      why: [mayReorder(area, config) ? 'smart area: the system orders it' : "the person's order"],
      children,
    };
  });

  const totalCost = areaNodes.reduce((c, n) => addCost(c, n.cost), NO_COST);
  const root: FloorNode = {
    id: input.room,
    level: 'floor',
    label: input.room,
    footprint: screen.floor,
    weight: 1,
    cost: totalCost,
    motion,
    depth,
    placement: 'first-screen',
    why: [
      `${widthClass} ${orientation}, ${tier} tier, ${detail} detail, motion ${motion}`,
      floorPattern === 'board' ? 'areas side by side as a board' : 'areas stacked',
      ...(screen.hidden.length > 0 ? [`gave way: ${screen.hidden.join(', ')}`] : []),
    ],
    children: areaNodes,
  };

  const readingOrder = groupNodes.flatMap((g) =>
    g.children.filter((c) => c.placement !== 'folded').map((c) => c.id),
  );

  return {
    room: input.room,
    widthClass,
    orientation,
    tier,
    chrome: { shown: screen.shown, hidden: screen.hidden },
    root,
    readingOrder,
    totalCost,
    budget,
  };
}
