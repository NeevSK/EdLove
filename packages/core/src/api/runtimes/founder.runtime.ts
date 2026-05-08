import { createSupabaseFounderRepository } from '../../adapters/supabase/founderRepository';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../supabase';
import { createFounderServices } from '../../logic/domains/founder/services';

const founderRepository = createSupabaseFounderRepository(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__);

export const founderServices = createFounderServices(founderRepository);
