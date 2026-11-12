import { createFileRoute } from '@tanstack/react-router';
import { GroupChatFloor } from '../../../../../app/(sanctuary)/community/chat/[groupId]/GroupChatFloor';
import { useSession } from '../../../../surface/session';

export const Route = createFileRoute('/_app/community/chat/$groupId')({
  component: CommunityChatGroupIdScreen,
});

function CommunityChatGroupIdScreen() {
  const { groupId } = Route.useParams();
  const { capacity, displayName } = useSession();
  return <GroupChatFloor groupId={groupId} displayName={displayName} capacity={capacity} />;
}
