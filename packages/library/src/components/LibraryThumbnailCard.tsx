/**
 * LibraryThumbnailCard - sanctuary-style resource card.
 * 
 * Sanctuary V3: Migrated to useTheme, @repo/ui primitives, and NativeWind className utilities.
 */

import React from 'react';
import {
    Pressable,
    ImageBackground,
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
import { Theme, useTheme, Box, VStack, HStack, Text } from '@repo/ui';

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
    const theme = useTheme();
    const cfg = TYPE_CONFIG[resolveType(type)];
    const Icon = cfg.icon;

    return (
        <Box className="w-[148px] mr-4 mb-4">
            <Pressable
                onPress={onPress}
                onLongPress={onLongPress}
                className="w-[148px] h-[192px] rounded-3xl overflow-hidden bg-phase-surface border border-phase-border shadow-sm active:opacity-90 active:scale-[0.98]"
                accessibilityRole={href ? 'link' : 'button'}
                // @ts-ignore
                href={href}
                hrefAttrs={{
                    target,
                    rel: target === '_blank' ? 'noopener noreferrer' : undefined,
                }}
            >
                <VStack className="flex-1">
                    {/* Artwork / Thumbnail Area */}
                    <Box className="h-[104px] overflow-hidden bg-black/5 border-b border-phase-border relative">
                        {thumbnailUrl ? (
                            <ImageBackground 
                                source={{ uri: thumbnailUrl }} 
                                className="flex-1"
                                resizeMode="cover"
                            >
                                <Box className="absolute inset-0 bg-white/5" />
                            </ImageBackground>
                        ) : (
                            <Box className="flex-1 items-center justify-center bg-phase-accent/5">
                                <Box 
                                    className="w-14 h-14 rounded-2xl items-center justify-center"
                                    style={{ backgroundColor: cfg.color + '20' }}
                                >
                                    <Icon size={24} color={cfg.color} />
                                </Box>
                            </Box>
                        )}

                        {/* Top Overlays */}
                        <HStack className="absolute top-2 left-2 right-2 justify-between items-start">
                            <Box 
                                className="px-2 py-1 rounded-full bg-white/95 border shadow-sm"
                                style={{ borderColor: cfg.color + '40' }}
                            >
                                <Text className="text-[9px] font-black uppercase tracking-widest" style={{ color: cfg.color }}>
                                    {cfg.label}
                                </Text>
                            </Box>
                            
                            <HStack className="gap-1 items-center">
                                {onBookmarkToggle && (
                                    <Pressable
                                        onPress={(event) => {
                                            if (Platform.OS === 'web') (event as any).stopPropagation();
                                            void onBookmarkToggle();
                                        }}
                                        className="p-1 rounded-full bg-white/90 shadow-sm"
                                        accessibilityRole="button"
                                    >
                                        <Bookmark
                                            size={14}
                                            color={has_bookmarked ? theme.accent.action : theme.text.primary}
                                            fill={has_bookmarked ? theme.accent.action : 'transparent'}
                                        />
                                    </Pressable>
                                )}
                                {verified && (
                                    <Box className="p-1 rounded-full bg-white/90 shadow-sm">
                                        <BadgeCheck color={theme.accent.sageGreen} size={14} />
                                    </Box>
                                )}
                            </HStack>
                        </HStack>
                    </Box>

                    {/* Content Body */}
                    <VStack className="flex-1 p-2.5 justify-between">
                        <VStack className="gap-1">
                            <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.color }} numberOfLines={1}>
                                {subject || 'General'}
                            </Text>
                            <Text className="text-xs font-bold text-phaseText-primary leading-4" numberOfLines={2}>
                                {title}
                            </Text>
                        </VStack>

                        <VStack className="gap-1">
                            <HStack className="justify-between items-center">
                                {endorsements > 0 ? (
                                    <HStack className="items-center gap-1 bg-phase-accent/10 px-1.5 py-0.5 rounded-full">
                                        <ThumbsUp size={8} color={theme.accent.action} />
                                        <Text className="text-[9px] font-black" style={{ color: theme.accent.action }}>
                                            {endorsements}
                                        </Text>
                                    </HStack>
                                ) : <Box />}
                                <Text className="text-[10px] font-bold text-phaseText-tertiary uppercase">Open</Text>
                            </HStack>

                            {copyrightNotice && (
                                <Box className="bg-black/5 rounded py-0.5 px-1 self-start">
                                    <Text className="text-[8px] text-phaseText-tertiary italic" numberOfLines={1}>
                                        \u00A9 {copyrightNotice}
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                    </VStack>
                </VStack>
            </Pressable>
        </Box>
    );
}

export default LibraryThumbnailCard;
