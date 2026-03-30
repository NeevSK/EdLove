import { createSupabaseWorkspaceLayoutRepository } from '../../adapters/supabase/workspaceLayoutRepository';
import { createWorkspaceLayoutServices } from './services';

const workspaceLayoutRepository = createSupabaseWorkspaceLayoutRepository();

export const workspaceLayoutServices = createWorkspaceLayoutServices(workspaceLayoutRepository);
