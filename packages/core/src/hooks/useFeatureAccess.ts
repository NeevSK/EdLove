import { useCallback } from 'react';
import { useAccessState } from './useAccessState';

export interface FeatureAccess {
    canCreateClassroom: boolean;
    canPostInCommunity: boolean;
    canUploadToLibrary: boolean;
    canInviteUsers: boolean;
    isAnonymous: boolean;
    isGuest: boolean; // Alias for isAnonymous
    promptAccountCreation: (feature: 'classroom' | 'community' | 'library' | 'self' | 'general') => void;
    getFeatureMessage: (feature: string) => string;
}

/**
 * Hook to manage feature access levels for anonymous vs registered users
 */
export function useFeatureAccess(): FeatureAccess {
    const { isAnonymous } = useAccessState();

    const promptAccountCreation = useCallback((feature: 'classroom' | 'community' | 'library' | 'self' | 'general') => {
        // This will be handled by the component using GuestConversionPrompt
        // The component should pass a navigation callback
        console.log(`Account creation prompted for feature: ${feature}`);
    }, []);

    const getFeatureMessage = useCallback((feature: string): string => {
        const messages: Record<string, string> = {
            classroom: 'Create an account to save your classrooms in the cloud',
            community: 'Create an account to post and engage with the community',
            library: 'Create an account to upload and save resources',
            self: 'Create an account to sync your personal data across devices',
            general: 'Create an account to unlock all features'
        };
        return messages[feature] || messages.general || '';
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

        // Helper methods
        promptAccountCreation,
        getFeatureMessage
    };
}
