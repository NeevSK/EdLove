import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: direct messaging via native oRPC', () => {
  const userId = '123e4567-e89b-8101-8000-426614174000';
  const targetUserId = '223e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-messaging',
      user_id: userId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
  });

  it('reads conversations, creates a participant-scoped conversation, reads messages, and sends a message', async () => {
    const client = createTestORPCClient(headers).messaging;
    expect(await client.getConversations({})).toEqual([]);
    const conversationId = await client.getOrCreateConversation({ body: { targetUserId } });
    expect(conversationId).toBe('623e4567-e89b-12d3-a456-426614174000');
    expect(await client.getMessages({ query: { conversationId } })).toEqual([]);
    expect(
      await client.sendMessage({ body: { conversationId, content: 'Hello privately' } }),
    ).toMatchObject({
      conversation_id: conversationId,
      author_id: userId,
      content: 'Hello privately',
    });
  });

  it('rejects malformed conversation and target identifiers at the contract boundary', async () => {
    const client = createTestORPCClient(headers).messaging;
    await expect(
      client.getMessages({ query: { conversationId: 'not-a-uuid' } }),
    ).rejects.toBeTruthy();
    await expect(
      client.getOrCreateConversation({ body: { targetUserId: 'not-a-uuid' } }),
    ).rejects.toBeTruthy();
  });

  it('denies a non-participant even when the conversation identifier is valid', async () => {
    const outsiderId = '333e4567-e89b-8101-8000-426614174000';
    setMockActiveBond({
      id: 'bond-outsider',
      user_id: outsiderId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
    await expect(
      createTestORPCClient({ Authorization: `Bearer ${outsiderId}` }).messaging.getMessages({
        query: { conversationId: '623e4567-e89b-12d3-a456-426614174000' },
      }),
    ).rejects.toMatchObject({ status: 404 });
  });
});
