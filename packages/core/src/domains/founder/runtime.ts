import { createSupabaseFounderRepository } from '../../adapters/supabase/founderRepository';
import { createFounderServices } from './services';

const founderRepository = createSupabaseFounderRepository();

export const founderServices = createFounderServices(founderRepository);
