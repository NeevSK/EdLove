/**
 * RESONANCE TIMELINE
 * The visual manifestation of the Journey Path.
 * Standardized to Zero-Legacy: purged corrupted StyleSheet and migrated to NativeWind v4.
 */

import { View, Text, ScrollView } from 'react-native';
import { useTemporalStore } from '@repo/core/logic';
import { GenesisNode } from '@repo/self/components/GenesisNode';
import { TimelineEvent } from '@repo/self/components/TimelineEvent';
import { useJourneyData } from '@repo/self/hooks/useJourneyData';
import { WaitingSign } from '@repo/ui/components/native';
import type React from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';

export const ResonanceTimeline: React.FC = () => {
  const { journey, loading } = useJourneyData();
  const viewScale = useTemporalStore((s) => s.viewScale);
  const viewDate = useTemporalStore((s) => s.viewDate);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center min-h-[300px]">
        <WaitingSign size={48} />
        <Text className="text-mistGray/40 text-xs font-black uppercase tracking-[0.2em] mt-4">
          Synthesizing Journey Path...
        </Text>
      </View>
    );
  }

  if (journey.length === 0) {
    return (
      <View className="flex-1 items-center justify-center min-h-[200px]">
        <Text className="text-mistGray/30 text-sm italic font-medium">
          No resonance data found for this period.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.duration(800)}>
        {/* Timeline Header */}
        <View className="items-center mb-8 gap-1">
          <Text className="text-sacredWhite font-black tracking-tight">{viewDate}</Text>
          <View className="bg-sanctuarySaffron/10 px-3 py-1 rounded-full border border-sanctuarySaffron/20">
            <Text className="text-sanctuarySaffron text-[10px] font-black uppercase tracking-[0.2em]">
              {viewScale} Journey
            </Text>
          </View>
        </View>

        {/* Event Stream */}
        <View className="gap-0">
          {journey.map((event, index) =>
            event.type === 'path' ? (
              <GenesisNode key={event.id} timestamp={event.timestamp} />
            ) : (
              <TimelineEvent
                key={event.id}
                type={event.type as any}
                title={event.title}
                content={event.content}
                timestamp={event.timestamp}
                intensity={event.intensity}
                isLast={index === journey.length - 1}
              />
            ),
          )}
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default ResonanceTimeline;
