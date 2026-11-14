import { fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { haptic } from '../../../utils/haptics';
import { launcherSections } from '../../shared/basics';
import { Launcher } from '../Launcher/Launcher';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));
beforeEach(() => vi.mocked(haptic).mockClear());

const ITEMS = [
  { id: 'att', title: 'Attendance', description: 'Mark today', group: 'Teaching' },
  { id: 'marks', title: 'Marks', description: 'Enter scores', group: 'Teaching', badge: '3 due' },
  { id: 'notes', title: 'Notes', description: 'Private notes' },
  { id: 'fees', title: 'Fees', description: 'Payments and receipts', group: 'Records' },
];

describe('launcher sections', { tags: ['unit'] }, () => {
  it('Recent first, then kinds in listed order, ungrouped under More', () => {
    const sections = launcherSections(ITEMS, '', ['fees', 'gone']);
    expect(sections.map((s) => [s.title, s.items.map((i) => i.id)])).toEqual([
      ['Recent', ['fees']],
      ['Teaching', ['att', 'marks']],
      ['Records', ['fees']],
      ['More', ['notes']],
    ]);
  });

  it('search needs every word, across title, description and kind; hides Recent', () => {
    const found = launcherSections(ITEMS, 'teaching scores', ['fees']);
    expect(found.map((s) => s.items.map((i) => i.id))).toEqual([['marks']]);
    expect(launcherSections(ITEMS, 'nothing here')).toEqual([]);
  });
});

describe('Launcher', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('names tiles with badge and purpose, opens on press, keeps on long press', async () => {
    const onOpen = vi.fn();
    const onKeep = vi.fn();
    const announce = vi.fn();
    AccessibilityInfo.announceForAccessibility = announce;
    await render(
      <Launcher label="Workspace tools" items={ITEMS} onOpen={onOpen} onKeep={onKeep} />,
    );
    expect(screen.getByText('Teaching')).toBeTruthy();
    const marks = screen.getByRole('button', { name: 'Marks, 3 due, Enter scores' });
    await fireEvent.press(marks);
    expect(onOpen).toHaveBeenCalledWith('marks');
    await fireEvent(marks, 'longPress');
    expect(onKeep).toHaveBeenCalledWith('marks');
    expect(announce).toHaveBeenCalledWith('Marks kept in tabs');
    expect(marks.props.accessibilityActions).toEqual([{ name: 'keep', label: 'Keep in tabs' }]);
  });

  it('search narrows the tiles, says the count, and says when nothing matches', async () => {
    await render(<Launcher label="Tools" items={ITEMS} onOpen={() => {}} />);
    await fireEvent.changeText(screen.getByLabelText('Search rooms and tools'), 'fee');
    expect(screen.getByText('1 result')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^Attendance/ })).toBeNull();
    await fireEvent.changeText(screen.getByLabelText('Search rooms and tools'), 'zzz');
    expect(screen.getByText('Nothing matches. Try another word.')).toBeTruthy();
  });
});
