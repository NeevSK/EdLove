import type { SovereignContract } from '@repo/core/api/contracts';
import {
  CommunityGroupSchema,
  CommunityPostSchema,
  GroupMemberSchema,
} from '@repo/core/logic/schemas/community.schema';
import { z } from 'zod';

const communityAuthority = (
  action: 'create' | 'read' | 'update' | 'delete',
  subject: 'Group' | 'Post' | 'User' | 'Comment' | 'Poll',
) =>
  ({
    policy: { action, subject },
  }) as const;

/**
 * Community Domain Port
 * Framework-agnostic definition of the Community API.
 * [LOUD-FAILURE] Renamed and expanded for ReBAC compliance.
 */
export const communityContract = {
  getGroups: {
    method: 'get',
    path: '/community/groups',
    request: {
      query: z.strictObject({
        limit: z.coerce.number().default(20),
        offset: z.coerce.number().default(0),
        school_id: z.uuid().optional(),
        search: z.string().optional(),
        is_public: z.boolean().optional(),
        type: z.string().optional(),
      }),
    },
    responses: {
      200: { schema: z.array(CommunityGroupSchema), description: 'Retrieve groups' },
    },
    metadata: communityAuthority('read', 'Group'),
  },

  getGroup: {
    method: 'get',
    path: '/community/groups/:groupId',
    request: {
      params: z.strictObject({ groupId: z.uuid() }),
    },
    responses: {
      200: { schema: CommunityGroupSchema, description: 'Retrieve group details' },
    },
    metadata: communityAuthority('read', 'Group'),
  },

  createGroup: {
    method: 'post',
    path: '/community/groups',
    request: {
      body: z.strictObject({
        name: z.string(),
        description: z.string().optional(),
        school_id: z.uuid().optional(),
        type: z.string().optional(),
        visibility: z.string().optional(),
        is_public: z.boolean().optional(),
      }),
    },
    responses: {
      201: { schema: CommunityGroupSchema, description: 'Group created' },
    },
    metadata: communityAuthority('create', 'Group'),
  },

  joinGroup: {
    method: 'post',
    path: '/community/groups/:groupId/join',
    request: {
      params: z.strictObject({ groupId: z.uuid() }),
      body: z.strictObject({
        // Membership ownership is derived from the authenticated context.
        user_id: z.uuid().optional(),
        capacity: z.string(),
      }),
    },
    responses: {
      201: { schema: GroupMemberSchema, description: 'Joined group' },
    },
    metadata: communityAuthority('create', 'Group'),
  },

  getPosts: {
    method: 'get',
    path: '/community/posts',
    request: {
      query: z.strictObject({
        groupId: z.uuid().optional(),
        limit: z.coerce.number().default(20),
        offset: z.coerce.number().default(0),
        viewDate: z.string().datetime().optional(),
      }),
    },
    responses: {
      200: { schema: z.array(CommunityPostSchema), description: 'Retrieve posts' },
    },
    metadata: communityAuthority('read', 'Post'),
  },

  getCommunityResonance: {
    method: 'get',
    path: '/community/resonance/:userId',
    request: {
      params: z.strictObject({ userId: z.uuid() }),
      query: z.strictObject({ viewDate: z.string().datetime().optional() }),
    },
    responses: {
      200: {
        schema: z.strictObject({ likes: z.number(), comments: z.number(), shares: z.number() }),
        description: 'Aggregated community resonance for a user',
      },
    },
    metadata: communityAuthority('read', 'Post'),
  },

  getGroupMessages: {
    method: 'get',
    path: '/community/groups/:groupId/messages',
    request: {
      params: z.strictObject({ groupId: z.uuid() }),
      query: z.strictObject({
        limit: z.coerce.number().int().positive().max(200).optional(),
        viewDate: z.string().datetime().optional(),
      }),
    },
    responses: { 200: { schema: z.array(z.any()), description: 'Group messages' } },
    metadata: communityAuthority('read', 'Group'),
  },

  sendGroupMessage: {
    method: 'post',
    path: '/community/groups/:groupId/messages',
    request: {
      params: z.strictObject({ groupId: z.uuid() }),
      body: z.strictObject({ content: z.string() }),
    },
    responses: { 201: { schema: z.any(), description: 'Sent group message' } },
    metadata: communityAuthority('create', 'Group'),
  },

  createPost: {
    method: 'post',
    path: '/community/posts',
    request: {
      body: z.strictObject({
        group_id: z.uuid(),
        content: z.string(),
        post_type: z.string().default('discussion'),
        visibility: z.string().default('school'),
        author_tier: z.string(),
      }),
    },
    responses: {
      201: { schema: CommunityPostSchema, description: 'Post created' },
    },
    metadata: communityAuthority('create', 'Post'),
  },

  toggleReaction: {
    method: 'post',
    path: '/community/posts/:postId/reactions',
    request: {
      params: z.strictObject({ postId: z.uuid() }),
      body: z.strictObject({
        user_id: z.uuid(),
        emoji: z.string().optional(),
      }),
    },
    responses: {
      200: { schema: z.strictObject({ active: z.boolean() }), description: 'Reaction toggled' },
    },
    metadata: communityAuthority('create', 'Post'),
  },

  getComments: {
    method: 'get',
    path: '/community/posts/:postId/comments',
    request: {
      params: z.strictObject({ postId: z.uuid() }),
      query: z.strictObject({ limit: z.coerce.number().optional() }),
    },
    responses: {
      200: { schema: z.array(z.any()), description: 'Retrieve comments' },
    },
    metadata: communityAuthority('read', 'Comment'),
  },

  createComment: {
    method: 'post',
    path: '/community/posts/:postId/comments',
    request: {
      params: z.strictObject({ postId: z.uuid() }),
      body: z.strictObject({ content: z.string(), author_tier: z.string() }),
    },
    responses: {
      201: { schema: z.any(), description: 'Comment created' },
    },
    metadata: communityAuthority('create', 'Comment'),
  },

  deleteComment: {
    method: 'delete',
    path: '/community/comments/:commentId',
    request: {
      params: z.strictObject({ commentId: z.uuid() }),
    },
    responses: {
      200: { schema: z.strictObject({ success: z.boolean() }), description: 'Comment deleted' },
    },
    metadata: communityAuthority('delete', 'Comment'),
  },

  toggleCommentUpvote: {
    method: 'post',
    path: '/community/comments/:commentId/upvote',
    request: {
      params: z.strictObject({ commentId: z.uuid() }),
    },
    responses: {
      200: { schema: z.strictObject({ active: z.boolean() }), description: 'Upvote toggled' },
    },
    metadata: communityAuthority('create', 'Comment'),
  },

  markOfficialAnswer: {
    method: 'post',
    path: '/community/comments/:commentId/official',
    request: {
      params: z.strictObject({ commentId: z.uuid() }),
    },
    responses: {
      200: { schema: z.strictObject({ success: z.boolean() }), description: 'Marked official' },
    },
    metadata: communityAuthority('update', 'Comment'),
  },

  getPollStatus: {
    method: 'get',
    path: '/community/polls/:postId',
    request: {
      params: z.strictObject({ postId: z.uuid() }),
    },
    responses: {
      200: { schema: z.any(), description: 'Retrieve poll status' },
    },
    metadata: communityAuthority('read', 'Poll'),
  },

  voteInPoll: {
    method: 'post',
    path: '/community/polls/:postId/vote',
    request: {
      params: z.strictObject({ postId: z.uuid() }),
      body: z.strictObject({ option_id: z.uuid() }),
    },
    responses: {
      200: { schema: z.any(), description: 'Vote recorded' },
    },
    metadata: communityAuthority('create', 'Poll'),
  },

  updateMemberStatus: {
    method: 'patch',
    path: '/community/groups/:groupId/members/status',
    request: {
      params: z.strictObject({ groupId: z.uuid() }),
      body: z.strictObject({ groupId: z.uuid(), userId: z.uuid(), status: z.string() }),
    },
    responses: { 200: { schema: GroupMemberSchema, description: 'Member status updated' } },
    metadata: communityAuthority('update', 'Group'),
  },

  updateGroupPolicy: {
    method: 'patch',
    path: '/community/groups/:groupId/policy',
    request: {
      params: z.strictObject({ groupId: z.uuid() }),
      body: z.strictObject({ groupId: z.uuid(), joinPolicy: z.string() }),
    },
    responses: { 200: { schema: z.any(), description: 'Group policy updated' } },
    metadata: communityAuthority('update', 'Group'),
  },

  getGroupMembers: {
    method: 'get',
    path: '/community/groups/:groupId/members',
    request: {
      params: z.strictObject({ groupId: z.uuid() }),
      query: z.strictObject({ status: z.string().optional() }),
    },
    responses: { 200: { schema: z.array(GroupMemberSchema), description: 'Group members' } },
    metadata: communityAuthority('read', 'Group'),
  },

  updateMemberRole: {
    method: 'patch',
    path: '/community/groups/:groupId/members/role',
    request: {
      params: z.strictObject({ groupId: z.uuid() }),
      body: z.strictObject({ groupId: z.uuid(), userId: z.uuid(), role: z.string() }),
    },
    responses: { 200: { schema: GroupMemberSchema, description: 'Member role updated' } },
    metadata: communityAuthority('update', 'Group'),
  },

  approveAllMembers: {
    method: 'post',
    path: '/community/groups/:groupId/members/approve-all',
    request: {
      params: z.strictObject({ groupId: z.uuid() }),
      body: z.strictObject({ groupId: z.uuid() }),
    },
    responses: { 200: { schema: z.any(), description: 'Pending members approved' } },
    metadata: communityAuthority('update', 'Group'),
  },

  updatePost: {
    method: 'patch',
    path: '/community/posts/:postId',
    request: {
      params: z.strictObject({ postId: z.uuid() }),
      body: z.strictObject({ postId: z.uuid(), content: z.string() }),
    },
    responses: { 200: { schema: CommunityPostSchema, description: 'Post updated' } },
    metadata: communityAuthority('update', 'Post'),
  },

  deletePost: {
    method: 'delete',
    path: '/community/posts/:postId',
    request: {
      params: z.strictObject({ postId: z.uuid() }),
      body: z.strictObject({ postId: z.uuid() }),
    },
    responses: { 200: { schema: z.any(), description: 'Post deleted' } },
    metadata: communityAuthority('delete', 'Post'),
  },

  reportContent: {
    method: 'post',
    path: '/community/report',
    request: {
      body: z.strictObject({
        postId: z.uuid().optional(),
        groupId: z.uuid().optional(),
        targetUserId: z.uuid().optional(),
        reason: z.string(),
        report_target: z.enum(['teacher', 'principal', 'platform']),
        reporter_id: z.uuid().optional(),
        details: z.string().optional(),
      }),
    },
    responses: {
      200: { schema: z.strictObject({ success: z.boolean() }), description: 'Content reported' },
    },
    metadata: communityAuthority('create', 'Post'),
  },
} as const satisfies SovereignContract;
