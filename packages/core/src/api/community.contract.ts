import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  CommunityGroupSchema,
  CommunityPostSchema,
  GroupMemberSchema,
  GroupMessageSchema,
} from '../logic/schemas/community.schema';
import { POAMetadataSchema } from './contract';

const c = initContract();

const authority = (
  action: 'create' | 'read' | 'update' | 'delete',
  subject: 'Group' | 'Post' | 'User',
) => POAMetadataSchema.parse({ authority: { action, subject } });

export const communityContract = c.router({
  getAnnouncements: {
    method: 'GET',
    path: '/community/announcements',
    query: z.object({ school_id: z.string() }),
    responses: { 200: z.array(z.any()) },
    metadata: authority('read', 'Group'),
  },
  createAnnouncement: {
    method: 'POST',
    path: '/community/announcements',
    body: z.object({
      school_id: z.string(),
      author_id: z.string(),
      content: z.string(),
      is_pinned: z.boolean().optional(),
    }),
    responses: { 201: z.any() },
    metadata: authority('create', 'Group'),
  },

  getGroups: {
    method: 'GET',
    path: '/community/groups',
    query: z.object({
      limit: z.coerce.number().default(20),
      offset: z.coerce.number().default(0),
      school_id: z.string().optional(),
      search: z.string().optional(),
      is_public: z.boolean().optional(),
      type: z.string().optional(),
    }),
    responses: { 200: z.array(CommunityGroupSchema) },
    metadata: authority('read', 'Group'),
  },
  createGroup: {
    method: 'POST',
    path: '/community/groups',
    body: z.object({
      name: z.string(),
      description: z.string().optional(),
      school_id: z.string().optional(),
      creator_id: z.string().optional(),
      type: z.string().optional(),
      visibility: z.string().optional(),
      join_policy: z.string().optional(),
      is_public: z.boolean().optional(),
    }),
    responses: { 201: CommunityGroupSchema },
    metadata: authority('create', 'Group'),
  },
  joinGroup: {
    method: 'POST',
    path: '/community/groups/:groupId/join',
    body: z.object({
      user_id: z.string(),
      authority_tier: z.string(),
    }),
    responses: { 201: GroupMemberSchema },
    metadata: authority('create', 'Group'),
  },
  getGroup: {
    method: 'GET',
    path: '/community/groups/:groupId',
    responses: { 200: CommunityGroupSchema },
    metadata: authority('read', 'Group'),
  },
  handleMemberRequest: {
    method: 'POST',
    path: '/community/groups/:groupId/members/:userId/status',
    body: z.object({ status: z.enum(['active', 'rejected']) }),
    responses: { 200: GroupMemberSchema },
    metadata: authority('update', 'Group'),
  },
  updateJoiningPolicy: {
    method: 'PATCH',
    path: '/community/groups/:groupId/policy',
    body: z.object({ policy: z.string() }),
    responses: { 200: CommunityGroupSchema },
    metadata: authority('update', 'Group'),
  },

  getPosts: {
    method: 'GET',
    path: '/community/posts',
    query: z.object({
      groupId: z.string().optional(),
      viewDate: z.string().optional(),
      viewScale: z.enum(['day', 'week', 'month', 'year', 'custom']).optional(),
      limit: z.coerce.number().default(20),
      offset: z.coerce.number().default(0),
    }),
    responses: { 200: z.array(CommunityPostSchema) },
    metadata: authority('read', 'Post'),
  },
  createPost: {
    method: 'POST',
    path: '/community/posts',
    body: z.object({
      post: z.record(z.string(), z.any()),
      user_id: z.string(),
      authority_tier: z.string(),
      school_id: z.string(),
    }),
    responses: { 201: CommunityPostSchema },
    metadata: authority('create', 'Post'),
  },
  toggleReaction: {
    method: 'POST',
    path: '/community/posts/:postId/reactions',
    body: z.object({ user_id: z.string(), emoji: z.string().optional() }),
    responses: { 200: z.object({ active: z.boolean() }) },
    metadata: authority('create', 'Post'),
  },
  voteInPoll: {
    method: 'POST',
    path: '/community/posts/:postId/poll/vote',
    body: z.object({
      optionId: z.string(),
      allowMultiple: z.boolean().optional(),
    }),
    responses: { 200: z.array(z.string()) },
    metadata: authority('create', 'Post'),
  },

  getMessages: {
    method: 'GET',
    path: '/community/groups/:groupId/messages',
    query: z.object({
      limit: z.coerce.number().optional(),
      viewDate: z.string().optional(),
      viewScale: z.enum(['day', 'week', 'month', 'year', 'custom']).optional(),
    }),
    responses: { 200: z.array(GroupMessageSchema) },
    metadata: authority('read', 'Group'),
  },
  sendMessage: {
    method: 'POST',
    path: '/community/groups/:groupId/messages',
    body: z.object({ content: z.string() }),
    responses: { 201: GroupMessageSchema },
    metadata: authority('create', 'Group'),
  },

  getDirectConversations: {
    method: 'GET',
    path: '/community/direct/conversations',
    responses: { 200: z.array(z.any()) },
    metadata: authority('read', 'User'),
  },
  getOrCreateDirectConversation: {
    method: 'POST',
    path: '/community/direct/conversations',
    body: z.object({ target_user_id: z.string() }),
    responses: { 201: z.object({ id: z.string() }) },
    metadata: authority('create', 'User'),
  },
  getDirectMessages: {
    method: 'GET',
    path: '/community/direct/conversations/:conversationId/messages',
    query: z.object({
      limit: z.coerce.number().optional(),
      viewDate: z.string().optional(),
      viewScale: z.enum(['day', 'week', 'month', 'year', 'custom']).optional(),
    }),
    responses: { 200: z.array(z.any()) },
    metadata: authority('read', 'User'),
  },
  sendDirectMessage: {
    method: 'POST',
    path: '/community/direct/conversations/:conversationId/messages',
    body: z.object({ content: z.string() }),
    responses: { 201: z.any() },
    metadata: authority('create', 'User'),
  },
  getCommunityResonance: {
    method: 'GET',
    path: '/community/resonance/:userId',
    query: z.object({
      viewDate: z.string().optional(),
      viewScale: z.enum(['day', 'week', 'month', 'year', 'custom']).optional(),
    }),
    responses: {
      200: z.object({
        likes: z.number(),
        comments: z.number(),
        shares: z.number(),
      }),
    },
    metadata: authority('read', 'Post'),
  },
  getComments: {
    method: 'GET',
    path: '/community/posts/:postId/comments',
    query: z.object({
      limit: z.coerce.number().optional(),
      viewDate: z.string().optional(),
      viewScale: z.enum(['day', 'week', 'month', 'year', 'custom']).optional(),
    }),
    responses: { 200: z.array(z.any()) },
    metadata: authority('read', 'Post'),
  },
  createComment: {
    method: 'POST',
    path: '/community/posts/:postId/comments',
    body: z.object({
      content: z.string(),
      isAnonymous: z.boolean().optional(),
    }),
    responses: { 201: z.any() },
    metadata: authority('create', 'Post'),
  },
  deleteComment: {
    method: 'DELETE',
    path: '/community/comments/:commentId',
    responses: { 204: z.undefined() },
    metadata: authority('delete', 'Post'),
  },
  toggleCommentUpvote: {
    method: 'POST',
    path: '/community/comments/:commentId/upvote',
    body: z.any().optional(),
    responses: { 200: z.object({ active: z.boolean() }) },
    metadata: authority('update', 'Post'),
  },
  markOfficialAnswer: {
    method: 'PATCH',
    path: '/community/comments/:commentId/official',
    body: z.object({ isOfficial: z.boolean() }),
    responses: { 204: z.undefined() },
    metadata: authority('update', 'Post'),
  },
  reportContent: {
    method: 'POST',
    path: '/community/report',
    body: z.object({
      postId: z.string().optional(),
      groupId: z.string().optional(),
      targetUserId: z.string().optional(),
      reason: z.string(),
      report_target: z.enum(['teacher', 'principal', 'platform']),
    }),
    responses: { 201: z.any() },
    metadata: authority('create', 'User'),
  },
  getNotifications: {
    method: 'GET',
    path: '/community/notifications',
    query: z.object({
      limit: z.coerce.number().optional(),
      viewDate: z.string().optional(),
      viewScale: z.enum(['day', 'week', 'month', 'year', 'custom']).optional(),
    }),
    responses: { 200: z.array(z.any()) },
    metadata: authority('read', 'User'),
  },
  getUnreadNotificationCount: {
    method: 'GET',
    path: '/community/notifications/unread/count',
    responses: { 200: z.object({ count: z.number() }) },
    metadata: authority('read', 'User'),
  },
  markNotificationRead: {
    method: 'PATCH',
    path: '/community/notifications/:notificationId/read',
    body: z.any().optional(),
    responses: { 204: z.undefined() },
    metadata: authority('update', 'User'),
  },
  markAllNotificationsRead: {
    method: 'PATCH',
    path: '/community/notifications/read-all',
    body: z.any().optional(),
    responses: { 204: z.undefined() },
    metadata: authority('update', 'User'),
  },
  blockUser: {
    method: 'POST',
    path: '/community/users/block',
    body: z.object({ target_user_id: z.string() }),
    responses: { 201: z.any() },
    metadata: authority('create', 'User'),
  },
  unblockUser: {
    method: 'POST',
    path: '/community/users/unblock',
    body: z.object({ target_user_id: z.string() }),
    responses: { 204: z.undefined() },
    metadata: authority('delete', 'User'),
  },
  isBlockingActive: {
    method: 'GET',
    path: '/community/users/:targetUserId/blocking-status',
    responses: { 200: z.object({ active: z.boolean() }) },
    metadata: authority('read', 'User'),
  },
  getMutedUsers: {
    method: 'GET',
    path: '/community/users/muted',
    responses: { 200: z.array(z.any()) },
    metadata: authority('read', 'User'),
  },
});
