import { BrandPulse } from '@repo/ui';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Center } from '@repo/ui/primitives';
import { OnboardingWrapper } from '@repo/ui/screens/OnboardingWrapper';
import { Suspense } from 'react';
import { fireflyProductArtwork } from '@/brand/mascotArtwork';

export { RouteErrorBoundary as ErrorBoundary };

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <BrandPulse accessibilityLabel="Loading onboarding" />
    </Center>
  );
}

export default function OnboardingRoute() {
  return (
    <ErrorBoundary name="OnboardingRoute">
      <Suspense fallback={<Fallback />}>
        <OnboardingWrapper onboardingArtwork={fireflyProductArtwork.onboarding} />
      </Suspense>
    </ErrorBoundary>
  );
}
