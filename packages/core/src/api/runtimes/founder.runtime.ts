import { createSupabaseFounderRepository } from '../../adapters/supabase/founderRepository';
import { supabase } from '../supabase';
import { createFounderServices } from '../../logic/domains/founder/services';

const founderRepository = createSupabaseFounderRepository(supabase);

export const founderServices = createFounderServices(founderRepository);
