import { AnnouncementsScreen } from '@repo/community/announcements';
import { useAuthStore } from '@repo/core/store';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Box } from '@repo/ui/primitives';
import { useRouter } from 'expo-router';

export { RouteErrorBoundary as ErrorBoundary } from '@repo/ui/components/ErrorBoundary';

export default function AnnouncementsRoute() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  if (!user?.id) {
    return <BrandedErrorState title="Sign in to view announcements" />;
  }

  const schoolId = user.school_id ?? 'galaxy';

  return (
    <ScreenWrapper noTopInset scroll={false} className="bg-phase-canvas">
      <GlobalHeader
        title="Announcements"
        subtitle="School-wide resonance and broadcasts"
        onBack={() => router.back()}
      />
      <Box className="flex-1">
        <AnnouncementsScreen
          schoolId={schoolId}
          userId={user.id}
          isEmbedded={true}
        />
      </Box>
    </ScreenWrapper>
  );
}
