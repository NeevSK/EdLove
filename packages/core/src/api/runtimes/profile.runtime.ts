import { createSupabaseProfileRepository } from '@repo/core/adapters/supabase/profileRepository';
import {
  createZenStackProfileRepository,
  isZenStackProfileRepositoryAvailable,
} from '@repo/core/adapters/zenstack/profileRepository';
import { createProfileServices } from '@repo/core/logic/domains/profile/services';
import { media } from '@repo/core/logic/managers/factory';
import { useStore } from '@repo/core/store/useStore';

const profileRepository = isZenStackProfileRepositoryAvailable()
  ? createZenStackProfileRepository(() => {
      const user = useStore.getState().user;
      return {
        id: user?.id ?? null,
      };
    }, media.adapter)
  : createSupabaseProfileRepository();

export const profileServices = createProfileServices(profileRepository);
