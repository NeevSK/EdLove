import { supabase } from '@repo/core';
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
        return data as CommunityGroup[];
    },

    /**
     * Get Posts with filtering and pagination
     */
    async getPosts(filters: { limit: number; offset: number; groupId?: string }) {
        let query = supabase
            .from('community_posts')
            .select('*')
            .range(filters.offset, filters.offset + filters.limit - 1)
            .order('created_at', { ascending: false });

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
     * Create a group and immediately add the creator as admin.
     * This is the canonical group-creation entry point — always use this
     * instead of createGroup() to ensure the creator has admin rights.
     */
    async createGroupWithAdmin(group: any, userId: string): Promise<CommunityGroup> {
        // 1. Create the group
        const { data: created, error: groupErr } = await supabase
            .from('community_groups')
            .insert([{
                name: group.name,
                description: group.description ?? null,
                group_type: group.group_type ?? 'general',
                join_policy: group.join_policy ?? 'open',
                school_id: group.school_id ?? null,
                created_by: userId,
                created_at: new Date().toISOString(),
            }])
            .select()
            .single();

        if (groupErr) throw groupErr;

        // 2. Add creator as admin member (status = 'active', role = 'admin')
        const { error: memberErr } = await supabase
            .from('community_group_members')
            .insert([{
                group_id: created.id,
                user_id: userId,
                role: 'admin',
                status: 'active',
            }]);

        // Non-fatal: if this fails (e.g. duplicate), the group still exists.
        if (memberErr) console.warn('createGroupWithAdmin: member insert warning', memberErr);

        return created as CommunityGroup;
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
    async getGroupById(groupId: string) {
        const { data, error } = await supabase
            .from('community_groups')
            .select('*')
            .eq('id', groupId)
            .single();

        if (error) throw error;
        return data as CommunityGroup;
    },

    // ── Group Chat ───────────────────────────────────────────

    /**
     * Fetch the most recent messages for a group, oldest-first for chat display.
     */
    async getGroupMessages(groupId: string, limit = 60) {
        const { data, error } = await supabase
            .from('group_messages')
            .select('*, author:users!group_messages_author_id_fkey(full_name, avatar_url)')
            .eq('group_id', groupId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        // Reverse so oldest is at top
        return (data || []).reverse();
    },

    /**
     * Send a message to a group chat.
     */
    async sendGroupMessage(groupId: string, content: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('group_messages')
            .insert([{ group_id: groupId, author_id: user.id, content: content.trim() }])
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
     * Report content (post/comment)
     */
    async reportContent(input: any, reporterId: string) {
        const { data, error } = await supabase
            .from('community_reports')
            .insert([{ ...input, reporter_id: reporterId }])
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
    }
};
