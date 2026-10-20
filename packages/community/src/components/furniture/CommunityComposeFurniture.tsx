import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import { Box, Heading, HStack, Text, VStack } from '@repo/ui/primitives';
import { memo } from 'react';

export type CommunityComposeFurnitureProps = Readonly<{
  hasJoinedGroups: boolean;
  onNewPost: () => void;
  onNewGroup: () => void;
  onOpenCircle: () => void;
}>;

export const CommunityComposeFurniture = memo(
  ({
    hasJoinedGroups,
    onNewPost,
    onNewGroup,
    onOpenCircle,
  }: CommunityComposeFurnitureProps) => {
    return (
      <Box className="mx-4 mt-4 px-5 py-5 rounded-3xl border border-border bg-phase-surface">
        <VStack className="gap-4">
          <VStack className="gap-1">
            <Heading className="text-md text-ink font-bold">Compose into the circle</Heading>
            <Text className="text-ink/60 text-sm leading-snug">
              Posting feels like contribution, not just a button.
            </Text>
          </VStack>
          <HStack className="gap-3 flex-wrap">
            <SanctuaryButton
              action="primary"
              size="sm"
              onPress={onNewPost}
              className="bg-phase-interactive rounded-xl"
            >
              <Text className="text-white font-bold">New Post</Text>
            </SanctuaryButton>
            <SanctuaryButton
              action="secondary"
              size="sm"
              onPress={onNewGroup}
              className="bg-phase-surface border-border rounded-xl"
            >
              <Text className="text-ink font-bold">New Group</Text>
            </SanctuaryButton>
            {hasJoinedGroups ? (
              <SanctuaryButton
                action="secondary"
                size="sm"
                onPress={onOpenCircle}
                className="bg-phase-surface border-border rounded-xl"
              >
                <Text className="text-ink font-bold">Open Circle</Text>
              </SanctuaryButton>
            ) : null}
          </HStack>
        </VStack>
      </Box>
    );
  },
);

CommunityComposeFurniture.displayName = 'CommunityComposeFurniture';
