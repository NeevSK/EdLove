/** Transport client for authenticated feature-discovery tracking. */
import { orpcClient } from '@repo/core/api/orpcClient';
import type { FeatureUsage } from '@repo/core/api/tracking.contract';

export const trackingAPI = {
  async logFeatureUsage(
    _userId: string,
    featureName: string,
    interactionType = 'exploration',
  ): Promise<FeatureUsage | null> {
    try {
      const response = await orpcClient.tracking.logFeatureUsage({
        body: { featureName, interactionType },
      });
      return response as FeatureUsage;
    } catch (error) {
      console.warn(
        `[trackingAPI] Offline or unreachable when logging feature usage for ${featureName}:`,
        error,
      );
      return null;
    }
  },

  async getExploredFeatures(_userId: string): Promise<string[]> {
    try {
      const response = await orpcClient.tracking.listExploredFeatures();
      return response as string[];
    } catch (error) {
      console.warn('[trackingAPI] Offline or unreachable when fetching explored features:', error);
      return [];
    }
  },
};
