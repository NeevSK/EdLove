/** Transport client for authenticated feature-discovery tracking. */
import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import type { FeatureUsage } from '@repo/core/api/tracking.contract';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const trackingAPI = {
  async logFeatureUsage(
    _userId: string,
    featureName: string,
    interactionType = 'exploration',
  ): Promise<FeatureUsage | null> {
    try {
      const response = await (client.api as any).tracking.features.$post({
        json: { featureName, interactionType },
      });
      if (!response.ok) {
        console.warn(`[trackingAPI] Failed to log feature usage for ${featureName} (${response.status})`);
        return null;
      }
      return (await response.json()) as FeatureUsage;
    } catch (error) {
      console.warn(`[trackingAPI] Offline or unreachable when logging feature usage for ${featureName}:`, error);
      return null;
    }
  },

  async getExploredFeatures(_userId: string): Promise<string[]> {
    try {
      const response = await (client.api as any).tracking.features.$get();
      if (!response.ok) {
        console.warn(`[trackingAPI] Failed to fetch explored features (${response.status})`);
        return [];
      }
      return (await response.json()) as string[];
    } catch (error) {
      console.warn('[trackingAPI] Offline or unreachable when fetching explored features:', error);
      return [];
    }
  },
};

