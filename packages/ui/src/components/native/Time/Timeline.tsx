import { useMemo, useState } from 'react';
import {
  Pressable,
  Text as RNText,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import type { TimelineContract, TimelineEntry } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import {
  formatDay,
  formatTime,
  momentIntent,
  relativeTime,
  sentence,
  timelineGroups,
  toIsoDate,
} from '../../shared/time';
import { useNow, useTimeWords } from './words';

export interface TimelineProps extends TimelineContract {
  style?: StyleProp<ViewStyle>;
}

const clock = (at: Date) =>
  `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`;

/**
 * Moments in time order, a day at a time. What has passed is said quietly
 * and its marks recede; a lit now line sits where the past meets what is
 * coming; the future's marks are warmed. For short day plans and histories;
 * long feeds belong in `List`.
 */
export function Timeline({ entries, label, now: fixed, locale, labels, style }: TimelineProps) {
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const { locale: loc, l } = useTimeWords(locale, labels);
  const r = world.recipes.time;
  const text = world.recipes.text;
  const groups = useMemo(() => timelineGroups(entries, fixed ?? new Date()), [entries, fixed]);
  // The next moment ahead when shown; now is kept current around it.
  const [shownAt] = useState(() => fixed ?? new Date());
  const next = groups.flatMap((g) => g.items).find((e) => new Date(e.at) > shownAt);
  const now = useNow(fixed, next ? new Date(next.at) : null);
  const todayIso = toIsoDate(now);
  const firstAhead = groups
    .flatMap((g) => g.items)
    .find((e) => new Date(e.at).getTime() > now.getTime());
  const anyPast = entries.some((e) => new Date(e.at).getTime() <= now.getTime());

  const dayWords = (date: string) => {
    if (date === todayIso) return l.today;
    const days = Math.round(
      (new Date(`${date}T12:00:00`).getTime() - new Date(`${todayIso}T12:00:00`).getTime()) /
        86_400_000,
    );
    return Math.abs(days) === 1
      ? sentence(relativeTime(new Date(`${date}T12:00:00`), new Date(`${todayIso}T12:00:00`), loc))
      : formatDay(date, loc, 'long');
  };

  const entry = (e: TimelineEntry) => {
    const at = new Date(e.at);
    const intent = momentIntent(at, now);
    const tone = intent === 'review' ? r.past : intent === 'plan' ? r.future : r.today;
    const mark =
      e.tone === 'danger'
        ? world.tokens.danger
        : e.tone === 'lamp' || intent === 'current'
          ? r.now
          : tone.mark;
    const time = formatTime(clock(at), loc);
    const body = (
      <View style={styles.entry}>
        <View style={styles.rail}>
          <View style={[styles.mark, { backgroundColor: mark }]} />
          <View style={[styles.line, { backgroundColor: world.tokens.line }]} />
        </View>
        <View style={styles.words}>
          <RNText style={[typeStyle(text.caption, language, world), { color: tone.ink }]}>
            {time}
          </RNText>
          <RNText style={[typeStyle(text.body, language, world), { color: tone.ink }]}>
            {e.title}
          </RNText>
          {e.body ? (
            <RNText style={typeStyle(text.caption, language, world)}>{e.body}</RNText>
          ) : null}
        </View>
      </View>
    );
    const name = [time, e.title, e.body].filter(Boolean).join(', ');
    return e.onPress ? (
      <Pressable
        key={e.id}
        role="button"
        accessibilityLabel={name}
        onPress={() => {
          feedback('press');
          e.onPress?.();
        }}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        {body}
      </Pressable>
    ) : (
      <View key={e.id} accessible accessibilityLabel={name}>
        {body}
      </View>
    );
  };

  return (
    <View role="list" aria-label={label} style={[styles.timeline, style]}>
      {groups.map((g) => (
        <View key={g.key} style={styles.group}>
          <RNText role="heading" style={typeStyle(world.recipes.group.label, language, world)}>
            {dayWords(g.date)}
          </RNText>
          {g.items.map((e) => (
            <View key={e.id}>
              {e === firstAhead && anyPast ? (
                <View accessible accessibilityLabel={l.now} style={styles.now}>
                  <View style={[styles.nowDot, { backgroundColor: r.now }]} />
                  <View style={[styles.nowLine, { backgroundColor: r.now }]} />
                  <RNText
                    style={[typeStyle(text.caption, language, world), { color: r.today.ink }]}
                  >
                    {l.now}
                  </RNText>
                </View>
              ) : null}
              {entry(e)}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  timeline: { gap: 16 },
  group: { gap: 4 },
  entry: { flexDirection: 'row', gap: 12, minHeight: 44 },
  rail: { width: 12, alignItems: 'center' },
  mark: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  line: { flex: 1, width: 1, marginTop: 4 },
  words: { flex: 1, gap: 2, paddingBottom: 12 },
  now: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  nowDot: { width: 12, height: 12, borderRadius: 6 },
  nowLine: { flex: 1, height: 1.5 },
});
