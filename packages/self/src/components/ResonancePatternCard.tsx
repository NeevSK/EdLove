/**
 * RESONANCE PATTERN CARD
 * Displays the user's somatic/behavioral fingerprint using Skia Radar Chart.
 * Standardized to Zero-Legacy: purged sx props and fixed severe syntax corruption in style objects.
 */

import { usePermissions } from '@repo/core/logic';
import type { OrientationSeeds } from '@repo/profile';
import { Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';

import { Canvas, Circle, Group, Line, Path, Skia, vec } from '@shopify/react-native-skia';
import { Activity, ArrowRight, Sparkles } from 'lucide-react-native';
import { useMemo } from 'react';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { useOrientationInference } from '../hooks/useOrientationInference';
import type { EnergyForecast, MoodLog } from '../types/Wellbeing';

// —————————————————————————————————————————————————————————————————————————————
// CONSTANTS
// —————————————————————————————————————————————————————————————————————————————

const CHART_SIZE = 140;
const CENTER = CHART_SIZE / 2;
const MAX_RADIUS = 54;

const AXES = [
  { key: 'depth_breadth', lo: 'Deep', hi: 'Wide', angle: -90 },
  { key: 'reflect_act', lo: 'Reflect', hi: 'Act', angle: 0 },
  { key: 'solo_social', lo: 'Solo', hi: 'Social', angle: 90 },
  { key: 'steady_surge', lo: 'Steady', hi: 'Surge', angle: 180 },
] as const;

// —————————————————————————————————————————————————————————————————————————————
// HELPERS
// —————————————————————————————————————————————————————————————————————————————

function polar(angleDeg: number, radius: number): { x: number; y: number } {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

function buildPoints(seeds: Record<string, number>): { x: number; y: number }[] {
  return AXES.map((axis) => {
    const value = seeds[axis.key] ?? 50;
    const r = (value / 100) * MAX_RADIUS;
    return polar(axis.angle, r);
  });
}

// —————————————————————————————————————————————————————————————————————————————
// RADAR CHART
// —————————————————————————————————————————————————————————————————————————————

function RadarChart({ points, color }: { points: { x: number; y: number }[]; color: string }) {
  const gridRadii = [MAX_RADIUS * 0.33, MAX_RADIUS * 0.66, MAX_RADIUS];

  const polygonPath = useMemo(() => {
    const path = Skia.Path.Make();
    if (!points || points.length === 0 || !points[0]) return path;

    path.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const pt = points[i];
      if (pt) path.lineTo(pt.x, pt.y);
    }
    path.close();
    return path;
  }, [points]);

  const centerVec = vec(CENTER, CENTER);

  return (
    <Box className="w-[140px] h-[140px] items-center justify-center">
      <Canvas style={{ flex: 1, width: '100%', height: '100%' }}>
        {gridRadii.map((r, i) => (
          <Circle
            key={`grid-${i}`}
            cx={CENTER}
            cy={CENTER}
            r={r}
            color={color}
            style="stroke"
            strokeWidth={1}
            opacity={0.1}
          />
        ))}

        {AXES.map((axis, i) => {
          const tip = polar(axis.angle, MAX_RADIUS);
          return (
            <Line
              key={`axis-${i}`}
              p1={centerVec}
              p2={vec(tip.x, tip.y)}
              color={color}
              strokeWidth={1}
              opacity={0.05}
            />
          );
        })}

        <Group>
          <Path path={polygonPath} color={color} style="fill" opacity={0.15} />
          <Path path={polygonPath} color={color} style="stroke" strokeWidth={2} opacity={0.8} />
          {points.map((pt, i) => (
            <Circle key={`pt-${i}`} cx={pt.x} cy={pt.y} r={3} color={color} />
          ))}
        </Group>

        <Circle cx={CENTER} cy={CENTER} r={2} color={color} opacity={0.5} />
      </Canvas>
    </Box>
  );
}

// —————————————————————————————————————————————————————————————————————————————
// MAIN COMPONENT
// —————————————————————————————————————————————————————————————————————————————

export interface ResonancePatternCardProps {
  orientationSeeds?: OrientationSeeds | null;
  moodLogs?: MoodLog[];
  energyForecasts?: EnergyForecast[];
  gradeNumber?: number | null;
  onExplore?: () => void;
}

export default function ResonancePatternCard({
  orientationSeeds,
  moodLogs,
  energyForecasts,
  gradeNumber,
  onExplore,
}: ResonancePatternCardProps) {
  const { context } = usePermissions();
  const capacity = context.capacity;
  const authority =
    capacity === 'student' ||
    capacity === 'teacher' ||
    capacity === 'gradeHead' ||
    capacity === 'sectionHead' ||
    capacity === 'principal' ||
    capacity === 'developer' ||
    capacity === 'admin'
      ? capacity
      : null;

  const {
    seeds: inferredSeeds,
    isDefault,
    confidence,
    dataQuality,
  } = useOrientationInference({
    explicitSeeds: orientationSeeds,
    moodLogs,
    energyForecasts,
    authority,
    gradeNumber,
  });

  const seeds: Record<string, number> = {
    depth_breadth: inferredSeeds.depth_breadth,
    reflect_act: inferredSeeds.reflect_act,
    solo_social: inferredSeeds.solo_social,
    steady_surge: inferredSeeds.steady_surge,
  };

  const isForming = isDefault && confidence < 0.25;
  const points = useMemo(() => buildPoints(seeds), [seeds]);
  const accentColor = '#FCD34D'; // sanctuarySaffron

  return (
    <Animated.View entering={FadeIn.duration(800)}>
      <Box className="bg-white/5 rounded-3xl border border-white/10 p-lg shadow-2xl">
        <VStack className="gap-lg">
          {/* Header */}
          <HStack className="items-center justify-between">
            <HStack className="items-center gap-2">
              <Icon as={Sparkles} className="text-sanctuarySaffron" size={16} />
              <Text className="text-sanctuarySaffron text-[10px] uppercase font-black tracking-widest">
                Behavioral Fingerprint
              </Text>
            </HStack>
            <Box
              className={`px-2 py-1 rounded-full ${dataQuality === 'strong' ? 'bg-emeraldGreen/10' : 'bg-skyBlue/10'}`}
            >
              <Text
                className={`text-[8px] font-black uppercase ${dataQuality === 'strong' ? 'text-emeraldGreen' : 'text-skyBlue'}`}
              >
                {dataQuality} resonance
              </Text>
            </Box>
          </HStack>

          {isForming ? (
            <VStack className="items-center py-lg gap-3">
              <Icon as={Activity} className="text-mistGray/20" size={48} />
              <VStack className="gap-1 items-center">
                <Text className="text-sacredWhite/60 font-bold text-sm">Pattern is forming...</Text>
                <Text className="text-mistGray text-[10px] text-center max-w-[200px] leading-relaxed">
                  Your somatic shape will emerge as your interactions generate enough light.
                </Text>
              </VStack>
            </VStack>
          ) : (
            <HStack className="items-center gap-lg">
              <RadarChart points={points} color={accentColor} />

              <VStack className="flex-1 gap-4">
                {AXES.map((axis, index) => {
                  const value = seeds[axis.key] ?? 50;
                  return (
                    <Animated.View key={axis.key} entering={SlideInRight.delay(index * 100)}>
                      <VStack className="gap-1.5">
                        <HStack className="justify-between items-center px-0.5">
                          <Text className="text-mistGray/40 text-[9px] uppercase font-black">
                            {axis.lo}
                          </Text>
                          <Text className="text-mistGray text-[9px] uppercase font-black">
                            {axis.hi}
                          </Text>
                        </HStack>

                        {/* Gauge Track */}
                        <Box className="h-1 bg-white/5 rounded-full relative overflow-hidden">
                          <Box
                            className="absolute top-0 bottom-0 bg-sanctuarySaffron/20"
                            style={{ left: 0, width: `${value}%` }}
                          />
                          {/* Active Indicator Pin */}
                          <Box
                            className="absolute top-0 bottom-0 w-0.5 bg-sanctuarySaffron shadow-sm"
                            style={{ left: `${value}%` }}
                          />
                        </Box>
                      </VStack>
                    </Animated.View>
                  );
                })}
              </VStack>
            </HStack>
          )}

          <Box className="border-t border-white/5 pt-4">
            <Text className="text-mistGray/40 text-[9px] text-center italic leading-relaxed">
              {dataQuality === 'strong' && orientationSeeds
                ? 'Refined by your core orientation and dynamic somatic logs.'
                : dataQuality === 'strong'
                  ? 'A hardened pattern emerging from consistent behavioral signals.'
                  : 'A starting perspective that refines with every interaction.'}
            </Text>
          </Box>

          {!isForming && onExplore && (
            <Pressable
              onPress={onExplore}
              className="flex-row items-center justify-center gap-2 bg-white/5 py-3 rounded-xl border border-white/10 active:bg-white/10 active:scale-98 transition-all"
            >
              <Text className="text-sacredWhite text-xs font-black uppercase tracking-widest">
                Explore Fingerprint
              </Text>
              <Icon as={ArrowRight} size={14} className="text-sanctuarySaffron" />
            </Pressable>
          )}
        </VStack>
      </Box>
    </Animated.View>
  );
}
