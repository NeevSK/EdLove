import { ORPCError } from '@orpc/server';
import { libraryORPCContract } from '@repo/core/api/library.orpc.contract';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(libraryORPCContract).$context<ORPCContext>();
const iso = (value: unknown) => (value instanceof Date ? value.toISOString() : String(value ?? ''));

const mapResource = (row: any) => ({
  id: String(row.id),
  title: String(row.title ?? ''),
  description: row.description ?? null,
  type: String(row.type ?? ''),
  format: String(row.format ?? ''),
  url: row.url ?? null,
  file_path: row.file_path ?? null,
  subjects: Array.isArray(row.subjects) ? row.subjects.map(String) : [],
  topics: Array.isArray(row.topics) ? row.topics.map(String) : [],
  tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
  grades: Array.isArray(row.grades) ? row.grades.map(Number) : [],
  difficulty: row.difficulty ?? null,
  language: Array.isArray(row.language) ? row.language.map(String) : [],
  visibility: String(row.visibility ?? 'public'),
  creator_id: String(row.creator_id ?? ''),
  creator_role: String(row.creator_role ?? ''),
  verified: Boolean(row.verified),
  is_community: Boolean(row.is_community),
  views: Number(row.views ?? 0),
  uses_count: Number(row.uses_count ?? 0),
  endorsements: Number(row.endorsements ?? 0),
  bookmarks: Number(row.bookmarks ?? 0),
  link_status: row.link_status ?? 'unknown',
  last_checked_at: row.last_checked_at ? iso(row.last_checked_at) : null,
  fail_count: Number(row.fail_count ?? 0),
  created_at: iso(row.created_at),
  updated_at: iso(row.updated_at),
  creator_name: row.creator?.full_name ?? null,
  creator_avatar_url: row.creator?.avatar_url ?? null,
  ...(row._count?.engagements !== undefined
    ? { engagement_count: Number(row._count.engagements) }
    : {}),
});

const mapCollection = (row: any) => ({
  id: String(row.id),
  name: String(row.name ?? ''),
  description: row.description ?? null,
  creator_id: String(row.creator_id ?? ''),
  visibility: String(row.visibility ?? 'public'),
  subjects: Array.isArray(row.subjects) ? row.subjects.map(String) : [],
  topics: Array.isArray(row.topics) ? row.topics.map(String) : [],
  grades: Array.isArray(row.grades) ? row.grades.map(Number) : [],
  resource_ids: Array.isArray(row.resource_ids)
    ? row.resource_ids.map(String)
    : Array.isArray(row.collection_nodes)
      ? row.collection_nodes.map((membership: any) =>
          String(membership.node_id ?? membership.node?.id),
        )
      : [],
  sequence_order: Array.isArray(row.sequence_order)
    ? row.sequence_order.map(Number)
    : Array.isArray(row.collection_nodes)
      ? row.collection_nodes.map((membership: any, index: number) =>
          Number(membership.position ?? index),
        )
      : [],
  thumbnail_url: row.thumbnail_url ?? null,
  estimated_duration: row.estimated_duration ?? null,
  school_id: row.school_id ?? null,
  is_official: Boolean(row.is_official),
  forks: Number(row.forks ?? 0),
  used_by_count: Number(row.used_by_count ?? 0),
  endorsements: Number(row.endorsements ?? 0),
  original_collection_id: row.original_collection_id ?? null,
  created_at: iso(row.created_at),
  updated_at: iso(row.updated_at),
  creator_name: row.creator?.full_name ?? null,
  creator_avatar_url: row.creator?.avatar_url ?? null,
  ...(Array.isArray(row.collection_nodes)
    ? {
        nodes: row.collection_nodes.map((membership: any) => mapResource(membership.node)),
        resources: row.collection_nodes.map((membership: any) => mapResource(membership.node)),
      }
    : Array.isArray(row.nodes)
      ? {
          nodes: row.nodes.map((node: any) => mapResource(node.node ?? node.resource ?? node)),
          resources: row.nodes.map((node: any) => mapResource(node.node ?? node.resource ?? node)),
        }
      : {}),
});

