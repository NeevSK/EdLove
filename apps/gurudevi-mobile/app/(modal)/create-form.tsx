import { FormBuilderScreen } from '@repo/form-builder';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';

export { RouteErrorBoundary as ErrorBoundary };

export default function CreateFormModalRoute() {
  return (
    <ErrorBoundary name="CreateFormModalRoute">
      <FormBuilderScreen />
    </ErrorBoundary>
  );
}
