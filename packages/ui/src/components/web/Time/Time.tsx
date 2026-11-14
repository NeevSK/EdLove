'use client';

import { useId, useMemo, useState } from 'react';
import type {
  DateFieldContract,
  DateTravelContract,
  TimeAgoContract,
  TimeFieldContract,
  TimelineContract,
} from '../../../theme/contracts';
import {
  dayIntent,
  formatDay,
  formatTime,
  momentIntent,
  parseCivilDate,
  relativeTime,
  sentence,
  shiftCivilDate,
  timelineGroups,
  toIsoDate,
  withinRange,
} from '../../shared/time';
import { Button } from '../Button/Button';
import { cx } from '../cx';
import { IconButton } from '../IconButton/IconButton';
import { Sheet } from '../Sheet/Sheet';
import { TextField } from '../TextField/TextField';
import { MonthGrid } from './MonthGrid';
import { INTENT_ATTR, Next, Previous, useNow, useTimeWords } from './words';

export interface TimeAgoProps extends TimeAgoContract {
  className?: string;
}

/** A moment against now, as a real `<time>`; readers and hover get the exact moment. */
export function TimeAgo({ at, now: fixed, exact, locale, labels, className }: TimeAgoProps) {
  const { locale: loc, l } = useTimeWords(locale, labels);
  const moment = useMemo(() => new Date(at), [at]);
  const valid = !Number.isNaN(moment.getTime());
  const now = useNow(fixed, valid ? moment : null);
  if (!valid) return <span className={cx('gd-time-ago', className)}>{l.noTime}</span>;
  const words = relativeTime(moment, now, loc);
  const full = new Intl.DateTimeFormat(loc, { dateStyle: 'medium', timeStyle: 'short' }).format(
    moment,
  );
  return (
    <time
      className={cx('gd-time-ago', className)}
      data-intent={INTENT_ATTR[momentIntent(moment, now)]}
      dateTime={moment.toISOString()}
      title={full}
    >
      {words}
      {exact ? <span aria-hidden> · {full}</span> : null}
      <span className="gd-visually-hidden">, {full}</span>
    </time>
  );
}

export interface DateTravelProps extends DateTravelContract {
  className?: string;
}

function shiftByMonth(date: string, by: number): string {
  const d = parseCivilDate(date);
  const day = d.getDate();
  const target = new Date(d.getFullYear(), d.getMonth() + by, 1, 12);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, last));
  return toIsoDate(target);
}

/**
 * Previous, the day (press it for the month), next, Today when away, and an
 * optional time. The band recedes for the past and warms for the future.
 */
export function DateTravel({
  date,
  onChange,
  step = 'day',
  time,
  onTimeChange,
  timeStep = 5,
  min,
  max,
  activity,
  showIntent = true,
  today,
  locale,
  labels,
  className,
}: DateTravelProps) {
  const { locale: loc, l } = useTimeWords(locale, labels);
  const [calendar, setCalendar] = useState(false);
  const todayIso = toIsoDate(today ?? new Date());
  const intent = dayIntent(date, today);
  const away = (by: number) =>
    step === 'month' ? shiftByMonth(date, by) : shiftCivilDate(date, step === 'week' ? 7 * by : by);
  const go = (by: number) => {
    const next = away(by);
    if (withinRange(next, min, max)) onChange(next);
  };
  const words = {
    day: [l.previousDay, l.nextDay],
    week: [l.previousWeek, l.nextWeek],
    month: [l.previousMonth, l.nextMonth],
  }[step];
  const dayLabel = formatDay(date, loc, 'long');
  return (
    <div className={cx('gd-date-travel', className)} data-intent={INTENT_ATTR[intent]}>
      <div className="gd-date-travel-row">
        <IconButton
          icon={Previous}
          label={words[0] ?? l.previousDay}
          disabled={!withinRange(away(-1), min, max)}
          onClick={() => go(-1)}
        />
        <button
          type="button"
          className="gd-date-travel-day"
          aria-haspopup="dialog"
          aria-label={`${dayLabel}${showIntent && intent !== 'current' ? `, ${l[intent]}` : ''}`}
          onClick={() => setCalendar(true)}
        >
          {showIntent ? <span className="gd-date-travel-intent">{l[intent]}</span> : null}
          <span className="gd-date-travel-date" aria-live="polite">
            {dayLabel}
          </span>
        </button>
        <IconButton
          icon={Next}
          label={words[1] ?? l.nextDay}
          disabled={!withinRange(away(1), min, max)}
          onClick={() => go(1)}
        />
      </div>
      {onTimeChange || date !== todayIso ? (
        <div className="gd-date-travel-extra">
          {onTimeChange ? (
            <input
              type="time"
              className="gd-date-travel-time"
              aria-label={l.chooseTime}
              value={time ?? ''}
              step={timeStep * 60}
              onChange={(e) => onTimeChange(e.target.value || null)}
            />
          ) : null}
          {date !== todayIso && withinRange(todayIso, min, max) ? (
            <Button size="sm" variant="quiet" label={l.today} onClick={() => onChange(todayIso)} />
          ) : null}
        </div>
      ) : null}
      <Sheet open={calendar} onClose={() => setCalendar(false)} title={l.chooseDate}>
        <MonthGrid
          label={l.chooseDate}
          value={date}
          onChange={(next) => {
            setCalendar(false);
            onChange(next);
          }}
          min={min}
          max={max}
          activity={activity}
          today={today}
          locale={loc}
          labels={labels}
        />
      </Sheet>
    </div>
  );
}

