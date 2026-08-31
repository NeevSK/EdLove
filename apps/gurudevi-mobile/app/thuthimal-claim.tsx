import { ThuthimalClaimScreen } from '@repo/profile/own';
import { BrandPulse } from '@repo/ui';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Center } from '@repo/ui/primitives';
import { Suspense } from 'react';

export { RouteErrorBoundary as ErrorBoundary };

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <BrandPulse accessibilityLabel="Loading claim" />
    </Center>
  );
}

export default function ThuthimalClaimRoute() {
  return (
    <ErrorBoundary name="ThuthimalClaimRoute">
      <Suspense fallback={<Fallback />}>
        <ThuthimalClaimScreen />
      </Suspense>
    </ErrorBoundary>
  );
}
