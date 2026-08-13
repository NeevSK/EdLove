import { describe, expect, it } from 'vitest';
import { directMessageRoute, groupRoute } from './communityRoutes';

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
});
