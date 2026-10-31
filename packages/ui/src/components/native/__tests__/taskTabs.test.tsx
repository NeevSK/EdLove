import { fireEvent, render, screen } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { haptic } from '../../../utils/haptics';
import { dropIndex } from '../../shared/agent';
import { TaskTabs } from '../Shell/TaskTabs';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));
beforeEach(() => vi.mocked(haptic).mockClear());

const TABS = [
  { id: 'a', title: 'Attendance' },
  { id: 'b', title: 'Marks' },
  { id: 'c', title: 'Notes' },
];

describe('drop rule', { tags: ['unit'] }, () => {
  it('lands a dragged tab before the first centre it passes', () => {
    const centres = new Map([
      ['a', 50],
      ['b', 150],
      ['c', 250],
    ]);
    expect(dropIndex('a', 120, centres, ['a', 'b', 'c'])).toBe(1);
    expect(dropIndex('a', 300, centres, ['a', 'b', 'c'])).toBe(2);
    expect(dropIndex('c', -230, centres, ['a', 'b', 'c'])).toBe(0);
    expect(dropIndex('x', 10, centres, ['a', 'b', 'c'])).toBeNull();
  });
});

describe('TaskTabs', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('a named tab list; Home first; the chosen tab is selected; choosing ticks', async () => {
    const onSelect = vi.fn();
    const onHome = vi.fn();
    await render(
      <TaskTabs
        label="Open workspace tasks"
        home={{ label: 'Open Home', selected: false, onPress: onHome }}
        tabs={TABS}
        activeId="b"
        onSelect={onSelect}
        onClose={() => {}}
        onReorder={() => {}}
      />,
    );
    expect(screen.getByLabelText('Open workspace tasks')).toBeTruthy();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.props.accessibilityLabel)).toEqual([
      'Open Home',
      'Attendance',
      'Marks',
      'Notes',
    ]);
    expect(screen.getByRole('tab', { name: 'Marks' }).props['aria-selected']).toBe(true);
    await fireEvent.press(screen.getByRole('tab', { name: 'Notes' }));
    expect(onSelect).toHaveBeenCalledWith('c');
    expect(haptic).toHaveBeenCalledWith('selection');
    await fireEvent.press(screen.getByRole('tab', { name: 'Open Home' }));
    expect(onHome).toHaveBeenCalled();
  });

  it('closes by name; screen readers move tabs with actions, within bounds', async () => {
    const onClose = vi.fn();
    const onReorder = vi.fn();
    await render(
      <TaskTabs
        label="Tasks"
        tabs={TABS}
        activeId="a"
        onSelect={() => {}}
        onClose={onClose}
        onReorder={onReorder}
      />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Close Marks' }));
    expect(onClose).toHaveBeenCalledWith('b');
    const handle = screen.getByRole('button', { name: 'Reorder Notes' });
    await fireEvent(handle, 'accessibilityAction', { nativeEvent: { actionName: 'moveEarlier' } });
    expect(onReorder).toHaveBeenCalledWith('c', 1);
    await fireEvent(handle, 'accessibilityAction', { nativeEvent: { actionName: 'moveLater' } });
    expect(onReorder).toHaveBeenCalledTimes(1);
  });

  it('draws nothing with no open tasks', async () => {
    await render(
      <TaskTabs
        label="Tasks"
        tabs={[]}
        activeId={null}
        onSelect={() => {}}
        onClose={() => {}}
        onReorder={() => {}}
      />,
    );
    expect(screen.queryByRole('tab')).toBeNull();
  });
});
