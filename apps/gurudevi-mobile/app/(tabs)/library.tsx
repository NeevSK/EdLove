import { LibraryScreen } from '@repo/library';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';

export default function LibraryRoute() {
  return (
    <ErrorBoundary name="Library Route">
      <LibraryScreen />
    </ErrorBoundary>
  );
}
