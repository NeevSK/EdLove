import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { HStack, Box, Text } from '../../gluestack';
import { FileText, Video, Link, File, Heart, Plus } from 'lucide-react-native';
import SanctuaryCard from '../SanctuaryCard';
import SanctuaryButton from '../SanctuaryButton';
import { Theme } from '../../theme/Theme';

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

const TYPE_CONFIG: Record<ResourceType, { icon: any, color: string, label: string }> = {
    pdf: { icon: File, color: Theme.colors.emberRed, label: 'PDF' },
    video: { icon: Video, color: Theme.colors.skyBlue, label: 'Video' },
    link: { icon: Link, color: Theme.colors.sanctuarySaffron, label: 'Link' },
    text: { icon: FileText, color: Theme.colors.sageGreen, label: 'Article' },
    doc: { icon: FileText, color: Theme.colors.deepIndigo, label: 'Document' },
    note: { icon: FileText, color: Theme.colors.sageGreen, label: 'Note' },
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
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.text;
    const Icon = config.icon;

    const styles = useMemo(() => StyleSheet.create({
        title: {
            fontSize: Theme.typography.fontSize.md,
            fontWeight: '600',
            color: Theme.colors.sacredWhite,
            marginBottom: 4,
        },
        description: {
            fontSize: Theme.typography.fontSize.sm,
            color: Theme.colors.mistGray,
            marginBottom: 8,
        },
        typeLabel: {
            marginTop: 4,
            fontSize: 10,
            fontWeight: '700',
            color: Theme.colors.sacredWhite,
            textAlign: 'center',
        },
        badge: {
            fontSize: 10,
            fontWeight: '600',
            color: Theme.colors.lotusWhite,
        },
    }), []);

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
            <HStack sx={{ gap: Theme.spacing.small, alignItems: 'flex-start' }}>
                {/* Icon Box */}
                <Box
                    sx={{
                        backgroundColor: Theme.colors.deepIndigo,
                        padding: Theme.spacing.md,
                        borderRadius: Theme.corners.comfortable,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Icon color={config.color} size={24} />
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
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            paddingHorizontal: 6,
                            borderRadius: 4,
                            marginTop: 4
                        }}>
                            <Text style={styles.badge}>Public Resource</Text>
                        </Box>
                    )}
                </View>
            </HStack>
        </SanctuaryCard>
    );
}
