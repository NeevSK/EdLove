import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HStack, Box } from '@gluestack-ui/themed';
import { FileText, Video, Link, File, Heart, Plus, Download } from 'lucide-react-native';
import SanctuaryCard from '../shared/SanctuaryCard';
import SanctuaryButton from '../shared/SanctuaryButton';
import { Theme } from '../../constants/Theme';

export type ResourceType = 'pdf' | 'video' | 'link' | 'text' | 'doc';

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

const TYPE_CONFIG = {
    pdf: { icon: File, color: Theme.colors.emberRed, label: 'PDF' },
    video: { icon: Video, color: Theme.colors.skyBlue, label: 'Video' },
    link: { icon: Link, color: Theme.colors.sanctuarySaffron, label: 'Link' },
    text: { icon: FileText, color: Theme.colors.sageGreen, label: 'Article' },
    doc: { icon: FileText, color: Theme.colors.deepIndigo, label: 'Document' },
};

export default function LibraryResourceCard({
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

    const renderFooter = () => (
        <HStack justifyContent="space-between" alignItems="center" mt="$2">
            <HStack space="md">
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
            <HStack space="md" alignItems="flex-start">
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

const styles = StyleSheet.create({
    title: {
        color: Theme.colors.sacredWhite,
        fontSize: Theme.typography.h4.fontSize,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        color: Theme.colors.mistGray,
        fontSize: 14,
        lineHeight: 20,
    },
    typeLabel: {
        color: Theme.colors.mistGray,
        fontSize: 10,
        marginTop: 4,
        fontWeight: 'bold'
    },
    badge: {
        color: Theme.colors.sanctuarySaffron,
        fontSize: 10,
        fontWeight: 'bold'
    }
});
