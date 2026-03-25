import { supabase } from '../lib/supabase';
import { identityAPI } from './identity';
import { growthSignalsAPI } from './growthSignals';
import { impactRipplesAPI } from './impactRipples';
import { applyResonanceFilter } from '../utils/temporalUtils';
// Note: Types should ideally be shared in @repo/core/src/types, 
// for now we use 'any' if types are not yet moved to core to prevent blocking the restoration.
// However, the community package should ideally depend on core for types.

/**
 * Community API
 * 
 * Unified API for community interactions, extending core announcement logic.
 * Restored to @repo/core to serve as the "Highest Common Shared Level" (Upstream).
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
        return data;
    },

    /**
     * Get Posts with filtering and pagination
     */
    async getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string }) {
        let query = supabase
            .from('community_posts')
            .select('*')
            .range(filters.offset, filters.offset + filters.limit - 1);

        if (filters.viewDate) {
            query = applyResonanceFilter(query, 'created_at');
        } else {
            query = query.order('created_at', { ascending: false });
        }

        if (filters.groupId && filters.groupId !== 'all') {
            query = query.eq('group_id', filters.groupId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    /**
     * Create a new post
     */
    async createPost(post: any, userId: string, authorityTier: string, schoolId: string) {
        const { data, error } = await supabase
            .from('community_posts')
            .insert([{
                ...post,
                author_id: userId,
                author_tier: authorityTier,
                school_id: schoolId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        // Growth signal: teacher joined the community conversation (Weaving dimension)
        void growthSignalsAPI.emitSignal(userId, 'community_post_created', {
            post_id: data?.id,
            school_id: schoolId,
        }).catch(() => { });

        return data;
    },

    /**
     * Create a new group and immediately add the creator as owner
     */
    async createGroupWithOwner(group: any, userId: string) {
        const { data, error } = await supabase
            .from('community_groups')
            .insert([{
                ...group,
                creator_id: userId,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        // Add creator as owner in group_members
        await supabase
            .from('group_members')
            .insert([{
                group_id: data.id,
                user_id: userId,
                role: 'owner',
                status: 'active'
            }]);

        // Growth signal: teacher started a community circle (Weaving — Banyan path)
        void growthSignalsAPI.emitSignal(userId, 'circle_facilitated', {
            group_id: data?.id,
        }).catch(() => { });

        return data;
    },

    /**
     * Join a group
     */
    async joinGroup(groupId: string, userId: string, authorityTier: string) {
        // Fetch the group's creator_id before inserting the member record
        const { data: group } = await supabase
            .from('community_groups')
            .select('creator_id')
            .eq('id', groupId)
            .maybeSingle();

        const { data, error } = await supabase
            .from('group_members')
            .insert([{
                group_id: groupId,
                user_id: userId,
                role: authorityTier
            }])
            .select()
            .single();

        if (error) throw error;

        // Growth signal for the person joining (Weaving dimension)
        void growthSignalsAPI.emitSignal(userId, 'group_joined', {
            group_id: groupId,
        }).catch(() => { });

        // Impact Ripple for the circle creator — "someone joined the circle you started"
        if (group?.creator_id && group.creator_id !== userId) {
            void impactRipplesAPI.createRipple({
                recipientUserId: group.creator_id,
                actorUserId: userId,
                rippleType: 'circle_joined',
                sourceEntityType: 'circle',
                sourceEntityId: groupId,
            }).catch(() => { });
        }

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
        return data;
    },

    /**
     * Alias for getGroupById to support the generic Entity pattern
     */
    async get(id: string) {
        return this.getGroupById(id);
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
            query = applyResonanceFilter(query, 'created_at');
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
        const myId = await identityAPI.getMyInternalId();
        if (!myId) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('group_messages')
            .insert([{ group_id: groupId, author_id: myId, content: content.trim() }])
            .select('*, author:users!group_messages_author_id_fkey(full_name, avatar_url)')
            .single();

        if (error) throw error;

        // Growth signal: teacher engaged with the community (Weaving dimension)
        void growthSignalsAPI.emitSignal(myId, 'group_message_sent', {
            group_id: groupId,
        }).catch(() => { });

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
            .from('group_members')
            .select(`
                *,
                user:users!group_members_user_id_fkey(
                    full_name,
                    authority_tier: role,
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
            .from('group_members')
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
            .from('group_members')
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
        return data;
    },

    /**
     * Cast or toggle a vote in a community poll.
     *
     * Single-choice (`allowMultiple = false`):
     *   - Tap a new option  → delete all previous votes for this user, insert new.
     *   - Tap the same option → delete it (retract). Returns [].
     *
     * Multi-choice (`allowMultiple = true`):
     *   - Tap an unselected option → insert it.
     *   - Tap a selected option    → delete it (toggle off).
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

        // Fetch current votes for this user+poll
        const { data: existing, error: fetchErr } = await supabase
            .from('community_poll_votes')
            .select('option_id')
            .eq('post_id', postId)
            .eq('user_id', myId);

        if (fetchErr) throw new Error(fetchErr.message);

        const existingIds: string[] = (existing ?? []).map((r: any) => r.option_id);
        const alreadyVotedThis = existingIds.includes(optionId);

        if (allowMultiple) {
            // Toggle: remove if selected, add if not
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
            // Single-choice: tap same → retract; tap different → replace
            if (alreadyVotedThis) {
                // Retract
                const { error } = await supabase
                    .from('community_poll_votes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', myId);
                if (error) throw new Error(error.message);
                return [];
            } else {
                // Replace: delete previous then insert new
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
            query = applyResonanceFilter(query, 'created_at');
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
};
