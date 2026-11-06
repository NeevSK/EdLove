/**
 * SPOTLIGHT EMPTY
 * An encouraging empty state view for dates with no resonance data.
 * Standardized to October 29+ UI Kit architecture.
 */

import { Button, Text } from '@repo/ui/components/native';
import { Plus, Sparkles } from '@repo/ui/icons';
import type React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface SpotlightEmptyProps {
  date: string;
  onAction?: () => void;
}

export const SpotlightEmpty: React.FC<SpotlightEmptyProps> = ({ date, onAction }) => {
  return (
    <Animated.View entering={FadeIn.duration(1000)}>
      <View className="flex-1 items-center justify-center p-10 min-h-[400px]">
        {/* Ethereal Icon Container */}
        <View className="mb-6 p-8 rounded-full bg-sanctuarySaffron/5 border border-sanctuarySaffron/10 items-center justify-center">
          <Sparkles size={48} className="text-sanctuarySaffron opacity-40" />
        </View>

        <View className="gap-2 items-center">
          <Text kind="title" tone="lamp" align="center">
            Quiet Resonance
          </Text>
          <Text kind="body" tone="soft" align="center">
            No whispers from the past on{' '}
            {new Date(date).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
            .
          </Text>
        </View>

        <View className="my-6 w-12 h-px bg-white/10" />

        <Text kind="caption" tone="faint" align="center">
          Every quiet moment is a canvas. Start a new thread in your journey today.
        </Text>

        {onAction && (
          <View className="mt-8">
            <Button
              label="Create Resonance"
              icon={Plus}
              variant="primary"
              size="lg"
              onPress={onAction}
            />
          </View>
        )}
      </View>
    </Animated.View>
  );
};

export default SpotlightEmpty;
