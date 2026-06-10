import { SelfScreen } from '@repo/self';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';

export default function SelfRoute() {
  return (
    <ErrorBoundary name="Self Route">
      <SelfScreen />
    </ErrorBoundary>
  );
}
