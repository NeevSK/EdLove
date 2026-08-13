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
