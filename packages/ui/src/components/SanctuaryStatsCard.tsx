import React from 'react';
import { Box, VStack, HStack, Text } from '../gluestack';
import { Trophy } from 'lucide-react-native';
import { SanctuaryProgressBar } from './SanctuaryProgressBar';

export interface SanctuaryStatsItem {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}

export interface SanctuaryStatsCardProps {
  title: string;
  items: SanctuaryStatsItem[];
  progressLabel?: string;
  progressValue?: number;
  showTrophy?: boolean;
}

/**
 * A standardized statistics and gamification card for the Sanctuary design system.
 * Displays key metrics and a progress bar.
 * Hardened v3 implementation with NativeWind.
 */
export default function SanctuaryStatsCard({
  title,
  items,
  progressLabel,
  progressValue = 0,
  showTrophy = true,
}: SanctuaryStatsCardProps) {
  return (
    <Box
      className="bg-phase-surface border border-phase-surface rounded-generous p-6 shadow-xl"
      style={{
        shadowColor: '#6B6480',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <HStack className="items-center gap-2 mt-2 mb-4">
        {showTrophy && <Trophy size={18} color="#FDD925" />}
        <Text className="text-phase-text-primary font-bold text-base">{title}</Text>
      </HStack>

      <HStack className="justify-between mb-4">
        {items.map((item, index) => (
          <VStack key={index} className="flex-1 items-center justify-center gap-1">
            <Box className="p-3 rounded-xl mb-1" style={{ backgroundColor: `${item.color}20` }}>
              <item.icon size={20} color={item.color} />
            </Box>
            <VStack className="items-center">
              <Text className="text-phase-text-primary font-bold text-lg text-center">
                {item.value}
              </Text>
              <Text className="text-phase-text-tertiary text-[10px] text-center uppercase tracking-tighter">
                {item.label}
              </Text>
            </VStack>
          </VStack>
        ))}
      </HStack>

      {/* Progress Section */}
      {(progressLabel || progressValue > 0) && (
        <SanctuaryProgressBar
          percentage={progressValue}
          nextHint={progressLabel}
          showPercentage={true}
          compact={true}
        />
      )}
    </Box>
  );
}
