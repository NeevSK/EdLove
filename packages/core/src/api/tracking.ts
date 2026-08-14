/** Transport client for authenticated feature-discovery tracking. */
import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import type { FeatureUsage } from '@repo/core/api/tracking.contract';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const trackingAPI = {
  async logFeatureUsage(
    _userId: string,
    featureName: string,
    interactionType = 'exploration',
  ): Promise<FeatureUsage> {
    const response = await (client.api as any).tracking.features.$post({
      json: { featureName, interactionType },
    });
    if (!response.ok) throw new Error('Error logging feature usage.');
    return (await response.json()) as FeatureUsage;
  },

  async getExploredFeatures(_userId: string): Promise<string[]> {
    const response = await (client.api as any).tracking.features.$get();
    if (!response.ok) throw new Error('Error fetching explored features.');
    return (await response.json()) as string[];
  },
};
