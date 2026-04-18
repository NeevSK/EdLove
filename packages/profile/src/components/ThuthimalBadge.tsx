import React from 'react';
import { Flower2 } from 'lucide-react-native';
import { Box, Text, VStack, HStack } from '@repo/ui';
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
export default function ThuthimalBadge({ gifterName = 'Anonymous', giftedAt, compact = false }: ThuthimalBadgeProps) {
    const { t, i18n } = useTranslation();
    const displayName = gifterName || 'Anonymous';

    // Sanctuary Saffron Standard
    const saffron = '#E67E22';

    if (compact) {
        return (
            <HStack className="items-center bg-phase-interactive/10 px-3 py-1.5 rounded-full border border-phase-interactive/30">
                <Flower2 size={16} color={saffron} />
                <Text className="text-xs font-bold text-[#E67E22] ml-1.5">
                    {t('thuthimalBadge.sinhala')}
                </Text>
            </HStack>
        );
    }

    return (
        <Box 
            className="rounded-2xl p-5 mb-4 border-l-4 border-l-[#E67E22] bg-phase-canvas border-phase-surface shadow-md"
            style={{ shadowColor: '#9DA1A3', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }}
        >
            <HStack className="items-center mb-4" space="sm">
                <Flower2 size={24} color={saffron} />
                <Text className="text-lg font-bold text-phase-text-primary">
                    {t('thuthimalBadge.title')}
                </Text>
                <Text className="text-lg font-medium text-[#E67E22]">
                    {t('thuthimalBadge.sinhala')}
                </Text>
            </HStack>

            <VStack className="bg-phase-interactive/5 rounded-xl p-3 mb-3">
                <Text className="text-[10px] text-phase-text-tertiary uppercase tracking-wider mb-1">
                    {t('thuthimalBadge.giftedBy')}
                </Text>
                <Text className="text-base font-bold text-[#E67E22]">
                    {displayName}
                </Text>
            </VStack>

            <Text className="text-xs italic text-phase-text-tertiary leading-5 mb-2">
                {t('thuthimalBadge.meaning')}
            </Text>

            {giftedAt && (
                <Text className="text-[10px] text-phase-text-tertiary text-right">
                    {t('thuthimalBadge.giftedOn', { date: new Date(giftedAt).toLocaleDateString(i18n.language, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) })}
                </Text>
            )}
        </Box>
    );
}
