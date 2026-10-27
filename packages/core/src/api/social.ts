import { communityAPI } from '@repo/core/api/community';
import { assertHighway } from '@repo/core/api/highways';
import { orpcClient } from '@repo/core/api/orpcClient';
import { createResonantProxy } from '@repo/core/api/resonantProxy';
import { isEmptyOrNull, registerSandboxDomain } from '@repo/core/api/sandboxDataset';
import { MOCK_NOTIFICATIONS } from '@repo/core/api/mockData';
import type { TemporalScale } from '@repo/core/store/useTemporalStore';

function assertSocialHighway() {
  assertHighway('social_core', 'direct-api');
}

/**
 * Social & Safety API
 *
 * Unified API for community interactions (resonance, notifications)
 * and safety interactions (blocking, reporting).
 */
const rawSocialAPI = {
  // --- Community Resonance & Notifications ---

  /**
   * @policy read Post
   */
  async getCommunityResonance(
    userId: string,
    options: { viewDate?: string; viewScale?: TemporalScale } = {},
  ) {
    return communityAPI.getCommunityResonance(userId, { viewDate: options.viewDate });
  },

  /**
   * @policy read User
   */
  async getNotifications(
    limit = 30,
    options: { viewDate?: string; viewScale?: TemporalScale } = {},
  ) {
    assertSocialHighway();
    const notifications = await orpcClient.social.getNotifications({
      query: { limit, viewDate: options.viewDate ?? undefined },
    });
    return (notifications as any[]).map((notification: any) => ({
      ...notification,
      body: notification.message,
    }));
  },

  /**
   * @policy read User
   */
  async getUnreadNotificationCount() {
    assertSocialHighway();
    return orpcClient.social.getUnreadNotificationCount();
  },

  /**
   * @policy update User
   */
  async markNotificationRead(notificationId: string) {
    assertSocialHighway();
    await orpcClient.social.markNotificationRead({ body: { notificationId } });
  },

  /**
   * @policy update User
   */
  async markAllNotificationsRead() {
    assertSocialHighway();
    await orpcClient.social.markAllNotificationsRead();
  },

  // --- Safety & Moderation ---

  /**
   * Blocks a user.
   */
  async blockUser(targetUserId: string): Promise<void> {
    assertSocialHighway();
    await orpcClient.social.blockUser({ body: { targetUserId } });
  },

  /**
   * Unblocks a user.
   */
  async unblockUser(targetUserId: string): Promise<void> {
    assertSocialHighway();
    await orpcClient.social.unblockUser({ body: { targetUserId } });
  },

  /**
   * Checks if a blocking relationship exists between the current user and target user.
   */
  async isBlockingActive(targetUserId: string): Promise<boolean> {
    assertSocialHighway();
    return orpcClient.social.isBlockingActive({ query: { targetUserId } });
  },

  /**
   * Fetches the list of users blocked by the current user.
   */
  async getMutedUsers() {
    assertSocialHighway();
    return orpcClient.social.getBlockedUsers();
  },

  /**
   * @policy create User
   */
  async reportContent(
    params: {
      postId?: string;
      groupId?: string;
      targetUserId?: string;
      reason: string;
      report_target: 'teacher' | 'principal' | 'platform';
    },
    reporterId: string,
  ) {
    return communityAPI.reportContent({ ...params, reporter_id: reporterId });
  },
};

export const socialAPI = createResonantProxy('social', rawSocialAPI);

registerSandboxDomain({
  domain: 'social',
  ghostMethods: ['getNotifications', 'getUnreadNotificationCount'],
  isEmpty: (method, result) => {
    if (method === 'getNotifications') return isEmptyOrNull(result);
    if (method === 'getUnreadNotificationCount') return result === 0 || result == null;
    return false;
  },
  getSamples: (method) => {
    if (method === 'getNotifications') return MOCK_NOTIFICATIONS;
    if (method === 'getUnreadNotificationCount') {
      return MOCK_NOTIFICATIONS.filter((n: any) => !n.read && !n.is_read).length;
    }
    return undefined;
  },
});

