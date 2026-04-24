import React, { useEffect } from 'react';
import { usePermissions } from '@repo/core/logic';
import { useFeatureStore } from '@repo/core/logic';

export interface FeatureProviderProps {
  children: React.ReactNode;
}

/**
 * FeatureProvider - The synchronization engine for feature flags.
 *
 * FAANG Principle: "Contextual Reactivity". This component ensures that
 * whenever the User Context changes (Auth, Tier, Roles), the Feature Flags
 * are recomputed instantly across the entire platform.
 */
export const FeatureProvider: React.FC<FeatureProviderProps> = ({ children }) => {
  const { context } = usePermissions();
  const recomputeFlags = useFeatureStore((state) => state.recomputeFlags);

  // Trigger re-computation of flags whenever user context changes
  useEffect(() => {
    if (context) {
      recomputeFlags(context);
    }
  }, [context, recomputeFlags]);

  return <>{children}</>;
};
