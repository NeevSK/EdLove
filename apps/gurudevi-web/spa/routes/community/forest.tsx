import { createFileRoute } from '@tanstack/react-router';
import { SchoolForestFloor } from '../../../app/(sanctuary)/community/forest/SchoolForestFloor';
import { useSession } from '../../surface/session';

export const Route = createFileRoute('/community/forest')({
  component: CommunityForestScreen,
});

function CommunityForestScreen() {
  const { displayName } = useSession();
  return <SchoolForestFloor displayName={displayName} />;
}
