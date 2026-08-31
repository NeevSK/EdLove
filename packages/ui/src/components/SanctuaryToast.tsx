'use no memo';

import { Box } from '@repo/ui/components/ui/box';
import { Text } from '@repo/ui/components/ui/text';
import { useAccessibility } from '@repo/ui/hooks/useAccessibility';
import { CircleAlert, CircleCheck, Info, X } from '@repo/ui/icons';
import { Pressable } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { useCallback, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { runOnJS } from 'react-native-worklets';

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
  const { isReduceMotionEnabled } = useAccessibility();

  const getIconData = () => {
    switch (type) {
      case 'success':
        return { icon: CircleCheck, color: tokens.colors.success };
      case 'error':
        return { icon: CircleAlert, color: tokens.colors.error };
      case 'info':
        return { icon: Info, color: tokens.colors.info };
      case 'warning':
        return { icon: CircleAlert, color: tokens.colors.warning };
      default:
        return { icon: Info, color: tokens.colors.info };
    }
  };

  const { icon: Icon, color: iconColor } = getIconData();

  const hide = useCallback(() => {
    opacity.value = isReduceMotionEnabled ? 0 : withTiming(0);
    translateY.value = isReduceMotionEnabled
      ? -HIDDEN_Y_OFFSET
      : withTiming(-HIDDEN_Y_OFFSET, {}, (finished) => {
          if (finished && visible) {
            runOnJS(onHide)();
          }
        });
    if (isReduceMotionEnabled && visible) onHide();
  }, [visible, onHide, opacity, translateY, isReduceMotionEnabled]);

  useEffect(() => {
    if (!visible) {
      hide();
      return;
    }

    translateY.value = isReduceMotionEnabled ? 0 : withSpring(0, { damping: 15, stiffness: 100 });
    opacity.value = isReduceMotionEnabled ? 1 : withTiming(1);

    const timer = setTimeout(() => {
      hide();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, hide, duration, opacity, translateY, isReduceMotionEnabled]);

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
          backgroundColor: tokens.colors.toastSurface,
          borderWidth: 1,
          borderColor: tokens.colors.toastBorder,
          borderRadius: 16,
          padding: 16,
          width: '100%',
          maxWidth: 420,
          shadowColor: tokens.colors.shadowViolet,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.35,
          shadowRadius: 20,
          elevation: 12,
        }}
      >
        <Box style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon color={iconColor} size={24} />
          <Text
            style={{ color: tokens.colors.toastText, flex: 1, fontSize: 14, fontWeight: '500' }}
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
            <X size={18} color={tokens.colors.toastTextMuted} />
          </Pressable>
        </Box>
      </Box>
    </Animated.View>
  );
}
