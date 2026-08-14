import { z } from 'zod';

const notification = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.string(),
  title: z.string(),
  message: z.string().nullable(),
  reference_id: z.string().nullable(),
  reference_type: z.string().nullable(),
  is_read: z.boolean(),
  read_at: z.string().nullable(),
  created_at: z.string(),
});

const success = z.object({ success: z.literal(true) });

export const socialORPCContract = {
  getNotifications: {
    method: 'get',
    path: '/social/notifications',
    metadata: { policy: { action: 'read', subject: 'Notification' } },
    request: {
      query: z.object({
        viewDate: z.string().datetime().optional(),
        limit: z.number().int().positive().max(200).optional(),
      }),
    },
    responses: { 200: { schema: z.array(notification), description: 'User notifications' } },
  },
  getUnreadNotificationCount: {
    method: 'get',
    path: '/social/notifications/unread-count',
    metadata: { policy: { action: 'read', subject: 'Notification' } },
    responses: {
      200: { schema: z.number().int().nonnegative(), description: 'Unread notification count' },
    },
  },
  markNotificationRead: {
    method: 'post',
    path: '/social/notifications/read',
    metadata: { policy: { action: 'update', subject: 'Notification' } },
    request: {
      body: z.object({
        notificationId: z.string().uuid(),
      }),
    },
    responses: { 200: { schema: success, description: 'Notification marked read' } },
  },
  markAllNotificationsRead: {
    method: 'post',
    path: '/social/notifications/read-all',
    metadata: { policy: { action: 'update', subject: 'Notification' } },
    responses: { 200: { schema: success, description: 'Notifications marked read' } },
  },
  blockUser: {
    method: 'post',
    path: '/social/block',
    metadata: { policy: { action: 'create', subject: 'UserBlock' } },
    request: {
      body: z.object({
        targetUserId: z.string().uuid(),
      }),
    },
    responses: { 200: { schema: success, description: 'User blocked' } },
  },
  unblockUser: {
    method: 'post',
    path: '/social/unblock',
    metadata: { policy: { action: 'delete', subject: 'UserBlock' } },
    request: {
      body: z.object({
        targetUserId: z.string().uuid(),
      }),
    },
    responses: { 200: { schema: success, description: 'User unblocked' } },
  },
  isBlockingActive: {
    method: 'get',
    path: '/social/block/active',
    metadata: { policy: { action: 'read', subject: 'UserBlock' } },
    request: {
      query: z.object({
        targetUserId: z.string().uuid(),
      }),
    },
    responses: { 200: { schema: z.boolean(), description: 'Whether a block is active' } },
  },
  getBlockedUsers: {
    method: 'get',
    path: '/social/block/list',
    metadata: { policy: { action: 'read', subject: 'UserBlock' } },
    responses: {
      200: {
        schema: z.array(
          z.object({
            id: z.string().uuid(),
            full_name: z.string(),
            avatar_url: z.string().nullable(),
            capacity: z.string().nullable(),
          }),
        ),
        description: 'Blocked users',
      },
    },
  },
};
