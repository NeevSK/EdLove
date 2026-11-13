import { forAudience } from '../../../surface/audience';
import { createFileRoute } from '@tanstack/react-router';
import { TuitionFloor } from '../../../../app/(sanctuary)/workspace/tuition/TuitionFloor';
import { leadershipOrGuardian } from '../../../../lib/sanctuary/capacityAccess';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/tuition')({
  ...forAudience(
    leadershipOrGuardian,
    'Tuition and institutional fee ledgers are restricted to school leadership and verified guardians.',
  ),
  component: WorkspaceTuitionScreen,
});

function WorkspaceTuitionScreen() {
  const { capacity, displayName } = useSession();
  return <TuitionFloor displayName={displayName} capacity={capacity} />;
}
