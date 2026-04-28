import { useManualSnapshot, useTemporalHeatmap } from '@repo/core/logic';
import {
  Calendar,
  Camera,
  Clock,
  History,
  type LucideIcon,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react-native';
import type React from 'react';
import { useMemo } from 'react';
import { Pressable } from 'react-native';
import { Box, HStack, Text, VStack } from '../gluestack';
import { ResonantHeatmap } from './ResonantHeatmap';
import SanctuaryCard from './SanctuaryCard';
import { SanctuaryChip } from './SanctuaryChip';

export interface JourneyEvent {
  id: string;
  timestamp: string;
  type: 'mood' | 'journal' | 'growth' | 'impact' | 'system' | 'reward' | 'moment';
  title: string;
  description?: string;
  accentColor?: string;
}

interface JourneyHistoryCardProps {
  events: JourneyEvent[];
  summary?: string;
  loading?: boolean;
  scale?: 'day' | 'week' | 'month' | 'year';
  className?: string;
}

const getEventIcon = (type: string): LucideIcon => {
  switch (type) {
    case 'mood':
      return Sparkles;
    case 'journal':
      return MessageSquare;
    case 'impact':
      return Zap;
    case 'growth':
      return Calendar;
    case 'reward':
      return Sparkles;
    case 'moment':
      return Clock;
    default:
      return History;
  }
};

export const JourneyHistoryCard: React.FC<JourneyHistoryCardProps> = ({
  events,
  summary,
  loading,
  scale = 'day',
  className,
}) => {
  const { takeSnapshot, isSaving } = useManualSnapshot();
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const { heatmap, isLoading: heatmapLoading } = useTemporalHeatmap(currentYear);

  if (loading) {
    return (
      <SanctuaryCard className={className}>
        <Text className="text-phase-text-secondary text-center italic my-10">
          Loading temporal history...
        </Text>
      </SanctuaryCard>
    );
  }

  return (
    <SanctuaryCard className={className}>
      <HStack className="items-center justify-between mb-4">
        <HStack className="items-center gap-2">
          <History size={18} className="text-phase-accent" />
          <Text className="text-sm font-extrabold text-phase-accent uppercase tracking-widest">
            Temporal History
          </Text>
        </HStack>
        <HStack className="items-center gap-3">
          <Pressable
            accessibilityRole="button"
            onPress={() => takeSnapshot(`Snapshot: ${new Date().toLocaleDateString()}`)}
            disabled={isSaving}
            className={`p-1.5 rounded-lg bg-phase-accent/10 border border-phase-accent/20 ${isSaving ? 'opacity-30' : ''}`}
          >
            <Camera size={16} className="text-phase-accent" />
          </Pressable>
          <SanctuaryChip label={scale.toUpperCase()} variant="tag" size="sm" />
        </HStack>
      </HStack>

      {summary && <Text className="text-xs italic text-phase-text-secondary mb-5">{summary}</Text>}

      {scale === 'year' ? (
        <VStack className="mt-2.5">
          <HStack className="items-center gap-1.5 mb-3">
            <TrendingUp size={14} className="text-phase-accent" />
            <Text className="text-xs font-bold text-phase-text-secondary uppercase tracking-[0.5px]">
              Growth Arc Intensity
            </Text>
          </HStack>
          <ResonantHeatmap data={heatmap} loading={heatmapLoading} />
          <Text className="text-[11px] italic text-phase-text-secondary/50 mt-3">
            Tapping a cell zooms into that temporal focus.
          </Text>
        </VStack>
      ) : (
        <VStack className="mt-2">
          {events.length === 0 ? (
            <Text className="text-sm text-center text-phase-text-secondary/40 my-5">
              The temporal field is quiet here.
            </Text>
          ) : (
            events.map((event, index) => {
              const Icon = getEventIcon(event.type);
              const time = new Date(event.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <HStack key={event.id} className="mb-5">
                  <VStack className="w-5 items-center">
                    <Box
                      style={{ backgroundColor: event.accentColor || '#F6BF8C' }}
                      className="w-2 h-2 rounded-full z-[2] mt-1.5"
                    />
                    {index < events.length - 1 && (
                      <Box className="absolute top-3.5 bottom-[-10px] w-px bg-white/10" />
                    )}
                  </VStack>
                  <VStack className="flex-1 ml-3">
                    <HStack className="items-center justify-between mb-1">
                      <HStack className="items-center gap-1.5">
                        <Icon size={14} color={event.accentColor || '#F6BF8C'} />
                        <Text className="text-sm font-semibold text-white">{event.title}</Text>
                      </HStack>
                      <Text className="text-[11px] text-phase-text-secondary/60">{time}</Text>
                    </HStack>
                    {event.description && (
                      <Text
                        className="text-sm text-phase-text-secondary leading-4.5"
                        numberOfLines={2}
                      >
                        {event.description}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              );
            })
          )}
        </VStack>
      )}
    </SanctuaryCard>
  );
};
