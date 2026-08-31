import { PublicFormScreenWeb } from '@repo/form-builder';
import { BrandPulse } from '@repo/ui';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Center } from '@repo/ui/primitives';
import { Suspense } from 'react';

export { RouteErrorBoundary as ErrorBoundary };

function Fallback() {
  return (
    <Center className="flex-1">
      <BrandPulse accessibilityLabel="Loading form" />
    </Center>
  );
}

export default function PublicFormRoute() {
  return (
    <ErrorBoundary name="PublicFormRoute">
      <Suspense fallback={<Fallback />}>
        <PublicFormScreenWeb />
      </Suspense>
    </ErrorBoundary>
  );
}
