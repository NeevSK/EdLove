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
    const body = await createTestORPCClient(headers).community.getGroups({ limit: 20, offset: 0 });
    expect(body).toEqual([]);
  });

  it('reads posts through the native contract and returns DTOs', async () => {
    const body = await createTestORPCClient(headers).community.getPosts({ limit: 20, offset: 0 });
    expect(body).toEqual([]);
  });

  it('reads and sends group messages through the native contract', async () => {
    const client = createTestORPCClient(headers).community;
    const groupId = '523e4567-e89b-12d3-a456-426614174000';
    expect(await client.getGroupMessages({ groupId })).toEqual([]);
    expect(await client.sendGroupMessage({ groupId, content: 'Hello circle' })).toMatchObject({
      group_id: groupId,
      author_id: userId,
      content: 'Hello circle',
    });
    expect(await client.joinGroup({ groupId, capacity: 'member' })).toMatchObject({
      group_id: groupId,
      user_id: userId,
      role: 'member',
    });
    expect(await client.updateMemberStatus({ groupId, userId, status: 'active' })).toMatchObject({
      group_id: groupId,
      user_id: userId,
      status: 'active',
    });
    expect(await client.updateGroupPolicy({ groupId, joinPolicy: 'approval' })).toMatchObject({
      id: 'group-mock-id',
      join_policy: 'approval',
    });
    expect(await client.getGroupMembers({ groupId, status: 'active' })).toEqual([]);
    expect(await client.approveAllMembers({ groupId })).toEqual({ success: true });
  });

  it('executes comment, poll, and report procedures through native oRPC', async () => {
    const client = createTestORPCClient(headers);
    const postId = '223e4567-e89b-12d3-a456-426614174000';
    const commentId = '323e4567-e89b-12d3-a456-426614174000';
    const optionId = '423e4567-e89b-12d3-a456-426614174000';

    expect(await client.community.getComments({ postId })).toEqual([]);
    expect(
      (await client.community.createComment({ postId, content: 'A useful answer' })).content,
    ).toBe('A useful answer');
    expect(await client.community.deleteComment({ commentId })).toEqual({ success: true });
    expect(await client.community.toggleCommentUpvote({ commentId })).toEqual({ active: true });
    expect(await client.community.markOfficialAnswer({ commentId })).toEqual({ success: true });
    expect(await client.community.getPollStatus({ postId })).toEqual({
      counts: {},
      totalVotes: 0,
      userVotes: [],
    });
    expect(await client.community.voteInPoll({ postId, optionId })).toEqual({
      selectedOptionIds: [],
    });
    expect(
      await client.community.reportContent({
        postId,
        groupId: '523e4567-e89b-12d3-a456-426614174000',
        reason: 'Needs review',
        reportTarget: 'platform',
      }),
    ).toEqual({ success: true });
  });

  it('keeps post ownership and resonance operations on native oRPC', async () => {
    const client = createTestORPCClient(headers).community;
    const postId = 'a23e4567-e89b-12d3-a456-426614174000';
    expect((await client.updatePost({ postId, content: 'Updated post' })).content).toBe(
      'Updated post',
    );
    expect(await client.getReactionStatus({ postId })).toEqual({ active: true });
    expect(await client.deletePost({ postId })).toEqual({ success: true });
  });

  it('rejects malformed native community input before handler execution', async () => {
    await expect(
      (createTestORPCClient(headers).community.getComments as any)({ postId: 'not-a-uuid' }),
    ).rejects.toBeTruthy();
  });
});
