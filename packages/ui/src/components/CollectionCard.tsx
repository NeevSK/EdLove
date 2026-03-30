/**
 * COLLECTION CARD - Netflix-Style Cover Art Card
 *
 * Displays a ResourceCollection as a visually rich cover-art card with:
 * - Optional thumbnail image background
 * - Gradient overlay for text legibility
 * - Subject tag badge, item count badge, and creator name
 * - "Verified" badge when the collection is verified
 * - "Pull to Desk" bookmark action
 *
 * Philosophy: Engaging, visual, and curated  inspired by streaming services.
 */

import React, { useMemo } from 'react';
import {
    View,
    Pressable,
    StyleSheet,
    Text,
    ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BadgeCheck, BookOpen, Bookmark } from 'lucide-react-native';
import { Theme } from '../theme/Theme';
import { useThemedColors } from '../hooks/useThemedColors';

// ============================================================================
// CONSTANTS
// ============================================================================

const CARD_WIDTH = 180;
const CARD_HEIGHT = 220;

// ============================================================================
// TYPES
// ============================================================================

export interface CollectionCardProps<T = any> {
    title: string;
    creator: string;
    resourceCount: number;
    subjectTag: string;
    thumbnailUrl?: string;
    verified?: boolean;
    contextData?: T;
    onPress?: (contextData: T) => void;
    onPullToDesk?: (contextData: T) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CollectionCard<T = any>({
    title,
    creator,
    resourceCount,
    subjectTag,
    thumbnailUrl,
    verified = false,
    contextData,
    onPress,
    onPullToDesk,
}: CollectionCardProps<T>) {
    const colors = useThemedColors();

    const styles = useMemo(
        () =
            StyleSheet.create({
                pressable: {
                    borderRadius: Theme.corners.generous,
                    marginRight: Theme.spacing.md,
                },
                container: {
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    borderRadius: Theme.corners.generous,
                    overflow: 'hidden',
                    backgroundColor: colors.secondary,
                    ...Theme.shadows.md,
                },
                image: {
                    flex: 1,
                },
                fallbackCenter: {
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                overlay: {
                    ...StyleSheet.absoluteFillObject,
                    justifyContent: 'space-between',
                    padding: Theme.spacing.sm,
                },
                topRow: {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                },
                subjectBadge: {
                    backgroundColor: Theme.colors.sanctuarySaffron,
                    paddingHorizontal: Theme.spacing.sm,
                    paddingVertical: 3,
                    borderRadius: Theme.corners.tight,
                },
                subjectText: {
                    fontSize: 10,
                    fontWeight: '700',
                    color: Theme.colors.white,
                    letterSpacing: 0.4,
                },
                verifiedBadge: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 3,
                    backgroundColor: colors.overlay,
                    paddingHorizontal: 6,
                    paddingVertical: 3,
                    borderRadius: Theme.corners.tight,
                    borderWidth: 0.5,
                    borderColor: colors.border,
                },
                verifiedText: {
                    fontSize: 10,
                    fontWeight: '600',
                    color: colors.success,
                },
                gradient: {
                    padding: Theme.spacing.sm,
                    paddingTop: Theme.spacing.xl,
                },
                title: {
                    fontSize: Theme.typography.fontSize.sm,
                    fontWeight: '700',
                    color: colors.text,
                    marginBottom: 3,
                    lineHeight: 18,
                },
                creator: {
                    fontSize: 11,
                    color: colors.textSecondary,
                    marginBottom: Theme.spacing.sm,
                },
                bottomRow: {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                },
                countBadge: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: colors.overlay,
                    paddingHorizontal: 7,
                    paddingVertical: 3,
                    borderRadius: Theme.corners.tight,
                    borderWidth: 0.5,
                    borderColor: colors.border,
                },
                countText: {
                    fontSize: 11,
                    color: colors.textSecondary,
                    fontWeight: '600',
                },
                deskButton: {
                    padding: 6,
                    backgroundColor: 'rgba(230, 126, 34, 0.15)',
                    borderRadius: Theme.corners.tight,
                    borderWidth: 1,
                    borderColor: Theme.colors.sanctuarySaffron,
                },
            }),
        [colors]
    );

