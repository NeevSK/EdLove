import { createSupabaseWorkspaceLayoutRepository } from '../../adapters/supabase/workspaceLayoutRepository';
import { supabase } from '../supabase';
import { createWorkspaceLayoutServices } from '../../logic/domains/workspaceLayout/services';

const workspaceLayoutRepository = createSupabaseWorkspaceLayoutRepository(supabase);

export const workspaceLayoutServices = createWorkspaceLayoutServices(workspaceLayoutRepository);
