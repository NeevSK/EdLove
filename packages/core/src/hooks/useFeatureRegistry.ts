import { useMemo } from 'react';
import type { DomainFeature } from '../types/Workspace';

/**
 * useFeatureRegistry - The "Bouncer" for UI visibility and gating.
 *
 * This hook takes a domain-specific registry and filters/enhances it based on
 * the current user's citizenship and capabilities.
 */

export interface FeatureGatingResult {
  visible: boolean;
  locked: boolean;
  reason?: 'citizenship' | 'capability' | 'pro';
  feature: DomainFeature;
}

export function useFeatureRegistry(
  registry: Record<string, DomainFeature>,
  userContext: {
    citizenship: number; // 0, 1, 2
    isPro: boolean;
    capabilities: string[]; // CASL/ReBAC keys
    can?: (action: string, subject: string) => boolean; // Optional dynamic Cedar alignment
  },
) {
  const gatedFeatures = useMemo(() => {
    return Object.entries(registry).reduce(
      (acc, [key, feature]) => {
        const hasCitizenship = userContext.citizenship >= feature.citizenshipRequired;

        // Evaluate dynamic capability via Cedar/CASL context if provided, fallback to capabilities array
        const hasCapability = userContext.can
          ? userContext.can('read', feature.capabilityKey)
          : userContext.capabilities.includes(feature.capabilityKey);

        const isProLocked = Boolean(feature.isPro) && !userContext.isPro;

        // A feature is "Visible but Locked" if it's pro or requires citizenship elevation.
        // This encourages the "Upgrade" path without hiding the feature.
        const visible = true; // Most features are visible to show potential
        const locked = !hasCitizenship || !hasCapability || isProLocked;

        let reason: FeatureGatingResult['reason'];
        if (!hasCitizenship) reason = 'citizenship';
        else if (isProLocked) reason = 'pro';
        else if (!hasCapability) reason = 'capability';

        acc[key] = {
          visible,
          locked,
          reason,
          feature,
        };
        return acc;
      },
      {} as Record<string, FeatureGatingResult>,
    );
  }, [registry, userContext]);

  return gatedFeatures;
}
