import {
  Pressable,
  Text as RNText,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import type { StepsContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useLivingStyle } from '../../../theme/native/motion';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { BASICS_ENGLISH } from '../../shared/basics';

export interface StepsProps extends StepsContract {
  style?: StyleProp<ViewStyle>;
}

function Segment({ lit, failed }: { lit: boolean; failed: boolean }) {
  const { world } = useWorldContext();
  const fill = useLivingStyle({
    backgroundColor: failed
      ? world.tokens.danger
      : lit
        ? world.recipes.toggle.track.on
        : world.tokens.line,
  });
  return <Animated.View style={[styles.segment, fill]} />;
}

/**
 * Where a person is in a sequence: "Step 2 of 5" and the step's name, over
 * a trail of segments lit up to here (gliding in the world's light). Done
 * steps can be gone back to; errors are said in words as well as drawn.
 */
export function Steps({ steps, current, label, onSelect, labels, style }: StepsProps) {
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const l = { ...BASICS_ENGLISH, ...labels };
  const text = world.recipes.text;
  const here = steps[current];
  return (
    <View role="group" aria-label={label} style={[styles.steps, style]}>
      <RNText accessibilityLiveRegion="polite" style={typeStyle(text.caption, language, world)}>
        {l.step(current + 1, steps.length)}
        {here ? ` · ${here.label}` : ''}
      </RNText>
      <View style={styles.trail}>
        {steps.map((s, i) => {
          const reachable = !!onSelect && (i <= current || s.state === 'done');
          const name = [
            l.step(i + 1, steps.length),
            s.label,
            s.state === 'done' ? l.done : s.state === 'error' ? l.error : null,
          ]
            .filter(Boolean)
            .join(', ');
          return (
            <Pressable
              key={s.key}
              role="button"
              accessibilityLabel={name}
              accessibilityState={{ selected: i === current, disabled: !reachable }}
              disabled={!reachable}
              onPress={() => {
                feedback('select');
                onSelect?.(i);
              }}
              hitSlop={{ top: 16, bottom: 16 }}
              style={styles.press}
            >
              <Segment lit={i <= current || s.state === 'done'} failed={s.state === 'error'} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  steps: { gap: 8 },
  trail: { flexDirection: 'row', gap: 4 },
  press: { flex: 1, paddingVertical: 6 },
  segment: { height: 4, borderRadius: 2 },
});
