import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import '@repo/core/api/community';
import { storage } from '@repo/core/lib/storage.adapter';
import { useMutationQueue } from '@repo/core/lib/sync/mutationQueue.store';
import { useOfflineStatus } from '@repo/core/offline/resilience.adapter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface ChatMessage {
  id: string;
  senderName: string;
  senderInitials: string;
  text: string;
  time: string;
  isSelf: boolean;
  status: 'sent' | 'pending_sync' | 'failed';
}

const DEFAULT_MESSAGES: Record<string, ChatMessage[]> = {
  'dm-tutii': [
    {
      id: 'm-tutii-welcome',
      senderName: 'Tutii',
      senderInitials: 'TU',
      text: 'Ayubowan! I am Tutii, your firefly guide. What are you exploring or reflecting on today?',
      time: 'Just now',
      isSelf: false,
      status: 'sent',
    },
  ],
  'dm-saved': [
    {
      id: 'm-saved-welcome',
      senderName: 'Saved Messages',
      senderInitials: 'SM',
      text: 'Welcome to your private vault. Messages, thoughts, quotes, and links you save here stay just for you.',
      time: 'Just now',
      isSelf: false,
      status: 'sent',
    },
  ],
  'dm-anoma': [
    {
      id: 'm-anoma-1',
      senderName: 'Mrs. Anoma Ratnayake',
      senderInitials: 'AR',
      text: 'Ayubowan! Please let me know if you need any clarification on the science inquiry topic.',
      time: 'Yesterday',
      isSelf: false,
      status: 'sent',
    },
  ],
  'class-10a': [
    {
      id: 'm-1',
      senderName: 'Mrs. Anoma Ratnayake',
      senderInitials: 'AR',
      text: 'Good morning everyone! Please remember to review the field observation notes before 2 PM today.',
      time: '08:45 AM',
      isSelf: false,
      status: 'sent',
    },
    {
      id: 'm-2',
      senderName: 'Amara Perera',
      senderInitials: 'AP',
      text: 'Thank you teacher! I have uploaded the wetland plant photographs to the assignments section.',
      time: '09:12 AM',
      isSelf: false,
      status: 'sent',
    },
    {
      id: 'm-3',
      senderName: 'Kavi Fernando',
      senderInitials: 'KF',
      text: 'Working on the translation notes now. Does anyone have the second verse reference?',
      time: '09:30 AM',
      isSelf: false,
      status: 'sent',
    },
  ],
};

function getStorageKey(threadId: string): string {
  return `community:chat:${threadId}`;
}

function getInitialThreadMessages(threadId: string): ChatMessage[] {
  if (DEFAULT_MESSAGES[threadId]) {
    return DEFAULT_MESSAGES[threadId];
  }
  // Check sandbox group messages
  const groupSamples = getSandboxSamples<any[]>('community', 'getGroupMessages', [threadId], []);
  const matching = groupSamples.filter((m) => m.group_id === threadId);
  if (matching.length > 0) {
    return matching.map((m) => ({
      id: m.id,
      senderName: m.sender_name ?? 'Participant',
      senderInitials: (m.sender_name ?? 'PA').slice(0, 2).toUpperCase(),
      text: m.content,
      time: 'Earlier',
      isSelf: false,
      status: 'sent',
    }));
  }

  return [
    {
      id: 'm-init',
      senderName: 'Sanctuary Guide',
      senderInitials: 'SG',
      text: 'Welcome to this direct circle. Messages are safely preserved on your device.',
      time: 'Just now',
      isSelf: false,
      status: 'sent',
    },
  ];
}

export function loadDurableChat(threadId: string): ChatMessage[] {
  const key = getStorageKey(threadId);
  const raw = storage.getString(key);
  if (!raw) {
    const seed = getInitialThreadMessages(threadId);
    storage.set(key, JSON.stringify(seed));
    return seed;
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // fallback if corrupted
  }
  return getInitialThreadMessages(threadId);
}

export function saveDurableChat(threadId: string, messages: ChatMessage[]): void {
  storage.set(getStorageKey(threadId), JSON.stringify(messages));
}

export interface UseCommunityChatOptions {
  isEphemeral?: boolean;
}

/** One cache entry per thread; ephemeral (incognito) threads never share it with durable ones. */
export const communityChatKey = (threadId: string, isEphemeral = false) =>
  ['community', 'chat', threadId, isEphemeral ? 'ephemeral' : 'durable'] as const;

/**
 * useCommunityChat
 *
 * A chat thread as a local query: messages live on the device (or only in memory when
 * `isEphemeral`), are read through TanStack Query keyed by thread, and are written by a mutation
 * that persists the message, updates the cache at once and queues the send in the outbox. Every
 * component showing the same thread shares one cache entry; switching threads needs no effect.
 */
export function useCommunityChat(
  threadId: string,
  currentUserName = 'You',
  options: UseCommunityChatOptions = {},
) {
  const { isEphemeral = false } = options;
  const { isOffline, isOnline } = useOfflineStatus();
  const queryClient = useQueryClient();
  const queryKey = communityChatKey(threadId, isEphemeral);
  const readThread = () =>
    isEphemeral ? getInitialThreadMessages(threadId) : loadDurableChat(threadId);

  // Device storage is the source, so the read is synchronous, never stale and never waits for
  // the network.
  const { data: messages } = useQuery({
    queryKey,
    queryFn: readThread,
    initialData: readThread,
    staleTime: Number.POSITIVE_INFINITY,
    networkMode: 'always',
  });

  const pendingCount = useMutationQueue(
    (s) =>
      s.queue.filter((item) => item.scope === 'community' && item.name === 'sendChatMessage')
        .length,
  );

  const send = useMutation({
    mutationKey: ['community', 'chat', 'send'],
    // Writing to the device and queueing works offline; the outbox sends it later.
    networkMode: 'always',
    mutationFn: async (text: string): Promise<ChatMessage> => {
      const normalized = text.trim();
      if (!normalized) throw new Error('Cannot send an empty message.');

      const now = new Date();
      const initials = currentUserName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        senderName: currentUserName,
        senderInitials: initials || 'ME',
        text: normalized,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: true,
        status: isOffline ? 'pending_sync' : 'sent',
      };

      if (isEphemeral) {
        // Incognito: memory only, nothing persisted or queued.
        queryClient.setQueryData<ChatMessage[]>(queryKey, (prev = []) => [...prev, newMessage]);
        return newMessage;
      }

      const updated = [...loadDurableChat(threadId), newMessage];
      saveDurableChat(threadId, updated);
      queryClient.setQueryData<ChatMessage[]>(queryKey, updated);

      await useMutationQueue.getState().addToQueue({
        name: 'sendChatMessage',
        scope: 'community',
        variables: {
          threadId,
          messageId: newMessage.id,
          text: normalized,
          senderName: currentUserName,
          timestamp: now.toISOString(),
        },
        type: 'CUSTOM',
      });
      return newMessage;
    },
  });

  return {
    messages,
    sendMessage: send.mutateAsync,
    isSending: send.isPending,
    isOffline,
    isOnline,
    pendingCount,
  };
}
