/**
 * RESOURCE LIST - Telegram-Style High-Density Resource List
 *
 * Refactored for Sanctuary Resonance.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { FlatList, useColorScheme } from 'react-native';
import {
    FileText,
    Video,
    Link,
    File,
    StickyNote,
    BookOpen,
    Play,
    Bookmark,
    X,
} from 'lucide-react-native';
import {
    Actionsheet,
    ActionsheetBackdrop,
    ActionsheetContent,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
    VStack,
    HStack,
    Box,
    Text,
    Theme,
    SanctuaryCard,
    SanctuaryButton,
    useThemedColors,
    LivingGlow
} from '@repo/ui';
import { getMediaUrl, formatFileSize, formatDuration } from '@repo/core';
import type { LibraryResource } from '../types';

// ============================================================================
// CONSTANTS & CONFIG
// ============================================================================

type DisplayResourceType = 'pdf' | 'video' | 'link' | 'doc' | 'note' | 'other';

const TYPE_CONFIG: Record<
    DisplayResourceType,
    { icon: React.ComponentType<any>; color: string; label: string }
> = {
    pdf: { icon: File, color: Theme.colors.emberRed, label: 'PDF' },
    video: { icon: Video, color: Theme.colors.skyBlue, label: 'Video' },
    link: { icon: Link, color: Theme.colors.sanctuarySaffron, label: 'Link' },
    doc: { icon: FileText, color: Theme.colors.ink, label: 'Doc' },
    note: { icon: StickyNote, color: Theme.colors.sageGreen, label: 'Note' },
    other: { icon: BookOpen, color: Theme.colors.starlightGray, label: 'File' },
};

function resolveDisplayType(type: string): DisplayResourceType {
    if (type in TYPE_CONFIG) return type as DisplayResourceType;
    if (['lesson', 'reading', 'guide', 'worksheet', 'pedagogy'].includes(type)) return 'doc';
    return 'other';
}

export interface ResourceListProps {
    resources: LibraryResource[];
    onOpenResource?: (resource: LibraryResource) => void;
    onPullToDesk?: (resource: LibraryResource) => void;
    ListHeaderComponent?: React.ReactElement | null;
    ListFooterComponent?: React.ReactElement | null;
    onEndReached?: () => void;
    refreshing?: boolean;
    onRefresh?: () => void;
}

export function ResourceList({
    resources,
    onOpenResource,
    onPullToDesk,
    ListHeaderComponent,
    ListFooterComponent,
    onEndReached,
    refreshing,
    onRefresh,
}: ResourceListProps) {
    const [flashPlayResource, setFlashPlayResource] = useState<LibraryResource | null>(null);

    const handleFlashPlay = useCallback((resource: LibraryResource) => {
        setFlashPlayResource(resource);
    }, []);

    const handleCloseFlashPlay = useCallback(() => {
        setFlashPlayResource(null);
    }, []);

    const renderItem = ({ item }: { item: LibraryResource }) => (
        <ResourceRow
            resource={item}
            onOpen={() => onOpenResource?.(item)}
            onFlashPlay={() => handleFlashPlay(item)}
            onPullToDesk={onPullToDesk ? () => onPullToDesk(item) : undefined}
        />
    );

    return (
        <Box sx={{ flex: 1 }}>
            <FlatList
                data={resources}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={ListHeaderComponent}
                ListFooterComponent={ListFooterComponent}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                refreshing={refreshing}
                onRefresh={onRefresh}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            <FlashPlaySheet
                resource={flashPlayResource}
                onClose={handleCloseFlashPlay}
                onOpenFull={() => {
                    if (flashPlayResource) onOpenResource?.(flashPlayResource);
                    handleCloseFlashPlay();
                }}
            />
        </Box>
    );
}

// ============================================================================
// RESOURCE ROW
// ============================================================================

interface ResourceRowProps {
    resource: LibraryResource;
    onOpen: () => void;
    onFlashPlay: () => void;
    onPullToDesk?: () => void;
}

function ResourceRow({ resource, onOpen, onFlashPlay, onPullToDesk }: ResourceRowProps) {
    const colors = useThemedColors();
    const displayType = resolveDisplayType(resource.type);
    const config = TYPE_CONFIG[displayType];
    const Icon = config.icon;

    const fileSize = formatFileSize(resource.media?.bytes);
    const duration = formatDuration(resource.media?.duration);
    const metaParts = [
        resource.media?.format?.toUpperCase(),
        fileSize,
        duration,
    ].filter(Boolean);

    return (
        <Box sx={{ marginBottom: 8 }}>
            <SanctuaryCard onPress={onOpen}>
                <HStack space="md" alignItems="center" sx={{ padding: 8 }}>
                    {/* File Type Icon - Refined Glass Effect */}
                    <Box
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
                    >
                        <Icon color={config.color} size={20} />
                        <Text size="2xs" bold color={config.color} sx={{ marginTop: 2 }}>{config.label}</Text>
                    </Box>

                    {/* Content */}
                    <VStack sx={{ flex: 1, gap: 2 }}>
                        <Text color={colors.text} size="sm" bold numberOfLines={1}>{resource.title}</Text>
                        <HStack space="xs" alignItems="center">
                            <Text size="xs" color={colors.textSecondary}>{resource.subject}</Text>
                            {metaParts.length > 0 && (
                                <>
                                    <Box sx={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.border }} />
                                    <Text size="xs" color={colors.textTertiary}>{metaParts.join(' · ')}</Text>
                                </>
                            )}
                        </HStack>
                        {resource.verified && (
                            <HStack space="xs" alignItems="center">
                                <Box sx={{ backgroundColor: Theme.colors.sageGreen, borderRadius: 4, paddingHorizontal: 4 }}>
                                    <Text size="2xs" color="white" bold>VERIFIED</Text>
                                </Box>
                            </HStack>
                        )}
                    </VStack>

                    {/* Actions */}
                    <HStack space="xs" alignItems="center">
                        <SanctuaryButton
                            onPress={onFlashPlay}
                            variant="ghost"
                            size="xs"
                            action="secondary"
                            leftIcon={Play}
                        >
                            {''}
                        </SanctuaryButton>
                        {onPullToDesk && (
                            <SanctuaryButton
                                onPress={onPullToDesk}
                                variant="ghost"
                                size="xs"
                                action="secondary"
                                leftIcon={Bookmark}
                            >
                                {''}
                            </SanctuaryButton>
                        )}
                    </HStack>
                </HStack>
            </SanctuaryCard>
        </Box>
    );
}

