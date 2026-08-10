import { createSupabasePrincipalWorkspaceRepository } from '@repo/core/adapters/supabase/principalWorkspaceRepository';
import { createPrincipalWorkspaceServices } from '@repo/core/logic/domains/principalWorkspace/services';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';

const principalWorkspaceRepository = createSupabasePrincipalWorkspaceRepository(
  supabaseClient,
);

export const principalWorkspaceServices = createPrincipalWorkspaceServices(
  principalWorkspaceRepository,
);
