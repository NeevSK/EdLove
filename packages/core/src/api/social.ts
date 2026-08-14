import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { communityAPI } from '@repo/core/api/community';
import { assertHighway } from '@repo/core/api/highways';
import { APIError } from '@repo/core/types/API';
import type { TemporalScale } from '@repo/core/store/useTemporalStore';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

function assertSocialHighway() {
  assertHighway('social_core', 'direct-api');
}

async function throwApiError(res: Response, operation: string): Promise<never> {
  throw new APIError(operation, res.status.toString());
}

/**
 * Social & Safety API
 *
 * Unified API for community interactions (resonance, notifications)
 * and safety interactions (blocking, reporting).
 */
export const socialAPI = {
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
    const res = await (client.api as any).social.notifications.$get({
      query: { limit, viewDate: options.viewDate ?? undefined },
    });
    if (!res.ok) await throwApiError(res, 'Failed to fetch notifications');
    return ((await res.json()) as any[]).map((notification) => ({
      ...notification,
      body: notification.message,
    }));
  },

  /**
   * @policy read User
   */
  async getUnreadNotificationCount() {
    assertSocialHighway();
    const res = await (client.api as any).social.notifications['unread-count'].$get();
    if (!res.ok) await throwApiError(res, 'Failed to fetch unread notification count');
    return Number(await res.json());
  },

  /**
   * @policy update User
   */
  async markNotificationRead(notificationId: string) {
    assertSocialHighway();
    const res = await (client.api as any).social.notifications.read.$post({
      json: { notificationId },
    });
    if (!res.ok) await throwApiError(res, 'Failed to mark notification read');
  },

  /**
   * @policy update User
   */
  async markAllNotificationsRead() {
    assertSocialHighway();
    const res = await (client.api as any).social.notifications['read-all'].$post();
    if (!res.ok) await throwApiError(res, 'Failed to mark notifications read');
  },

  // --- Safety & Moderation ---

  /**
   * Blocks a user.
   */
  async blockUser(targetUserId: string): Promise<void> {
    assertSocialHighway();
    const res = await (client.api as any).social.block.$post({
      json: { targetUserId },
    });
    if (!res.ok) await throwApiError(res, 'Failed to block user');
  },

  /**
   * Unblocks a user.
   */
  async unblockUser(targetUserId: string): Promise<void> {
    assertSocialHighway();
    const res = await (client.api as any).social.unblock.$post({
      json: { targetUserId },
    });
    if (!res.ok) await throwApiError(res, 'Failed to unblock user');
  },

  /**
   * Checks if a blocking relationship exists between the current user and target user.
   */
  async isBlockingActive(targetUserId: string): Promise<boolean> {
    assertSocialHighway();
    const res = await (client.api as any).social.block.active.$get({
      query: { targetUserId },
    });
    if (!res.ok) await throwApiError(res, 'Failed to check block status');
    return Boolean(await res.json());
  },

  /**
   * Fetches the list of users blocked by the current user.
   */
  async getMutedUsers() {
    assertSocialHighway();
    const res = await (client.api as any).social.block.list.$get();
    if (!res.ok) await throwApiError(res, 'Failed to fetch blocked users');
    return await res.json();
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
