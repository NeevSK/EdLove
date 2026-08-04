import { implement } from '../orpc';
import { communityORPCContract } from '@repo/core/api/community.orpc.contract';
import type { ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(communityORPCContract).$context<ORPCContext>();
const iso = (value: unknown) => value ? new Date(value as string | number | Date).toISOString() : new Date(0).toISOString();
const mapGroup = (row: any) => ({ id: String(row.id), name: String(row.name ?? ''), description: row.description ?? null, school_id: String(row.school_id ?? ''), created_by: row.created_by ?? null, group_type: row.group_type ?? null, join_policy: row.join_policy ?? null, is_public: row.is_public !== false, created_at: iso(row.created_at), classroom_id: row.classroom_id ?? null, image_url: row.image_url ?? null, member_count: Number(row.member_count ?? 0), handle: row.handle ?? null });
const mapPost = (row: any) => ({ id: String(row.id), group_id: String(row.group_id), author_id: String(row.author_id), school_id: row.school_id ?? null, content: String(row.content ?? ''), post_type: row.post_type ?? null, author_role: row.author_role ?? null, media_url: row.media_url ?? null, media_type: row.media_type ?? null, created_at: iso(row.created_at), updated_at: iso(row.updated_at), deleted_at: row.deleted_at ? iso(row.deleted_at) : null, author_name: row.author?.full_name ?? null, reaction_count: Number(row.reactions?.length ?? row.reaction_count ?? 0), comment_count: Number(row.comment_count ?? 0) });
const mapComment = (row: any) => ({ id: String(row.id), post_id: String(row.post_id), author_id: row.author_id ?? null, content: String(row.content ?? ''), is_anonymous: row.is_anonymous === true, is_official_answer: row.is_official_answer === true, upvote_count: Number(row.upvote_count ?? row.upvotes?.length ?? 0), created_at: iso(row.created_at), updated_at: iso(row.updated_at), author_name: row.is_anonymous ? null : (row.author?.full_name ?? null) });
const mapGroupMessage = (row: any) => ({ id: String(row.id), group_id: String(row.group_id), author_id: String(row.author_id), content: String(row.content ?? ''), created_at: iso(row.created_at), author_name: row.author?.full_name ?? null, author_avatar_url: row.author?.avatar_url ?? null });
const mapGroupMember = (row: any) => ({ id: String(row.id), group_id: String(row.group_id), user_id: String(row.user_id), role: String(row.role ?? 'member'), status: String(row.status ?? 'active'), joined_at: iso(row.joined_at), user_name: String(row.user?.full_name ?? ''), user_capacity: row.user?.capacity ?? null, user_avatar: row.user?.avatar_url ?? null });

export const communityRouter = impl.router({
  getGroups: impl.getGroups.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).group.findMany({ where: { school_id: input.schoolId || context.schoolId, is_public: input.isPublic, group_type: input.type, name: input.search ? { contains: input.search, mode: 'insensitive' } : undefined }, take: input.limit ?? 20, skip: input.offset ?? 0, orderBy: { created_at: 'desc' } });
    return rows.map(mapGroup);
  }),
  getGroup: impl.getGroup.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).group.findUnique({ where: { id: input.groupId }, include: { members: { take: 5 } } });
    return row ? mapGroup(row) : null;
  }),
  createGroup: impl.createGroup.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).group.create({ data: { name: input.name, description: input.description, school_id: input.schoolId || context.schoolId, created_by: context.user.id, group_type: input.type, join_policy: input.visibility } });
    return mapGroup(row);
  }),
  joinGroup: impl.joinGroup.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).groupMember.create({ data: { group_id: input.groupId, user_id: context.user.id, role: input.capacity || 'member', status: 'active' } });
    return { id: String(row.id), user_id: String(row.user_id), group_id: String(row.group_id), role: String(row.role), status: String(row.status) };
  }),
  updateMemberStatus: impl.updateMemberStatus.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).groupMember.update({ where: { group_id_user_id: { group_id: input.groupId, user_id: input.userId } }, data: { status: input.status } });
    return { id: String(row.id), user_id: String(row.user_id), group_id: String(row.group_id), role: String(row.role), status: String(row.status) };
  }),
  updateGroupPolicy: impl.updateGroupPolicy.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).group.update({ where: { id: input.groupId }, data: { join_policy: input.joinPolicy } });
    return mapGroup(row);
  }),
  getGroupMembers: impl.getGroupMembers.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).groupMember.findMany({ where: { group_id: input.groupId, status: input.status }, orderBy: { joined_at: 'asc' }, include: { user: { select: { full_name: true, capacity: true, avatar_url: true } } } });
    return rows.map(mapGroupMember);
  }),
  updateMemberRole: impl.updateMemberRole.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).groupMember.update({ where: { group_id_user_id: { group_id: input.groupId, user_id: input.userId } }, data: { role: input.role }, include: { user: { select: { full_name: true, capacity: true, avatar_url: true } } } });
    return mapGroupMember(row);
  }),
  approveAllMembers: impl.approveAllMembers.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    await (context.db as any).groupMember.updateMany({ where: { group_id: input.groupId, status: 'pending' }, data: { status: 'active' } });
    return { success: true };
  }),
  getPosts: impl.getPosts.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).post.findMany({ where: { group_id: input.groupId, created_at: input.viewDate ? { lte: new Date(input.viewDate) } : undefined }, take: input.limit ?? 20, skip: input.offset ?? 0, orderBy: { created_at: 'desc' }, include: { author: { select: { full_name: true } }, reactions: true } });
    return rows.map(mapPost);
  }),
  getCommunityResonance: impl.getCommunityResonance.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).post.findMany({ where: { author_id: input.userId, created_at: input.viewDate ? { lte: new Date(input.viewDate) } : undefined }, include: { reactions: true, comments: true } });
    return { likes: rows.reduce((total: number, row: any) => total + Number(row.reactions?.length ?? row.likes_count ?? 0), 0), comments: rows.reduce((total: number, row: any) => total + Number(row.comments?.length ?? row.comments_count ?? 0), 0), shares: rows.reduce((total: number, row: any) => total + Number(row.shares_count ?? 0), 0) };
  }),
  createPost: impl.createPost.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).post.create({ data: { group_id: input.groupId, author_id: context.user.id, school_id: context.schoolId, content: input.content, post_type: input.postType, author_role: input.authorRole } });
    return mapPost(row);
  }),
  updatePost: impl.updatePost.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).post.update({ where: { id: input.postId }, data: { content: input.content.trim() }, include: { author: { select: { full_name: true } }, reactions: true } });
    return mapPost(row);
  }),
  deletePost: impl.deletePost.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    await (context.db as any).post.delete({ where: { id: input.postId } });
    return { success: true };
  }),
  getReactionStatus: impl.getReactionStatus.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).communityReaction.findUnique({ where: { post_id_user_id: { post_id: input.postId, user_id: context.user.id } } });
    return { active: Boolean(row) };
  }),
  getGroupMessages: impl.getGroupMessages.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).groupMessage.findMany({ where: { group_id: input.groupId, created_at: input.viewDate ? { lte: new Date(input.viewDate) } : undefined }, take: input.limit ?? 60, orderBy: { created_at: 'asc' }, include: { author: { select: { full_name: true, avatar_url: true } } } });
    return rows.map(mapGroupMessage);
  }),
  sendGroupMessage: impl.sendGroupMessage.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).groupMessage.create({ data: { group_id: input.groupId, author_id: context.user.id, content: input.content.trim() }, include: { author: { select: { full_name: true, avatar_url: true } } } });
    return mapGroupMessage(row);
  }),
  toggleReaction: impl.toggleReaction.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const db = context.db as any;
    const existing = await db.communityReaction.findUnique({ where: { post_id_user_id: { post_id: input.postId, user_id: context.user.id } } });
    if (existing) { await db.communityReaction.delete({ where: { id: existing.id } }); return { active: false }; }
    await db.communityReaction.create({ data: { post_id: input.postId, user_id: context.user.id, emoji: input.emoji || '❤️' } });
    return { active: true };
  }),
  getComments: impl.getComments.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).communityComment.findMany({ where: { post_id: input.postId }, take: input.limit ?? 60, orderBy: { created_at: 'asc' }, include: { author: { select: { full_name: true } } } });
    return rows.map(mapComment);
  }),
  createComment: impl.createComment.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).communityComment.create({ data: { post_id: input.postId, author_id: context.user.id, content: input.content.trim(), is_anonymous: input.isAnonymous === true } , include: { author: { select: { full_name: true } } } });
    return mapComment(row);
  }),
  deleteComment: impl.deleteComment.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    await (context.db as any).communityComment.delete({ where: { id: input.commentId } });
    return { success: true };
  }),
  toggleCommentUpvote: impl.toggleCommentUpvote.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const db = context.db as any;
    const where = { comment_id_user_id: { comment_id: input.commentId, user_id: context.user.id } };
    const existing = await db.communityCommentUpvote.findUnique({ where });
    if (existing) { await db.communityCommentUpvote.delete({ where }); return { active: false }; }
    await db.communityCommentUpvote.create({ data: { comment_id: input.commentId, user_id: context.user.id } });
    return { active: true };
  }),
  markOfficialAnswer: impl.markOfficialAnswer.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    await (context.db as any).communityComment.update({ where: { id: input.commentId }, data: { is_official_answer: input.isOfficial !== false } });
    return { success: true };
  }),
  getPollStatus: impl.getPollStatus.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).communityPollVote.findMany({ where: { post_id: input.postId } });
    const counts: Record<string, number> = {};
    for (const row of rows) counts[String(row.option_id)] = (counts[String(row.option_id)] ?? 0) + 1;
    return { counts, totalVotes: rows.length, userVotes: rows.filter((row: any) => row.user_id === context.user.id).map((row: any) => String(row.option_id)) };
  }),
  voteInPoll: impl.voteInPoll.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const db = context.db as any;
    const existing = await db.communityPollVote.findFirst({ where: { post_id: input.postId, user_id: context.user.id, option_id: input.optionId } });
    if (existing) await db.communityPollVote.delete({ where: { id: existing.id } });
    else {
      if (input.allowMultiple !== true) await db.communityPollVote.deleteMany({ where: { post_id: input.postId, user_id: context.user.id } });
      await db.communityPollVote.create({ data: { post_id: input.postId, user_id: context.user.id, option_id: input.optionId } });
    }
    const selected = await db.communityPollVote.findMany({ where: { post_id: input.postId, user_id: context.user.id } });
    return { selectedOptionIds: selected.map((row: any) => String(row.option_id)) };
  }),
  reportContent: impl.reportContent.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    await (context.db as any).groupReport.create({ data: { group_id: input.groupId, reporter_id: context.user.id, target_user_id: input.targetUserId, post_id: input.postId, reason: input.reason, details: input.details, status: 'pending' } });
    return { success: true };
  }),
});
