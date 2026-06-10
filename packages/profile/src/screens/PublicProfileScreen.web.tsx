import { useEntity } from '@repo/core/hooks';
import type { EntityType } from '@repo/core/logic';
import { useLocalSearchParams } from 'expo-router';
import IdentityCard, { type IdentityData } from '@repo/ui/components/IdentityCard';
import { Box, Center, Spinner } from '@repo/ui/primitives';
import { useProfile } from '../hooks/useProfile';

export default function PublicProfileScreenWeb() {
  const params = useLocalSearchParams<{ id?: string; type?: EntityType }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id || '';
  const type = (Array.isArray(params.type) ? params.type[0] : params.type) || 'user';

  const { profile, loading: isProfileLoading } = useProfile(type === 'user' ? id : undefined);
  const { instance, isLoading, error } = useEntity(type as EntityType, id);

  if (type === 'user') {
    if (isProfileLoading) {
      return (
        <Center className="h-screen">
          <Spinner size="large" />
        </Center>
      );
    }

    if (!profile) {
      return (
        <Box className="p-10 text-center text-text-tertiary">
          Profile Not Found or Error Loading
        </Box>
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
      <Center className="h-screen">
        <Spinner size="large" />
      </Center>
    );
  }

  if (error || !instance) {
    return (
      <Box className="p-10 text-center text-text-tertiary">Profile Not Found or Error Loading</Box>
    );
  }

  return (
    <Box className="max-w-[1200px] mx-auto p-6">
      <IdentityCard data={instance as unknown as IdentityData} />
    </Box>
  );
}
