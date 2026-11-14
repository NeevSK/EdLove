/**
 * TEACHER VITALITY CARD
 * Multidimensional vitality polygon and restorative attunement triggers for educators.
 * Reconstructed: Purged legacy UI primitives and Theme.ts; replaced with React Native primitives + @repo/ui/theme/native.
 */

import {
  InteractiveRadarChart,
  type RadarDimension,
} from '@repo/ui/components/InteractiveRadarChart';
import { Coffee, Heart, Shield, Sparkles, Zap } from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import { hapticLight, hapticMedium } from '@repo/ui/utils/haptics';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export interface TeacherVitalityCardProps {
  teacherName?: string;
  onTakeBreathBreak?: () => void;
}

export const TeacherVitalityCard: React.FC<TeacherVitalityCardProps> = ({
  teacherName = 'Educator',
  onTakeBreathBreak,
}) => {
  const { tokens } = useWorld();
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
    <View className="bg-sanctuary-surface-secondary rounded-[28px] p-6 border border-sanctuary-border/30 gap-6">
      {/* 1. Header & Sovereign Airgap Shroud Badge */}
      <View className="flex-row items-center justify-between">
        <View className="gap-1 flex-1">
          <View className="flex-row items-center gap-2">
            <Sparkles size={16} color={tokens.lampDeep} />
            <Text className="text-[11px] font-black uppercase tracking-widest text-sanctuarySaffron">
              Teacher Vitality & Resonance Mesh
            </Text>
          </View>
          <Text className="text-base text-sanctuary-text font-bold">
            {teacherName}'s Pedagogical Bandwidth
          </Text>
        </View>

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
          <Shield size={16} color={tokens.ornament} />
        </Pressable>
      </View>

      {/* Sovereign Airgap Shroud Explanation */}
      {showAirgapNotice && (
        <View className="p-3.5 rounded-2xl bg-templeGold/10 border border-templeGold/30">
          <Text className="text-xs font-bold text-templeGold mb-1">
            Zero-Knowledge Sovereign Airgap Shield
          </Text>
          <Text className="text-[11px] text-sanctuary-text-secondary leading-relaxed">
            Your personal vitality indicators and nervous system reflections remain strictly on-device.
            Administrators and peer teachers never receive raw telemetry. You own your soul polygon.
          </Text>
        </View>
      )}

      {/* 2. Cybernetic Impedance Gauges: Z_source vs Allostatic Load */}
      <View className="flex-row gap-3">
        <View className="flex-1 p-4 rounded-2xl bg-sanctuary-surface border border-sanctuary-border/20">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-[10px] font-bold uppercase text-sanctuary-text-tertiary">
              Relational Bandwidth (Z_source)
            </Text>
            <Heart size={14} color={tokens.lampDeep} />
          </View>
          <Text className="text-xl text-sanctuarySaffron font-black">
            {relationalScore}%
          </Text>
          <Text className="text-[10px] text-sanctuary-text-secondary mt-1">
            Vibrant Sanctuary readiness
          </Text>
        </View>

        <View className="flex-1 p-4 rounded-2xl bg-sanctuary-surface border border-sanctuary-border/20">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-[10px] font-bold uppercase text-sanctuary-text-tertiary">
              Allostatic Grounding
            </Text>
            <Zap size={14} color={tokens.ornament} />
          </View>
          <Text className="text-xl text-templeGold font-black">
            {allostaticScore}%
          </Text>
          <Text className="text-[10px] text-sanctuary-text-secondary mt-1">
            Sustainable nervous reserve
          </Text>
        </View>
      </View>

      {/* 3. Symmetrical 5-Dimension Radar Chart */}
      <View className="items-center justify-center p-2 rounded-2xl bg-sanctuary-surface/50 border border-sanctuary-border/10">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-sanctuary-text-tertiary mb-1">
          Multidimensional Vitality Polygon
        </Text>
        <InteractiveRadarChart dimensions={dimensions} size={260} />
      </View>

      {/* 4. Restorative Action Trigger */}
      {allostaticScore < 75 && (
        <View className="flex-row p-3.5 rounded-2xl bg-sanctuarySaffron/10 border border-sanctuarySaffron/30 items-center justify-between">
          <View className="flex-row gap-2.5 items-center flex-1 pr-2">
            <Coffee size={18} color={tokens.lampDeep} />
            <View className="flex-1">
              <Text className="text-xs font-bold text-sanctuarySaffron">
                Restorative Attunement Recommended
              </Text>
              <Text className="text-[10px] text-sanctuary-text-secondary leading-tight">
                Allostatic balance is at 72%. Take a 2-minute conscious breath before your next session.
              </Text>
            </View>
          </View>

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
        </View>
      )}
    </View>
  );
};

export default TeacherVitalityCard;
