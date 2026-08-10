/**
 * BaseChatScreen
 *
 * Shared chat layout used by GroupChatScreen and (future) DirectMessageScreen.
 * Handles: message list, real-time subscription, optimistic sends, compose bar.
 * Refactored for Sanctuary V3.
 */

import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';
import { useSafeMutation } from '@repo/core/hooks';
import { useStore } from '@repo/core/store';
import { ChatComposer } from '@repo/ui/components/ChatComposer';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { SanctuaryLegendList } from '@repo/ui/components/SanctuaryLegendList';
import { ChatProvider } from '@repo/ui/context/ChatContext';
import { UserAvatar } from '@repo/ui/components/UserAvatar';
import { MessageSquare } from '@repo/ui/icons';
import {
  AnimatedView,
  Box,
  HStack,
  Icon,
  Pressable,
  Spinner,
  Text,
  VStack,
} from '@repo/ui/primitives';
import type React from 'react';
import { useEffect, useOptimistic, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';
import type { ChatMessage } from '@repo/community/types';

let optimisticId = 0;

const styles = StyleSheet.create({
  listCentered: { paddingVertical: 20, flexGrow: 1, justifyContent: 'center' },
  listStart: { paddingVertical: 20, flexGrow: 1, justifyContent: 'flex-start' },
});

export interface SubscriptionConfig {
  /** Supabase table name to listen on (e.g. 'group_messages') */
  table: string;
  /** Row filter string (e.g. 'group_id=eq.<uuid>') */
  filter: string;
  /** Query to fetch the full message row with author join after INSERT */
  fetchById: (id: string) => Promise<ChatMessage | null>;
}

export interface BaseChatScreenProps {
  /** Unique key for the Supabase realtime channel */
  channelKey: string;
  title: string;
  subtitle?: string;
  fetchMessages: () => Promise<ChatMessage[]>;
  sendMessage: (content: string) => Promise<ChatMessage>;
  subscription: SubscriptionConfig;
  onPressAuthor?: (userId: string, userName: string) => void;
  headerRight?: React.ReactNode;
  isBlocked?: boolean;
  blockedMessage?: string;
  isReadOnly?: boolean;
}

export default function BaseChatScreen({
  channelKey,
  title,
  subtitle,
  fetchMessages,
  sendMessage: performSendMessage,
  subscription,
  onPressAuthor,
  headerRight,
  isBlocked,
  blockedMessage,
  isReadOnly,
}: BaseChatScreenProps) {
  const user = useStore((state) => state.user);
  const { t } = useTranslation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [isPending, startTransition] = useTransition();

  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state: ChatMessage[], newMessage: ChatMessage) => [...state, newMessage],
  );

  const { mutate: sendMessage } = useSafeMutation(
    (content: string) => performSendMessage(content),
    {
      mutationKey: 'sendMessage',
      scope: 'chat',
      mutationType: 'CREATE',
      onSuccess: (data) => {
        if (data) {
          setMessages((prev) => [...prev, data]);
        }
      },
    },
  );

  // Initial load — a local async function declared inside the effect is the
  // sanctioned fetch-then-setState pattern for this repo's set-state-in-effect rule.
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchMessages();
        setMessages(data);
      } catch (err) {
        console.error('[BaseChatScreen] fetch error', err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [fetchMessages]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: subscription.table,
          filter: subscription.filter,
        },
        (payload) => {
          void subscription.fetchById(payload.new.id)
            .then((msg) => {
              if (!msg) return;
              setMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
              });
            })
            .catch((err: unknown) => {
              console.error('[BaseChatScreen] realtime fetch error', err);
            });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [channelKey, subscription]);

  // Send
  const handleSend = async () => {
    const content = draft.trim();
    if (!content || !user) return;
    setDraft('');

    startTransition(async () => {
      const optimistic: ChatMessage = {
        id: `opt-${++optimisticId}`,
        author_id: user.id,
        content,
        created_at: new Date(),
        author: {
          full_name: user.full_name || 'You',
          avatar_url: user.avatar_url ?? undefined,
        },
      };

      addOptimisticMessage(optimistic);

      try {
        await sendMessage(content);
      } catch (err) {
        console.error('[BaseChatScreen] send error', err);
        setDraft(content);
      }
    });
  };

  // Message renderer
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwn = item.author_id === user?.id;
    const authorName = item.author?.full_name || 'Unknown';
    const time = new Date(item.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <HStack className={`justify-${isOwn ? 'end' : 'start'} mb-4 px-5`}>
        {!isOwn && (
          <Box className="mr-3">
            <Pressable
              onPress={() => onPressAuthor?.(item.author_id, authorName)}
              className="bg-phase-surface rounded-full shadow-sm"
              accessibilityRole="button"
              accessibilityLabel={`View profile of ${authorName}`}
              accessibilityHint="Opens this member's profile"
            >
              <UserAvatar avatarUrl={item.author?.avatar_url} fullName={authorName} size={32} />
            </Pressable>
          </Box>
        )}

        <VStack className={`max-w-[75%] gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
          {!isOwn && (
            <Text className="text-[10px] font-black uppercase tracking-widest text-ink/40 ml-1">
              {authorName}
            </Text>
          )}
          <Box
            className={`px-4 py-3 rounded-2xl border ${
              isOwn
                ? 'bg-phase-interactive border-phase-interactive rounded-tr-sm'
                : 'bg-phase-surface border-border rounded-tl-sm'
            }`}
          >
            <Text
              className={`text-sm leading-relaxed font-medium ${isOwn ? 'text-white' : 'text-ink'}`}
            >
              {item.content}
            </Text>
          </Box>
          <Text className="text-[9px] font-bold text-ink/20 px-1">{time}</Text>
        </VStack>
      </HStack>
    );
  };

  return (
    <ScreenWrapper scroll={false} noTopInset={true} className="bg-phase-canvas">
      <GlobalHeader title={title} subtitle={subtitle} showBack rightAction={headerRight} />

      <ChatProvider>
        <Box className="flex-1">
          {loading ? (
            <Box className="flex-1 items-center justify-center">
              <Spinner />
              <Text className="text-ink/40 text-[10px] font-bold uppercase tracking-widest mt-4">
                Tuning Frequencies...
              </Text>
            </Box>
          ) : (
            <SanctuaryLegendList
              keyboardLiftBehavior="always"
              initialScrollAtEnd
              maintainScrollAtEnd
              data={optimisticMessages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
               contentContainerStyle={
                 messages.length === 0 ? styles.listCentered : styles.listStart
               }
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <AnimatedView entering={FadeInDown.duration(800).springify()}>
                  <Box className="items-center px-10">
                    <Box className="w-16 h-16 rounded-full bg-ink/5 items-center justify-center mb-4">
                      <Icon as={MessageSquare} size="lg" className="text-ink/20" />
                    </Box>
                    <Text className="text-center text-ink/40 text-sm font-medium leading-relaxed">
                      {t('chat.empty')}
                    </Text>
                  </Box>
                </AnimatedView>
              }
            />
          )}

          {/* Compose bar */}
          <Box className="bg-phase-surface border-t border-border px-4 py-4 shadow-sm">
            {isReadOnly ? (
              <Box className="py-2 items-center bg-ink/5 rounded-xl border border-dashed border-border">
                <Text className="text-ink/40 text-[11px] font-medium italic">
                  {t('chat.historicalView')}
                </Text>
              </Box>
            ) : isBlocked ? (
              <Box className="py-2 items-center bg-red-500/5 rounded-xl border border-dashed border-red-500/20">
                <Text className="text-red-500/60 text-[11px] font-medium italic">
                  {blockedMessage || 'You cannot send messages to this sanctuary.'}
                </Text>
              </Box>
            ) : (
              <ChatComposer
                value={draft}
                onChangeText={setDraft}
                onSend={() => void handleSend()}
                isSending={isPending}
                placeholder={t('chat.placeholder')}
              />
            )}
          </Box>
        </Box>
      </ChatProvider>
    </ScreenWrapper>
  );
}
