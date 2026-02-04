import { supabase } from '../supabase';
import { APIError } from './types';
import { Announcement } from './school';

// ============================================================================
// COMMUNITY API (Announcements & Communication)
// ============================================================================

export interface AnnouncementWithAuthor extends Announcement {
    author_name?: string;
    author_avatar?: string;
}

export const communityAPI = {
    /**
     * Get all announcements for a school
     */
    async getAnnouncements(schoolId: string): Promise<AnnouncementWithAuthor[]> {
        const { data, error } = await supabase
            .from('announcements')
            .select(`
                *,
                author:users!announcements_author_id_fkey(
                    full_name,
                    avatar_url
                )
            `)
            .eq('school_id', schoolId)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch announcements', error.code, error);
        }

        // Transform data to flatten author info
        return (data || []).map(announcement => ({
            ...announcement,
            author_name: announcement.author?.full_name,
            author_avatar: announcement.author?.avatar_url,
        }));
    },

    /**
     * Get pinned announcements only
     */
    async getPinnedAnnouncements(schoolId: string): Promise<AnnouncementWithAuthor[]> {
        const { data, error } = await supabase
            .from('announcements')
            .select(`
                *,
                author:users!announcements_author_id_fkey(
                    full_name,
                    avatar_url
                )
            `)
            .eq('school_id', schoolId)
            .eq('is_pinned', true)
            .order('created_at', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch pinned announcements', error.code, error);
        }

        return (data || []).map(announcement => ({
            ...announcement,
            author_name: announcement.author?.full_name,
            author_avatar: announcement.author?.avatar_url,
        }));
    },

    /**
     * Create a new announcement
     */
    async createAnnouncement(
        schoolId: string,
        authorId: string,
        content: string,
        isPinned: boolean = false
    ): Promise<Announcement> {
        const { data, error } = await supabase
            .from('announcements')
            .insert([
                {
                    school_id: schoolId,
                    author_id: authorId,
                    content,
                    is_pinned: isPinned,
                },
            ])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create announcement', error.code, error);
        }

        return data;
    },

    /**
     * Update an announcement
     */
    async updateAnnouncement(
        announcementId: string,
        updates: { content?: string; is_pinned?: boolean }
    ): Promise<Announcement> {
        const { data, error } = await supabase
            .from('announcements')
            .update(updates)
            .eq('id', announcementId)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to update announcement', error.code, error);
        }

        return data;
    },

    /**
     * Delete an announcement
     */
    async deleteAnnouncement(announcementId: string): Promise<void> {
        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', announcementId);

        if (error) {
            throw new APIError('Failed to delete announcement', error.code, error);
        }
    },

    /**
     * Toggle pin status of an announcement
     */
    async togglePin(announcementId: string, isPinned: boolean): Promise<Announcement> {
        const { data, error } = await supabase
            .from('announcements')
            .update({ is_pinned: isPinned })
            .eq('id', announcementId)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to toggle pin', error.code, error);
        }

        return data;
    },
};
