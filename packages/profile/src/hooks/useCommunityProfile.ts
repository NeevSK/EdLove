import { useState, useEffect, useCallback } from 'react';
import { communityAPI, handleAPIError, useUserRole, useMutationQueue, supabase } from '@repo/core';

export function useCommunityProfile(communityId: string) {
    const [community, setCommunity] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const { role: userRole, userId } = useUserRole();
    
    const isOwner = community?.creator_id === userId || userRole === 'principal';
    const addToQueue = useMutationQueue(state => state.addToQueue);

    const fetchCommunity = useCallback(async () => {
        if (!communityId) return;
        try {
            setLoading(true);
            const data = await communityAPI.getGroupById(communityId);
            setCommunity(data);
        } catch (error) {
            handleAPIError(error);
        } finally {
            setLoading(false);
        }
    }, [communityId]);

    useEffect(() => {
        fetchCommunity();
    }, [fetchCommunity]);

    const updateField = async (field: string, value: any) => {
        if (!isOwner || !community) return { success: false };

        setCommunity((prev: any) => prev ? { ...prev, [field]: value } : null);

        addToQueue({
            type: 'UPDATE',
            scope: 'community',
            name: 'updateCommunityField',
            variables: { id: community.id, [field]: value }
        });

        try {
            const { error } = await supabase
                .from('community_groups')
                .update({ [field]: value })
                .eq('id', community.id);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.log('🔄 Sync pending for community:', field);
            return { success: true, pending: true };
        }
    };

    return {
        community,
        loading,
        refresh: fetchCommunity,
        updateField,
        isEditable: isOwner
    };
}
