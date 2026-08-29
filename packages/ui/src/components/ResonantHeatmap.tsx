import type React from 'react';
import { Box, HStack, Text, VStack } from '@repo/ui/primitives';
import { ScrollView } from '@repo/ui/primitives';

export interface HeatmapPoint {
  date: string;
  intensity: number; // 0 to 4
  count: number;
}

interface ResonantHeatmapProps {
  data: HeatmapPoint[];
  loading?: boolean;
}

/**
 * ResonantHeatmap
 *
 * A GitHub-style activity grid optimized for "Resonance Intensity".
 * Uses Sanctuary Saffron for active states.
 */
export const ResonantHeatmap: React.FC<ResonantHeatmapProps> = ({ data, loading }) => {
  // Generate empty grid for a year if data is missing
  // Simplified: Show 52 weeks (364 days)
  const weeks = Array.from({ length: 52 }, (_, wIndex) => {
    return Array.from({ length: 7 }, (_, dIndex) => {
      const dayOffset = wIndex * 7 + dIndex;
      // Map data to grid (this is a simplified mock mapping)
      const point = data[dayOffset % data.length]; // In real use, map by date
      return point?.intensity || 0;
    });
  });

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 1:
        return 'rgba(246, 191, 140, 0.2)'; // Very Light Saffron
      case 2:
        return 'rgba(246, 191, 140, 0.4)';
      case 3:
        return 'rgba(246, 191, 140, 0.7)';
      case 4:
        return '#F6BF8C'; // Solid Sanctuary Saffron
      default:
        return 'rgba(255, 255, 255, 0.05)';
    }
  };

  if (loading) {
    return (
      <Box className="h-24 justify-center items-center">
        <Text className="text-white/40 text-xs italic">Visualizing growth arc...</Text>
      </Box>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 10 }}
    >
      <HStack className="gap-[3px]">
        {weeks.map((week, wIndex) => (
          <VStack key={wIndex} className="gap-[3px]">
            {week.map((intensity, dIndex) => (
              <Box
                key={dIndex}
                className="w-2.5 h-2.5 rounded-[2px]"
                style={{ backgroundColor: getIntensityColor(intensity) }}
              />
            ))}
          </VStack>
        ))}
      </HStack>
    </ScrollView>
  );
};
