import PublicFormScreenWeb from '@repo/form-builder/src/screens/PublicFormScreen.web';
import { Center, Spinner } from '@repo/ui/primitives';
import { Suspense } from 'react';

function Fallback() {
  return (
    <Center className="flex-1">
      <Spinner />
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
