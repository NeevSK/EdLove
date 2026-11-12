import { createFileRoute } from '@tanstack/react-router';
import { SelfKitClient } from '../../../../app/(sanctuary)/kit/self/SelfKitClient';

export const Route = createFileRoute('/_dev/kit/self')({
  component: KitSelfScreen,
});

function KitSelfScreen() {
  return <SelfKitClient />;
}
