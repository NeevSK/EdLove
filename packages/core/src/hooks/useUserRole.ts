/**
 * useUserRole Hook
 * 
 * Provides access to the current user's role and school type from the global store.
 * This is the primary way to access role information throughout the app.
 */

import { useStore } from '../store/useStore';
import { UserRole } from '../types';
import { SchoolType } from '../constants/SriLankanSchools';

interface UseUserRoleReturn {
    role: UserRole | null;
    schoolType: SchoolType | null;
}

export function useUserRole(): UseUserRoleReturn {
    const role = useStore(state => state.userRole);
    const schoolType = useStore(state => state.schoolType);

    return { role, schoolType };
}
