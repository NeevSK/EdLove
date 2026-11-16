import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { LibraryFloor } from '@/components/library/LibraryFloor';

export { RouteErrorBoundary as ErrorBoundary };

export default function LibraryPlace() {
  return <LibraryFloor />;
}
