import { createSupabasePrincipalWorkspaceRepository } from '../../adapters/supabase/principalWorkspaceRepository';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../supabase';
import { createPrincipalWorkspaceServices } from '../../logic/domains/principalWorkspace/services';

const principalWorkspaceRepository = createSupabasePrincipalWorkspaceRepository(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__);

export const principalWorkspaceServices = createPrincipalWorkspaceServices(
  principalWorkspaceRepository,
);
