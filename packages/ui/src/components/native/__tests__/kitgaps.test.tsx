import { fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';
import { AccessibilityInfo, Text } from 'react-native';
import { describe, expect, it, vi } from 'vitest';
import { miniChartShape } from '../../../theme/miniChart';
import { WorldScope } from '../../../theme/native';
import { actionsThatFit } from '../../../theme/taskToolbar';
import { WORLD_IDS } from '../../../theme/worlds';
import { Autocomplete } from '../Autocomplete/Autocomplete';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import { MiniChart } from '../MiniChart/MiniChart';
import { SplitButton } from '../SplitButton/SplitButton';
import { TaskToolbar } from '../TaskToolbar/TaskToolbar';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));
vi.mock('react-native-worklets', () => ({
  scheduleOnRN: (fn: (...args: unknown[]) => void, ...args: unknown[]) => fn(...args),
}));
// The test renderer has no window to measure; the popover's placement is tested on its own.
vi.mock('../Popover/Popover', async () => {
  const { View } = await import('react-native');
  return {
    Popover: ({
      open,
      label,
      role,
      children,
    }: {
      open: boolean;
      label: string;
      role?: string;
      children: React.ReactNode;
    }) =>
      open ? (
        <View accessibilityLabel={label} role={role as never}>
          {children}
        </View>
      ) : null,
  };
});
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const wrap = (n: React.ReactNode) => (
  <WorldScope world={WORLD_IDS[0]!} phase="morning" mode="light">
    {n}
  </WorldScope>
);

const Glyph = () => null;

describe('SplitButton', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('is two stops: the action, and its relatives behind the arrow', async () => {
    const send = vi.fn();
    const later = vi.fn();
    await render(
      wrap(
        <SplitButton
          label="Send"
          onPress={send}
          moreLabel="More ways to send"
          more={[{ key: 'later', label: 'Send later', onSelect: later }]}
        />,
      ),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Send' }));
    expect(send).toHaveBeenCalledTimes(1);
    const arrow = screen.getByLabelText('More ways to send');
    expect(arrow.props.accessibilityState.expanded).toBe(false);
    await fireEvent.press(arrow);
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Send later' }));
    expect(later).toHaveBeenCalledTimes(1);
  });
});

describe('ContextMenu', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  const items = [
    { key: 'open', label: 'Open', onSelect: vi.fn() },
    { key: 'leave', label: 'Leave class', onSelect: vi.fn(), destructive: true },
    { key: 'off', label: 'Archived', onSelect: vi.fn(), disabled: true },
  ];

  it('opens its menu on a long press', async () => {
    await render(
      wrap(
        <ContextMenu label="Actions for 7 Maths" items={items} accessibilityLabel="7 Maths">
          <Text>7 Maths</Text>
        </ContextMenu>,
      ),
    );
    expect(screen.queryByRole('menuitem')).toBeNull();
    await fireEvent(screen.getByLabelText('7 Maths'), 'longPress');
    expect(screen.getAllByRole('menuitem').length).toBe(3);
  });

  it('gives screen readers every usable action without a long press', async () => {
    const tap = vi.fn();
    await render(
      wrap(
        <ContextMenu
          label="Actions for 7 Maths"
          items={items}
          onPress={tap}
          accessibilityLabel="7 Maths"
        >
          <Text>7 Maths</Text>
        </ContextMenu>,
      ),
    );
    const el = screen.getByLabelText('7 Maths');
    expect(el.props.accessibilityActions.map((a: { name: string }) => a.name)).toEqual([
      'activate',
      'longpress',
      'item:open',
      'item:leave',
    ]);
    await fireEvent(el, 'accessibilityAction', { nativeEvent: { actionName: 'item:leave' } });
    expect(items[1]!.onSelect).toHaveBeenCalled();
    await fireEvent(el, 'accessibilityAction', { nativeEvent: { actionName: 'activate' } });
    expect(tap).toHaveBeenCalled();
  });
});

