import { PublicFormScreenWeb } from '@repo/form-builder';
import { BrandPulse } from '@repo/ui';
import { Center } from '@repo/ui/primitives';
import { Suspense } from 'react';

function Fallback() {
  return (
    <Center className="flex-1">
      <BrandPulse accessibilityLabel="Loading form" />
    </Center>
  );
}

export default function PublicFormRoute() {
  return (
    <Suspense fallback={<Fallback />}>
      <PublicFormScreenWeb />
    </Suspense>
  );
}
