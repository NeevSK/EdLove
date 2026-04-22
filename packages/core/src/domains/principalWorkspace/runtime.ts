import { createSupabasePrincipalWorkspaceRepository } from '../../adapters/supabase/principalWorkspaceRepository';
import { createPrincipalWorkspaceServices } from './services';

const principalWorkspaceRepository = createSupabasePrincipalWorkspaceRepository();

export const principalWorkspaceServices = createPrincipalWorkspaceServices(
  principalWorkspaceRepository,
);
