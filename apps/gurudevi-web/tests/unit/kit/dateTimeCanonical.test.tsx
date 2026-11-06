import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Date as DateComponent, Time, DateTimeCombo } from '@repo/ui/components/web';

describe('Date & Time Canonical UI Kit Components', () => {
  const fixedToday = '2026-11-01';

  it('renders Date Compact Minimal Pill form factor with stepping and relative intent', () => {
    const onSelect = vi.fn();
    render(
      <DateComponent
        formFactor="compact"
        date="2026-11-01"
        today={fixedToday}
        onSelectDate={onSelect}
      />,
    );

    expect(screen.getByText('Sun, Nov 1')).toBeDefined();
    const prevBtn = screen.getByRole('button', { name: 'Previous day' });
    fireEvent.click(prevBtn);
    expect(onSelect).toHaveBeenCalledWith('2026-10-31');
  });

  it('renders Date Inverted Full Floor Bar form factor with top date anchor and bottom intent track', () => {
    const onSelect = vi.fn();
    render(
      <DateComponent
        formFactor="full"
        date="2026-10-30"
        today={fixedToday}
        onSelectDate={onSelect}
      />,
    );

    // Intent track modes with minimal emojis & dual text
    expect(screen.getByText('Past')).toBeDefined();
    expect(screen.getByText('Today')).toBeDefined();
    expect(screen.getByText('Future')).toBeDefined();

    // Top row has clickable calendar icon on right & pure date heading
    expect(screen.getByRole('button', { name: 'Toggle calendar drawer' })).toBeDefined();
    expect(screen.getByText('Fri, Oct 30')).toBeDefined();

    // Lower row has date picker trigger
    expect(screen.getByRole('button', { name: 'Pick custom date' })).toBeDefined();
  });

  it('renders Date Medium Adaptive Window Bar form factor with day badge', () => {
    const onSelect = vi.fn();
    render(
      <DateComponent
        formFactor="medium"
        date="2026-11-01"
        today={fixedToday}
        onSelectDate={onSelect}
      />,
    );

    expect(screen.getByText('Sun, Nov 1')).toBeDefined();
    // In medium form factor, "Today" text was replaced with calendar day badge displaying "01"
    expect(screen.getByRole('button', { name: 'Selected day 01' })).toBeDefined();
    expect(screen.getByText('01')).toBeDefined();
  });

  it('renders Date Nano form factor with accessible metadata', () => {
    render(
      <DateComponent
        formFactor="nano"
        date="2026-11-01"
        today={fixedToday}
      />,
    );

    expect(screen.getByRole('button', { name: /Sun, Nov 1/ })).toBeDefined();
    expect(screen.getByText('01')).toBeDefined();
  });

  it('renders Time component and toggles 12h and 24h formats on click', () => {
    render(<Time time="14:30" format="24h" live={false} />);
    expect(screen.getByText('14:30')).toBeDefined();

    const timeBtn = screen.getByRole('button', { name: /Current time 14:30/i });
    fireEvent.click(timeBtn);
    expect(screen.getByText('02:30')).toBeDefined();
    expect(screen.getByText('PM')).toBeDefined();
  });

  it('renders DateTimeCombo master unified control', () => {
    render(
      <DateTimeCombo
        date="2026-11-01"
        time="10:00"
        today={fixedToday}
        formFactor="full"
      />,
    );

    expect(screen.getByText('10:00')).toBeDefined();
    expect(screen.getByText('Sun, Nov 1')).toBeDefined();
  });

  it('expands in-situ calendar tray and allows selecting day cells', () => {
    const onSelect = vi.fn();
    render(
      <DateComponent
        formFactor="expandable"
        date="2026-11-01"
        today={fixedToday}
        onSelectDate={onSelect}
      />,
    );

    expect(screen.getByRole('region', { name: 'Interactive Calendar Drawer' })).toBeDefined();
    const dayCell15 = screen.getByRole('button', { name: '15' });
    fireEvent.click(dayCell15);
    expect(onSelect).toHaveBeenCalledWith('2026-11-15');
  });
});
