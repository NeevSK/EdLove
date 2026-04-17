import React, { useState } from 'react';
import { 
    Pressable, 
    Box, 
    Text, 
    InfoIcon,
    SanctuaryModal} from '@repo/ui';
import { Plus, Clock } from 'lucide-react-native';
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
export const InstitutionalArcCard: React.FC<InstitutionalArcCardProps> = { {
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
        <Box 
            style={{ 
                backgroundColor: 'var(--card-bg)', 
                borderRadius: 24, 
                padding: 20,
                borderWidth: 1,
                borderColor: 'var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 12,
                elevation: 2,
                height: '100%'
            }}
        >
            {/* Header Section */}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    {FeatureIcon && (
                        <div style={{ 
                            width: 36, 
                            height: 36, 
                            borderRadius: 10, 
                            backgroundColor: 'var(--sanctuary-blue-soft)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FeatureIcon size={20} color="var(--sanctuary-blue)" />
                        </div>
                    )}
                    <Text style={{ fontSize: 16, fontWeight: '700', color: 'var(--ink)' }}>
                        {title}
                    </Text>
                    {scopeMeta && (
                        <span
                            title={scopeHelpText}
                            style={{
                                fontSize: 10,
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                padding: '4px 8px',
                                borderRadius: 999,
                                backgroundColor: 'var(--background-alt)',
                                color: 'var(--ink-ghost)',
                                letterSpacing: 0.4}}
                        >
                            {scopeBadgeLabel}
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {/* Info Icon (ⓘ) */}
                    <Pressable 
                        onPress={() => setIsInfoOpen(true)}
                        accessibilityRole="button"
                        accessibilityLabel={`Open information for ${title}`}
                        accessibilityHint={`Shows details and guidance for ${title}`}
                        style={{ padding: 4 }}
                    >
                        <InfoIcon size="sm" color="var(--ink-ghost)" />
                    </Pressable>

                    {/* Add Icon (+) */}
                    {onAdd && (
                        <Pressable 
                            onPress={onAdd}
                            accessibilityRole="button"
                            accessibilityLabel={`Add item for ${title}`}
                            accessibilityHint={`Opens the add flow for ${title}`}
                            style={{ 
                                padding: 4, 
                                borderRadius: 999,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'var(--lotus-soft)'
                            }}
                        >
                            <Icon as={Plus} size={16} color="var(--lotus)" />
                        </Pressable>
                    )}

                    {/* History Icon (⌛) */}
                    {onHistory && (
                        <Pressable 
                            onPress={onHistory}
                            accessibilityRole="button"
                            accessibilityLabel={`Open history for ${title}`}
                            accessibilityHint={`Shows recent changes and history for ${title}`}
                            style={{ 
                                padding: 4, 
                                borderRadius: 999,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Icon as={Clock} size={16} color="var(--ink-ghost)" />
                        </Pressable>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <Box style={{ flex: 1 }}>
                {children}
            </Box>

            {/* Info Modal */}
            <SanctuaryModal
                isOpen={isInfoOpen}
                onClose={() => setIsInfoOpen(false)}
                title={featureInfo?.title || title}
            >
                <Box style={{ gap: 16, padding: 16 }}>
                    <Text style={{ fontSize: 16, lineHeight: 24, color: 'var(--ink)' }}>
                        {featureInfo?.description}
                    </Text>
                    {scopeMeta && (
                        <Box style={{ backgroundColor: 'var(--background-alt)', padding: 12, borderRadius: 12 }}>
                            <Text style={{ fontSize: 12, fontWeight: '700', marginBottom: 6, color: 'var(--ink-ghost)' }}>
                                {scopeBadgeLabel}
                            </Text>
                            <Text style={{ fontSize: 13, color: 'var(--ink-subtle)' }}>
                                {scopeHelpText}
                            </Text>
                        </Box>
                    )}
                    
                    {featureInfo?.howToUse && (
                        <Box style={{ backgroundColor: 'var(--surface-subtle)', padding: 12, borderRadius: 12 }}>
                            <Text style={{ fontSize: 14, fontWeight: '700', marginBottom: 8 }}>
                                How to use:
                            </Text>
                            <Text style={{ fontSize: 14, color: 'var(--ink-subtle)' }}>
                                {featureInfo.howToUse}
                            </Text>
                        </Box>
                    )}
                </Box>
            </SanctuaryModal>
        </Box>
    );
};

export type { InstitutionalArcCardProps };
