import { Trophy } from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Box, Center, Text, VStack } from '../gluestack';

const { width } = Dimensions.get('window');

interface AchievementUnlockOverlayProps {
  title: string;
  visible: boolean;
  onHide: () => void;
}

/**
 * AchievementUnlockOverlay
 *
 * A high-impact, temporary overlay for celebrating progress.
 * Hardened v3 implementation with NativeWind.
 */
export default function AchievementUnlockOverlay({
  title,
  visible,
  onHide,
}: AchievementUnlockOverlayProps) {
  const translateY = useSharedValue(-200);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  const performHide = useCallback(() => {
    opacity.value = withTiming(0, { duration: 300 });
    scale.value = withTiming(0.8, { duration: 300 });
    translateY.value = withTiming(-200, { duration: 400 }, (finished) => {
      if (finished) {
        runOnJS(onHide)();
      }
    });
  }, [opacity, scale, translateY, onHide]);

  useEffect(() => {
    if (!visible) return;

    // Animate In
    translateY.value = withSpring(60, { damping: 12 });
    opacity.value = withTiming(1, { duration: 400 });
    scale.value = withSpring(1, { damping: 10 });

    // Auto Hide after 4 seconds
    const timer = setTimeout(() => {
      performHide();
    }, 4000);

    return () => clearTimeout(timer);
  }, [visible, translateY, scale, opacity, performHide]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }] as any,
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 1000,
        },
        animatedStyle,
      ]}
    >
      <Box
        className="bg-ink border-2 border-templeGold rounded-generous p-6 shadow-2xl items-center"
        style={{
          width: width * 0.85,
          shadowColor: '#FDD925',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 15,
          elevation: 20,
        }}
      >
        <VStack className="items-center gap-2">
          <Center className="p-3 bg-templeGold/20 rounded-full mb-2">
            <Trophy color="#FDD925" size={40} />
          </Center>

          <Text className="text-templeGold font-bold text-lg uppercase tracking-wider">
            Achievement Unlocked!
          </Text>

          <Text className="text-sacredWhite font-bold text-center text-xl">{title}</Text>

          <Text className="text-starlightGray text-sm text-center">
            Your discovery adds to the sanctuary.
          </Text>
        </VStack>
      </Box>
    </Animated.View>
  );
}
