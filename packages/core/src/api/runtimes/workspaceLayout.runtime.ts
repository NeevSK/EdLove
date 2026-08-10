import { createSupabaseWorkspaceLayoutRepository } from '@repo/core/adapters/supabase/workspaceLayoutRepository';
import { createWorkspaceLayoutServices } from '@repo/core/logic/domains/workspaceLayout/services';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';

const workspaceLayoutRepository = createSupabaseWorkspaceLayoutRepository(
  supabaseClient,
);

export const workspaceLayoutServices = createWorkspaceLayoutServices(workspaceLayoutRepository);
