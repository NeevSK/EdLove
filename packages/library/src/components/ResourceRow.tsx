import React from 'react';
import {
    FileText,
    Video,
    Link,
    File,
    StickyNote,
    BookOpen,
    Play,
    Bookmark,
    Map,
    BarChart2,
    BookMarked,
    Clapperboard,
    Cpu,
    ArrowLeftRight,
    Trash2,
    Brain,
    ClipboardCheck,
    Sparkles,
} from 'lucide-react-native';
import {
    VStack,
    HStack,
    Box,
    Text,
    Theme,
    SanctuaryCard,
    SanctuaryButton,
    useThemedColors,
} from '@repo/ui';
import { formatFileSize, formatDuration } from '@repo/core';
import type { BaseResource } from '@repo/core';
import type { LibraryResource } from '../types';

// ============================================================================
// CONFIG
// ============================================================================

export type DisplayResourceType =
    | 'pdf' | 'video' | 'link' | 'doc' | 'note' | 'other'
    | 'map' | 'infographic' | 'story' | 'circular' | 'movie_trailer' | 'tech_guide'
    | 'form' | 'graphic';

export const RESOURCE_TYPE_CONFIG: Record    DisplayResourceType,
    { icon: React.ComponentType<any>; color: string; label: string }
> = {
    pdf: { icon: File, color: Theme.colors.emberRed, label: 'PDF' },
    video: { icon: Video, color: Theme.colors.skyBlue, label: 'Video' },
    link: { icon: Link, color: Theme.colors.sanctuarySaffron, label: 'Link' },
    doc: { icon: FileText, color: Theme.colors.ink, label: 'Doc' },
    note: { icon: StickyNote, color: Theme.colors.sageGreen, label: 'Note' },
    map: { icon: Map, color: '#10B981', label: 'Map' },
    infographic: { icon: BarChart2, color: '#F59E0B', label: 'Visual' },
    story: { icon: BookMarked, color: Theme.colors.gurudeviViolet, label: 'Story' },
    circular: { icon: FileText, color: '#EF4444', label: 'Circular' },
    movie_trailer: { icon: Clapperboard, color: '#EC4899', label: 'Film' },
    tech_guide: { icon: Cpu, color: Theme.colors.gurudeviBlue, label: 'Tech' },
    form: { icon: ClipboardCheck, color: Theme.colors.sanctuarySaffron, label: 'Form' },
    graphic: { icon: Brain, color: Theme.colors.gurudeviViolet, label: 'Visual' },
    other: { icon: BookOpen, color: Theme.colors.starlightGray, label: 'File' },
};

export function resolveResourceDisplayType(type: string): DisplayResourceType {
    if (type in RESOURCE_TYPE_CONFIG) return type as DisplayResourceType;
    if (['lesson', 'reading', 'guide', 'worksheet', 'pedagogy'].includes(type)) return 'doc';
    return 'other';
}

// ============================================================================
// COMPONENT
// ============================================================================

export interface ResourceRowProps {
    resource: BaseResource & { subjects?: string[]; verified?: boolean; is_community?: boolean; link_status?: string };
    onOpen: () => void;
    onOpenAnotherWay?: () => void;
    onFlashPlay?: () => void;
    onPullToDesk?: () => void;
    onDelete?: () => void;
    onAISparkle?: () => void;
    onGenerateQuiz?: () => void;
    onGenerateGraphic?: () => void;
}

