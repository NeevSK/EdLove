import { communityORPCContract } from '@repo/core/api/community.orpc.contract';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(communityORPCContract).$context<ORPCContext>();
const iso = (value: unknown) =>
  value ? new Date(value as string | number | Date).toISOString() : new Date(0).toISOString();
const mapGroup = (row: any) => ({
  id: String(row.id),
  name: String(row.name ?? ''),
  description: row.description ?? null,
  school_id: String(row.school_id ?? ''),
  created_by: row.created_by ?? null,
  group_type: row.group_type ?? null,
  join_policy: row.join_policy ?? null,
  is_public: row.is_public !== false,
  created_at: iso(row.created_at),
  classroom_id: row.classroom_id ?? null,
  image_url: row.image_url ?? null,
  member_count: Number(row.member_count ?? 0),
  handle: row.handle ?? null,
});
const mapPost = (row: any) => ({
  id: String(row.id),
  group_id: String(row.group_id),
  author_id: String(row.author_id),
  school_id: row.school_id ?? null,
  content: String(row.content ?? ''),
  post_type: row.post_type ?? null,
  author_role: row.author_role ?? null,
  media_url: row.media_url ?? null,
  media_type: row.media_type ?? null,
  created_at: iso(row.created_at),
  updated_at: iso(row.updated_at),
  deleted_at: row.deleted_at ? iso(row.deleted_at) : null,
  author_name: row.author?.full_name ?? null,
  reaction_count: Number(row.reactions?.length ?? row.reaction_count ?? 0),
  comment_count: Number(row.comment_count ?? 0),
});
const mapComment = (row: any) => ({
  id: String(row.id),
  post_id: String(row.post_id),
  author_id: row.author_id ?? null,
  content: String(row.content ?? ''),
  is_anonymous: row.is_anonymous === true,
  is_official_answer: row.is_official_answer === true,
  upvote_count: Number(row.upvote_count ?? row.upvotes?.length ?? 0),
  created_at: iso(row.created_at),
  updated_at: iso(row.updated_at),
  author_name: row.is_anonymous ? null : (row.author?.full_name ?? null),
});
const mapGroupMessage = (row: any) => ({
  id: String(row.id),
  group_id: String(row.group_id),
  author_id: String(row.author_id),
  content: String(row.content ?? ''),
  created_at: iso(row.created_at),
  author_name: row.author?.full_name ?? null,
  author_avatar_url: row.author?.avatar_url ?? null,
});
const mapGroupMember = (row: any) => ({
  id: String(row.id),
  group_id: String(row.group_id),
  user_id: String(row.user_id),
  role: String(row.role ?? 'member'),
  status: String(row.status ?? 'active'),
  joined_at: iso(row.joined_at),
  user_name: String(row.user?.full_name ?? ''),
  user_capacity: row.user?.capacity ?? null,
  user_avatar: row.user?.avatar_url ?? null,
});

