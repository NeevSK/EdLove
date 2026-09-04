import { createSupabasePrincipalWorkspaceRepository } from '@repo/core/adapters/supabase/principalWorkspaceRepository';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { createPrincipalWorkspaceServices } from '@repo/core/logic/domains/principalWorkspace/services';

const principalWorkspaceRepository = createSupabasePrincipalWorkspaceRepository(supabaseClient);

export const principalWorkspaceServices = createPrincipalWorkspaceServices(
  principalWorkspaceRepository,
);
