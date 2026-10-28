import {
  InteractiveRadarChart,
  type RadarDimension,
} from '@repo/ui/components/InteractiveRadarChart';
import { Brain, Coffee, Heart, Shield, Sparkles, Zap } from '@repo/ui/icons';
import {
  Box,
  Heading,
  HStack,
  Icon,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';
import { hapticLight, hapticMedium } from '@repo/ui/utils/haptics';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface TeacherVitalityCardProps {
  teacherName?: string;
  onTakeBreathBreak?: () => void;
}

export const TeacherVitalityCard: React.FC<TeacherVitalityCardProps> = ({
  teacherName = 'Educator',
  onTakeBreathBreak,
}) => {
  const { t } = useTranslation();
  const [showAirgapNotice, setShowAirgapNotice] = useState(false);

  // 5 Canonical Teacher Vitality Dimensions
  const [dimensions] = useState<RadarDimension[]>([
    { key: 'pedagogical_tact', label: 'Pedagogical Tact', value: 85 },
    { key: 'relational_warmth', label: 'Relational Warmth', value: 88 },
    { key: 'intellectual_vitality', label: 'Intellectual Vitality', value: 80 },
    { key: 'allostatic_balance', label: 'Allostatic Balance', value: 72 },
    { key: 'craft_reflection', label: 'Craft Reflection', value: 90 },
  ]);

  const allostaticScore = dimensions.find((d) => d.key === 'allostatic_balance')?.value ?? 72;
  const relationalScore = dimensions.find((d) => d.key === 'relational_warmth')?.value ?? 88;

  return (
    <Box className="bg-sanctuary-surface-secondary rounded-[28px] p-6 border border-sanctuary-border/30 gap-6">
      {/* 1. Header & Sovereign Airgap Shroud Badge */}
      <HStack className="items-center justify-between">
        <VStack className="gap-1 flex-1">
          <HStack className="items-center gap-2">
            <Icon as={Sparkles} size={16} className="text-sanctuarySaffron" />
            <Text className="text-[11px] font-black uppercase tracking-widest text-sanctuarySaffron">
              Teacher Vitality & Resonance Mesh
            </Text>
          </HStack>
          <Heading size="sm" className="text-sanctuary-text font-bold">
            {teacherName}'s Pedagogical Bandwidth
          </Heading>
        </VStack>

        <Pressable
          onPress={() => {
            hapticLight();
            setShowAirgapNotice(!showAirgapNotice);
          }}
          className="p-2 rounded-full bg-sanctuary-surface border border-sanctuary-border/30"
          accessibilityRole="button"
          accessibilityLabel="Privacy Airgap Status"
          accessibilityHint="Toggles sovereign privacy airgap notice"
        >
          <Icon as={Shield} size={16} className="text-templeGold" />
        </Pressable>
      </HStack>

      {/* Sovereign Airgap Shroud Explanation */}
      {showAirgapNotice && (
        <Box className="p-3.5 rounded-2xl bg-templeGold/10 border border-templeGold/30">
          <Text className="text-xs font-bold text-templeGold mb-1">
            Zero-Knowledge Sovereign Airgap Shield
          </Text>
          <Text className="text-[11px] text-sanctuary-text-secondary leading-relaxed">
            Your personal vitality indicators and nervous system reflections remain strictly on-device.
            Administrators and peer teachers never receive raw telemetry. You own your soul polygon.
          </Text>
        </Box>
      )}

      {/* 2. Cybernetic Impedance Gauges: Z_source vs Allostatic Load */}
      <HStack className="gap-3">
        <Box className="flex-1 p-4 rounded-2xl bg-sanctuary-surface border border-sanctuary-border/20">
          <HStack className="items-center justify-between mb-1">
            <Text className="text-[10px] font-bold uppercase text-sanctuary-text-tertiary">
              Relational Bandwidth (Z_source)
            </Text>
            <Icon as={Heart} size={14} className="text-sanctuarySaffron" />
          </HStack>
          <Heading size="lg" className="text-sanctuarySaffron font-black">
            {relationalScore}%
          </Heading>
          <Text className="text-[10px] text-sanctuary-text-secondary mt-1">
            Vibrant Sanctuary readiness
          </Text>
        </Box>

        <Box className="flex-1 p-4 rounded-2xl bg-sanctuary-surface border border-sanctuary-border/20">
          <HStack className="items-center justify-between mb-1">
            <Text className="text-[10px] font-bold uppercase text-sanctuary-text-tertiary">
              Allostatic Grounding
            </Text>
            <Icon as={Zap} size={14} className="text-templeGold" />
          </HStack>
          <Heading size="lg" className="text-templeGold font-black">
            {allostaticScore}%
          </Heading>
          <Text className="text-[10px] text-sanctuary-text-secondary mt-1">
            Sustainable nervous reserve
          </Text>
        </Box>
      </HStack>

      {/* 3. Symmetrical 5-Dimension Radar Chart */}
      <VStack className="items-center justify-center p-2 rounded-2xl bg-sanctuary-surface/50 border border-sanctuary-border/10">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-sanctuary-text-tertiary mb-1">
          Multidimensional Vitality Polygon
        </Text>
        <InteractiveRadarChart dimensions={dimensions} size={260} />
      </VStack>

      {/* 4. Restorative Action Trigger */}
      {allostaticScore < 75 && (
        <HStack className="p-3.5 rounded-2xl bg-sanctuarySaffron/10 border border-sanctuarySaffron/30 items-center justify-between">
          <HStack className="gap-2.5 items-center flex-1 pr-2">
            <Icon as={Coffee} size={18} className="text-sanctuarySaffron" />
            <VStack className="flex-1">
              <Text className="text-xs font-bold text-sanctuarySaffron">
                Restorative Attunement Recommended
              </Text>
              <Text className="text-[10px] text-sanctuary-text-secondary leading-tight">
                Allostatic balance is at 72%. Take a 2-minute conscious breath before your next session.
              </Text>
            </VStack>
          </HStack>

          {onTakeBreathBreak && (
            <Pressable
              onPress={() => {
                hapticMedium();
                onTakeBreathBreak();
              }}
              className="px-3 py-1.5 rounded-full bg-sanctuarySaffron shadow-sm"
              accessibilityRole="button"
              accessibilityLabel="Take Breath Break"
            >
              <Text className="text-[11px] font-bold text-white">
                Breathe
              </Text>
            </Pressable>
          )}
        </HStack>
      )}
    </Box>
  );
};

export default TeacherVitalityCard;
