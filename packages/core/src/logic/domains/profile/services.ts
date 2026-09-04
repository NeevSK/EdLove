import type {
  CommunityProfile,
  ProfileHistoryEntry,
  ProfileJourneyEvent,
  ProfileJourneyHistoryReadOptions,
  ProfileJourneyReadOptions,
  ProfileJourneySnapshot,
  ProfileRepository,
  ProfileTemporalReadOptions,
  PulseMetrics,
} from '@repo/core/logic/domains/profile/ports';
import type { SocialLink, User } from '@repo/core/types';

export interface ProfileServices {
  getUserProfile(userId: string): Promise<User | null>;
  getUserProfileAsOf(userId: string, asOf: string): Promise<User | null>;
  getUserProfileHistory(userId: string, limit?: number): Promise<ProfileHistoryEntry[]>;
  getJourneySnapshot(
    userId: string,
    options?: ProfileJourneyReadOptions,
  ): Promise<ProfileJourneySnapshot>;
  getJourneyHistory(
    userId: string,
    options?: ProfileJourneyHistoryReadOptions,
  ): Promise<ProfileJourneyEvent[]>;
  updateProfile(userId: string, updates: Record<string, unknown>): Promise<User>;
  isAnonymous(userId: string): Promise<boolean>;
  uploadAvatar(userId: string, localUri: string): Promise<User>;

  getSocialLinks(userId: string): Promise<SocialLink[]>;
  upsertSocialLink(userId: string, link: Partial<SocialLink>): Promise<SocialLink>;
  deleteSocialLink(linkId: string): Promise<void>;
  updateSocialLinksOrder(
    userId: string,
    links: { id: string; order_index: number }[],
  ): Promise<void>;

  getCommunityProfile(communityId: string): Promise<CommunityProfile | null>;
  getCommunityProfileAsOf(communityId: string, asOf: string): Promise<CommunityProfile | null>;
  getCommunityProfileHistory(
    communityId: string,
    limit?: number,
  ): Promise<ProfileHistoryEntry<CommunityProfile>[]>;
  updateCommunityProfile(
    communityId: string,
    field: 'name' | 'description',
    value: string,
  ): Promise<CommunityProfile>;

  getSchoolPulse(schoolId: string, options: ProfileTemporalReadOptions): Promise<PulseMetrics>;
}

export const createProfileServices = (repository: ProfileRepository): ProfileServices => ({
  getUserProfile: (userId) => repository.getUserProfile(userId),
  getUserProfileAsOf: (userId, asOf) => repository.getUserProfileAsOf(userId, asOf),
  getUserProfileHistory: (userId, limit) => repository.getUserProfileHistory(userId, limit),
  getJourneySnapshot: (userId, options) => repository.getJourneySnapshot(userId, options),
  getJourneyHistory: (userId, options) => repository.getJourneyHistory(userId, options),
  updateProfile: (userId, updates) => repository.updateUserProfile(userId, updates),
  isAnonymous: (userId) => repository.getAnonymousFlag(userId),
  async uploadAvatar(userId, localUri) {
    const avatarUrl = await repository.uploadAvatarAsset(localUri);
    return repository.updateUserProfile(userId, { avatar_url: avatarUrl });
  },

  getSocialLinks: (userId) => repository.getSocialLinks(userId),
  upsertSocialLink: (userId, link) =>
    repository.upsertSocialLink({ ...link, user_id: link.user_id || userId }),
  deleteSocialLink: (linkId) => repository.deleteSocialLink(linkId),
  updateSocialLinksOrder: (_userId, links) => repository.updateSocialLinksOrder(links),

  getCommunityProfile: (communityId) => repository.getCommunityProfile(communityId),
  getCommunityProfileAsOf: (communityId, asOf) =>
    repository.getCommunityProfileAsOf(communityId, asOf),
  getCommunityProfileHistory: (communityId, limit) =>
    repository.getCommunityProfileHistory(communityId, limit),
  updateCommunityProfile: (communityId, field, value) =>
    repository.updateCommunityProfile(communityId, field, value),

  getSchoolPulse: (schoolId, options) => repository.getSchoolPulse(schoolId, options),
});
