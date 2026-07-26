import { createSupabaseProfileRepository } from '@/adapters/supabase/profileRepository';
import {
  createZenStackProfileRepository,
  isZenStackProfileRepositoryAvailable,
} from '@/adapters/zenstack/profileRepository';
import { createProfileServices } from '@/logic/domains/profile/services';
import { media } from '@/logic/managers/factory';
import { useStore } from '@/store/useStore';

const profileRepository = isZenStackProfileRepositoryAvailable()
  ? createZenStackProfileRepository(() => {
      const user = useStore.getState().user;
      return {
        id: user?.id ?? null,
      };
    }, media.adapter)
  : createSupabaseProfileRepository();

export const profileServices = createProfileServices(profileRepository);
