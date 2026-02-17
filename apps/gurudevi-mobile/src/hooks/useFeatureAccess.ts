import { useState, useEffect } from 'react';
import { authAPI } from '../lib/api/auth';
import { UserRole } from '../types/User';

export interface FeatureAccess {
    canCreateClassroom: boolean;
    canPostInCommunity: boolean;
    canUploadToLibrary: boolean;
    canInviteUsers: boolean;
    isAnonymous: boolean;
    isGuest: boolean; // Alias for isAnonymous
}

/**
 * Hook to manage feature access levels for anonymous vs registered users
 */
export function useFeatureAccess(): FeatureAccess {
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAnonymous = async () => {
            try {
                const anon = await authAPI.isAnonymous();
                setIsAnonymous(anon);
            } catch (error) {
                console.error('Error checking user access:', error);
                setIsAnonymous(false);
            } finally {
                setLoading(false);
            }
        };

        checkAnonymous();
    }, []);

    return {
        // Feature flags
        canCreateClassroom: !isAnonymous,
        canPostInCommunity: !isAnonymous,
        canUploadToLibrary: !isAnonymous,
        canInviteUsers: !isAnonymous,

        // Status flags
        isAnonymous,
        isGuest: isAnonymous,
    };
}
