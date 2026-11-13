import { createFileRoute } from '@tanstack/react-router';
import { ClimateSensingFloor } from '../../../../app/(sanctuary)/workspace/climate/ClimateSensingFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/climate')({
  head: () => ({ meta: [{ title: 'Climate Pulse | Gurudevi Sanctuary' }] }),
  component: WorkspaceClimateScreen,
});

function WorkspaceClimateScreen() {
  const { capacity, displayName } = useSession();
  return <ClimateSensingFloor displayName={displayName} capacity={capacity} />;
}
