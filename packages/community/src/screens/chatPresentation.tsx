import type { useChatOutbox } from '@repo/community/hooks/useChatOutbox';
import type { ChatMessage } from '@repo/community/types';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { ChatComposer } from '@repo/ui/components/ChatComposer';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import { SanctuaryLegendList } from '@repo/ui/components/SanctuaryLegendList';
import { UserAvatar } from '@repo/ui/components/UserAvatar';
import { MessageSquare } from '@repo/ui/icons';
import { AnimatedView, Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';

type Outbox = ReturnType<typeof useChatOutbox>;
export type ChatComposerAccess =
  | { kind: 'editable' }
  | { kind: 'history' }
  | { kind: 'blocked'; message: string };
const styles = StyleSheet.create({
  listCentered: { paddingVertical: 20, flexGrow: 1, justifyContent: 'center' },
  listStart: { paddingVertical: 20, flexGrow: 1, justifyContent: 'flex-start' },
});

function ChatEmptyState() {
  const { t } = useTranslation();
  return (
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
  );
}

function ChatMessageRow({
  item,
  principalId,
  onPressAuthor,
}: {
  item: ChatMessage;
  principalId: string;
  onPressAuthor?: (id: string, name: string) => void;
}) {
  const isOwn = item.author_id === principalId;
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
          className={`px-4 py-3 rounded-2xl border ${isOwn ? 'bg-phase-interactive border-phase-interactive rounded-tr-sm' : 'bg-phase-surface border-border rounded-tl-sm'}`}
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
}

export function ChatHistory({
  messages,
  loading,
  error,
  unavailable,
  retry,
  principalId,
  onPressAuthor,
}: {
  messages: ChatMessage[];
  loading: boolean;
  error: Error | null;
  unavailable: boolean;
  retry: () => Promise<void>;
  principalId: string;
  onPressAuthor?: (id: string, name: string) => void;
}) {
  if (loading)
    return (
      <Box className="flex-1 items-center justify-center">
        <BrandPulse size={32} accessibilityLabel="Loading messages" />
        <Text className="text-ink/40 text-[10px] font-bold uppercase tracking-widest mt-4">
          Tuning Frequencies...
        </Text>
      </Box>
    );
  if (unavailable)
    return (
      <BrandedErrorState
        title="Messages could not settle"
        message={
          error?.message ?? 'No saved history is available. Enable live access to load messages.'
        }
      >
        <Pressable
          onPress={() => void retry()}
          accessibilityRole="button"
          accessibilityLabel="Try loading messages again"
        >
          <Text className="text-phase-interactive font-bold">Try again</Text>
        </Pressable>
      </BrandedErrorState>
    );
  return (
    <>
      {error && (
        <Text accessibilityRole="alert">
          Recent messages could not refresh. Showing saved history.
        </Text>
      )}
      <SanctuaryLegendList
        keyboardLiftBehavior="always"
        initialScrollAtEnd
        maintainScrollAtEnd
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatMessageRow item={item} principalId={principalId} onPressAuthor={onPressAuthor} />
        )}
        contentContainerStyle={messages.length === 0 ? styles.listCentered : styles.listStart}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<ChatEmptyState />}
      />
    </>
  );
}

function deliveryText(outbox: Outbox, deferred: boolean): string {
  const count = outbox.pending.length;
  if (outbox.pending.some((item) => item.commandState === 'dispatching'))
    return `Sending ${count} queued messages…`;
  if (outbox.pending.some((item) => item.commandState === 'auth_paused'))
    return `${count} saved messages are waiting for account verification.`;
  if (outbox.pending.some((item) => item.commandState === 'conflict'))
    return `${count} saved messages need conflict review in the outbox.`;
  return `${count} ${count === 1 ? 'message is' : 'messages are'} saved for delivery. ${deferred ? 'They will send when live access is available.' : 'They are ready to retry.'}`;
}

