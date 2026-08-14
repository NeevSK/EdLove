import { z } from 'zod';
import { communityContract } from './community.contract';

const communityPolicy = (action: 'create' | 'read' | 'update' | 'delete', subject: 'Post') =>
  ({
    policy: { action, subject },
  }) as const;

const comment = z.object({
  id: z.string().uuid(),
  post_id: z.string().uuid(),
  author_id: z.string().uuid().nullable(),
  content: z.string(),
  is_anonymous: z.boolean(),
  is_official_answer: z.boolean(),
  upvote_count: z.number().int().nonnegative(),
  created_at: z.string(),
  updated_at: z.string(),
  author_name: z.string().nullable(),
});

const success = z.object({ success: z.literal(true) });
const groupMember = z.object({
  id: z.string().uuid(),
  group_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.string(),
  status: z.string(),
  joined_at: z.string().optional(),
  user_name: z.string().optional(),
  user_capacity: z.string().nullable().optional(),
  user_avatar: z.string().nullable().optional(),
});

export const communityORPCContract = {
  ...communityContract,
  updateMemberStatus: {
    method: 'patch',
    path: '/community/groups/:groupId/members/status',
    request: {
      params: z.object({ groupId: z.string().uuid() }),
      body: z.object({ groupId: z.string().uuid(), userId: z.string().uuid(), status: z.enum(['active', 'rejected', 'pending']) }),
    },
    metadata: { policy: { action: 'update', subject: 'Group' } },
    responses: { 200: { schema: groupMember, description: 'Updated group member status' } },
  },
  updateGroupPolicy: {
    method: 'patch',
    path: '/community/groups/:groupId/policy',
    request: {
      params: z.object({ groupId: z.string().uuid() }),
      body: z.object({ groupId: z.string().uuid(), joinPolicy: z.string() }),
    },
    metadata: { policy: { action: 'update', subject: 'Group' } },
    responses: { 200: { schema: z.any(), description: 'Updated group policy' } },
  },
  getGroupMembers: {
    method: 'get',
    path: '/community/groups/:groupId/members',
    request: {
      params: z.object({ groupId: z.string().uuid() }),
      query: z.object({ status: z.string().optional() }),
    },
    metadata: { policy: { action: 'read', subject: 'Group' } },
    responses: { 200: { schema: z.array(groupMember), description: 'Group members' } },
  },
  updateMemberRole: {
    method: 'patch',
    path: '/community/groups/:groupId/members/role',
    request: {
      params: z.object({ groupId: z.string().uuid() }),
      body: z.object({ groupId: z.string().uuid(), userId: z.string().uuid(), role: z.string() }),
    },
    metadata: { policy: { action: 'update', subject: 'Group' } },
    responses: { 200: { schema: groupMember, description: 'Updated group member role' } },
  },
  approveAllMembers: {
    method: 'post',
    path: '/community/groups/:groupId/members/approve-all',
    request: {
      params: z.object({ groupId: z.string().uuid() }),
      body: z.object({ groupId: z.string().uuid() }),
    },
    metadata: { policy: { action: 'update', subject: 'Group' } },
    responses: { 200: { schema: success, description: 'Approved pending group members' } },
  },
  getComments: {
    method: 'get',
    path: '/community/posts/:postId/comments',
    request: {
      query: z.object({
        postId: z.string().uuid(),
        limit: z.number().int().positive().max(200).optional(),
      }),
    },
    metadata: communityPolicy('read', 'Post'),
    responses: { 200: { schema: z.array(comment), description: 'Post comments' } },
  },
  createComment: {
    method: 'post',
    path: '/community/posts/:postId/comments',
    request: {
      body: z.object({
        postId: z.string().uuid(),
        content: z.string(),
        isAnonymous: z.boolean().optional(),
      }),
    },
    metadata: communityPolicy('create', 'Post'),
    responses: { 201: { schema: comment, description: 'Created comment' } },
  },
  deleteComment: {
    method: 'delete',
    path: '/community/comments/:commentId',
    request: {
      body: z.object({ commentId: z.string().uuid() }),
    },
    metadata: communityPolicy('delete', 'Post'),
    responses: { 200: { schema: success, description: 'Comment deleted' } },
  },
  toggleCommentUpvote: {
    method: 'post',
    path: '/community/comments/:commentId/upvote',
    request: {
      body: z.object({ commentId: z.string().uuid() }),
    },
    metadata: communityPolicy('create', 'Post'),
    responses: {
      200: { schema: z.object({ active: z.boolean() }), description: 'Comment upvote state' },
    },
  },
  markOfficialAnswer: {
    method: 'post',
    path: '/community/comments/:commentId/official',
    request: {
      body: z.object({ commentId: z.string().uuid(), isOfficial: z.boolean().optional() }),
    },
    metadata: communityPolicy('update', 'Post'),
    responses: { 200: { schema: success, description: 'Official answer state updated' } },
  },
  getPollStatus: {
    method: 'get',
    path: '/community/posts/:postId/poll',
    request: {
      query: z.object({ postId: z.string().uuid() }),
    },
    metadata: communityPolicy('read', 'Post'),
    responses: {
      200: {
        schema: z.object({
          counts: z.record(z.string(), z.number().int().nonnegative()),
          totalVotes: z.number().int().nonnegative(),
          userVotes: z.array(z.string().uuid()),
        }),
        description: 'Poll status',
      },
    },
  },
  voteInPoll: {
    method: 'post',
    path: '/community/posts/:postId/poll/vote',
    request: {
      body: z.object({
        postId: z.string().uuid(),
        optionId: z.string().uuid(),
        allowMultiple: z.boolean().optional(),
      }),
    },
    metadata: communityPolicy('create', 'Post'),
    responses: {
      200: {
        schema: z.object({ selectedOptionIds: z.array(z.string().uuid()) }),
        description: 'Selected poll options',
      },
    },
  },
  updatePost: {
    method: 'patch',
    path: '/community/posts/:postId',
    request: {
      params: z.object({ postId: z.string().uuid() }),
      body: z.object({ postId: z.string().uuid(), content: z.string() }),
    },
    metadata: communityPolicy('update', 'Post'),
    responses: { 200: { schema: z.any(), description: 'Updated community post' } },
  },
  deletePost: {
    method: 'delete',
    path: '/community/posts/:postId',
    request: {
      params: z.object({ postId: z.string().uuid() }),
      body: z.object({ postId: z.string().uuid() }),
    },
    metadata: communityPolicy('delete', 'Post'),
    responses: { 200: { schema: success, description: 'Deleted community post' } },
  },
  reportContent: {
    method: 'post',
    path: '/community/posts/:postId/report',
    request: {
      body: z.object({
        postId: z.string().uuid(),
        groupId: z.string().uuid(),
        targetUserId: z.string().uuid().nullable().optional(),
        reason: z.string(),
        details: z.string().nullable().optional(),
        reportTarget: z.string().optional(),
      }),
    },
    metadata: communityPolicy('create', 'Post'),
    responses: { 200: { schema: success, description: 'Content reported' } },
  },
};
