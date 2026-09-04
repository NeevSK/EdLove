import { orpcClient } from '@repo/core/api/orpcClient';
import type { UserRewards, UserRewardsHistory } from '@repo/core/api/rewards.orpc.contract';

export const rewardsAPI = {
  async getRewards(userId: string): Promise<UserRewards | null> {
    return orpcClient.rewards.getRewards({ query: { userId } });
  },

  async getRewardsAsOf(userId: string, asOf: string): Promise<UserRewards | null> {
    return orpcClient.rewards.getRewardsAsOf({ query: { userId, asOf } });
  },

  async getRewardsHistory(userId: string, limit = 50): Promise<UserRewardsHistory[]> {
    return orpcClient.rewards.getRewardsHistory({ query: { userId, limit } });
  },

  async getRewardsRangeHistory(
    userId: string,
    viewDate: string,
    viewScale: 'day' | 'week' | 'month' | 'year' | 'custom' = 'day',
  ): Promise<UserRewardsHistory[]> {
    return orpcClient.rewards.getRewardsRangeHistory({
      query: { userId, viewDate, viewScale },
    });
  },

  async initializeRewards(userId: string): Promise<UserRewards> {
    return orpcClient.rewards.initializeRewards({ body: { userId } });
  },

  async addPoints(userId: string, points: number): Promise<UserRewards> {
    return orpcClient.rewards.addPoints({ body: { userId, points } });
  },

  async awardBadge(userId: string, badge: string): Promise<UserRewards> {
    return orpcClient.rewards.awardBadge({ body: { userId, badge } });
  },

  async checkAndAwardAchievements(userId: string): Promise<{
    updatedRewards: UserRewards;
    newAchievements: string[];
  }> {
    return orpcClient.rewards.checkAndAwardAchievements({ body: { userId } });
  },
};
