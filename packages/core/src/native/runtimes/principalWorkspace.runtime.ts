import { createSupabasePrincipalWorkspaceRepository } from '../../adapters/supabase/principalWorkspaceRepository';
import { createPrincipalWorkspaceServices } from '../../logic/domains/principalWorkspace/services';
import { supabase } from '../../api/supabase';

const principalWorkspaceRepository = createSupabasePrincipalWorkspaceRepository(supabase);

export const principalWorkspaceServices = createPrincipalWorkspaceServices(
  principalWorkspaceRepository,
);