    const gradientColors: [string, string, string] = [
        'transparent',
        colors.secondary + 'CC', // Dynamic secondary with 80% alpha
        colors.primary, // Dynamic primary at the bottom
    ];

    const cardContent = (
        <View style={styles.container}
            {thumbnailUrl ? (>
                <ImageBackground
                    source={{ uri: thumbnailUrl }}
                    style={styles.image}
                    resizeMode="cover">
                
                    <CardOverlay
                        styles={styles}
                        gradientColors={gradientColors}
                        title={title}
                        creator={creator}
                        resourceCount={resourceCount}
                        subjectTag={subjectTag}
                        verified={verified}
                        onPullToDesk={onPullToDesk ? () => onPullToDesk(contextData as T) : undefined}
                    /
                ></ImageBackground>
            ) : (
                <View style={styles.fallbackCenter}
                    <BookOpen color={Theme.colors.sanctuarySaffron} size={44} />
                    ><CardOverlay
                        styles={styles}
                        gradientColors={gradientColors}
                        title={title}
                        creator={creator}
                        resourceCount={resourceCount}
                        subjectTag={subjectTag}
                        verified={verified}
                        onPullToDesk={onPullToDesk ? () => onPullToDesk(contextData as T) : undefined}
                        absolute
                    /
                ></View>
            )}
        </View>
    );

    if (onPress) {
        return (
            <Pressable onPress={() => onPress(contextData as T)} style={styles.pressable}
                {cardContent}
            </Pressable>
        );
    }
    return <View style={styles.pressable}>{cardContent}</View>;
}

// ============================================================================
// INTERNAL: OVERLAY (reused for both image and fallback cases)
// ============================================================================

interface OverlayProps {
    styles: ReturnType<typeof StyleSheet.create>;
    gradientColors: [string, string, string];
    title: string;
    creator: string;
    resourceCount: number;
    subjectTag: string;
    verified: boolean;
    onPullToDesk?: () => void;
    absolute?: boolean;
}

function CardOverlay({
    styles,
    gradientColors,
    title,
    creator,
    resourceCount,
    subjectTag,
    verified,
    onPullToDesk,
    absolute = false,
}: OverlayProps) {
    const baseOverlayStyle = [styles.overlay, { justifyContent: 'space-between' as const }];
    const overlayStyle = absolute
        ? baseOverlayStyle
        : [
            baseOverlayStyle,
            {
                flex: 1,
                position: 'relative' as const,
                top: undefined,
                right: undefined,
                bottom: undefined,
                left: undefined,
            },
        ];

    return (
        <View style={overlayStyle}
            {/* Top Row */}>
            <View style={styles.topRow}
                <View style={styles.subjectBadge}>
                    <Text style={styles.subjectText}>{subjectTag}</Text
                ></View>
                {verified && (
                    <View style={styles.verifiedBadge}
                        <BadgeCheck color={Theme.colors.sageGreen} size={11} />
                        ><Text style={styles.verifiedText}>Verified</Text
                    ></View>
                )}
            </View>

            {/* Bottom Gradient with title, creator, count */}
            <LinearGradient colors={gradientColors} style={styles.gradient}
                <Text style={styles.title} numberOfLines={2}>{title}</Text
                ><Text style={styles.creator} numberOfLines={1}>{creator}</Text
                ><View style={styles.bottomRow}
                    <View style={styles.countBadge}>
                        <BookOpen color={Theme.colors.starlightGray} size={11} /
                        ><Text style={styles.countText}>{resourceCount} Items</Text
                    ></View>
                    {onPullToDesk && (
                        <Pressable onPress={onPullToDesk} style={styles.deskButton} hitSlop={8}
                            <Bookmark color={Theme.colors.sanctuarySaffron} size={14} />
                        ></Pressable>
                    )}
                </View>
            </LinearGradient>
        </View>
    );
}

