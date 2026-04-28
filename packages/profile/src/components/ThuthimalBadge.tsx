import { Box, HStack, Text, VStack } from '@repo/ui';
import { Flower2 } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ThuthimalBadgeProps {
  gifterName?: string;
  giftedAt?: string;
  compact?: boolean; // Compact mode for smaller displays
}

/**
 * THUTHIMAL BADGE
 * Sanctuary V3 standard for displaying the "Flower of Gratitude".
 * Elegant, warm, honoring - not flashy.
 */
export default function ThuthimalBadge({
  gifterName = 'Anonymous',
  giftedAt,
  compact = false,
}: ThuthimalBadgeProps) {
  const { t, i18n } = useTranslation();
  const displayName = gifterName || 'Anonymous';

  // Sanctuary Saffron Standard - represents gratitude and solar wisdom
  const saffron = '#F2994A'; // Warm saffron

  if (compact) {
    return (
      <HStack className="items-center bg-phase-interactive/10 px-4 py-2 rounded-2xl border border-phase-interactive/20">
        <Flower2 size={16} color={saffron} strokeWidth={2.5} />
        <Text className="text-xs font-bold text-[#F2994A] ml-2 tracking-tight">
          {t('thuthimalBadge.sinhala') || 'තුතිමල්'}
        </Text>
      </HStack>
    );
  }

  return (
    <Box className="rounded-[32px] p-6 mb-6 bg-phase-canvas border border-phase-surface shadow-lg overflow-hidden">
      {/* Saffron border accent */}
      <Box className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#F2994A]" />

      <HStack className="items-center mb-5" space="md">
        <Box className="w-12 h-12 bg-[#F2994A]/10 rounded-2xl items-center justify-center">
          <Flower2 size={24} color={saffron} strokeWidth={2.5} />
        </Box>
        <VStack className="flex-1">
          <Text className="text-lg font-bold text-phase-text-primary tracking-tight">
            {t('thuthimalBadge.title') || 'Flower of Gratitude'}
          </Text>
          <Text className="text-sm font-bold text-[#F2994A] tracking-widest uppercase">
            {t('thuthimalBadge.sinhala') || 'තුතිමල්'}
          </Text>
        </VStack>
      </HStack>

      <VStack className="bg-phase-surface/40 rounded-2xl p-4 mb-4 border border-phase-surface/60">
        <Text className="text-[10px] text-phase-text-tertiary uppercase font-bold tracking-widest mb-1.5">
          {t('thuthimalBadge.giftedBy') || 'OFFERED BY'}
        </Text>
        <Text className="text-lg font-bold text-phase-text-primary tracking-tight">
          {displayName}
        </Text>
      </VStack>

      <Box className="px-1">
        <Text className="text-sm italic text-phase-text-secondary leading-6 mb-4">
          {t('thuthimalBadge.meaning') ||
            'A sacred symbol of appreciation within the Sanctuary, honoring your presence and contribution.'}
        </Text>

        {giftedAt && (
          <HStack className="justify-end items-center">
            <Box className="w-8 h-[1px] bg-phase-surface/80 mr-3" />
            <Text className="text-[10px] uppercase font-bold text-phase-text-tertiary tracking-widest">
              {t('thuthimalBadge.giftedOn', {
                date: new Date(giftedAt).toLocaleDateString(i18n.language, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }),
              }) || `ANNO ${new Date(giftedAt).getFullYear()}`}
            </Text>
          </HStack>
        )}
      </Box>
    </Box>
  );
}
