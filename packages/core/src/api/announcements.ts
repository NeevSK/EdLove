/**
 * School announcements API adapter.
 *
 * The server derives the author from the authenticated principal. The legacy
 * `authorId` argument remains accepted for source compatibility but is
 * deliberately ignored so callers cannot impersonate another author.
 */

import { orpcClient } from '@repo/core/api/orpcClient';

export const announcementAPI = {
  async getAnnouncements(schoolId: string) {
    return orpcClient.announcements.getAnnouncements({ query: { schoolId } });
  },

  async createAnnouncement(schoolId: string, _authorId: string, content: string, isPinned = false) {
    return orpcClient.announcements.createAnnouncement({
      body: {
        schoolId,
        title: '',
        content,
        isPinned,
      },
    });
  },
};
