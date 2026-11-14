import { type AccessibilityActionEvent, Text as RNText, StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { alpha } from '../../../theme/color';
import type { SwipeAction, SwipeRowContract, SwipeTone } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import type { WorldTokens } from '../../../theme/types';

export type SwipeRowProps = SwipeRowContract;

/** Past this distance a swipe runs its action; short of it the row springs back. */
const THRESHOLD = 76;
const LIMIT = 120;
const SETTLE = { damping: 18, stiffness: 200 } as const;

function toneInk(t: WorldTokens, tone: SwipeTone): string {
  return tone === 'danger' ? t.danger : tone === 'success' ? t.success : t.lampDeep;
}

/**
 * A row with an action on each side, revealed by a sideways swipe. Swipes
 * are a shortcut, never the only way: each action is also an accessibility
 * action on the row, so screen-reader and switch users reach it by name.
 */
export function SwipeRow({ children, start, end, label }: SwipeRowProps) {
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const t = world.tokens;
  const radius = world.recipes.surface.raised.radius;
  const shift = useSharedValue(0);

  const run = (action: SwipeAction) => {
    feedback(action.tone === 'danger' ? 'destructive' : 'commit');
    action.onAction();
  };

  const pan = usePanGesture({
    activeOffsetX: [-15, 15],
    failOffsetY: [-8, 8],
    onUpdate: (event) => {
      'worklet';
      const min = end ? -LIMIT : 0;
      const max = start ? LIMIT : 0;
      shift.set(Math.max(min, Math.min(max, event.translationX)));
    },
    onDeactivate: (event) => {
      'worklet';
      shift.set(withSpring(0, SETTLE));
      if (start && event.translationX > THRESHOLD) scheduleOnRN(run, start);
      else if (end && event.translationX < -THRESHOLD) scheduleOnRN(run, end);
    },
  });

  const follow = useAnimatedStyle(() => ({ transform: [{ translateX: shift.get() }] }));
  const actions = [start, end].filter((a): a is SwipeAction => a !== undefined);
  const labelStyle = typeStyle(world.recipes.text.label, language, world);

  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityActions={actions.map((a) => ({ name: a.label, label: a.label }))}
      onAccessibilityAction={(event: AccessibilityActionEvent) => {
        const action = actions.find((a) => a.label === event.nativeEvent.actionName);
        if (action) run(action);
      }}
      style={styles.wrap}
    >
      <View
        style={[StyleSheet.absoluteFill, styles.under]}
        importantForAccessibility="no-hide-descendants"
      >
        {start ? (
          <View
            style={[
              styles.side,
              { backgroundColor: alpha(toneInk(t, start.tone), 0.14) },
              radiusStyle(radius),
            ]}
          >
            <RNText style={[labelStyle, { color: toneInk(t, start.tone) }]}>{start.label}</RNText>
          </View>
        ) : (
          <View style={styles.side} />
        )}
        {end ? (
          <View
            style={[
              styles.side,
              styles.sideEnd,
              { backgroundColor: alpha(toneInk(t, end.tone), 0.14) },
              radiusStyle(radius),
            ]}
          >
            <RNText style={[labelStyle, { color: toneInk(t, end.tone) }]}>{end.label}</RNText>
          </View>
        ) : null}
      </View>
      <GestureDetector gesture={pan}>
        <Animated.View style={follow}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  under: { flexDirection: 'row' },
  side: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  sideEnd: { alignItems: 'flex-end' },
});