export function ResourceRow({ resource, onOpen, onOpenAnotherWay, onFlashPlay, onPullToDesk, onDelete, onAISparkle, onGenerateQuiz, onGenerateGraphic }: ResourceRowProps) {
    const colors = useThemedColors();
    const displayType = resolveResourceDisplayType(resource.type);
    const config = RESOURCE_TYPE_CONFIG[displayType];
    const Icon = config.icon;

    const fileSize = resource.metadata?.size ? formatFileSize(resource.metadata.size) : undefined;
    const duration = resource.metadata?.duration ? formatDuration(resource.metadata.duration) : undefined;
    
    const metaParts = [
        resource.format?.toUpperCase(),
        fileSize,
        duration,
    ].filter(Boolean);

    return (
        <Box sx={{ marginBottom: Theme.spacing.sm }}            <SanctuaryCard onPress={onOpen}                <HStack space="md" alignItems="center" sx={{ padding: Theme.spacing.sm }}                    {/* File Type Icon - Refined Glass Effect */}>
                    <Box>
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: Theme.corners.comfortable,
                            backgroundColor: `${config.color}15`,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: `${config.color}30`,
                        }}
                                            <Icon color={config.color} size={20} /                        ><Text size="2xs" bold color={config.color} sx={{ marginTop: Theme.spacing.xs }}>{config.label}</Text                    ></Box
                    >{/* Content */}
                    <VStack sx={{ flex: 1, gap: 2 }}                        <Text color={colors.text} size="sm" bold numberOfLines={1}>{resource.title}</Text                        ><HStack space="xs" alignItems="center"                            <Text size="xs" color={colors.textSecondary}>{resource.subjects?.[0] || ''}</Text                            >{metaParts.length > 0 && (
                                <                                    <Box sx={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.border }} /                                    ><Text size="xs" color={colors.textTertiary}>{metaParts.join(' \u00B7 ')}</Text                                ></                            )}
                        </HStack                        ><HStack space="xs" alignItems="center"                            {resource.verified && (
                                <Box sx={{ backgroundColor: Theme.colors.sageGreen, borderRadius: 4, paddingHorizontal: 4 }}                                    <Text size="2xs" color="white" bold>VERIFIED</Text                                ></Box                            )}
                            {resource.is_community && (
                                <Box sx={{ backgroundColor: Theme.colors.skyBlue, borderRadius: 4, paddingHorizontal: 4 }}                                    <Text size="2xs" color="white" bold>COMMUNITY</Text                                ></Box                            )}
                            {resource.link_status === 'broken' && (
                                <Box sx={{ backgroundColor: Theme.colors.emberRed, borderRadius: 4, paddingHorizontal: 4 }}                                    <Text size="2xs" color="white" bold>BROKEN LINK</Text                                ></Box                            )}
                        </HStack                    </VStack
                    {/* Actions */}
                    <HStack space="xs" alignItems="center"                        {onFlashPlay && (>
                            <SanctuaryButton>
                                onPress={onFlashPlay}
                                variant="ghost"
                                size="xs"
                                action="secondary"
                                leftIcon={Play}>
                                                            {''}
                            </SanctuaryButton                        >)}
                        {onPullToDesk && (
                            <SanctuaryButton>
                                onPress={onPullToDesk}
                                variant="ghost"
                                size="xs"
                                action="secondary"
                                leftIcon={Bookmark}>
                                                            {''}
                            </SanctuaryButton                        >)}
                        {onOpenAnotherWay && (
                            <SanctuaryButton>
                                onPress={onOpenAnotherWay}
                                variant="ghost"
                                size="xs"
                                action="secondary"
                                leftIcon={ArrowLeftRight}>
                                                            {''}
                            </SanctuaryButton                        >)}
                        {onDelete && (
                            <SanctuaryButton>
                                onPress={onDelete}
                                variant="ghost"
                                size="xs"
                                action="negative"
                                leftIcon={Trash2}>
                                                            {''}
                            </SanctuaryButton                        >)}

                        {onAISparkle && (
                            <SanctuaryButton>
                                onPress={onAISparkle}
                                variant="ghost"
                                size="xs"
                                action="primary"
                                leftIcon={Sparkles}>
                                                            {''}
                            </SanctuaryButton                        >)}

                        {onGenerateQuiz && (
                            <SanctuaryButton>
                                onPress={onGenerateQuiz}
                                variant="ghost"
                                size="xs"
                                action="secondary"
                                leftIcon={ClipboardCheck}>
                                                            {''}
                            </SanctuaryButton                        >)}

                        {onGenerateGraphic && (
                            <SanctuaryButton>
                                onPress={onGenerateGraphic}
                                variant="ghost"
                                size="xs"
                                action="secondary"
                                leftIcon={Brain}>
                                                            {''}
                            </SanctuaryButton                        >)}
                    </HStack                </HStack            </SanctuaryCard        </Box    );
}
