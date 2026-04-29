import {
  Box,
  Clock,
  HStack,
  hapticLight,
  Icon,
  Info,
  type LucideIcon,
  Plus,
  Pressable,
  SanctuaryModal,
  Text,
  VStack,
} from '@repo/ui';

import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PRINCIPAL_FEATURE_REGISTRY } from './PrincipalFeatureRegistry';
import { getPrincipalFeatureScopeMeta } from './PrincipalIAScope';

interface InstitutionalArcCardProps {
  featureId: string;
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  onAdd?: () => void;
  onHistory?: () => void;
}

/**
 * InstitutionalArcCard — The "Unified Widget Shell"
 *
 * Provides a consistent wrapper for all dashboard features with:
 * 1. [ⓘ] Info — Documentation & Intent (SanctuaryModal)
 * 2. [+] Action — CRUD (Add/Update)
 * 3. [⌛] History — Temporal Navigator
 */
export const InstitutionalArcCard: React.FC<InstitutionalArcCardProps> = ({
  featureId,
  title,
  children,
  icon: FeatureIcon,
  onAdd,
  onHistory,
}) => {
  const { t } = useTranslation();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const featureInfo =
    PRINCIPAL_FEATURE_REGISTRY[featureId as keyof typeof PRINCIPAL_FEATURE_REGISTRY];
  const scopeMeta = getPrincipalFeatureScopeMeta(featureId);
  const scopeBadgeLabel = scopeMeta ? t(scopeMeta.scopeBadgeLabelKey) : '';
  const scopeHelpText = scopeMeta ? t(scopeMeta.scopeHelpTextKey) : '';

  return (
    <Box className="bg-phase-surface rounded-[40px] p-6 border border-phase-border shadow-md h-full gap-5">
      {/* Header Section */}
      <HStack className="justify-between items-center">
        <HStack className="items-center gap-4 flex-1">
          {FeatureIcon && (
            <Box className="w-12 h-12 rounded-2xl bg-phase-interactive/10 items-center justify-center">
              <Icon as={FeatureIcon} size={24} className="text-phase-interactive" />
            </Box>
          )}
          <VStack className="flex-1 gap-1">
            <Text
              className="text-[17px] font-black text-phaseText-primary tracking-tight"
              numberOfLines={1}
            >
              {title}
            </Text>
            {scopeMeta && (
              <Box className="px-2.5 py-0.5 rounded-lg bg-phase-canvas border border-phase-border/20 self-start">
                <Text className="text-[9px] font-black uppercase text-phaseText-muted tracking-[0.15em]">
                  {scopeBadgeLabel}
                </Text>
              </Box>
            )}
          </VStack>
        </HStack>

        <HStack className="items-center gap-1.5 bg-phase-canvas/50 p-1.5 rounded-2xl border border-phase-border/10">
          {/* Info Icon (ⓘ) */}
          <Pressable
            onPress={() => {
              hapticLight();
              setIsInfoOpen(true);
            }}
            accessibilityRole="button"
            className="p-2 rounded-xl active:bg-phase-surface transition-all"
          >
            <Icon as={Info} size="sm" className="text-phaseText-muted" />
          </Pressable>

          {/* History Icon (⌛) */}
          {onHistory && (
            <Pressable
              onPress={() => {
                hapticLight();
                onHistory();
              }}
              accessibilityRole="button"
              className="p-2 rounded-xl active:bg-phase-surface transition-all"
            >
              <Icon as={Clock} size="sm" className="text-phaseText-muted" />
            </Pressable>
          )}

          {/* Add Icon (+) */}
          {onAdd && (
            <Pressable
              onPress={() => {
                hapticLight();
                onAdd();
              }}
              accessibilityRole="button"
              className="w-10 h-10 rounded-xl bg-phase-interactive items-center justify-center active:scale-90 transition-transform shadow-sm"
            >
              <Icon as={Plus} size="sm" className="text-white" />
            </Pressable>
          )}
        </HStack>
      </HStack>

      {/* Content Section */}
      <Box className="flex-1 px-1">{children}</Box>

      {/* Info Modal */}
      <SanctuaryModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title={featureInfo?.title || title}
      >
        <VStack className="gap-6 p-6">
          <Text className="text-[16px] leading-relaxed text-phaseText-secondary font-medium">
            {featureInfo?.description}
          </Text>
          {scopeMeta && (
            <VStack className="bg-phase-canvas p-5 rounded-3xl gap-2 border border-phase-border shadow-inner">
              <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-widest">
                {scopeBadgeLabel}
              </Text>
              <Text className="text-[14px] text-phaseText-secondary font-medium leading-relaxed">
                {scopeHelpText}
              </Text>
            </VStack>
          )}

          {featureInfo?.howToUse && (
            <VStack className="bg-phase-interactive/5 p-5 rounded-3xl gap-2 border border-phase-interactive/10">
              <Text className="text-[12px] font-black text-phase-interactive uppercase tracking-widest">
                Implementation Strategy
              </Text>
              <Text className="text-[14px] text-phaseText-secondary font-medium leading-relaxed">
                {featureInfo.howToUse}
              </Text>
            </VStack>
          )}
        </VStack>
      </SanctuaryModal>
    </Box>
  );
};

export type { InstitutionalArcCardProps };
