'use no memo';

import { Box } from '@repo/ui/components/ui/box';
import { Text } from '@repo/ui/components/ui/text';
import { CircleAlert, CircleCheck, Info, X } from '@repo/ui/icons';
import { Pressable } from '@repo/ui/primitives';
import { useCallback, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { useWorldMotion } from '../world/native/motion';
import { edgeStyle, radiusStyle, shadowStyle, typeStyle } from '../world/native/style';
import { useWorldContext } from '../world/native/WorldContext';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Constants to avoid negative literals in worklets
const HIDDEN_Y_OFFSET = 120;

interface SanctuaryToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export default function SanctuaryToast({
  message,
  type = 'info',
  visible,
  onHide,
  duration = 3000,
}: SanctuaryToastProps) {
  'use no memo';
  const translateY = useSharedValue(-HIDDEN_Y_OFFSET);
  const opacity = useSharedValue(0);
  const insets = useContext(SafeAreaInsetsContext) ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const { world, language } = useWorldContext();
  const t = world.tokens;
  const raised = world.recipes.surface.raised;
  const motion = useWorldMotion();
  // Verger's motion level already includes the OS reduce-motion setting.
  const isReduceMotionEnabled = !motion.animates;

  const getIconData = () => {
    switch (type) {
      case 'success':
        return { icon: CircleCheck, color: t.success };
      case 'error':
        return { icon: CircleAlert, color: t.danger };
      case 'warning':
        return { icon: CircleAlert, color: t.lampDeep };
      default:
        return { icon: Info, color: t.lampDeep };
    }
  };

  const { icon: Icon, color: iconColor } = getIconData();

  const hide = useCallback(() => {
    // Leaving is quicker than arriving, and never bounces.
    const leave = motion.timing('micro');
    opacity.value = isReduceMotionEnabled ? 0 : withTiming(0, leave);
    translateY.value = isReduceMotionEnabled
      ? -HIDDEN_Y_OFFSET
      : withTiming(-HIDDEN_Y_OFFSET, leave, (finished) => {
          if (finished && visible) {
            scheduleOnRN(onHide);
          }
        });
    if (isReduceMotionEnabled && visible) onHide();
  }, [visible, onHide, opacity, translateY, isReduceMotionEnabled, motion]);

  useEffect(() => {
    if (!visible) {
      hide();
      return;
    }

    // Under essential motion the toast only fades in; it does not travel.
    const travels = motion.from.x !== 0 || motion.from.y !== 0;
    if (isReduceMotionEnabled || !travels) translateY.value = 0;
    else
      translateY.value = motion.spring
        ? withSpring(0, motion.spring)
        : withTiming(0, motion.timing());
    opacity.value = isReduceMotionEnabled ? 1 : withTiming(1, motion.timing());

    const timer = setTimeout(() => {
      hide();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, hide, duration, opacity, translateY, isReduceMotionEnabled, motion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: Platform.OS === 'web' ? 24 : Math.max(insets.top + 12, 24),
          left: 20,
          right: 20,
          alignItems: 'center',
          zIndex: 999999,
          pointerEvents: 'box-none',
        },
        animatedStyle,
      ]}
    >
      <Box
        style={{
          backgroundColor: raised.fill ?? t.raised,
          borderWidth: 1,
          borderColor: t.line,
          ...radiusStyle(raised.radius),
          ...edgeStyle(raised.edge),
          ...shadowStyle(raised.shadow),
          padding: 16,
          width: '100%',
          maxWidth: 420,
        }}
      >
        <Box style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon color={iconColor} size={24} />
          <Text
            style={[
              typeStyle(world.recipes.text.body, language, world, 14),
              { color: t.ink, flex: 1 },
            ]}
          >
            {message}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification"
            accessibilityHint="Closes this notification"
            onPress={hide}
            className="p-1 active:opacity-60"
          >
            <X size={18} color={t.inkSoft} />
          </Pressable>
        </Box>
      </Box>
    </Animated.View>
  );
}
