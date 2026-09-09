import { useTracking } from '@repo/core/hooks';
import SelfScreenUnified from '@repo/self/screens/SelfScreen.unified';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';
import { useEffect } from 'react';

/**
 * SelfScreen — declarative entry point for the user's sanctuary.
 * Capability-driven (POA) polymorphic workspace canvas.
 * Unified canvas directly serves all roles with multi-role aggregation & custom prioritization.
 */
export default function SelfScreen() {
  return (
    <ErrorBoundary name="SelfScreen">
      <SelfScreenContent />
    </ErrorBoundary>
  );
}

function SelfScreenContent() {
  const { discoverFeature } = useTracking();

  useEffect(() => {
    void discoverFeature('section_self');
  }, [discoverFeature]);

  return <SelfScreenUnified />;
}
