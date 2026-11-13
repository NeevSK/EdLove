import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { CommunityFeedFloor } from '../../../../app/(sanctuary)/community/CommunityFeedFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/community/')({
  head: () => ({ meta: [{ title: 'Community | Gurudevi Sanctuary' }] }),
  validateSearch: z.object({
    inviteCode: z.string().optional(),
    pillar: z.enum(['feed', 'groups', 'messages']).optional().catch(undefined),
    dm: z.string().optional(),
    incognito: z.literal('true').optional().catch(undefined),
    mode: z.literal('incognito').optional().catch(undefined),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(context.sources.communityGroups()),
  component: CommunityScreen,
});

function CommunityScreen() {
  const { sources } = Route.useRouteContext();
  const { data } = useSuspenseQuery(sources.communityGroups());
  const { accountId, primaryCapacity, surface } = useSession();
  const { inviteCode, pillar, dm, incognito, mode } = Route.useSearch();
  return (
    <CommunityFeedFloor
      key={accountId}
      accountId={accountId}
      primaryCapacity={primaryCapacity}
      mode={surface === 'explore' ? 'explore' : 'account'}
      result={data}
      inviteCode={inviteCode}
      initialPillar={pillar}
      initialConversationId={dm}
      initialIncognito={incognito === 'true' || mode === 'incognito'}
    />
  );
}
