/**
 * Direct messaging API adapter.
 *
 * Conversations and messages are private server-owned data. Keep this
 * surface transport-only so the client cannot accidentally recreate the
 * authorization and participant checks that belong in Sanctuary.
 */

import { orpcClient } from '@repo/core/api/orpcClient';
import type { TemporalScale } from '@repo/core/store/useTemporalStore';

function mapMessage(message: any) {
  return {
    id: message.id,
    conversation_id: message.conversation_id,
    author_id: message.author_id,
    content: message.content,
    created_at: message.created_at,
    author: {
      full_name: message.author_name ?? 'Anonymous User',
      avatar_url: message.author_avatar_url ?? undefined,
    },
  };
}

export const messagingAPI = {
  async getDirectConversations() {
    return orpcClient.messaging.getConversations({});
  },

  async getOrCreateDirectConversation(targetUserId: string): Promise<string> {
    return orpcClient.messaging.getOrCreateConversation({ body: { targetUserId } });
  },

  async getDirectMessages(
    conversationId: string,
    limit = 60,
    viewDate?: string,
    _viewScale?: TemporalScale,
  ) {
    return (
      await orpcClient.messaging.getMessages({
        query: {
          conversationId,
          limit,
          viewDate: viewDate ?? undefined,
        },
      })
    ).map(mapMessage);
  },

  async sendDirectMessage(conversationId: string, content: string) {
    return mapMessage(
      await orpcClient.messaging.sendMessage({
        body: { conversationId, content: content.trim() },
      }),
    );
  },
};
