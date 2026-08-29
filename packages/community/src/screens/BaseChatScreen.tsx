import type { ChatMessage } from '@repo/community/types';
import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';
import { useSafeMutation } from '@repo/core/hooks';
import { storage } from '@repo/core/native';
import { useStore, useTemporalStore } from '@repo/core/store';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { ChatComposer } from '@repo/ui/components/ChatComposer';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import { SanctuaryLegendList } from '@repo/ui/components/SanctuaryLegendList';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { UserAvatar } from '@repo/ui/components/UserAvatar';
import { ChatProvider } from '@repo/ui/context/ChatContext';
import { MessageSquare } from '@repo/ui/icons';
import { AnimatedView, Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import type React from 'react';
import { useCallback, useEffect, useOptimistic, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';

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
  const isOffline = useTemporalStore((state) => state.isOffline);
  const { t } = useTranslation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const [queuedMessage, setQueuedMessage] = useState<string | null>(null);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [draft, setDraft] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
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
      onError: (_error, content) => setFailedMessage(content),
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
      setLoading(true);
      setLoadError(null);
      try {
        const data = await fetchMessages();
        setMessages(data);
        setLoadError(null);
      } catch (err) {
        console.error('[BaseChatScreen] fetch error', err);
        setLoadError(err instanceof Error ? err.message : 'Messages could not be loaded.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [fetchMessages, retryNonce]);

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
          void subscription
            .fetchById(payload.new.id)
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

  // Typing indicator via Supabase broadcast
  useEffect(() => {
    const typingChannel = supabase
      .channel(`typing:${channelKey}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const name = (payload as { userId?: string; userName?: string })?.userName;
        const uid = (payload as { userId?: string })?.userId;
        if (!name || uid === user?.id) return;
        setTypingUsers((prev) => (prev.includes(name) ? prev : [...prev, name]));
        setTimeout(() => setTypingUsers((prev) => prev.filter((n) => n !== name)), 3000);
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(typingChannel);
    };
  }, [channelKey, user?.id]);

  const handleTyping = (text: string) => {
    setDraft(text);
    if (text.length > 0 && text.length % 5 === 0) {
      void supabase.channel(`typing:${channelKey}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: user?.id, userName: user?.full_name || 'Someone' },
      });
    }
  };

  const queueMessage = useCallback(
    (content: string) => {
      try {
        const key = `chat_queue:${channelKey}`;
        const raw = storage.getString(key);
        const queued: string[] = raw ? JSON.parse(raw) : [];
        queued.push(content);
        storage.set(key, JSON.stringify(queued));
        setQueueError(null);
        return true;
      } catch (error) {
        console.error('[BaseChatScreen] could not persist queued message', error);
        setQueueError(
          'This message could not be saved for retry. Restore the draft and try again.',
        );
        return false;
      }
    },
    [channelKey],
  );

  // Offline queue: persist failed sends and retry when online
  useEffect(() => {
    if (isOffline) return;
    try {
      const key = `chat_queue:${channelKey}`;
      const raw = storage.getString(key);
      if (!raw) return;
      const queued: string[] = JSON.parse(raw);
      if (queued.length === 0) return;
      // send oldest first
      const next = queued[0];
      if (next) {
        void sendMessage(next)
          .then(() => {
            const remaining = queued.slice(1);
            if (remaining.length === 0) storage.delete(key);
            else storage.set(key, JSON.stringify(remaining));
            setQueuedMessage(null);
          })
          .catch((error: unknown) => {
            console.error('[BaseChatScreen] queued send error', error);
            setQueueError(
              'A queued message could not send yet. It will be retried after reconnection.',
            );
          });
      }
    } catch (error) {
      console.error('[BaseChatScreen] could not read queued messages', error);
      setQueueError(
        'Queued messages are temporarily unavailable. Your current draft is still safe.',
      );
    }
  }, [isOffline, channelKey, sendMessage]);

  // Send — offline queue via MMKV + backgroundSync
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

      // If offline, queue immediately and keep optimistic
      if (isOffline) {
        if (queueMessage(content)) {
          setQueuedMessage(content);
        } else {
          setDraft(content);
          setFailedMessage(content);
        }
        return;
      }

      try {
        await sendMessage(content);
      } catch (err) {
        console.error('[BaseChatScreen] send error', err);
        if (queueMessage(content)) {
          setFailedMessage(null);
          setQueuedMessage(content);
        } else {
          setDraft(content);
          setFailedMessage(content);
        }
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
              <BrandPulse size={32} accessibilityLabel="Loading messages" />
              <Text className="text-ink/40 text-[10px] font-bold uppercase tracking-widest mt-4">
                Tuning Frequencies...
              </Text>
            </Box>
          ) : loadError ? (
            <BrandedErrorState
              title="Messages could not settle"
              message={isOffline ? 'Reconnect to try again.' : loadError}
            >
              <Pressable
                onPress={() => setRetryNonce((value) => value + 1)}
                accessibilityRole="button"
                accessibilityLabel="Try loading messages again"
              >
                <Text className="text-phase-interactive font-bold">Try again</Text>
              </Pressable>
            </BrandedErrorState>
          ) : (
            <SanctuaryLegendList
              keyboardLiftBehavior="always"
              initialScrollAtEnd
              maintainScrollAtEnd
              data={optimisticMessages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={messages.length === 0 ? styles.listCentered : styles.listStart}
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
            {isOffline && !isReadOnly ? (
              <Box className="mb-3 rounded-xl border border-phase-warning/30 bg-phase-warning/10 px-3 py-2">
                <Text className="text-phase-warning text-[11px] font-semibold text-center">
                  Offline — sending may be delayed until you reconnect.
                </Text>
              </Box>
            ) : null}
            {queuedMessage ? (
              <Box
                className="mb-3 rounded-xl border border-phase-warning/30 bg-phase-warning/10 px-3 py-2"
                accessibilityLiveRegion="polite"
              >
                <Text className="text-phase-warning text-[11px] font-semibold">
                  Message queued securely. It will send when the connection returns.
                </Text>
              </Box>
            ) : null}
            {queueError ? (
              <Box
                className="mb-3 rounded-xl border border-phase-danger/30 bg-phase-danger/10 px-3 py-2"
                accessibilityRole="alert"
              >
                <Text className="text-phase-danger text-[11px] font-semibold">{queueError}</Text>
              </Box>
            ) : null}
            {failedMessage ? (
              <Box className="mb-3 rounded-xl border border-phase-warning/30 bg-phase-warning/10 px-3 py-2 flex-row items-center justify-between">
                <Text className="text-phase-warning text-[11px] font-semibold">
                  Message could not be sent or queued.
                </Text>
                <Pressable
                  onPress={() => {
                    setDraft(failedMessage);
                    setFailedMessage(null);
                  }}
                >
                  <Text className="text-phase-interactive text-[11px] font-bold">
                    Restore draft
                  </Text>
                </Pressable>
              </Box>
            ) : null}
            {isReadOnly ? (
              <Box className="py-2 items-center bg-ink/5 rounded-xl border border-dashed border-border">
                <Text className="text-ink/40 text-[11px] font-medium italic">
                  {t('chat.historicalView')}
                </Text>
              </Box>
            ) : isBlocked ? (
              <Box className="py-2 items-center bg-phase-danger/5 rounded-xl border border-dashed border-phase-danger/20">
                <Text className="text-phase-danger text-[11px] font-medium italic">
                  {blockedMessage || 'You cannot send messages to this sanctuary.'}
                </Text>
              </Box>
            ) : (
              <>
                <ChatComposer
                  value={draft}
                  onChangeText={handleTyping}
                  onSend={() => void handleSend()}
                  isSending={isPending}
                  placeholder={t('chat.placeholder')}
                />
                {typingUsers.length > 0 ? (
                  <Text className="text-[11px] text-ink/40 italic mt-2 px-1">
                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
                  </Text>
                ) : null}
              </>
            )}
          </Box>
        </Box>
      </ChatProvider>
    </ScreenWrapper>
  );
}
