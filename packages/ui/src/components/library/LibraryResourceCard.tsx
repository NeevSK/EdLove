import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { HStack, Box, Text } from '../../gluestack';
import { FileText, Video, Link, File, Heart, Plus } from 'lucide-react-native';
import SanctuaryCard from '../SanctuaryCard';
import SanctuaryButton from '../SanctuaryButton';
import { Theme } from '../../theme/Theme';
import { useThemedColors } from '../../hooks/useThemedColors';

export type ResourceType = 'pdf' | 'video' | 'link' | 'text' | 'doc' | 'note';

interface LibraryResourceCardProps {
    title: string;
    description?: string;
    type: ResourceType;
    isPublic?: boolean;
    onPress: () => void;
    onaddToDesk?: () => void;
    onLike?: () => void;
    isLiked?: boolean;
}

const TYPE_CONFIG: Record<ResourceType, { icon: any, color: keyof typeof Theme.colors, label: string }> = {
    pdf: { icon: File, color: 'emberRed', label: 'PDF' },
    video: { icon: Video, color: 'skyBlue', label: 'Video' },
    link: { icon: Link, color: 'sanctuarySaffron', label: 'Link' },
    text: { icon: FileText, color: 'sageGreen', label: 'Article' },
    doc: { icon: FileText, color: 'deepIndigo', label: 'Document' },
    note: { icon: FileText, color: 'sageGreen', label: 'Note' },
};

export function LibraryResourceCard({
    title,
    description,
    type,
    isPublic,
    onPress,
    onaddToDesk,
    onLike,
    isLiked
}: LibraryResourceCardProps) {
    const colors = useThemedColors();
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.text;
    const Icon = config.icon;

    const styles = useMemo(() => StyleSheet.create({
        title: {
            fontSize: Theme.typography.fontSize.md,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        description: {
            fontSize: Theme.typography.fontSize.sm,
            color: colors.textSecondary,
            marginBottom: 8,
        },
        typeLabel: {
            marginTop: 4,
            fontSize: 10,
            fontWeight: '700',
            color: colors.text, // Better resonance with adaptive text
            textAlign: 'center',
        },
        badge: {
            fontSize: 10,
            fontWeight: '600',
            color: colors.textSecondary,
        },
    }), [colors]);

    const renderFooter = () => (
        <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', marginTop: Theme.spacing.small }}>
            <HStack sx={{ gap: Theme.spacing.small }}>
                {onLike && (
                    <SanctuaryButton
                        onPress={onLike}
                        variant="ghost"
                        size="xs"
                        leftIcon={Heart}
                        action={isLiked ? 'negative' : 'secondary'}
                    >
                        {isLiked ? 'Liked' : 'Like'}
                    </SanctuaryButton>
                )}
                {onaddToDesk && (
                    <SanctuaryButton
                        onPress={onaddToDesk}
                        variant="ghost"
                        size="xs"
                        leftIcon={Plus}
                        action="primary"
                    >
                        Add to Desk
                    </SanctuaryButton>
                )}
            </HStack>
        </HStack>
    );

    return (
        <SanctuaryCard
            onPress={onPress}
            footer={renderFooter()}
            elevated
        >
            <HStack sx={{ gap: Theme.spacing.small, alignItems: 'center' }}>
                {/* Icon Box - Using SanctuaryCard-like depth for consistency */}
                <Box
                    sx={{
                        backgroundColor: colors.secondary, // Phase-aware background
                        padding: Theme.spacing.md,
                        borderRadius: Theme.corners.comfortable,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: colors.border // Phase-aware border
                    }}
                >
                    <Icon color={colors.action} size={24} />
                    <Text style={styles.typeLabel}>{config.label}</Text>
                </Box>

                {/* Content */}
                <View style={{ flex: 1 }}>
                    <Text style={styles.title} numberOfLines={2}>
                        {title}
                    </Text>
                    {description && (
                        <Text style={styles.description} numberOfLines={2}>
                            {description}
                        </Text>
                    )}
                    {isPublic && (
                        <Box sx={{
                            alignSelf: 'flex-start',
                            backgroundColor: colors.tertiary,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 4,
                            marginTop: 4,
                            borderWidth: 0.5,
                            borderColor: colors.border
                        }}>
                            <Text style={styles.badge}>Public Resource</Text>
                        </Box>
                    )}
                </View>
            </HStack>
        </SanctuaryCard>
    );
}
