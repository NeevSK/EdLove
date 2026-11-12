import { createFileRoute } from '@tanstack/react-router';
import { ProfileFloor } from '../../../app/(sanctuary)/profile/ProfileFloor';
import { useSession } from '../../surface/session';

export const Route = createFileRoute('/profile/')({
  component: ProfileScreen,
});

function ProfileScreen() {
  const { surface, accountId, displayName, roleLabel } = useSession();
  return (
    <ProfileFloor
      accountId={accountId}
      displayName={displayName}
      primaryScopeRole={roleLabel}
      isExplore={surface === 'explore'}
    />
  );
}
