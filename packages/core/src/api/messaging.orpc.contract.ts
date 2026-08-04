import { z } from 'zod';

export const messagingORPCContract = {
  getConversations: {
    method: 'get',
    path: '/messaging/conversations',
  },
  getOrCreateConversation: {
    method: 'post',
    path: '/messaging/conversations',
    request: {
      body: z.object({
        targetUserId: z.string().uuid(),
      }),
    },
  },
  getMessages: {
    method: 'get',
    path: '/messaging/messages',
    request: {
      query: z.object({
        conversationId: z.string().uuid(),
      }),
    },
  },
  sendMessage: {
    method: 'post',
    path: '/messaging/messages',
    request: {
      body: z.object({
        conversationId: z.string().uuid(),
        content: z.string(),
      }),
    },
  },
};
