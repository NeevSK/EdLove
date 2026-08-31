import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import DurableAgentsScreen from '../src/screens/DurableAgentsScreen';

export { RouteErrorBoundary as ErrorBoundary };

export default function DurableAgentsRoute() {
  return (
    <ErrorBoundary name="DurableAgentsScreen">
      <DurableAgentsScreen />
    </ErrorBoundary>
  );
}
