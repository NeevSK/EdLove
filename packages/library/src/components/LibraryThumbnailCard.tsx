/**
 * LibraryThumbnailCard \u2014 Netflix-Style Cover-Art Card for Individual Resources
 *
 * A 140 \u00C3\u2014 180 visual card used inside horizontal SmartShelf rows.
 * Each resource type gets a distinct accent colour and icon.
 * Shows title, type badge, endorsement count, and an optional thumbnail image.
 *
 * Designed to be visually consistent with CollectionCard but optimised for
 * individual resources rather than collections.
 */

import React, { useMemo } from 'react';
import {
    Pressable,
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    BookOpen,
    Video,
    File,
    Link,
    Map,
    BarChart2,
    BookMarked,
    FileText,
    Clapperboard,
    Cpu,
    StickyNote,
    ThumbsUp,
    BadgeCheck,
    Bookmark,
} from 'lucide-react-native';
import { Theme, useThemedColors } from '@repo/ui';

// ============================================================================
// CONFIG
// ============================================================================

const CARD_WIDTH = 140;
const CARD_HEIGHT = 180;

type ThumbnailType =
    | 'lesson' | 'worksheet' | 'guide' | 'reading' | 'pedagogy'
    | 'video' | 'link' | 'pdf' | 'doc' | 'note' | 'other'
    | 'map' | 'infographic' | 'story' | 'circular' | 'movie_trailer' | 'tech_guide';

const TYPE_CONFIG: Record<ThumbnailType, { icon: React.ComponentType<{ size?: number; color?: string; fill?: string }>; color: string; label: string }> = {
    lesson: { icon: BookOpen, color: Theme.colors.sanctuarySaffron, label: 'Lesson' },
    worksheet: { icon: FileText, color: Theme.colors.templeGold, label: 'Worksheet' },
    guide: { icon: BookMarked, color: Theme.colors.gurudeviBlue, label: 'Guide' },
    reading: { icon: BookOpen, color: Theme.colors.sageGreen, label: 'Reading' },
    pedagogy: { icon: BarChart2, color: Theme.colors.gurudeviViolet, label: 'Pedagogy' },
    video: { icon: Video, color: Theme.colors.skyBlue, label: 'Video' },
    link: { icon: Link, color: Theme.colors.sanctuarySaffron, label: 'Link' },
    pdf: { icon: File, color: Theme.colors.emberRed, label: 'PDF' },
    doc: { icon: FileText, color: Theme.colors.starlightGray, label: 'Doc' },
    note: { icon: StickyNote, color: Theme.colors.sageGreen, label: 'Note' },
    map: { icon: Map, color: Theme.colors.sageGreen, label: 'Map' },
    infographic: { icon: BarChart2, color: Theme.colors.amberGlow, label: 'Visual' },
    story: { icon: BookOpen, color: Theme.colors.gurudeviViolet, label: 'Story' },
    circular: { icon: FileText, color: Theme.colors.emberRed, label: 'Circular' },
    movie_trailer: { icon: Clapperboard, color: Theme.colors.lotusDeepPink, label: 'Film' },
    tech_guide: { icon: Cpu, color: Theme.colors.gurudeviBlue, label: 'Tech' },
    other: { icon: BookOpen, color: Theme.colors.starlightGray, label: 'File' },
};

function resolveType(type: string): ThumbnailType {
    if (type in TYPE_CONFIG) return type as ThumbnailType;
    return 'other';
}

// ============================================================================
// PROPS
// ============================================================================

export interface LibraryThumbnailCardProps {
    title: string;
    type: string;
    subject?: string;
    thumbnailUrl?: string;
    endorsements?: number;
    verified?: boolean;
    isLocked?: boolean;
    has_bookmarked?: boolean;
    /** Copyright/usage notice \u2013 shown as a subtle footer badge on externally-sourced content */
    copyrightNotice?: string;
    onPress: () => void;
    onLongPress?: () => void;
    onBookmarkToggle?: () => void | Promise<void>;
    href?: string;
    target?: '_blank' | '_self';
}

// ============================================================================
// COMPONENT
// ============================================================================

