import { useStore } from '@repo/core/logic';

import { createSupabaseProfileRepository } from '../../adapters/supabase/profileRepository';
import {
  createZenStackProfileRepository,
  isZenStackProfileRepositoryAvailable,
} from '../../adapters/zenstack/profileRepository';
import { createProfileServices } from './services';

const profileRepository = isZenStackProfileRepositoryAvailable()
  ? createZenStackProfileRepository(() => {
      const user = useStore.getState().user as any;
      return {
        id: user?.id ?? null,
        authority: user?.authority ?? user?.role ?? null,
      };
    })
  : createSupabaseProfileRepository();

export const profileServices = createProfileServices(profileRepository);
