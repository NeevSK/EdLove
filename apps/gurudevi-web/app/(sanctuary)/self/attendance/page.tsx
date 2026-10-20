import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { SanctuaryShell } from '../../components/SanctuaryShell';
import { StudentAttendanceFloor } from './StudentAttendanceFloor';

export const metadata = { title: 'My Attendance & Learning Habits | Gurudevi Sanctuary' };

export default async function StudentAttendancePage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <SanctuaryShell displayName="Learner" navigationPrefix="">
        <StudentAttendanceFloor mode="explore" />
      </SanctuaryShell>
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <SanctuaryShell displayName="Learner" navigationPrefix="">
        <StudentAttendanceFloor mode="explore" />
      </SanctuaryShell>
    );
  }

  if (entry.kind === 'onboarding-required' || entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <SanctuaryShell displayName="Learner" navigationPrefix="">
        <StudentAttendanceFloor mode="explore" />
      </SanctuaryShell>
    );
  }

  return (
    <SanctuaryShell displayName={entry.displayName} navigationPrefix="">
      <StudentAttendanceFloor
        key={entry.accountId}
        mode="account"
        displayName={entry.displayName}
      />
    </SanctuaryShell>
  );
}
