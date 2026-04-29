/**
 * RESONANCE TIMELINE
 * The visual manifestation of the Journey Path.
 * Standardized to Zero-Legacy: purged corrupted StyleSheet and migrated to NativeWind v4.
 */

import { useTemporalStore } from '@repo/core/logic';

import { Box } from '@repo/ui/primitives';
import { Heading, Spinner, Text, VStack } from '@repo/ui/primitives';
import { ScrollView } from '@repo/ui/primitives';

import type React from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useJourneyData } from '../hooks/useJourneyData';
import { GenesisNode } from './GenesisNode';
import { TimelineEvent } from './TimelineEvent';

export const ResonanceTimeline: React.FC = () => {
  const { journey, loading } = useJourneyData();
  const { viewScale, viewDate } = useTemporalStore();

  if (loading) {
    return (
      <Box className="flex-1 items-center justify-center min-h-[300px]">
        <Spinner size="large" className="text-sanctuarySaffron" />
        <Text className="text-mistGray/40 text-xs font-black uppercase tracking-[0.2em] mt-4">
          Synthesizing Journey Path...
        </Text>
      </Box>
    );
  }

  if (journey.length === 0) {
    return (
      <Box className="flex-1 items-center justify-center min-h-[200px]">
        <Text className="text-mistGray/30 text-sm italic font-medium">
          No resonance data found for this period.
        </Text>
      </Box>
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
        <VStack className="items-center mb-8 gap-1">
          <Heading size="xl" className="text-sacredWhite font-black tracking-tight">
            {viewDate}
          </Heading>
          <Box className="bg-sanctuarySaffron/10 px-3 py-1 rounded-full border border-sanctuarySaffron/20">
            <Text className="text-sanctuarySaffron text-[10px] font-black uppercase tracking-[0.2em]">
              {viewScale} Journey
            </Text>
          </Box>
        </VStack>

        {/* Event Stream */}
        <VStack className="gap-0">
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
        </VStack>
      </Animated.View>
    </ScrollView>
  );
};

export default ResonanceTimeline;
