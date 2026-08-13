import { InvitationWelcomeScreen } from '@repo/community/onboarding';
import { Center, Spinner } from '@repo/ui/primitives';
import { Suspense } from 'react';

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <Spinner />
    </Center>
  );
}

export default function InvitationWelcomeRoute() {
  return (
    <Suspense fallback={<Fallback />}>
      <InvitationWelcomeScreen />
    </Suspense>
  );
}
