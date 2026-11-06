import { View, Text } from 'react-native';
import { Button } from '@repo/ui/components/native';
import { memo } from 'react';

export interface CommunityComposeFurnitureProps {
  onNewPost?: () => void;
  onNewGroup?: () => void;
  onOpenCircle?: () => void;
  hasJoinedGroups?: boolean;
}

export const CommunityComposeFurniture = memo(
  ({
    onNewPost,
    onNewGroup,
    onOpenCircle,
    hasJoinedGroups = false,
  }: CommunityComposeFurnitureProps) => {
    return (
      <View className="mx-4 mt-4 px-5 py-5 rounded-3xl border border-border bg-phase-surface">
        <View className="gap-4">
          <View className="gap-1">
            <Text className="text-md text-ink font-bold">Compose into the circle</Text>
            <Text className="text-ink/60 text-sm leading-snug">
              Posting feels like contribution, not just a button.
            </Text>
          </View>
          <View className="flex-row items-center gap-3 flex-wrap">
            <Button
              label="New Post"
              variant="primary"
              size="sm"
              onPress={onNewPost}
            />
            <Button
              label="New Group"
              variant="secondary"
              size="sm"
              onPress={onNewGroup}
            />
            {hasJoinedGroups ? (
              <Button
                label="Open Circle"
                variant="secondary"
                size="sm"
                onPress={onOpenCircle}
              />
            ) : null}
          </View>
        </View>
      </View>
    );
  },
);
