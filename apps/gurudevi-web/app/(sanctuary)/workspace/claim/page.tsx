import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { SanctuaryShell } from '../../components/SanctuaryShell';
import { ClaimSpotFloor } from './ClaimSpotFloor';

export const metadata = { title: 'Claim My Student Spot | Gurudevi Sanctuary' };

export default async function WorkspaceClaimPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <SanctuaryShell displayName="Guest" navigationPrefix="">
        <ClaimSpotFloor mode="explore" />
      </SanctuaryShell>
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <SanctuaryShell displayName="Guest" navigationPrefix="">
        <ClaimSpotFloor mode="explore" />
      </SanctuaryShell>
    );
  }

  if (entry.kind === 'onboarding-required' || entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <SanctuaryShell displayName="Guest" navigationPrefix="">
        <ClaimSpotFloor mode="explore" />
      </SanctuaryShell>
    );
  }

  return (
    <SanctuaryShell displayName={entry.displayName} navigationPrefix="">
      <ClaimSpotFloor
        key={entry.accountId}
        mode="account"
        subjectId={entry.accountId}
        scope={{ bondId: entry.activeScope.bondId, entityId: entry.activeScope.entityId }}
      />
    </SanctuaryShell>
  );
}
