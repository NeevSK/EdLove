import type { Context } from 'hono';
import { dispatchPushSafely } from '@repo/core/api/pushDispatcher';

/**
 * Community Domain Handlers (Hono + ZenStack ReBAC)
 */
export const communityHandlers = {
  /**
   * Retrieve groups.
   * ZenStack filters by visibility and membership.
   */
  getGroups: async (c: Context) => {
    const db = c.get('db');
    const { limit, offset, school_id, search, is_public } = c.req.query();

    const groups = await db.group.findMany({
      where: {
        school_id,
        is_public: is_public === 'true' ? true : undefined,
        name: search ? { contains: search, mode: 'insensitive' } : undefined,
      },
      take: Number(limit) || 20,
      skip: Number(offset) || 0,
      orderBy: { created_at: 'desc' },
    });

    return c.json(groups, 200);
  },

  /**
   * Retrieve a specific group.
   */
  getGroup: async (c: Context) => {
    const db = c.get('db');
    const { groupId } = c.req.param();

    const group = await db.group.findUnique({
      where: { id: groupId },
      include: {
        members: { take: 5 },
      },
    });

    if (!group) return c.json({ message: 'Group not found or access denied' }, 404);
    return c.json(group, 200);
  },

  /**
   * Create a new group.
   */
  createGroup: async (c: Context) => {
    const db = c.get('db');
    const user = c.get('user');
    const body = await c.req.json();

    const group = await db.group.create({
      data: {
        ...body,
        creator_id: user.id,
        members: {
          create: {
            user_id: user.id,
            role: 'owner',
            status: 'active',
          },
        },
      },
    });

    return c.json(group, 201);
  },

  /**
   * Join a group.
   */
  joinGroup: async (c: Context) => {
    const db = c.get('db');
    const { groupId } = c.req.param();
    const { user_id, capacity } = await c.req.json();

    const member = await db.groupMember.create({
      data: {
        group_id: groupId,
        user_id,
        role: capacity || 'member',
        status: 'active',
      },
    });

    return c.json(member, 201);
  },

  /**
   * Retrieve posts.
   * Automatic filtering by membership/visibility.
   */
  getPosts: async (c: Context) => {
    const db = c.get('db');
    const { groupId, limit, offset } = c.req.query();

    const posts = await db.post.findMany({
      where: {
        group_id: groupId,
      },
      take: Number(limit) || 20,
      skip: Number(offset) || 0,
      orderBy: { created_at: 'desc' },
      include: {
        author: {
          select: { full_name: true, avatar_url: true },
        },
      },
    });

    return c.json(posts, 200);
  },

  /**
   * Create a post.
   */
  createPost: async (c: Context) => {
    const db = c.get('db');
    const user = c.get('user');
    const { group_id, content, post_type, visibility, author_tier } = await c.req.json();

    const post = await db.post.create({
      data: {
        group_id,
        author_id: user.id,
        content,
        post_type,
        visibility,
        author_tier,
      },
    });

    const members = await db.groupMember.findMany({
      where: { group_id, status: 'active', user_id: { not: user.id } },
      select: { user_id: true },
    });
    for (const member of members) {
      dispatchPushSafely({
        userId: member.user_id,
        title: 'New community post',
        body: content.slice(0, 140),
        category: 'community',
        data: { url: `/community/${group_id}/post/${post.id}`, postId: post.id },
      });
    }

    return c.json(post, 201);
  },

  /**
   * Toggle a reaction on a post.
   */
  toggleReaction: async (c: Context) => {
    const db = c.get('db');
    const { postId } = c.req.param();
    const { user_id, emoji = '❤️' } = await c.req.json();

    const existing = await db.communityReaction.findUnique({
      where: {
        post_id_user_id: {
          post_id: postId,
          user_id,
        },
      },
    });

    if (existing) {
      await db.communityReaction.delete({
        where: { id: existing.id },
      });
      return c.json({ active: false }, 200);
    }

    await db.communityReaction.create({
      data: {
        post_id: postId,
        user_id,
        emoji,
      },
    });

    return c.json({ active: true }, 200);
  },
};
