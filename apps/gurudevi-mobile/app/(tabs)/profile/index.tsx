import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ProfileRoom } from '@/components/rooms/profile/ProfileRoom';

export { RouteErrorBoundary as ErrorBoundary };

export default function ProfilePlace() {
  return <ProfileRoom />;
}
