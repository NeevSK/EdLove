import { type RouteProp, useRoute } from '@react-navigation/native';
import { useEntity } from '@repo/core/hooks';
import type { EntityType } from '@repo/core/logic';
import IdentityCard, { type IdentityData } from '@repo/ui/components/IdentityCard';
import { Box, Center, Spinner } from '@repo/ui/primitives';
import { useProfile } from '../hooks/useProfile';

type PublicProfileRouteProp = RouteProp<
  { PublicProfile: { id: string; type: EntityType } },
  'PublicProfile'
>;

export default function PublicProfileScreenWeb() {
  const route = useRoute<PublicProfileRouteProp>();
  const { id, type } = route.params || {};

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

  // Fallback for other entity types if needed, or structured entity view
  return (
    <Box className="max-w-[1200px] mx-auto p-6">
      <IdentityCard data={instance as unknown as IdentityData} />
    </Box>
  );
}
