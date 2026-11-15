import {
  MOCK_ANNOUNCEMENTS,
  MOCK_COMMUNITY_GROUPS,
  MOCK_COMMUNITY_POSTS,
  MOCK_DIRECT_CONVERSATIONS,
  type MockAnnouncement,
  type MockCommunityPost,
  type MockDirectConversation,
  type MockGroup,
} from '@repo/core/api/mockData';
import { getActiveAccountId } from '@repo/core/lib/accountScope';
import { answer, definePort, type PortSource } from '@repo/core/ports/definePort';
import { useQuery } from '@tanstack/react-query';

export interface SquarePost {
  id: string;
  author: string;
  body: string;
  group?: string;
  reactions: number;
  comments: number;
  liked: boolean;
  at: string;
}

export interface SquareGroup {
  id: string;
  name: string;
  summary: string;
  members: number;
  joined: boolean;
  open: boolean;
}

export interface SquareNotice {
  id: string;
  author?: string;
  body: string;
  pinned: boolean;
  at: string;
}

export interface SquareConversation {
  id: string;
  with: string;
  role?: string;
  last: string;
  at: string;
  unread: number;
}

/** Everything the Community room's front floor shows. */
export interface Square {
  posts: readonly SquarePost[];
  groups: readonly SquareGroup[];
  notices: readonly SquareNotice[];
  conversations: readonly SquareConversation[];
}

export interface CommunityPort extends PortSource {
  square(signal?: AbortSignal): Promise<Square>;
}

const iso = (d: Date | string) => (typeof d === 'string' ? d : d.toISOString());

export const squarePostOf = (p: MockCommunityPost): SquarePost => ({
  id: p.id,
  author: p.author_name,
  body: p.content,
  group: p.group_name,
  reactions: p.reaction_count,
  comments: p.comment_count,
  liked: p.has_liked,
  at: iso(p.created_at),
});

export const squareGroupOf = (g: MockGroup): SquareGroup => ({
  id: g.id,
  name: g.name,
  summary: g.description,
  members: g.member_count,
  joined: g.is_member,
  open: g.join_policy === 'open' || g.is_public,
});

export const squareNoticeOf = (a: MockAnnouncement): SquareNotice => ({
  id: a.id,
  author: a.author_name,
  body: a.content,
  pinned: a.is_pinned,
  at: iso(a.created_at),
});

export const squareConversationOf = (c: MockDirectConversation): SquareConversation => ({
  id: c.id,
  with: c.participant_name,
  role: c.role,
  last: c.last_message,
  at: c.last_message_at,
  unread: c.unread_count,
});

const sample: CommunityPort = {
  source: 'sample',
  square: (signal) =>
    answer(
      {
        posts: MOCK_COMMUNITY_POSTS.map(squarePostOf),
        groups: MOCK_COMMUNITY_GROUPS.map(squareGroupOf),
        notices: [...MOCK_ANNOUNCEMENTS]
          .sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned))
          .map(squareNoticeOf),
        conversations: MOCK_DIRECT_CONVERSATIONS.map(squareConversationOf),
      },
      signal,
    ),
};

/** Where the Community room's records come from. Samples until community.* is admitted. */
export const communityPort = definePort<CommunityPort>(sample);

export function useSquare() {
  const port = communityPort.get();
  return useQuery({
    queryKey: ['community', 'square', getActiveAccountId(), port.source],
    queryFn: ({ signal }) => port.square(signal),
    staleTime: 60_000,
  });
}