const mapVirtualCollection = (
  kind: 'subject' | 'topic',
  term: string,
  count: number,
  resources: any[] = [],
) => ({
  id: `${kind}:${term}`,
  name: term ? term.charAt(0).toUpperCase() + term.slice(1) : term,
  description: `Dynamic collection of ${count} resources in ${term}`,
  creator_id: 'system',
  creator_name: 'Gurudevi',
  creator_avatar_url: null,
  visibility: 'public',
  subjects: kind === 'subject' ? [term] : [],
  topics: kind === 'topic' ? [term] : [],
  grades: [],
  sequence_order: resources.map((_, index) => index),
  is_official: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  forks: 0,
  used_by_count: count,
  endorsements: 0,
  is_virtual: true,
  resource_ids: resources.map((resource) => String(resource.id)),
  resources: resources.map(mapResource),
});

const fetchVirtualCollections = async (db: any, input: any) => {
  const [subjectRows, topicRows] = await Promise.all([
    db.$queryRawUnsafe(
      `SELECT subject, COUNT(*)::int AS count FROM public.nodes, unnest(subjects) AS subject WHERE visibility = 'public' GROUP BY subject`,
    ),
    db.$queryRawUnsafe(
      `SELECT topic, COUNT(*)::int AS count FROM public.nodes, unnest(topics) AS topic WHERE visibility = 'public' GROUP BY topic`,
    ),
  ]);
  const search = input.search?.toLowerCase();
  const subjects = (subjectRows ?? [])
    .filter((row: any) => !search || String(row.subject).toLowerCase().includes(search))
    .sort((a: any, b: any) => Number(b.count) - Number(a.count))
    .map((row: any) => mapVirtualCollection('subject', String(row.subject), Number(row.count)));
  const topics = (topicRows ?? [])
    .filter((row: any) => !search || String(row.topic).toLowerCase().includes(search))
    .sort((a: any, b: any) => Number(b.count) - Number(a.count))
    .map((row: any) => mapVirtualCollection('topic', String(row.topic), Number(row.count)));
  return [...subjects, ...topics];
};

const fetchCollectionMembershipAsOf = async (db: any, collectionId: string, asOf: string) => {
  const events = await db.collectionNodeEvent.findMany({
    where: { collection_id: collectionId, occurred_at: { lte: new Date(asOf) } },
    orderBy: [{ occurred_at: 'asc' }, { id: 'asc' }],
  });
  const latest = new Map<string, any>();
  for (const event of events) latest.set(String(event.node_id), event);
  return [...latest.values()]
    .filter((event: any) => event.event_type !== 'removed')
    .sort(
      (a: any, b: any) =>
        Number(a.position ?? 0) - Number(b.position ?? 0) ||
        String(a.node_id).localeCompare(String(b.node_id)),
    );
};

const hydrateCollectionsAtAsOf = async (db: any, rows: any[], asOf: string) => {
  if (rows.length === 0) return rows;
  const collectionIds = rows.map((row) => String(row.id));
  const events = await db.collectionNodeEvent.findMany({
    where: { collection_id: { in: collectionIds }, occurred_at: { lte: new Date(asOf) } },
    orderBy: [{ occurred_at: 'asc' }, { id: 'asc' }],
  });
  const latestByCollection = new Map<string, Map<string, any>>();
  for (const event of events) {
    const collectionId = String(event.collection_id);
    const nodes = latestByCollection.get(collectionId) ?? new Map<string, any>();
    nodes.set(String(event.node_id), event);
    latestByCollection.set(collectionId, nodes);
  }

  const membershipsByCollection = new Map<string, any[]>();
  const nodeIds = new Set<string>();
  for (const row of rows) {
    const eventsForCollection = [...(latestByCollection.get(String(row.id))?.values() ?? [])]
      .filter((event: any) => event.event_type !== 'removed')
      .sort(
        (a: any, b: any) =>
          Number(a.position ?? 0) - Number(b.position ?? 0) ||
          String(a.node_id).localeCompare(String(b.node_id)),
      );
    for (const event of eventsForCollection) nodeIds.add(String(event.node_id));
    membershipsByCollection.set(String(row.id), eventsForCollection);
  }
  const resources = nodeIds.size
    ? await db.libraryResource.findMany({
        where: { id: { in: [...nodeIds] } },
        include: { creator: { select: { full_name: true, avatar_url: true } } },
      })
    : [];
  const resourcesById = new Map(resources.map((resource: any) => [String(resource.id), resource]));
  return rows.map((row) => ({
    ...row,
    collection_nodes: (membershipsByCollection.get(String(row.id)) ?? [])
      .map((event: any) => ({
        node_id: event.node_id,
        position: event.position,
        node: resourcesById.get(String(event.node_id)),
      }))
      .filter((membership: any) => membership.node),
  }));
};

