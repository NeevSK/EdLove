import type { BaseResource } from '@repo/core/types';
import { Bookmark, FileText, FolderPlus, Info, PlayCircle, Share2 } from 'lucide-react-native';
import type React from 'react';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetIcon,
  ActionsheetItem,
  ActionsheetItemText,
  Box,
  HStack,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '../../gluestack';
import { useTheme } from '../../hooks/useTheme';

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
    <Actionsheet isOpen={visible} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="pb-10 px-4">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <HStack className="items-center py-4 border-b border-phase-border mb-2 gap-3 w-full">
          <Box className="w-12 h-12 items-center justify-center rounded-xl bg-phase-accent/10">
            {resource.type === 'video' ? (
              <PlayCircle size={28} color={theme.accent.action} />
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
            <ActionsheetItem
              onPress={() => {
                onViewDetails();
                onClose();
              }}
              className="rounded-2xl"
            >
              <ActionsheetIcon>
                <Info size={22} color={theme.text.secondary} />
              </ActionsheetIcon>
              <ActionsheetItemText>View Details</ActionsheetItemText>
            </ActionsheetItem>
          )}

          <ActionsheetItem
            onPress={() => {
              onBookmark();
              onClose();
            }}
            className="rounded-2xl"
          >
            <ActionsheetIcon>
              <Bookmark
                size={22}
                color={resource.has_bookmarked ? theme.accent.action : theme.text.secondary}
                fill={resource.has_bookmarked ? theme.accent.action : 'transparent'}
              />
            </ActionsheetIcon>
            <ActionsheetItemText
              className={resource.has_bookmarked ? 'text-phase-accent font-bold' : ''}
            >
              {resource.has_bookmarked ? 'Bookmarked' : 'Bookmark'}
            </ActionsheetItemText>
          </ActionsheetItem>

          {onAddToCollection && (
            <ActionsheetItem
              onPress={() => {
                onAddToCollection();
                onClose();
              }}
              className="rounded-2xl"
            >
              <ActionsheetIcon>
                <FolderPlus size={22} color={theme.text.secondary} />
              </ActionsheetIcon>
              <ActionsheetItemText>Add to Collection</ActionsheetItemText>
            </ActionsheetItem>
          )}

          <ActionsheetItem
            onPress={() => {
              onShare();
              onClose();
            }}
            className="rounded-2xl"
          >
            <ActionsheetIcon>
              <Share2 size={22} color={theme.text.secondary} />
            </ActionsheetIcon>
            <ActionsheetItemText>Share Resource</ActionsheetItemText>
          </ActionsheetItem>
        </ScrollView>

        <Pressable
          className="w-full py-4 items-center bg-red-500/10 rounded-2xl mb-4"
          onPress={onClose}
        >
          <Text className="text-base font-bold text-red-500">Cancel</Text>
        </Pressable>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default ResourceActionSheet;
