import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { describe, expect, it, vi } from 'vitest';
import { WorldScope } from '../../../theme/native';
import { resolveWorld } from '../../../theme/resolve';
import { WORLD_IDS } from '../../../theme/worlds';
import { gapFor, space } from '../../../tokens/space';
import { Group } from '../Group/Group';
import { Inline, Stack } from '../Layout/Layout';
import { Row } from '../Row/Row';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));

const flat = (style: unknown) => StyleSheet.flatten(style as never) ?? {};

type Node = typeof screen.root;
function hostNodes(node: Node | null): NonNullable<Node>[] {
  if (!node) return [];
  return [node, ...node.children.flatMap((c) => (typeof c === 'string' ? [] : hostNodes(c)))];
}

describe('spacing relations', { tags: ['unit'] }, () => {
  it('order is inside < between < group < section, in both densities', () => {
    for (const d of ['compact', 'comfortable'] as const) {
      expect(space.inside[d]).toBeLessThan(space.between[d]);
      expect(space.between[d]).toBeLessThan(space.group[d]);
      expect(space.group[d]).toBeLessThan(space.section[d]);
    }
  });

  it('larger text opens space, but never past one and a half', () => {
    expect(gapFor('group', 'comfortable', 1.3)).toBe(Math.round(24 * 1.3));
    expect(gapFor('group', 'comfortable', 3)).toBe(36);
    expect(gapFor('group', 'comfortable', 0.8)).toBe(24);
  });
});

describe('Stack, Inline and Group', { tags: ['a11y', 'unit'] }, () => {
  it('Stack and Inline gap by relation', async () => {
    await render(
      <>
        <Stack testID="s" gap="group" />
        <Inline testID="i" density="compact" wrap={false} />
      </>,
    );
    expect(flat(screen.getByTestId('s').props.style)).toMatchObject({
      gap: gapFor('group'),
      alignItems: 'stretch',
    });
    expect(flat(screen.getByTestId('i').props.style)).toMatchObject({
      flexDirection: 'row',
      flexWrap: 'nowrap',
      gap: gapFor('between', 'compact'),
    });
  });

  it('Group keeps one header, one surface and hairlines only between rows, in every world', async () => {
    for (const id of WORLD_IDS) {
      const g = resolveWorld(id, 'morning', 'light').recipes.group;
      const { unmount } = await render(
        <WorldScope world={id} phase="morning" mode="light">
          <Group label="Look and light" footer="Applies everywhere." testID="g">
            <Row label="World" detail="Sanctuary" />
            <Row label="Text size" detail="Comfortable" />
            <Row label="Motion" detail="Calm" />
          </Group>
        </WorldScope>,
      );
      expect(screen.getAllByRole('header')).toHaveLength(1);
      expect(screen.getByTestId('g').props.accessibilityLabel).toBe('Look and light');
      const hairlines = hostNodes(screen.root).filter(
        (n) =>
          n.props.importantForAccessibility === 'no-hide-descendants' &&
          flat(n.props.style).height === g.divider.width &&
          flat(n.props.style).backgroundColor === g.divider.color,
      );
      expect(hairlines, id).toHaveLength(2);
      expect(screen.getByText('Applies everywhere.')).toBeTruthy();
      await unmount();
    }
  });
});
