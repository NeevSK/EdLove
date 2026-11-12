import { createFileRoute } from '@tanstack/react-router';
import { SettingsFloor } from '../../app/(sanctuary)/settings/SettingsFloor';
import { useSession } from '../surface/session';

export const Route = createFileRoute('/settings')({
  component: SettingsScreen,
});

function SettingsScreen() {
  const { surface, displayName } = useSession();
  return <SettingsFloor displayName={displayName} isExplore={surface === 'explore'} />;
}
