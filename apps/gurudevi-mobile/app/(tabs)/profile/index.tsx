import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { UnbuiltPlace } from '@/components/navigation/UnbuiltPlace';

export { RouteErrorBoundary as ErrorBoundary };

export default function ProfilePlace() {
  return (
    <UnbuiltPlace
      title="Your profile is being rebuilt"
      message="Your record and settings will come back here."
    />
  );
}
