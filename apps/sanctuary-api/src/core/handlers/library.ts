import { implement, ORPCError } from '@orpc/server';
import { libraryContract } from '@repo/core/api/server';
import type { ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(libraryContract).$context<ORPCContext>();
const iso = (value: unknown) => value instanceof Date ? value.toISOString() : String(value ?? '');

const mapResource = (row: any) => ({
  id: String(row.id), title: String(row.title ?? ''), description: row.description ?? null,
  type: String(row.type ?? ''), format: String(row.format ?? ''), url: row.url ?? null,
  file_path: row.file_path ?? null, subjects: Array.isArray(row.subjects) ? row.subjects.map(String) : [],
  topics: Array.isArray(row.topics) ? row.topics.map(String) : [], grades: Array.isArray(row.grades) ? row.grades.map(Number) : [],
  difficulty: row.difficulty ?? null, language: Array.isArray(row.language) ? row.language.map(String) : [],
  visibility: String(row.visibility ?? 'public'), creator_id: String(row.creator_id ?? ''), creator_role: String(row.creator_role ?? ''),
  verified: Boolean(row.verified), is_community: Boolean(row.is_community), views: Number(row.views ?? 0),
  uses_count: Number(row.uses_count ?? 0), endorsements: Number(row.endorsements ?? 0), bookmarks: Number(row.bookmarks ?? 0),
  created_at: iso(row.created_at), updated_at: iso(row.updated_at),
  creator_name: row.creator?.full_name ?? null, creator_avatar_url: row.creator?.avatar_url ?? null,
  ...(row._count?.engagements !== undefined ? { engagement_count: Number(row._count.engagements) } : {}),
});

const mapCollection = (row: any) => ({
  id: String(row.id), name: String(row.name ?? ''), description: row.description ?? null,
  creator_id: String(row.creator_id ?? ''), visibility: String(row.visibility ?? 'public'),
  subjects: Array.isArray(row.subjects) ? row.subjects.map(String) : [], topics: Array.isArray(row.topics) ? row.topics.map(String) : [],
  grades: Array.isArray(row.grades) ? row.grades.map(Number) : [], created_at: iso(row.created_at), updated_at: iso(row.updated_at),
  creator_name: row.creator?.full_name ?? null, creator_avatar_url: row.creator?.avatar_url ?? null,
  ...(Array.isArray(row.nodes) ? { nodes: row.nodes.map((node: any) => mapResource(node)) } : {}),
});

export const libraryRouter = impl.router({
  getResources: impl.getResources.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const db = context.db as any;
    const rows = await db.libraryResource.findMany({ where: { type: input.type, subjects: input.subject ? { has: input.subject } : undefined, topics: input.topic ? { has: input.topic } : undefined, title: input.search ? { contains: input.search, mode: 'insensitive' } : undefined }, take: input.limit ?? 20, skip: input.offset ?? 0, orderBy: { created_at: 'desc' }, include: { creator: { select: { full_name: true, avatar_url: true } } } });
    return rows.map(mapResource);
  }),
  getResource: impl.getResource.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const db = context.db as any;
    const row = await db.libraryResource.findUnique({ where: { id: input.id }, include: { creator: { select: { full_name: true, avatar_url: true } }, _count: { select: { engagements: true } } } });
    if (!row) throw new ORPCError('NOT_FOUND', { message: 'Resource not found' });
    return mapResource(row);
  }),
  getBookmarkedResources: impl.getBookmarkedResources.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const db = context.db as any;
    const rows = await db.resourceEngagement.findMany({
      where: { user_id: context.user.id, engagement_type: 'bookmark' },
      take: input.limit ?? 20,
      skip: input.offset ?? 0,
      orderBy: { created_at: 'desc' },
      include: { resource: { include: { creator: { select: { full_name: true, avatar_url: true } } } } },
    });
    return rows.map((row: any) => mapResource(row.resource));
  }),
  searchLibrary: impl.searchLibrary.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const db = context.db as any;
    const rows = await db.libraryResource.findMany({ where: { OR: [{ title: { contains: input.query, mode: 'insensitive' } }, { description: { contains: input.query, mode: 'insensitive' } }], type: input.type, subjects: input.subject ? { has: input.subject } : undefined }, take: input.limit ?? 10 });
    return rows.map(mapResource);
  }),
  createResource: impl.createResource.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const db = context.db as any;
    const row = await db.libraryResource.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        type: input.type,
        format: input.format,
        url: input.url ?? null,
        file_path: input.file_path ?? null,
        subjects: input.subjects,
        topics: input.topics,
        grades: input.grades,
        difficulty: input.difficulty ?? null,
        language: input.language,
        visibility: input.visibility,
        creator_id: context.user.id,
        creator_role: context.capacity ?? 'member',
        is_community: input.is_community,
      },
      include: { creator: { select: { full_name: true, avatar_url: true } } },
    });
    return mapResource(row);
  }),
  engage: impl.engage.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const db = context.db as any;
    const row = await db.$transaction(async (tx: any) => {
      const existing = input.toggle
        ? await tx.resourceEngagement.findFirst({
            where: { resource_id: input.id, user_id: context.user.id, engagement_type: input.engagement_type },
          })
        : null;
      if (existing) {
        await tx.resourceEngagement.delete({ where: { id: existing.id } });
        const counter = input.engagement_type === 'endorse' ? 'endorsements' : input.engagement_type === 'bookmark' ? 'bookmarks' : input.engagement_type === 'use' ? 'uses_count' : null;
        if (counter) await tx.libraryResource.update({ where: { id: input.id }, data: { [counter]: { decrement: 1 } } });
        return existing;
      }
      const created = await tx.resourceEngagement.create({ data: { resource_id: input.id, user_id: context.user.id, engagement_type: input.engagement_type, classroom_id: input.classroom_id ?? null } });
      const counter = input.engagement_type === 'endorse' ? 'endorsements' : input.engagement_type === 'bookmark' ? 'bookmarks' : input.engagement_type === 'use' ? 'uses_count' : input.engagement_type === 'view' ? 'views' : null;
      if (counter) await tx.libraryResource.update({ where: { id: input.id }, data: { [counter]: { increment: 1 } } });
      return created;
    });
    return { ...row, id: String(row.id), resource_id: String(row.resource_id), user_id: String(row.user_id), engagement_type: String(row.engagement_type), classroom_id: row.classroom_id ?? null, created_at: iso(row.created_at) };
  }),
  createCollection: impl.createCollection.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const db = context.db as any;
    const row = await db.libraryCollection.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        visibility: input.visibility,
        subjects: input.subjects,
        topics: input.topics,
        grades: input.grades,
        creator_id: context.user.id,
        ...(input.resource_ids.length > 0
          ? { nodes: { connect: input.resource_ids.map((id) => ({ id })) } }
          : {}),
      },
      include: {
        creator: { select: { full_name: true, avatar_url: true } },
        nodes: { include: { creator: { select: { full_name: true, avatar_url: true } } } },
      },
    });
    return mapCollection(row);
  }),
  addToCollection: impl.addToCollection.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const db = context.db as any;
    await db.libraryCollection.update({
      where: { id: input.collection_id },
      data: { nodes: { connect: { id: input.resource_id } } },
    });
    return { success: true };
  }),
  getCollections: impl.getCollections.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const db = context.db as any;
    const rows = await db.libraryCollection.findMany({ where: { creator_id: input.creator_id, subjects: input.subject ? { has: input.subject } : undefined, name: input.search ? { contains: input.search, mode: 'insensitive' } : undefined }, take: input.limit ?? 20, skip: input.offset ?? 0, orderBy: { created_at: 'desc' }, include: { creator: { select: { full_name: true, avatar_url: true } } } });
    return rows.map(mapCollection);
  }),
  getCollection: impl.getCollection.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const db = context.db as any;
    const row = await db.libraryCollection.findUnique({ where: { id: input.id }, include: { creator: { select: { full_name: true, avatar_url: true } }, nodes: { include: { resource: true } } } });
    if (!row) throw new ORPCError('NOT_FOUND', { message: 'Collection not found' });
    return mapCollection(row);
  }),
});
