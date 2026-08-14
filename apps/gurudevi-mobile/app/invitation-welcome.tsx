import { InvitationWelcomeScreen } from '@repo/community/onboarding';
import { BrandPulse } from '@repo/ui';
import { Center } from '@repo/ui/primitives';
import { Suspense } from 'react';

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <BrandPulse accessibilityLabel="Loading invitation" />
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
