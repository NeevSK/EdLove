import { type PrivacyLedgerEntry, privacyORPCContract } from '@repo/core/api/privacy.orpc.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { queryDatabaseRows } from '@repo/database/client';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(privacyORPCContract).$context<ORPCContext>();

const requireUser = (context: ORPCContext) => {
  assertDatabase(context);
  if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
};

const mapEntry = (row: any): PrivacyLedgerEntry => ({
  id: String(row.id),
  user_id: String(row.user_id),
  activity_type: String(row.activity_type),
  resource_name: String(row.resource_name),
  description: String(row.description),
  metadata: row.metadata && typeof row.metadata === 'object' ? row.metadata : {},
  created_at: new Date(row.created_at).toISOString(),
});

export const privacyRouter = impl.router({
  getPrivacyLedger: impl.getPrivacyLedger.use(doubleGateMiddleware).handler(async ({ context }) => {
    requireUser(context);
    const rows = await queryDatabaseRows<any>(
      `
          select id, user_id, activity_type, resource_name, description, metadata, created_at
          from public.privacy_ledger_entries
          where user_id = $1::uuid
          order by created_at desc
        `,
      [context.user.id],
    );
    return rows.map(mapEntry);
  }),

  logPrivacyEvent: impl.logPrivacyEvent
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireUser(context);
      const rows = await queryDatabaseRows<any>(
        `
          insert into public.privacy_ledger_entries
            (user_id, activity_type, resource_name, description, metadata)
          values ($1::uuid, $2, $3, $4, $5::jsonb)
          returning id, user_id, activity_type, resource_name, description, metadata, created_at
        `,
        [
          context.user.id,
          input.body.activity_type,
          input.body.resource_name,
          input.body.description,
          JSON.stringify(input.body.metadata ?? {}),
        ],
      );
      if (!rows[0]) throw SovereignError.unavailable('PRIVACY_LEDGER_WRITE_FAILED');
      return mapEntry(rows[0]);
    }),
});
