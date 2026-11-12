import { createFileRoute } from '@tanstack/react-router';
import { SelfFloor } from '../../../app/(sanctuary)/self/SelfFloor';
import { useSession } from '../../surface/session';

export const Route = createFileRoute('/_app/self')({
  component: SelfScreen,
});

function SelfScreen() {
  const { accountId, displayName, primaryCapacity, surface } = useSession();
  return (
    <SelfFloor
      initialPracticing={surface === 'explore'}
      accountId={accountId}
      displayName={displayName}
      initialCapacity={primaryCapacity}
      key={accountId}
    />
  );
}
