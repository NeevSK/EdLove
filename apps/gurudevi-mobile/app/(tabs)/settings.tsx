import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { AppSettingsScreen } from '@repo/ui/screens';

export { RouteErrorBoundary as ErrorBoundary };

export default function SettingsRoute() {
  return (
    <ErrorBoundary name="SettingsScreen">
      <AppSettingsScreen />
    </ErrorBoundary>
  );
}
