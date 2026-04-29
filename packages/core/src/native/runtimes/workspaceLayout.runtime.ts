import { createSupabaseWorkspaceLayoutRepository } from '../../adapters/supabase/workspaceLayoutRepository';
import { createWorkspaceLayoutServices } from '../../logic/domains/workspaceLayout/services';
import { supabase } from '../../api/supabase';

const workspaceLayoutRepository = createSupabaseWorkspaceLayoutRepository(supabase);

export const workspaceLayoutServices = createWorkspaceLayoutServices(workspaceLayoutRepository);
