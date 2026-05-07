import { Flower } from 'lucide-react-native';
import { useEffect } from 'react';
import { ActivityIndicator } from '../primitives';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Center, Text, VStack } from '../gluestack';

interface LotusLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullscreen?: boolean;
}

const SIZES = {
  sm: 24,
  md: 48,
  lg: 72,
};

export default function LotusLoader({
  size = 'md',
  text = 'Loading...',
  fullscreen = false,
}: LotusLoaderProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Breathing animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    // Glow pulse
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 1500 }), withTiming(0.6, { duration: 1500 })),
      -1,
      true,
    );

    // Gentle rotation
    rotation.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [
    // Breathing animation
    scale, // Gentle rotation
    rotation, // Glow pulse
    opacity,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }] as any,
    opacity: opacity.value,
  }));

  const content = (
    <VStack space="md" className="items-center justify-center">
      <Animated.View style={animatedStyle}>
        <Flower size={SIZES[size]} className="text-phase-accent" strokeWidth={1.5} />
      </Animated.View>
      <ActivityIndicator size="large" className="text-phase-text-secondary" />
      {text && <Text className="text-phase-text-secondary text-sm tracking-[1px]">{text}</Text>}
    </VStack>
  );

  if (fullscreen) {
    return (
      <Center className="flex-1 z-[1000] bg-phase-canvas absolute top-0 left-0 right-0 bottom-0">
        {content}
      </Center>
    );
  }

  return <Center className="p-8">{content}</Center>;
}
