/**
 * RESOURCE LIST - Telegram-Style High-Density Resource List
 *
 * Refactored for Sanctuary Resonance.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
    Map,
    BarChart2,
    BookMarked,
    Clapperboard,
    Cpu,
    AlertTriangle,
    ArrowLeftRight,
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
    LivingGlow,
    SanctuaryFlashList
} from '@repo/ui';
import { getMediaUrl, formatFileSize, formatDuration } from '@repo/core';
import { libraryAPI } from '../api/library';
import type { LibraryResource } from '../types';
import { Alert } from 'react-native';
import { LibraryThumbnailCard } from './LibraryThumbnailCard';
import { 
    ResourceRow, 
    RESOURCE_TYPE_CONFIG as TYPE_CONFIG, 
    resolveResourceDisplayType as resolveDisplayType 
} from './ResourceRow';

export interface ResourceListProps {
    resources: LibraryResource[];
    onOpenResource?: (resource: LibraryResource) => void;
    onOpenResourceOptions?: (resource: LibraryResource) => void;
    onPullToDesk?: (resource: LibraryResource) => void;
    ListHeaderComponent?: React.ReactElement | null;
    ListFooterComponent?: React.ReactElement | null;
    onEndReached?: () => void;
    refreshing?: boolean;
    onRefresh?: () => void;
    viewMode?: 'grid' | 'list';
}

export function ResourceList({
    resources,
    onOpenResource,
    onOpenResourceOptions,
    onPullToDesk,
    ListHeaderComponent,
    ListFooterComponent,
    onEndReached,
    refreshing,
    onRefresh,
    viewMode = 'list',
}: ResourceListProps) {
    const [flashPlayResource, setFlashPlayResource] = useState<LibraryResource | null>(null);

    const handleFlashPlay = useCallback((resource: LibraryResource) => {
        setFlashPlayResource(resource);
    }, []);

    const handleCloseFlashPlay = useCallback(() => {
        setFlashPlayResource(null);
    }, []);

    const renderItem = useCallback(({ item }: { item: LibraryResource }) => {
        if (viewMode === 'grid') {
            const getYoutubeThumbnail = (url?: string) => {
                if (!url) return undefined;
                const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/);
                return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : undefined;
            };

            return (
                <Box sx={{ margin: 6 }}>
                    <LibraryThumbnailCard
                        title={item.title}
                        type={item.type}
                        subject={item.subjects?.[0] || ''}
                        thumbnailUrl={item.media?.url || (item as any).thumbnail_url || (item.type === 'video' || item.type === 'movie_trailer' ? getYoutubeThumbnail(item.url) : undefined)}
                        onPress={() => onOpenResource?.(item)}
                        onLongPress={item.url ? () => onOpenResourceOptions?.(item) : undefined}
                    />
                </Box>
            );
        }

        return (
            <ResourceRow
                resource={item}
                onOpen={() => onOpenResource?.(item)}
                onOpenAnotherWay={item.url ? () => onOpenResourceOptions?.(item) : undefined}
                onFlashPlay={() => handleFlashPlay(item)}
                onPullToDesk={onPullToDesk ? () => onPullToDesk(item) : undefined}
            />
        );
    }, [onOpenResource, handleFlashPlay, onPullToDesk, viewMode]);

    const handleReportBroken = useCallback(async (resourceId: string) => {
        try {
            await libraryAPI.reportBrokenLink(resourceId);
            Alert.alert('Reported', 'Thank you. Our curators will check this link.');
            if (onRefresh) onRefresh();
        } catch (err: any) {
            Alert.alert('Error', 'Failed to report link.');
        }
    }, [onRefresh]);

    return (
        <Box sx={{ flex: 1 }}>
            <SanctuaryFlashList
                data={resources}
                renderItem={renderItem}
                key={`resource-list-${viewMode}`}
                numColumns={viewMode === 'grid' ? 2 : 1}
                keyExtractor={(item) => item.id}
                estimatedItemSize={viewMode === 'grid' ? 200 : Theme.listSizes.resourceRow}
                ListHeaderComponent={ListHeaderComponent}
                ListFooterComponent={ListFooterComponent}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                refreshing={refreshing}
                onRefresh={onRefresh}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: Theme.spacing.xl }}
            />

            <FlashPlaySheet
                resource={flashPlayResource}
                onClose={handleCloseFlashPlay}
                onReportBroken={handleReportBroken}
                onOpenAnotherWay={() => {
                    if (flashPlayResource) onOpenResourceOptions?.(flashPlayResource);
                }}
                onOpenFull={() => {
                    if (flashPlayResource) onOpenResource?.(flashPlayResource);
                    handleCloseFlashPlay();
                }}
            />
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
    onOpenAnotherWay?: () => void;
    onReportBroken: (id: string) => void;
}

function FlashPlaySheet({ resource, onClose, onOpenFull, onOpenAnotherWay, onReportBroken }: FlashPlaySheetProps) {
    const colors = useThemedColors();
    const [resonantIslands, setResonantIslands] = useState<any[]>([]);

    useEffect(() => {
        if (resource) {
            libraryAPI.getResonantKnowledge(resource.id).then(setResonantIslands);
        } else {
            setResonantIslands([]);
        }
    }, [resource]);

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

                <VStack space="lg" p={Theme.spacing.lg} sx={{ width: '100%' }}>
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
                        <Box sx={{ backgroundColor: Theme.colors.glass.dark.highlight, padding: Theme.spacing.md, borderRadius: Theme.corners.comfortable }}>
                            <Text color={Theme.colors.starlightGray} size="sm" sx={{ lineHeight: 20 }} numberOfLines={3}>
                                {resource.description}
                            </Text>
                        </Box>
                    ) : null}

                    {resonantIslands.length > 0 && (
                        <VStack space="xs">
                            <Text color={Theme.colors.shroud} size="xs" bold uppercase>Resonant Islands</Text>
                            <HStack space="xs" sx={{ flexWrap: 'wrap' }}>
                                {resonantIslands.map((island) => (
                                    <Box
                                        key={island.id}
                                        sx={{
                                            px: 8,
                                            py: 4,
                                            borderRadius: 8,
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            borderWidth: 1,
                                            borderColor: 'rgba(255,255,255,0.1)'
                                        }}
                                    >
                                        <Text color="#fff" size="2xs">{island.name}</Text>
                                    </Box>
                                ))}
                            </HStack>
                        </VStack>
                    )}

                    <HStack space="md">
                        <Box sx={{ flex: 1 }}>
                            <SanctuaryButton
                                onPress={onOpenFull}
                                action="primary"
                                leftIcon={Play}
                                isDisabled={resource.link_status === 'broken'}
                            >
                                {resource.link_status === 'broken' ? 'Broken Link' : 'Open Resonance'}
                            </SanctuaryButton>
                        </Box>
                        {onOpenAnotherWay && resource.url && resource.link_status !== 'broken' && (
                            <SanctuaryButton
                                onPress={onOpenAnotherWay}
                                variant="outline"
                                action="secondary"
                                leftIcon={ArrowLeftRight}
                            >
                                {''}
                            </SanctuaryButton>
                        )}
                        {resource.link_status !== 'broken' && (
                            <SanctuaryButton
                                onPress={() => onReportBroken(resource.id)}
                                variant="outline"
                                action="negative"
                                leftIcon={AlertTriangle}
                            >
                                {''}
                            </SanctuaryButton>
                        )}
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