const isPlatformAdmin = async (context: ORPCContext) =>
  Boolean(
    await context.db?.bond.findFirst({
      where: { user_id: context.user.id, entity_type: 'PLATFORM', capacity: 'admin' },
      select: { id: true },
    }),
  );

const requireResourceManager = async (context: ORPCContext, resourceId: string) => {
  assertDatabase(context);
  const db = context.db as any;
  const row = await db.libraryResource.findUnique({
    where: { id: resourceId },
    select: { creator_id: true },
  });
  if (!row) throw new ORPCError('NOT_FOUND', { message: 'Resource not found' });
  if (row.creator_id !== context.user.id && !(await isPlatformAdmin(context))) {
    throw new ORPCError('FORBIDDEN', { message: 'Resource ownership required' });
  }
  return db;
};

const requireCollectionManager = async (context: ORPCContext, collectionId: string) => {
  assertDatabase(context);
  const db = context.db as any;
  const row = await db.libraryCollection.findUnique({
    where: { id: collectionId },
    select: { creator_id: true },
  });
  if (!row) throw new ORPCError('NOT_FOUND', { message: 'Collection not found' });
  if (row.creator_id !== context.user.id && !(await isPlatformAdmin(context))) {
    throw new ORPCError('FORBIDDEN', { message: 'Collection ownership required' });
  }
  return db;
};

const requirePlatformAdmin = async (context: ORPCContext) => {
  assertDatabase(context);
  if (!(await isPlatformAdmin(context))) {
    throw new ORPCError('FORBIDDEN', { message: 'Platform administrator access required' });
  }
};

