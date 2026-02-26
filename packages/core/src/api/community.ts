import { supabase } from '../lib/supabase';
import { APIError } from './types';
import type { Announcement } from '@repo/core';

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
        return (data || []).map((announcement: any) => ({
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
};
