import { useState } from 'react';
import { type AccessibilityActionEvent, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import type { SliderContract } from '../../../theme/contracts';
import { useWorld } from '../../../theme/native/WorldContext';
import { hapticImpact } from '../../../utils/haptics';
import { fraction, type Range, snap, valueAt } from '../../shared/range';
import { Text } from '../Text/Text';

export interface SliderProps extends SliderContract {
  style?: StyleProp<ViewStyle>;
}

/**
 * Pick a number along a range. Touch anywhere on the track or drag the thumb;
 * screen readers adjust it a step at a time (swipe up and down on iOS, the
 * volume keys on Android).
 */
export function Slider({
  value,
  onChange,
  label,
  min = 0,
  max = 100,
  step = 1,
  valueText,
  disabled,
  style,
}: SliderProps) {
  const r = useWorld().recipes.toggle;
  const [width, setWidth] = useState(0);
  const range: Range = { min, max, step };
  const text = valueText ? valueText(value) : String(value);

  const set = (next: number) => {
    if (next === value) return;
    hapticImpact('light');
    onChange(next);
  };

  const pan = usePanGesture({
    enabled: !disabled,
    minDistance: 0,
    onBegin: (event) => {
      'worklet';
      scheduleOnRN(set, valueAt(event.x, width, range));
    },
    onUpdate: (event) => {
      'worklet';
      scheduleOnRN(set, valueAt(event.x, width, range));
    },
  });

  const onAction = (event: AccessibilityActionEvent) => {
    const by = event.nativeEvent.actionName === 'increment' ? step : -step;
    set(snap(value + by, range));
  };

  const f = fraction(value, range);
  const half = r.thumb.size / 2;

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.head}>
        <Text kind="label" tone="soft">
          {label}
        </Text>
        <Text kind="value">{text}</Text>
      </View>
      <GestureDetector gesture={pan}>
        <View
          accessible
          role="slider"
          accessibilityLabel={label}
          accessibilityValue={{ min, max, now: value, text }}
          accessibilityState={{ disabled: !!disabled }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={onAction}
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          style={[styles.hit, { opacity: disabled ? 0.5 : 1 }]}
        >
          <View style={[styles.track, { height: r.track.height, borderRadius: r.track.height / 2, backgroundColor: r.track.off }]}>
            <View style={{ width: `${f * 100}%`, height: '100%', borderRadius: r.track.height / 2, backgroundColor: r.track.on }} />
          </View>
          <View
            pointerEvents="none"
            style={[
              styles.thumb,
              {
                width: r.thumb.size,
                height: r.thumb.size,
                borderRadius: half,
                backgroundColor: r.thumb.fill,
                borderWidth: r.thumb.edge.width,
                borderColor: r.thumb.edge.color,
                left: f * width - half,
              },
            ]}
          />
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  hit: { height: 44, justifyContent: 'center' },
  track: { width: '100%', overflow: 'hidden' },
  thumb: { position: 'absolute', top: 10 },
});
