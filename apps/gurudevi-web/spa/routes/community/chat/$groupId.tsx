import { createFileRoute } from '@tanstack/react-router';
import { GroupChatFloor } from '../../../../app/(sanctuary)/community/chat/[groupId]/GroupChatFloor';
import { SanctuaryShell } from '../../../../app/(sanctuary)/components/SanctuaryShell';

export const Route = createFileRoute('/community/chat/$groupId')({
  component: ExploreRoute,
});

function ExploreRoute() {
  const { groupId } = Route.useParams();
  return (
    <SanctuaryShell
      displayName="Guest Explorer"
      navigationPrefix=""
      showAccountNavigation={true}
      isExploreMode={true}
    >
      <GroupChatFloor groupId={groupId} displayName="Guest Explorer" capacity="guest" />
    </SanctuaryShell>
  );
}
