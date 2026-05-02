import { createSupabasePrincipalWorkspaceRepository } from '../../adapters/supabase/principalWorkspaceRepository';
import { supabase } from '../supabase';
import { createPrincipalWorkspaceServices } from '../../logic/domains/principalWorkspace/services';

const principalWorkspaceRepository = createSupabasePrincipalWorkspaceRepository(supabase);

export const principalWorkspaceServices = createPrincipalWorkspaceServices(
  principalWorkspaceRepository,
);
