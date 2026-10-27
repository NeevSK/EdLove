/**
 * DirectMessagesListScreen
 *
 * Displays a list of recent 1:1 conversations.
 * Refactored for Sanctuary V3.
 */

import { communityAPI } from '@repo/community/api/community';
import { directMessageRoute } from '@repo/community/navigation/communityRoutes';
import type { DirectConversation } from '@repo/community/types';
import { usePermissions } from '@repo/core/logic';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import { BrandedEmptyState } from '@repo/ui/components/BrandedEmptyState';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import SanctuaryFlashList from '@repo/ui/components/SanctuaryFlashList';
import { UserAvatar } from '@repo/ui/components/UserAvatar';
import { ChevronRight } from '@repo/ui/icons';
import { Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface DirectMessagesListScreenProps {
  /** Supplying the data makes the host screen the single source of request state. */
  conversations?: DirectConversation[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function DirectMessagesListScreen({
  conversations: controlledConversations,
  loading: controlledLoading,
  error: controlledError,
  onRetry,
}: DirectMessagesListScreenProps) {
  const { t } = useTranslation();
  const [localConversations, setLocalConversations] = useState<DirectConversation[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { can } = usePermissions();
  const { isOffline } = useOfflineStatus();

  const isControlled = controlledConversations !== undefined;
  const conversations = controlledConversations ?? localConversations;
  const loading = controlledLoading ?? localLoading;
  const error = controlledError ?? localError;

  const load = useCallback(async () => {
    setLocalLoading(true);
    setLocalError(null);
    try {
      const data = await communityAPI.getDirectConversations();
      setLocalConversations(data as unknown as DirectConversation[]);
    } catch (err) {
      console.error('[DirectMessagesListScreen] load error', err);
      setLocalError(err instanceof Error ? err.message : 'Direct messages could not be loaded.');
    } finally {
      setLocalLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isControlled) {
      void load();
    }
  }, [isControlled, load]);

  const onRefresh = () => {
    if (isControlled) {
      onRetry?.();
      return;
    }
    setRefreshing(true);
    void load();
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
          onPress={() => (isControlled ? onRetry?.() : void load())}
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
          onPress={() => router.push(directMessageRoute(item.id, name))}
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
        renderItem={renderItem}
        onRefresh={onRefresh}
        refreshing={isControlled ? loading : refreshing}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
        ListHeaderComponent={
          error ? (
            <Box className="mx-5 mb-4 rounded-2xl border border-phase-warning/30 bg-phase-warning/10 p-4">
              <Text className="text-phase-warning text-sm font-semibold">
                {isOffline ? 'Messages will refresh when you reconnect.' : error}
              </Text>
              <Pressable
                onPress={onRefresh}
                accessibilityRole="button"
                accessibilityLabel="Try refreshing conversations again"
                className="mt-3 self-start"
              >
                <Text className="text-phase-interactive font-bold">Try again</Text>
              </Pressable>
            </Box>
          ) : null
        }
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
