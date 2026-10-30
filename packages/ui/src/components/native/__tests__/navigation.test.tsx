import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { describe, expect, it, vi } from 'vitest';
import { alpha } from '../../../theme/color';
import { WorldScope } from '../../../theme/native';
import { resolveWorld } from '../../../theme/resolve';
import { WORLD_IDS } from '../../../theme/worlds';
import { SegmentedControl } from '../Segmented/SegmentedControl';
import { Tabs } from '../Tabs/Tabs';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));

function flat(style: unknown) {
  return StyleSheet.flatten(style as never) ?? {};
}

const VIEWS = [
  { value: 'overview', label: 'Overview' },
  { value: 'students', label: 'Students' },
  { value: 'notes', label: 'Notes', disabled: true },
] as const;

describe('Tabs', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('is a named tablist; the selected tab and its panel are announced', async () => {
    const onChange = vi.fn();
    await render(
      <Tabs label="Class views" value="overview" tabs={VIEWS} onChange={onChange}>
        <Text>Overview content</Text>
      </Tabs>,
    );
    expect(screen.getByLabelText('Class views').props.role).toBe('tablist');
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.props['aria-selected'])).toEqual([true, false, false]);
    expect(screen.getByText('Overview content').parent?.props.role).toBe('tabpanel');
    await fireEvent.press(screen.getByRole('tab', { name: 'Students' }));
    expect(onChange).toHaveBeenCalledWith('students');
    await fireEvent.press(screen.getByRole('tab', { name: 'Notes' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('wears each world’s selected chip look', async () => {
    for (const id of WORLD_IDS) {
      const { unmount } = await render(
        <WorldScope world={id} phase="morning" mode="light">
          <Tabs label="Views" value="overview" tabs={VIEWS} onChange={() => {}} />
        </WorldScope>,
      );
      const w = resolveWorld(id, 'morning', 'light');
      const { rest, selected } = w.recipes.chip;
      // The look is painted on a layer inside the tab so it can glide (living light);
      // a state with no fill holds the other's colour at zero.
      const paint = screen
        .getByRole('tab', { name: 'Overview' })
        .children.flatMap((c) => (typeof c === 'string' ? [] : [c]))
        .find((c) => c.props.pointerEvents === 'none');
      expect(flat(paint?.props.style).backgroundColor).toBe(
        selected.fill ?? alpha(rest.fill ?? w.tokens.ink, 0),
      );
      await unmount();
    }
  });
});

describe('SegmentedControl', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('is a named radio group; the chosen segment is lifted in the raised surface', async () => {
    const onChange = vi.fn();
    await render(
      <SegmentedControl
        label="Range"
        value="day"
        options={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
        ]}
        onChange={onChange}
      />,
    );
    expect(screen.getByLabelText('Range').props.role).toBe('radiogroup');
    const day = screen.getByRole('radio', { name: 'Day' });
    expect(day.props['aria-checked']).toBe(true);
    const raised = resolveWorld('sanctuary', 'morning', 'light').recipes.surface.raised;
    expect(flat(day.props.style).backgroundColor).toBe(raised.fill);
    await fireEvent.press(screen.getByRole('radio', { name: 'Week' }));
    expect(onChange).toHaveBeenCalledWith('week');
  });
});
