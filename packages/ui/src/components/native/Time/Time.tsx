import { useEffect, useState } from 'react';
import {
  Pressable,
  Text as RNText,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import type { TimeContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useWorldContext } from '../../../theme/native/WorldContext';

export interface TimeProps extends TimeContract {
  style?: StyleProp<ViewStyle>;
}

/**
 * Canonical Native Time Component
 * Features:
 * - Minimalist ticking analog SVG dial using react-native-svg
 * - Monospace digital readout
 * - One-tap 12h/24h toggle
 */
export function Time({
  time,
  onChange,
  live = true,
  format: initialFormat = '24h',
  style,
}: TimeProps) {
  const { world } = useWorldContext();
  const feedback = useFeedback();

  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(initialFormat);

  const getSystemTime = () => {
    const now = new globalThis.Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const [internalTime, setInternalTime] = useState<string>(() => time ?? getSystemTime());

  useEffect(() => {
    if (!live || time !== undefined) return;
    setInternalTime(getSystemTime());
    const interval = setInterval(() => {
      setInternalTime(getSystemTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [live, time]);

  useEffect(() => {
    if (time !== undefined) {
      setInternalTime(time);
    }
  }, [time]);

  const [hours, minutes] = internalTime.split(':').map((v) => Number.parseInt(v, 10) || 0) as [number, number];

  const lamp = world.tokens.lamp;
  const surface = world.tokens.raised;
  const line = world.tokens.line;
  const inkSoft = world.tokens.inkSoft;

  // Calculate hand angles
  const minuteAngle = (minutes / 60) * 360;
  const hourAngle = ((hours % 12) / 12) * 360 + (minutes / 60) * 30;

  const minuteRad = ((minuteAngle - 90) * Math.PI) / 180;
  const hourRad = ((hourAngle - 90) * Math.PI) / 180;

  const hourX2 = 12 + 5.5 * Math.cos(hourRad);
  const hourY2 = 12 + 5.5 * Math.sin(hourRad);
  const minX2 = 12 + 8 * Math.cos(minuteRad);
  const minY2 = 12 + 8 * Math.sin(minuteRad);

  // Digital formatting
  let displayHours = hours;
  let period: string | null = null;
  if (timeFormat === '12h') {
    period = hours >= 12 ? 'PM' : 'AM';
    displayHours = hours % 12 || 12;
  }
  const formattedDigital = `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  const toggleFormat = () => {
    feedback('step');
    setTimeFormat((f) => (f === '24h' ? '12h' : '24h'));
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Current time: ${formattedDigital} ${period ?? ''}. Double tap to toggle 12 hour or 24 hour mode`}
      onPress={toggleFormat}
      style={({ pressed }) => [
        styles.capsule,
        { backgroundColor: surface, borderColor: line, opacity: pressed ? 0.75 : 1 },
        style,
      ]}
    >
      {/* Real-time Ticking Analog SVG Clock */}
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={lamp} strokeWidth="1.8" />
        <Line x1="12" y1="12" x2={hourX2} y2={hourY2} stroke={lamp} strokeWidth="2.2" strokeLinecap="round" />
        <Line x1="12" y1="12" x2={minX2} y2={minY2} stroke={lamp} strokeWidth="1.6" strokeLinecap="round" />
        <Circle cx="12" cy="12" r="1.5" fill={lamp} />
      </Svg>

      {/* Digital Readout */}
      <RNText style={[styles.timeText, { color: lamp }]}>{formattedDigital}</RNText>

      {period ? <RNText style={[styles.periodText, { color: inkSoft }]}>{period}</RNText> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  periodText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
