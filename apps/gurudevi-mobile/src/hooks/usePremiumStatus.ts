import { useDomainFeature } from '@repo/core/logic/registry/useDomainFeature';

/**
 * usePremiumStatus
 * Convenience hook to check if the current user has active premium/PRO access.
 */
export function usePremiumStatus() {
  const { result } = useDomainFeature('ai-assistant');

  // The registry/permission pipeline understands personal PRO and any
  // currently active institutional grant. Do not infer access from the
  // legacy global pricing_tier projection.
  const isPremium = result.permitted;
  const isInstitutional = result.permitted === false && result.reason === 'entitlement';

  return {
    isPremium,
    isInstitutional,
    pricingTier: undefined,
  };
}
