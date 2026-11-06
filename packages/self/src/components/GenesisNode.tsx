/**
 * GENESIS NODE
 * A specialized marker that signals the beginning of a user's sanctuary journey.
 * Reconstructed: Purged legacy UI primitives and bound to useWorld().tokens.
 */

import { Rocket } from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import type React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface GenesisNodeProps {
  timestamp: string;
}

export const GenesisNode: React.FC<GenesisNodeProps> = ({ timestamp }) => {
  const { tokens } = useWorld();

  return (
    <Animated.View entering={FadeInUp.duration(1000)}>
      <View className="min-h-[120px] flex-row gap-2">
        {/* Visual Path Container */}
        <View className="w-10 items-center">
          <View className="w-10 h-10 rounded-full bg-sanctuarySaffron/20 border border-sanctuarySaffron items-center justify-center z-10 shadow-lg shadow-sanctuarySaffron/10">
            <Rocket size={18} color={tokens.lampDeep} />
          </View>
          <View className="w-0.5 flex-1 bg-sanctuarySaffron/20 z-0" />
        </View>

        {/* Content Area */}
        <View className="flex-1 pt-1 pl-3 gap-2">
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

          <View className="mt-4 w-8 h-1 bg-sanctuarySaffron/20 rounded-full" />
        </View>
      </View>
    </Animated.View>
  );
};

export default GenesisNode;
