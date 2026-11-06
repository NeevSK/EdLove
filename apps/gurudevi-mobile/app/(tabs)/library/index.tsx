import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { UnbuiltPlace } from '@/components/navigation/UnbuiltPlace';

export { RouteErrorBoundary as ErrorBoundary };

export default function LibraryPlace() {
  return (
    <UnbuiltPlace
      title="The Library is being rebuilt"
      message="Books and resources will come back here."
    />
  );
}
