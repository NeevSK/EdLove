import type { UserGrowthState } from '@repo/schema';
import type { TemporalScale } from '../../../store';
import type { SocialLink, User } from '../../../types';

export type { UserGrowthState };

export interface CommunityProfile {
  id: string;
  name: string;
  description?: string | null;
  visibility?: string | null;
  member_count?: number | null;
  creator_id?: string | null;
}

export interface ProfileHistoryEntry<TSnapshot = Record<string, unknown>> {
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
  [key: string]: unknown;
}

export interface WhisperedMomentSnapshot {
  key: string;
  name_en: string;
  name_si: string;
  awarded_at: string;
  [key: string]: unknown;
}

export interface ProfileJourneySnapshot {
  as_of: string | null;
  rewards: UserRewardsSnapshot | null;
  growth: UserGrowthState | null;
  whispered_moments: WhisperedMomentSnapshot[];
}

export interface UserPreferences {
  id: string;
  user_id: string;
  favorite_features: string[];
  hidden_features: string[];
  notification_settings: {
    channels: {
      push: boolean;
      email: boolean;
      in_app: boolean;
    };
    categories: Record<string, { push: boolean; email: boolean }>;
    quiet_hours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  } | null;
  enable_contextual_prompts: boolean;
  enable_usage_tracking: boolean;
  updated_at: string;
  created_at: string;
}

export interface ProfileJourneyEvent {
  id: string;
  timestamp: string;
  source: 'reward' | 'growth' | 'moment';
  operation?: 'insert' | 'update' | 'delete';
  title: string;
  metadata?: Record<string, unknown>;
  snapshot?: Record<string, unknown>;
}

export interface ProfileJourneyHistoryReadOptions {
  viewDate?: string;
  viewScale?: TemporalScale;
  limit?: number;
}

export interface ProfileRepository {
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
  updateUserProfile(userId: string, updates: Record<string, unknown>): Promise<User>;
  getAnonymousFlag(userId: string): Promise<boolean>;
  uploadAvatarAsset(localUri: string): Promise<string>;

  getSocialLinks(userId: string): Promise<SocialLink[]>;
  upsertSocialLink(link: Partial<SocialLink>): Promise<SocialLink>;
  deleteSocialLink(linkId: string): Promise<void>;
  updateSocialLinksOrder(links: { id: string; order_index: number }[]): Promise<void>;

  getUserPreferences(userId: string): Promise<UserPreferences | null>;
  updateUserPreferences(
    userId: string,
    updates: Partial<UserPreferences>,
  ): Promise<UserPreferences>;

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
