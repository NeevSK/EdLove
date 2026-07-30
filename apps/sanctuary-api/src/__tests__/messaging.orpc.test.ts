import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: direct messaging via native oRPC', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const targetUserId = '223e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({ id: 'bond-messaging', user_id: userId, entity_id: 'school-123', entity_type: 'SCHOOL', capacity: 'teacher', status: 'active' });
  });

  it('reads conversations, creates a participant-scoped conversation, reads messages, and sends a message', async () => {
    const client = createTestORPCClient(headers).messaging;
    expect(await client.getConversations({})).toEqual([]);
    const conversationId = await client.getOrCreateConversation({ targetUserId });
    expect(conversationId).toBe('623e4567-e89b-12d3-a456-426614174000');
    expect(await client.getMessages({ conversationId })).toEqual([]);
    expect(await client.sendMessage({ conversationId, content: 'Hello privately' })).toMatchObject({
      conversation_id: conversationId,
      author_id: userId,
      content: 'Hello privately',
    });
  });

  it('rejects malformed conversation and target identifiers at the contract boundary', async () => {
    const client = createTestORPCClient(headers).messaging;
    await expect((client.getMessages as any)({ conversationId: 'not-a-uuid' })).rejects.toBeTruthy();
    await expect((client.getOrCreateConversation as any)({ targetUserId: 'not-a-uuid' })).rejects.toBeTruthy();
  });
});
