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
     * Cast a vote in a community poll.
     */
    async voteInPoll(postId: string, optionId: string): Promise<void> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) throw new Error('Authentication required');

        const { error } = await supabase
            .from('community_poll_votes')
            .insert([{
                post_id: postId,
                user_id: myId,
                option_id: optionId
            }]);

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                throw new Error('You have already voted in this poll');
            }
            throw new Error(error.message);
        }
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
        const { data, error } = await supabase
            .from('community_posts_with_counts')
            .select('likes_count, comments_count, shares_count')
            .eq('author_id', userId);

        if (error) throw error;

        return (data || []).reduce(
            (acc, curr) => ({
                likes: acc.likes + (curr.likes_count || 0),
                comments: acc.comments + (curr.comments_count || 0),
                shares: acc.shares + (curr.shares_count || 0),
            }),
            { likes: 0, comments: 0, shares: 0 }
        );
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
    }
};
