import { InvitationWelcomeScreen } from '@repo/community/onboarding';
import { BrandPulse } from '@repo/ui';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Center } from '@repo/ui/primitives';
import { Suspense } from 'react';

export { RouteErrorBoundary as ErrorBoundary };

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <BrandPulse accessibilityLabel="Loading invitation" />
    </Center>
  );
}

export default function InvitationWelcomeRoute() {
  return (
    <ErrorBoundary name="InvitationWelcomeRoute">
      <Suspense fallback={<Fallback />}>
        <InvitationWelcomeScreen />
      </Suspense>
    </ErrorBoundary>
  );
}
