import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { NotificationsScreen } from '@repo/ui/screens';

export { RouteErrorBoundary as ErrorBoundary };

export default function NotificationsRoute() {
  return (
    <ErrorBoundary name="NotificationsScreen">
      <NotificationsScreen />
    </ErrorBoundary>
  );
}
