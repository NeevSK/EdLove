import React, { useState } from 'react';
import { 
    Pressable, 
    Box, 
    Text, 
    HStack,
    VStack,
    Icon,
    SanctuaryModal} from '@repo/ui';
import { Plus, Clock, Info } from 'lucide-react-native';
import { PRINCIPAL_FEATURE_REGISTRY } from './PrincipalFeatureRegistry';
import { getPrincipalFeatureScopeMeta } from './PrincipalIAScope';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react-native';

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
    onHistory
}) => {
    const { t } = useTranslation();
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const featureInfo = PRINCIPAL_FEATURE_REGISTRY[featureId as keyof typeof PRINCIPAL_FEATURE_REGISTRY];
    const scopeMeta = getPrincipalFeatureScopeMeta(featureId);
    const scopeBadgeLabel = scopeMeta ? t(scopeMeta.scopeBadgeLabelKey) : '';
    const scopeHelpText = scopeMeta ? t(scopeMeta.scopeHelpTextKey) : '';

    return (
        <Box className="bg-white rounded-[24px] p-5 border border-border shadow-sm h-full gap-4">
            {/* Header Section */}
            <HStack className="justify-between items-center">
                <HStack className="items-center gap-3 flex-1">
                    {FeatureIcon && (
                        <Box className="w-9 h-9 rounded-xl bg-primary/10 items-center justify-center">
                            <Icon as={FeatureIcon} size={20} className="text-primary" />
                        </Box>
                    )}
                    <Text className="text-base font-bold text-ink flex-1" numberOfLines={1}>
                        {title}
                    </Text>
                    {scopeMeta && (
                        <Box className="px-2 py-0.5 rounded-full bg-silk border border-border/50">
                            <Text className="text-[10px] font-black uppercase text-ink/40 tracking-wider">
                                {scopeBadgeLabel}
                            </Text>
                        </Box>
                    )}
                </HStack>
                <HStack className="items-center gap-2">
                    {/* Info Icon (ⓘ) */}
                    <Pressable 
                        onPress={() => setIsInfoOpen(true)}
                        accessibilityRole="button"
                        className="p-1 active:scale-90 transition-transform"
                    >
                        <Icon as={Info} size="sm" className="text-ink/40" />
                    </Pressable>

                    {/* Add Icon (+) */}
                    {onAdd && (
                        <Pressable 
                            onPress={onAdd}
                            accessibilityRole="button"
                            className="p-1.5 rounded-full bg-primary/10 items-center justify-center active:scale-90 transition-transform"
                        >
                            <Icon as={Plus} size="sm" className="text-primary" />
                        </Pressable>
                    )}

                    {/* History Icon (⌛) */}
                    {onHistory && (
                        <Pressable 
                            onPress={onHistory}
                            accessibilityRole="button"
                            className="p-1 active:scale-90 transition-transform"
                        >
                            <Icon as={Clock} size="sm" className="text-ink/40" />
                        </Pressable>
                    )}
                </HStack>
            </HStack>

            {/* Content Section */}
            <Box className="flex-1">
                {children}
            </Box>

            {/* Info Modal */}
            <SanctuaryModal
                isOpen={isInfoOpen}
                onClose={() => setIsInfoOpen(false)}
                title={featureInfo?.title || title}>
                <VStack className="gap-4 p-4">
                    <Text className="text-base leading-6 text-ink">
                        {featureInfo?.description}
                    </Text>
                    {scopeMeta && (
                        <VStack className="bg-silk p-3 rounded-2xl gap-1">
                            <Text className="text-xs font-black text-ink/40 uppercase">
                                {scopeBadgeLabel}
                            </Text>
                            <Text className="text-[13px] text-ink/60">
                                {scopeHelpText}
                            </Text>
                        </VStack>
                    )}
                    
                    {featureInfo?.howToUse && (
                        <VStack className="bg-primary/5 p-3 rounded-2xl gap-1 border border-primary/10">
                            <Text className="text-sm font-black text-primary">
                                How to use:
                            </Text>
                            <Text className="text-sm text-ink/60">
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
