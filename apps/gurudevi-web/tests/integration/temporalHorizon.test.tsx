import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TemporalHorizon } from '../../app/(sanctuary)/components/workbench/TemporalHorizon';
import { resolveTemporalCoordinates } from '@repo/core/logic/workbench';

describe('TemporalHorizon compact date context (G1)', () => {
  const fixedNow = new Date(2026, 9, 18, 12, 0, 0); // Sunday Oct 18, 2026
  const todayStr = '2026-10-18';

  it('shows today once with its selected date and no reset action', () => {
    const coords = resolveTemporalCoordinates(todayStr, {
      domain: 'self',
      referenceNow: fixedNow,
    });

    render(
      <TemporalHorizon
        dateLabel={coords.dateLabel}
        intent={coords.intent}
        orientation={coords.orientationLabel}
        slots={coords.slots}
        activityDensity={{ '2026-10-18': 2, '2026-10-15': 1 }}
        onToday={vi.fn()}
      />,
    );

    expect(screen.getAllByText('Today')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: /Today/i })).toBeNull();
    expect(screen.getByRole('button', { name: 'Choose date, Sunday, October 18, 2026' })).toBeDefined();
    expect(screen.getByText('Sun, Oct 18')).toBeDefined();
    expect(screen.getByText('2 items')).toBeDefined();
  });

  it('renders a past date with a compact phase label and a return-to-today action', () => {
    const pastDate = '2026-10-15';
    const coords = resolveTemporalCoordinates(pastDate, {
      domain: 'self',
      referenceNow: fixedNow,
    });
    const onToday = vi.fn();

    render(
      <TemporalHorizon
        dateLabel={coords.dateLabel}
        intent={coords.intent}
        orientation={coords.orientationLabel}
        slots={coords.slots}
        onToday={onToday}
      />,
    );

    expect(screen.getByRole('button', { name: 'Choose date, Thursday, October 15, 2026' })).toBeDefined();
    expect(screen.getByText('Review')).toBeDefined();
    expect(screen.getByText('3 days ago')).toBeDefined();

    const todayButton = screen.getByRole('button', { name: 'Today' });

    fireEvent.click(todayButton);
    expect(onToday).toHaveBeenCalledTimes(1);
  });

  it('renders natural relative intervals across past and future (a week ago, a month ago, in a week)', () => {
    // 7 days ago: Oct 11, 2026
    const weekAgoCoords = resolveTemporalCoordinates('2026-10-11', {
      domain: 'self',
      referenceNow: fixedNow,
    });
    const { unmount: unmount1 } = render(
      <TemporalHorizon
        dateLabel={weekAgoCoords.dateLabel}
        intent={weekAgoCoords.intent}
        slots={weekAgoCoords.slots}
      />,
    );
    expect(screen.getByText('A week ago')).toBeDefined();
    unmount1();

    // 30 days ago: Sep 18, 2026
    const monthAgoCoords = resolveTemporalCoordinates('2026-09-18', {
      domain: 'self',
      referenceNow: fixedNow,
    });
    const { unmount: unmount2 } = render(
      <TemporalHorizon
        dateLabel={monthAgoCoords.dateLabel}
        intent={monthAgoCoords.intent}
        slots={monthAgoCoords.slots}
      />,
    );
    expect(screen.getByText('A month ago')).toBeDefined();
    unmount2();

    // In a week: Oct 25, 2026
    const futureWeekCoords = resolveTemporalCoordinates('2026-10-25', {
      domain: 'self',
      referenceNow: fixedNow,
    });
    const { unmount: unmount3 } = render(
      <TemporalHorizon
        dateLabel={futureWeekCoords.dateLabel}
        intent={futureWeekCoords.intent}
        slots={futureWeekCoords.slots}
      />,
    );
    expect(screen.getByText('In a week')).toBeDefined();
    unmount3();
  });

  it('fires onSelectDate when stepper arrows are clicked', () => {
    const coords = resolveTemporalCoordinates(todayStr, {
      domain: 'self',
      referenceNow: fixedNow,
    });
    const onSelectDate = vi.fn();

    render(
      <TemporalHorizon
        dateLabel={coords.dateLabel}
        intent={coords.intent}
        slots={coords.slots}
        onSelectDate={onSelectDate}
      />,
    );

    const prevBtn = screen.getByRole('button', { name: /Previous day/i });
    fireEvent.click(prevBtn);
    expect(onSelectDate).toHaveBeenCalledWith('2026-10-17');

    const nextBtn = screen.getByRole('button', { name: /Next day/i });
    fireEvent.click(nextBtn);
    expect(onSelectDate).toHaveBeenCalledWith('2026-10-19');
  });

  it('opens the calendar from the selected date and allows choosing a day', () => {
    const coords = resolveTemporalCoordinates(todayStr, {
      domain: 'self',
      referenceNow: fixedNow,
    });
    const onSelectDate = vi.fn();

    render(
      <TemporalHorizon
        dateLabel={coords.dateLabel}
        intent={coords.intent}
        slots={coords.slots}
        onSelectDate={onSelectDate}
      />,
    );

    // Modal is closed initially
    expect(screen.queryByRole('dialog')).toBeNull();

    const calendarBtn = screen.getByRole('button', { name: /Choose date/i });
    fireEvent.click(calendarBtn);

    // Modal is now open
    const dialog = screen.getByRole('dialog', { name: /Monthly temporal calendar/i });
    expect(dialog).toBeDefined();

    // Quick jump pills are visible
    const yesterdayPill = screen.getByRole('button', { name: /Yesterday/i });
    expect(yesterdayPill).toBeDefined();

    // Click a day in the month grid (e.g. October 5, 2026)
    const day5Cell = screen.getByRole('button', { name: /2026-10-05/ });
    fireEvent.click(day5Cell);

    expect(onSelectDate).toHaveBeenCalledWith('2026-10-05');
    // Modal automatically closes after selection
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps the selected date and day stepping visible without an extra expansion control', () => {
    const coords = resolveTemporalCoordinates(todayStr, {
      domain: 'self',
      referenceNow: fixedNow,
    });

    render(
      <TemporalHorizon
        dateLabel={coords.dateLabel}
        intent={coords.intent}
        slots={coords.slots}
      />,
    );

    expect(screen.getByRole('button', { name: /Choose date/i })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Previous day' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Next day' })).toBeDefined();
    expect(screen.queryByRole('button', { name: /temporal details/i })).toBeNull();
  });
});
