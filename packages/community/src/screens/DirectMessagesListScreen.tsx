/**
 * DirectMessagesListScreen
 *
 * Displays a list of recent 1:1 conversations.
 * Refactored for Sanctuary V3.
 */

import SanctuaryFlashList from '@repo/ui/components/SanctuaryFlashList';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { BrandedEmptyState } from '@repo/ui/components/BrandedEmptyState';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import { UserAvatar } from '@repo/ui/components/UserAvatar';
import { ChevronRight } from '@repo/ui/icons';
import { Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { communityAPI } from '@repo/community/api/community';
import type { DirectConversation } from '@repo/community/types';
import { directMessageRoute } from '@repo/community/navigation/communityRoutes';
import { usePermissions } from '@repo/core/logic';
import { useTemporalStore } from '@repo/core/store';

export default function DirectMessagesListScreen() {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { can } = usePermissions();
  const isOffline = useTemporalStore((state) => state.isOffline);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await communityAPI.getDirectConversations();
      setConversations(data as DirectConversation[]);
    } catch (err) {
      console.error('[DirectMessagesListScreen] load error', err);
      setError(err instanceof Error ? err.message : 'Direct messages could not be loaded.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (!can('read', 'DirectMessages')) {
    return (
      <BrandedErrorState
        title="Private conversations are not available"
        message="Your current sanctuary permissions do not include direct messages."
      />
    );
  }

  if (isOffline && conversations.length === 0) {
    return (
      <BrandedErrorState
        title="Messages are resting"
        message="Direct messages are online-only right now. Reconnect to continue."
      >
        <Text className="text-ink/60 text-xs">Your conversation history is kept private.</Text>
      </BrandedErrorState>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <BrandedErrorState title="The conversation list could not settle" message={error}>
        <Pressable
          onPress={() => void load()}
          accessibilityRole="button"
          accessibilityLabel="Try loading conversations again"
        >
          <Text className="text-phase-interactive font-bold">Try again</Text>
        </Pressable>
      </BrandedErrorState>
    );
  }

  const renderItem = ({ item, index }: { item: DirectConversation; index: number }) => {
    const name = item.other_user_name || 'Explorer';
    const date = new Date(item.updated_at);
    const timeStr = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
        <Pressable
          onPress={() =>
            router.push(directMessageRoute(item.id, name))
          }
          className="mx-5 mb-3"
          accessibilityRole="button"
          accessibilityLabel={`Open conversation with ${name}`}
        >
          <HStack className="p-4 items-center bg-phase-surface border border-border rounded-2xl gap-4 shadow-sm active:scale-[0.98] transition-all">
            <Box className="shadow-sm">
              <UserAvatar avatarUrl={item.other_user_avatar} fullName={name} size={48} />
            </Box>

            <VStack className="flex-1 gap-0.5">
              <HStack className="justify-between items-center">
                <Text className="font-black text-ink text-base">{name}</Text>
                <Text className="text-[10px] font-bold text-ink/20">{timeStr}</Text>
              </HStack>
              <Text className="text-xs font-medium text-ink/40" numberOfLines={1}>
                {t('chat.tapToContinue') || 'Tap to continue conversation'}
              </Text>
            </VStack>

            <Icon as={ChevronRight} size="xs" className="text-ink/20" />
          </HStack>
        </Pressable>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <Box className="flex-1 justify-center items-center bg-phase-canvas">
        <BrandPulse size={32} accessibilityLabel="Loading conversations" />
        <Text className="text-ink/40 text-[10px] font-bold uppercase tracking-widest mt-4">
          Gathering Resonances...
        </Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-phase-canvas">
      <SanctuaryFlashList
        data={conversations}
        keyExtractor={(item: DirectConversation) => item.id}
        estimatedItemSize={80}
        renderItem={renderItem}
        onRefresh={onRefresh}
        refreshing={refreshing}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
        ListEmptyComponent={
          <BrandedEmptyState
            title={t('chat.noConversationsTitle') || 'Quiet Sanctuary'}
            message={
              t('chat.noConversationsDesc') ||
              "Your first private conversation is waiting to begin from a member's profile."
            }
          />
        }
      />
    </Box>
  );
}
