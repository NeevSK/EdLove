import { announcementAPI } from '@/api/announcements';
import { circleAPI } from '@/api/circles';
import { communityAPI as rawCommunityAPI } from '@/api/community';
import { communityContract } from '@/api/community.contract';
import { assertContractCoverage, defineContractCoverage } from '@/api/contractCoverage';
import { messagingAPI } from '@/api/messaging';
import { socialAPI } from '@/api/social';
import { createTemporalProxy } from '@/api/temporalProxy';

const combinedRawAPI = {
  ...rawCommunityAPI,
  ...circleAPI,
  ...announcementAPI,
  ...messagingAPI,
  ...socialAPI,
};

const _communityCoverage = assertContractCoverage(
  combinedRawAPI,
  defineContractCoverage({
    moduleName: 'community',
    contract: communityContract,
    methodMapping: {
      getGroupById: 'getGroup',
      get: 'getGroup',
      getGroupMessages: 'getMessages',
      sendGroupMessage: 'sendMessage',
      togglePostReaction: 'toggleReaction',
      createGroupWithOwner: 'createGroup',
      reportContent: 'reportContent',
      getComments: 'getComments',
      createComment: 'createComment',
      deleteComment: 'deleteComment',
      toggleCommentUpvote: 'toggleCommentUpvote',
      markOfficialAnswer: 'markOfficialAnswer',
      getNotifications: 'getNotifications',
      getUnreadNotificationCount: 'getUnreadNotificationCount',
      markNotificationRead: 'markNotificationRead',
      markAllNotificationsRead: 'markAllNotificationsRead',
    },
    internalMethods: [
      'getGroupMessages',
      'sendGroupMessage',
      'handleMemberRequest',
      'updateJoiningPolicy',
      'getAnnouncements',
      'createAnnouncement',
      'getDirectConversations',
      'getOrCreateDirectConversation',
      'getDirectMessages',
      'sendDirectMessage',
      'getCommunityResonance',
      'getNotifications',
      'getUnreadNotificationCount',
      'markNotificationRead',
      'markAllNotificationsRead',
      'blockUser',
      'unblockUser',
      'isBlockingActive',
      'getMutedUsers',
    ],
  }),
);

export const communityAPI = createTemporalProxy('community', combinedRawAPI);
