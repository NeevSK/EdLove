import { QRHandlerScreen } from '@repo/scanner-kit';
import { BrandPulse } from '@repo/ui';
import { Center } from '@repo/ui/primitives';
import { Suspense } from 'react';

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <BrandPulse accessibilityLabel="Loading QR scanner" />
    </Center>
  );
}

export default function QRRoute() {
  return (
    <Suspense fallback={<Fallback />}>
      <QRHandlerScreen />
    </Suspense>
  );
}
