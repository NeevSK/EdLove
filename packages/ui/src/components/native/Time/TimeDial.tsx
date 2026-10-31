import { Text as RNText, StyleSheet, View } from 'react-native';
import type { TimeLabels } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { formatTime, hourWords, parseTime, shiftTime } from '../../shared/time';
import { IconButton } from '../IconButton/IconButton';

interface TimeDialProps {
  value: string;
  onChange: (time: string) => void;
  step: number;
  min?: string;
  max?: string;
  locale: string;
  l: TimeLabels;
}

function Up({ size = 20, color }: { size?: number; color?: string }) {
  return <RNText style={{ fontSize: size, lineHeight: size + 2, color }}>+</RNText>;
}
function Down({ size = 20, color }: { size?: number; color?: string }) {
  return <RNText style={{ fontSize: size, lineHeight: size + 2, color }}>−</RNText>;
}

/**
 * The time, large, with an hour column and a minute column. Each column is
 * one adjustable control for screen readers (swipe up or down); the arrows
 * are for touch. Times outside `min`..`max` are not reached.
 */
export function TimeDial({ value, onChange, step, min, max, locale, l }: TimeDialProps) {
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const text = world.recipes.text;
  const lo = parseTime(min) ?? 0;
  const hi = parseTime(max) ?? 24 * 60 - 1;

  const move = (minutes: number, by: number) => {
    const next = shiftTime(value, minutes, by);
    const at = parseTime(next) ?? 0;
    // Wrapping past midnight is allowed only when no bounds are set.
    const wrapped = minutes > 0 ? at < (parseTime(value) ?? 0) : at > (parseTime(value) ?? 0);
    if (at < lo || at > hi || ((min || max) && wrapped)) return;
    feedback('step');
    onChange(next);
  };

  const minutes = parseTime(value) ?? 0;
  const columns = [
    { key: 'hour', label: l.hour, shown: hourWords(value, locale), by: 60, snap: 1 },
    {
      key: 'minute',
      label: l.minute,
      shown: String(minutes % 60).padStart(2, '0'),
      by: step,
      snap: step,
    },
  ];

  return (
    <View style={styles.dial}>
      <RNText
        accessibilityLiveRegion="polite"
        style={[typeStyle(text.display, language, world), styles.time]}
      >
        {formatTime(value, locale)}
      </RNText>
      <View style={styles.columns}>
        {columns.map((c) => (
          <View
            key={c.key}
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel={c.label}
            accessibilityValue={{ text: c.shown }}
            accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
            onAccessibilityAction={({ nativeEvent }) =>
              move(nativeEvent.actionName === 'increment' ? c.by : -c.by, c.snap)
            }
            style={styles.column}
          >
            <IconButton
              icon={Up}
              label={`${l.later}, ${c.label}`}
              onPress={() => move(c.by, c.snap)}
            />
            <RNText style={typeStyle(text.title, language, world)}>{c.shown}</RNText>
            <IconButton
              icon={Down}
              label={`${l.earlier}, ${c.label}`}
              onPress={() => move(-c.by, c.snap)}
            />
            <RNText style={typeStyle(text.caption, language, world)}>{c.label}</RNText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dial: { alignItems: 'center', gap: 12 },
  time: { textAlign: 'center' },
  columns: { flexDirection: 'row', gap: 32 },
  column: { alignItems: 'center', gap: 4 },
});
