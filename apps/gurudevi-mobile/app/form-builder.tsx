import { FormBuilderScreen } from '@repo/form-builder';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';

export { RouteErrorBoundary as ErrorBoundary };

export default function FormBuilderRoute() {
  return (
    <ErrorBoundary name="FormBuilderRoute">
      <FormBuilderScreen />
    </ErrorBoundary>
  );
}
