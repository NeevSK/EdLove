import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';

export { RouteErrorBoundary as ErrorBoundary };

export default function IndexRoute() {
  // SessionRouteGate owns the root decision once bootstrap has authority.
  // Rendering nothing here avoids racing that decision with Expo Router's
  // initial stack commit.
  return null;
}
