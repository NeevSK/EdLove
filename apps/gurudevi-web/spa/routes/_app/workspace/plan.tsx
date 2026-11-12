import { createFileRoute } from '@tanstack/react-router';
import { PlanFloor } from '../../../../app/(sanctuary)/workspace/plan/PlanFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/plan')({
  component: WorkspacePlanScreen,
});

function WorkspacePlanScreen() {
  const { capacity, displayName } = useSession();
  return <PlanFloor initialCapacity={capacity} displayName={displayName} />;
}
