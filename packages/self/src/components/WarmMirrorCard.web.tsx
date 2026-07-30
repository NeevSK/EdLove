/**
 * WARM MIRROR CARD (Web)
 * Displays the user's weekly story/reflection summary on web.
 * Standardized to Zero-Legacy: purged raw HTML/inline styles and fixed syntax corruption in style objects.
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
      <Box className="p-xl bg-skyBlue/5 rounded-2xl border border-skyBlue/10 shadow-sm">
        <VStack className="gap-4">
          <HStack className="items-center gap-2">
            <Icon as={BookOpen} size={14} className="text-skyBlue" />
            <Text className="text-[10px] uppercase font-black tracking-[0.2em] text-skyBlue">
              Your week as a story
            </Text>
          </HStack>

          <Text className="text-sacredWhite/80 text-base leading-relaxed italic font-medium">
            "{text}"
          </Text>

          <Box className="w-8 h-1 bg-skyBlue/20 rounded-full mt-2" />
        </VStack>
      </Box>
    </Animated.View>
  );
}

export default WarmMirrorCard;
