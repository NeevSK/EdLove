import type { BaseResource } from '@repo/core/types';
import { Bookmark, CirclePlay, FileText, FolderPlus, Info, Share2 } from '@repo/ui/icons';
import type React from 'react';
import {
  Sheet,
  SheetBackdrop,
  SheetContent,
  SheetDragIndicator,
  SheetDragIndicatorWrapper,
  SheetIcon,
  SheetItem,
  SheetItemText,
  Box,
  HStack,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useTheme } from '@repo/ui/hooks/useTheme';

export interface ResourceActionSheetProps {
  visible: boolean;
  onClose: () => void;
  resource: BaseResource & { has_bookmarked?: boolean };
  onBookmark: () => void;
  onAddToCollection?: () => void;
  onShare: () => void;
  onViewDetails?: () => void;
}

/**
 * ResourceActionSheet - Standard platform-wide interaction sheet for digital assets.
 * Adheres to Sanctuary V3 spatial design patterns.
 */
export const ResourceActionSheet: React.FC<ResourceActionSheetProps> = ({
  visible,
  onClose,
  resource,
  onBookmark,
  onAddToCollection,
  onShare,
  onViewDetails,
}) => {
  const theme = useTheme();
  if (!resource) return null;

  return (
    <Sheet open={visible} onOpenChange={(open) => !open && onClose()}>
      <SheetBackdrop />
      <SheetContent className="pb-10 px-4">
        <SheetDragIndicatorWrapper>
          <SheetDragIndicator />
        </SheetDragIndicatorWrapper>

        <HStack className="items-center py-4 border-b border-phase-border mb-2 gap-3 w-full">
          <Box className="w-12 h-12 items-center justify-center rounded-xl bg-phase-accent/10">
            {resource.type === 'video' ? (
              <CirclePlay size={28} color={theme.accent.action} />
            ) : (
              <FileText size={28} color={theme.accent.action} />
            )}
          </Box>
          <VStack className="flex-1">
            <Text className="text-xl font-bold text-phaseText-primary" numberOfLines={1}>
              {resource.title}
            </Text>
            <Text className="text-xs text-phaseText-tertiary uppercase tracking-wider font-bold">
              {resource.type} Resource
            </Text>
          </VStack>
        </HStack>

        <ScrollView className="w-full mb-4">
          {onViewDetails && (
            <SheetItem
              onPress={() => {
                onViewDetails();
                onClose();
              }}
              className="rounded-2xl"
            >
              <SheetIcon>
                <Info size={22} color={theme.text.secondary} />
              </SheetIcon>
              <SheetItemText>View Details</SheetItemText>
            </SheetItem>
          )}

          <SheetItem
            onPress={() => {
              onBookmark();
              onClose();
            }}
            className="rounded-2xl"
          >
            <SheetIcon>
              <Bookmark
                size={22}
                color={resource.has_bookmarked ? theme.accent.action : theme.text.secondary}
                fill={resource.has_bookmarked ? theme.accent.action : 'transparent'}
              />
            </SheetIcon>
            <SheetItemText className={resource.has_bookmarked ? 'text-phase-accent font-bold' : ''}>
              {resource.has_bookmarked ? 'Bookmarked' : 'Bookmark'}
            </SheetItemText>
          </SheetItem>

          {onAddToCollection && (
            <SheetItem
              onPress={() => {
                onAddToCollection();
                onClose();
              }}
              className="rounded-2xl"
            >
              <SheetIcon>
                <FolderPlus size={22} color={theme.text.secondary} />
              </SheetIcon>
              <SheetItemText>Add to Collection</SheetItemText>
            </SheetItem>
          )}

          <SheetItem
            onPress={() => {
              onShare();
              onClose();
            }}
            className="rounded-2xl"
          >
            <SheetIcon>
              <Share2 size={22} color={theme.text.secondary} />
            </SheetIcon>
            <SheetItemText>Share Resource</SheetItemText>
          </SheetItem>
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          className="w-full py-4 items-center bg-red-500/10 rounded-2xl mb-4"
          onPress={onClose}
        >
          <Text className="text-base font-bold text-red-500">Cancel</Text>
        </Pressable>
      </SheetContent>
    </Sheet>
  );
};

export default ResourceActionSheet;
