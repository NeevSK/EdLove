import type { Metadata } from 'next';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { AtlasFloor } from './AtlasFloor';
import type { ScreenRole } from './atlasData';

export const metadata: Metadata = {
  title: 'Functional Screen Atlas | Gurudevi Sanctuary',
  description: 'Role and capacity based functional directory of all available school screens across Web and Mobile.',
};

export default async function AtlasPage({
  searchParams,
}: {
  searchParams?: Promise<{ role?: string }>;
}) {
  const params = await searchParams;
  const initialRole = (params?.role as ScreenRole) || 'all';

  return (
    <SanctuaryShell
      displayName="Guest Explorer"
      navigationPrefix=""
      showAccountNavigation={true}
      isExploreMode={true}
    >
      <AtlasFloor initialRole={initialRole} />
    </SanctuaryShell>
  );
}

