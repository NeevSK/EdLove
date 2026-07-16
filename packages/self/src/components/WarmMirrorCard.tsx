/**
 * WARM MIRROR CARD
 * Renders the "Your Week as a Story" narrative reflection.
 * Standardized to Zero-Legacy: purged corrupted StyleSheet and migrated to NativeWind v4.
 */

import { BookOpen } from '@repo/ui/icons';
import { Box, HStack, Icon, Text, VStack } from '@repo/ui/primitives';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface WarmMirrorCardProps {
  text: string | null;
}

export function WarmMirrorCard({ text }: WarmMirrorCardProps) {
  if (!text) return null;

  return (
    <Animated.View entering={FadeInUp.duration(600)}>
      <Box className="p-xl bg-skyBlue/5 rounded-3xl border border-skyBlue/10 shadow-sm overflow-hidden">
        <VStack className="gap-4">
          {/* Header */}
          <HStack className="items-center gap-2">
            <Icon as={BookOpen} size={14} className="text-skyBlue" />
            <Text className="text-skyBlue text-[10px] font-black uppercase tracking-[0.2em]">
              Your Week as a Story
            </Text>
          </HStack>

          {/* Narrative Content */}
          <Text className="text-sacredWhite/80 text-base leading-relaxed italic font-medium">
            "{text}"
          </Text>

          {/* Decorative Footer */}
          <Box className="mt-2 h-0.5 bg-skyBlue/10 rounded-full w-8" />
        </VStack>
      </Box>
    </Animated.View>
  );
}

export default WarmMirrorCard;
