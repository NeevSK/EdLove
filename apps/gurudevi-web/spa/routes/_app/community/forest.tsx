import { createFileRoute } from '@tanstack/react-router';
import { SchoolForestFloor } from '../../../../app/(sanctuary)/community/forest/SchoolForestFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/community/forest')({
  head: () => ({ meta: [{ title: 'School Forest | Gurudevi Sanctuary' }] }),
  component: CommunityForestScreen,
});

function CommunityForestScreen() {
  const { displayName } = useSession();
  return <SchoolForestFloor displayName={displayName} />;
}
