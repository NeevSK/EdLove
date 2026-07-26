import { createSupabasePrincipalWorkspaceRepository } from '@/adapters/supabase/principalWorkspaceRepository';
import { createPrincipalWorkspaceServices } from '@/logic/domains/principalWorkspace/services';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@/api/supabase';

const principalWorkspaceRepository = createSupabasePrincipalWorkspaceRepository(
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__,
);

export const principalWorkspaceServices = createPrincipalWorkspaceServices(
  principalWorkspaceRepository,
);
