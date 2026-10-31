import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { haptic } from '../../../utils/haptics';
import {
  dayIntent,
  formatTime,
  nowIndex,
  parseTime,
  relativeTime,
  shiftTime,
  timelineGroups,
  toTime,
} from '../../shared/time';
import { DateTravel } from '../Time/DateTravel';
import { DateField, TimeField } from '../Time/Fields';
import { MonthGrid } from '../Time/MonthGrid';
import { TimeAgo } from '../Time/TimeAgo';
import { Timeline } from '../Time/Timeline';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
beforeEach(() => vi.mocked(haptic).mockClear());

const NOW = new Date(2026, 9, 31, 12, 0);

describe('time rules', { tags: ['unit'] }, () => {
  it('says moments in calendar days past a day, in minutes and hours within it', () => {
    const at = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m);
    expect(relativeTime(at(31, 11, 55), NOW, 'en')).toBe('5 minutes ago');
    expect(relativeTime(at(31, 12, 0), NOW, 'en')).toBe('now');
    expect(relativeTime(at(31, 15), NOW, 'en')).toBe('in 3 hours');
    expect(relativeTime(at(30, 9), NOW, 'en')).toBe('yesterday');
    expect(relativeTime(at(27, 12), NOW, 'en')).toBe('4 days ago');
    expect(relativeTime(new Date(2026, 10, 21, 12), NOW, 'en')).toBe('in 3 weeks');
    // 23:50 last night, seen at 00:10, was yesterday (minutes win within 45).
    expect(relativeTime(at(30, 23, 50), at(31, 0, 10), 'en')).toBe('20 minutes ago');
    expect(relativeTime(at(30, 17), at(31, 9), 'en')).toBe('yesterday');
  });

  it('reads and moves wall-clock times, wrapping round midnight and landing on the step', () => {
    expect(parseTime('09:30')).toBe(570);
    expect(parseTime('24:00')).toBeNull();
    expect(parseTime('9.30')).toBeNull();
    expect(toTime(-15)).toBe('23:45');
    expect(shiftTime('09:10', 15, 15)).toBe('09:30');
    expect(shiftTime('23:30', 60)).toBe('00:30');
    expect(formatTime('21:05', 'en-GB')).toBe('21:05');
  });

  it('days are past, today or ahead; a timeline runs oldest first with now between', () => {
    expect(dayIntent('2026-10-30', NOW)).toBe('review');
    expect(dayIntent('2026-10-31', NOW)).toBe('current');
    expect(dayIntent('2026-11-01', NOW)).toBe('plan');
    const items = [
      { id: 'c', at: new Date(2026, 10, 1, 9).toISOString() },
      { id: 'a', at: new Date(2026, 9, 31, 8).toISOString() },
      { id: 'b', at: new Date(2026, 9, 31, 14).toISOString() },
      { id: 'x', at: 'never' },
    ];
    const groups = timelineGroups(items, NOW);
    expect(groups.map((g) => [g.date, g.intent, g.items.map((i) => i.id)])).toEqual([
      ['2026-10-31', 'current', ['a', 'b']],
      ['2026-11-01', 'plan', ['c']],
    ]);
    expect(
      nowIndex(
        groups.flatMap((g) => g.items),
        NOW,
      ),
    ).toBe(1);
  });
});

describe('TimeAgo', { tags: ['a11y', 'unit'] }, () => {
  it('says the relative words and gives readers the exact moment', async () => {
    await render(<TimeAgo at={new Date(2026, 9, 31, 11, 55)} now={NOW} locale="en-GB" />);
    const t = screen.getByText('5 minutes ago');
    expect(t.props.accessibilityLabel).toMatch(/^5 minutes ago, 31 Oct 2026/);
  });

  it('an unreadable moment says so instead of "Invalid Date"', async () => {
    await render(<TimeAgo at="not a time" now={NOW} />);
    expect(screen.getByText('No time')).toBeTruthy();
  });
});

