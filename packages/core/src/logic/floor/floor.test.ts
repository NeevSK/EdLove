import {
  type ChromeBar,
  choosePattern,
  DEFAULT_FLOOR_CONFIG,
  type FloorFit,
  type FloorInput,
  floorConfigWith,
  floorLayoutId,
  layoutFloor,
  lintFloor,
  orderPieces,
  type PieceInput,
  piecesFromLayout,
  printFloor,
  screenBudget,
  shareByPriority,
  shareSpace,
  widthClassOf,
} from '@repo/core/logic/floor';
import { describe, expect, it } from 'vitest';

const card: FloorFit = {
  level: 'piece',
  min: { w: 140, h: 72 },
  preferred: { h: 96 },
  interactive: true,
  cost: { views: 8, pictures: 0, moves: false },
};
const piece = (id: string, group: string, extra: Partial<PieceInput> = {}): PieceInput => ({
  id,
  label: id,
  group,
  fit: card,
  ...extra,
});

const CHROME: ChromeBar[] = [
  { id: 'status', height: 24, giveWayRank: 0, essential: true },
  { id: 'header', height: 56, giveWayRank: 2 },
  { id: 'stripe', height: 32, giveWayRank: 4 },
  { id: 'rooms', height: 64, giveWayRank: 3 },
];
const phone = { width: 360, height: 760, fontScale: 1, chrome: CHROME };

const classroom = (over: Partial<FloorInput> = {}): FloorInput => ({
  room: 'workspace',
  areas: [
    { id: 'work', label: 'Work' },
    { id: 'today', label: 'Today', smart: true },
  ],
  groups: [
    { id: 'daily', label: 'Daily tasks', area: 'today', job: 'act' },
    { id: 'lessons', label: 'Recent lessons', area: 'work', job: 'browse', savedIndex: 1 },
    { id: 'numbers', label: 'This week', area: 'work', job: 'glance', savedIndex: 0 },
  ],
  pieces: [
    piece('notes', 'daily', { time: 'anytime', savedIndex: 0 }),
    piece('roll', 'daily', { time: 'now', lit: true, task: true, savedIndex: 2 }),
    piece('marks', 'daily', { time: 'later', needsAttention: true, savedIndex: 1 }),
    ...['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].map((x, i) =>
      piece(`lesson-${x}`, 'lessons', { savedIndex: i }),
    ),
    piece('attendance', 'numbers'),
    piece('average', 'numbers'),
    piece('due', 'numbers'),
  ],
  space: phone,
  controls: { detail: 'rich', motion: 'full' },
  ...over,
});

describe('shareByPriority', () => {
  it('opens the most important child fully before the next grows', () => {
    const r = shareByPriority(300, [
      { id: 'tools', min: 100, preferred: 200, weight: 1 },
      { id: 'today', min: 80, preferred: 250, weight: 4 },
    ]);
    expect(r.sizes).toEqual({ tools: 100, today: 200 });
    expect(r.folded).toEqual([]);
  });
  it('folds the least important when even the minimums do not fit', () => {
    const r = shareByPriority(150, [
      { id: 'a', min: 100, preferred: 100, weight: 3 },
      { id: 'b', min: 100, preferred: 100, weight: 1 },
    ]);
    expect(r.folded).toEqual(['b']);
  });
});

describe('shareSpace', () => {
  it('gives minimums first, shares the rest by weight, never past preferred', () => {
    const r = shareSpace(300, [
      { id: 'a', min: 50, preferred: 100, weight: 3 },
      { id: 'b', min: 50, preferred: 400, weight: 1 },
    ]);
    expect(r.sizes.a).toBeCloseTo(100);
    expect(r.sizes.b).toBeCloseTo(200);
    expect(r.folded).toEqual([]);
  });

  it('folds the lowest weight when the minimums do not fit', () => {
    const r = shareSpace(100, [
      { id: 'a', min: 60, preferred: 60, weight: 3 },
      { id: 'b', min: 60, preferred: 60, weight: 1 },
    ]);
    expect(r.folded).toEqual(['b']);
    expect(r.sizes.a).toBe(60);
  });
});

