import { QRHandlerScreen } from '@repo/scanner-kit';
import { Center, Spinner } from '@repo/ui/primitives';
import { Suspense } from 'react';

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <Spinner />
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
