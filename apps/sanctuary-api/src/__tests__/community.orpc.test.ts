import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: community via native oRPC', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-community',
      user_id: userId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
  });

  it('reads groups through the native contract and returns DTOs', async () => {
    const body = await createTestORPCClient(headers).community.getGroups({
      query: { limit: 20, offset: 0 },
    });
    expect(body).toEqual([]);
  });

  it('reads posts through the native contract and returns DTOs', async () => {
    const body = await createTestORPCClient(headers).community.getPosts({
      query: { limit: 20, offset: 0 },
    });
    expect(body).toEqual([]);
  });

  it('reads and sends group messages through the native contract', async () => {
    const client = createTestORPCClient(headers).community;
    const groupId = '523e4567-e89b-12d3-a456-426614174000';
    expect(await client.getGroupMessages({ params: { groupId }, query: {} })).toEqual([]);
    expect(
      await client.sendGroupMessage({ params: { groupId }, body: { content: 'Hello circle' } }),
    ).toMatchObject({
      group_id: groupId,
      author_id: userId,
      content: 'Hello circle',
    });
    expect(await client.joinGroup({ params: { groupId } })).toMatchObject({
      group_id: groupId,
      user_id: userId,
      role: 'member',
    });
    expect(
      await client.updateMemberStatus({ params: { groupId }, body: { userId, status: 'active' } }),
    ).toMatchObject({
      group_id: groupId,
      user_id: userId,
      status: 'active',
    });
    expect(
      await client.updateGroupPolicy({ params: { groupId }, body: { joinPolicy: 'approval' } }),
    ).toMatchObject({
      id: 'group-mock-id',
      join_policy: 'approval',
    });
    expect(
      await client.getGroupMembers({ params: { groupId }, query: { status: 'active' } }),
    ).toEqual([]);
    expect(await client.approveAllMembers({ params: { groupId } })).toEqual({ success: true });
  });

  it('joins a group through the canonical params envelope', async () => {
    const groupId = '523e4567-e89b-12d3-a456-426614174000';
    await expect(
      createTestORPCClient(headers).community.joinGroup({
        params: { groupId },
      }),
    ).resolves.toMatchObject({
      group_id: groupId,
      user_id: userId,
      role: 'member',
    });
  });

  it('executes comment, poll, and report procedures through native oRPC', async () => {
    const client = createTestORPCClient(headers);
    const postId = '223e4567-e89b-12d3-a456-426614174000';
    const commentId = '323e4567-e89b-12d3-a456-426614174000';
    const optionId = '423e4567-e89b-12d3-a456-426614174000';

    expect(await client.community.getComments({ params: { postId }, query: {} })).toEqual([]);
    expect(
      (
        await client.community.createComment({
          params: { postId },
          body: { content: 'A useful answer' },
        })
      ).content,
    ).toBe('A useful answer');
    expect(await client.community.deleteComment({ params: { commentId } })).toEqual({
      success: true,
    });
    expect(await client.community.toggleCommentUpvote({ params: { commentId } })).toEqual({
      active: true,
    });
    expect(await client.community.markOfficialAnswer({ params: { commentId } })).toEqual({
      success: true,
    });
    expect(await client.community.getPollStatus({ params: { postId } })).toEqual({
      counts: {},
      totalVotes: 0,
      userVotes: [],
    });
    expect(await client.community.voteInPoll({ params: { postId }, body: { optionId } })).toEqual({
      selectedOptionIds: [],
    });
    expect(
      await client.community.reportContent({
        body: {
          postId,
          groupId: '523e4567-e89b-12d3-a456-426614174000',
          reason: 'Needs review',
          reportTarget: 'platform',
        },
      }),
    ).toEqual({ success: true });
  });

  it('keeps post ownership and resonance operations on native oRPC', async () => {
    const client = createTestORPCClient(headers).community;
    const postId = 'a23e4567-e89b-12d3-a456-426614174000';
    expect(
      (await client.updatePost({ params: { postId }, body: { content: 'Updated post' } })).content,
    ).toBe('Updated post');
    expect(await client.getReactionStatus({ params: { postId } })).toEqual({ active: true });
    expect(await client.deletePost({ params: { postId } })).toEqual({ success: true });
  });

  it('rejects malformed native community input before handler execution', async () => {
    await expect(
      (createTestORPCClient(headers).community.getComments as any)({
        params: { postId: 'not-a-uuid' },
        query: {},
      }),
    ).rejects.toBeTruthy();
  });
});
