import { usePermissions } from '@repo/core/logic';

/**
 * usePremiumStatus
 * Convenience hook to check if the current user has active premium/PRO access.
 */
export function usePremiumStatus() {
  const { context } = usePermissions();

  const isPremium = context.pricing_tier === 'PRO' || context.pricing_tier === 'INSTITUTIONAL';
  const isInstitutional = context.pricing_tier === 'INSTITUTIONAL';

  return {
    isPremium,
    isInstitutional,
    pricingTier: context.pricing_tier,
  };
}
