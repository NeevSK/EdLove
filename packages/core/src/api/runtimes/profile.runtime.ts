import { createSupabaseProfileRepository } from '../../adapters/supabase/profileRepository';
import {
  createZenStackProfileRepository,
  isZenStackProfileRepositoryAvailable,
} from '../../adapters/zenstack/profileRepository';
import { createProfileServices } from '../../logic/domains/profile/services';
import { useStore } from '../../store/useStore';

const profileRepository = isZenStackProfileRepositoryAvailable()
  ? createZenStackProfileRepository(() => {
      const user = useStore.getState().user;
      return {
        id: user?.id ?? null,
      };
    })
  : createSupabaseProfileRepository();

export const profileServices = createProfileServices(profileRepository);
