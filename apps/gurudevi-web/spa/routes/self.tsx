import { createFileRoute } from '@tanstack/react-router';
import { SelfFloor } from '../../app/(sanctuary)/self/SelfFloor';
import { useSession } from '../surface/session';

export const Route = createFileRoute('/self')({
  component: SelfScreen,
});

function SelfScreen() {
  const { accountId, displayName } = useSession();
  return <SelfFloor accountId={accountId} displayName={displayName} initialPracticing={true} />;
}