export const libraryRouter = impl.router({
  getCounts: impl.getCounts.use(doubleGateMiddleware).handler(async ({ context }) => {
    assertDatabase(context);
    const db = context.db as any;
    const visibility = { OR: [{ visibility: 'public' }, { creator_id: context.user.id }] };
    const [resourceCount, collectionCount, subjectRows, topicRows] = await Promise.all([
      db.libraryResource.count({ where: visibility }),
      db.libraryCollection.count({ where: visibility }),
      db.$queryRawUnsafe(
        `SELECT COUNT(DISTINCT subject)::int AS count FROM public.nodes, unnest(subjects) AS subject WHERE visibility = 'public'`,
      ),
      db.$queryRawUnsafe(
        `SELECT COUNT(DISTINCT topic)::int AS count FROM public.nodes, unnest(topics) AS topic WHERE visibility = 'public'`,
      ),
    ]);
    return {
      resource_count: Number(resourceCount ?? 0),
      collection_count:
        Number(collectionCount ?? 0) +
        Number(subjectRows?.[0]?.count ?? 0) +
        Number(topicRows?.[0]?.count ?? 0),
    };
  }),

  getResources: impl.getResources.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    assertDatabase(context);
    const db = context.db as any;
    const csv = (value?: string) =>
      value
        ?.split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    const subjects = csv(input.query.subjects);
    const topics = csv(input.query.topics);
    const grades = csv(input.query.grades)?.map(Number).filter(Number.isInteger);
    const languages = csv(input.query.languages);
    const tags = csv(input.query.tags);
    const where = {
      AND: [
        { OR: [{ visibility: 'public' }, { creator_id: context.user.id }] },
        ...(input.query.search
          ? [
              {
                OR: [
                  { title: { contains: input.query.search, mode: 'insensitive' } },
                  { description: { contains: input.query.search, mode: 'insensitive' } },
                ],
              },
            ]
          : []),
        ...(input.query.subject ? [{ subjects: { has: input.query.subject } }] : []),
        ...(subjects?.length ? [{ subjects: { hasSome: subjects } }] : []),
        ...(input.query.topic ? [{ topics: { has: input.query.topic } }] : []),
        ...(topics?.length ? [{ topics: { hasSome: topics } }] : []),
      ],
      type: input.query.type,
      grades: grades?.length ? { hasSome: grades } : undefined,
      language: languages?.length ? { hasSome: languages } : undefined,
      tags: tags?.length ? { hasSome: tags } : undefined,
      difficulty: input.query.difficulty,
      visibility: input.query.visibility,
      is_community:
        input.query.source === 'core'
          ? false
          : input.query.source === 'community'
            ? true
            : undefined,
      verified: input.query.verified_only ? true : undefined,
      created_at: input.query.view_date ? { lte: new Date(input.query.view_date) } : undefined,
    };
    const orderBy =
      input.query.sort_by === 'popular'
        ? { views: 'desc' }
        : input.query.sort_by === 'most_used'
          ? { uses_count: 'desc' }
          : input.query.sort_by === 'most_endorsed'
            ? { endorsements: 'desc' }
            : input.query.sort_by === 'most_bookmarked'
              ? { bookmarks: 'desc' }
              : { created_at: 'desc' };
    const rows = await db.libraryResource.findMany({
      where,
      take: input.query.limit ?? 20,
      skip: input.query.offset ?? 0,
      orderBy,
      include: { creator: { select: { full_name: true, avatar_url: true } } },
    });
    return rows.map(mapResource);
  }),
  getResource: impl.getResource.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    assertDatabase(context);
    const db = context.db as any;
    const row = await db.libraryResource.findUnique({
      where: { id: input.params.id },
      include: {
        creator: { select: { full_name: true, avatar_url: true } },
        _count: { select: { engagements: true } },
      },
    });
    if (!row) throw new ORPCError('NOT_FOUND', { message: 'Resource not found' });
    const engagements = await db.resourceEngagement.findMany({
      where: {
        resource_id: input.params.id,
        user_id: context.user.id,
        engagement_type: { in: ['endorse', 'bookmark'] },
      },
      select: { engagement_type: true },
    });
    return {
      ...mapResource(row),
      has_endorsed: engagements.some((item: any) => item.engagement_type === 'endorse'),
      has_bookmarked: engagements.some((item: any) => item.engagement_type === 'bookmark'),
    };
  }),
  getBookmarkedResources: impl.getBookmarkedResources
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const db = context.db as any;
      const rows = await db.resourceEngagement.findMany({
        where: {
          user_id: context.user.id,
          engagement_type: 'bookmark',
          created_at: input.query.view_date ? { lte: new Date(input.query.view_date) } : undefined,
        },
        take: input.query.limit ?? 20,
        skip: input.query.offset ?? 0,
        orderBy: { created_at: 'desc' },
        include: {
          resource: { include: { creator: { select: { full_name: true, avatar_url: true } } } },
        },
      });
      return rows.map((row: any) => mapResource(row.resource));
    }),
  searchLibrary: impl.searchLibrary
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const db = context.db as any;
      const rows = await db.libraryResource.findMany({
        where: {
          OR: [
            { title: { contains: input.body.query, mode: 'insensitive' } },
            { description: { contains: input.body.query, mode: 'insensitive' } },
          ],
          type: input.body.type,
          subjects: input.body.subject ? { has: input.body.subject } : undefined,
        },
        take: input.body.limit ?? 10,
      });
      return rows.map(mapResource);
    }),
  createResource: impl.createResource
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const db = context.db as any;
      const row = await db.libraryResource.create({
        data: {
          title: input.body.title,
          description: input.body.description ?? null,
          type: input.body.type,
          format: input.body.format,
          url: input.body.url ?? null,
          file_path: input.body.file_path ?? null,
          subjects: input.body.subjects,
          topics: input.body.topics,
          grades: input.body.grades,
          difficulty: input.body.difficulty ?? null,
          language: input.body.language,
          visibility: input.body.visibility,
          creator_id: context.user.id,
          creator_role: context.capacity ?? 'member',
          is_community: input.body.is_community,
        },
        include: { creator: { select: { full_name: true, avatar_url: true } } },
      });
      return mapResource(row);
    }),
  updateResource: impl.updateResource
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const { id } = input.params;
      const updates = input.body;
      if (Object.keys(updates).length === 0) {
        throw new ORPCError('BAD_REQUEST', { message: 'At least one resource field is required' });
      }
      const db = await requireResourceManager(context, id);
      const row = await db.libraryResource.update({
        where: { id },
        data: updates,
        include: { creator: { select: { full_name: true, avatar_url: true } } },
      });
      return mapResource(row);
    }),
  deleteResource: impl.deleteResource
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const db = await requireResourceManager(context, input.params.id);
      await db.libraryResource.delete({ where: { id: input.params.id } });
      return { success: true };
    }),
  verifyResource: impl.verifyResource
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      await requirePlatformAdmin(context);
      const db = context.db as any;
      const row = await db.libraryResource.update({
        where: { id: input.params.id },
        data: { verified: true, verified_by: context.user.id },
        include: { creator: { select: { full_name: true, avatar_url: true } } },
      });
      return mapResource(row);
    }),
  reportBrokenLink: impl.reportBrokenLink
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      await requirePlatformAdmin(context);
      assertDatabase(context);
      const db = context.db as any;
      const resource = await db.libraryResource.findUnique({
        where: { id: input.params.id },
        select: { id: true, fail_count: true },
      });
      if (!resource) throw new ORPCError('NOT_FOUND', { message: 'Resource not found' });
      const failCount = Number(resource.fail_count ?? 0) + 1;
      await db.libraryResource.update({
        where: { id: input.params.id },
        data: {
          fail_count: failCount,
          link_status: failCount >= 3 ? 'broken' : 'unknown',
          last_checked_at: new Date(),
        },
      });
      return { success: true };
    }),
  engage: impl.engage.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    assertDatabase(context);
    const classroomId = input.body.classroom_id;
    const verifiedClassroomIds = context.principal.attributes.classroom_ids;
    if (
      classroomId &&
      (!Array.isArray(verifiedClassroomIds) || !verifiedClassroomIds.includes(classroomId))
    ) {
      throw new ORPCError('FORBIDDEN', { message: 'Classroom scope is not authorized.' });
    }
    const db = context.db as any;
    const row = await db.$transaction(async (tx: any) => {
      const existing = input.body.toggle
        ? await tx.resourceEngagement.findFirst({
            where: {
              resource_id: input.params.id,
              user_id: context.user.id,
              engagement_type: input.body.engagement_type,
            },
          })
        : null;
      if (existing) {
        await tx.resourceEngagement.delete({ where: { id: existing.id } });
        const counter =
          input.body.engagement_type === 'endorse'
            ? 'endorsements'
            : input.body.engagement_type === 'bookmark'
              ? 'bookmarks'
              : input.body.engagement_type === 'use'
                ? 'uses_count'
                : null;
        if (counter)
          await tx.libraryResource.update({
            where: { id: input.params.id },
            data: { [counter]: { decrement: 1 } },
          });
        return existing;
      }
      const created = await tx.resourceEngagement.create({
        data: {
          resource_id: input.params.id,
          user_id: context.user.id,
          engagement_type: input.body.engagement_type,
          classroom_id: classroomId ?? null,
        },
      });
      const counter =
        input.body.engagement_type === 'endorse'
          ? 'endorsements'
          : input.body.engagement_type === 'bookmark'
            ? 'bookmarks'
            : input.body.engagement_type === 'use'
              ? 'uses_count'
              : input.body.engagement_type === 'view'
                ? 'views'
                : null;
      if (counter)
        await tx.libraryResource.update({
          where: { id: input.params.id },
          data: { [counter]: { increment: 1 } },
        });
      if (input.body.engagement_type === 'bookmark') {
        const resource = await tx.libraryResource.findUnique({
          where: { id: input.params.id },
          select: { creator_id: true },
        });
        if (resource?.creator_id && resource.creator_id !== context.user.id) {
          await tx.impactRipple.create({
            data: {
              recipient_user_id: resource.creator_id,
              actor_user_id: context.user.id,
              entity_id: input.params.id,
              ripple_type: 'resource_saved',
              warm_message_en: 'A resource you created was saved by another learner.',
              created_at: new Date(),
            },
          });
        }
      }
      return created;
    });
    return {
      ...row,
      id: String(row.id),
      resource_id: String(row.resource_id),
      user_id: String(row.user_id),
      engagement_type: String(row.engagement_type),
      classroom_id: row.classroom_id ?? null,
      created_at: iso(row.created_at),
    };
  }),
  createCollection: impl.createCollection
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const db = context.db as any;
      const row = await db.libraryCollection.create({
        data: {
          name: input.body.name,
          description: input.body.description ?? null,
          visibility: input.body.visibility,
          subjects: input.body.subjects,
          topics: input.body.topics,
          grades: input.body.grades,
          creator_id: context.user.id,
          ...(input.body.resource_ids.length > 0
            ? {
                collection_nodes: {
                  create: input.body.resource_ids.map((node_id: string, position: number) => ({
                    node_id,
                    position,
                    added_by: context.user.id,
                  })),
                },
              }
            : {}),
        },
        include: {
          creator: { select: { full_name: true, avatar_url: true } },
          collection_nodes: {
            include: {
              node: { include: { creator: { select: { full_name: true, avatar_url: true } } } },
            },
          },
        },
      });
      return mapCollection(row);
    }),
  addToCollection: impl.addToCollection
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const db = await requireCollectionManager(context, input.params.id);
      await db.$transaction(async (tx: any) => {
        const existing = await tx.collectionNode.findFirst({
          where: { collection_id: input.params.id, node_id: input.body.resource_id },
        });
        if (existing) return;
        await tx.collectionNode.create({
          data: {
            collection_id: input.params.id,
            node_id: input.body.resource_id,
            added_by: context.user.id,
          },
        });
      });
      return { success: true };
    }),
  removeFromCollection: impl.removeFromCollection
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const db = await requireCollectionManager(context, input.params.id);
      await db.collectionNode.deleteMany({
        where: { collection_id: input.params.id, node_id: input.params.resourceId },
      });
      return { success: true };
    }),
  updateCollection: impl.updateCollection
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const { id } = input.params;
      const updates = input.body;
      if (Object.keys(updates).length === 0) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'At least one collection field is required',
        });
      }
      const db = await requireCollectionManager(context, id);
      const row = await db.libraryCollection.update({
        where: { id },
        data: updates,
        include: {
          creator: { select: { full_name: true, avatar_url: true } },
          collection_nodes: { include: { node: true } },
        },
      });
      return mapCollection(row);
    }),
  deleteCollection: impl.deleteCollection
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const db = await requireCollectionManager(context, input.params.id);
      await db.libraryCollection.delete({ where: { id: input.params.id } });
      return { success: true };
    }),
  forkCollection: impl.forkCollection
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const db = context.db as any;
      const fork = await db.$transaction(async (tx: any) => {
        const original = await tx.libraryCollection.findUnique({
          where: { id: input.params.id },
          include: { collection_nodes: { orderBy: { position: 'asc' }, include: { node: true } } },
        });
        if (!original) throw new ORPCError('NOT_FOUND', { message: 'Collection not found' });
        if (
          original.visibility !== 'public' &&
          original.creator_id !== context.user.id &&
          !(await isPlatformAdmin(context))
        ) {
          throw new ORPCError('FORBIDDEN', { message: 'Collection access required' });
        }
        const memberships = (original.collection_nodes ?? []).filter(
          (membership: any) => membership.node_id,
        );
        const created = await tx.libraryCollection.create({
          data: {
            name: `${original.name} (Fork)`,
            description: original.description ?? null,
            creator_id: context.user.id,
            visibility: 'private',
            subjects: original.subjects ?? [],
            topics: original.topics ?? [],
            grades: original.grades ?? [],
            resource_ids: memberships.map((membership: any) => membership.node_id),
            sequence_order: memberships.map((membership: any, index: number) =>
              Number(membership.position ?? index),
            ),
            is_official: false,
            forks: 0,
            used_by_count: 0,
            endorsements: 0,
            estimated_duration: original.estimated_duration ?? null,
            original_collection_id: original.id,
            collection_nodes: {
              create: memberships.map((membership: any, index: number) => ({
                node_id: membership.node_id,
                position: Number(membership.position ?? index),
                added_by: context.user.id,
              })),
            },
          },
          include: {
            creator: { select: { full_name: true, avatar_url: true } },
            collection_nodes: { include: { node: true } },
          },
        });
        await tx.libraryCollection.update({
          where: { id: original.id },
          data: { forks: { increment: 1 } },
        });
        return created;
      });
      return mapCollection(fork);
    }),
  getCollections: impl.getCollections
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const db = context.db as any;
      const grades = (input.query.grades ?? '')
        .split(',')
        .map((grade: string) => Number(grade.trim()))
        .filter((grade: number) => Number.isInteger(grade));
      const requestedOtherCreator =
        input.query.creator_id && input.query.creator_id !== context.user.id;
      const privateAccess =
        input.query.visibility && !['public', 'shared'].includes(input.query.visibility)
          ? { creator_id: context.user.id }
          : requestedOtherCreator
            ? { visibility: { in: ['public', 'shared'] } }
            : !input.query.creator_id && !input.query.visibility
              ? {
                  OR: [
                    { visibility: { in: ['public', 'shared'] } },
                    { creator_id: context.user.id },
                  ],
                }
              : {};
      const pageLimit = input.query.limit ?? 20;
      const pageOffset = input.query.offset ?? 0;
      const explicitRows = input.query.only_virtual
        ? []
        : await db.libraryCollection.findMany({
            where: {
              creator_id: input.query.creator_id,
              ...privateAccess,
              ...(input.query.visibility ? { visibility: input.query.visibility } : {}),
              OR: input.query.subject
                ? [{ subjects: { has: input.query.subject } }, { subject: input.query.subject }]
                : input.query.search
                  ? [
                      { name: { contains: input.query.search, mode: 'insensitive' } },
                      { description: { contains: input.query.search, mode: 'insensitive' } },
                    ]
                  : undefined,
              grades: grades.length ? { hasSome: grades } : undefined,
              created_at: input.query.view_date
                ? { lte: new Date(input.query.view_date) }
                : undefined,
            },
            take: pageLimit + pageOffset,
            skip: 0,
            orderBy: { created_at: 'desc' },
            include: {
              creator: { select: { full_name: true, avatar_url: true } },
              collection_nodes: { include: { node: true } },
            },
          });
      const explicit = input.query.view_date
        ? await hydrateCollectionsAtAsOf(db, explicitRows, input.query.view_date)
        : explicitRows;
      const virtual =
        input.query.exclude_virtual ||
        input.query.creator_id ||
        (input.query.visibility && input.query.visibility !== 'public')
          ? []
          : await fetchVirtualCollections(db, input.query);
      const combined = [...explicit.map(mapCollection), ...virtual];
      return combined.slice(pageOffset, pageOffset + pageLimit);
    }),
  getCollection: impl.getCollection
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const db = context.db as any;
      if (input.params.id.startsWith('subject:') || input.params.id.startsWith('topic:')) {
        const kind = input.params.id.startsWith('subject:') ? 'subject' : 'topic';
        const term = input.params.id.slice(kind.length + 1);
        const rows = await db.libraryResource.findMany({
          where: {
            visibility: 'public',
            ...(kind === 'subject' ? { subjects: { has: term } } : { topics: { has: term } }),
            created_at: input.query.view_date
              ? { lte: new Date(input.query.view_date) }
              : undefined,
          },
          take: 50,
          orderBy: { created_at: 'desc' },
        });
        return mapVirtualCollection(kind, term, rows.length, rows);
      }
      const row = await db.libraryCollection.findUnique({
        where: { id: input.params.id },
        include: {
          creator: { select: { full_name: true, avatar_url: true } },
          collection_nodes: { include: { node: true } },
        },
      });
      if (!row) throw new ORPCError('NOT_FOUND', { message: 'Collection not found' });

      if (input.query.view_date) {
        const membership = await fetchCollectionMembershipAsOf(
          db,
          input.params.id,
          input.query.view_date,
        );
        const nodeIds = membership.map((event: any) => String(event.node_id));
        const resources = nodeIds.length
          ? await db.libraryResource.findMany({
              where: { id: { in: nodeIds } },
              include: { creator: { select: { full_name: true, avatar_url: true } } },
            })
          : [];
        const byId = new Map(resources.map((resource: any) => [String(resource.id), resource]));
        return mapCollection({
          ...row,
          collection_nodes: membership
            .map((event: any) => byId.get(String(event.node_id)))
            .filter(Boolean)
            .map((node: any, position: number) => ({ node, position })),
        });
      }
      return mapCollection(row);
    }),
  getMapTopology: impl.getMapTopology.use(doubleGateMiddleware).handler(async ({ context }) => {
    assertDatabase(context);
    const db = context.db as any;
    const [resources, edges, collections] = await Promise.all([
      db.libraryResource.findMany({
        where: { visibility: 'public' },
        select: {
          id: true,
          title: true,
          type: true,
          subjects: true,
          topics: true,
          tags: true,
          thumbnail_url: true,
          description: true,
          is_ministry_official: true,
        },
      }),
      db.$queryRawUnsafe(
        `SELECT e.from_node_id, e.to_node_id, e.relationship, e.weight
             FROM public.edges e
             JOIN public.nodes source_node ON source_node.id = e.from_node_id
             JOIN public.nodes target_node ON target_node.id = e.to_node_id
            WHERE source_node.visibility = 'public'
              AND target_node.visibility = 'public'`,
      ),
      db.libraryCollection.findMany({
        where: { is_official: true, visibility: 'public' },
        select: { resource_ids: true },
      }),
    ]);

    const nodes: any[] = [];
    const links: any[] = [];
    const topicNodes = new Set<string>();
    for (const resource of resources) {
      nodes.push({
        id: String(resource.id),
        label: String(resource.title),
        type: 'resource',
        group: String(resource.type ?? 'unknown'),
        thumbnail: resource.thumbnail_url ?? undefined,
        metadata: {
          subjects: resource.subjects ?? [],
          topics: resource.topics ?? [],
          tags: resource.tags ?? [],
          description: resource.description ?? undefined,
          is_ministry_official: Boolean(resource.is_ministry_official),
        },
      });
      for (const topic of resource.topics ?? []) {
        const topicId = `topic:${topic}`;
        if (!topicNodes.has(topicId)) {
          nodes.push({ id: topicId, label: String(topic), type: 'topic', group: 'curiosity' });
          topicNodes.add(topicId);
        }
        links.push({
          source: String(resource.id),
          target: topicId,
          value: 1,
          relationship: 'topic_association',
        });
      }
    }
    const allowedRelationships = new Set([
      'prerequisite',
      'related',
      'leads_to',
      'part_of',
      'example',
    ]);
    for (const edge of edges ?? []) {
      const relationship = String(edge.relationship ?? 'related');
      links.push({
        source: String(edge.from_node_id),
        target: String(edge.to_node_id),
        value: Number(edge.weight ?? 1),
        relationship: allowedRelationships.has(relationship) ? relationship : 'related',
      });
    }
    for (const collection of collections ?? []) {
      const resourceIds = Array.isArray(collection.resource_ids)
        ? collection.resource_ids.map(String)
        : [];
      for (let index = 0; index < resourceIds.length - 1; index += 1) {
        links.push({
          source: resourceIds[index],
          target: resourceIds[index + 1],
          value: 2,
          relationship: 'path',
          isPathway: true,
        });
      }
    }
    return { nodes, links };
  }),
});
