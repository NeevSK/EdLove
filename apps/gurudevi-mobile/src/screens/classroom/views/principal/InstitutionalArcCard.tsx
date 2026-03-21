import React, { useState } from 'react';
import { 
    Pressable, 
    Box, 
    Text, 
    Icon, 
    InfoIcon,
    Theme 
} from '@repo/ui';
import { Plus, Clock } from 'lucide-react-native';
import { SanctuaryModal } from '@repo/ui';
import { PRINCIPAL_FEATURE_REGISTRY } from './PrincipalFeatureRegistry';

interface InstitutionalArcCardProps {
    featureId: string;
    title: string;
    children: React.ReactNode;
    icon?: any;
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
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const featureInfo = PRINCIPAL_FEATURE_REGISTRY[featureId as keyof typeof PRINCIPAL_FEATURE_REGISTRY];

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
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Info Icon (ⓘ) */}
                    <Pressable 
                        onPress={() => setIsInfoOpen(true)}
                        style={{ padding: '4px' }}
                    >
                        <InfoIcon size="sm" color="var(--ink-ghost)" />
                    </Pressable>

                    {/* Add Icon (+) */}
                    {onAdd && (
                        <Pressable 
                            onPress={onAdd}
                            style={{ 
                                padding: '4px', 
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'var(--lotus-soft)'
                            }}
                        >
                            <Plus size={16} color="var(--lotus)" />
                        </Pressable>
                    )}

                    {/* History Icon (⏳) */}
                    {onHistory && (
                        <Pressable 
                            onHistoryAction={onHistory}
                            onPress={onHistory}
                            style={{ 
                                padding: '4px', 
                                borderRadius: '50%',
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
