import { createSupabaseWorkspaceLayoutRepository } from '../../adapters/supabase/workspaceLayoutRepository';
import { createWorkspaceLayoutServices } from '../../logic/domains/workspaceLayout/services';
import { supabase } from '../supabase';

const workspaceLayoutRepository = createSupabaseWorkspaceLayoutRepository(supabase);

export const workspaceLayoutServices = createWorkspaceLayoutServices(workspaceLayoutRepository);
