import { createSupabaseWorkspaceLayoutRepository } from '@/adapters/supabase/workspaceLayoutRepository';
import { createWorkspaceLayoutServices } from '@/logic/domains/workspaceLayout/services';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@/api/supabase';

const workspaceLayoutRepository = createSupabaseWorkspaceLayoutRepository(
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__,
);

export const workspaceLayoutServices = createWorkspaceLayoutServices(workspaceLayoutRepository);
