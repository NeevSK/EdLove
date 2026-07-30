import { createSupabaseWorkspaceLayoutRepository } from '@repo/core/adapters/supabase/workspaceLayoutRepository';
import { createWorkspaceLayoutServices } from '@repo/core/logic/domains/workspaceLayout/services';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@repo/core/api/supabase';

const workspaceLayoutRepository = createSupabaseWorkspaceLayoutRepository(
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__,
);

export const workspaceLayoutServices = createWorkspaceLayoutServices(workspaceLayoutRepository);
