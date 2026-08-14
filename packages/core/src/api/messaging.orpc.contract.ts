import { z } from 'zod';

const conversation = z.object({
  id: z.string().uuid(),
  user1_id: z.string().uuid(),
  user2_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
  other_user_id: z.string().uuid(),
  other_user_name: z.string(),
  other_user_avatar: z.string().nullable(),
});

const message = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  author_id: z.string().uuid(),
  content: z.string(),
  created_at: z.string(),
  author_name: z.string().nullable(),
  author_avatar_url: z.string().nullable(),
});

export const messagingORPCContract = {
  getConversations: {
    method: 'get',
    path: '/messaging/conversations',
    metadata: { policy: { action: 'read', subject: 'DirectConversation' } },
    responses: { 200: { schema: z.array(conversation), description: 'User conversations' } },
  },
  getOrCreateConversation: {
    method: 'post',
    path: '/messaging/conversations',
    metadata: { policy: { action: 'create', subject: 'DirectConversation' } },
    request: {
      body: z.object({
        targetUserId: z.string().uuid(),
      }),
    },
    responses: { 201: { schema: z.string().uuid(), description: 'Conversation ID' } },
  },
  getMessages: {
    method: 'get',
    path: '/messaging/messages',
    metadata: { policy: { action: 'read', subject: 'DirectMessage' } },
    request: {
      query: z.object({
        conversationId: z.string().uuid(),
        viewDate: z.string().datetime().optional(),
        limit: z.number().int().positive().max(200).optional(),
      }),
    },
    responses: { 200: { schema: z.array(message), description: 'Conversation messages' } },
  },
  sendMessage: {
    method: 'post',
    path: '/messaging/messages',
    metadata: { policy: { action: 'create', subject: 'DirectMessage' } },
    request: {
      body: z.object({
        conversationId: z.string().uuid(),
        content: z.string(),
      }),
    },
    responses: { 201: { schema: message, description: 'Sent message' } },
  },
};
