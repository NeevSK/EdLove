/**
 * RESOURCE LIST - Telegram-Style High-Density Resource List
 *
 * A compact, information-rich list component for LibraryResources:
 * - File type icon (PDF, Video, Link, Doc, Note) with color-coded indicator
 * - Title + subject tag in compact rows
 * - Metadata: file size and duration from the `media` object (provider-agnostic)
 * - "Flash-Play" expandable preview via a bottom-sheet action sheet
 * - "Pull to Desk" shortcut per row
 *
 * Philosophy: Reduce friction from "Finding" to "Learning" (Flash-Play principle).
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    FlatList,
    useColorScheme,
} from 'react-native';
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
    ChevronDown,
} from 'lucide-react-native';
import {
    Actionsheet,
    ActionsheetBackdrop,
    ActionsheetContent,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
} from '@repo/ui';
import { Theme } from '@repo/ui';
import { getMediaUrl, formatFileSize, formatDuration } from '@repo/core';
import type { LibraryResource } from '../types';

// ============================================================================
// CONSTANTS
// ============================================================================

type DisplayResourceType = 'pdf' | 'video' | 'link' | 'doc' | 'note' | 'other';

const TYPE_CONFIG: Record<
    DisplayResourceType,
    { icon: React.ComponentType<any>; color: string; label: string }
> = {
    pdf: { icon: File, color: Theme.colors.emberRed, label: 'PDF' },
    video: { icon: Video, color: Theme.colors.skyBlue, label: 'Video' },
    link: { icon: Link, color: Theme.colors.sanctuarySaffron, label: 'Link' },
    doc: { icon: FileText, color: Theme.colors.deepIndigo, label: 'Doc' },
    note: { icon: StickyNote, color: Theme.colors.sageGreen, label: 'Note' },
    other: { icon: BookOpen, color: Theme.colors.pearlGray, label: 'File' },
};

function resolveDisplayType(type: string): DisplayResourceType {
    if (type in TYPE_CONFIG) return type as DisplayResourceType;
    if (type === 'lesson' || type === 'reading' || type === 'guide') return 'doc';
    if (type === 'worksheet' || type === 'pedagogy') return 'doc';
    return 'other';
}

// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// COMPONENT
// ============================================================================

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
        <>
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
                ItemSeparatorComponent={ItemSeparator}
            />

            {/* Flash-Play Bottom Sheet */}
            <FlashPlaySheet
                resource={flashPlayResource}
                onClose={handleCloseFlashPlay}
                onOpenFull={() => {
                    if (flashPlayResource) onOpenResource?.(flashPlayResource);
                    handleCloseFlashPlay();
                }}
            />
        </>
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
    const isDark = useColorScheme() === 'dark';
    const displayType = resolveDisplayType(resource.type);
    const config = TYPE_CONFIG[displayType];
    const Icon = config.icon;

    const mediaUrl = getMediaUrl(resource.media);
    const fileSize = formatFileSize(resource.media?.bytes);
    const duration = formatDuration(resource.media?.duration);
    const metaParts = [
        resource.media?.format?.toUpperCase(),
        fileSize,
        duration,
    ].filter(Boolean);

    const styles = rowStyles(isDark);

    return (
        <Pressable onPress={onOpen} style={styles.container}>
            {/* File Type Icon */}
            <View style={[styles.iconBox, { backgroundColor: `${config.color}18` }]}>
                <Icon color={config.color} size={20} />
                <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>{resource.title}</Text>
                <View style={styles.metaRow}>
                    <Text style={styles.subject}>{resource.subject}</Text>
                    {metaParts.length > 0 && (
                        <Text style={styles.meta}>{metaParts.join(' · ')}</Text>
                    )}
                </View>
                {resource.verified && (
                    <Text style={styles.verified}>✓ Verified</Text>
                )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                {(mediaUrl || resource.url) && (
                    <Pressable onPress={onFlashPlay} style={styles.actionButton} hitSlop={8}>
                        <Play color={Theme.colors.sanctuarySaffron} size={16} />
                    </Pressable>
                )}
                {onPullToDesk && (
                    <Pressable onPress={onPullToDesk} style={styles.actionButton} hitSlop={8}>
                        <Bookmark color={Theme.colors.pearlGray} size={16} />
                    </Pressable>
                )}
            </View>
        </Pressable>
    );
}

function rowStyles(isDark: boolean) {
    return StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: Theme.spacing.md,
            paddingVertical: 10,
            backgroundColor: isDark ? Theme.colors.deepIndigo : Theme.colors.white,
            gap: Theme.spacing.sm,
        },
        iconBox: {
            width: 44,
            height: 44,
            borderRadius: Theme.corners.comfortable,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
        },
        typeLabel: {
            fontSize: 9,
            fontWeight: '700',
            letterSpacing: 0.3,
        },
        content: {
            flex: 1,
            gap: 3,
        },
        title: {
            fontSize: Theme.typography.fontSize.sm,
            fontWeight: '600',
            color: isDark ? Theme.colors.sacredWhite : Theme.colors.charcoalTruth,
            lineHeight: 18,
        },
        metaRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Theme.spacing.sm,
            flexWrap: 'wrap',
        },
        subject: {
            fontSize: 11,
            color: isDark ? Theme.colors.pearlGray : Theme.colors.stoneGray,
            fontWeight: '500',
        },
        meta: {
            fontSize: 11,
            color: isDark ? Theme.colors.mistGray : Theme.colors.stoneGray,
        },
        verified: {
            fontSize: 10,
            color: Theme.colors.sageGreen,
            fontWeight: '600',
        },
        actions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        actionButton: {
            padding: 6,
        },
    });
}

