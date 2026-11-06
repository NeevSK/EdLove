import { ORPCError } from '@orpc/server';
import type { PoolClient } from 'pg';
import type { RecordRef } from '../records/records';

export type GrantAudience =
  | { type: 'account'; id: string }
  | { type: 'entity'; id: string }
  | { type: 'public' };

/** Sharing grants of one command, inside that command's transaction. */
export function sharingGrants(client: PoolClient, actorAccountId: string) {
  return {
    async give(
      record: RecordRef,
      input: {
        audience: GrantAudience;
        actions: readonly string[];
        purpose: string;
        expiresAt: Date | null;
      },
    ) {
      const audienceId = input.audience.type === 'public' ? null : input.audience.id;
      const result = await client.query<{ id: string }>(
        `insert into public.sharing_grants
           (grantor_account,record_type,record_id,audience_type,audience_id,actions,purpose,expires_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8) returning id`,
        [
          actorAccountId,
          record.type,
          record.id,
          input.audience.type,
          audienceId,
          input.actions,
          input.purpose,
          input.expiresAt,
        ],
      );
      return result.rows[0]!.id;
    },

    /** Only the person who gave a grant revokes it here; an institution's successor is undecided. */
    async revoke(grantId: string) {
      const result = await client.query(
        `update public.sharing_grants set revoked_at=clock_timestamp(), revoked_by=$2
         where id=$1 and grantor_account=$2 and revoked_at is null`,
        [grantId, actorAccountId],
      );
      if (result.rowCount !== 1) throw new ORPCError('FORBIDDEN');
    },
  };
}

export type SharingGrants = ReturnType<typeof sharingGrants>;

/**
 * Whether a live grant lets this person act on the record, through the entities of their
 * current bonds. A module feeds this into its resource attributes so Cedar decides with it.
 * Held under share lock, so a revoke waits for this command and applies to the next one.
 */
export async function isGranted(
  client: PoolClient,
  record: RecordRef,
  action: string,
  caller: { accountId: string; entityIds: readonly string[] },
) {
  const result = await client.query(
    `select 1 from public.sharing_grants
     where record_type=$1 and record_id=$2 and $3 = any(actions)
       and revoked_at is null and (expires_at is null or expires_at > clock_timestamp())
       and (audience_type='public'
         or (audience_type='account' and audience_id=$4)
         or (audience_type='entity' and audience_id = any($5::text[])))
     limit 1 for share`,
    [record.type, record.id, action, caller.accountId, caller.entityIds],
  );
  return result.rows.length > 0;
}

export interface AgentDelegation {
  key: string;
  delegationId: string;
}

/**
 * An agent's authority is the person's, narrowed by this grant. Read under share lock in the
 * command's transaction, so revoking takes effect on the next action even if the agent still
 * holds an unexpired token. An empty `resource_scope` covers every resource the person may reach.
 */
export async function assertDelegation(
  client: PoolClient,
  accountId: string,
  agent: AgentDelegation,
  capability: string,
  resource: RecordRef | undefined,
) {
  const result = await client.query(
    `select 1 from public.channel_delegations
     where id=$1 and account_id=$2 and agent_key=$3 and $4 = any(capabilities)
       and status='active' and revoked_at is null
       and (expires_at is null or expires_at > clock_timestamp())
       and (resource_scope = '{}'::jsonb
         or resource_scope @> jsonb_build_object('type',$5::text,'id',$6::text))
     for share`,
    [agent.delegationId, accountId, agent.key, capability, resource?.type, resource?.id],
  );
  if (result.rows.length === 0) throw new ORPCError('FORBIDDEN');
}
