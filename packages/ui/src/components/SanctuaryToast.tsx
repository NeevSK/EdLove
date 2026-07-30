/* eslint-disable react/react-compiler */
'use no memo';

import { CircleAlert, CircleCheck, Info, X } from '@repo/ui/icons';
import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';
import { Pressable } from '@repo/ui/primitives';
import { Box } from '@repo/ui/components/ui/box';
import { Text } from '@repo/ui/components/ui/text';

export type ToastType = 'success' | 'error' | 'info';

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

  const getIconData = () => {
    switch (type) {
      case 'success':
        return { icon: CircleCheck, color: '#10B981' }; // phase-reward
      case 'error':
        return { icon: CircleAlert, color: '#EF4444' }; // phase-danger
      case 'info':
        return { icon: Info, color: '#F6BF8C' }; // phase-accent
      default:
        return { icon: Info, color: '#F6BF8C' };
    }
  };

  const { icon: Icon, color: iconColor } = getIconData();

  const hide = useCallback(() => {
    opacity.value = withTiming(0);
    translateY.value = withTiming(-HIDDEN_Y_OFFSET, {}, (finished) => {
      if (finished && visible) {
        runOnJS(onHide)();
      }
    });
  }, [visible, onHide, opacity, translateY]);

  useEffect(() => {
    if (!visible) {
      hide();
      return;
    }

    translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    opacity.value = withTiming(1);

    const timer = setTimeout(() => {
      hide();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, hide, duration, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        {
          position: 'absolute',
          top: Platform.OS === 'web' ? 24 : 60,
          left: 20,
          right: 20,
          alignItems: 'center',
          zIndex: 999999,
        },
        animatedStyle,
      ]}
    >
      <Box
        style={{
          backgroundColor: '#1C1917', // Solid warm black (Stone 900)
          borderWidth: 1,
          borderColor: 'rgba(246, 191, 140, 0.2)', // Accent gold tint
          borderRadius: 16,
          padding: 16,
          width: '100%',
          maxWidth: 420,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.35,
          shadowRadius: 20,
          elevation: 12,
        }}
      >
        <Box style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon color={iconColor} size={24} />
          <Text style={{ color: '#FFFFFF', flex: 1, fontSize: 14, fontWeight: '500' }}>
            {message}
          </Text>
          <Pressable accessibilityRole="button" onPress={hide} className="p-1 active:opacity-60">
            <X size={18} color="#9CA3AF" />
          </Pressable>
        </Box>
      </Box>
    </Animated.View>
  );
}