describe('who gets the screen', () => {
  it('keeps all chrome when there is room', () => {
    expect(screenBudget(phone, 0.5).hidden).toEqual([]);
  });

  it('lets chrome give way, highest rank first, when the keyboard is up; never the status bar', () => {
    const r = screenBudget({ ...phone, keyboard: 300 }, 0.5);
    expect(r.hidden[0]).toBe('stripe');
    expect(r.shown).toContain('status');
  });

  it('names width classes by dp', () => {
    expect(widthClassOf(360)).toBe('compact');
    expect(widthClassOf(700)).toBe('medium');
    expect(widthClassOf(900)).toBe('expanded');
    expect(widthClassOf(1300)).toBe('large');
  });
});

describe('hierarchy', () => {
  const pieces = classroom().pieces.filter((p) => p.group === 'daily');
  it('reorders by lit, time and attention where the system may', () => {
    expect(orderPieces(pieces, true, DEFAULT_FLOOR_CONFIG).map((p) => p.id)).toEqual([
      'roll',
      'marks',
      'notes',
    ]);
  });
  it("keeps the person's order where it may not", () => {
    expect(orderPieces(pieces, false, DEFAULT_FLOOR_CONFIG).map((p) => p.id)).toEqual([
      'notes',
      'marks',
      'roll',
    ]);
  });
});

describe('choosePattern', () => {
  const cfg = DEFAULT_FLOOR_CONFIG;
  const many = ['a', 'b', 'c', 'd'].map((x) => piece(x, 'g'));
  it('browses on a shelf, people on a circle rail, and lists on the lightest tier', () => {
    const g = { id: 'g', label: 'g', area: 'work', job: 'browse' as const };
    expect(choosePattern(g, many, 360, 1, 'rich', cfg).pattern).toBe('shelf');
    expect(choosePattern({ ...g, shape: 'circle' }, many, 360, 1, 'rich', cfg).pattern).toBe(
      'circle-rail',
    );
    expect(choosePattern(g, many, 360, 1, 'essential', cfg).pattern).toBe('grouped-list');
  });
  it('turns tiles into a stream at large text', () => {
    const g = { id: 'g', label: 'g', area: 'work', job: 'glance' as const };
    expect(choosePattern(g, many, 360, 1.4, 'rich', cfg).pattern).toBe('stream');
  });
  it('respects switched-off own patterns', () => {
    const g = { id: 'g', label: 'g', area: 'work', job: 'track' as const };
    const off = floorConfigWith({ ownPatterns: { ...cfg.ownPatterns, path: false } });
    expect(choosePattern(g, many, 360, 1, 'rich', cfg).pattern).toBe('path');
    expect(choosePattern(g, many, 360, 1, 'rich', off).pattern).toBe('grouped-list');
  });
});

