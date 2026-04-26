import {
  communityAPI,
  handleAPIError,
  supabase,
  useMutationQueue,
  usePermissions,
} from '@repo/core';
import { useCallback, useEffect, useState } from 'react';

export function useCommunityProfile(communityId: string) {
  const [community, setCommunity] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { can } = usePermissions();

  const isOwner = can('manage', { __typename: 'CommunityGroup', id: communityId } as any);
  const addToQueue = useMutationQueue((state) => state.addToQueue);

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

    setCommunity((prev: any) => (prev ? { ...prev, [field]: value } : null));

    addToQueue({
      type: 'UPDATE',
      scope: 'community',
      name: 'updateCommunityField',
      variables: { id: community.id, [field]: value },
    });

    try {
      const { error } = await supabase
        .from('community_groups')
        .update({ [field]: value })
        .eq('id', community.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.log('= Sync pending for community:', field);
      return { success: true, pending: true };
    }
  };

  return {
    community,
    loading,
    refresh: fetchCommunity,
    updateField,
    isEditable: isOwner,
  };
}
