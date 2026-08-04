import { z } from 'zod';

export const announcementsORPCContract = {
  getAnnouncements: {
    method: 'get',
    path: '/announcements',
    request: {
      query: z.object({
        schoolId: z.string().uuid(),
      }),
    },
  },
  createAnnouncement: {
    method: 'post',
    path: '/announcements',
    request: {
      body: z.object({
        schoolId: z.string().uuid(),
        title: z.string(),
        content: z.string(),
        isPinned: z.boolean().optional(),
      }),
    },
  },
};
