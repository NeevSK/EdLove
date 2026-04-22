import { createSupabasePrincipalWorkspaceRepository } from '../../adapters/supabase/principalWorkspaceRepository';
import { createPrincipalWorkspaceServices } from '../../logic/domains/principalWorkspace/services';

const principalWorkspaceRepository = createSupabasePrincipalWorkspaceRepository();

export const principalWorkspaceServices = createPrincipalWorkspaceServices(
  principalWorkspaceRepository,
);
