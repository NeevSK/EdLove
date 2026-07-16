/**
 * SPOTLIGHT EMPTY
 * An encouraging empty state view for dates with no resonance data.
 * Standardized to Zero-Legacy: purged corrupted StyleSheet and migrated to NativeWind v4.
 */

import { Plus, Sparkles } from '@repo/ui/icons';
import { Box, Button, ButtonText, HStack, Icon, Text, VStack } from '@repo/ui/primitives';
import type React from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';

interface SpotlightEmptyProps {
  date: string;
  onAction?: () => void;
}

export const SpotlightEmpty: React.FC<SpotlightEmptyProps> = ({ date, onAction }) => {
  return (
    <Animated.View entering={FadeIn.duration(1000)}>
      <VStack className="flex-1 items-center justify-center p-10 min-h-[400px]">
        {/* Ethereal Icon Container */}
        <Box className="mb-6 p-8 rounded-full bg-sanctuarySaffron/5 border border-sanctuarySaffron/10">
          <Icon as={Sparkles} size={48} className="text-sanctuarySaffron opacity-40" />
        </Box>

        <VStack className="gap-2 items-center">
          <Text className="text-sanctuarySaffron font-black text-lg tracking-[0.3em] uppercase">
            Quiet Resonance
          </Text>
          <Text className="text-mistGray/50 text-sm text-center px-4">
            No whispers from the past on{' '}
            {new Date(date).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
            .
          </Text>
        </VStack>

        <Box className="my-6 w-12 h-px bg-white/5" />

        <Text className="text-mistGray/30 text-xs text-center leading-relaxed italic max-w-[240px]">
          Every quiet moment is a canvas. Start a new thread in your journey today.
        </Text>

        {onAction && (
          <Button
            onPress={onAction}
            className="mt-10 bg-sanctuarySaffron rounded-full px-8 py-3 shadow-xl shadow-sanctuarySaffron/20 h-14"
          >
            <HStack className="items-center gap-2">
              <Icon as={Plus} size={18} className="text-obsidian" />
              <ButtonText className="text-obsidian font-black uppercase tracking-widest text-xs">
                Create Resonance
              </ButtonText>
            </HStack>
          </Button>
        )}
      </VStack>
    </Animated.View>
  );
};

export default SpotlightEmpty;
