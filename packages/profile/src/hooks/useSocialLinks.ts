import { useState, useEffect, useCallback } from 'react';
import { supabase, handleAPIError, SocialLink } from '@repo/core';
import { socialAPI } from '../api/social';

export function useSocialLinks(userId?: string) {
    const [links, setLinks] = useState<SocialLink[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLinks = useCallback(async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const data = await socialAPI.getSocialLinks(userId);
            setLinks(data);
        } catch (error) {
            handleAPIError(error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]);

    const addLink = async (link: Omit<SocialLink, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const newLink = await socialAPI.upsertSocialLink(link);
            setLinks(prev => [...prev, newLink]);
            return { success: true, data: newLink };
        } catch (error) {
            handleAPIError(error);
            return { success: false, error };
        }
    };

    const updateLink = async (id: string, updates: Partial<SocialLink>) => {
        try {
            const updatedLink = await socialAPI.upsertSocialLink({ id, ...updates });
            setLinks(prev => prev.map(l => l.id === id ? updatedLink : l));
            return { success: true, data: updatedLink };
        } catch (error) {
            handleAPIError(error);
            return { success: false, error };
        }
    };

    const deleteLink = async (id: string) => {
        try {
            await socialAPI.deleteSocialLink(id);
            setLinks(prev => prev.filter(l => l.id !== id));
            return { success: true };
        } catch (error) {
            handleAPIError(error);
            return { success: false, error };
        }
    };

    return {
        links,
        loading,
        refresh: fetchLinks,
        addLink,
        updateLink,
        deleteLink
    };
}
