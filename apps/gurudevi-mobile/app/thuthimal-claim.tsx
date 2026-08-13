import { ThuthimalClaimScreen } from '@repo/profile/own';
import { Center, Spinner } from '@repo/ui/primitives';
import { Suspense } from 'react';

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <Spinner />
    </Center>
  );
}

export default function ThuthimalClaimRoute() {
  return (
    <Suspense fallback={<Fallback />}>
      <ThuthimalClaimScreen />
    </Suspense>
  );
}
