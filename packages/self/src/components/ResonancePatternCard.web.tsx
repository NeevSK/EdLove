/**
 * RESONANCE PATTERN CARD (Web)
 * Web-optimized version of the behavioral fingerprint.
 * Standardized to Zero-Legacy: purged raw HTML/inline styles and fixed syntax corruption in style objects.
 */

import { usePermissions } from '@repo/core/logic';
import type { OrientationSeeds } from '@repo/profile';
import { useOrientationInference } from '@repo/self/hooks/useOrientationInference';
import type { EnergyForecast, MoodLog } from '@repo/self/types/Wellbeing';
import { Activity, ArrowRight, Sparkles } from '@repo/ui/icons';
import { AnimatedView, Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { useMemo } from 'react';
import { FadeIn, SlideInRight } from 'react-native-reanimated';

// —————————————————————————————————————————————————————————————————————————————
// CONSTANTS
// —————————————————————————————————————————————————————————————————————————————

const SIZE = 140;
const CX = SIZE / 2;
const CY = SIZE / 2;
const MAX_R = 54;
const ACCENT = '#FCD34D'; // sanctuarySaffron

const AXES = [
  { key: 'depth_breadth', lo: 'Deep', hi: 'Wide' },
  { key: 'reflect_act', lo: 'Reflect', hi: 'Act' },
  { key: 'solo_social', lo: 'Solo', hi: 'Social' },
  { key: 'steady_surge', lo: 'Steady', hi: 'Surge' },
] as const;

// —————————————————————————————————————————————————————————————————————————————
// HELPERS
// —————————————————————————————————————————————————————————————————————————————

function polarToXY(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function buildPolygon(seeds: Record<string, number>): string {
  return AXES.map((axis, i) => {
    const angle = (360 / AXES.length) * i;
    const value = (seeds[axis.key] ?? 50) / 100;
    const { x, y } = polarToXY(angle, MAX_R * value);
    return `${x},${y}`;
  }).join(' ');
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

export function ResonancePatternCard({
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

  const seeds = useMemo(
    () => ({
      depth_breadth: inferredSeeds.depth_breadth,
      reflect_act: inferredSeeds.reflect_act,
      solo_social: inferredSeeds.solo_social,
      steady_surge: inferredSeeds.steady_surge,
    }),
    [
      inferredSeeds.depth_breadth,
      inferredSeeds.reflect_act,
      inferredSeeds.solo_social,
      inferredSeeds.steady_surge,
    ],
  );

  const isForming = isDefault && confidence < 0.25;
  const polygon = useMemo(() => buildPolygon(seeds), [seeds]);
  const gridRings = [0.33, 0.66, 1];

  return (
    <AnimatedView entering={FadeIn.duration(800)}>
      <Box className="p-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
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
            <HStack className="items-center gap-lg flex-wrap sm:flex-nowrap">
              {/* SVG Column */}
              <Box className="flex-shrink-0 items-center justify-center">
                <svg
                  width={SIZE}
                  height={SIZE}
                  viewBox={`0 0 ${SIZE} ${SIZE}`}
                  style={{ overflow: 'visible' }}
                  role="img"
                  aria-label="Behavioral resonance pattern visualization"
                >
                  <title>Behavioral Resonance Pattern</title>
                  {/* Grid rings */}
                  {gridRings.map((pct, ri) => {
                    const ringPoints = AXES.map((_, i) => {
                      const angle = (360 / AXES.length) * i;
                      const { x, y } = polarToXY(angle, MAX_R * pct);
                      return `${x},${y}`;
                    }).join(' ');
                    return (
                      <polygon
                        key={ri}
                        points={ringPoints}
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Axis spokes */}
                  {AXES.map((_, i) => {
                    const angle = (360 / AXES.length) * i;
                    const { x, y } = polarToXY(angle, MAX_R);
                    return (
                      <line
                        key={i}
                        x1={CX}
                        y1={CY}
                        x2={x}
                        y2={y}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Data polygon */}
                  <polygon
                    points={polygon}
                    fill="rgba(252, 211, 77, 0.15)"
                    stroke={ACCENT}
                    strokeWidth="2"
                    strokeLinejoin="round"
                    style={{ transition: 'all 1s ease' } as any}
                  />

                  {/* Axis Vertices */}
                  {AXES.map((axis, i) => {
                    const angle = (360 / AXES.length) * i;
                    const val = (seeds[axis.key] ?? 50) / 100;
                    const { x, y } = polarToXY(angle, MAX_R * val);
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="3"
                        fill={ACCENT}
                        style={{ transition: 'all 1s ease' } as any}
                      />
                    );
                  })}
                </svg>
              </Box>

              {/* Gauges Column */}
              <VStack className="flex-1 gap-4 w-full sm:min-w-[180px]">
                {AXES.map((axis, index) => {
                  const value = seeds[axis.key] ?? 50;
                  return (
                    <AnimatedView key={axis.key} entering={SlideInRight.delay(index * 100)}>
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
                            className="absolute top-0 bottom-0 bg-sanctuarySaffron/20 transition-all duration-1000"
                            style={{ left: 0, width: `${value}%` }}
                          />
                          {/* Active Indicator Pin */}
                          <Box
                            className="absolute top-0 bottom-0 w-0.5 bg-sanctuarySaffron shadow-sm transition-all duration-1000"
                            style={{ left: `${value}%` }}
                          />
                        </Box>
                      </VStack>
                    </AnimatedView>
                  );
                })}
              </VStack>
            </HStack>
          )}

          <Box className="border-t border-white/5 pt-4">
            <Text className="text-mistGray/40 text-[9px] text-center italic leading-relaxed">
              Pattern confidence: {Math.round(confidence * 100)}% ·{' '}
              {isDefault
                ? 'Perspective defaults — usage will refine this.'
                : dataQuality === 'strong'
                  ? 'Refined by core orientation and behavior.'
                  : 'Emerging from your dynamic usage patterns.'}
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
    </AnimatedView>
  );
}

export default ResonancePatternCard;
