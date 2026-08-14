/**
 * School announcements API adapter.
 *
 * The server derives the author from the authenticated principal. The legacy
 * `authorId` argument remains accepted for source compatibility but is
 * deliberately ignored so callers cannot impersonate another author.
 */

import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { assertHighway } from '@repo/core/api/highways';
import { APIError } from '@repo/core/types/API';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

function assertAnnouncementsHighway() {
  assertHighway('announcements_core', 'direct-api');
}

async function throwApiError(res: Response, operation: string): Promise<never> {
  throw new APIError(operation, res.status.toString());
}

export const announcementAPI = {
  async getAnnouncements(schoolId: string) {
    assertAnnouncementsHighway();
    const res = await (client.api as any).announcements.$get({
      query: { schoolId },
    });
    if (!res.ok) await throwApiError(res, 'Failed to fetch announcements');
    return await res.json();
  },

  async createAnnouncement(
    schoolId: string,
    _authorId: string,
    content: string,
    isPinned = false,
  ) {
    assertAnnouncementsHighway();
    const res = await (client.api as any).announcements.$post({
      json: {
        schoolId,
        title: '',
        content,
        isPinned,
      },
    });
    if (!res.ok) await throwApiError(res, 'Failed to create announcement');
    return await res.json();
  },
};
