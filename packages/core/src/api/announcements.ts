import { supabase } from './supabase';

/**
 * Announcements API
 *
 * Dedicated domain for school-wide and system announcements.
 */
export const announcementAPI = {
  /**
   * @authority read Group
   */
  async getAnnouncements(schoolId: string) {
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

    if (error) throw error;

    return (data || []).map((announcement: any) => ({
      ...announcement,
      author_name: announcement.author?.full_name,
      author_avatar: announcement.author?.avatar_url,
    }));
  },

  /**
   * @authority create Group
   */
  async createAnnouncement(
    schoolId: string,
    authorId: string,
    content: string,
    isPinned: boolean = false,
  ) {
    const { data, error } = await supabase
      .from('announcements')
      .insert([
        {
          school_id: schoolId,
          author_id: authorId,
          content: content,
          is_pinned: isPinned,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
