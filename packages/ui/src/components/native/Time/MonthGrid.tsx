import { useMemo, useState } from 'react';
import {
  Pressable,
  Text as RNText,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import type { MonthGridContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import {
  formatDay,
  formatMonth,
  resolveMonthGrid,
  shiftMonth,
  toIsoDate,
  weekdayNames,
  withinRange,
} from '../../shared/time';
import { IconButton } from '../IconButton/IconButton';
import { TOUCH_MIN } from '../touch';
import { Next, Previous, useTimeWords } from './words';

export interface MonthGridProps extends MonthGridContract {
  style?: StyleProp<ViewStyle>;
}

/** Weekday columns from Sunday; narrow names repeat (S, S), so the column is the key. */
const COLUMNS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

const monthKey = (year: number, month: number) => `${year}-${String(month + 1).padStart(2, '0')}`;

/**
 * A month of days. The past is said quietly, today is ringed in the lamp,
 * the chosen day is lit; activity is a dot and is named for readers.
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
  style,
}: MonthGridProps) {
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const { locale: loc, l } = useTimeWords(locale, labels);
  const r = world.recipes.time;
  const text = world.recipes.text;
  const todayIso = toIsoDate(today ?? new Date());
  const [own, setOwn] = useState(() => (value ?? todayIso).slice(0, 7));
  const shown = month ?? own;
  const year = Number(shown.slice(0, 4));
  const m = Number(shown.slice(5, 7)) - 1;
  const grid = useMemo(
    () => resolveMonthGrid(year, m, today ?? new Date(`${todayIso}T12:00:00`)),
    [year, m, today, todayIso],
  );
  const names = useMemo(() => weekdayNames(loc, 'narrow'), [loc]);

  const show = (next: string) => {
    if (month === undefined) setOwn(next);
    onMonthChange?.(next);
  };
  const move = (by: number) => {
    const [y, mm] = shiftMonth(year, m, by);
    feedback('step');
    show(monthKey(y, mm));
  };

  const weeks: (typeof grid.days)[] = [];
  for (let i = 0; i < grid.days.length; i += 7) weeks.push(grid.days.slice(i, i + 7));

  return (
    <View style={[styles.grid, style]}>
      <View style={styles.header}>
        <IconButton icon={Previous} label={l.previousMonth} onPress={() => move(-1)} />
        <RNText
          role="heading"
          accessibilityLiveRegion="polite"
          style={[typeStyle(text.label, language, world), styles.title]}
        >
          {formatMonth(year, m, loc)}
        </RNText>
        <IconButton icon={Next} label={l.nextMonth} onPress={() => move(1)} />
      </View>
      <View
        style={styles.week}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {COLUMNS.map((column, i) => (
          <RNText
            key={column}
            style={[typeStyle(text.caption, language, world), styles.cell, styles.weekday]}
          >
            {names[i]}
          </RNText>
        ))}
      </View>
      <View role="grid" aria-label={label}>
        {weeks.map((week) => (
          <View key={week[0]?.date} role="row" style={styles.week}>
            {week.map((day) => {
              const selected = day.date === value;
              const allowed = withinRange(day.date, min, max);
              const busy = (activity?.[day.date] ?? 0) > 0;
              const tone =
                day.intent === 'review' ? r.past : day.intent === 'plan' ? r.future : r.today;
              const name = [
                formatDay(day.date, loc, 'long'),
                day.isToday ? l.today : null,
                busy ? l.busy : null,
                allowed ? null : l.unavailable,
              ]
                .filter(Boolean)
                .join(', ');
              return (
                <Pressable
                  key={day.date}
                  role="button"
                  accessibilityLabel={name}
                  accessibilityState={{ selected, disabled: !allowed }}
                  disabled={!allowed}
                  onPress={() => {
                    feedback('select');
                    if (!day.isCurrentMonth) show(day.date.slice(0, 7));
                    onChange(day.date);
                  }}
                  style={({ pressed }) => [
                    styles.cell,
                    { opacity: !allowed ? 0.3 : day.isCurrentMonth ? 1 : 0.5 },
                    pressed ? { transform: [{ scale: 0.94 }] } : null,
                  ]}
                >
                  <View
                    style={[
                      styles.day,
                      selected ? { backgroundColor: r.selected.fill } : null,
                      day.isToday && !selected
                        ? { borderWidth: 1.5, borderColor: r.today.mark }
                        : null,
                    ]}
                  >
                    <RNText
                      style={[
                        typeStyle(text.body, language, world),
                        {
                          color: selected ? r.selected.ink : tone.ink,
                          fontWeight: day.isToday || selected ? '600' : undefined,
                        },
                      ]}
                    >
                      {day.dayNumber}
                    </RNText>
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: busy
                            ? selected
                              ? r.selected.ink
                              : r.dot
                            : 'transparent',
                        },
                      ]}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { flex: 1, textAlign: 'center' },
  week: { flexDirection: 'row' },
  weekday: { textAlign: 'center' },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: TOUCH_MIN },
  day: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { position: 'absolute', bottom: 5, width: 4, height: 4, borderRadius: 2 },
});
