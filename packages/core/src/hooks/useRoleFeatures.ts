import { useMemo } from 'react';
import { useUserRole } from './useUserRole';
import { useFeatureAccess } from './useFeatureAccess';
import { UserRole } from '../types';

export interface RoleFeatures {
    // Visibility flags
    showClassroom: boolean;
    showCommunity: boolean;
    showLibrary: boolean;
    showSelf: boolean;
    showManagement: boolean;

    // Action flags
    canCreateContent: boolean;
    canInteract: boolean;
    canManageSchool: boolean;

    // Status flags
    isGuest: boolean;
    role: UserRole | null;
}

/**
 * Hook to provide role-specific feature sets, accounting for guest status.
 * This should be the primary interface for UI-level feature gating.
 */
export function useRoleFeatures(): RoleFeatures {
    const { role } = useUserRole();
    const { isGuest } = useFeatureAccess();

    const features = useMemo(() => {
        // Base features for everyone
        const base = {
            showClassroom: true,
            showCommunity: true,
            showLibrary: true,
            showSelf: true,
            showManagement: false,
            canCreateContent: !isGuest,
            canInteract: !isGuest,
            canManageSchool: false,
            isGuest,
            role,
        };

        // Role-specific overrides
        switch (role) {
            case 'founder':
            case 'principal':
            case 'developer':
                return {
                    ...base,
                    showManagement: true,
                    canManageSchool: true,
                    canCreateContent: true,
                };
            case 'teacher':
            case 'grade_head':
            case 'section_head':
                return {
                    ...base,
                    canCreateContent: true,
                };
            case 'student':
                return {
                    ...base,
                    canCreateContent: false, // Students usually interact but don't "create" core objects
                    canInteract: true,
                };
            default:
                // Guests or undefined role
                return {
                    ...base,
                    showManagement: false,
                    canCreateContent: false,
                    canInteract: false,
                };
        }
    }, [role, isGuest]);

    return features;
}
