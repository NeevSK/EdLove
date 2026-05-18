import { createSupabaseWorkspaceLayoutRepository } from '../../adapters/supabase/workspaceLayoutRepository';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../supabase';
import { createWorkspaceLayoutServices } from '../../logic/domains/workspaceLayout/services';

const workspaceLayoutRepository = createSupabaseWorkspaceLayoutRepository(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__);

export const workspaceLayoutServices = createWorkspaceLayoutServices(workspaceLayoutRepository);
