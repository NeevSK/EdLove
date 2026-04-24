import { createSupabaseFounderRepository } from '../../adapters/supabase/founderRepository';
import { createFounderServices } from '../../logic/domains/founder/services';
import { supabase } from '../supabase';

const founderRepository = createSupabaseFounderRepository(supabase);

export const founderServices = createFounderServices(founderRepository);
