import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { LibraryRoom } from '@/components/rooms/library/LibraryRoom';

export { RouteErrorBoundary as ErrorBoundary };

export default function LibraryPlace() {
  return <LibraryRoom />;
}
