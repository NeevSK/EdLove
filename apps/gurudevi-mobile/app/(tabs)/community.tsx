import { CommunityScreen } from '@repo/community';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';

export default function CommunityRoute() {
  return (
    <ErrorBoundary name="Community Route">
      <CommunityScreen />
    </ErrorBoundary>
  );
}
