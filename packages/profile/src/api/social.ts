import { supabase } from '@repo/core';
import { APIError } from '@repo/core';
import { SocialLink } from '@repo/core';

export const socialAPI = {
    /**
     * Get user's social links
     */
    async getSocialLinks(userId: string) {
        const { data, error } = await supabase
            .from('user_social_links')
            .select('*')
            .eq('user_id', userId)
            .order('order_index', { ascending: true });

        if (error) {
            throw new APIError('Failed to fetch social links', error.code, error);
        }

        return data as SocialLink[];
    },

    /**
     * Add or update a social link
     */
    async upsertSocialLink(link: Partial<SocialLink>) {
        const { data, error } = await supabase
            .from('user_social_links')
            .upsert(link)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to upsert social link', error.code, error);
        }

        return data as SocialLink;
    },

    /**
     * Delete a social link
     */
    async deleteSocialLink(linkId: string) {
        const { error } = await supabase
            .from('user_social_links')
            .delete()
            .eq('id', linkId);

        if (error) {
            throw new APIError('Failed to delete social link', error.code, error);
        }

        return true;
    },

    /**
     * Update social link order
     */
    async updateOrder(links: { id: string; order_index: number }[]) {
        const { error } = await supabase
            .from('user_social_links')
            .upsert(links);

        if (error) {
            throw new APIError('Failed to update social links order', error.code, error);
        }

        return true;
    }
};
