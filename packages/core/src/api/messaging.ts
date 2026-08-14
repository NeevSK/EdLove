/**
 * Direct messaging API adapter.
 *
 * Conversations and messages are private server-owned data. Keep this
 * surface transport-only so the client cannot accidentally recreate the
 * authorization and participant checks that belong in Sanctuary.
 */

import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { assertHighway } from '@repo/core/api/highways';
import type { TemporalScale } from '@repo/core/store/useTemporalStore';
import { APIError } from '@repo/core/types/API';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

function assertMessagingHighway() {
  assertHighway('messaging_core', 'direct-api');
}

async function throwApiError(res: Response, operation: string): Promise<never> {
  throw new APIError(operation, res.status.toString());
}

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
    assertMessagingHighway();
    const res = await (client.api as any).messaging.conversations.$get();
    if (!res.ok) await throwApiError(res, 'Failed to fetch direct conversations');
    return await res.json();
  },

  async getOrCreateDirectConversation(targetUserId: string): Promise<string> {
    assertMessagingHighway();
    const res = await (client.api as any).messaging.conversations.$post({
      json: { targetUserId },
    });
    if (!res.ok) await throwApiError(res, 'Failed to create direct conversation');
    return String(await res.json());
  },

  async getDirectMessages(
    conversationId: string,
    limit = 60,
    viewDate?: string,
    _viewScale?: TemporalScale,
  ) {
    assertMessagingHighway();
    const res = await (client.api as any).messaging.messages.$get({
      query: {
        conversationId,
        limit,
        viewDate: viewDate ?? undefined,
      },
    });
    if (!res.ok) await throwApiError(res, 'Failed to fetch direct messages');
    return ((await res.json()) as any[]).map(mapMessage);
  },

  async sendDirectMessage(conversationId: string, content: string) {
    assertMessagingHighway();
    const res = await (client.api as any).messaging.messages.$post({
      json: { conversationId, content: content.trim() },
    });
    if (!res.ok) await throwApiError(res, 'Failed to send direct message');
    return mapMessage(await res.json());
  },
};