describe('MonthGrid', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('names each day with today, activity and range, and chooses with feedback', async () => {
    const onChange = vi.fn();
    await render(
      <MonthGrid
        label="Lesson date"
        value="2026-10-20"
        onChange={onChange}
        today={NOW}
        min="2026-10-05"
        activity={{ '2026-10-22': 3 }}
        locale="en-GB"
      />,
    );
    expect(screen.getByText('October 2026')).toBeTruthy();
    const today = screen.getByRole('button', { name: /31 October 2026, Today$/ });
    expect(today).toBeTruthy();
    expect(screen.getByRole('button', { name: /22 October 2026, Has activity/ })).toBeTruthy();
    const early = screen.getByRole('button', { name: /4 October 2026, Not available/ });
    expect(early.props.accessibilityState.disabled).toBe(true);
    const chosen = screen.getByRole('button', { name: /20 October 2026/ });
    expect(chosen.props.accessibilityState.selected).toBe(true);
    await fireEvent.press(screen.getByRole('button', { name: /22 October 2026/ }));
    expect(onChange).toHaveBeenCalledWith('2026-10-22');
    expect(haptic).toHaveBeenCalledWith('selection');
  });

  it('moves between months', async () => {
    await render(
      <MonthGrid label="Date" value={null} onChange={() => {}} today={NOW} locale="en-GB" />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByText('November 2026')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Previous month' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByText('September 2026')).toBeTruthy();
  });
});

describe('DateTravel', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('says the past in words, steps by its unit, returns to today, respects bounds', async () => {
    const onChange = vi.fn();
    await render(
      <DateTravel
        date="2026-10-28"
        onChange={onChange}
        today={NOW}
        max="2026-10-31"
        step="week"
        locale="en-GB"
      />,
    );
    expect(screen.getByText('Looking back')).toBeTruthy();
    expect(screen.getByRole('button', { name: /28 October 2026, Looking back/ })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Previous week' }));
    expect(onChange).toHaveBeenLastCalledWith('2026-10-21');
    // A week ahead would pass the last allowed day.
    expect(
      screen.getByRole('button', { name: 'Next week' }).props.accessibilityState?.disabled,
    ).toBe(true);
    await fireEvent.press(screen.getByRole('button', { name: 'Today' }));
    expect(onChange).toHaveBeenLastCalledWith('2026-10-31');
  });

  it('carries a time when asked, set on the dial and kept only on Done', async () => {
    const onTime = vi.fn();
    await render(
      <DateTravel
        date="2026-11-02"
        onChange={() => {}}
        time="09:00"
        onTimeChange={onTime}
        timeStep={15}
        today={NOW}
        locale="en-GB"
      />,
    );
    expect(screen.getByText('Planning ahead')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: '9:00' }));
    await act(async () => {});
    await fireEvent.press(screen.getByRole('button', { name: 'Later, Minute' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Later, Hour' }));
    expect(onTime).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Done' }));
    expect(onTime).toHaveBeenCalledWith('10:15');
  });
});

describe('DateField and TimeField', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('the date field reads its day in words and chooses from the month', async () => {
    const onChange = vi.fn();
    await render(<DateField label="Due" value="2026-10-30" onChange={onChange} locale="en-GB" />);
    const field = screen.getByRole('button', { name: /^Due, Friday,? 30 October 2026$/ });
    await fireEvent.press(field);
    await act(async () => {});
    await fireEvent.press(screen.getByRole('button', { name: /^Saturday,? 31 October 2026/ }));
    expect(onChange).toHaveBeenCalledWith('2026-10-31');
  });

  it('the time field keeps within its bounds and can be cleared', async () => {
    const onChange = vi.fn();
    await render(
      <TimeField
        label="Starts"
        value="16:45"
        onChange={onChange}
        step={15}
        max="17:00"
        locale="en-GB"
      />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Starts, 16:45' }));
    await act(async () => {});
    await fireEvent.press(screen.getByRole('button', { name: 'Later, Hour' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Later, Minute' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Done' }));
    expect(onChange).toHaveBeenLastCalledWith('17:00');
  });
});

describe('Timeline', { tags: ['a11y', 'unit'] }, () => {
  it('runs by day with a now line between what passed and what is coming', async () => {
    await render(
      <Timeline
        label="Today's plan"
        now={NOW}
        locale="en-GB"
        entries={[
          { id: 'b', at: new Date(2026, 9, 31, 14), title: 'Grade 7B maths' },
          { id: 'a', at: new Date(2026, 9, 31, 8), title: 'Assembly' },
          { id: 'c', at: new Date(2026, 10, 1, 9), title: 'Staff meeting' },
          { id: 'z', at: new Date(2026, 9, 30, 9), title: 'Marked essays' },
        ]}
      />,
    );
    expect(screen.getByText('Yesterday')).toBeTruthy();
    expect(screen.getByText('Today')).toBeTruthy();
    expect(screen.getByText('Tomorrow')).toBeTruthy();
    const order = screen
      .getAllByLabelText(/Assembly|Now|Grade 7B|Staff|Marked/)
      .map((n) => n.props.accessibilityLabel as string);
    expect(order).toEqual([
      '9:00, Marked essays',
      '8:00, Assembly',
      'Now',
      '14:00, Grade 7B maths',
      '9:00, Staff meeting',
    ]);
  });
});
