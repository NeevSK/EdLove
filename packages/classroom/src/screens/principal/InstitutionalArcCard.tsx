import React, { useState } from 'react';
import { 
    Pressable, 
    Box, 
    Text, 
    InfoIcon,
} from '@repo/ui';
import { Plus, Clock } from 'lucide-react-native';
import { SanctuaryModal } from '@repo/ui';
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
 * 3. [⏳] History — Temporal Navigator
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
        <Box 
            style={{ 
                background: 'var(--card-bg)', 
                borderRadius: '24px', 
                padding: '20px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                height: '100%'
            }}
        >
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {FeatureIcon && (
                        <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '10px', 
                            background: 'var(--sanctuary-blue-soft)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FeatureIcon size={20} color="var(--sanctuary-blue)" />
                        </div>
                    )}
                    <Text style={{ fontSize: '16px', fontWeight: '700', color: 'var(--ink)' }}>
                        {title}
                    </Text>
                    {scopeMeta && (
                        <span
                            title={scopeHelpText}
                            style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                padding: '4px 8px',
                                borderRadius: '999px',
                                background: 'var(--background-alt)',
                                color: 'var(--ink-ghost)',
                                letterSpacing: '0.4px',
                            }}
                        >
                            {scopeBadgeLabel}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                            <Plus size={16} color="var(--lotus)" />
                        </Pressable>
                    )}

                    {/* History Icon (⏳) */}
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
                            <Clock size={16} color="var(--ink-ghost)" />
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
                <Box style={{ gap: '16px', padding: '16px' }}>
                    <Text style={{ fontSize: '16px', lineHeight: '24px', color: 'var(--ink)' }}>
                        {featureInfo?.description}
                    </Text>

                    {scopeMeta && (
                        <Box style={{ background: 'var(--background-alt)', padding: '12px', borderRadius: '12px' }}>
                            <Text style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--ink-ghost)' }}>
                                {scopeBadgeLabel}
                            </Text>
                            <Text style={{ fontSize: '13px', color: 'var(--ink-subtle)' }}>
                                {scopeHelpText}
                            </Text>
                        </Box>
                    )}
                    
                    {featureInfo?.howToUse && (
                        <Box style={{ background: 'var(--surface-subtle)', padding: '12px', borderRadius: '12px' }}>
                            <Text style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>
                                How to use:
                            </Text>
                            <Text style={{ fontSize: '14px', color: 'var(--ink-subtle)' }}>
                                {featureInfo.howToUse}
                            </Text>
                        </Box>
                    )}
                </Box>
            </SanctuaryModal>
        </Box>
    );
};
