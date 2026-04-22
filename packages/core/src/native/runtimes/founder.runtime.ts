import { createSupabaseFounderRepository } from '../../adapters/supabase/founderRepository';
import { createFounderServices } from '../../logic/domains/founder/services';

const founderRepository = createSupabaseFounderRepository();

export const founderServices = createFounderServices(founderRepository);
