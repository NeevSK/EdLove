export function directMessageRoute(conversationId: string, userName?: string) {
  return {
    pathname: '/community/direct-messages/[conversationId]' as const,
    params: {
      conversationId,
      ...(userName ? { userName } : {}),
    },
  };
}

export function groupRoute(groupId: string, groupName?: string) {
  return {
    pathname: '/community/groups/[groupId]' as const,
    params: {
      groupId,
      ...(groupName ? { groupName } : {}),
    },
  };
}

export function groupChatRoute(conversationId: string, groupName?: string) {
  return {
    pathname: '/community/chat/[conversationId]' as const,
    params: {
      conversationId,
      ...(groupName ? { groupName } : {}),
    },
  };
}

export function userProfileRoute(id: string, userName?: string) {
  return {
    pathname: '/community/profile/[id]' as const,
    params: {
      id,
      ...(userName ? { userName } : {}),
    },
  };
}

export function announcementsRoute() {
  return {
    pathname: '/community/announcements' as const,
  };
}

export function groupsRoute() {
  return {
    pathname: '/community/groups' as const,
  };
}

export function communityModeRoute(mode: 'feed' | 'circles' | 'messages' | 'announcements') {
  return {
    pathname: '/community' as const,
    params: { mode },
  };
}

export function inviteWelcomeRoute(capacity: string, schoolName: string) {
  return {
    pathname: '/invitation-welcome' as const,
    params: { capacity, schoolName },
  };
}
