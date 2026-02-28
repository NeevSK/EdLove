import { supabase, APIError, Announcement } from '@repo/core';
import {
    CommunityPost,
    Comment,
    PostFilters,
    CreatePostInput,
    CreateCommentInput,
    CommunityGroup,
    GroupFilters,
    CreateGroupInput,
    ReportStatus,
    GroupReport,
    ReportContentInput
} from '../types';
import { PaginationParams } from '@repo/core';

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
        return (data || []).map((announcement: any) => ({
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

        return (data || []).map((post: any) => ({
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
            .maybeSingle();

        if (error) {
            throw new APIError('Failed to fetch post', error.code, error);
        }

        if (!data) {
            throw new APIError('Post not found', 'NOT_FOUND');
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

        return (data || []).map((comment: any) => ({
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

    // ========================================================================
    // GROUPS MANAGEMENT (General, Club, Class Groups)
    // ========================================================================

    /**
     * Get all groups with filtering
     */
    async getGroups(filters: GroupFilters = {}, userId?: string): Promise<CommunityGroup[]> {
        let query = supabase
            .from('community_groups')
            .select(`
                *,
                creator:users!community_groups_creator_id_fkey(full_name),
                member_count:group_members(count)
            `);

        // Apply filters
        if (filters.type) query = query.eq('type', filters.type);
        if (filters.visibility) query = query.eq('visibility', filters.visibility);
        if (filters.join_policy) query = query.eq('join_policy', filters.join_policy);
        if (filters.school_id) query = query.eq('school_id', filters.school_id);
        if (filters.tags && filters.tags.length > 0) {
            query = query.contains('tags', filters.tags);
        }
        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        query = query.order('created_at', { ascending: false });

        if (filters.limit) query = query.limit(filters.limit);
        if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);

        const { data, error } = await query;

        if (error) {
            throw new APIError('Failed to fetch groups', error.code, error);
        }

        // Check membership status for each group if userId provided
        const groups = await Promise.all((data || []).map(async (group: any) => {
            let is_member = false;
            let is_admin = false;
            let is_moderator = false;

            if (userId) {
                const { data: membership } = await supabase
                    .from('group_members')
                    .select('is_admin, is_moderator, status')
                    .eq('group_id', group.id)
                    .eq('user_id', userId)
                    .eq('status', 'active')
                    .single();

                if (membership) {
                    is_member = true;
                    is_admin = membership.is_admin;
                    is_moderator = membership.is_moderator;
                }
            }

            return {
                ...group,
                creator_name: group.creator?.full_name || 'Unknown',
                member_count: group.member_count?.[0]?.count || 0,
                is_member,
                is_admin,
                is_moderator,
            };
        }));

        return groups;
    },

    /**
     * Get a single group by ID
     */
    async getGroupById(groupId: string, userId?: string): Promise<CommunityGroup> {
        const { data, error } = await supabase
            .from('community_groups')
            .select(`
                *,
                creator:users!community_groups_creator_id_fkey(full_name),
                member_count:group_members(count)
            `)
            .eq('id', groupId)
            .maybeSingle();

        if (error) {
            throw new APIError('Failed to fetch group', error.code, error);
        }

        if (!data) {
            throw new APIError('Group not found', 'NOT_FOUND');
        }

        // Check membership
        let is_member = false;
        let is_admin = false;
        let is_moderator = false;

        if (userId) {
            const { data: membership } = await supabase
                .from('group_members')
                .select('is_admin, is_moderator, status')
                .eq('group_id', groupId)
                .eq('user_id', userId)
                .eq('status', 'active')
                .single();

            if (membership) {
                is_member = true;
                is_admin = membership.is_admin;
                is_moderator = membership.is_moderator;
            }
        }

        return {
            ...data,
            creator_name: data.creator?.full_name || 'Unknown',
            member_count: data.member_count?.[0]?.count || 0,
            is_member,
            is_admin,
            is_moderator,
        };
    },

    async createGroup(
        input: CreateGroupInput,
        creatorId: string,
        creatorRole: string
    ): Promise<CommunityGroup> {
        const { data, error } = await supabase
            .from('community_groups')
            .insert([
                {
                    ...input,
                    creator_id: creatorId,
                    school_id: input.school_id, // Explicitly link to school context
                    allow_posts: input.allow_posts !== false, // Default true
                    allow_announcements: input.allow_announcements !== false, // Default true
                    require_post_approval: input.require_post_approval || false,
                },
            ])
            .select(`
                *,
                creator:users!community_groups_creator_id_fkey(full_name)
            `)
            .single();

        if (error) {
            throw new APIError('Failed to create group', error.code, error);
        }

        // Auto-add creator as admin member
        await supabase.from('group_members').insert([
            {
                group_id: data.id,
                user_id: creatorId,
                user_role: creatorRole,
                is_admin: true,
                is_moderator: true,
                status: 'active',
            },
        ]);

        return {
            ...data,
            creator_name: data.creator?.full_name || 'Unknown',
            member_count: 1,
            is_member: true,
            is_admin: true,
            is_moderator: true,
        };
    },

    /**
     * Update a group (admin only)
     */
    async updateGroup(groupId: string, updates: Partial<CommunityGroup>): Promise<CommunityGroup> {
        const { data, error } = await supabase
            .from('community_groups')
            .update(updates)
            .eq('id', groupId)
            .select(`
                *,
                creator:users!community_groups_creator_id_fkey(full_name)
            `)
            .single();

        if (error) {
            throw new APIError('Failed to update group', error.code, error);
        }

        return {
            ...data,
            creator_name: data.creator?.full_name || 'Unknown',
            member_count: 0,
            is_member: false,
            is_admin: false,
            is_moderator: false,
        };
    },
    /**
     * MEMBER MANAGEMENT (No Trust)
     */
    async getPendingMembers(groupId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('group_members')
            .select(`
                *,
                user:users(full_name, avatar_url, role, index_number, nic_number)
            `)
            .eq('group_id', groupId)
            .eq('status', 'pending');

        if (error) throw error;
        return data;
    },

    async handleMemberRequest(groupId: string, userId: string, status: 'active' | 'rejected'): Promise<void> {
        const { error } = await supabase
            .from('group_members')
            .update({ status, reviewed_at: new Date().toISOString() })
            .eq('group_id', groupId)
            .eq('user_id', userId);

        if (error) throw error;
    },

    async approveAllPending(groupId: string): Promise<void> {
        const { error } = await supabase
            .from('group_members')
            .update({ status: 'active', reviewed_at: new Date().toISOString() })
            .eq('group_id', groupId)
            .eq('status', 'pending');

        if (error) throw error;
    },

    async updateJoiningPolicy(groupId: string, policy: string): Promise<void> {
        const { error } = await supabase
            .from('community_groups')
            .update({ join_policy: policy })
            .eq('id', groupId);

        if (error) throw error;

        if (policy === 'open') {
            await this.approveAllPending(groupId);
        }
    },

    async createSanctuaryGroup(data: {
        name: string;
        description: string;
        school_id: string;
        creator_id: string;
        classroom_id?: string;
    }): Promise<any> {
        const { data: group, error } = await supabase
            .from('community_groups')
            .insert([{
                ...data,
                join_policy: 'restricted',
                visibility: 'public'
            }])
            .select()
            .single();

        if (error) throw error;

        // Auto-add creator as admin
        await supabase
            .from('group_members')
            .insert([{
                group_id: group.id,
                user_id: data.creator_id,
                is_admin: true,
                is_moderator: true,
                status: 'active'
            }]);

        return group;
    },

    async getGroupMembers(groupId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('group_members')
            .select(`
                *,
                user:users(full_name, avatar_url, role)
            `)
            .eq('group_id', groupId);

        if (error) throw error;
        return data;
    },

    /**
     * Join a group
     */
    async joinGroup(groupId: string, userId: string, userRole: string): Promise<void> {
        // Check if group is public/open
        const { data: group, error: groupError } = await supabase
            .from('community_groups')
            .select('join_policy')
            .eq('id', groupId)
            .single();

        if (groupError) throw groupError;

        const status = group.join_policy === 'open' ? 'active' : 'pending';

        const { error } = await supabase
            .from('group_members')
            .upsert([
                {
                    group_id: groupId,
                    user_id: userId,
                    user_role: userRole,
                    status,
                },
            ]);

        if (error) throw error;
    },

    /**
     * REPORTING & SAFETY
     * "No Trust but Full Care" infrastructure
     */

    async reportContent(
        input: ReportContentInput,
        reporterId: string
    ): Promise<GroupReport> {
        const { data, error } = await supabase
            .from('group_reports')
            .insert([{
                group_id: input.group_id,
                post_id: input.post_id,
                target_user_id: input.target_user_id,
                reporter_id: reporterId,
                reason: input.reason,
                details: input.details,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getGroupReports(groupId: string): Promise<GroupReport[]> {
        const { data, error } = await supabase
            .from('group_reports')
            .select(`
                *,
                reporter:users!group_reports_reporter_id_fkey(full_name),
                target_user:users!group_reports_target_user_id_fkey(full_name),
                post:community_posts!group_reports_post_id_fkey(content)
            `)
            .eq('group_id', groupId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // ── Group Chat ───────────────────────────────────────────

    /**
     * Fetch the most recent messages for a group, oldest-first for chat display.
     */
    async getGroupMessages(groupId: string, limit = 60): Promise<GroupMessage[]> {
        const { data, error } = await supabase
            .from('group_messages')
            .select('*, author:users!group_messages_author_id_fkey(full_name, avatar_url)')
            .eq('group_id', groupId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw new APIError('Failed to fetch group messages', error.code, error);
        // Reverse so oldest is at top
        return ((data || []) as GroupMessage[]).reverse();
    },

    /**
     * Send a message to a group chat.
     */
    async sendGroupMessage(groupId: string, content: string): Promise<GroupMessage> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

        const { data, error } = await supabase
            .from('group_messages')
            .insert([{ group_id: groupId, author_id: user.id, content: content.trim() }])
            .select('*, author:users!group_messages_author_id_fkey(full_name, avatar_url)')
            .single();

        if (error) throw new APIError('Failed to send message', error.code, error);
        return data as GroupMessage;
    },

    /**
     * Toggle a reaction (❤️) on a post for the current user.
     * Uses community_reactions table (post_id, user_id PRIMARY KEY).
     * Inserts if not present, deletes if already present (toggle).
     */
    async togglePostReaction(postId: string, userId: string): Promise<boolean> {
        // Check if reaction already exists (minimal select — we only need existence)
        const { data: existing } = await supabase
            .from('community_reactions')
            .select('user_id')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .maybeSingle();

        if (existing) {
            // Un-react
            await supabase
                .from('community_reactions')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', userId);
            return false; // now unliked
        } else {
            // React
            await supabase
                .from('community_reactions')
                .insert([{ post_id: postId, user_id: userId, reaction_code: '❤️' }]);
            return true; // now liked
        }
    },
};
