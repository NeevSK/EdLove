import { layoutFloor, lintFloor, ROOM_PLANS, roomFloorInput } from '@repo/core/logic/floor';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { describe, expect, it, vi } from 'vitest';
import { floorFitOf, type KitPiece } from '../../../theme/floorFit';
import { WorldScope } from '../../../theme/native';
import { WORLD_IDS } from '../../../theme/worlds';
import { FloorInspector } from '../Floor/FloorInspector';
import { FloorView } from '../Floor/FloorView';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));

const tree = (width: number, height: number) =>
  layoutFloor(
    roomFloorInput({
      plan: ROOM_PLANS['workspace:teacher']!,
      fitOf: (k) => floorFitOf(k as KitPiece, 'android'),
      space: { width, height, fontScale: 1, chrome: [] },
      controls: { detail: 'rich', motion: 'full' },
    }),
  );

const wrap = (node: React.ReactNode) => (
  <WorldScope world={WORLD_IDS[0]} phase="morning" mode="light">
    {node}
  </WorldScope>
);

describe('FloorView', { tags: ['unit', 'a11y'] }, () => {
  it('draws pieces in reading order under named group headings', async () => {
    const t = tree(360, 700);
    await render(wrap(<FloorView tree={t} renderPiece={(p) => <Text>{p.label}</Text>} />));
    expect(screen.getAllByRole('header').map((h) => h.props.children)).toContain('Today');
    const drawn = screen
      .getAllByText(/.+/)
      .map((n) => n.props.children)
      .filter((c) => typeof c === 'string');
    const order = t.readingOrder.map(
      (id) => ROOM_PLANS['workspace:teacher']!.surfaces.find((x) => x.id === id)!.label,
    );
    expect(drawn.filter((d) => order.includes(d))).toEqual(order);
  });

  it('lays a wide tablet out as a board without losing a piece', async () => {
    const t = tree(1280, 800);
    await render(wrap(<FloorView tree={t} renderPiece={(p) => <Text>{p.label}</Text>} />));
    for (const id of t.readingOrder) {
      const label = ROOM_PLANS['workspace:teacher']!.surfaces.find((x) => x.id === id)!.label;
      expect(screen.getByText(label)).toBeTruthy();
    }
  });
});

describe('FloorInspector', { tags: ['unit'] }, () => {
  it('shows why each piece is where it is', async () => {
    const t = tree(360, 700);
    await render(wrap(<FloorInspector tree={t} findings={lintFloor(t)} />));
    expect(screen.getByText('holds the lamp')).toBeTruthy();
    expect(screen.getByText('No findings.')).toBeTruthy();
  });
});
