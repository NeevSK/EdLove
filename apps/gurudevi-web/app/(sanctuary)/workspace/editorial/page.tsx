import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { SanctuaryShell } from '../../components/SanctuaryShell';
import { EditorialCommonsFloor } from './EditorialCommonsFloor';
import { EditorialFloor } from './EditorialFloor';

export const metadata = { title: 'Editorial Commons | Gurudevi Sanctuary' };

export default async function WorkspaceEditorialPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<{ view?: string }>;
}>) {
  const params = await searchParams;
  const viewMode = params?.view;
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <SanctuaryShell displayName="Guest" navigationPrefix="">
        <EditorialCommonsFloor mode="explore" />
      </SanctuaryShell>
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (
    entry.kind === 'signed-out' ||
    entry.kind === 'onboarding-required' ||
    entry.kind === 'inactive' ||
    entry.kind === 'unavailable'
  ) {
    return (
      <SanctuaryShell displayName="Guest" navigationPrefix="">
        <EditorialCommonsFloor mode="explore" />
      </SanctuaryShell>
    );
  }

  if (viewMode === 'commons') {
    return (
      <SanctuaryShell displayName={entry.displayName} navigationPrefix="">
        <EditorialCommonsFloor
          key={entry.accountId}
          mode="account"
          subjectId={entry.accountId}
        />
      </SanctuaryShell>
    );
  }

  return (
    <SanctuaryShell displayName={entry.displayName} navigationPrefix="">
      <EditorialFloor
        key={entry.accountId}
        authorName={entry.displayName}
        schoolId={entry.accountId}
        isFaculty={true}
      />
    </SanctuaryShell>
  );
}

