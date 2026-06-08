import { Center, Spinner } from '@repo/ui/primitives';
import { OnboardingWrapper } from '@repo/ui/screens/OnboardingWrapper';
import { Suspense } from 'react';

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <Spinner />
    </Center>
  );
}

export default function OnboardingRoute() {
  return (
    <Suspense fallback={<Fallback />}>
      <OnboardingWrapper />
    </Suspense>
  );
}
