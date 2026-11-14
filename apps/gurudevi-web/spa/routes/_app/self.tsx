import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { SelfFloor } from '../../../app/(sanctuary)/self/SelfFloor';
import { useSession } from '../../surface/session';

export const Route = createFileRoute('/_app/self')({
  head: () => ({ meta: [{ title: 'Self | Gurudevi Sanctuary' }] }),
  validateSearch: z.object({
    practice: z.enum(['breath', 'journal']).optional().catch(undefined),
  }),
  component: SelfScreen,
});

function SelfScreen() {
  const { accountId, displayName, primaryCapacity, surface } = useSession();
  const { practice } = Route.useSearch();
  return (
    <SelfFloor
      initialPracticing={surface === 'explore'}
      accountId={accountId}
      displayName={displayName}
      initialCapacity={primaryCapacity}
      practice={practice}
      key={accountId}
    />
  );
}