export function ChatDeliveryNotice({
  outbox,
  deferred,
  hasLegacyQueue,
  retry,
}: {
  outbox: Outbox;
  deferred: boolean;
  hasLegacyQueue: boolean;
  retry: () => Promise<void>;
}) {
  const error =
    outbox.rejected.length > 0
      ? 'Some saved messages need review before delivery. Retry them from the outbox.'
      : hasLegacyQueue
        ? 'Older offline work needs account recovery before it can be delivered.'
        : outbox.admission.error?.message;
  const canRetry =
    !deferred &&
    (outbox.rejected.length > 0 ||
      outbox.pending.some((item) => item.commandState === 'retry_scheduled'));
  return (
    <>
      {outbox.pending.length > 0 && (
        <Box
          className="mb-3 rounded-xl border border-phase-warning/30 bg-phase-warning/10 px-3 py-2"
          accessibilityLiveRegion="polite"
        >
          <Text className="text-phase-warning text-[11px] font-semibold">
            {deliveryText(outbox, deferred)}
          </Text>
        </Box>
      )}
      {error && (
        <Box
          className="mb-3 rounded-xl border border-phase-danger/30 bg-phase-danger/10 px-3 py-2"
          accessibilityRole="alert"
        >
          <Text className="text-phase-danger text-[11px] font-semibold">{error}</Text>
          {canRetry && (
            <Pressable
              onPress={() => void retry()}
              accessibilityRole="button"
              accessibilityLabel="Retry queued messages"
              className="mt-2 self-start"
            >
              <Text className="text-phase-interactive text-[11px] font-bold">
                Retry queued messages
              </Text>
            </Pressable>
          )}
        </Box>
      )}
    </>
  );
}

export function ChatInput({
  outbox,
  access,
  onTyping,
  typingUsers,
}: {
  outbox: Pick<Outbox, 'submit' | 'admission'>;
  access: ChatComposerAccess;
  onTyping: (text: string) => void;
  typingUsers: string[];
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const send = async () => {
    const content = draft.trim();
    if (!content || access.kind !== 'editable' || outbox.admission.isPending) return;
    try {
      await outbox.submit(content);
      setDraft((current) => (current.trim() === content ? '' : current));
      setFailedMessage(null);
    } catch {
      setFailedMessage(content);
    }
  };
  if (access.kind === 'history')
    return (
      <Box className="py-2 items-center bg-ink/5 rounded-xl border border-dashed border-border">
        <Text className="text-ink/40 text-[11px] font-medium italic">
          {t('chat.historicalView')}
        </Text>
      </Box>
    );
  if (access.kind === 'blocked')
    return (
      <Box className="py-2 items-center bg-phase-danger/5 rounded-xl border border-dashed border-phase-danger/20">
        <Text className="text-phase-danger text-[11px] font-medium italic">{access.message}</Text>
      </Box>
    );
  return (
    <>
      {failedMessage && (
        <Box className="mb-3 rounded-xl border border-phase-warning/30 bg-phase-warning/10 px-3 py-2 flex-row items-center justify-between">
          <Text className="text-phase-warning text-[11px] font-semibold">
            Message could not be sent or queued.
          </Text>
          <Pressable
            onPress={() => {
              setDraft(failedMessage);
              setFailedMessage(null);
            }}
            accessibilityRole="button"
            accessibilityLabel="Restore message draft"
          >
            <Text className="text-phase-interactive text-[11px] font-bold">Restore draft</Text>
          </Pressable>
        </Box>
      )}
      <ChatComposer
        value={draft}
        onChangeText={(text) => {
          setDraft(text);
          onTyping(text);
        }}
        onSend={() => void send()}
        isSending={outbox.admission.isPending}
        placeholder={t('chat.placeholder')}
      />
      {typingUsers.length > 0 && (
        <Text className="text-[11px] text-ink/40 italic mt-2 px-1">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
        </Text>
      )}
    </>
  );
}
