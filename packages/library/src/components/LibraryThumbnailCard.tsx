/**
 * LibraryThumbnailCard - sanctuary-style resource card for mobile/native.
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

const CARD_WIDTH = 148;
const CARD_HEIGHT = 192;
const ARTWORK_HEIGHT = 104;

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
    const value = type?.toLowerCase();
    return value in TYPE_CONFIG ? (value as ThumbnailType) : 'other';
}

export interface LibraryThumbnailCardProps {
    title: string;
    type: string;
    subject?: string;
    thumbnailUrl?: string;
    endorsements?: number;
    verified?: boolean;
    isLocked?: boolean;
    has_bookmarked?: boolean;
    copyrightNotice?: string;
    onPress: () => void;
    onLongPress?: () => void;
    onBookmarkToggle?: () => void | Promise<void>;
    href?: string;
    target?: '_blank' | '_self';
}

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
    const tintSurface = cfg.color + '14';
    const tintBorder = cfg.color + '26';

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
            borderWidth: 1,
            borderColor: colors.border,
            ...Theme.shadows.md,
        },
        imageShell: {
            height: ARTWORK_HEIGHT,
            backgroundColor: tintSurface,
            overflow: 'hidden',
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        image: {
            flex: 1,
        },
        imageSoftener: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(255,255,255,0.08)',
        },
        fallback: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tintSurface,
        },
        topBar: {
            position: 'absolute',
            top: 8,
            left: 8,
            right: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        typeBadge: {
            alignSelf: 'flex-start',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: 'rgba(252,249,242,0.94)',
            borderWidth: 1,
            borderColor: tintBorder,
        },
        typeText: {
            fontSize: 9,
            fontWeight: '800',
            color: cfg.color,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
        },
        body: {
            flex: 1,
            paddingHorizontal: 10,
            paddingVertical: 10,
            justifyContent: 'space-between',
        },
        eyebrow: {
            fontSize: 10,
            fontWeight: '700',
            color: cfg.color,
            letterSpacing: 0.3,
            marginBottom: 4,
        },
        title: {
            fontSize: 12,
            fontWeight: '700',
            color: colors.textPrimary,
            lineHeight: 16,
            marginBottom: 6,
        },
        metaRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
        },
        metaBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 7,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: tintSurface,
            gap: 4,
        },
        metaText: {
            fontSize: 10,
            color: colors.textSecondary,
        },
        copyrightBadge: {
            marginTop: 6,
            paddingHorizontal: 6,
            paddingVertical: 3,
            borderRadius: 6,
            backgroundColor: tintSurface,
            alignSelf: 'flex-start',
        },
        copyrightText: {
            fontSize: 8,
            color: colors.textSecondary,
        },
    }), [cfg.color, colors.border, colors.secondary, colors.textPrimary, colors.textSecondary, tintBorder, tintSurface]);

    const artwork = (
        <View style={styles.imageShell}>
            {thumbnailUrl ? (
                <ImageBackground source={{ uri: thumbnailUrl }} style={styles.image} resizeMode="cover">
                    <View style={styles.imageSoftener} />
                </ImageBackground>
            ) : (
                <View style={styles.fallback}>
                    <View
                        style={{
                            width: 54,
                            height: 54,
                            borderRadius: 18,
                            backgroundColor: cfg.color + '20',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Icon size={24} color={cfg.color} />
                    </View>
                </View>
            )}

            <View style={styles.topBar}>
                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{cfg.label}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {onBookmarkToggle && (
                        <TouchableOpacity
                            onPress={(event) => {
                                if (Platform.OS === 'web') (event as any).stopPropagation();
                                void onBookmarkToggle();
                            }}
                            style={{ marginLeft: 6, padding: 4 }}
                            accessibilityRole="button"
                        >
                            <Bookmark
                                size={16}
                                color={has_bookmarked ? Theme.colors.sanctuarySaffron : colors.textPrimary}
                                fill={has_bookmarked ? Theme.colors.sanctuarySaffron : 'transparent'}
                            />
                        </TouchableOpacity>
                    )}
                    {verified && (
                        <View style={{ marginLeft: 6, padding: 4 }}>
                            <BadgeCheck color={Theme.colors.sageGreen} size={14} />
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            style={(state: any) => [
                styles.pressable,
                Platform.OS === 'web' && state.hovered && { opacity: 0.96, transform: [{ scale: 1.01 }] },
            ]}
            accessibilityRole={href ? 'link' : 'button'}
            // @ts-ignore
            href={href}
            hrefAttrs={{
                target,
                rel: target === '_blank' ? 'noopener noreferrer' : undefined,
            }}
        >
            <View style={styles.card}>
                {artwork}
                <View style={styles.body}>
                    <View>
                        <Text style={styles.eyebrow} numberOfLines={1}>
                            {subject || 'General wisdom'}
                        </Text>
                        <Text style={styles.title} numberOfLines={2}>
                            {title}
                        </Text>
                    </View>

                    <View>
                        <View style={styles.metaRow}>
                            {endorsements > 0 ? (
                                <View style={styles.metaBadge}>
                                    <ThumbsUp size={9} color={Theme.colors.sanctuarySaffron} />
                                    <Text style={[styles.metaText, { color: Theme.colors.sanctuarySaffron, fontWeight: '700' }]}>
                                        {endorsements}
                                    </Text>
                                </View>
                            ) : <View />}
                            <Text style={[styles.metaText, { fontWeight: '700' }]}>Open</Text>
                        </View>

                        {copyrightNotice ? (
                            <View style={styles.copyrightBadge}>
                                <Text style={styles.copyrightText} numberOfLines={1}>
                                    (c) {copyrightNotice}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </View>
            </View>
        </Pressable>
    );
}

export default LibraryThumbnailCard;
