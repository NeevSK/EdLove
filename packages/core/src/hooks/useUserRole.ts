/**
 * useUserRole Hook
 * 
 * Provides access to the current user's role and school type from the global store.
 * This is the primary way to access role information throughout the app.
 */

import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { UserRole } from '../types';
import { SchoolType } from '../constants/SriLankanSchools';

interface UseUserRoleReturn {
    role: UserRole | null;
    schoolType: SchoolType | null;
    schoolId: string;
    userId: string | null;
    isAuthenticated: boolean;
    isGuest: boolean;
    user: any | null; // Full user object for convergence checks
}

export function useUserRole(): UseUserRoleReturn & { refresh: () => Promise<void> } {
    const user = useStore(state => state.user);
    const role = useStore(state => state.userRole);
    const schoolType = useStore(state => state.schoolType);
    const setUser = useStore(state => state.setUser);
    const setSchoolType = useStore(state => state.setSchoolType);

    // Offline-first identity logic
    const schoolId = user?.school_id || 'mock-school';
    const isGuest = !user || schoolId === 'mock-school';

    const refresh = async () => {
        if (!user?.id) return;
        try {
            const { data: profile } = await supabase
                .from('users')
                .select('role, school_id')
                .eq('id', user.id)
                .maybeSingle();

            if (profile) {
                // Convergence: Update store if server has different info
                if (profile.role !== role || profile.school_id !== user.school_id) {
                    setUser({ ...user, ...profile } as any);

                    // Fetch school type if school_id changed
                    if (profile.school_id) {
                        const { data: school } = await supabase
                            .from('schools')
                            .select('type')
                            .eq('id', profile.school_id)
                            .single();
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
        user,
        refresh
    };
}
