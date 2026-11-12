import { createFileRoute } from '@tanstack/react-router';
import { ClimateSensingFloor } from '../../../../app/(sanctuary)/workspace/climate/ClimateSensingFloor';
import { staff } from '../../../../lib/sanctuary/capacityAccess';
import { CapacityGate } from '../../../surface/CapacityGate';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/climate')({
  component: WorkspaceClimateScreen,
});

function WorkspaceClimateScreen() {
  const { capacity, displayName } = useSession();
  return (
    <CapacityGate
      allows={staff}
      detail="Classroom climate sensing and psychological pulse sensing are reserved for educators and administrators."
    >
      <ClimateSensingFloor displayName={displayName} capacity={capacity} />
    </CapacityGate>
  );
}
