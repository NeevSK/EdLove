import { createFileRoute } from '@tanstack/react-router';
import { SelfKitClient } from '../../../../app/(sanctuary)/kit/self/SelfKitClient';

export const Route = createFileRoute('/_dev/kit/self')({
  head: () => ({ meta: [{ title: 'Self Floor Reorganization & Progressive Disclosure Showcase | Gurudevi Dev' }] }),
  component: KitSelfScreen,
});

function KitSelfScreen() {
  return <SelfKitClient />;
}
