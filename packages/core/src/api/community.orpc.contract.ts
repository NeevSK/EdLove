import { z } from 'zod';

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
  getGroups: {
    method: 'get',
    path: '/community/groups',
    request: {
      query: z.object({
        limit: z.coerce.number().int().positive().max(200).optional(),
        offset: z.coerce.number().int().nonnegative().optional(),
        schoolId: z.string().uuid().optional(),
        search: z.string().trim().min(1).max(120).optional(),
        isPublic: z.boolean().optional(),
        type: z.string().trim().min(1).max(64).optional(),
      }),
    },
    metadata: { policy: { action: 'read', subject: 'Group' } },
    responses: { 200: { schema: z.array(z.any()), description: 'Community groups' } },
  },
  getGroup: {
    method: 'get',
    path: '/community/groups/:groupId',
    request: { params: z.object({ groupId: z.string().uuid() }) },
    metadata: { policy: { action: 'read', subject: 'Group' } },
    responses: { 200: { schema: z.any(), description: 'Community group' } },
  },
  createGroup: {
    method: 'post',
    path: '/community/groups',
    request: {
      body: z.object({
        name: z.string().trim().min(1).max(120),
        description: z.string().trim().max(4000).optional(),
        schoolId: z.string().uuid().optional(),
        type: z.string().trim().min(1).max(64).optional(),
        visibility: z.string().trim().min(1).max(64).optional(),
      }),
    },
    metadata: { policy: { action: 'create', subject: 'Group' } },
    responses: { 201: { schema: z.any(), description: 'Created group' } },
  },
  joinGroup: {
    method: 'post',
    path: '/community/groups/:groupId/join',
    request: { params: z.object({ groupId: z.string().uuid() }) },
    metadata: { policy: { action: 'create', subject: 'Group' } },
    responses: { 201: { schema: groupMember, description: 'Joined group' } },
  },
  getPosts: {
    method: 'get',
    path: '/community/posts',
    request: {
      query: z.object({
        groupId: z.string().uuid().optional(),
        limit: z.coerce.number().int().positive().max(200).optional(),
        offset: z.coerce.number().int().nonnegative().optional(),
        viewDate: z.string().datetime().optional(),
      }),
    },
    metadata: communityPolicy('read', 'Post'),
    responses: { 200: { schema: z.array(z.any()), description: 'Community posts' } },
  },
  getCommunityResonance: {
    method: 'get',
    path: '/community/resonance/:userId',
    request: {
      params: z.object({ userId: z.string().uuid() }),
      query: z.object({ viewDate: z.string().datetime().optional() }),
    },
    metadata: communityPolicy('read', 'Post'),
    responses: {
      200: {
        schema: z.object({ likes: z.number(), comments: z.number(), shares: z.number() }),
        description: 'Community resonance',
      },
    },
  },
  getGroupMessages: {
    method: 'get',
    path: '/community/groups/:groupId/messages',
    request: {
      params: z.object({ groupId: z.string().uuid() }),
      query: z.object({
        limit: z.coerce.number().int().positive().max(200).optional(),
        viewDate: z.string().datetime().optional(),
      }),
    },
    metadata: { policy: { action: 'read', subject: 'Group' } },
    responses: { 200: { schema: z.array(z.any()), description: 'Group messages' } },
  },
  sendGroupMessage: {
    method: 'post',
    path: '/community/groups/:groupId/messages',
    request: {
      params: z.object({ groupId: z.string().uuid() }),
      body: z.object({ content: z.string().trim().min(1).max(4000) }),
    },
    metadata: { policy: { action: 'create', subject: 'Group' } },
    responses: { 201: { schema: z.any(), description: 'Sent group message' } },
  },
  createPost: {
    method: 'post',
    path: '/community/posts',
    request: {
      body: z.object({
        groupId: z.string().uuid(),
        content: z.string().trim().min(1).max(4000),
        postType: z.string().trim().min(1).max(64).default('discussion'),
        authorTier: z.string().trim().min(1).max(64),
      }),
    },
    metadata: communityPolicy('create', 'Post'),
    responses: { 201: { schema: z.any(), description: 'Created community post' } },
  },
  toggleReaction: {
    method: 'post',
    path: '/community/posts/:postId/reactions',
    request: {
      params: z.object({ postId: z.string().uuid() }),
      body: z.object({ emoji: z.string().trim().min(1).max(32).optional() }),
    },
    metadata: communityPolicy('create', 'Post'),
    responses: {
      200: { schema: z.object({ active: z.boolean() }), description: 'Reaction state' },
    },
  },
  updateMemberStatus: {
    method: 'patch',
    path: '/community/groups/:groupId/members/status',
    request: {
      params: z.object({ groupId: z.string().uuid() }),
      body: z.object({
        userId: z.string().uuid(),
        status: z.enum(['active', 'rejected', 'pending']),
      }),
    },
    metadata: { policy: { action: 'update', subject: 'Group' } },
    responses: { 200: { schema: groupMember, description: 'Updated group member status' } },
  },
  updateGroupPolicy: {
    method: 'patch',
    path: '/community/groups/:groupId/policy',
    request: {
      params: z.object({ groupId: z.string().uuid() }),
      body: z.object({ joinPolicy: z.string().trim().min(1).max(64) }),
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
      body: z.object({ userId: z.string().uuid(), role: z.string().trim().min(1).max(64) }),
    },
    metadata: { policy: { action: 'update', subject: 'Group' } },
    responses: { 200: { schema: groupMember, description: 'Updated group member role' } },
  },
  approveAllMembers: {
    method: 'post',
    path: '/community/groups/:groupId/members/approve-all',
    request: {
      params: z.object({ groupId: z.string().uuid() }),
    },
    metadata: { policy: { action: 'update', subject: 'Group' } },
    responses: { 200: { schema: success, description: 'Approved pending group members' } },
  },
  getComments: {
    method: 'get',
    path: '/community/posts/:postId/comments',
    request: {
      params: z.object({ postId: z.string().uuid() }),
      query: z.object({
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
      params: z.object({ postId: z.string().uuid() }),
      body: z.object({
        content: z.string().trim().min(1).max(4000),
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
      params: z.object({ commentId: z.string().uuid() }),
    },
    metadata: communityPolicy('delete', 'Post'),
    responses: { 200: { schema: success, description: 'Comment deleted' } },
  },
  toggleCommentUpvote: {
    method: 'post',
    path: '/community/comments/:commentId/upvote',
    request: {
      params: z.object({ commentId: z.string().uuid() }),
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
      params: z.object({ commentId: z.string().uuid() }),
    },
    metadata: communityPolicy('update', 'Post'),
    responses: { 200: { schema: success, description: 'Official answer state updated' } },
  },
  getPollStatus: {
    method: 'get',
    path: '/community/polls/:postId',
    request: {
      params: z.object({ postId: z.string().uuid() }),
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
    path: '/community/polls/:postId/vote',
    request: {
      params: z.object({ postId: z.string().uuid() }),
      body: z.object({
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
      body: z.object({ content: z.string().trim().min(1).max(4000) }),
    },
    metadata: communityPolicy('update', 'Post'),
    responses: { 200: { schema: z.any(), description: 'Updated community post' } },
  },
  deletePost: {
    method: 'delete',
    path: '/community/posts/:postId',
    request: {
      params: z.object({ postId: z.string().uuid() }),
    },
    metadata: communityPolicy('delete', 'Post'),
    responses: { 200: { schema: success, description: 'Deleted community post' } },
  },
  getReactionStatus: {
    method: 'get',
    path: '/community/posts/:postId/reaction',
    request: { params: z.object({ postId: z.string().uuid() }) },
    metadata: communityPolicy('read', 'Post'),
    responses: {
      200: { schema: z.object({ active: z.boolean() }), description: 'Current reaction state' },
    },
  },
  reportContent: {
    method: 'post',
    path: '/community/report',
    request: {
      body: z.object({
        postId: z.string().uuid().optional(),
        groupId: z.string().uuid().optional(),
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
