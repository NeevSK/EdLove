import { ORPCError } from '@orpc/server';
import type { PoolClient } from 'pg';

export interface RecordRef {
  type: string;
  id: string;
}

const conflict = (message: string) => new ORPCError('CONFLICT', { message });

// A hold and a purge of one record must not overlap, whichever comes first.
const lockRecord = (client: PoolClient, record: RecordRef) =>
  client.query('select pg_advisory_xact_lock(hashtextextended($1,0))', [
    `record:${record.type}:${record.id}`,
  ]);

const isHeld = async (client: PoolClient, record: RecordRef) =>
  (
    await client.query(
      `select 1 from public.record_holds
       where record_type=$1 and record_id=$2 and lifted_at is null limit 1`,
      [record.type, record.id],
    )
  ).rows.length > 0;

/** Lifecycle of one command's records, inside that command's transaction. */
export function recordLifecycle(client: PoolClient, actorAccountId: string) {
  return {
    /** Fails if someone else changed the record since `expected`. Zero means not yet versioned. */
    async advanceVersion(record: RecordRef, expected: number) {
      const result = await client.query<{ version: string }>(
        `insert into public.record_versions (record_type,record_id,version)
         select $1,$2,1 where $3::bigint = 0
         on conflict (record_type,record_id) do nothing
         returning version`,
        [record.type, record.id, expected],
      );
      const next =
        result.rows[0] ??
        (
          await client.query<{ version: string }>(
            `update public.record_versions set version=version+1, updated_at=clock_timestamp()
             where record_type=$1 and record_id=$2 and version=$3::bigint
             returning version`,
            [record.type, record.id, expected],
          )
        ).rows[0];
      if (!next) throw conflict('This record changed since it was read.');
      return Number(next.version);
    },

    /** Records why the current value was superseded; `supersedes` is the latest correction read. */
    async correct(record: RecordRef, input: { supersedes: string | null; reason: string }) {
      const result = await client.query<{ id: string }>(
        `insert into public.record_corrections (record_type,record_id,supersedes,reason,author_account)
         values ($1,$2,$3,$4,$5)
         on conflict on constraint record_corrections_one_successor do nothing
         returning id`,
        [record.type, record.id, input.supersedes, input.reason, actorAccountId],
      );
      const created = result.rows[0];
      if (!created) throw conflict('This record was already corrected.');
      return created.id;
    },

    /** `restoreUntil` comes from the module's declared policy; null keeps the record indefinitely. */
    async softDelete(
      record: RecordRef,
      input: { ownerAccountId: string | null; reason: string; restoreUntil: Date | null },
    ) {
      await lockRecord(client, record);
      if (await isHeld(client, record)) throw conflict('This record is under a hold.');
      const result = await client.query(
        `insert into public.record_tombstones
           (record_type,record_id,owner_account,deleted_by,reason,restore_until)
         values ($1,$2,$3,$4,$5,$6)
         on conflict (record_type,record_id) do update set
           owner_account=excluded.owner_account, deleted_by=excluded.deleted_by,
           reason=excluded.reason, deleted_at=clock_timestamp(),
           restore_until=excluded.restore_until, restored_at=null, restored_by=null
         where public.record_tombstones.restored_at is not null
           and public.record_tombstones.purged_at is null`,
        [
          record.type,
          record.id,
          input.ownerAccountId,
          actorAccountId,
          input.reason,
          input.restoreUntil,
        ],
      );
      if (result.rowCount !== 1) throw conflict('This record is already deleted.');
    },

    async restore(record: RecordRef) {
      const result = await client.query(
        `update public.record_tombstones set restored_at=clock_timestamp(), restored_by=$3
         where record_type=$1 and record_id=$2 and restored_at is null and purged_at is null
           and (restore_until is null or restore_until > clock_timestamp())`,
        [record.type, record.id, actorAccountId],
      );
      if (result.rowCount !== 1) throw conflict('This record can no longer be restored.');
    },

    async placeHold(record: RecordRef, reason: string) {
      await lockRecord(client, record);
      const result = await client.query<{ id: string }>(
        `insert into public.record_holds (record_type,record_id,reason,placed_by)
         values ($1,$2,$3,$4) returning id`,
        [record.type, record.id, reason, actorAccountId],
      );
      return result.rows[0]!.id;
    },

    async liftHold(holdId: string) {
      const result = await client.query(
        `update public.record_holds set lifted_at=clock_timestamp(), lifted_by=$2
         where id=$1 and lifted_at is null`,
        [holdId, actorAccountId],
      );
      if (result.rowCount !== 1) throw conflict('This hold is not active.');
    },
  };
}

export type RecordLifecycle = ReturnType<typeof recordLifecycle>;

/**
 * Purges one batch of a record type whose restore window has passed. The module's `purge`
 * removes its content; the tombstone stays. Holds are re-read under the record's lock, so a
 * hold placed just before this runs wins.
 */
export async function purgeExpiredRecords(
  client: PoolClient,
  recordType: string,
  limit: number,
  purge: (recordId: string) => Promise<void>,
) {
  const expired = await client.query<{ record_id: string }>(
    `select record_id from public.record_tombstones
     where record_type=$1 and restored_at is null and purged_at is null
       and restore_until <= clock_timestamp()
     order by restore_until limit $2 for update skip locked`,
    [recordType, limit],
  );
  const purged: string[] = [];
  for (const { record_id: id } of expired.rows) {
    const record = { type: recordType, id };
    await lockRecord(client, record);
    if (await isHeld(client, record)) continue;
    await purge(id);
    await client.query(
      `update public.record_tombstones set purged_at=clock_timestamp()
       where record_type=$1 and record_id=$2`,
      [recordType, id],
    );
    purged.push(id);
  }
  return purged;
}
