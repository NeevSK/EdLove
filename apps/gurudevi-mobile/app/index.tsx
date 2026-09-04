import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Redirect } from 'expo-router';

export { RouteErrorBoundary as ErrorBoundary };

export default function IndexRoute() {
  return <Redirect href="/welcome" />;
}
