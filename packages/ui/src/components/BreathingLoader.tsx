/**
 * BREATHING LOADER - Pulsing Circle Animation
 *
 * A simple loader component with a breathing animation:
 * - Pulsing circle that scales from 0.8 to 1.0
 * - 1.5 second infinite loop cycle
 * - Centered in parent container
 * - Customizable size and color
 * - Respects reduced-motion accessibility preference
 *
 * Philosophy: Calm, meditative loading state that doesn't distract
 */

import { type FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { View } from '../primitives';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useAccessibility } from '../hooks/useAccessibility';
import { Theme } from '../theme/Theme';

interface BreathingLoaderProps {
  size?: number;
  color?: string;
}

const DEFAULT_SIZE = 50;
const DEFAULT_COLOR = Theme.colors.sanctuarySaffron;
const SCALE_MIN = 0.8;
const SCALE_MAX = 1.0;
const ANIMATION_DURATION = 1500;

const BreathingLoader: FC<BreathingLoaderProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
}) => {
  const { isReduceMotionEnabled } = useAccessibility();
  const { t } = useTranslation();
  const scale = useSharedValue(SCALE_MIN);

  useEffect(() => {
    if (isReduceMotionEnabled) {
      scale.value = SCALE_MAX;
      return;
    }
    scale.value = withRepeat(
      withTiming(SCALE_MAX, {
        duration: ANIMATION_DURATION,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [isReduceMotionEnabled, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={t('accessibility.loading')}
    >
      <Animated.View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {},
});

export default BreathingLoader;
