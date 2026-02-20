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
 * Philosophy: Engaging, visual, and curated — inspired by streaming services.
 */

import React, { useMemo } from 'react';
import {
    View,
    Pressable,
    StyleSheet,
    Text,
    ImageBackground,
    useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BadgeCheck, BookOpen, Bookmark } from 'lucide-react-native';
import { Theme } from '../../theme/Theme';

// ============================================================================
// CONSTANTS
// ============================================================================

const CARD_WIDTH = 180;
const CARD_HEIGHT = 220;

// ============================================================================
// TYPES
// ============================================================================

export interface CollectionCardProps {
    title: string;
    creator: string;
    resourceCount: number;
    subjectTag: string;
    thumbnailUrl?: string;
    verified?: boolean;
    onPress?: () => void;
    onPullToDesk?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CollectionCard({
    title,
    creator,
    resourceCount,
    subjectTag,
    thumbnailUrl,
    verified = false,
    onPress,
    onPullToDesk,
}: CollectionCardProps) {
    const isDark = useColorScheme() === 'dark';

    const styles = useMemo(
        () =>
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
                    backgroundColor: isDark ? Theme.colors.deepIndigo : Theme.colors.lotusWhite,
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
                    backgroundColor: 'rgba(0,0,0,0.55)',
                    paddingHorizontal: 6,
                    paddingVertical: 3,
                    borderRadius: Theme.corners.tight,
                },
                verifiedText: {
                    fontSize: 10,
                    fontWeight: '600',
                    color: Theme.colors.sageGreen,
                },
                gradient: {
                    padding: Theme.spacing.sm,
                    paddingTop: Theme.spacing.xl,
                },
                title: {
                    fontSize: Theme.typography.fontSize.sm,
                    fontWeight: '700',
                    color: Theme.colors.sacredWhite,
                    marginBottom: 3,
                    lineHeight: 18,
                },
                creator: {
                    fontSize: 11,
                    color: Theme.colors.pearlGray,
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
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    paddingHorizontal: 7,
                    paddingVertical: 3,
                    borderRadius: Theme.corners.tight,
                },
                countText: {
                    fontSize: 11,
                    color: Theme.colors.pearlGray,
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
        [isDark]
    );

    const gradientColors: [string, string, string] = [
        'transparent',
        'rgba(0,0,0,0.55)',
        'rgba(0,0,0,0.92)',
    ];

    const cardContent = (
        <View style={styles.container}>
            {thumbnailUrl ? (
                <ImageBackground
                    source={{ uri: thumbnailUrl }}
                    style={styles.image}
                    resizeMode="cover"
                >
                    <CardOverlay
                        styles={styles}
                        gradientColors={gradientColors}
                        title={title}
                        creator={creator}
                        resourceCount={resourceCount}
                        subjectTag={subjectTag}
                        verified={verified}
                        onPullToDesk={onPullToDesk}
                    />
                </ImageBackground>
            ) : (
                <View style={styles.fallbackCenter}>
                    <BookOpen color={Theme.colors.sanctuarySaffron} size={44} />
                    <CardOverlay
                        styles={styles}
                        gradientColors={gradientColors}
                        title={title}
                        creator={creator}
                        resourceCount={resourceCount}
                        subjectTag={subjectTag}
                        verified={verified}
                        onPullToDesk={onPullToDesk}
                        absolute
                    />
                </View>
            )}
        </View>
    );

    if (onPress) {
        return (
            <Pressable onPress={onPress} style={styles.pressable}>
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
    const overlayStyle = absolute ? styles.overlay : { flex: 1, justifyContent: 'space-between' as const };

    return (
        <View style={overlayStyle}>
            {/* Top Row */}
            <View style={styles.topRow}>
                <View style={styles.subjectBadge}>
                    <Text style={styles.subjectText}>{subjectTag}</Text>
                </View>
                {verified && (
                    <View style={styles.verifiedBadge}>
                        <BadgeCheck color={Theme.colors.sageGreen} size={11} />
                        <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                )}
            </View>

            {/* Bottom Gradient with title, creator, count */}
            <LinearGradient colors={gradientColors} style={styles.gradient}>
                <Text style={styles.title} numberOfLines={2}>{title}</Text>
                <Text style={styles.creator} numberOfLines={1}>{creator}</Text>
                <View style={styles.bottomRow}>
                    <View style={styles.countBadge}>
                        <BookOpen color={Theme.colors.pearlGray} size={11} />
                        <Text style={styles.countText}>{resourceCount} Items</Text>
                    </View>
                    {onPullToDesk && (
                        <Pressable onPress={onPullToDesk} style={styles.deskButton} hitSlop={8}>
                            <Bookmark color={Theme.colors.sanctuarySaffron} size={14} />
                        </Pressable>
                    )}
                </View>
            </LinearGradient>
        </View>
    );
}