describe('TaskToolbar', { tags: ['a11y', 'unit'] }, () => {
  const actions = ['Mark present', 'Message', 'Move to class', 'Remove'].map((label, i) => ({
    key: String(i),
    label,
    icon: Glyph,
    onPress: vi.fn(),
    destructive: label === 'Remove',
  }));

  it('folds what does not fit behind More, keeping order', () => {
    expect(actionsThatFit(actions, 2000, { touchMin: 48 })).toEqual({ shown: 4, iconsOnly: false });
    const narrow = actionsThatFit(actions, 160, { touchMin: 48 });
    expect(narrow.iconsOnly).toBe(true);
    expect(narrow.shown).toBe(2);
    expect(actionsThatFit(actions, 600, { touchMin: 48, fontScale: 2 }).shown).toBeLessThan(4);
  });

  it('is a named toolbar and nothing is lost', async () => {
    await render(wrap(<TaskToolbar label="Actions for 3 students" actions={actions} />));
    expect(screen.getByLabelText('Actions for 3 students').props.accessibilityRole).toBe('toolbar');
    const shown = actions.filter((a) => screen.queryByLabelText(a.label));
    if (shown.length < actions.length) {
      await fireEvent.press(screen.getByLabelText('More'));
      expect(screen.getAllByRole('menuitem').length).toBe(actions.length - shown.length);
    }
  });
});

describe('Autocomplete', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  const NAMES = [
    { value: 'a', label: 'Amaya Perera', hint: 'Grade 7' },
    { value: 'b', label: 'Amal Silva' },
    { value: 'c', label: 'Nimal Fernando' },
  ];
  function Harness({ onPick }: { onPick: (v: string) => void }) {
    const [q, setQ] = useState('');
    return (
      <Autocomplete
        label="Student"
        query={q}
        onQueryChange={setQ}
        suggestions={NAMES.filter((n) => q && n.label.toLowerCase().includes(q.toLowerCase()))}
        onPick={onPick}
      />
    );
  }

  it('suggests as you type, speaks the count, and picks', async () => {
    const announce = vi.spyOn(AccessibilityInfo, 'announceForAccessibility');
    const onPick = vi.fn();
    await render(wrap(<Harness onPick={onPick} />));
    const field = screen.getByLabelText('Student');
    await fireEvent(field, 'focus');
    await fireEvent.changeText(field, 'ama');
    expect(screen.getByText('Amaya Perera')).toBeTruthy();
    expect(screen.queryByText('Nimal Fernando')).toBeNull();
    expect(announce).toHaveBeenLastCalledWith('2 suggestions');
    await fireEvent(screen.getByLabelText('Amaya Perera'), 'pressIn');
    expect(onPick).toHaveBeenCalledWith('a');
  });

  it('says so when nothing matches', async () => {
    await render(wrap(<Harness onPick={vi.fn()} />));
    const field = screen.getByLabelText('Student');
    await fireEvent(field, 'focus');
    await fireEvent.changeText(field, 'zz');
    expect(screen.getByText('No matches')).toBeTruthy();
  });
});

describe('MiniChart', { tags: ['a11y', 'unit'] }, () => {
  it('is one image, read as its summary', async () => {
    await render(
      wrap(<MiniChart values={[82, 85, 91]} summary="Attendance rose from 82% to 91%" />),
    );
    expect(screen.getByRole('image', { name: 'Attendance rose from 82% to 91%' })).toBeTruthy();
  });

  it('shapes a line, bars and the marked point inside its box', () => {
    const s = miniChartShape([0, 5, 10], 100, 20);
    expect(s.line.startsWith('M')).toBe(true);
    expect(s.bars).toHaveLength(3);
    expect(s.mark).toEqual({ x: 98, y: 2 });
    for (const b of s.bars) expect(b.y + b.h).toBeLessThanOrEqual(20);
    expect(miniChartShape([], 100, 20).line).toBe('');
    expect(miniChartShape([4, 4], 100, 20).bars.every((b) => b.h >= 1)).toBe(true);
  });
});
