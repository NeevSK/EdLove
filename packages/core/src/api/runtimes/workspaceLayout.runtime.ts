import { createSupabaseWorkspaceLayoutRepository } from '@repo/core/adapters/supabase/workspaceLayoutRepository';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { createWorkspaceLayoutServices } from '@repo/core/logic/domains/workspaceLayout/services';

const workspaceLayoutRepository = createSupabaseWorkspaceLayoutRepository(supabaseClient);

export const workspaceLayoutServices = createWorkspaceLayoutServices(workspaceLayoutRepository);
