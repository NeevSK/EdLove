import { createSupabaseProfileRepository } from '../../adapters/supabase/profileRepository';
import { createProfileServices } from './services';

/**
 * Native Runtime for Profile Domain.
 * \uD83D\uDEE1\uFE0F This file ensures that ZenStack (which has Node.js-only dependencies like 'pg')
 * is NEVER imported or referenced when bundling for native platforms (Android/iOS).
 *
 * On mobile, we exclusively use Supabase for profile operations.
 */

const profileRepository = createSupabaseProfileRepository();

export const profileServices = createProfileServices(profileRepository);
