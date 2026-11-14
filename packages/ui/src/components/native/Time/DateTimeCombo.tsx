import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { DateTimeComboContract } from '../../../theme/contracts';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { Date } from './Date';
import { Time } from './Time';

export interface DateTimeComboProps extends DateTimeComboContract {
  style?: StyleProp<ViewStyle>;
}

/**
 * Canonical Native DateTimeCombo Component
 * Strict vertical hierarchy when stacked into two rows:
 * - ROW 1 (TOP): Time (Minimalist Analog SVG Clock + Digital readout)
 * - ROW 2 (BOTTOM): Date (Nano Tile or Compact Capsule)
 *
 * When screen width is heavily constrained, degrades seamlessly to a single-row
 * nano tile or micro capsule without breaking line boxes.
 */
export function DateTimeCombo({
  date,
  time,
  onChange,
  onTimeChange,
  formFactor = 'compact',
  timeFormat = '24h',
  today,
  min,
  max,
  disabled,
  locale,
  labels,
  style,
}: DateTimeComboProps) {
  const { world } = useWorldContext();
  const surface = world.tokens.raised;
  const line = world.tokens.line;

  // Ultra-compact Nano Mode: Horizontal pill (Clock on left, Day badge on right)
  if (formFactor === 'nano') {
    return (
      <View style={[styles.nanoRow, style]}>
        {/* Left: Clock */}
        <Time
          time={time}
          onChange={onTimeChange}
          format={timeFormat}
        />
        {/* Right: NANO DAY TILE */}
        <Date
          date={date}
          onChange={onChange}
          formFactor="nano"
          today={today}
          min={min}
          max={max}
          disabled={disabled}
          locale={locale}
          labels={labels}
        />
      </View>
    );
  }

  // DEFAULT / COMPACT TWO-ROW HIERARCHY
  return (
    <View style={[styles.comboContainer, { backgroundColor: surface, borderColor: line }, style]}>
      {/* ROW 1: TIME ALWAYS ON TOP */}
      <View style={styles.topRow}>
        <Time
          time={time}
          onChange={onTimeChange}
          format={timeFormat}
        />
      </View>

      {/* ROW 2: DATE COMPONENT (Compact or Full) */}
      <View style={styles.bottomRow}>
        <Date
          date={date}
          onChange={onChange}
          formFactor={formFactor}
          today={today}
          min={min}
          max={max}
          disabled={disabled}
          locale={locale}
          labels={labels}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  comboContainer: {
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    alignSelf: 'flex-start',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nanoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
});
