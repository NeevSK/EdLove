import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { AtlasFloor } from '../../../app/(sanctuary)/atlas/AtlasFloor';
import { SCREEN_ROLE_IDS } from '../../../app/(sanctuary)/atlas/atlasData';

export const Route = createFileRoute('/_app/atlas')({
  head: () => ({ meta: [{ title: 'Functional Screen Atlas | Gurudevi Sanctuary' }] }),
  validateSearch: z.object({ role: z.enum(SCREEN_ROLE_IDS).optional().catch(undefined) }),
  component: AtlasScreen,
});

function AtlasScreen() {
  const { role } = Route.useSearch();
  return <AtlasFloor initialRole={role ?? 'all'} />;
}
