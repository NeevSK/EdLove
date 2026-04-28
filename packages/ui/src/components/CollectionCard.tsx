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

import { LinearGradient } from 'expo-linear-gradient';
import { BadgeCheck, Bookmark, BookOpen } from 'lucide-react-native';
import { ImageBackground, Pressable } from 'react-native';
import { Box, HStack, Text, VStack } from '../gluestack';

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
  className?: string;
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
  className,
}: CollectionCardProps<T>) {
  const cardContent = (
    <Box
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      className={`rounded-3xl overflow-hidden bg-phase-surface shadow-md ${className || ''}`}
    >
      {thumbnailUrl ? (
        <ImageBackground source={{ uri: thumbnailUrl }} className="flex-1" resizeMode="cover">
          <CardOverlay
            title={title}
            creator={creator}
            resourceCount={resourceCount}
            subjectTag={subjectTag}
            verified={verified}
            onPullToDesk={onPullToDesk ? () => onPullToDesk(contextData as T) : undefined}
          />
        </ImageBackground>
      ) : (
        <VStack className="flex-1 items-center justify-center bg-phase-surface">
          <BookOpen className="text-phase-accent opacity-50" size={44} />
          <CardOverlay
            title={title}
            creator={creator}
            resourceCount={resourceCount}
            subjectTag={subjectTag}
            verified={verified}
            onPullToDesk={onPullToDesk ? () => onPullToDesk(contextData as T) : undefined}
            absolute
          />
        </VStack>
      )}
    </Box>
  );

  if (onPress) {
    return (
      <Pressable onPress={() => onPress(contextData as T)} className="rounded-3xl mr-4">
        {cardContent}
      </Pressable>
    );
  }
  return <Box className="rounded-3xl mr-4">{cardContent}</Box>;
}

// ============================================================================
// INTERNAL: OVERLAY
// ============================================================================

interface OverlayProps {
  title: string;
  creator: string;
  resourceCount: number;
  subjectTag: string;
  verified: boolean;
  onPullToDesk?: () => void;
  absolute?: boolean;
}

function CardOverlay({
  title,
  creator,
  resourceCount,
  subjectTag,
  verified,
  onPullToDesk,
  absolute = false,
}: OverlayProps) {
  return (
    <VStack
      className={`
                flex-1 justify-between p-3
                ${absolute ? 'absolute inset-0' : ''}
            `}
    >
      {/* Top Row */}
      <HStack className="items-center justify-between">
        <Box className="bg-phase-accent px-2 py-1 rounded-md">
          <Text className="text-[10px] font-bold text-white tracking-widest uppercase">
            {subjectTag}
          </Text>
        </Box>
        {verified && (
          <HStack className="items-center gap-1 bg-black/40 px-2 py-1 rounded-md border border-white/10">
            <BadgeCheck className="text-phase-success" size={12} />
            <Text className="text-[10px] font-semibold text-phase-success">Verified</Text>
          </HStack>
        )}
      </HStack>

      {/* Bottom Gradient with title, creator, count */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
        className="absolute left-0 right-0 bottom-0 p-3 pt-8"
      >
        <VStack className="gap-1">
          <Text className="text-sm font-bold text-white leading-5" numberOfLines={2}>
            {title}
          </Text>
          <Text className="text-[11px] text-white/70" numberOfLines={1}>
            {creator}
          </Text>

          <HStack className="items-center justify-between mt-1">
            <HStack className="items-center gap-1 bg-white/10 px-2 py-1 rounded-md border border-white/5">
              <BookOpen className="text-white/60" size={11} />
              <Text className="text-[11px] font-semibold text-white/80">{resourceCount} Items</Text>
            </HStack>

            {onPullToDesk && (
              <Pressable
                onPress={onPullToDesk}
                className="p-2 bg-phase-accent/20 rounded-md border border-phase-accent"
                hitSlop={8}
              >
                <Bookmark className="text-phase-accent" size={14} />
              </Pressable>
            )}
          </HStack>
        </VStack>
      </LinearGradient>
    </VStack>
  );
}
