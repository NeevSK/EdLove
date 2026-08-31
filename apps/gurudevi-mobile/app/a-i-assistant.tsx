import { AIAssistantScreen } from '@repo/ai/assistant';
import { BrandPulse, FireflyProductMoment } from '@repo/ui';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Center } from '@repo/ui/primitives';
import { Suspense } from 'react';
import { fireflyProductArtwork } from '@/brand/mascotArtwork';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';

export { RouteErrorBoundary as ErrorBoundary };

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <BrandPulse accessibilityLabel="Loading AI assistant" />
    </Center>
  );
}

function PremiumGuard() {
  return (
    <Center className="flex-1 bg-phase-canvas">
      <FireflyProductMoment
        kind="pro"
        message="The AI Assistant is available to Gurudevi Pro and Institutional members. Ask your school administrator or explore an upgrade on the web portal."
        artwork={fireflyProductArtwork.pro}
        title="A deeper way to learn"
      />
    </Center>
  );
}

export default function AIAssistantRoute() {
  const { isPremium } = usePremiumStatus();

  if (!isPremium) {
    return <PremiumGuard />;
  }

  return (
    <ErrorBoundary name="AIAssistantRoute">
      <Suspense fallback={<Fallback />}>
        <AIAssistantScreen />
      </Suspense>
    </ErrorBoundary>
  );
}
