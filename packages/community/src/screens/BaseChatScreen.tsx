import { View, Text } from 'react-native';
import { useChatMessages } from '@repo/community/hooks/useChatMessages';
import { useChatOutbox } from '@repo/community/hooks/useChatOutbox';
import { useChatRealtime } from '@repo/community/hooks/useChatRealtime';
import type { ChatMessage } from '@repo/community/types';
import {
  type ChatChannel,
  ChatSendCommandSchema,
} from '@repo/core/logic/schemas/chat-command.schema';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import { useAuthStore, useTemporalStore } from '@repo/core/store';
import { ErrorState } from '@repo/ui/components/native';
import { AppHeader } from '@repo/ui/components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatProvider } from '@repo/ui/context/ChatContext';
import type { ReactNode } from 'react';
import {
  type ChatComposerAccess,
  ChatDeliveryNotice,
  ChatHistory,
  ChatInput,
} from './chatPresentation';

export interface SubscriptionConfig {
  table: string;
  filter: string;
}
export interface BaseChatScreenProps {
  channelKey: string;
  title: string;
  subtitle?: string;
  fetchMessages: (viewCutoff: string) => Promise<ChatMessage[]>;
  channel: ChatChannel;
  subscription: SubscriptionConfig;
  onPressAuthor?: (userId: string, userName: string) => void;
  headerRight?: ReactNode;
  isBlocked?: boolean;
  blockedMessage?: string;
  isReadOnly?: boolean;
}

export default function BaseChatScreen(props: BaseChatScreenProps) {
  const principalId = useAuthStore((state) => state.user?.id);
  if (!principalId) return <ErrorState title="Sign in to open this conversation" message="An active session is required to participate." />;
  return (
    <AccountChat
      key={`${principalId}:${props.channel.kind}:${props.channel.id}`}
      {...props}
      principalId={principalId}
    />
  );
}

function composerAccess(props: BaseChatScreenProps): ChatComposerAccess {
  if (props.isReadOnly) return { kind: 'history' };
  if (props.isBlocked)
    return {
      kind: 'blocked',
      message: props.blockedMessage ?? 'You cannot send messages to this sanctuary.',
    };
  return { kind: 'editable' };
}

function pendingMessages(
  outbox: ReturnType<typeof useChatOutbox>,
  principalId: string,
  userName: string,
): ChatMessage[] {
  return outbox.pending.map((item) => {
    const command = ChatSendCommandSchema.parse(item.variables);
    return {
      id: command.operationId,
      author_id: principalId,
      content: command.content,
      created_at: new Date(item.timestamp),
      author: { full_name: userName },
    };
  });
}

function AccountChat(props: BaseChatScreenProps & { principalId: string }) {
  const { principalId, channel, channelKey, fetchMessages, subscription } = props;
  const userName = useAuthStore((state) => state.user?.full_name ?? 'You');
  const { isOffline, isOnline } = useOfflineStatus();
  const viewDate = useTemporalStore((state) => state.viewDate);
  const outbox = useChatOutbox(principalId, channel);
  const deferDelivery = isOffline || outbox.readPolicy === 'cached-only';
  const history = useChatMessages({
    principalId,
    channel,
    viewDate,
    fetchMessages,
    remoteEnabled: isOnline && outbox.readPolicy === 'live',
  });
  const realtime = useChatRealtime({
    principalId,
    channelKey,
    userName,
    canBroadcast: isOnline && !deferDelivery,
    table: subscription.table,
    filter: subscription.filter,
    queryKey: history.queryKey,
  });
  const messages = history.data ?? [];
  const pending = props.isReadOnly ? [] : pendingMessages(outbox, principalId, userName);
  const visibleMessages = [
    ...messages,
    ...pending.filter((item) => !messages.some((saved) => saved.id === item.id)),
  ];
  const retry = async () => {
    if (!deferDelivery) {
      outbox.retryPending();
      await history.refresh();
    }
  };
  return (
    <SafeAreaView edges={["bottom", "left", "right"]} className="flex-1 bg-phase-canvas">
      <AppHeader
        title={props.title}
        eyebrow={props.subtitle}
      />
      <ChatProvider>
        <View className="flex-1">
          <ChatHistory
            messages={visibleMessages}
            loading={history.isLoading}
            error={history.error}
            unavailable={history.data === undefined}
            retry={history.refresh}
            principalId={principalId}
            onPressAuthor={props.onPressAuthor}
          />
          <View className="bg-phase-surface border-t border-border px-4 py-4 shadow-sm">
            {isOffline && !props.isReadOnly && (
              <Text className="text-phase-warning text-[11px] font-semibold text-center">
                Offline — sending may be delayed until you reconnect.
              </Text>
            )}
            <ChatDeliveryNotice
              outbox={outbox}
              deferred={deferDelivery}
              hasLegacyQueue={outbox.hasLegacyQueue}
              retry={retry}
            />
            <ChatInput
              outbox={outbox}
              access={composerAccess(props)}
              onTyping={realtime.sendTyping}
              typingUsers={realtime.typingUsers}
            />
          </View>
        </View>
      </ChatProvider>
    </SafeAreaView>
  );
}
