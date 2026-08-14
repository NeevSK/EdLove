import { historyContract } from '@repo/core/api/history.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { queryDatabaseRows } from '@repo/database/client';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(historyContract).$context<ORPCContext>();
const iso = (value: unknown) => (value instanceof Date ? value.toISOString() : String(value ?? ''));

export const historyRouter = impl.router({
  getCollectionMembershipTimeline: impl.getCollectionMembershipTimeline
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
      const rows = await context.db.collectionNodeEvent.findMany({
        where: { collection_id: input.params.collectionId },
        orderBy: { occurred_at: 'desc' },
      });
      const actorIds = [
        ...new Set(rows.map((row: any) => row.actor_id).filter(Boolean)),
      ] as string[];
      const actors = actorIds.length
        ? await context.db.user.findMany({
            where: { id: { in: actorIds } },
            select: { id: true, full_name: true },
          })
        : [];
      const actorNames = new Map(
        actors.map((actor: any) => [String(actor.id), String(actor.full_name)]),
      );
      return rows.map((row: any) => ({
        id: String(row.id),
        collection_id: String(row.collection_id),
        node_id: String(row.node_id),
        event_type: row.event_type,
        position: row.position ?? null,
        occurred_at: iso(row.occurred_at),
        actor_id: row.actor_id ? String(row.actor_id) : null,
        actor:
          row.actor_id && actorNames.has(String(row.actor_id))
            ? { full_name: actorNames.get(String(row.actor_id)) as string }
            : null,
      }));
    }),

  getCollectionMembershipAsOf: impl.getCollectionMembershipAsOf
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
      const events = await context.db.collectionNodeEvent.findMany({
        where: {
          collection_id: input.params.collectionId,
          occurred_at: { lte: new Date(input.query.asOf) },
        },
        orderBy: { occurred_at: 'asc' },
      });
      const latest = new Map<string, any>();
      const addedAt = new Map<string, string>();
      const removedAt = new Map<string, string>();
      for (const event of events) {
        const nodeId = String(event.node_id);
        latest.set(nodeId, event);
        const occurredAt = iso(event.occurred_at);
        if (event.event_type === 'added') addedAt.set(nodeId, occurredAt);
        if (event.event_type === 'removed') removedAt.set(nodeId, occurredAt);
      }
      return [...latest.entries()]
        .filter(([, event]) => event.event_type !== 'removed')
        .map(([node_id, event]) => ({
          node_id,
          position: Number(event.position ?? 0),
          added_at: addedAt.get(node_id) ?? null,
          removed_at: removedAt.get(node_id) ?? null,
        }));
    }),

  getLibraryEntityHistory: impl.getLibraryEntityHistory
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
      const rows = await queryDatabaseRows<any>(
        `
          select
            v.id,
            v.entity_type,
            v.entity_id,
            v.event_type,
            v.changed_at,
            v.changed_by,
            v.snapshot,
            u.full_name as author_full_name
          from public.library_entity_versions v
          left join public.users u on u.id = v.changed_by
          where v.entity_type = $1
            and v.entity_id = $2::uuid
            and (
              coalesce(v.snapshot->'after'->>'visibility', v.snapshot->'before'->>'visibility', v.snapshot->>'visibility') = 'public'
              or coalesce(v.snapshot->'after'->>'creator_id', v.snapshot->'before'->>'creator_id', v.snapshot->>'creator_id') = $3
              or exists (
                select 1 from public.bonds b
                where b.user_id = $3
                  and b.entity_type = 'PLATFORM'
                  and b.capacity = 'admin'
              )
            )
          order by v.changed_at desc
        `,
        [input.params.entityType, input.params.entityId, context.user.id],
      );
      return rows.map((row) => ({
        id: String(row.id),
        entity_type: String(row.entity_type),
        entity_id: String(row.entity_id),
        event_type: row.event_type,
        changed_at: iso(row.changed_at),
        changed_by: row.changed_by ? String(row.changed_by) : null,
        snapshot: row.snapshot ?? {},
        author: row.author_full_name ? { full_name: String(row.author_full_name) } : null,
      }));
    }),

  getCommunityEntityHistory: impl.getCommunityEntityHistory
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
      const rows = await queryDatabaseRows<any>(
        `
          select
            v.id,
            v.entity_type,
            v.entity_id,
            v.event_type,
            v.changed_at,
            v.changed_by,
            v.snapshot,
            u.full_name as author_full_name
          from public.community_entity_versions v
          left join public.users u on u.id = v.changed_by
          where v.entity_type = $1
            and v.entity_id = $2::uuid
            and (
              (
                v.entity_type in ('community_post', 'community_comment')
                and (
                  coalesce(v.snapshot->'after'->>'school_id', v.snapshot->'before'->>'school_id', v.snapshot->>'school_id') is null
                  or coalesce(v.snapshot->'after'->>'school_id', v.snapshot->'before'->>'school_id', v.snapshot->>'school_id') = (
                    select school_id::text from public.users where id = $3
                  )
                )
              )
              or (
                v.entity_type = 'group_message'
                and exists (
                  select 1 from public.community_group_members m
                  where m.group_id = coalesce(
                    nullif(v.snapshot->'after'->>'group_id', '')::uuid,
                    nullif(v.snapshot->'before'->>'group_id', '')::uuid,
                    nullif(v.snapshot->>'group_id', '')::uuid
                  )
                    and m.user_id = $3
                    and m.status = 'active'
                )
              )
              or (
                v.entity_type = 'direct_message'
                and exists (
                  select 1 from public.direct_conversations dc
                  where dc.id = coalesce(
                    nullif(v.snapshot->'after'->>'conversation_id', '')::uuid,
                    nullif(v.snapshot->'before'->>'conversation_id', '')::uuid,
                    nullif(v.snapshot->>'conversation_id', '')::uuid
                  )
                    and (dc.user1_id = $3::uuid or dc.user2_id = $3::uuid)
                )
              )
              or exists (
                select 1 from public.bonds b
                where b.user_id = $3
                  and b.entity_type = 'PLATFORM'
                  and b.capacity = 'admin'
              )
            )
          order by v.changed_at desc
        `,
        [input.params.entityType, input.params.entityId, context.user.id],
      );
      return rows.map((row) => ({
        id: String(row.id),
        entity_type: String(row.entity_type),
        entity_id: String(row.entity_id),
        event_type: row.event_type,
        changed_at: iso(row.changed_at),
        changed_by: row.changed_by ? String(row.changed_by) : null,
        snapshot: row.snapshot ?? {},
        author: row.author_full_name ? { full_name: String(row.author_full_name) } : null,
      }));
    }),

  getClassroomNoteHistory: impl.getClassroomNoteHistory
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
      const note = await context.db.classroomNote.findUnique({
        where: { id: input.params.recordId },
        select: { id: true },
      });
      if (!note) return [];
      const rows = await queryDatabaseRows<any>(
        `
          select
            l.id,
            l.table_name,
            l.record_id,
            l.action,
            l.old_data,
            l.new_data,
            l.changed_by,
            l.changed_at,
            u.full_name as author_full_name
          from audit.logs l
          left join public.users u on u.id = l.changed_by
          where l.table_name = 'classroom_notes'
            and l.record_id = $1::uuid
          order by l.changed_at desc
        `,
        [input.params.recordId],
      );
      return rows.map((row) => ({
        id: String(row.id),
        table_name: 'classroom_notes' as const,
        record_id: String(row.record_id),
        action: row.action,
        old_data: row.old_data ?? null,
        new_data: row.new_data ?? null,
        changed_by: row.changed_by ? String(row.changed_by) : null,
        changed_at: iso(row.changed_at),
        author: row.author_full_name ? { full_name: String(row.author_full_name) } : null,
      }));
    }),
});
