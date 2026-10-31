import { useState } from 'react';
import {
  Pressable,
  Text as RNText,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import type { DateTravelContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useLivingStyle } from '../../../theme/native/motion';
import { radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import {
  dayIntent,
  formatDay,
  formatTime,
  parseCivilDate,
  shiftCivilDate,
  toIsoDate,
  withinRange,
} from '../../shared/time';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Inline } from '../Layout/Layout';
import { Sheet } from '../Sheet/Sheet';
import { MonthGrid } from './MonthGrid';
import { TimeDial } from './TimeDial';
import { Next, Previous, useTimeTone, useTimeWords } from './words';

export interface DateTravelProps extends DateTravelContract {
  style?: StyleProp<ViewStyle>;
}

/** A month step that keeps the day where it can (31 March → 30 April). */
function shiftByMonth(date: string, by: number): string {
  const d = parseCivilDate(date);
  const day = d.getDate();
  const target = new Date(d.getFullYear(), d.getMonth() + by, 1, 12);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, last));
  return toIsoDate(target);
}

/**
 * Travel through days: previous, the day itself (press it for the month),
 * next, and Today when away from it. The band behind recedes for the past
 * and warms for the future, gliding in the world's light; the words say it.
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
  style,
}: DateTravelProps) {
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const { locale: loc, l } = useTimeWords(locale, labels);
  const text = world.recipes.text;
  const todayIso = toIsoDate(today ?? new Date());
  const intent = dayIntent(date, today);
  const tone = useTimeTone(intent);
  const band = useLivingStyle({ backgroundColor: tone.wash });
  const [calendar, setCalendar] = useState(false);
  const [clock, setClock] = useState(false);
  const [draft, setDraft] = useState(time ?? '09:00');

  const away = (by: number) =>
    step === 'month' ? shiftByMonth(date, by) : shiftCivilDate(date, step === 'week' ? 7 * by : by);
  const go = (by: number) => {
    const next = away(by);
    if (!withinRange(next, min, max)) return;
    feedback('step');
    onChange(next);
  };
  const words = {
    day: [l.previousDay, l.nextDay],
    week: [l.previousWeek, l.nextWeek],
    month: [l.previousMonth, l.nextMonth],
  }[step];
  const dayLabel = formatDay(date, loc, 'long');
  const intentWords = l[intent];
  const corner = world.recipes.group.surface.radius;

  return (
    <Animated.View style={[styles.band, radiusStyle(corner), band, style]}>
      <View style={styles.row}>
        <IconButton
          icon={Previous}
          label={words[0] ?? l.previousDay}
          disabled={!withinRange(away(-1), min, max)}
          onPress={() => go(-1)}
        />
        <Pressable
          role="button"
          accessibilityLabel={`${dayLabel}${showIntent && intent !== 'current' ? `, ${intentWords}` : ''}`}
          accessibilityHint={l.chooseDate}
          onPress={() => setCalendar(true)}
          style={({ pressed }) => [styles.day, { opacity: pressed ? 0.7 : 1 }]}
        >
          {showIntent ? (
            <RNText style={[typeStyle(text.caption, language, world), { color: tone.ink }]}>
              {intentWords}
            </RNText>
          ) : null}
          <RNText
            accessibilityLiveRegion="polite"
            numberOfLines={1}
            style={[typeStyle(text.label, language, world), { color: tone.ink }]}
          >
            {dayLabel}
          </RNText>
        </Pressable>
        <IconButton
          icon={Next}
          label={words[1] ?? l.nextDay}
          disabled={!withinRange(away(1), min, max)}
          onPress={() => go(1)}
        />
      </View>
      {onTimeChange || date !== todayIso ? (
        <Inline gap="inside" justify="center">
          {onTimeChange ? (
            <Button
              size="sm"
              variant="secondary"
              label={time ? formatTime(time, loc) : l.chooseTime}
              accessibilityHint={l.chooseTime}
              onPress={() => {
                setDraft(time ?? '09:00');
                setClock(true);
              }}
            />
          ) : null}
          {date !== todayIso && withinRange(todayIso, min, max) ? (
            <Button
              size="sm"
              variant="quiet"
              label={l.today}
              onPress={() => {
                feedback('select');
                onChange(todayIso);
              }}
            />
          ) : null}
        </Inline>
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
      {onTimeChange ? (
        <Sheet open={clock} onClose={() => setClock(false)} title={l.chooseTime}>
          <TimeDial value={draft} onChange={setDraft} step={timeStep} locale={loc} l={l} />
          <Inline gap="between" justify="end">
            {time ? (
              <Button
                label={l.clear}
                variant="quiet"
                onPress={() => {
                  setClock(false);
                  onTimeChange(null);
                }}
              />
            ) : null}
            <Button
              label={l.done}
              onPress={() => {
                feedback('commit');
                setClock(false);
                onTimeChange(draft);
              }}
            />
          </Inline>
        </Sheet>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  band: { paddingVertical: 6, paddingHorizontal: 4, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  day: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 48, gap: 2 },
});
