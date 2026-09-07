import { orpcClient } from '@repo/core/api/orpcClient';
import type { UserRewards, UserRewardsHistory } from '@repo/core/api/rewards.orpc.contract';

export const rewardsAPI = {
  async getRewards(userId: string): Promise<UserRewards | null> {
    try {
      return await orpcClient.rewards.getRewards({ query: { userId } });
    } catch {
      return null;
    }
  },

  async getRewardsAsOf(userId: string, asOf: string): Promise<UserRewards | null> {
    try {
      return await orpcClient.rewards.getRewardsAsOf({ query: { userId, asOf } });
    } catch {
      return null;
    }
  },

  async getRewardsHistory(userId: string, limit = 50): Promise<UserRewardsHistory[]> {
    try {
      return await orpcClient.rewards.getRewardsHistory({ query: { userId, limit } });
    } catch {
      return [];
    }
  },

  async getRewardsRangeHistory(
    userId: string,
    viewDate: string,
    viewScale: 'day' | 'week' | 'month' | 'year' | 'custom' = 'day',
  ): Promise<UserRewardsHistory[]> {
    try {
      return await orpcClient.rewards.getRewardsRangeHistory({
        query: { userId, viewDate, viewScale },
      });
    } catch {
      return [];
    }
  },

  async initializeRewards(userId: string): Promise<UserRewards | null> {
    try {
      return await orpcClient.rewards.initializeRewards({ body: { userId } });
    } catch {
      return null;
    }
  },

  async addPoints(userId: string, points: number): Promise<UserRewards | null> {
    try {
      return await orpcClient.rewards.addPoints({ body: { userId, points } });
    } catch {
      return null;
    }
  },

  async awardBadge(userId: string, badge: string): Promise<UserRewards | null> {
    try {
      return await orpcClient.rewards.awardBadge({ body: { userId, badge } });
    } catch {
      return null;
    }
  },

  async checkAndAwardAchievements(userId: string): Promise<{
    updatedRewards: UserRewards | null;
    newAchievements: string[];
  }> {
    try {
      return await orpcClient.rewards.checkAndAwardAchievements({ body: { userId } });
    } catch {
      return { updatedRewards: null, newAchievements: [] };
    }
  },
};
