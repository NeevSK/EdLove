import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';

export { RouteErrorBoundary as ErrorBoundary };

export default function IndexRoute() {
  // SessionRouteGate owns root resolution so a verified returning account can
  // enter the app while every other launch resolves to the public step zero.
  return null;
}
