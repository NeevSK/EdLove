import { ThuthimalClaimScreen } from '@repo/profile/own';
import { BrandPulse } from '@repo/ui';
import { Center } from '@repo/ui/primitives';
import { Suspense } from 'react';

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <BrandPulse accessibilityLabel="Loading claim" />
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
