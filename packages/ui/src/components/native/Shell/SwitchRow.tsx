import { useEffect } from 'react';
import { Pressable, Text as RNText, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { SwitchRowContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useLivingStyle, useWorldMotion } from '../../../theme/native/motion';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';

export type SwitchRowProps = SwitchRowContract;

const TRACK = { w: 48, h: 28, pad: 3 };

/**
 * A settings row that is itself the switch: the whole row toggles, it is one
 * named control for screen readers, and the thumb glides with the world's
 * motion while the track lights with its lamp.
 */
export function SwitchRow({ label, hint, value, onChange, disabled }: SwitchRowProps) {
  const { world, language } = useWorldContext();
  const m = useWorldMotion();
  const feedback = useFeedback();
  const r = world.recipes.toggle;
  const t = world.tokens;
  const travel = TRACK.w - TRACK.h;
  const x = useSharedValue(value ? travel : 0);
  useEffect(() => {
    const to = value ? travel : 0;
    if (!m.animates) x.set(to);
    else x.set(m.spring ? withSpring(to, m.spring) : withTiming(to, m.timing('micro')));
  }, [value, m, x, travel]);
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  // Off is the toggle edge colour, held to 3:1 on the ground, so the off state is seen too.
  const track = useLivingStyle({ backgroundColor: value ? r.track.on : r.edge.color });
  return (
    <Pressable
      role="switch"
      aria-checked={value}
      aria-disabled={disabled}
      accessibilityLabel={label}
      accessibilityHint={hint}
      disabled={disabled}
      onPress={() => {
        feedback('select');
        onChange(!value);
      }}
      style={[styles.row, { minHeight: world.recipes.row.minHeight, opacity: disabled ? 0.5 : 1 }]}
    >
      <View style={styles.words}>
        <RNText style={typeStyle(world.recipes.row.label, language, world)}>{label}</RNText>
        {hint ? (
          <RNText style={typeStyle(world.recipes.row.note, language, world)}>{hint}</RNText>
        ) : null}
      </View>
      <Animated.View style={[styles.track, track]}>
        <Animated.View
          style={[
            styles.thumb,
            { backgroundColor: r.thumb.fill, borderColor: value ? r.track.on : t.line },
            thumb,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  words: { flex: 1, gap: 2 },
  track: {
    width: TRACK.w,
    height: TRACK.h,
    borderRadius: TRACK.h / 2,
    padding: TRACK.pad,
    justifyContent: 'center',
  },
  thumb: {
    width: TRACK.h - TRACK.pad * 2,
    height: TRACK.h - TRACK.pad * 2,
    borderRadius: TRACK.h,
    borderWidth: 1,
  },
});
