import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { CommunityRoom } from '@/components/rooms/community/CommunityRoom';

export { RouteErrorBoundary as ErrorBoundary };

export default function CommunityPlace() {
  return <CommunityRoom />;
}
