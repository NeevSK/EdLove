import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { EaseView } from '@repo/ui/components/EaseView';
import { useAccessibility } from '@repo/ui/hooks/useAccessibility';
import { Theme } from '@repo/ui/theme/Theme';

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

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={t('accessibility.loading')}
    >
      <EaseView
        initialAnimate={{ scale: isReduceMotionEnabled ? SCALE_MAX : SCALE_MIN }}
        animate={{ scale: isReduceMotionEnabled ? SCALE_MAX : SCALE_MAX }}
        transition={
          isReduceMotionEnabled
            ? { type: 'none' }
            : { type: 'timing', duration: ANIMATION_DURATION, easing: 'easeInOut', loop: 'reverse' }
        }
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
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
