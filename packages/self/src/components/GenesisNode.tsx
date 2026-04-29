/**
 * GENESIS NODE
 * A specialized marker that signals the beginning of a user's sanctuary journey.
 * Standardized to Zero-Legacy: purged corrupted StyleSheet and migrated to NativeWind v4.
 */

import { Box } from '@repo/ui/primitives';
import { HStack, Icon, Text, VStack } from '@repo/ui/primitives';
import { Rocket } from 'lucide-react-native';
import type React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface GenesisNodeProps {
  timestamp: string;
}

export const GenesisNode: React.FC<GenesisNodeProps> = ({ timestamp }) => {
  return (
    <Animated.View entering={FadeInUp.duration(1000)}>
      <HStack className="min-h-[120px] gap-2">
        {/* Visual Path Container */}
        <VStack className="w-10 items-center">
          <Box className="w-10 h-10 rounded-full bg-sanctuarySaffron/20 border border-sanctuarySaffron items-center justify-center z-10 shadow-lg shadow-sanctuarySaffron/10">
            <Icon as={Rocket} size={18} className="text-sanctuarySaffron" />
          </Box>
          <Box className="w-0.5 flex-1 bg-sanctuarySaffron/20 z-0" />
        </VStack>

        {/* Content Area */}
        <VStack className="flex-1 pt-1 pl-3 gap-2">
          <Text className="text-sanctuarySaffron font-black text-base tracking-[0.2em] uppercase">
            Journey Starts Here
          </Text>

          <Text className="text-mistGray/40 text-[11px] font-black uppercase tracking-widest">
            {new Date(timestamp).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>

          <Text className="text-mistGray/60 text-xs leading-relaxed italic pr-4 mt-1">
            "The first pulse of your temporal resonance. Every step from here builds your story."
          </Text>

          <Box className="mt-4 w-8 h-1 bg-sanctuarySaffron/20 rounded-full" />
        </VStack>
      </HStack>
    </Animated.View>
  );
};

export default GenesisNode;
