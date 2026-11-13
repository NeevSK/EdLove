import { layoutRoomFloor, ROOM_PLANS } from '@repo/core/logic/floor';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { worldFloorBias } from '../../../../theme/floorBias';
import { FLOOR_CSS } from '../../../../theme/floorCss';
import { floorFitOf, type KitPiece } from '../../../../theme/floorFit';
import { FloorView } from '../FloorView';

// react-dom ships no types in this package; the one function used is typed here.
const { renderToStaticMarkup } = (await import('react-dom/server' as string)) as {
  renderToStaticMarkup: (element: ReactElement) => string;
};

const room = (world: Parameters<typeof worldFloorBias>[0]) =>
  layoutRoomFloor({
    plan: ROOM_PLANS['community:everyone']!,
    fitOf: (kit) => floorFitOf(kit as KitPiece, 'web'),
    space: { width: 1280, height: 900, fontScale: 1, chrome: [] },
    controls: { detail: 'rich', motion: 'full' },
    world: worldFloorBias(world),
  }).tree;

describe('web FloorView', () => {
  it('draws every group as a named region with its pieces in reading order', () => {
    const tree = room('kele');
    const html = renderToStaticMarkup(
      <FloorView tree={tree} renderPiece={(p) => <span data-piece={p.id}>{p.label}</span>} />,
    );
    const drawn = [...html.matchAll(/data-piece="([^"]+)"/g)].map((m) => m[1] ?? '');
    const shown = tree.readingOrder.filter((id) => drawn.includes(id));
    expect(drawn.length).toBeGreaterThan(0);
    expect(drawn.filter((id) => shown.includes(id))).toEqual(shown);
    for (const area of tree.root.children)
      for (const g of area.children) expect(html).toContain(`>${g.label}</h3>`);
  });

  it('follows the world: a roomy world lays the same room out calmer', () => {
    expect(room('wewa').tier).toBe('calm');
    expect(room('spark').tier).toBe('dense');
  });

  it('takes colours from the world only', () => {
    expect(FLOOR_CSS).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\brgba?\(/);
  });
});