export function LibraryThumbnailCard({
    title,
    type,
    subject,
    thumbnailUrl,
    endorsements = 0,
    verified = false,
    copyrightNotice,
    has_bookmarked = false,
    onBookmarkToggle,
    onPress,
    onLongPress,
    href,
    target = '_self',
}: LibraryThumbnailCardProps) {
    const colors = useThemedColors();
    const cfg = TYPE_CONFIG[resolveType(type)];
    const Icon = cfg.icon;

    const styles = useMemo(() => StyleSheet.create({
        pressable: {
            width: CARD_WIDTH,
            marginRight: Theme.spacing.md,
            borderRadius: Theme.corners.generous,
        },
        card: {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            borderRadius: Theme.corners.generous,
            overflow: 'hidden',
            backgroundColor: colors.secondary,
            ...Theme.shadows.md,
        },
        fallback: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: cfg.color + '18',
        },
        image: { flex: 1 },
        overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
        typeBadge: {
            alignSelf: 'flex-start',
            margin: 8,
            paddingHorizontal: 7,
            paddingVertical: 3,
            borderRadius: Theme.corners.tight,
            backgroundColor: cfg.color,
        },
        typeText: {
            fontSize: 9,
            fontWeight: '800',
            color: '#fff',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
        },
        gradient: {
            paddingHorizontal: 8,
            paddingBottom: 8,
            paddingTop: 24,
        },
        title: {
            fontSize: 12,
            fontWeight: '700',
            color: colors.text,
            lineHeight: 16,
            marginBottom: 4,
        },
        meta: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        metaText: {
            fontSize: 10,
            color: colors.textSecondary,
        },
        copyrightBadge: {
            marginTop: 4,
            paddingHorizontal: 5,
            paddingVertical: 2,
            borderRadius: 4,
            backgroundColor: 'rgba(0,0,0,0.4)',
            borderWidth: 0.5,
            borderColor: 'rgba(255,255,255,0.2)',
        },
        copyrightText: {
            fontSize: 8,
            color: 'rgba(255,255,255,0.65)',
        },
    }), [colors, cfg]);

    const gradientColors: [string, string, string] = [
        'transparent',
        colors.secondary + 'BB',
        colors.primary,
    ];

    const overlay = (
        <View style={styles.overlay}            {/* Top: type badge + bookmark + verified */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}                <View style={styles.typeBadge}                    <Text style={styles.typeText}>{cfg.label}</Text                ></View                <View style={{ flexDirection: 'row', alignItems: 'center' }}                    {onBookmarkToggle && (
                        <TouchableOpacity 
                            onPress={(e) => {
                                if (Platform.OS === 'web') (e as unknown as { stopPropagation: () => void }).stopPropagation();
                                onBookmarkToggle();
                            }}
                            style={{ margin: 8, padding: 4 }}
                            accessibilityRole="button"
                            accessibilityLabel={has_bookmarked ? "Unbookmark" : "Bookmark"}
                            accessibilityHint={has_bookmarked ? "Removes this resource from your bookmarks" : "Adds this resource to your bookmarks"}
                                                    <Bookmark 
                                size={16} 
                                color={has_bookmarked ? Theme.colors.sanctuarySaffron : 'rgba(255,255,255,0.8)'}
                                fill={has_bookmarked ? Theme.colors.sanctuarySaffron : 'transparent'}
                            /                        ></TouchableOpacity                    )}>
                    {verified && (
                        <View style={{ margin: 8, marginLeft: onBookmarkToggle ? 0 : 8 }}                            <BadgeCheck color={Theme.colors.sageGreen} size={14} /                        ></View                    )}
                </View            </View>
            {/* Bottom: gradient + title + meta */}
            <LinearGradient colors={gradientColors} style={styles.gradient}                <Text style={styles.title} numberOfLines={2}>{title}</Text                ><View style={styles.meta}                    {subject && <Text style={styles.metaText} numberOfLines={1}>{subject}</Text>}
                    {endorsements > 0 && (
                        <                            {subject && <Text style={styles.metaText}>\u00C2\u00B7</Text>}
                            <ThumbsUp size={9} color={Theme.colors.sanctuarySaffron} /                            ><Text style={[styles.metaText, { color: Theme.colors.sanctuarySaffron }]}                                {endorsements}
                            </Text                        </                    )}>
                </View                >{copyrightNotice && (
                    <View style={styles.copyrightBadge}                        <Text style={styles.copyrightText} numberOfLines={1}>\u00C2\u00A9 {copyrightNotice}</Text                    ></View                )}
            </LinearGradient        </View    );

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            style={(state: { hovered?: boolean; pressed?: boolean }) => [
                styles.pressable,
                Platform.OS === 'web' && state.hovered && { opacity: 0.9, cursor: 'pointer' }
            ]}
            accessibilityRole={href ? 'link' : 'button'}
            // @ts-expect-error: href is web-only for Pressable (react-native-web)
            href={href}
            hrefAttrs={{
                target: target,
                rel: target === '_blank' ? 'noopener noreferrer' : undefined,
            }}
                    <View style={styles.card}                {thumbnailUrl ? (
                    <ImageBackground source={{ uri: thumbnailUrl }} style={styles.image} resizeMode="cover"                        {overlay}>
                    </ImageBackground                >) : (
                    <                        <View style={styles.fallback}                            <Icon color={cfg.color} size={36} /                        ></View                        {overlay}
                    </                )}
            </View        </Pressable    );
}

export default LibraryThumbnailCard;
