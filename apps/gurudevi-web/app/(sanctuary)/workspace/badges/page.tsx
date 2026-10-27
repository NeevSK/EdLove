import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { SanctuaryShell } from '../../components/SanctuaryShell';
import { BadgeSheetFloor } from './BadgeSheetFloor';

export const metadata = { title: 'Print Student Badges & QR Passes | Gurudevi Sanctuary' };

export default async function WorkspaceBadgesPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <SanctuaryShell displayName="Guest" navigationPrefix="">
        <BadgeSheetFloor mode="explore" />
      </SanctuaryShell>
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <SanctuaryShell displayName="Guest" navigationPrefix="">
        <BadgeSheetFloor mode="explore" />
      </SanctuaryShell>
    );
  }

  if (entry.kind === 'onboarding-required' || entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <SanctuaryShell displayName="Guest" navigationPrefix="">
        <BadgeSheetFloor mode="explore" />
      </SanctuaryShell>
    );
  }

  const isStaffOrLeader =
    entry.activeCapacity === 'teacher' ||
    entry.activeCapacity === 'principal' ||
    entry.activeCapacity === 'assistantPrincipal' ||
    entry.activeCapacity === 'gradeHead' ||
    entry.activeCapacity === 'sectionHead' ||
    entry.activeCapacity === 'admin' ||
    entry.activeCapacity === 'founder' ||
    entry.activeCapacity === 'developer' ||
    (entry.activeScope?.roles?.some((r) => ['teacher', 'principal', 'admin', 'founder'].includes(r)) ?? false);

  if (!isStaffOrLeader) {
    return (
      <SanctuaryShell displayName={entry.displayName} navigationPrefix="">
        <main id="main-content" className="sanctuary-container">
          <section aria-live="polite" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <p style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: '#9d5b25', fontWeight: 700 }}>
              Classroom Badges
            </p>
            <h1 style={{ fontFamily: 'Georgia, serif', margin: '0.5rem 0 1rem' }}>Access restricted</h1>
            <p style={{ color: '#71695f', maxWidth: '32rem', margin: '0 auto' }}>
              Batch credential card and QR badge printing is reserved for educators and administrators.
            </p>
          </section>
        </main>
      </SanctuaryShell>
    );
  }

  return (
    <SanctuaryShell displayName={entry.displayName} navigationPrefix="">
      <BadgeSheetFloor
        key={entry.accountId}
        mode="account"
        subjectId={entry.accountId}
        scope={{ bondId: entry.activeScope.bondId, entityId: entry.activeScope.entityId }}
      />
    </SanctuaryShell>
  );
}
