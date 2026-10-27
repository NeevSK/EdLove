import { getSandboxSamples } from '@repo/core/api/sandboxDataset';

export type CommunityAnnouncement = Readonly<{
  id: string;
  schoolId: string;
  authorId: string;
  authorName: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
}>;

export type CommunityAnnouncementsResult =
  | Readonly<{ kind: 'ready'; announcements: readonly CommunityAnnouncement[] }>
  | Readonly<{ kind: 'denied' }>
  | Readonly<{ kind: 'unavailable' }>;

export function getExploreSampleAnnouncements(): readonly CommunityAnnouncement[] {
  const rawDemo = getSandboxSamples<any[]>('community', 'getAnnouncements', [], []);
  return rawDemo.map((a) => ({
    id: a.id,
    schoolId: a.school_id,
    authorId: a.author_id,
    authorName: a.author_name ?? 'Sanctuary Leadership',
    content: a.content,
    isPinned: Boolean(a.is_pinned),
    createdAt: typeof a.created_at === 'string' ? a.created_at : String(a.created_at),
  }));
}
