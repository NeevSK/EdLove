import { useStore } from '@repo/core/store/useStore';
import { resolveFeatureContent } from '@repo/self/components/FeatureRegistry';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Box } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { SanctuaryOverviewHub } from '@/components/self/SanctuaryOverviewHub';
import { useTrackActiveSubTab } from '@/hooks/useTrackActiveSubTab';
import { getSelfRegistry } from '@/navigation/registries/selfRegistry';

export { RouteErrorBoundary as ErrorBoundary };

export default function SelfScreen() {
  const params = useLocalSearchParams<{ feature?: string }>();
  const featureId = params.feature;
  const user = useStore((state) => state.user);

  const registry = useMemo(() => getSelfRegistry(), []);
  const activeFeatureDef = useMemo(() => {
    if (!featureId) return null;
    return registry.items.find((item) => item.params?.feature === featureId || item.id === featureId);
  }, [featureId, registry.items]);

  const featureTitle = activeFeatureDef?.title || featureId || 'Task';

  // Automatically register focused feature as an active sub-tab in Self domain
  useTrackActiveSubTab({
    id: featureId ? `self-${featureId}` : 'self-overview',
    title: featureId ? featureTitle : 'Overview',
    route: '/self',
    params: featureId ? { feature: featureId } : undefined,
    domain: 'self',
  });

  if (!featureId) {
    return <SanctuaryOverviewHub />;
  }

  return (
    <Box
      style={{
        flex: 1,
        backgroundColor: tokens.semantic.surface.canvas,
        paddingHorizontal: tokens.spacing.md,
        paddingTop: tokens.spacing.sm,
      }}
    >
      {resolveFeatureContent(featureId, user?.id)}
    </Box>
  );
}