export const communityRouter = impl.router({
  getGroups: impl.getGroups.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const query = input.query;
    const rows = await (context.db as any).group.findMany({
      where: {
        school_id: query.schoolId || context.schoolId,
        is_public: query.isPublic,
        group_type: query.type,
        name: query.search ? { contains: query.search, mode: 'insensitive' } : undefined,
      },
      take: query.limit ?? 20,
      skip: query.offset ?? 0,
      orderBy: { created_at: 'desc' },
    });
    return rows.map(mapGroup);
  }),
  getGroup: impl.getGroup.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).group.findUnique({
      where: { id: input.params.groupId },
      include: { members: { take: 5 } },
    });
    return row ? mapGroup(row) : null;
  }),
  createGroup: impl.createGroup.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const body = input.body;
    const row = await (context.db as any).group.create({
      data: {
        name: body.name,
        description: body.description,
        school_id: body.schoolId || context.schoolId,
        created_by: context.user.id,
        group_type: body.type,
        join_policy: body.visibility,
      },
    });
    return mapGroup(row);
  }),
  joinGroup: impl.joinGroup.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).groupMember.create({
      data: {
        group_id: input.params.groupId,
        user_id: context.user.id,
        role: 'member',
        status: 'active',
      },
    });
    return {
      id: String(row.id),
      user_id: String(row.user_id),
      group_id: String(row.group_id),
      role: String(row.role),
      status: String(row.status),
    };
  }),
  updateMemberStatus: impl.updateMemberStatus
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const { groupId } = input.params;
      const { userId, status } = input.body;
      const row = await (context.db as any).groupMember.update({
        where: { group_id_user_id: { group_id: groupId, user_id: userId } },
        data: { status },
      });
      return {
        id: String(row.id),
        user_id: String(row.user_id),
        group_id: String(row.group_id),
        role: String(row.role),
        status: String(row.status),
      };
    }),
  updateGroupPolicy: impl.updateGroupPolicy
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const { groupId } = input.params;
      const row = await (context.db as any).group.update({
        where: { id: groupId },
        data: { join_policy: input.body.joinPolicy },
      });
      return mapGroup(row);
    }),
  getGroupMembers: impl.getGroupMembers
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const { groupId } = input.params;
      const rows = await (context.db as any).groupMember.findMany({
        where: { group_id: groupId, status: input.query.status },
        orderBy: { joined_at: 'asc' },
        include: { user: { select: { full_name: true, capacity: true, avatar_url: true } } },
      });
      return rows.map(mapGroupMember);
    }),
  updateMemberRole: impl.updateMemberRole
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const { groupId } = input.params;
      const { userId, role } = input.body;
      const row = await (context.db as any).groupMember.update({
        where: { group_id_user_id: { group_id: groupId, user_id: userId } },
        data: { role },
        include: { user: { select: { full_name: true, capacity: true, avatar_url: true } } },
      });
      return mapGroupMember(row);
    }),
  approveAllMembers: impl.approveAllMembers
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      await (context.db as any).groupMember.updateMany({
        where: { group_id: input.params.groupId, status: 'pending' },
        data: { status: 'active' },
      });
      return { success: true };
    }),
  getPosts: impl.getPosts.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const query = input.query;
    const rows = await (context.db as any).post.findMany({
      where: {
        group_id: query.groupId,
        created_at: query.viewDate ? { lte: new Date(query.viewDate) } : undefined,
      },
      take: query.limit ?? 20,
      skip: query.offset ?? 0,
      orderBy: { created_at: 'desc' },
      include: { author: { select: { full_name: true } }, reactions: true },
    });
    return rows.map(mapPost);
  }),
  getCommunityResonance: impl.getCommunityResonance
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const { userId } = input.params;
      const { viewDate } = input.query;
      const rows = await (context.db as any).post.findMany({
        where: {
          author_id: userId,
          created_at: viewDate ? { lte: new Date(viewDate) } : undefined,
        },
        include: { reactions: true, comments: true },
      });
      return {
        likes: rows.reduce(
          (total: number, row: any) =>
            total + Number(row.reactions?.length ?? row.likes_count ?? 0),
          0,
        ),
        comments: rows.reduce(
          (total: number, row: any) =>
            total + Number(row.comments?.length ?? row.comments_count ?? 0),
          0,
        ),
        shares: rows.reduce((total: number, row: any) => total + Number(row.shares_count ?? 0), 0),
      };
    }),
  createPost: impl.createPost.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const body = input.body;
    const row = await (context.db as any).post.create({
      data: {
        group_id: body.groupId,
        author_id: context.user.id,
        school_id: context.schoolId,
        content: body.content,
        post_type: body.postType,
        author_role: body.authorTier,
      },
    });
    return mapPost(row);
  }),
  updatePost: impl.updatePost.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).post.update({
      where: { id: input.params.postId },
      data: { content: input.body.content.trim() },
      include: { author: { select: { full_name: true } }, reactions: true },
    });
    return mapPost(row);
  }),
  deletePost: impl.deletePost.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    await (context.db as any).post.delete({ where: { id: input.params.postId } });
    return { success: true };
  }),
  getReactionStatus: impl.getReactionStatus
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const row = await (context.db as any).communityReaction.findUnique({
        where: { post_id_user_id: { post_id: input.params.postId, user_id: context.user.id } },
      });
      return { active: Boolean(row) };
    }),
  getGroupMessages: impl.getGroupMessages
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const { groupId } = input.params;
      const { viewDate, limit } = input.query;
      const rows = await (context.db as any).groupMessage.findMany({
        where: {
          group_id: groupId,
          created_at: viewDate ? { lte: new Date(viewDate) } : undefined,
        },
        take: limit ?? 60,
        orderBy: { created_at: 'asc' },
        include: { author: { select: { full_name: true, avatar_url: true } } },
      });
      return rows.map(mapGroupMessage);
    }),
  sendGroupMessage: impl.sendGroupMessage
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const row = await (context.db as any).groupMessage.create({
        data: {
          group_id: input.params.groupId,
          author_id: context.user.id,
          content: input.body.content.trim(),
        },
        include: { author: { select: { full_name: true, avatar_url: true } } },
      });
      return mapGroupMessage(row);
    }),
  toggleReaction: impl.toggleReaction
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const db = context.db as any;
      const existing = await db.communityReaction.findUnique({
        where: { post_id_user_id: { post_id: input.params.postId, user_id: context.user.id } },
      });
      if (existing) {
        await db.communityReaction.delete({ where: { id: existing.id } });
        return { active: false };
      }
      await db.communityReaction.create({
        data: {
          post_id: input.params.postId,
          user_id: context.user.id,
          emoji: input.body.emoji || '❤️',
        },
      });
      return { active: true };
    }),
  getComments: impl.getComments.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    assertDatabase(context);
    const rows = await context.db.communityComment.findMany({
      where: { post_id: input.params.postId },
      take: input.query.limit ?? 60,
      orderBy: { created_at: 'asc' },
      include: { author: { select: { full_name: true } } },
    });
    return rows.map(mapComment);
  }),
  createComment: impl.createComment
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const row = await context.db.communityComment.create({
        data: {
          post_id: input.params.postId,
          author_id: context.user.id,
          content: input.body.content.trim(),
          is_anonymous: input.body.isAnonymous === true,
        },
        include: { author: { select: { full_name: true } } },
      });
      return mapComment(row);
    }),
  deleteComment: impl.deleteComment
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      await context.db.communityComment.delete({ where: { id: input.params.commentId } });
      return { success: true };
    }),
  toggleCommentUpvote: impl.toggleCommentUpvote
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const where = {
        comment_id_user_id: { comment_id: input.params.commentId, user_id: context.user.id },
      };
      const existing = await context.db.communityCommentUpvote.findUnique({ where });
      if (existing) {
        await context.db.communityCommentUpvote.delete({ where });
        return { active: false };
      }
      await context.db.communityCommentUpvote.create({
        data: { comment_id: input.params.commentId, user_id: context.user.id },
      });
      return { active: true };
    }),
  markOfficialAnswer: impl.markOfficialAnswer
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      await context.db.communityComment.update({
        where: { id: input.params.commentId },
        data: { is_official_answer: true },
      });
      return { success: true };
    }),
  getPollStatus: impl.getPollStatus
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const rows = await (context.db as any).communityPollVote.findMany({
        where: { post_id: input.params.postId },
      });
      const counts: Record<string, number> = {};
      for (const row of rows)
        counts[String(row.option_id)] = (counts[String(row.option_id)] ?? 0) + 1;
      return {
        counts,
        totalVotes: rows.length,
        userVotes: rows
          .filter((row: any) => row.user_id === context.user.id)
          .map((row: any) => String(row.option_id)),
      };
    }),
  voteInPoll: impl.voteInPoll.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const db = context.db as any;
    const { postId } = input.params;
    const { optionId, allowMultiple } = input.body;
    const existing = await db.communityPollVote.findFirst({
      where: { post_id: postId, user_id: context.user.id, option_id: optionId },
    });
    if (existing) await db.communityPollVote.delete({ where: { id: existing.id } });
    else {
      if (allowMultiple !== true) {
        await db.communityPollVote.deleteMany({
          where: { post_id: postId, user_id: context.user.id },
        });
      }
      await db.communityPollVote.create({
        data: { post_id: postId, user_id: context.user.id, option_id: optionId },
      });
    }
    const selected = await db.communityPollVote.findMany({
      where: { post_id: postId, user_id: context.user.id },
    });
    return { selectedOptionIds: selected.map((row: any) => String(row.option_id)) };
  }),
  reportContent: impl.reportContent
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      await (context.db as any).groupReport.create({
        data: {
          group_id: input.body.groupId,
          reporter_id: context.user.id,
          target_user_id: input.body.targetUserId,
          post_id: input.body.postId,
          reason: input.body.reason,
          details: input.body.details,
          status: 'pending',
        },
      });
      return { success: true };
    }),
});
