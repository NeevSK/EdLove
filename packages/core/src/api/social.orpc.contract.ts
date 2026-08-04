import { z } from 'zod';

export const socialORPCContract = {
  getNotifications: {
    method: 'get',
    path: '/social/notifications',
  },
  getUnreadNotificationCount: {
    method: 'get',
    path: '/social/notifications/unread-count',
  },
  markNotificationRead: {
    method: 'post',
    path: '/social/notifications/read',
    request: {
      body: z.object({
        notificationId: z.string().uuid(),
      }),
    },
  },
  markAllNotificationsRead: {
    method: 'post',
    path: '/social/notifications/read-all',
  },
  blockUser: {
    method: 'post',
    path: '/social/block',
    request: {
      body: z.object({
        targetUserId: z.string().uuid(),
      }),
    },
  },
  unblockUser: {
    method: 'post',
    path: '/social/unblock',
    request: {
      body: z.object({
        targetUserId: z.string().uuid(),
      }),
    },
  },
  isBlockingActive: {
    method: 'get',
    path: '/social/block/active',
    request: {
      query: z.object({
        targetUserId: z.string().uuid(),
      }),
    },
  },
  getBlockedUsers: {
    method: 'get',
    path: '/social/block/list',
  },
};
