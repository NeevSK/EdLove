import { ProfileScreen } from '@repo/profile';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';

export default function ProfileRoute() {
  return (
    <ErrorBoundary name="Profile Route">
      <ProfileScreen />
    </ErrorBoundary>
  );
}
