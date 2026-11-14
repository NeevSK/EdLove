import { fireEvent, render, screen } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { contrastRatio } from '../../../theme/color';
import { resolveWorld } from '../../../theme/resolve';
import { WORLD_IDS } from '../../../theme/worlds';
import { haptic } from '../../../utils/haptics';
import { groupByDay } from '../../shared/notifications';
import { NotificationItem } from '../Shell/NotificationItem';
import { SwitchRow } from '../Shell/SwitchRow';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));
beforeEach(() => vi.mocked(haptic).mockClear());

describe('notification days', { tags: ['unit'] }, () => {
  it('groups by day, newest first: Today, Yesterday, then dates', () => {
    const now = new Date(2026, 9, 31, 12);
    const items = [
      { id: 'a', at: new Date(2026, 9, 29, 9).toISOString() },
      { id: 'b', at: new Date(2026, 9, 31, 8).toISOString() },
      { id: 'c', at: new Date(2026, 9, 30, 20).toISOString() },
      { id: 'd', at: 'not a date' },
    ];
    const groups = groupByDay(items, (i) => i.at, now, 'en-GB');
    expect(groups.map((g) => g.label)).toEqual(['Today', 'Yesterday', '29 October', '—']);
    expect(groups[0]?.items.map((i) => i.id)).toEqual(['b']);
  });
});

describe('NotificationItem', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('says Unread first, opens, and offers mark-as-read as an action', async () => {
    const onPress = vi.fn();
    const onMarkRead = vi.fn();
    await render(
      <NotificationItem
        title="New submission"
        body="Nimal, Grade 7B"
        time="9:41"
        unread
        onPress={onPress}
        onMarkRead={onMarkRead}
      />,
    );
    const item = screen.getByRole('button', {
      name: 'Unread, New submission, Nimal, Grade 7B, 9:41',
    });
    await fireEvent.press(item);
    expect(onPress).toHaveBeenCalled();
    expect(item.props.accessibilityActions).toEqual([{ name: 'markRead', label: 'Mark as read' }]);
    await fireEvent(item, 'accessibilityAction', { nativeEvent: { actionName: 'markRead' } });
    expect(onMarkRead).toHaveBeenCalled();
  });

  it('a read item says nothing extra and has no mark-read action', async () => {
    await render(
      <NotificationItem
        title="Attendance saved"
        time="Yesterday"
        unread={false}
        onMarkRead={() => {}}
      />,
    );
    const item = screen.getByLabelText('Attendance saved, Yesterday');
    expect(item.props.accessibilityActions).toBeUndefined();
  });
});

describe('SwitchRow', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('the whole row is one named switch, with its hint, that ticks', async () => {
    const onChange = vi.fn();
    await render(
      <SwitchRow
        label="Sound effects"
        hint="Quiet clicks and chimes"
        value={false}
        onChange={onChange}
      />,
    );
    const row = screen.getByRole('switch', { name: 'Sound effects' });
    expect(row.props['aria-checked']).toBe(false);
    expect(row.props.accessibilityHint).toBe('Quiet clicks and chimes');
    await fireEvent.press(row);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(haptic).toHaveBeenCalledWith('selection');
  });

  it('on and off are both visible against the page in every world (3:1)', () => {
    for (const id of WORLD_IDS)
      for (const mode of ['light', 'dark'] as const) {
        const w = resolveWorld(id, 'morning', mode);
        expect(
          contrastRatio(w.recipes.toggle.track.on, w.tokens.ground),
          `${id} ${mode} on`,
        ).toBeGreaterThanOrEqual(3);
        expect(
          contrastRatio(w.recipes.toggle.edge.color, w.tokens.ground),
          `${id} ${mode} off`,
        ).toBeGreaterThanOrEqual(3);
      }
  });
});
