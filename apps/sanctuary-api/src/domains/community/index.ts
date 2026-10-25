import { announcementsRouter } from '../../core/handlers/announcements';
import { channelRouter } from '../../core/handlers/channel';
import { communityRouter } from '../../core/handlers/community';
import { messagingRouter } from '../../core/handlers/messaging';
import { presenceRouter } from '../../core/handlers/presence';
import { rewardsRouter } from '../../core/handlers/rewards';
import { socialRouter } from '../../core/handlers/social';
import { thuthimalRouter } from '../../core/handlers/thuthimal';
import { o } from '../../core/orpc';

/**
 * Community Bounded Context (Relational Fabric & Omnichannel Communications)
 * 
 * Grounded in @repo/community:
 * Relational safety, groups, discussions, announcements, and direct/omnichannel messaging.
 */
export const communityDomainRouter = o.router({
  // Direct procedures from communityRouter (groups, posts, membership)
  ...communityRouter,

  // Explicit sub-capabilities within the Community Bounded Context
  fabric: communityRouter,
  community: communityRouter,
  channel: channelRouter,
  channels: channelRouter,
  messaging: messagingRouter,
  social: socialRouter,
  announcements: announcementsRouter,
  presence: presenceRouter,
  rewards: rewardsRouter,
  thuthimal: thuthimalRouter,
});

export {
  communityRouter,
  channelRouter,
  messagingRouter,
  socialRouter,
  announcementsRouter,
  presenceRouter,
  rewardsRouter,
  thuthimalRouter,
};
