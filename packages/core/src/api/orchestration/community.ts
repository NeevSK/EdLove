import { announcementAPI } from '../announcements';
import { circleAPI } from '../circles';
import { communityAPI as rawCommunityAPI } from '../community';
import { communityContract } from '../community.contract';
import { assertContractCoverage, defineContractCoverage } from '../contractCoverage';
import { messagingAPI } from '../messaging';
import { socialAPI } from '../social';
import { createTemporalPOAProxy } from '../temporalPOAProxy';

const combinedRawAPI = {
  ...rawCommunityAPI,
  ...circleAPI,
  ...announcementAPI,
  ...messagingAPI,
  ...socialAPI,
};

const communityCoverage = assertContractCoverage(
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

export const communityAPI = createTemporalPOAProxy(
  'community',
  combinedRawAPI,
  communityCoverage.contract,
  communityCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);
