import { supabase, identityAPI, applyTemporalFilter } from '@repo/core';
import { CommunityPost, CommunityGroup, Group, Post, Comment } from '../types';

/**
 * Community API
 * 
 * Unified API for community interactions, extending core announcement logic.
 * Located in @repo/community for domain-specific locality.
 */
export const communityAPI = {
    /**
     * Get all announcements for a school (Core logic)
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
     * Create a new announcement (Core logic)
     */
    async createAnnouncement(schoolId: string, authorId: string, content: string, isPinned: boolean = false) {
        const { data, error } = await supabase
            .from('announcements')
            .insert([{
                school_id: schoolId,
                author_id: authorId,
                content: content,
                is_pinned: isPinned,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get Groups with filtering and pagination
     */
    async getGroups(filters: { limit: number; offset: number }) {
        const { data, error } = await supabase
            .from('community_groups')
            .select('*')
            .range(filters.offset, filters.offset + filters.limit - 1)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map((group: any) => ({
            ...group,
            type: group.group_type || group.type || 'general'
        })) as CommunityGroup[];
    },

    /**
     * Get Posts with filtering and pagination
     */
    async getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string }) {
        let query = supabase
            .from('community_posts_with_counts')
            .select('*')
            .range(filters.offset, filters.offset + filters.limit - 1);

        if (filters.viewDate) {
            query = applyTemporalFilter(query, filters.viewDate);
        } else {
            query = query.order('created_at', { ascending: false });
        }

        if (filters.groupId && filters.groupId !== 'all') {
            query = query.eq('group_id', filters.groupId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Post[];
    },

    /**
     * Create a new post
     */
    async createPost(post: any, userId: string, userRole: string, schoolId: string) {
        const { data, error } = await supabase
            .from('community_posts')
            .insert([{
                ...post,
                author_id: userId,
                author_role: userRole,
                school_id: schoolId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return data as Post;
    },

    /**
     * Create a new group
     */
    async createGroup(group: any, userId: string, userRole: string) {
        const { data, error } = await supabase
            .from('community_groups')
            .insert([{
                ...group,
                created_by: userId,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return data as CommunityGroup;
    },

    /**
     * Create a group and immediately add the creator as Owner.
     * This is the canonical group-creation entry point — always use this
     * instead of createGroup() to ensure the creator has supreme authority.
     */
    async createGroupWithOwner(group: any, userId: string): Promise<CommunityGroup> {
        // 1. Create the group
        const { data: created, error: groupErr } = await supabase
            .from('community_groups')
            .insert([{
                name: group.name,
                handle: group.handle ?? null,
                description: group.description ?? null,
                group_type: group.group_type ?? 'general',
                join_policy: group.join_policy ?? 'open',
                school_id: group.school_id ?? null,
                image_url: group.image_url ?? null,
                created_by: userId,
                created_at: new Date().toISOString(),
            }])
            .select()
            .single();

        if (groupErr) throw groupErr;

        // 2. Add creator as supreme owner (status = 'active', role = 'owner')
        const { error: memberErr } = await supabase
            .from('community_group_members')
            .insert([{
                group_id: created.id,
                user_id: userId,
                role: 'owner',
                status: 'active',
            }]);

        // Non-fatal: if this fails (e.g. duplicate), the group still exists.
        if (memberErr) console.warn('createGroupWithOwner: member insert warning', memberErr);

        return {
            ...created,
            type: created.group_type || 'general'
        } as CommunityGroup;
    },

    /**
     * Join a group
     */
    async joinGroup(groupId: string, userId: string, joinPolicy: string = 'open') {
        // status is 'active' for open groups, 'pending' for approval_required / invite_only
        const status = joinPolicy === 'open' ? 'active' : 'pending';
        const { data, error } = await supabase
            .from('community_group_members')
            .upsert([{
                group_id: groupId,
                user_id: userId,
                role: 'member',
                status,
            }], { onConflict: 'group_id,user_id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get a single group by ID
     */
    async getGroupById(groupId: string): Promise<CommunityGroup> {
        const { data, error } = await supabase
            .from('community_groups')
            .select('*')
            .eq('id', groupId)
            .single();

        if (error) throw error;
        return {
            ...(data as any),
            type: (data as any).group_type || (data as any).type || 'general'
        } as CommunityGroup;
    },

    // ── Group Chat ───────────────────────────────────────────

    /**
     * Fetch the most recent messages for a group, oldest-first for chat display.
     */
    async getGroupMessages(groupId: string, limit = 60, viewDate?: string) {
        let query = supabase
            .from('group_messages')
            .select('*, author:users!group_messages_author_id_fkey(full_name, avatar_url)')
            .eq('group_id', groupId);

        if (viewDate) {
            query = applyTemporalFilter(query, viewDate);
        } else {
            query = query.order('created_at', { ascending: false }).limit(limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        // Reverse so oldest is at top
        return (data || []).reverse();
    },

    /**
     * Send a message to a group chat.
     */
    async sendGroupMessage(groupId: string, content: string) {
        const userId = await identityAPI.getMyInternalId();
        if (!userId) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('group_messages')
            .insert([{ group_id: groupId, author_id: userId, content: content.trim() }])
            .select('*, author:users!group_messages_author_id_fkey(full_name, avatar_url)')
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Toggle a reaction (❤️) on a post for the current user.
     */
    async togglePostReaction(postId: string, userId: string): Promise<boolean> {
        const { data: existing } = await supabase
            .from('community_reactions')
            .select('user_id')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .maybeSingle();

        if (existing) {
            await supabase
                .from('community_reactions')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', userId);
            return false;
        } else {
            await supabase
                .from('community_reactions')
                .insert([{ post_id: postId, user_id: userId, reaction_code: '❤️' }]);
            return true;
        }
    },

    /**
     * Get pending members for a group
     */
    async getPendingMembers(groupId: string) {
        const { data, error } = await supabase
            .from('community_group_members')
            .select(`
                *,
                user:users!community_group_members_user_id_fkey(
                    full_name,
                    role,
                    avatar_url,
                    index_number,
                    nic_number
                )
            `)
            .eq('group_id', groupId)
            .eq('status', 'pending');

        if (error) throw error;
        return data;
    },

    /**
     * Handle member request (approve/reject)
     */
    async handleMemberRequest(groupId: string, userId: string, status: 'active' | 'rejected') {
        const { data, error } = await supabase
            .from('community_group_members')
            .update({ status })
            .eq('group_id', groupId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get all active members for a group
     */
    async getActiveMembers(groupId: string) {
        const { data, error } = await supabase
            .from('community_group_members')
            .select(`
                *,
                user:users!community_group_members_user_id_fkey(
                    full_name,
                    role,
                    avatar_url,
                    index_number,
                    nic_number
                )
            `)
            .eq('group_id', groupId)
            .eq('status', 'active')
            .order('role', { ascending: true }); // Manual sort might be needed for owner priority

        if (error) throw error;
        return data;
    },

    /**
     * Update a member's role (only owner can do this via RLS)
     */
    async updateMemberRole(groupId: string, userId: string, newRole: 'admin' | 'member') {
        const { data, error } = await supabase
            .from('community_group_members')
            .update({ role: newRole })
            .eq('group_id', groupId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update joining policy for a group
     */
    async updateJoiningPolicy(groupId: string, newPolicy: string) {
        const { data, error } = await supabase
            .from('community_groups')
            .update({ join_policy: newPolicy })
            .eq('id', groupId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Approve all pending members
     */
    async approveAllPending(groupId: string) {
        const { data, error } = await supabase
            .from('community_group_members')
            .update({ status: 'active' })
            .eq('group_id', groupId)
            .eq('status', 'pending');

        if (error) throw error;
        return data;
    },

    /**
     * Update an existing group
     */
    async updateGroup(groupId: string, updates: Partial<CommunityGroup>) {
        const { data, error } = await supabase
            .from('community_groups')
            .update(updates)
            .eq('id', groupId)
            .select()
            .single();

        if (error) throw error;
        return data as CommunityGroup;
    },

    /**
     * Report content (post, group, or user)
     * Automatically routes to appropriate handler (Teacher/Principal/Platform)
     */
    async reportContent(params: {
        postId?: string;
        groupId?: string;
        targetUserId?: string;
        reason: string;
        report_target: 'teacher' | 'principal' | 'platform';
    }, reporterId: string) {
        let assignedHandlerId: string | null = null;

        // 1. Fetch routing info (school_id, classroom_id) if needed
        const { data: reporterData } = await supabase
            .from('users')
            .select('school_id, section_id, grade_id')
            .eq('id', reporterId)
            .single();

        if (params.report_target === 'teacher' && reporterData?.school_id) {
            // Find classroom teacher - for simplicity, we look for the main classroom teacher
            // In a real scenario, this might need more complex logic to find "the" teacher for this reporter
            const { data: classroom } = await supabase
                .from('classrooms')
                .select('teacher_id')
                .eq('school_id', reporterData.school_id)
                .is('is_archived', false)
                .limit(1) // Simplified: pick first active classroom
                .single();
            
            assignedHandlerId = classroom?.teacher_id || null;
        } else if (params.report_target === 'principal' && reporterData?.school_id) {
            const { data: principal } = await supabase
                .from('users')
                .select('id')
                .eq('school_id', reporterData.school_id)
                .eq('role', 'principal')
                .limit(1)
                .single();
            
            assignedHandlerId = principal?.id || null;
        }

        const { data, error } = await supabase
            .from('community_reports')
            .insert([{ 
                reporter_id: reporterId,
                post_id: params.postId,
                group_id: params.groupId,
                target_user_id: params.targetUserId,
                reason: params.reason,
                report_target: params.report_target,
                assigned_handler_id: assignedHandlerId,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Create a Sanctuary Group (Classroom-linked)
     */
    async createSanctuaryGroup(input: any) {
        const { data, error } = await supabase
            .from('community_groups')
            .insert([{
                ...input,
                type: 'class',
                visibility: 'class',
                join_policy: 'restricted',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return data as CommunityGroup;
    },

    // ── Direct Messaging ──────────────────────────────────────

    /**
     * Get all active direct conversations for the current user.
     */
    async getDirectConversations() {
        const userId = await identityAPI.getMyInternalId();
        if (!userId) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('direct_conversations')
            .select(`
                *,
                user1:users!direct_conversations_user1_id_fkey(full_name, avatar_url),
                user2:users!direct_conversations_user2_id_fkey(full_name, avatar_url)
            `)
            .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        // Transform to return the "other" participant's info easily
        return (data || []).map((conv: any) => {
            const otherUser = conv.user1_id === userId ? conv.user2 : conv.user1;
            return {
                ...conv,
                other_user_name: otherUser?.full_name || 'Anonymous User',
                other_user_avatar: otherUser?.avatar_url,
            };
        });
    },

    /**
     * Get or create a 1:1 conversation with another user.
     */
    async getOrCreateDirectConversation(targetUserId: string): Promise<string> {
        const { data, error } = await supabase.rpc('get_or_create_direct_conversation', {
            target_user_id: targetUserId
        });

        if (error) throw error;
        return data;
    },

    /**
     * Fetch the most recent direct messages for a conversation.
     */
    async getDirectMessages(conversationId: string, limit = 60, viewDate?: string) {
        let query = supabase
            .from('direct_messages')
            .select('*, author:users!direct_messages_author_id_fkey(full_name, avatar_url)')
            .eq('conversation_id', conversationId);

        if (viewDate) {
            query = applyTemporalFilter(query, viewDate);
        } else {
            query = query.order('created_at', { ascending: false }).limit(limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        // Reverse so oldest is at top
        return (data || []).reverse();
    },

    /**
     * Send a direct message.
     */
    async sendDirectMessage(conversationId: string, content: string) {
        const userId = await identityAPI.getMyInternalId();
        if (!userId) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('direct_messages')
            .insert([{
                conversation_id: conversationId,
                author_id: userId,
                content: content.trim()
            }])
            .select('*, author:users!direct_messages_author_id_fkey(full_name, avatar_url)')
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Cast or toggle a vote in a community poll.
     *
     * Single-choice (allowMultiple = false):
     *   Tap same option → retract (returns []). Tap different → replace.
     *
     * Multi-choice (allowMultiple = true):
     *   Tap unselected → add. Tap selected → remove (toggle).
     *
     * Returns the caller's active option IDs after the operation.
     */
    async voteInPoll(
        postId: string,
        optionId: string,
        allowMultiple: boolean = false,
    ): Promise<string[]> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) throw new Error('Authentication required');

        const { data: existing, error: fetchErr } = await supabase
            .from('community_poll_votes')
            .select('option_id')
            .eq('post_id', postId)
            .eq('user_id', myId);
        if (fetchErr) throw new Error(fetchErr.message);

        const existingIds: string[] = (existing ?? []).map((r: any) => r.option_id);
        const alreadyVotedThis = existingIds.includes(optionId);

        if (allowMultiple) {
            if (alreadyVotedThis) {
                const { error } = await supabase
                    .from('community_poll_votes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', myId)
                    .eq('option_id', optionId);
                if (error) throw new Error(error.message);
                return existingIds.filter(id => id !== optionId);
            } else {
                const { error } = await supabase
                    .from('community_poll_votes')
                    .insert({ post_id: postId, user_id: myId, option_id: optionId });
                if (error) throw new Error(error.message);
                return [...existingIds, optionId];
            }
        } else {
            if (alreadyVotedThis) {
                const { error } = await supabase
                    .from('community_poll_votes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', myId);
                if (error) throw new Error(error.message);
                return [];
            } else {
                await supabase
                    .from('community_poll_votes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', myId);
                const { error } = await supabase
                    .from('community_poll_votes')
                    .insert({ post_id: postId, user_id: myId, option_id: optionId });
                if (error) throw new Error(error.message);
                return [optionId];
            }
        }
    },

    /**
     * Completely remove all of the current user's votes from a poll.
     * Used by the explicit "Remove my vote" action.
     */
    async retractAllVotes(postId: string): Promise<void> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) throw new Error('Authentication required');

        const { error } = await supabase
            .from('community_poll_votes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', myId);
        if (error) throw new Error(error.message);
    },

    /**
     * Block a user
     */
    async blockUser(targetUserId: string): Promise<void> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) throw new Error('Authentication required');

        const { error } = await supabase
            .from('user_blocks')
            .insert([{
                blocker_id: myId,
                blocked_id: targetUserId
            }]);

        if (error && error.code !== '23505') throw error;
    },

    /**
     * Unblock a user
     */
    async unblockUser(targetUserId: string): Promise<void> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) throw new Error('Authentication required');

        const { error } = await supabase
            .from('user_blocks')
            .delete()
            .eq('blocker_id', myId)
            .eq('blocked_id', targetUserId);

        if (error) throw error;
    },

    /**
     * Check if a user is blocked by me or has blocked me
     */
    async isBlockingActive(targetUserId: string): Promise<boolean> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) return false;

        const { data, error } = await supabase
            .from('user_blocks')
            .select('blocker_id')
            .or(`and(blocker_id.eq.${myId},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${myId})`)
            .maybeSingle();

        if (error) throw error;
        return !!data;
    },

    /**
     * Get aggregate resonance for a user's content.
     */
    async getCommunityResonance(userId: string) {
        // Prefer the view, but do not hard-code optional column names.
        // Some DB states expose `reaction_count` while others expose `likes_count`.
        const { data, error } = await supabase
            .from('community_posts_with_counts')
            .select('*')
            .eq('author_id', userId);

        if (!error) {
            return (data || []).reduce(
                (acc, curr: any) => ({
                    likes: acc.likes + (curr.likes_count ?? curr.reaction_count ?? curr.reactions_count ?? 0),
                    comments: acc.comments + (curr.comments_count ?? curr.comment_count ?? 0),
                    shares: acc.shares + (curr.shares_count ?? curr.share_count ?? 0),
                }),
                { likes: 0, comments: 0, shares: 0 }
            );
        }

        // Fallback path for environments where the view is missing/outdated.
        const { data: posts, error: postsError } = await supabase
            .from('community_posts')
            .select('id, comments_count, comment_count, shares_count, share_count')
            .eq('author_id', userId);

        if (postsError) throw postsError;

        const postIds = (posts || []).map((p: any) => p.id).filter(Boolean);
        let likes = 0;
        if (postIds.length > 0) {
            const { count, error: reactionError } = await supabase
                .from('community_reactions')
                .select('id', { count: 'exact', head: true })
                .in('post_id', postIds);
            if (reactionError) throw reactionError;
            likes = count || 0;
        }

        const comments = (posts || []).reduce(
            (sum: number, p: any) => sum + (p.comments_count ?? p.comment_count ?? 0),
            0
        );
        const shares = (posts || []).reduce(
            (sum: number, p: any) => sum + (p.shares_count ?? p.share_count ?? 0),
            0
        );

        return { likes, comments, shares };
    },

    /**
     * Get list of muted (blocked) users
     */
    async getMutedUsers() {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) return [];

        const { data, error } = await supabase
            .from('user_blocks')
            .select(`
                blocked_id, 
                blocked:users(id, full_name, avatar_url)
            `)
            .eq('blocker_id', myId);

        if (error) throw error;
        return (data || []).map((b: any) => b.blocked).filter(Boolean);
    },

    // ── COMMENTS ─────────────────────────────────────────────────────────────

    /**
     * Fetch comments for a post, newest first up to `limit`.
     * Each comment includes the author's name/avatar and the caller's upvote state.
     */
    async getComments(postId: string, limit = 60): Promise<Comment[]> {
        const myId = await identityAPI.getMyInternalId();

        const { data, error } = await supabase
            .from('community_comments')
            .select(`
                id,
                post_id,
                content,
                is_anonymous,
                is_official_answer,
                upvote_count,
                created_at,
                updated_at,
                author_id,
                author:users!community_comments_author_id_fkey(
                    id,
                    full_name,
                    avatar_url,
                    role
                )
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw new Error(error.message);

        // Fetch caller's upvotes in one query
        let upvotedIds = new Set<string>();
        if (myId && data && data.length > 0) {
            const { data: uv } = await supabase
                .from('community_comment_upvotes')
                .select('comment_id')
                .eq('user_id', myId)
                .in('comment_id', data.map((c: any) => c.id));
            (uv ?? []).forEach((r: any) => upvotedIds.add(r.comment_id));
        }

        return (data ?? []).map((c: any) => ({
            id: c.id,
            post_id: c.post_id,
            content: c.content,
            is_anonymous: c.is_anonymous,
            is_official_answer: c.is_official_answer,
            upvotes: c.upvote_count ?? 0,
            has_upvoted: upvotedIds.has(c.id),
            created_at: c.created_at,
            updated_at: c.updated_at,
            author_id: c.author_id,
            author_name: c.is_anonymous ? 'Anonymous' : (c.author?.full_name ?? 'Unknown'),
            author_avatar: c.is_anonymous ? null : (c.author?.avatar_url ?? null),
            author_role: c.author?.role ?? 'student',
        } as Comment));
    },

    /**
     * Create a new comment on a post.
     * Returns the full comment object (with optimistic author data).
     */
    async createComment(
        postId: string,
        content: string,
        isAnonymous = false,
    ): Promise<Comment> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) throw new Error('Authentication required');

        // Fetch caller profile for optimistic return
        const { data: me } = await supabase
            .from('users')
            .select('full_name, avatar_url, role')
            .eq('id', myId)
            .maybeSingle();

        const { data, error } = await supabase
            .from('community_comments')
            .insert({
                post_id: postId,
                author_id: myId,
                content: content.trim(),
                is_anonymous: isAnonymous,
            })
            .select('id, post_id, content, is_anonymous, is_official_answer, upvote_count, created_at, updated_at, author_id')
            .single();

        if (error) throw new Error(error.message);

        // Increment comment_count on the post (best-effort, trigger should also do it)
        await supabase.rpc('increment_comment_count', { p_post_id: postId }).catch(() => null);

        return {
            id: data.id,
            post_id: data.post_id,
            content: data.content,
            is_anonymous: data.is_anonymous,
            is_official_answer: data.is_official_answer,
            upvotes: 0,
            has_upvoted: false,
            created_at: data.created_at,
            updated_at: data.updated_at,
            author_id: data.author_id,
            author_name: isAnonymous ? 'Anonymous' : (me?.full_name ?? 'Me'),
            author_avatar: isAnonymous ? null : (me?.avatar_url ?? null),
            author_role: me?.role ?? 'student',
        } as Comment;
    },

    /**
     * Delete a comment.  Only the comment author can delete (enforced by RLS too).
     */
    async deleteComment(commentId: string): Promise<void> {
        const { error } = await supabase
            .from('community_comments')
            .delete()
            .eq('id', commentId);
        if (error) throw new Error(error.message);
    },

    /**
     * Toggle upvote on a comment.  Returns true if now upvoted, false if retracted.
     */
    async toggleCommentUpvote(commentId: string): Promise<boolean> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) throw new Error('Authentication required');

        const { data: existing } = await supabase
            .from('community_comment_upvotes')
            .select('comment_id')
            .eq('comment_id', commentId)
            .eq('user_id', myId)
            .maybeSingle();

        if (existing) {
            await supabase
                .from('community_comment_upvotes')
                .delete()
                .eq('comment_id', commentId)
                .eq('user_id', myId);
            // Decrement counter
            await supabase.rpc('decrement_comment_upvote', { p_comment_id: commentId }).catch(() => null);
            return false;
        } else {
            await supabase
                .from('community_comment_upvotes')
                .insert({ comment_id: commentId, user_id: myId });
            await supabase.rpc('increment_comment_upvote', { p_comment_id: commentId }).catch(() => null);
            return true;
        }
    },

    /**
     * Mark a comment as the official answer to a question.
     * Only the post author should call this.
     */
    async markOfficialAnswer(commentId: string, isOfficial: boolean): Promise<void> {
        const { error } = await supabase
            .from('community_comments')
            .update({ is_official_answer: isOfficial })
            .eq('id', commentId);
        if (error) throw new Error(error.message);
    },

    // ── POST MANAGEMENT ───────────────────────────────────────────────────────

    /**
     * Hard-delete a post.  Only the post author can do this (RLS enforced).
     */
    async deletePost(postId: string): Promise<void> {
        const { error } = await supabase
            .from('community_posts')
            .delete()
            .eq('id', postId);
        if (error) throw new Error(error.message);
    },

    /**
     * Edit the text content of an existing post.
     * Only the post author can do this (RLS enforced).
     */
    async updatePost(postId: string, content: string): Promise<void> {
        const { error } = await supabase
            .from('community_posts')
            .update({ content: content.trim(), updated_at: new Date().toISOString() })
            .eq('id', postId);
        if (error) throw new Error(error.message);
    },

    // ── RESONANCE (✨ Sparkles) ────────────────────────────────────────────────

    /**
     * Toggle a ✨ resonance reaction on a post (separate from ❤️ likes).
     * Returns true if now resonated, false if retracted.
     */
    async toggleResonance(postId: string): Promise<boolean> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) throw new Error('Authentication required');

        const { data: existing } = await supabase
            .from('community_reactions')
            .select('user_id')
            .eq('post_id', postId)
            .eq('user_id', myId)
            .eq('reaction_code', '✨')
            .maybeSingle();

        if (existing) {
            await supabase
                .from('community_reactions')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', myId)
                .eq('reaction_code', '✨');
            return false;
        } else {
            await supabase
                .from('community_reactions')
                .insert({ post_id: postId, user_id: myId, reaction_code: '✨' });
            return true;
        }
    },

    /**
     * Fetch whether the current user has resonated with a post.
     */
    async hasResonated(postId: string): Promise<boolean> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) return false;
        const { data } = await supabase
            .from('community_reactions')
            .select('user_id')
            .eq('post_id', postId)
            .eq('user_id', myId)
            .eq('reaction_code', '✨')
            .maybeSingle();
        return !!data;
    },

    // ── NOTIFICATIONS ─────────────────────────────────────────────────────────

    /**
     * Fetch the caller's notifications, newest first.
     */
    async getNotifications(limit = 30): Promise<import('../types/Community').Notification[]> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) return [];

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', myId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw new Error(error.message);
        return (data ?? []) as import('../types/Community').Notification[];
    },

    /** Count of unread notifications for the current user. */
    async getUnreadNotificationCount(): Promise<number> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) return 0;
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', myId)
            .eq('is_read', false);
        if (error) return 0;
        return count ?? 0;
    },

    /** Mark a single notification as read. */
    async markNotificationRead(notificationId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', notificationId);
        if (error) throw new Error(error.message);
    },

    /** Mark ALL of the current user's notifications as read. */
    async markAllNotificationsRead(): Promise<void> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) return;
        await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('user_id', myId)
            .eq('is_read', false);
    },
};
