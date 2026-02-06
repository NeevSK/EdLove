import { supabase } from '../supabase';
import { APIError } from './types';
import { Announcement } from './school';
import {
    CommunityPost,
    Comment,
    PostFilters,
    CreatePostInput,
    CreateCommentInput,
} from '../../types/Community';

// ============================================================================
// COMMUNITY API (Announcements & Communication + Enhanced Features)
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

    // ========================================================================
    // ENHANCED COMMUNITY FEATURES - Educational Ecology
    // ========================================================================

    /**
     * Get community posts with filtering
     */
    async getPosts(filters: PostFilters = {}, userId?: string): Promise<CommunityPost[]> {
        let query = supabase
            .from('community_posts')
            .select(`
                *,
                author:users!community_posts_author_id_fkey(
                    full_name,
                    avatar_url,
                    role
                ),
                comment_count:comments(count)
            `);

        // Apply filters
        if (filters.post_type) query = query.eq('post_type', filters.post_type);
        if (filters.visibility) query = query.eq('visibility', filters.visibility);
        if (filters.subject) query = query.eq('subject', filters.subject);
        if (filters.author_role) query = query.eq('author_role', filters.author_role);
        if (filters.has_answer !== undefined) {
            query = query.eq('has_accepted_answer', filters.has_answer);
        }
        if (filters.feedback_status) query = query.eq('feedback_status', filters.feedback_status);
        if (filters.classroom_id) query = query.eq('classroom_id', filters.classroom_id);
        if (filters.group_id) query = query.eq('group_id', filters.group_id);
        if (filters.tags && filters.tags.length > 0) {
            query = query.contains('tags', filters.tags);
        }
        if (filters.search) {
            query = query.ilike('content', `%${filters.search}%`);
        }

        // Ordering
        query = query.order('created_at', { ascending: false });

        // Pagination
        if (filters.limit) query = query.limit(filters.limit);
        if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);

        const { data, error } = await query;

        if (error) {
            throw new APIError('Failed to fetch posts', error.code, error);
        }

        return (data || []).map(post => ({
            ...post,
            author_name: post.is_anonymous ? 'Anonymous' : (post.author?.full_name || 'Unknown'),
            author_avatar: post.is_anonymous ? undefined : post.author?.avatar_url,
            comment_count: post.comment_count?.[0]?.count || 0,
        }));
    },

    /**
     * Get a single post by ID
     */
    async getPostById(postId: string): Promise<CommunityPost> {
        const { data, error } = await supabase
            .from('community_posts')
            .select(`
                *,
                author:users!community_posts_author_id_fkey(
                    full_name,
                    avatar_url,
                    role
                ),
                comment_count:comments(count)
            `)
            .eq('id', postId)
            .single();

        if (error) {
            throw new APIError('Failed to fetch post', error.code, error);
        }

        // Increment view count
        await supabase.rpc('increment_post_views', { post_id: postId });

        return {
            ...data,
            author_name: data.is_anonymous ? 'Anonymous' : (data.author?.full_name || 'Unknown'),
            author_avatar: data.is_anonymous ? undefined : data.author?.avatar_url,
            comment_count: data.comment_count?.[0]?.count || 0,
        };
    },

    /**
     * Create a new community post
     */
    async createPost(input: CreatePostInput, authorId: string, authorRole: string, schoolId: string): Promise<CommunityPost> {
        const { data, error } = await supabase
            .from('community_posts')
            .insert([
                {
                    ...input,
                    author_id: authorId,
                    author_role: authorRole,
                    school_id: schoolId,
                    reactions: {},
                    view_count: 0,
                    tags: input.tags || [],
                },
            ])
            .select(`
                *,
                author:users!community_posts_author_id_fkey(
                    full_name,
                    avatar_url,
                    role
                )
            `)
            .single();

        if (error) {
            throw new APIError('Failed to create post', error.code, error);
        }

        // Track contribution
        await supabase.from('contributions').insert([
            {
                user_id: authorId,
                contribution_type: 'post_created',
                reference_id: data.id,
            },
        ]);

        return {
            ...data,
            author_name: data.is_anonymous ? 'Anonymous' : (data.author?.full_name || 'Unknown'),
            author_avatar: data.is_anonymous ? undefined : data.author?.avatar_url,
            comment_count: 0,
        };
    },

    /**
     * Update a post
     */
    async updatePost(postId: string, updates: Partial<CommunityPost>): Promise<CommunityPost> {
        const { data, error } = await supabase
            .from('community_posts')
            .update(updates)
            .eq('id', postId)
            .select(`
                *,
                author:users!community_posts_author_id_fkey(
                    full_name,
                    avatar_url,
                    role
                )
            `)
            .single();

        if (error) {
            throw new APIError('Failed to update post', error.code, error);
        }

        return {
            ...data,
            author_name: data.is_anonymous ? 'Anonymous' : (data.author?.full_name || 'Unknown'),
            author_avatar: data.is_anonymous ? undefined : data.author?.avatar_url,
            comment_count: 0,
        };
    },

    /**
     * Delete a post
     */
    async deletePost(postId: string): Promise<void> {
        const { error } = await supabase
            .from('community_posts')
            .delete()
            .eq('id', postId);

        if (error) {
            throw new APIError('Failed to delete post', error.code, error);
        }
    },

    /**
     * React to a post
     */
    async reactToPost(postId: string, emoji: string, userId: string): Promise<void> {
        const { data: post } = await supabase
            .from('community_posts')
            .select('reactions')
            .eq('id', postId)
            .single();

        if (!post) {
            throw new APIError('Post not found');
        }

        const reactions = post.reactions || {};
        reactions[emoji] = (reactions[emoji] || 0) + 1;

        await supabase
            .from('community_posts')
            .update({ reactions })
            .eq('id', postId);
    },

    // ========================================================================
    // COMMENTS & ANSWERS
    // ========================================================================

    /**
     * Get comments for a post
     */
    async getComments(postId: string): Promise<Comment[]> {
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                author:users!comments_author_id_fkey(
                    full_name,
                    avatar_url,
                    role
                )
            `)
            .eq('post_id', postId)
            .order('is_official_answer', { ascending: false })
            .order('upvotes', { ascending: false })
            .order('created_at', { ascending: true });

        if (error) {
            throw new APIError('Failed to fetch comments', error.code, error);
        }

        return (data || []).map(comment => ({
            ...comment,
            author_name: comment.is_anonymous ? 'Anonymous' : (comment.author?.full_name || 'Unknown'),
            author_avatar: comment.is_anonymous ? undefined : comment.author?.avatar_url,
        }));
    },

    /**
     * Add a comment to a post
     */
    async addComment(input: CreateCommentInput, authorId: string, authorRole: string): Promise<Comment> {
        const { data, error } = await supabase
            .from('comments')
            .insert([
                {
                    ...input,
                    author_id: authorId,
                    author_role: authorRole,
                    upvotes: 0,
                    is_official_answer: false,
                },
            ])
            .select(`
                *,
                author:users!comments_author_id_fkey(
                    full_name,
                    avatar_url,
                    role
                )
            `)
            .single();

        if (error) {
            throw new APIError('Failed to add comment', error.code, error);
        }

        // Track contribution
        await supabase.from('contributions').insert([
            {
                user_id: authorId,
                contribution_type: 'helpful_comment',
                reference_id: data.id,
            },
        ]);

        return {
            ...data,
            author_name: data.is_anonymous ? 'Anonymous' : (data.author?.full_name || 'Unknown'),
            author_avatar: data.is_anonymous ? undefined : data.author?.avatar_url,
        };
    },

    /**
     * Mark a comment as official answer (teachers only)
     */
    async markOfficialAnswer(commentId: string, postId: string): Promise<Comment> {
        // First, unmark any existing official answer
        await supabase
            .from('comments')
            .update({ is_official_answer: false })
            .eq('post_id', postId);

        // Mark the new official answer
        const { data, error } = await supabase
            .from('comments')
            .update({ is_official_answer: true })
            .eq('id', commentId)
            .select(`
                *,
                author:users!comments_author_id_fkey(
                    full_name,
                    avatar_url,
                    role
                )
            `)
            .single();

        if (error) {
            throw new APIError('Failed to mark official answer', error.code, error);
        }

        // Update post to mark it has an accepted answer
        await supabase
            .from('community_posts')
            .update({
                has_accepted_answer: true,
                accepted_answer_id: commentId,
            })
            .eq('id', postId);

        // Track contribution
        const { data: comment } = await supabase
            .from('comments')
            .select('author_id')
            .eq('id', commentId)
            .single();

        if (comment) {
            await supabase.from('contributions').insert([
                {
                    user_id: comment.author_id,
                    contribution_type: 'question_answered',
                    reference_id: commentId,
                },
            ]);
        }

        return {
            ...data,
            author_name: data.is_anonymous ? 'Anonymous' : (data.author?.full_name || 'Unknown'),
            author_avatar: data.is_anonymous ? undefined : data.author?.avatar_url,
        };
    },

    /**
     * Upvote a comment
     */
    async upvoteComment(commentId: string, userId: string): Promise<void> {
        // Check if user already upvoted
        const { data: existing } = await supabase
            .from('comment_upvotes')
            .select('*')
            .eq('comment_id', commentId)
            .eq('user_id', userId)
            .single();

        if (existing) {
            // Remove upvote
            await supabase
                .from('comment_upvotes')
                .delete()
                .eq('comment_id', commentId)
                .eq('user_id', userId);

            await supabase.rpc('decrement_comment_upvotes', {
                comment_id: commentId,
            });
        } else {
            // Add upvote
            await supabase
                .from('comment_upvotes')
                .insert([{ comment_id: commentId, user_id: userId }]);

            await supabase.rpc('increment_comment_upvotes', {
                comment_id: commentId,
            });
        }
    },

    /**
     * Delete a comment
     */
    async deleteComment(commentId: string): Promise<void> {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);

        if (error) {
            throw new APIError('Failed to delete comment', error.code, error);
        }
    },

    // ========================================================================
    // FEEDBACK MANAGEMENT (Principal/Admin)
    // ========================================================================

    /**
     * Update feedback status (Principal/Admin only)
     */
    async updateFeedbackStatus(
        postId: string,
        status: string,
        response?: string,
        responderId?: string
    ): Promise<CommunityPost> {
        const updates: any = {
            feedback_status: status,
        };

        if (response) updates.feedback_response = response;
        if (responderId) updates.feedback_responder_id = responderId;

        const { data, error } = await supabase
            .from('community_posts')
            .update(updates)
            .eq('id', postId)
            .select(`
                *,
                author:users!community_posts_author_id_fkey(
                    full_name,
                    avatar_url,
                    role
                )
            `)
            .single();

        if (error) {
            throw new APIError('Failed to update feedback status', error.code, error);
        }

        return {
            ...data,
            author_name: data.is_anonymous ? 'Anonymous' : (data.author?.full_name || 'Unknown'),
            author_avatar: data.is_anonymous ? undefined : data.author?.avatar_url,
            comment_count: 0,
        };
    },
};
