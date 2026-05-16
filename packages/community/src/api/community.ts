import {
	communityAPI as coreCommunityAPI,
	communityContract,
	identityAPI,
	supabase,
} from "@repo/core/api";
import { createPOAProxy } from "@repo/core/api/poaProxy";
import { applyTemporalFilter } from "@repo/core/logic";

import type { Comment, CommunityGroup, GroupFilters, Post } from "../types";

/**
 * Community API
 *
 * Canonical shared behavior lives in @repo/core.
 * This package keeps only community-specific extensions that are not yet
 * contract-backed in core, while delegating all shared reads/writes to the
 * canonical core API.
 */
const rawCommunityAPI = {
	...coreCommunityAPI,
	async getAnnouncements(schoolId: string) {
		const { data, error } = await supabase
			.from("announcements")
			.select(`
                *,
                author:users!announcements_author_id_fkey(
                    full_name,
                    avatar_url
                )
            `)
			.eq("school_id", schoolId)
			.order("is_pinned", { ascending: false })
			.order("created_at", { ascending: false });
		if (error) throw error;
		return (data || []).map((announcement: any) => ({
			...announcement,
			author_name: announcement.author?.full_name,
			author_avatar: announcement.author?.avatar_url,
		}));
	},
	async createAnnouncement(
		schoolId: string,
		authorId: string,
		content: string,
		isPinned: boolean = false,
	) {
		const { data, error } = await supabase
			.from("announcements")
			.insert([
				{
					school_id: schoolId,
					author_id: authorId,
					content,
					is_pinned: isPinned,
					created_at: new Date().toISOString(),
				},
			])
			.select()
			.single();
		if (error) throw error;
		return data;
	},
	async getGroups(filters: GroupFilters) {
		let query = supabase.from("community_groups").select("*");
		if (filters.is_public !== undefined) {
			query = query.eq("is_public", filters.is_public);
		}
		if (filters.join_policy) {
			query = query.eq("join_policy", filters.join_policy);
		}
		if (filters.school_id) {
			query = query.eq("school_id", filters.school_id);
		}
		if (filters.type) {
			query = query.eq("group_type", filters.type);
		}
		if (filters.search) {
			query = query.ilike("name", `%${filters.search}%`);
		}
		const offset = filters.offset ?? 0;
		const limit = filters.limit ?? 10;
		const { data, error } = await query
			.range(offset, offset + limit - 1)
			.order("created_at", { ascending: false });
		if (error) throw error;
		return (data || []).map((group: any) => ({
			...group,
			type: group.group_type || group.type || "general",
		})) as CommunityGroup[];
	},
	async searchGroups(query: string, filters: Partial<GroupFilters> = {}) {
		return this.getGroups({ ...filters, search: query });
	},
	async getPosts(filters: {
		limit: number;
		offset: number;
		groupId?: string;
		viewDate?: string;
		viewScale?: import("@repo/core/store").TemporalScale;
	}) {
		let query = supabase
			.from("community_posts_with_counts")
			.select("*")
			.range(filters.offset, filters.offset + filters.limit - 1);
		if (filters.viewDate) {
			query = applyTemporalFilter(query, {
				column: "created_at",
				mode: "event_time",
				capability: "event_stream",
				scale: filters.viewScale,
			});
		} else {
			query = query.order("created_at", { ascending: false });
		}
		if (filters.groupId && filters.groupId !== "all") {
			query = query.eq("group_id", filters.groupId);
		}
		const { data, error } = await query;
		if (error) throw error;
		return data as Post[];
	},
	async createPost(
		post: any,
		userId: string,
		userCapacity: string,
		schoolId: string,
	) {
		const { data, error } = await supabase
			.from("community_posts")
			.insert([
				{
					...post,
					author_id: userId,
					author_capacity: userCapacity,
					school_id: schoolId,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				},
			])
			.select()
			.single();
		if (error) throw error;
		return data as Post;
	},
	async createGroup(group: any, userId: string, _userCapacity: string) {
		const { data, error } = await supabase
			.from("community_groups")
			.insert([
				{
					...group,
					created_by: userId,
					created_at: new Date().toISOString(),
				},
			])
			.select()
			.single();
		if (error) throw error;
		return data as CommunityGroup;
	},
	async createGroupWithOwner(
		group: any,
		userId: string,
	): Promise<CommunityGroup> {
		const { data: created, error: groupErr } = await supabase
			.from("community_groups")
			.insert([
				{
					name: group.name,
					handle: group.handle ?? null,
					description: group.description ?? null,
					group_type: group.group_type ?? "general",
					join_policy: group.join_policy ?? "open",
					school_id: group.school_id ?? null,
					image_url: group.image_url ?? null,
					created_by: userId,
					created_at: new Date().toISOString(),
				},
			])
			.select()
			.single();
		if (groupErr) throw groupErr;
		const { error: memberErr } = await supabase
			.from("community_group_members")
			.insert([
				{
					group_id: created.id,
					user_id: userId,
					capacity: "owner",
					status: "active",
				},
			]);
		if (memberErr)
			console.warn("createGroupWithOwner: member insert warning", memberErr);
		return {
			...created,
			type: created.group_type || "general",
		} as CommunityGroup;
	},
	async joinGroup(
		groupId: string,
		userId: string,
		joinPolicy: string = "open",
	) {
		const status = joinPolicy === "open" ? "active" : "pending";
		const { data, error } = await supabase
			.from("community_group_members")
			.upsert(
				[
					{
						group_id: groupId,
						user_id: userId,
						capacity: "member",
						status,
					},
				],
				{ onConflict: "group_id,user_id" },
			)
			.select()
			.single();
		if (error) throw error;
		return data;
	},
	async getGroupById(groupId: string): Promise<CommunityGroup> {
		const { data, error } = await supabase
			.from("community_groups")
			.select("*")
			.eq("id", groupId)
			.single();
		if (error) throw error;
		return {
			...(data as any),
			type: (data as any).group_type || (data as any).type || "general",
		} as CommunityGroup;
	},
	async getGroupMessages(
		groupId: string,
		limit = 60,
		viewDate?: string,
		viewScale?: import("@repo/core/store").TemporalScale,
	) {
		let query = supabase
			.from("group_messages")
			.select(
				"*, author:users!group_messages_author_id_fkey(full_name, avatar_url)",
			)
			.eq("group_id", groupId);
		if (viewDate) {
			query = applyTemporalFilter(query, {
				column: "created_at",
				mode: "event_time",
				capability: "event_stream",
				scale: viewScale,
			});
		} else {
			query = query.order("created_at", { ascending: false }).limit(limit);
		}
		const { data, error } = await query;
		if (error) throw error;
		return (data || []).reverse();
	},
	async sendGroupMessage(groupId: string, content: string) {
		const userId = await identityAPI.getMyInternalId();
		if (!userId) throw new Error("Not authenticated");
		const { data, error } = await supabase
			.from("group_messages")
			.insert([
				{ group_id: groupId, author_id: userId, content: content.trim() },
			])
			.select(
				"*, author:users!group_messages_author_id_fkey(full_name, avatar_url)",
			)
			.single();
		if (error) throw error;
		return data;
	},
	async togglePostReaction(postId: string, userId: string): Promise<boolean> {
		const { data: existing } = await supabase
			.from("community_reactions")
			.select("user_id")
			.eq("post_id", postId)
			.eq("user_id", userId)
			.maybeSingle();
		if (existing) {
			await supabase
				.from("community_reactions")
				.delete()
				.eq("post_id", postId)
				.eq("user_id", userId);
			return false;
		}
		await supabase
			.from("community_reactions")
			.insert([{ post_id: postId, user_id: userId, reaction_code: "d" }]);
		return true;
	},
	async handleMemberRequest(
		groupId: string,
		userId: string,
		status: "active" | "rejected",
	) {
		const { data, error } = await supabase
			.from("community_group_members")
			.update({ status })
			.eq("group_id", groupId)
			.eq("user_id", userId)
			.select()
			.single();
		if (error) throw error;
		return data;
	},
	async updateJoiningPolicy(groupId: string, newPolicy: string) {
		const { data, error } = await supabase
			.from("community_groups")
			.update({ join_policy: newPolicy })
			.eq("id", groupId)
			.select()
			.single();
		if (error) throw error;
		return data;
	},
	async getDirectConversations() {
		const userId = await identityAPI.getMyInternalId();
		if (!userId) throw new Error("Not authenticated");
		const { data, error } = await supabase
			.from("direct_conversations")
			.select(`
                *,
                user1:users!direct_conversations_user1_id_fkey(full_name, avatar_url),
                user2:users!direct_conversations_user2_id_fkey(full_name, avatar_url)
            `)
			.or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
			.order("updated_at", { ascending: false });
		if (error) throw error;
		return (data || []).map((conv: any) => {
			const otherUser = conv.user1_id === userId ? conv.user2 : conv.user1;
			return {
				...conv,
				other_user_name: otherUser?.full_name || "Anonymous User",
				other_user_avatar: otherUser?.avatar_url,
			};
		});
	},
	async getOrCreateDirectConversation(targetUserId: string): Promise<string> {
		const { data, error } = await supabase.rpc(
			"get_or_create_direct_conversation",
			{
				target_user_id: targetUserId,
			},
		);
		if (error) throw error;
		return data;
	},
	async getDirectMessages(
		conversationId: string,
		limit = 60,
		viewDate?: string,
		viewScale?: import("@repo/core/store").TemporalScale,
	) {
		let query = supabase
			.from("direct_messages")
			.select(
				"*, author:users!direct_messages_author_id_fkey(full_name, avatar_url)",
			)
			.eq("conversation_id", conversationId);
		if (viewDate) {
			query = applyTemporalFilter(query, {
				column: "created_at",
				mode: "event_time",
				capability: "event_stream",
				scale: viewScale,
			});
		} else {
			query = query.order("created_at", { ascending: false }).limit(limit);
		}
		const { data, error } = await query;
		if (error) throw error;
		return (data || []).reverse();
	},
	async sendDirectMessage(conversationId: string, content: string) {
		const userId = await identityAPI.getMyInternalId();
		if (!userId) throw new Error("Not authenticated");
		const { data, error } = await supabase
			.from("direct_messages")
			.insert([
				{
					conversation_id: conversationId,
					author_id: userId,
					content: content.trim(),
				},
			])
			.select(
				"*, author:users!direct_messages_author_id_fkey(full_name, avatar_url)",
			)
			.single();
		if (error) throw error;
		return data;
	},
	async voteInPoll(
		postId: string,
		optionId: string,
		allowMultiple: boolean = false,
	): Promise<string[]> {
		const myId = await identityAPI.getMyInternalId();
		if (!myId) throw new Error("Authentication required");
		const { data: existing, error: fetchErr } = await supabase
			.from("community_poll_votes")
			.select("option_id")
			.eq("post_id", postId)
			.eq("user_id", myId);
		if (fetchErr) throw new Error(fetchErr.message);
		const existingIds: string[] = (existing ?? []).map(
			(row: any) => row.option_id,
		);
		const alreadyVotedThis = existingIds.includes(optionId);
		if (allowMultiple) {
			if (alreadyVotedThis) {
				const { error } = await supabase
					.from("community_poll_votes")
					.delete()
					.eq("post_id", postId)
					.eq("user_id", myId)
					.eq("option_id", optionId);
				if (error) throw new Error(error.message);
				return existingIds.filter((id) => id !== optionId);
			}
			const { error } = await supabase
				.from("community_poll_votes")
				.insert({ post_id: postId, user_id: myId, option_id: optionId });
			if (error) throw new Error(error.message);
			return [...existingIds, optionId];
		}
		if (alreadyVotedThis) {
			const { error } = await supabase
				.from("community_poll_votes")
				.delete()
				.eq("post_id", postId)
				.eq("user_id", myId);
			if (error) throw new Error(error.message);
			return [];
		}
		await supabase
			.from("community_poll_votes")
			.delete()
			.eq("post_id", postId)
			.eq("user_id", myId);
		const { error } = await supabase
			.from("community_poll_votes")
			.insert({ post_id: postId, user_id: myId, option_id: optionId });
		if (error) throw new Error(error.message);
		return [optionId];
	},
	async getPendingMembers(groupId: string) {
		const { data, error } = await supabase
			.from("community_group_members")
			.select(`
                *,
                user:users!community_group_members_user_id_fkey(
                    full_name,
                    capacity,
                    avatar_url,
                    index_number,
                    nic_number
                )
            `)
			.eq("group_id", groupId)
			.eq("status", "pending");
		if (error) throw error;
		return data;
	},
	async getActiveMembers(groupId: string) {
		const { data, error } = await supabase
			.from("community_group_members")
			.select(`
                *,
                user:users!community_group_members_user_id_fkey(
                    full_name,
                    capacity,
                    avatar_url,
                    index_number,
                    nic_number
                )
            `)
			.eq("group_id", groupId)
			.eq("status", "active")
			.order("capacity", { ascending: true });
		if (error) throw error;
		return (data || []).map((member: any) => ({
			...member,
			capacity: member.capacity || "member",
		}));
	},
	async updateMemberCapacity(
		groupId: string,
		userId: string,
		newCapacity: "admin" | "member",
	) {
		const { data, error } = await supabase
			.from("community_group_members")
			.update({ capacity: newCapacity })
			.eq("group_id", groupId)
			.eq("user_id", userId)
			.select()
			.single();
		if (error) throw error;
		return data;
	},
	async approveAllPending(groupId: string) {
		const { data, error } = await supabase
			.from("community_group_members")
			.update({ status: "active" })
			.eq("group_id", groupId)
			.eq("status", "pending");
		if (error) throw error;
		return data;
	},
	async updateGroup(groupId: string, updates: Partial<CommunityGroup>) {
		const { data, error } = await supabase
			.from("community_groups")
			.update(updates)
			.eq("id", groupId)
			.select()
			.single();
		if (error) throw error;
		return data as CommunityGroup;
	},
	async reportContent(
		params: {
			postId?: string;
			groupId?: string;
			targetUserId?: string;
			reason: string;
			report_target: "teacher" | "principal" | "platform";
		},
		reporterId: string,
	) {
		let assignedHandlerId: string | null = null;
		const { data: reporterData } = await supabase
			.from("users")
			.select("school_id, section_id, grade_id")
			.eq("id", reporterId)
			.single();
		if (params.report_target === "teacher" && reporterData?.school_id) {
			const { data: classroom } = await supabase
				.from("classrooms")
				.select("teacher_id")
				.eq("school_id", reporterData.school_id)
				.is("is_archived", false)
				.limit(1)
				.single();
			assignedHandlerId = classroom?.teacher_id || null;
		} else if (
			params.report_target === "principal" &&
			reporterData?.school_id
		) {
			const { data: principal } = await supabase
				.from("users")
				.select("id")
				.eq("school_id", reporterData.school_id)
				.eq("capacity", "principal")
				.limit(1)
				.single();
			assignedHandlerId = principal?.id || null;
		}
		const { data, error } = await supabase
			.from("community_reports")
			.insert([
				{
					reporter_id: reporterId,
					post_id: params.postId,
					group_id: params.groupId,
					target_user_id: params.targetUserId,
					reason: params.reason,
					report_target: params.report_target,
					assigned_handler_id: assignedHandlerId,
					status: "pending",
				},
			])
			.select()
			.single();
		if (error) throw error;
		return data;
	},
	async createSanctuaryGroup(input: any) {
		const { data, error } = await supabase
			.from("community_groups")
			.insert([
				{
					...input,
					type: "class",
					visibility: "class",
					join_policy: "restricted",
					created_at: new Date().toISOString(),
				},
			])
			.select()
			.single();
		if (error) throw error;
		return data as CommunityGroup;
	},
	async retractAllVotes(postId: string): Promise<void> {
		const myId = await identityAPI.getMyInternalId();
		if (!myId) throw new Error("Authentication required");
		const { error } = await supabase
			.from("community_poll_votes")
			.delete()
			.eq("post_id", postId)
			.eq("user_id", myId);
		if (error) throw new Error(error.message);
	},
	async getComments(
		postId: string,
		limit = 60,
		options: {
			viewDate?: string;
			viewScale?: import("@repo/core/store").TemporalScale;
		} = {},
	): Promise<Comment[]> {
		const myId = await identityAPI.getMyInternalId();
		let query = supabase
			.from("community_comments")
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
                    capacity
                )
            `)
			.eq("post_id", postId);
		if (options.viewDate) {
			query = applyTemporalFilter(query, {
				column: "created_at",
				mode: "event_time",
				capability: "event_stream",
				scale: options.viewScale,
			});
		} else {
			query = query.order("created_at", { ascending: false }).limit(limit);
		}
		const { data, error } = await query;
		if (error) throw new Error(error.message);
		const upvotedIds = new Set<string>();
		if (myId && data && data.length > 0) {
			const { data: uv } = await supabase
				.from("community_comment_upvotes")
				.select("comment_id")
				.eq("user_id", myId)
				.in(
					"comment_id",
					data.map((c: any) => c.id),
				);
			(uv ?? []).forEach((row: any) => upvotedIds.add(row.comment_id));
		}
		return (data ?? []).map(
			(c: any) =>
				({
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
					author_name: c.is_anonymous
						? "Anonymous"
						: (c.author?.full_name ?? "Unknown"),
					author_avatar: c.is_anonymous ? null : (c.author?.avatar_url ?? null),
					author_capacity: c.author?.capacity ?? "student",
				}) as Comment,
		);
	},
	async createComment(
		postId: string,
		content: string,
		isAnonymous = false,
	): Promise<Comment> {
		const myId = await identityAPI.getMyInternalId();
		if (!myId) throw new Error("Authentication required");
		const { data: me } = await supabase
			.from("users")
			.select("full_name, avatar_url, capacity")
			.eq("id", myId)
			.maybeSingle();
		const { data, error } = await supabase
			.from("community_comments")
			.insert({
				post_id: postId,
				author_id: myId,
				content: content.trim(),
				is_anonymous: isAnonymous,
			})
			.select(
				"id, post_id, content, is_anonymous, is_official_answer, upvote_count, created_at, updated_at, author_id",
			)
			.single();
		if (error) throw new Error(error.message);
		const { error: incrementCountError } = await supabase.rpc(
			"increment_comment_count",
			{
				p_post_id: postId,
			},
		);
		if (incrementCountError) {
			console.warn(
				"[communityAPI] increment_comment_count failed:",
				incrementCountError.message,
			);
		}
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
			author_name: isAnonymous ? "Anonymous" : (me?.full_name ?? "Me"),
			author_avatar: isAnonymous ? null : (me?.avatar_url ?? null),
			author_capacity: (me as any)?.capacity ?? "student",
		} as Comment;
	},
	async deleteComment(commentId: string): Promise<void> {
		const { error } = await supabase
			.from("community_comments")
			.delete()
			.eq("id", commentId);
		if (error) throw new Error(error.message);
	},
	async toggleCommentUpvote(commentId: string): Promise<boolean> {
		const myId = await identityAPI.getMyInternalId();
		if (!myId) throw new Error("Authentication required");
		const { data: existing } = await supabase
			.from("community_comment_upvotes")
			.select("comment_id")
			.eq("comment_id", commentId)
			.eq("user_id", myId)
			.maybeSingle();
		if (existing) {
			await supabase
				.from("community_comment_upvotes")
				.delete()
				.eq("comment_id", commentId)
				.eq("user_id", myId);
			const { error: decrementUpvoteError } = await supabase.rpc(
				"decrement_comment_upvote",
				{
					p_comment_id: commentId,
				},
			);
			if (decrementUpvoteError) {
				console.warn(
					"[communityAPI] decrement_comment_upvote failed:",
					decrementUpvoteError.message,
				);
			}
			return false;
		}
		await supabase
			.from("community_comment_upvotes")
			.insert({ comment_id: commentId, user_id: myId });
		const { error: incrementUpvoteError } = await supabase.rpc(
			"increment_comment_upvote",
			{
				p_comment_id: commentId,
			},
		);
		if (incrementUpvoteError) {
			console.warn(
				"[communityAPI] increment_comment_upvote failed:",
				incrementUpvoteError.message,
			);
		}
		return true;
	},
	async markOfficialAnswer(
		commentId: string,
		isOfficial: boolean,
	): Promise<void> {
		const { error } = await supabase
			.from("community_comments")
			.update({ is_official_answer: isOfficial })
			.eq("id", commentId);
		if (error) throw new Error(error.message);
	},
	async deletePost(postId: string): Promise<void> {
		const { error } = await supabase
			.from("community_posts")
			.delete()
			.eq("id", postId);
		if (error) throw new Error(error.message);
	},
	async updatePost(postId: string, content: string): Promise<void> {
		const { error } = await supabase
			.from("community_posts")
			.update({ content: content.trim(), updated_at: new Date().toISOString() })
			.eq("id", postId);
		if (error) throw new Error(error.message);
	},
	async toggleResonance(postId: string): Promise<boolean> {
		const myId = await identityAPI.getMyInternalId();
		if (!myId) throw new Error("Authentication required");
		const { data: existing } = await supabase
			.from("community_reactions")
			.select("user_id")
			.eq("post_id", postId)
			.eq("user_id", myId)
			.eq("reaction_code", "(")
			.maybeSingle();
		if (existing) {
			await supabase
				.from("community_reactions")
				.delete()
				.eq("post_id", postId)
				.eq("user_id", myId)
				.eq("reaction_code", "(");
			return false;
		}
		await supabase
			.from("community_reactions")
			.insert({ post_id: postId, user_id: myId, reaction_code: "(" });
		return true;
	},
	async hasResonated(postId: string): Promise<boolean> {
		const myId = await identityAPI.getMyInternalId();
		if (!myId) return false;
		const { data } = await supabase
			.from("community_reactions")
			.select("user_id")
			.eq("post_id", postId)
			.eq("user_id", myId)
			.eq("reaction_code", "(")
			.maybeSingle();
		return !!data;
	},
	async getNotifications(
		limit = 30,
		options: {
			viewDate?: string;
			viewScale?: import("@repo/core/store").TemporalScale;
		} = {},
	): Promise<import("../types/Community").Notification[]> {
		const myId = await identityAPI.getMyInternalId();
		if (!myId) return [];
		let query = supabase.from("notifications").select("*").eq("user_id", myId);
		if (options.viewDate) {
			query = applyTemporalFilter(query, {
				column: "created_at",
				mode: "event_time",
				capability: "event_stream",
				scale: options.viewScale,
			});
		} else {
			query = query.order("created_at", { ascending: false }).limit(limit);
		}
		const { data, error } = await query;
		if (error) throw new Error(error.message);
		return (data ?? []) as import("../types/Community").Notification[];
	},
	async getUnreadNotificationCount(): Promise<number> {
		const myId = await identityAPI.getMyInternalId();
		if (!myId) return 0;
		const { count, error } = await supabase
			.from("notifications")
			.select("*", { count: "exact", head: true })
			.eq("user_id", myId)
			.eq("is_read", false);
		if (error) return 0;
		return count ?? 0;
	},
	async markNotificationRead(notificationId: string): Promise<void> {
		const { error } = await supabase
			.from("notifications")
			.update({ is_read: true, read_at: new Date().toISOString() })
			.eq("id", notificationId);
		if (error) throw new Error(error.message);
	},
	async markAllNotificationsRead(): Promise<void> {
		const myId = await identityAPI.getMyInternalId();
		if (!myId) return;
		await supabase
			.from("notifications")
			.update({ is_read: true, read_at: new Date().toISOString() })
			.eq("user_id", myId)
			.eq("is_read", false);
	},
	async isBlockingActive(targetUserId: string): Promise<boolean> {
		const myId = await identityAPI.getMyInternalId();
		if (!myId) return false;
		const { data, error } = await supabase
			.from("user_blocks")
			.select("blocker_id")
			.or(
				`and(blocker_id.eq.${myId},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${myId})`,
			)
			.maybeSingle();
		if (error) return false;
		return !!data;
	},
};

export const communityAPI = createPOAProxy(
	"community",
	rawCommunityAPI,
	communityContract,
);