export interface DateFieldProps extends DateFieldContract {
  className?: string;
}

/** The browser's own date input, labelled and bounded, saying the chosen day in words. */
export function DateField({
  label,
  hint,
  error,
  value,
  onChange,
  min,
  max,
  disabled,
  locale,
  labels,
  className,
}: DateFieldProps) {
  const { locale: loc } = useTimeWords(locale, labels);
  return (
    <TextField
      type="date"
      label={label}
      hint={value ? formatDay(value, loc, 'long') : hint}
      error={error}
      value={value ?? ''}
      min={min}
      max={max}
      disabled={disabled}
      className={cx('gd-date-field', className)}
      onChange={(e) => onChange(e.target.value || null)}
    />
  );
}

export interface TimeFieldProps extends TimeFieldContract {
  className?: string;
}

/** The browser's own time input, in the reader's clock, stepping by minutes. */
export function TimeField({
  label,
  hint,
  error,
  value,
  onChange,
  step = 5,
  min,
  max,
  disabled,
  className,
}: TimeFieldProps) {
  return (
    <TextField
      type="time"
      label={label}
      hint={hint}
      error={error}
      value={value ?? ''}
      step={step * 60}
      min={min}
      max={max}
      disabled={disabled}
      className={cx('gd-time-field', className)}
      onChange={(e) => onChange(e.target.value || null)}
    />
  );
}

export interface TimelineProps extends TimelineContract {
  className?: string;
}

const clock = (at: Date) =>
  `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`;

/** Moments by day, oldest first; the past recedes, a now line, the future warmed. */
export function Timeline({ entries, label, now: fixed, locale, labels, className }: TimelineProps) {
  const { locale: loc, l } = useTimeWords(locale, labels);
  const headingId = useId();
  const groups = useMemo(() => timelineGroups(entries, fixed ?? new Date()), [entries, fixed]);
  const [shownAt] = useState(() => fixed ?? new Date());
  const next = groups.flatMap((g) => g.items).find((e) => new Date(e.at) > shownAt);
  const now = useNow(fixed, next ? new Date(next.at) : null);
  const todayIso = toIsoDate(now);
  const firstAhead = groups
    .flatMap((g) => g.items)
    .find((e) => new Date(e.at).getTime() > now.getTime());
  const anyPast = entries.some((e) => new Date(e.at).getTime() <= now.getTime());
  const noon = (date: string) => new Date(`${date}T12:00:00`);
  const dayWords = (date: string) => {
    if (date === todayIso) return l.today;
    const days = Math.round((noon(date).getTime() - noon(todayIso).getTime()) / 86_400_000);
    return Math.abs(days) === 1
      ? sentence(relativeTime(noon(date), noon(todayIso), loc))
      : formatDay(date, loc, 'long');
  };
  return (
    <ol className={cx('gd-timeline', className)} aria-label={label}>
      {groups.map((g, i) => (
        <li key={g.key} className="gd-timeline-day" aria-labelledby={`${headingId}-${i}`}>
          <h3 id={`${headingId}-${i}`} className="gd-timeline-heading">
            {dayWords(g.date)}
          </h3>
          <ol className="gd-timeline-entries">
            {g.items.map((e) => {
              const at = new Date(e.at);
              const time = formatTime(clock(at), loc);
              const words = (
                <>
                  <time className="gd-timeline-time" dateTime={at.toISOString()}>
                    {time}
                  </time>
                  <span className="gd-timeline-title">{e.title}</span>
                  {e.body ? <span className="gd-timeline-body">{e.body}</span> : null}
                </>
              );
              return [
                e === firstAhead && anyPast ? (
                  <li key={`${e.id}-now`} className="gd-timeline-now">
                    {l.now}
                  </li>
                ) : null,
                <li
                  key={e.id}
                  className="gd-timeline-entry"
                  data-intent={INTENT_ATTR[momentIntent(at, now)]}
                  data-tone={e.tone && e.tone !== 'plain' ? e.tone : undefined}
                >
                  {e.onPress ? (
                    <button type="button" className="gd-timeline-press" onClick={e.onPress}>
                      {words}
                    </button>
                  ) : (
                    words
                  )}
                </li>,
              ];
            })}
          </ol>
        </li>
      ))}
    </ol>
  );
}
