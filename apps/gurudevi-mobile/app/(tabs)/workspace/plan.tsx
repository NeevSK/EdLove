import { PlanAndNoticesScreen } from '@repo/classroom/planBridge';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { useTrackActiveSubTab } from '@/hooks/useTrackActiveSubTab';

export { RouteErrorBoundary as ErrorBoundary };

export default function PlanRoute() {
  useTrackActiveSubTab({
    id: 'ws-plan',
    title: 'Plan & notices',
    route: '/workspace/plan',
    domain: 'workspace',
  });

  return <PlanAndNoticesScreen />;
}
