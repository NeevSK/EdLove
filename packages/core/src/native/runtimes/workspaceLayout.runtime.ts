import { createSupabaseWorkspaceLayoutRepository } from '../../adapters/supabase/workspaceLayoutRepository';
import { createWorkspaceLayoutServices } from '../../logic/domains/workspaceLayout/services';

const workspaceLayoutRepository = createSupabaseWorkspaceLayoutRepository();

export const workspaceLayoutServices = createWorkspaceLayoutServices(workspaceLayoutRepository);
