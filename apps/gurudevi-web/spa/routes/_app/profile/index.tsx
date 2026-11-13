import { createFileRoute } from '@tanstack/react-router';
import { ProfileFloor } from '../../../../app/(sanctuary)/profile/ProfileFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/profile/')({
  head: () => ({ meta: [{ title: 'Profile | Gurudevi Sanctuary' }] }),
  // Hovering a link to Profile already asks where the account's deletion request stands.
  loader: ({ context }) => context.queryClient.ensureQueryData(context.sources.accountDeletion()),
  component: ProfileScreen,
});

function ProfileScreen() {
  const { accountId, displayName, roleLabel, surface } = useSession();
  return (
    <ProfileFloor
      isExplore={surface === 'explore'}
      accountId={accountId}
      displayName={displayName}
      primaryScopeRole={roleLabel}
    />
  );
}
