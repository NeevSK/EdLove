import { growth } from '../logic';
import type { CreateRippleInput, ImpactRipple } from '../types/Growth';


/**
 * impactRipplesAPI (Legacy Proxy)
 */
export const impactRipplesAPI = {
  async createRipple(input: CreateRippleInput): Promise<void> {
    return growth.createRipple(input);
  },

  async getPendingRipples(userId: string): Promise<ImpactRipple[]> {
    return growth.getPendingRipples(userId);
  },

  async markDelivered(rippleId: string): Promise<void> {
    return growth.markRippleDelivered(rippleId);
  },

  async getDeliveredSince(userId: string, since: string): Promise<ImpactRipple[]> {
    return growth.getDeliveredRipples(userId, since);
  },
};
