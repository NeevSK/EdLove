import { useTrackActiveSubTab } from '@/hooks/useTrackActiveSubTab';
import GuardianCommunicationBridgeScreen from '@repo/admin/screens/guardian/GuardianCommunicationBridgeScreen';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';

export { RouteErrorBoundary as ErrorBoundary };

export default function GuardianBridgeRoute() {
  useTrackActiveSubTab({
    id: 'ws-guardian-bridge',
    title: 'Bridge',
    route: '/workspace/guardian/bridge',
    domain: 'workspace',
  });

  return <GuardianCommunicationBridgeScreen />;
}
