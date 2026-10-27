import { describe, expect, it } from 'vitest';
import {
  announcementsRoute,
  communityModeRoute,
  directMessageRoute,
  groupChatRoute,
  groupRoute,
  groupsRoute,
  inviteWelcomeRoute,
  userProfileRoute,
} from './communityRoutes';

describe('community route handoffs', () => {
  it('opens a conversation on the dynamic DM route with the selected payload', () => {
    expect(directMessageRoute('conversation-1', 'Maya')).toEqual({
      pathname: '/community/direct-messages/[conversationId]',
      params: { conversationId: 'conversation-1', userName: 'Maya' },
    });
  });

  it('keeps group navigation scoped to the selected group id', () => {
    expect(groupRoute('group-1', 'Circle')).toEqual({
      pathname: '/community/groups/[groupId]',
      params: { groupId: 'group-1', groupName: 'Circle' },
    });
  });

  it('generates group chat route with optional groupName', () => {
    expect(groupChatRoute('chat-123', 'Science Circle')).toEqual({
      pathname: '/community/chat/[conversationId]',
      params: { conversationId: 'chat-123', groupName: 'Science Circle' },
    });
  });

  it('generates user profile route with optional userName', () => {
    expect(userProfileRoute('user-456', 'Ananda')).toEqual({
      pathname: '/community/profile/[id]',
      params: { id: 'user-456', userName: 'Ananda' },
    });
  });

  it('generates announcements route correctly', () => {
    expect(announcementsRoute()).toEqual({
      pathname: '/community/announcements',
    });
  });

  it('generates groups catalog route correctly', () => {
    expect(groupsRoute()).toEqual({
      pathname: '/community/groups',
    });
  });

  it('generates mode-switched community route', () => {
    expect(communityModeRoute('circles')).toEqual({
      pathname: '/community',
      params: { mode: 'circles' },
    });
  });

  it('generates invite welcome route with role and school', () => {
    expect(inviteWelcomeRoute('student', 'Nalanda')).toEqual({
      pathname: '/invitation-welcome',
      params: { capacity: 'student', schoolName: 'Nalanda' },
    });
  });
});
