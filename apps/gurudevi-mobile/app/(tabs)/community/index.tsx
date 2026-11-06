import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { UnbuiltPlace } from '@/components/navigation/UnbuiltPlace';

export { RouteErrorBoundary as ErrorBoundary };

export default function CommunityPlace() {
  return (
    <UnbuiltPlace
      title="Community is being rebuilt"
      message="Groups and conversations will come back here."
    />
  );
}
