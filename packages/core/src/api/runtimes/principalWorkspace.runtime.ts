import { createSupabasePrincipalWorkspaceRepository } from '@repo/core/adapters/supabase/principalWorkspaceRepository';
import { createPrincipalWorkspaceServices } from '@repo/core/logic/domains/principalWorkspace/services';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@repo/core/api/supabase';

const principalWorkspaceRepository = createSupabasePrincipalWorkspaceRepository(
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__,
);

export const principalWorkspaceServices = createPrincipalWorkspaceServices(
  principalWorkspaceRepository,
);