// ============================================================================
// ITEM SEPARATOR
// ============================================================================

function ItemSeparator() {
    const isDark = useColorScheme() === 'dark';
    return (
        <View
            style={{
                height: 1,
                marginLeft: 44 + Theme.spacing.md * 2 + Theme.spacing.sm,
                backgroundColor: isDark
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.06)',
            }}
        />
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
    const isDark = useColorScheme() === 'dark';

    if (!resource) return null;

    const displayType = resolveDisplayType(resource.type);
    const config = TYPE_CONFIG[displayType];
    const Icon = config.icon;
    const fileSize = formatFileSize(resource.media?.bytes);
    const duration = formatDuration(resource.media?.duration);

    const styles = StyleSheet.create({
        header: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: Theme.spacing.md,
            paddingHorizontal: Theme.spacing.lg,
            paddingTop: Theme.spacing.md,
            paddingBottom: Theme.spacing.sm,
        },
        iconBox: {
            width: 52,
            height: 52,
            borderRadius: Theme.corners.comfortable,
            backgroundColor: `${config.color}18`,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
        },
        typeLabel: {
            fontSize: 9,
            fontWeight: '700',
            color: config.color,
        },
        meta: {
            flex: 1,
            gap: 4,
        },
        title: {
            fontSize: Theme.typography.fontSize.md,
            fontWeight: '700',
            color: isDark ? Theme.colors.sacredWhite : Theme.colors.charcoalTruth,
            lineHeight: 22,
        },
        creator: {
            fontSize: 13,
            color: isDark ? Theme.colors.pearlGray : Theme.colors.stoneGray,
        },
        metaText: {
            fontSize: 12,
            color: isDark ? Theme.colors.mistGray : Theme.colors.stoneGray,
        },
        description: {
            fontSize: Theme.typography.fontSize.sm,
            color: isDark ? Theme.colors.pearlGray : Theme.colors.slateGray,
            lineHeight: 20,
            paddingHorizontal: Theme.spacing.lg,
            marginBottom: Theme.spacing.md,
        },
        actions: {
            flexDirection: 'row',
            paddingHorizontal: Theme.spacing.lg,
            paddingBottom: Theme.spacing.xl,
            gap: Theme.spacing.md,
        },
        openButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Theme.spacing.sm,
            backgroundColor: Theme.colors.sanctuarySaffron,
            paddingVertical: 12,
            borderRadius: Theme.corners.comfortable,
        },
        openButtonText: {
            fontSize: Theme.typography.fontSize.md,
            fontWeight: '700',
            color: Theme.colors.white,
        },
        closeButton: {
            padding: 12,
            borderRadius: Theme.corners.comfortable,
            backgroundColor: isDark ? Theme.colors.midnightBlue : Theme.colors.sandStone,
        },
    });

    const metaParts = [
        fileSize,
        duration,
        resource.difficulty,
    ].filter(Boolean).join(' · ');

    return (
        <Actionsheet isOpen onClose={onClose}>
            <ActionsheetBackdrop />
            <ActionsheetContent>
                <ActionsheetDragIndicatorWrapper>
                    <ActionsheetDragIndicator />
                </ActionsheetDragIndicatorWrapper>

                {/* Resource Header */}
                <View style={styles.header}>
                    <View style={styles.iconBox}>
                        <Icon color={config.color} size={24} />
                        <Text style={styles.typeLabel}>{config.label}</Text>
                    </View>
                    <View style={styles.meta}>
                        <Text style={styles.title} numberOfLines={2}>{resource.title}</Text>
                        <Text style={styles.creator}>{resource.creator_name}</Text>
                        {metaParts ? (
                            <Text style={styles.metaText}>{metaParts}</Text>
                        ) : null}
                    </View>
                </View>

                {/* Description preview */}
                {resource.description ? (
                    <Text style={styles.description} numberOfLines={3}>
                        {resource.description}
                    </Text>
                ) : null}

                {/* Actions */}
                <View style={styles.actions}>
                    <Pressable onPress={onOpenFull} style={styles.openButton}>
                        <Play color={Theme.colors.white} size={18} />
                        <Text style={styles.openButtonText}>Open Resource</Text>
                    </Pressable>
                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <X
                            color={isDark ? Theme.colors.pearlGray : Theme.colors.stoneGray}
                            size={20}
                        />
                    </Pressable>
                </View>
            </ActionsheetContent>
        </Actionsheet>
    );
}
