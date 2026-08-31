import { type JournalEntry, journalEntriesContract } from '@repo/core/api/journalEntries.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { queryDatabaseRows } from '@repo/database/client';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(journalEntriesContract).$context<ORPCContext>();

const requireUser = (context: ORPCContext) => {
  assertDatabase(context);
  if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
};

const mapEntry = (row: any): JournalEntry => ({
  id: String(row.id),
  user_id: String(row.user_id),
  content: String(row.content),
  created_at: new Date(row.created_at).toISOString(),
});

export const journalEntriesRouter = impl.router({
  list: impl.list.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const cutoff = input.query.view_date ? new Date(input.query.view_date) : null;
    const start = cutoff
      ? new Date(Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth(), cutoff.getUTCDate()))
      : null;
    const end = start ? new Date(start.getTime() + 24 * 60 * 60 * 1000) : null;
    const rows = await queryDatabaseRows<any>(
      `select id, user_id, content, created_at from public.journal_entries
       where user_id = $1::uuid
         and ($3::timestamptz is null or (created_at >= $3::timestamptz and created_at < $4::timestamptz))
       order by created_at desc limit $2`,
      [context.user.id, input.query.limit, start, end],
    );
    return rows.map(mapEntry);
  }),

  create: impl.create.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const rows = await queryDatabaseRows<any>(
      `insert into public.journal_entries (user_id, content)
       values ($1::uuid, $2)
       returning id, user_id, content, created_at`,
      [context.user.id, input.body.content],
    );
    if (!rows[0]) throw SovereignError.unavailable('JOURNAL_ENTRY_WRITE_FAILED');
    return mapEntry(rows[0]);
  }),
});
