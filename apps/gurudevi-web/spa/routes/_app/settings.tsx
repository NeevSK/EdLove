import { createFileRoute } from '@tanstack/react-router';
import { SettingsFloor } from '../../../app/(sanctuary)/settings/SettingsFloor';
import { useSession } from '../../surface/session';

export const Route = createFileRoute('/_app/settings')({
  head: () => ({ meta: [{ title: 'Settings | Gurudevi Sanctuary' }] }),
  component: SettingsScreen,
});

function SettingsScreen() {
  const { accountId, capacity, displayName, surface } = useSession();
  return (
    <SettingsFloor
      isExplore={surface === 'explore'}
      accountId={accountId}
      displayName={displayName}
      capacity={capacity}
    />
  );
}
