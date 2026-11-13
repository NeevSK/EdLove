import { forAudience } from '../../../surface/audience';
import { createFileRoute } from '@tanstack/react-router';
import { ClimateSensingFloor } from '../../../../app/(sanctuary)/workspace/climate/ClimateSensingFloor';
import { staff } from '../../../../lib/sanctuary/capacityAccess';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/climate')({
  ...forAudience(
    staff,
    'Classroom climate sensing and psychological pulse sensing are reserved for educators and administrators.',
  ),
  component: WorkspaceClimateScreen,
});

function WorkspaceClimateScreen() {
  const { capacity, displayName } = useSession();
  return <ClimateSensingFloor displayName={displayName} capacity={capacity} />;
}
