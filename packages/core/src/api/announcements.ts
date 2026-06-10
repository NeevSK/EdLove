import { community } from '../logic/managers/factory';

/**
 * Announcements API
 *
 * Dedicated domain for school-wide and system announcements.
 */
export const announcementAPI = {
  /**
   * @policy read Group
   */
  async getAnnouncements(schoolId: string) {
    return community.getAnnouncements(schoolId);
  },

  /**
   * @policy create Group
   */
  async createAnnouncement(
    schoolId: string,
    authorId: string,
    content: string,
    isPinned: boolean = false,
  ) {
    return community.createAnnouncement({
      schoolId,
      authorId,
      content,
      isPinned,
    });
  },
};