describe('layoutFloor', () => {
  it('lays out the sample Classroom the same way every time', () => {
    const a = layoutFloor(classroom());
    expect(layoutFloor(classroom())).toEqual(a);
    expect(a.tier).toBe('dense');
    expect(a.readingOrder.slice(0, 3)).toEqual(['roll', 'marks', 'notes']);
    expect(printFloor(a)).toContain('Daily tasks [lamp]');
  });

  it('keeps the first screen a run from the top, even with large text and the keyboard up', () => {
    const tree = layoutFloor(classroom({ space: { ...phone, fontScale: 1.5, keyboard: 300 } }));
    const groups = tree.root.children.flatMap((a) => a.children).map((g) => g.placement);
    const firstBelow = groups.indexOf('below');
    expect(firstBelow).toBeGreaterThan(0);
    expect(groups.slice(firstBelow).every((p) => p === 'below')).toBe(true);
    expect(tree.chrome.hidden).toContain('stripe');
  });

  it('folds pieces past the tier cap behind See all', () => {
    const tree = layoutFloor(classroom({ room: 'self' }));
    const lessons = tree.root.children.flatMap((a) => a.children).find((g) => g.id === 'lessons');
    expect(lessons?.children.filter((c) => c.placement === 'folded')).toHaveLength(6);
  });

  it('picks cheaper forms when over the budget', () => {
    const tree = layoutFloor(
      classroom({ controls: { detail: 'rich', motion: 'full', costBudget: 60 } }),
    );
    const lessons = tree.root.children.flatMap((a) => a.children).find((g) => g.id === 'lessons');
    expect(lessons?.pattern).toBe('grouped-list');
  });

  it('never moves more than the person, the world and the verger allow', () => {
    expect(
      layoutFloor(classroom({ controls: { detail: 'rich', motion: 'none' } })).root.motion,
    ).toBe('none');
    expect(layoutFloor(classroom({ world: { motion: 'reduced' } })).root.motion).toBe('reduced');
    expect(
      layoutFloor(classroom({ controls: { detail: 'essential', motion: 'full' } })).root.motion,
    ).toBe('none');
  });

  it('becomes a board on wide screens with three or more areas', () => {
    const input = classroom({
      space: { ...phone, width: 1300, height: 900 },
      areas: [...classroom().areas, { id: 'outlook', label: 'Outlook' }],
      groups: [...classroom().groups, { id: 'news', label: 'News', area: 'outlook', job: 'act' }],
      pieces: [...classroom().pieces, piece('n1', 'news')],
    });
    expect(layoutFloor(input).root.why).toContain('areas side by side as a board');
  });
});

describe('lintFloor', () => {
  it('passes the sample Classroom', () => {
    expect(lintFloor(layoutFloor(classroom()), phone)).toEqual([]);
  });

  it('finds small targets, tasks in shelves, words only in tooltips and two lamps', () => {
    const input = classroom();
    const pieces = input.pieces.map((p) =>
      p.id === 'lesson-a'
        ? {
            ...p,
            task: true,
            fit: { ...card, min: { h: 36 } },
            parts: [{ kind: 'tooltip' as const, carriesNeededWords: true }],
          }
        : p.id === 'notes'
          ? { ...p, lit: true }
          : p,
    );
    const rules = lintFloor(layoutFloor({ ...input, pieces }), phone).map((f) => f.rule);
    expect(rules).toEqual(
      expect.arrayContaining(['target-size', 'task-hidden', 'tooltip-words', 'one-lit']),
    );
  });
});

describe('piecesFromLayout', () => {
  const surfaces = [
    {
      id: 'roll',
      label: 'Roll call',
      group: 'daily',
      defaultArea: 'today' as const,
      presentation: 'available' as const,
      fit: card,
      task: true,
      lit: true,
    },
    {
      id: 'reports',
      label: 'Reports',
      group: 'daily',
      defaultArea: 'work' as const,
      presentation: 'locked' as const,
      fit: card,
      task: true,
    },
    {
      id: 'secret',
      label: 'Secret',
      group: 'daily',
      defaultArea: 'work' as const,
      presentation: 'hidden' as const,
      fit: card,
    },
    {
      id: 'notes',
      label: 'Notes',
      group: 'daily',
      defaultArea: 'work' as const,
      presentation: 'available' as const,
      fit: card,
    },
  ];
  it("draws only what SanctuaryFeature allows and the person did not hide, in the person's order and areas", () => {
    const { pieces, areaOf } = piecesFromLayout(surfaces, {
      order: ['notes', 'roll'],
      hidden: [],
      pinned: ['notes'],
      zoneBySurface: { notes: 'today' },
    });
    expect(pieces.map((p) => p.id)).toEqual(['roll', 'reports', 'notes']);
    expect(pieces.find((p) => p.id === 'notes')).toMatchObject({ pinned: true, savedIndex: 0 });
    expect(pieces.find((p) => p.id === 'reports')).toMatchObject({
      task: false,
      roleImportance: 0.5,
    });
    expect(areaOf.notes).toBe('today');
  });
  it('keys a saved layout per room and perspective', () => {
    expect(floorLayoutId('workspace', 'bond-royal')).not.toBe(
      floorLayoutId('workspace', 'bond-visakha'),
    );
  });
});
