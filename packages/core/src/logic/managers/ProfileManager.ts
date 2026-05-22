import type { SocialLink } from '../../types';
import type {
  ProfileJourneyHistoryReadOptions,
  ProfileJourneyReadOptions,
  ProfileRepository,
  ProfileTemporalReadOptions,
} from '../domains/profile/ports';

/**
 * ProfileManager
 *
 * Domain manager for User and Institutional profiles.
 * Orchestrates repository access for history, journey snapshots, and social identity.
 */
export class ProfileManager {
  constructor(private repo: ProfileRepository) {}

  async getUserProfile(userId: string) {
    return this.repo.getUserProfile(userId);
  }

  async getUserProfileAsOf(userId: string, asOf: string) {
    return this.repo.getUserProfileAsOf(userId, asOf);
  }

  async getUserProfileHistory(userId: string, limit?: number) {
    return this.repo.getUserProfileHistory(userId, limit);
  }

  async getJourneySnapshot(userId: string, options?: ProfileJourneyReadOptions) {
    return this.repo.getJourneySnapshot(userId, options);
  }

  async getJourneyHistory(userId: string, options?: ProfileJourneyHistoryReadOptions) {
    return this.repo.getJourneyHistory(userId, options);
  }

  async updateProfile(userId: string, updates: Record<string, unknown>) {
    return this.repo.updateUserProfile(userId, updates);
  }

  async isAnonymous(userId: string) {
    return this.repo.getAnonymousFlag(userId);
  }

  async uploadAvatar(userId: string, localUri: string) {
    const avatarUrl = await this.repo.uploadAvatarAsset(localUri);
    return this.repo.updateUserProfile(userId, { avatar_url: avatarUrl });
  }

  async getSocialLinks(userId: string) {
    return this.repo.getSocialLinks(userId);
  }

  async upsertSocialLink(userId: string, link: Partial<SocialLink>) {
    return this.repo.upsertSocialLink({ ...link, user_id: link.user_id || userId });
  }

  async deleteSocialLink(linkId: string) {
    return this.repo.deleteSocialLink(linkId);
  }

  async updateSocialLinksOrder(_userId: string, links: { id: string; order_index: number }[]) {
    return this.repo.updateSocialLinksOrder(links);
  }

  async getUserPreferences(userId: string) {
    return this.repo.getUserPreferences(userId);
  }

  async updateUserPreferences(userId: string, updates: any) {
    return this.repo.updateUserPreferences(userId, updates);
  }

  async getCommunityProfile(communityId: string) {
    return this.repo.getCommunityProfile(communityId);
  }

  async getCommunityProfileAsOf(communityId: string, asOf: string) {
    return this.repo.getCommunityProfileAsOf(communityId, asOf);
  }

  async getCommunityProfileHistory(communityId: string, limit?: number) {
    return this.repo.getCommunityProfileHistory(communityId, limit);
  }

  async updateCommunityProfile(communityId: string, field: 'name' | 'description', value: string) {
    return this.repo.updateCommunityProfile(communityId, field, value);
  }

  async getSchoolPulse(schoolId: string, options: ProfileTemporalReadOptions) {
    return this.repo.getSchoolPulse(schoolId, options);
  }
}
