import { createFileRoute } from '@tanstack/react-router';
import { GroupChatFloor } from '../../../../app/(sanctuary)/community/chat/[groupId]/GroupChatFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/community/chat/$groupId')({
  component: CommunityChatGroupidScreen,
});

function CommunityChatGroupidScreen() {
  const { groupId } = Route.useParams();
  const { displayName, capacity } = useSession();
  return <GroupChatFloor groupId={groupId} displayName={displayName} capacity={capacity} />;
}
