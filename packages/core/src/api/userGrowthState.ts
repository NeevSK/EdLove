import { growth } from '../logic';
import { type UserGrowthState } from '../types/Growth';
export * from '../types/Growth';


/**
 * userGrowthStateAPI (Legacy Proxy)
 * 
 * Superseded by GrowthManager. Now redirects to the sovereign Growth domain.
 */
export const userGrowthStateAPI = {
  async getGrowthState(userId: string): Promise<UserGrowthState | null> {
    return growth.getGrowthState(userId);
  },

  async incrementDimension(userId: string, dimension: string): Promise<UserGrowthState | null> {
    return growth.incrementDimension(userId, dimension);
  },

  async updateGrowthState(userId: string, updates: Partial<UserGrowthState>): Promise<void> {
    await growth.updateGrowthState(userId, updates);
  }
};
