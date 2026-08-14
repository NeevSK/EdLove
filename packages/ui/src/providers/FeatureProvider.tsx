import { featureFlags, useFeatureStore, usePermissions } from '@repo/core/logic';
import type React from 'react';
import { useEffect } from 'react';
import { Platform } from 'react-native';

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
  // The browser boot path can render before the native permission stores and
  // Cedar adapters are hydrated. Keep the route shell available while those
  // stores settle; native retains the eager subscription behavior.
  return Platform.OS === 'web' ? (
    <FeatureProviderWeb>{children}</FeatureProviderWeb>
  ) : (
    <FeatureProviderNative>{children}</FeatureProviderNative>
  );
};

const FeatureProviderWeb: React.FC<FeatureProviderProps> = ({ children }) => <>{children}</>;

const FeatureProviderNative: React.FC<FeatureProviderProps> = ({ children }) => {
  const { context } = usePermissions();
  const recomputeFlags = useFeatureStore((state) => state.recomputeFlags);

  // Trigger re-computation of flags whenever user context changes
  useEffect(() => {
    if (!context) return undefined;

    recomputeFlags(context);
    return featureFlags.subscribeToFlagChanges(context, (snapshot) => {
      useFeatureStore.getState().applySnapshot(snapshot);
    });
  }, [context, recomputeFlags]);

  return <>{children}</>;
};
