import { supabase } from '../lib/supabase';
import { APIError } from './types';

// In-memory cache for the current session's internal user ID
let cachedInternalId: string | null = null;

export const identityAPI = {
    /**
     * Resolves the internal user ID from a provider and provider-specific user ID.
     */
    async resolveInternalId(provider: string, providerUserId: string): Promise<string | null> {
        // Only return from cache if we are explicitly asking for the current Supabase session
        if (provider === 'supabase' && cachedInternalId) {
            return cachedInternalId;
        }

        const { data, error } = await supabase
            .from('auth_identities')
            .select('user_id')
            .eq('provider', provider)
            .eq('provider_user_id', providerUserId)
            .maybeSingle();

        if (error) {
            throw new APIError('Failed to resolve identity', error.code, error);
        }

        const resolvedId = data?.user_id ?? null;

        if (provider === 'supabase' && resolvedId) {
            cachedInternalId = resolvedId;
        }

        return resolvedId;
    },

    /**
     * Links an authentication identity to an existing internal user.
     */
    async linkIdentity(userId: string, provider: string, providerUserId: string) {
        const { error } = await supabase
            .from('auth_identities')
            .upsert({
                user_id: userId,
                provider,
                provider_user_id: providerUserId,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'provider,provider_user_id'
            });

        if (error) {
            throw new APIError('Failed to link identity', error.code, error);
        }

        // Cache the newly linked ID if it's for the current supabase session
        if (provider === 'supabase') {
            cachedInternalId = userId;
        }
    },

    /**
     * Resolves the current logged-in user's internal ID.
     * This is the ONLY place in the codebase that legitimately calls supabase.auth.getUser()
     * to extract user.id — solely to look it up in auth_identities and return the
     * internal users.id. All other code must call this method, never auth.getUser() directly.
     */
    async getMyInternalId(): Promise<string | null> {
        // auth.getUser() is the bootstrap step — we extract the Supabase auth UID
        // and immediately resolve it to the internal users.id via auth_identities.
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (!user) {
            cachedInternalId = null;
            return null;
        }
        const authUid = user.id;

        // If we have a cached ID but it was for a different Supabase UID, clear it
        if (cachedInternalId && (this as any)._cachedAuthUid !== authUid) {
            cachedInternalId = null;
        }

        if (cachedInternalId) return cachedInternalId;

        // Resolve auth UID → internal users.id via auth_identities mapping table
        const internalId = await this.resolveInternalId('supabase', authUid);
        (this as any)._cachedAuthUid = authUid;

        // Fallback: If not found in auth_identities, check if public.users has it (legacy sync).
        // This heals legacy users whose auth_identities row was never created.
        if (!internalId) {
            const { data: legacyUser } = await supabase
                .from('users')
                .select('id')
                .eq('id', authUid)
                .maybeSingle();

            if (legacyUser) {
                // Proactively heal the state by creating the missing identity mapping
                await this.linkIdentity(legacyUser.id, 'supabase', authUid);
                cachedInternalId = legacyUser.id;
                return legacyUser.id;
            }
        } else {
            cachedInternalId = internalId;
        }

        return internalId;
    },

    /**
     * Clears the identity cache (e.g., on logout).
     */
    clearCache() {
        cachedInternalId = null;
    }
};
