import type { SocialLink, UserGrowthState } from '@repo/core';
import type { TemporalScale } from '@repo/core';

export interface CommunityProfile {
  id: string;
  name: string;
  description?: string | null;
  visibility?: string | null;
  member_count?: number | null;
  creator_id?: string | null;
}

export interface ProfileHistoryEntry<TSnapshot = Record<string, any>> {
  id: string;
  operation: 'insert' | 'update' | 'delete';
  recorded_at: string;
  recorded_by?: string | null;
  snapshot: TSnapshot;
}

export interface PulseMetrics {
  resonance_score: number;
  aggregated_mood: 'joy' | 'peace' | 'focus' | 'struggle' | 'unknown';
  trend: 'rising' | 'stable' | 'failing';
  participation_rate: number;
  top_subjects: string[];
  interaction_volume: number;
}

export interface ProfileTemporalReadOptions {
  viewDate: string;
  viewScale?: TemporalScale;
}

export interface ProfileJourneyReadOptions {
  asOf?: string;
  viewDate?: string;
  viewScale?: TemporalScale;
}

export interface UserRewardsSnapshot {
  id?: string;
  user_id?: string;
  points: number;
  badges: string[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface WhisperedMomentSnapshot {
  key: string;
  name_en: string;
  name_si: string;
  awarded_at: string;
}

export interface ProfileJourneySnapshot {
  as_of: string | null;
  rewards: UserRewardsSnapshot | null;
  growth: UserGrowthState | null;
  whispered_moments: WhisperedMomentSnapshot[];
}

export interface ProfileJourneyEvent {
  id: string;
  timestamp: string;
  source: 'reward' | 'growth' | 'moment';
  operation?: 'insert' | 'update' | 'delete';
  title: string;
  metadata?: Record<string, any>;
  snapshot?: Record<string, any>;
}

export interface ProfileJourneyHistoryReadOptions {
  viewDate?: string;
  viewScale?: TemporalScale;
  limit?: number;
}

export interface ProfileRepository {
  getUserProfile(userId: string): Promise<any | null>;
  getUserProfileAsOf(userId: string, asOf: string): Promise<any | null>;
  getUserProfileHistory(userId: string, limit?: number): Promise<ProfileHistoryEntry[]>;
  getJourneySnapshot(userId: string, options?: ProfileJourneyReadOptions): Promise<ProfileJourneySnapshot>;
  getJourneyHistory(userId: string, options?: ProfileJourneyHistoryReadOptions): Promise<ProfileJourneyEvent[]>;
  updateUserProfile(userId: string, updates: Record<string, any>): Promise<any>;
  getAnonymousFlag(userId: string): Promise<boolean>;
  uploadAvatarAsset(localUri: string): Promise<string>;

  getSocialLinks(userId: string): Promise<SocialLink[]>;
  upsertSocialLink(link: Partial<SocialLink>): Promise<SocialLink>;
  deleteSocialLink(linkId: string): Promise<void>;
  updateSocialLinksOrder(links: { id: string; order_index: number }[]): Promise<void>;

  getCommunityProfile(communityId: string): Promise<CommunityProfile | null>;
  getCommunityProfileAsOf(communityId: string, asOf: string): Promise<CommunityProfile | null>;
  getCommunityProfileHistory(communityId: string, limit?: number): Promise<ProfileHistoryEntry<CommunityProfile>[]>;
  updateCommunityProfile(communityId: string, field: 'name' | 'description', value: string): Promise<CommunityProfile>;

  getSchoolPulse(schoolId: string, options: ProfileTemporalReadOptions): Promise<PulseMetrics>;
}
