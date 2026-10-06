import { useStore } from '@repo/core/store/useStore';
import { SelfFeatureRenderer } from '@repo/self/components/SelfFeatureRenderer';
import { canonicalSelfFeatureId } from '@repo/self/constants/selfRegistry';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Box } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { SelfFloor } from '@/components/self/SelfFloor';
import { useTrackActiveSubTab } from '@/hooks/useTrackActiveSubTab';
import { getSelfRegistry } from '@/navigation/registries/selfRegistry';

export { RouteErrorBoundary as ErrorBoundary };

export default function SelfScreen() {
  const params = useLocalSearchParams<{ feature?: string }>();
  const featureId = params.feature;
  const registry = useMemo(() => getSelfRegistry(), []);
  const activeFeatureDef = useMemo(() => {
    if (!featureId) return null;
    return registry.items.find(
      (item) => item.params?.feature === featureId || item.id === featureId,
    );
  }, [featureId, registry.items]);

  const featureTitle = activeFeatureDef?.title || featureId || 'Task';

  if (!featureId) {
    return <SelfFloor />;
  }

  return <SelfFeatureScreen featureId={featureId} title={featureTitle} />;
}

function SelfFeatureScreen({ featureId, title }: { featureId: string; title: string }) {
  const user = useStore((state) => state.user);

  useTrackActiveSubTab({
    featureId,
    title,
    route: '/self',
    params: { feature: featureId },
    domain: 'self',
  });

  return (
    <Box
      style={{
        flex: 1,
        backgroundColor: tokens.semantic.surface.canvas,
        paddingHorizontal: tokens.spacing.md,
        paddingTop: tokens.spacing.sm,
      }}
    >
      <SelfFeatureRenderer
        featureId={canonicalSelfFeatureId(featureId)}
        userId={user?.id}
      />
    </Box>
  );
}
