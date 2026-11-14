import { DateField, DateTravel, MonthGrid, TimeAgo, Timeline } from '@repo/ui/components/web';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const NOW = new Date(2026, 9, 31, 12, 0);

describe('web kit: time pieces', () => {
  it('TimeAgo is a real <time> with the exact moment for readers', () => {
    render(<TimeAgo at={new Date(2026, 9, 31, 11, 55)} now={NOW} locale="en-GB" />);
    const t = screen.getByText('5 minutes ago');
    expect(t.tagName).toBe('TIME');
    expect(t.getAttribute('data-intent')).toBe('past');
    expect(t.textContent).toMatch(/5 minutes ago, 31 Oct 2026/);
  });

  it('MonthGrid is a grid with one day in the tab order and arrow keys between days', async () => {
    const onChange = vi.fn();
    render(
      <MonthGrid
        label="Lesson date"
        value="2026-10-20"
        onChange={onChange}
        today={NOW}
        max="2026-10-30"
        activity={{ '2026-10-21': 2 }}
        locale="en-GB"
      />,
    );
    expect(screen.getByRole('grid', { name: 'Lesson date' })).toBeTruthy();
    const chosen = screen.getByRole('button', { name: /20 October 2026$/ });
    expect(chosen.getAttribute('tabindex')).toBe('0');
    expect(chosen.getAttribute('aria-pressed')).toBe('true');
    expect(
      screen.getByRole('button', { name: /31 October 2026, Today, Not available/ }),
    ).toBeTruthy();
    chosen.focus();
    fireEvent.keyDown(chosen, { key: 'ArrowRight' });
    const next = screen.getByRole('button', { name: /21 October 2026, Has activity/ });
    expect(document.activeElement).toBe(next);
    await userEvent.click(next);
    expect(onChange).toHaveBeenCalledWith('2026-10-21');
    fireEvent.keyDown(next, { key: 'PageDown' });
    expect(screen.getByText('November 2026')).toBeTruthy();
  });

  it('DateTravel says the future, steps a day, and returns to today', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <DateTravel date="2026-11-02" onChange={onChange} today={NOW} locale="en-GB" />,
    );
    expect(container.querySelector('.gd-date-travel')?.getAttribute('data-intent')).toBe('future');
    expect(screen.getByText('Planning ahead')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Previous day' }));
    expect(onChange).toHaveBeenLastCalledWith('2026-11-01');
    await userEvent.click(screen.getByRole('button', { name: 'Today' }));
    expect(onChange).toHaveBeenLastCalledWith('2026-10-31');
  });

  it('DateField is the browser date input and reads the day in words', () => {
    const onChange = vi.fn();
    render(<DateField label="Due" value="2026-10-30" onChange={onChange} locale="en-GB" />);
    const input = screen.getByLabelText('Due') as HTMLInputElement;
    expect(input.type).toBe('date');
    expect(screen.getByText(/Friday,? 30 October 2026/)).toBeTruthy();
    fireEvent.change(input, { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('Timeline lists days oldest first with a now line between past and coming', () => {
    render(
      <Timeline
        label="Today's plan"
        now={NOW}
        locale="en-GB"
        entries={[
          { id: 'b', at: new Date(2026, 9, 31, 14), title: 'Maths' },
          { id: 'a', at: new Date(2026, 9, 31, 8), title: 'Assembly' },
        ]}
      />,
    );
    const list = screen.getByRole('list', { name: "Today's plan" });
    const items = Array.from(list.querySelectorAll('.gd-timeline-entries > li')).map((li) =>
      li.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(items).toEqual(['8:00Assembly', 'Now', '14:00Maths']);
  });
});
