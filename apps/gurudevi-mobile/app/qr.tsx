import { QRHandlerScreen } from '@repo/scanner-kit';
import { BrandPulse } from '@repo/ui';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Center } from '@repo/ui/primitives';
import { Suspense } from 'react';

export { RouteErrorBoundary as ErrorBoundary };

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <BrandPulse accessibilityLabel="Loading QR scanner" />
    </Center>
  );
}

export default function QRRoute() {
  return (
    <ErrorBoundary name="QRRoute">
      <Suspense fallback={<Fallback />}>
        <QRHandlerScreen />
      </Suspense>
    </ErrorBoundary>
  );
}
