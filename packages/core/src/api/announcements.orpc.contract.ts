import { z } from 'zod';

const announcement = z.object({
  id: z.string().uuid(),
  school_id: z.string().uuid(),
  author_id: z.string().uuid().nullable(),
  title: z.string(),
  content: z.string(),
  is_pinned: z.boolean(),
  created_at: z.string(),
  author_name: z.string().nullable(),
  author_avatar: z.string().nullable(),
});

export const announcementsORPCContract = {
  getAnnouncements: {
    method: 'get',
    path: '/announcements',
    metadata: { policy: { action: 'read', subject: 'Announcement' } },
    request: {
      query: z.object({
        schoolId: z.string().uuid(),
      }),
    },
    responses: { 200: { schema: z.array(announcement), description: 'School announcements' } },
  },
  createAnnouncement: {
    method: 'post',
    path: '/announcements',
    metadata: { policy: { action: 'create', subject: 'Announcement' } },
    request: {
      body: z.object({
        schoolId: z.string().uuid(),
        title: z.string(),
        content: z.string(),
        isPinned: z.boolean().optional(),
      }),
    },
    responses: { 201: { schema: announcement, description: 'Created announcement' } },
  },
};
