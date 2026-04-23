import { createSupabasePrincipalWorkspaceRepository } from '../../adapters/supabase/principalWorkspaceRepository';
import { createPrincipalWorkspaceServices } from '../../logic/domains/principalWorkspace/services';
import { supabase } from '../supabase';

const principalWorkspaceRepository = createSupabasePrincipalWorkspaceRepository(supabase);

export const principalWorkspaceServices = createPrincipalWorkspaceServices(
  principalWorkspaceRepository,
);
