import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { HStack, VStack, Box, Text, Theme, useThemedColors, SanctuaryCard, SanctuaryButton } from '@repo/ui';
import { FileText, Video, Link, File, Heart, Plus } from 'lucide-react-native';
import { ResourceType } from '../types';

interface LibraryResourceCardProps {
    title: string;
    description?: string;
    type: ResourceType;
    isPublic?: boolean;
    onPress: () => void;
    href?: string;
    onaddToDesk?: () => void;
    onLike?: () => void;
    isLiked?: boolean;
}

const TYPE_CONFIG: Partial<Record<ResourceType, { icon: any, color: keyof typeof Theme.colors, label: string }>> = {
    pdf: { icon: File, color: 'emberRed', label: 'PDF' },
    video: { icon: Video, color: 'skyBlue', label: 'Video' },
    link: { icon: Link, color: 'sanctuarySaffron', label: 'Link' },
    reading: { icon: FileText, color: 'sageGreen', label: 'Article' },
    doc: { icon: FileText, color: 'sanctuarySaffron', label: 'Document' },
    note: { icon: FileText, color: 'sageGreen', label: 'Note' },
    lesson: { icon: FileText, color: 'sanctuarySaffron', label: 'Lesson' },
};

export function LibraryResourceCard({
    title,
    description,
    type,
    isPublic,
    onPress,
    href,
    onaddToDesk,
    onLike,
    isLiked
}: LibraryResourceCardProps) {
    const config = TYPE_CONFIG[type] || { icon: FileText, color: 'sageGreen' as const, label: 'Resource' };
    const Icon = config.icon;

    const renderFooter = () => (
        <HStack className="justify-between items-center mt-2">
            <HStack className="gap-2">
                {onLike && (
                    <SanctuaryButton
                        onPress={onLike}
                        variant="ghost"
                        size="xs"
                        leftIcon={Heart}
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
            href={href}
            footer={renderFooter()}
            elevated
        >
            <HStack className="gap-3 items-center">
                <Box
                    className="w-14 h-14 bg-phase-surface rounded-xl items-center justify-center border border-phase-border"
                >
                    <Icon className="text-phase-accent" size={24} />
                    <Text className="text-[10px] font-bold text-phaseText-primary text-center mt-1">{config.label}</Text>
                </Box>
                <VStack className="flex-1">
                    <Text className="text-base font-semibold text-phaseText-primary" numberOfLines={2}>
                        {title}
                    </Text>
                    {description && (
                        <Text className="text-sm text-phaseText-secondary" numberOfLines={2}>
                            {description}
                        </Text>
                    )}
                    {isPublic && (
                        <Box className="self-start bg-phase-surface shadow-sm px-1.5 py-0.5 rounded border border-phase-border mt-1">
                            <Text className="text-[10px] font-semibold text-phaseText-secondary">Public Resource</Text>
                        </Box>
                    )}
                </VStack>
            </HStack>
        </SanctuaryCard>
    );
}

export default LibraryResourceCard;
