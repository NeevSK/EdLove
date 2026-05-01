/**
 * LibraryThumbnailCard - sanctuary-style resource card.
 *
 * Sanctuary V3: Migrated to useTheme, @repo/ui primitives, and NativeWind className utilities.
 */

import { coreRuntime } from '@repo/core/logic';
import { Box } from '@repo/ui/primitives';
import { HStack, ImageBackground, Text, VStack } from '@repo/ui/primitives';
import { Pressable, useTheme } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';

import {
  BadgeCheck,
  BarChart2,
  BookMarked,
  Bookmark,
  BookOpen,
  Clapperboard,
  Cpu,
  File,
  FileText,
  Link,
  Map,
  StickyNote,
  ThumbsUp,
  Video,
} from 'lucide-react-native';
import React from 'react';

import type { LibraryResource } from '../types';

type ThumbnailType =
  | 'lesson'
  | 'worksheet'
  | 'guide'
  | 'reading'
  | 'pedagogy'
  | 'video'
  | 'link'
  | 'pdf'
  | 'doc'
  | 'note'
  | 'other'
  | 'map'
  | 'infographic'
  | 'story'
  | 'circular'
  | 'movie_trailer'
  | 'tech_guide';

const TYPE_CONFIG: Record<
  ThumbnailType,
  {
    icon: React.ComponentType<{ size?: number; color?: string; fill?: string }>;
    color: string;
    label: string;
  }
> = {
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

function resolveType(type: string | undefined): ThumbnailType {
  const value = type?.toLowerCase() || '';
  return value in TYPE_CONFIG ? (value as ThumbnailType) : 'other';
}

const getYoutubeThumbnail = (url?: string) => {
  if (!url) return undefined;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/,
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : undefined;
};

export interface LibraryThumbnailCardProps {
  resource?: LibraryResource;
  title?: string;
  type?: string;
  subject?: string;
  thumbnailUrl?: string;
  endorsements?: number;
  verified?: boolean;
  isLocked?: boolean;
  has_bookmarked?: boolean;
  copyrightNotice?: string;
  onPress: (resource: LibraryResource) => void;
  onLongPress?: (resource: LibraryResource) => void;
  onBookmarkToggle?: (resource: LibraryResource) => void | Promise<void>;
  href?: string;
  target?: '_blank' | '_self';
}

export const LibraryThumbnailCard = React.memo(
  ({
    resource,
    title: manualTitle,
    type: manualType,
    subject: manualSubject,
    thumbnailUrl: manualThumbnail,
    endorsements: manualEndorsements = 0,
    verified: manualVerified = false,
    copyrightNotice: manualCopyright,
    has_bookmarked: manualHasBookmarked = false,
    onBookmarkToggle,
    onPress,
    onLongPress,
    href,
    target = '_self',
  }: LibraryThumbnailCardProps) => {
    const theme = useTheme();

    // Derivation Logic
    const title = resource?.title ?? manualTitle ?? '';
    const type = resource?.type ?? manualType ?? 'other';
    const subject = resource?.subjects?.[0] ?? manualSubject;
    const verified = resource?.verified ?? manualVerified;
    const endorsements = resource?.endorsements ?? manualEndorsements;
    const has_bookmarked = resource?.has_bookmarked ?? manualHasBookmarked;
    const copyrightNotice = resource?.copyright_notice ?? manualCopyright;

    const thumbnailUrl = resource
      ? resource.media?.url ||
        (resource as any).thumbnail_url ||
        (resource.type === 'video' || resource.type === 'movie_trailer'
          ? getYoutubeThumbnail(resource.url)
          : undefined)
      : manualThumbnail;

    const cfg = TYPE_CONFIG[resolveType(type)];
    const Icon = cfg.icon;

    // Stable Handlers
    const handlePress = React.useCallback(() => {
      if (resource) onPress(resource);
    }, [resource, onPress]);

    const handleLongPress = React.useCallback(() => {
      if (resource && onLongPress) onLongPress(resource);
    }, [resource, onLongPress]);

    const handleBookmarkToggle = React.useCallback(
      (event: any) => {
        if (coreRuntime.device.getMetadata().platform === 'web') event.stopPropagation();
        if (resource && onBookmarkToggle) void onBookmarkToggle(resource);
      },
      [resource, onBookmarkToggle],
    );

    return (
      <Box className="w-[148px] mr-4 mb-4">
        <Pressable
          onPress={handlePress}
          onLongPress={handleLongPress}
          className="w-[148px] h-[192px] rounded-3xl overflow-hidden bg-phase-surface border border-phase-border shadow-sm active:opacity-90 active:scale-[0.98]"
          accessibilityRole={href ? 'link' : 'button'}
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
                    style={{ backgroundColor: `${cfg.color}20` }}
                  >
                    <Icon size={24} color={cfg.color} />
                  </Box>
                </Box>
              )}

              {/* Top Overlays */}
              <HStack className="absolute top-2 left-2 right-2 justify-between items-start">
                <Box
                  className="px-2 py-1 rounded-full bg-white/95 border shadow-sm"
                  style={{ borderColor: `${cfg.color}40` }}
                >
                  <Text
                    className="text-[9px] font-black uppercase tracking-widest"
                    style={{ color: cfg.color }}
                  >
                    {cfg.label}
                  </Text>
                </Box>

                <HStack className="gap-1 items-center">
                  {onBookmarkToggle && (
                    <Pressable
                      onPress={handleBookmarkToggle}
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
                <Text
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: cfg.color }}
                  numberOfLines={1}
                >
                  {subject || 'General'}
                </Text>
                <Text
                  className="text-xs font-bold text-phaseText-primary leading-4"
                  numberOfLines={2}
                >
                  {title}
                </Text>
              </VStack>

              <VStack className="gap-1">
                <HStack className="justify-between items-center">
                  {endorsements > 0 ? (
                    <HStack className="items-center gap-1 bg-phase-accent/10 px-1.5 py-0.5 rounded-full">
                      <ThumbsUp size={8} color={theme.accent.action} />
                      <Text
                        className="text-[9px] font-black"
                        style={{ color: theme.accent.action }}
                      >
                        {endorsements}
                      </Text>
                    </HStack>
                  ) : (
                    <Box />
                  )}
                  <Text className="text-[10px] font-bold text-phaseText-tertiary uppercase">
                    Open
                  </Text>
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
  },
);

export default LibraryThumbnailCard;
