'use client';

import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { MonthGridContract } from '../../../theme/contracts';
import {
  formatDay,
  formatMonth,
  resolveMonthGrid,
  shiftCivilDate,
  shiftMonth,
  toIsoDate,
  weekdayNames,
  withinRange,
} from '../../shared/time';
import { cx } from '../cx';
import { IconButton } from '../IconButton/IconButton';
import { INTENT_ATTR, Next, Previous, useTimeWords } from './words';

export interface MonthGridProps extends MonthGridContract {
  className?: string;
}

const COLUMNS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const monthKey = (year: number, month: number) => `${year}-${String(month + 1).padStart(2, '0')}`;

/**
 * A month as an ARIA grid: one day in the tab order, arrows move by day and
 * week, Page Up and Page Down by month, Home and End to the week's ends.
 */
export function MonthGrid({
  value,
  onChange,
  label,
  month,
  onMonthChange,
  min,
  max,
  activity,
  today,
  locale,
  labels,
  className,
}: MonthGridProps) {
  const { locale: loc, l } = useTimeWords(locale, labels);
  const todayIso = toIsoDate(today ?? new Date());
  const [own, setOwn] = useState(() => (value ?? todayIso).slice(0, 7));
  const shown = month ?? own;
  const year = Number(shown.slice(0, 4));
  const m = Number(shown.slice(5, 7)) - 1;
  const grid = useMemo(
    () => resolveMonthGrid(year, m, new Date(`${todayIso}T12:00:00`)),
    [year, m, todayIso],
  );
  const short = useMemo(() => weekdayNames(loc, 'narrow'), [loc]);
  const long = useMemo(() => weekdayNames(loc, 'long'), [loc]);
  const [focus, setFocus] = useState(value ?? todayIso);
  const moved = useRef(false);
  const body = useRef<HTMLTableSectionElement>(null);

  const show = (next: string) => {
    if (month === undefined) setOwn(next);
    onMonthChange?.(next);
  };
  const flip = (by: number) => {
    const [y, mm] = shiftMonth(year, m, by);
    show(monthKey(y, mm));
  };

  // Keep the focused day on screen and focused after a keyboard move.
  const inGrid = grid.days.some((d) => d.date === focus);
  const tabDay = inGrid ? focus : (grid.days.find((d) => d.isCurrentMonth)?.date ?? focus);
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    body.current?.querySelector<HTMLButtonElement>(`[data-date="${tabDay}"]`)?.focus();
  });

  const go = (next: string) => {
    moved.current = true;
    setFocus(next);
    if (next.slice(0, 7) !== shown) show(next.slice(0, 7));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTableSectionElement>) => {
    const day = new Date(`${tabDay}T12:00:00`).getDay();
    const by: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -day,
      End: 6 - day,
    };
    if (e.key in by) {
      e.preventDefault();
      go(shiftCivilDate(tabDay, by[e.key] ?? 0));
    } else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      const d = new Date(`${tabDay}T12:00:00`);
      d.setMonth(d.getMonth() + (e.key === 'PageUp' ? -1 : 1));
      go(toIsoDate(d));
    }
  };

  const weeks: (typeof grid.days)[] = [];
  for (let i = 0; i < grid.days.length; i += 7) weeks.push(grid.days.slice(i, i + 7));

  return (
    <div className={cx('gd-month', className)}>
      <div className="gd-month-head">
        <IconButton icon={Previous} label={l.previousMonth} onClick={() => flip(-1)} />
        <h3 className="gd-month-title" aria-live="polite">
          {formatMonth(year, m, loc)}
        </h3>
        <IconButton icon={Next} label={l.nextMonth} onClick={() => flip(1)} />
      </div>
      <table className="gd-month-grid" role="grid" aria-label={label}>
        <thead>
          <tr>
            {COLUMNS.map((column, i) => (
              <th key={column} scope="col" abbr={long[i]}>
                {short[i]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody ref={body} onKeyDown={onKeyDown}>
          {weeks.map((week) => (
            <tr key={week[0]?.date}>
              {week.map((day) => {
                const selected = day.date === value;
                const allowed = withinRange(day.date, min, max);
                const busy = (activity?.[day.date] ?? 0) > 0;
                return (
                  <td key={day.date} aria-selected={selected}>
                    <button
                      type="button"
                      className="gd-month-day"
                      data-date={day.date}
                      data-intent={INTENT_ATTR[day.intent]}
                      data-outside={day.isCurrentMonth ? undefined : ''}
                      data-busy={busy ? '' : undefined}
                      tabIndex={day.date === tabDay ? 0 : -1}
                      aria-current={day.isToday ? 'date' : undefined}
                      aria-pressed={selected}
                      aria-disabled={allowed ? undefined : true}
                      aria-label={[
                        formatDay(day.date, loc, 'long'),
                        day.isToday ? l.today : null,
                        busy ? l.busy : null,
                        allowed ? null : l.unavailable,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                      onClick={() => {
                        if (!allowed) return;
                        setFocus(day.date);
                        if (!day.isCurrentMonth) show(day.date.slice(0, 7));
                        onChange(day.date);
                      }}
                    >
                      {day.dayNumber}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
