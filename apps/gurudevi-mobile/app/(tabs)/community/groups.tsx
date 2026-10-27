import { GroupsScreen } from '@repo/community/groups';
import { useAuthStore } from '@repo/core/store';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Box } from '@repo/ui/primitives';
import { useRouter } from 'expo-router';

export { RouteErrorBoundary as ErrorBoundary } from '@repo/ui/components/ErrorBoundary';

export default function GroupsRoute() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  return (
    <ScreenWrapper noTopInset scroll={false} className="bg-phase-canvas">
      <GlobalHeader
        title="Circles"
        subtitle="Discover sanctuaries and peer groups"
        onBack={() => router.back()}
      />
      <Box className="flex-1">
        <GroupsScreen
          userId={user?.id}
          schoolId={user?.school_id ?? undefined}
          onNavigateToGroup={(groupId) => router.push(`/community/groups/${groupId}` as any)}
        />
      </Box>
    </ScreenWrapper>
  );
}
