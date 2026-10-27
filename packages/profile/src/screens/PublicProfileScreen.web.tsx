/**
 * @deprecated Legacy React Native Web screen.
 * The canonical browser web interface is hosted in `apps/gurudevi-web`.
 * Preserved for historical test fixtures and migration parity per AGENTS.md Deletion Veto.
 */
import { useEntity } from '@repo/core/hooks';
import type { EntityType } from '@repo/core/logic';
import { useProfile } from '@repo/profile/hooks/useProfile';
import { BrandedEmptyState } from '@repo/ui/components/BrandedEmptyState';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import IdentityCard, { type IdentityData } from '@repo/ui/components/IdentityCard';
import { Box } from '@repo/ui/primitives';
import { useLocalSearchParams } from 'expo-router';

export default function PublicProfileScreenWeb() {
  const params = useLocalSearchParams<{ id?: string; type?: EntityType }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id || '';
  const type = (Array.isArray(params.type) ? params.type[0] : params.type) || 'user';

  const {
    profile,
    loading: isProfileLoading,
    error: profileError,
  } = useProfile(type === 'user' ? id : undefined);
  const { instance, isLoading, error } = useEntity(type as EntityType, id);

  if (type === 'user') {
    if (isProfileLoading) {
      return (
        <Box className="h-screen items-center justify-center">
          <BrandPulse accessibilityLabel="Loading public profile" />
        </Box>
      );
    }

    if (profileError) {
      return <BrandedErrorState title="Public profile unavailable" message={profileError} />;
    }

    if (!profile) {
      return (
        <BrandedEmptyState
          title="Profile not available"
          message="There is no public profile to show."
        />
      );
    }

    return (
      <Box className="max-w-[1200px] mx-auto p-6">
        <IdentityCard data={profile as unknown as IdentityData} />
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box className="h-screen items-center justify-center">
        <BrandPulse accessibilityLabel="Loading public profile" />
      </Box>
    );
  }

  if (error) {
    return <BrandedErrorState title="Public profile unavailable" message={String(error)} />;
  }

  if (!instance) {
    return (
      <BrandedEmptyState
        title="Profile not available"
        message="There is no public profile to show."
      />
    );
  }

  return (
    <Box className="max-w-[1200px] mx-auto p-6">
      <IdentityCard data={instance as unknown as IdentityData} />
    </Box>
  );
}
