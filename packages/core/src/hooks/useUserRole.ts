/**
 * useUserRole Hook
 * 
 * Provides access to the current user's role and school type from the global store.
 * This is the primary way to access role information throughout the app.
 */

import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { identityAPI } from '../api/identity';
import { UserRole } from '../types';
import { SchoolType } from '../constants/SriLankanSchools';

interface UseUserRoleReturn {
    role: UserRole | null;
    schoolType: SchoolType | null;
    schoolId: string | null;
    userId: string | null;
    isAuthenticated: boolean;
    /** @deprecated Use isAnonymous or needsSchoolContext depending on intent. */
    isGuest: boolean;
    isAnonymous: boolean;
    hasSchoolContext: boolean;
    needsSchoolContext: boolean;
    user: any | null; // Full user object for convergence checks
}

export function useUserRole(): UseUserRoleReturn & { refresh: () => Promise<void> } {
    const user = useStore(state => state.user);
    const role = useStore(state => state.userRole);
    const schoolType = useStore(state => state.schoolType);
    const setUser = useStore(state => state.setUser);
    const setSchoolType = useStore(state => state.setSchoolType);

    const schoolId = user?.school_id || null;
    const hasSchoolContext = !!schoolId && schoolId !== 'mock-school';
    const needsSchoolContext = !hasSchoolContext;
    const isAnonymous = !user || (user as any)?.is_anonymous === true;
    // "Guest" is the wanderer (anonymous) identity. School setup is tracked separately.
    const isGuest = isAnonymous;


    const refresh = async () => {
        try {
            const internalId = await identityAPI.getMyInternalId();
            if (!internalId) return;

            const { data: profile } = await supabase
                .from('users')
                .select('role, school_id, orientation_seeds, organization_name, profile_completed')
                .eq('id', internalId)
                .maybeSingle();

            if (profile) {
                // Convergence: Update store if server has different info
                const hasRoleChanged = profile.role !== role;
                const hasSchoolChanged = user && profile.school_id !== user.school_id;
                const hasProfileStatusChanged = user && (!!profile.profile_completed !== !!user.profile_completed);
                const hasSeedsChanged = user && JSON.stringify(profile.orientation_seeds) !== JSON.stringify(user.orientation_seeds);
                const hasOrgChanged = user && profile.organization_name !== user.organization_name;

                if (hasRoleChanged || hasSchoolChanged || hasProfileStatusChanged || hasSeedsChanged || hasOrgChanged || !user) {
                    console.log('🔄 useUserRole: Syncing user data from server (convergence)');
                    
                    // `id: internalId` is placed last so that spreads of `user`/`profile`
                    // (which may carry a Supabase auth UID) cannot overwrite the canonical
                    // internal users.id that the rest of the app relies on.
                    setUser({ ...user, ...profile, id: internalId } as any);

                    // Fetch school type if school_id changed
                    if (profile.school_id && (hasSchoolChanged || !schoolType)) {
                        const { data: school } = await supabase
                            .from('schools')
                            .select('type')
                            .eq('id', profile.school_id)
                            .maybeSingle();
                        if (school) setSchoolType(school.type as any);
                    }
                }
            }
        } catch (e) {
            console.warn('Silent sync failed:', e);
        }
    };

    return {
        role,
        schoolType,
        schoolId,
        userId: user?.id || null,
        isAuthenticated: !!user,
        isGuest,
        isAnonymous,
        hasSchoolContext,
        needsSchoolContext,
        user,
        refresh
    };
}
