import type { Context } from 'hono';

/**
 * Library Domain Handlers (Hono + ZenStack ReBAC)
 */
export const libraryHandlers = {
  /**
   * Retrieve resources with filtering.
   */
  getResources: async (c: Context) => {
    const db = c.get('db');
    const { type, subject, topic, limit, offset, search } = c.req.query();

    const resources = await db.libraryResource.findMany({
      where: {
        type: type || undefined,
        subject: subject || undefined,
        topic: topic || undefined,
        title: search ? { contains: search, mode: 'insensitive' } : undefined,
      },
      take: Number(limit) || 20,
      skip: Number(offset) || 0,
      orderBy: { created_at: 'desc' },
      include: {
        creator: { select: { full_name: true, avatar_url: true } },
      },
    });

    return c.json(resources, 200);
  },

  /**
   * Retrieve a single resource.
   */
  getResource: async (c: Context) => {
    const db = c.get('db');
    const { id } = c.req.param();

    const resource = await db.libraryResource.findUnique({
      where: { id },
      include: {
        creator: { select: { full_name: true, avatar_url: true } },
        _count: { select: { engagements: true } },
      },
    });

    if (!resource) return c.json({ message: 'Resource not found' }, 404);
    return c.json(resource, 200);
  },

  /**
   * Search resources (Placeholder for vector search).
   */
  searchLibrary: async (c: Context) => {
    const db = c.get('db');
    const { query, type, subject, limit } = await c.req.json();

    // Standard keyword search as fallback for now
    const resources = await db.libraryResource.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        type: type || undefined,
        subject: subject || undefined,
      },
      take: limit || 10,
    });

    return c.json(resources, 200);
  },

  /**
   * Record resource engagement.
   */
  engage: async (c: Context) => {
    const db = c.get('db');
    const user = c.get('user');
    const { id } = c.req.param();
    const { engagement_type, classroom_id } = await c.req.json();

    const engagement = await db.libraryResourceEngagement.create({
      data: {
        resource_id: id,
        user_id: user.id,
        engagement_type,
        classroom_id: classroom_id || null,
      },
    });

    return c.json(engagement, 200);
  },

  /**
   * Retrieve collections.
   */
  getCollections: async (c: Context) => {
    const db = c.get('db');
    const { creator_id, subject, search, limit, offset } = c.req.query();

    const collections = await db.libraryCollection.findMany({
      where: {
        creator_id: creator_id || undefined,
        subject: subject || undefined,
        name: search ? { contains: search, mode: 'insensitive' } : undefined,
      },
      take: Number(limit) || 20,
      skip: Number(offset) || 0,
      include: {
        creator: { select: { full_name: true, avatar_url: true } },
      },
    });

    return c.json(collections, 200);
  },

  /**
   * Retrieve a single collection.
   */
  getCollection: async (c: Context) => {
    const db = c.get('db');
    const { id } = c.req.param();

    const collection = await db.libraryCollection.findUnique({
      where: { id },
      include: {
        collection_nodes: {
          include: {
            node: true,
          },
        },
      },
    });

    if (!collection) return c.json({ message: 'Collection not found' }, 404);
    return c.json(collection, 200);
  },
};
