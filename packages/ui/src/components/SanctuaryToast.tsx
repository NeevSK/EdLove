import { AlertCircle, CheckCircle, Info, X } from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Box, HStack, Text } from '../gluestack';

export type ToastType = 'success' | 'error' | 'info';

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
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  const getIconData = () => {
    switch (type) {
      case 'success':
        return { icon: CheckCircle, color: '#10B981' }; // phase-reward
      case 'error':
        return { icon: AlertCircle, color: '#EF4444' }; // phase-danger
      case 'info':
        return { icon: Info, color: '#F6BF8C' }; // phase-accent
    }
  };

  const { icon: Icon, color: iconColor } = getIconData();

  const hide = useCallback(() => {
    opacity.value = withTiming(0);
    translateY.value = withTiming(100, {}, (finished) => {
      if (finished && visible) {
        runOnJS(onHide)();
      }
    });
  }, [opacity, translateY, visible, onHide]);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15 });
      opacity.value = withTiming(1);

      const timer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(timer);
    }
    hide();
  }, [visible, translateY, opacity, hide, duration]);

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
          bottom: 100,
          left: 20,
          right: 20,
          alignItems: 'center',
          zIndex: 1000,
        },
        animatedStyle,
      ]}
    >
      <Box className="bg-phase-surface p-4 rounded-xl border border-white/10 shadow-xl w-full max-w-[400px]">
        <HStack className="items-center gap-3">
          <Icon color={iconColor} size={24} />
          <Text className="text-white text-sm font-medium flex-1">{message}</Text>
          <Pressable accessibilityRole="button" onPress={hide} className="p-1 active:opacity-60">
            <X className="text-phase-text-secondary" size={18} color="#666" />
          </Pressable>
        </HStack>
      </Box>
    </Animated.View>
  );
}