// ============================================================================
// FLASH-PLAY BOTTOM SHEET
// ============================================================================

interface FlashPlaySheetProps {
    resource: LibraryResource | null;
    onClose: () => void;
    onOpenFull: () => void;
}

function FlashPlaySheet({ resource, onClose, onOpenFull }: FlashPlaySheetProps) {
    const colors = useThemedColors();

    if (!resource) return null;

    const displayType = resolveDisplayType(resource.type);
    const config = TYPE_CONFIG[displayType];
    const Icon = config.icon;
    const fileSize = formatFileSize(resource.media?.bytes);
    const duration = formatDuration(resource.media?.duration);

    const metaParts = [
        fileSize,
        duration,
        resource.difficulty,
    ].filter(Boolean).join(' · ');

    return (
        <Actionsheet isOpen={!!resource} onClose={onClose}>
            <ActionsheetBackdrop />
            <ActionsheetContent sx={{ backgroundColor: Theme.colors.ink }}>
                <ActionsheetDragIndicatorWrapper>
                    <ActionsheetDragIndicator />
                </ActionsheetDragIndicatorWrapper>

                <VStack space="lg" p="$4" sx={{ width: '100%' }}>
                    <HStack space="md" alignItems="center">
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: Theme.corners.comfortable,
                                backgroundColor: `${config.color}20`,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: `${config.color}40`,
                            }}
                        >
                            <Icon color={config.color} size={28} />
                            <Text size="2xs" bold color={config.color}>{config.label}</Text>
                        </Box>
                        <VStack sx={{ flex: 1 }}>
                            <Text color={Theme.colors.sacredWhite} size="md" bold numberOfLines={2}>{resource.title}</Text>
                            <Text color={Theme.colors.mistGray} size="sm">{resource.creator_name}</Text>
                            {metaParts ? <Text color={Theme.colors.shroud} size="xs">{metaParts}</Text> : null}
                        </VStack>
                    </HStack>

                    {resource.description ? (
                        <Box sx={{ backgroundColor: Theme.colors.glass.dark.highlight, padding: 12, borderRadius: Theme.corners.comfortable }}>
                            <Text color={Theme.colors.starlightGray} size="sm" sx={{ lineHeight: 20 }} numberOfLines={3}>
                                {resource.description}
                            </Text>
                        </Box>
                    ) : null}

                    <HStack space="md">
                        <Box sx={{ flex: 1 }}>
                            <SanctuaryButton
                                onPress={onOpenFull}
                                action="primary"
                                leftIcon={Play}
                            >
                                Open Resonance
                            </SanctuaryButton>
                        </Box>
                        <SanctuaryButton
                            onPress={onClose}
                            variant="outline"
                            action="secondary"
                            leftIcon={X}
                        >
                            {''}
                        </SanctuaryButton>
                    </HStack>
                </VStack>
            </ActionsheetContent>
        </Actionsheet>
    );
}
