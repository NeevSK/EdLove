'use client';

import { storage } from '@repo/core/lib/storage';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { useOfflineStatus } from '@repo/core/offline/resilience';
import { useCallback, useEffect, useState } from 'react';

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

export function loadDurableChat(threadId: string): ChatMessage[] {
  const key = getStorageKey(threadId);
  const raw = storage.getString(key);
  if (!raw) {
    const seed = DEFAULT_MESSAGES[threadId] ?? [
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
    storage.set(key, JSON.stringify(seed));
    return seed;
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // fallback if corrupted
  }
  return DEFAULT_MESSAGES[threadId] ?? [];
}

export function saveDurableChat(threadId: string, messages: ChatMessage[]): void {
  storage.set(getStorageKey(threadId), JSON.stringify(messages));
}

/**
 * useCommunityChat
 *
 * Decoupled domain hook managing real-time and offline chat threads,
 * local message queues, optimistic sending, and auto-draining.
 */
export function useCommunityChat(threadId: string, currentUserName = 'You') {
  const { isOffline, isOnline } = useOfflineStatus();
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadDurableChat(threadId));
  const pendingCount = useMutationQueue(
    (s) =>
      s.queue.filter((item) => item.scope === 'community' && item.name === 'sendChatMessage')
        .length,
  );

  useEffect(() => {
    setMessages(loadDurableChat(threadId));
  }, [threadId]);

  const sendMessage = useCallback(
    async (text: string): Promise<ChatMessage> => {
      const normalized = text.trim();
      if (!normalized) throw new Error('Cannot send an empty message.');

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        time: timeStr,
        isSelf: true,
        status: isOffline ? 'pending_sync' : 'sent',
      };

      const current = loadDurableChat(threadId);
      const updatedList = [...current, newMessage];

      // 1. Immediately persist locally
      saveDurableChat(threadId, updatedList);
      setMessages(updatedList);

      // 2. Queue mutation
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
    [currentUserName, isOffline, threadId],
  );

  return {
    messages,
    sendMessage,
    isOffline,
    isOnline,
    pendingCount,
  };
}
