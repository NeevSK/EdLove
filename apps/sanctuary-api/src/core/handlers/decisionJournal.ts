import { type DecisionLog, decisionJournalContract } from '@repo/core/api/decisionJournal.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { queryDatabaseRows } from '@repo/database/client';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(decisionJournalContract).$context<ORPCContext>();

const requireUser = (context: ORPCContext) => {
  assertDatabase(context);
  if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
};

const mapDecision = (row: any): DecisionLog => ({
  id: String(row.id),
  user_id: String(row.user_id),
  decision_text: String(row.decision_text),
  context: row.context == null ? null : String(row.context),
  is_reviewed: Boolean(row.is_reviewed),
  created_at: new Date(row.created_at).toISOString(),
});

const columns = 'id, user_id, decision_text, context, is_reviewed, created_at';

export const decisionJournalRouter = impl.router({
  list: impl.list.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const cutoff = input.query.view_date ? new Date(input.query.view_date) : null;
    const start = cutoff
      ? new Date(Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth(), cutoff.getUTCDate()))
      : null;
    const end = start ? new Date(start.getTime() + 24 * 60 * 60 * 1000) : null;
    const rows = await queryDatabaseRows<any>(
      `select ${columns} from public.decision_journals
       where user_id = $1::uuid
         and ($3::timestamptz is null or (created_at >= $3::timestamptz and created_at < $4::timestamptz))
       order by created_at desc limit $2`,
      [context.user.id, input.query.limit, start, end],
    );
    return rows.map(mapDecision);
  }),

  create: impl.create.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const rows = await queryDatabaseRows<any>(
      `insert into public.decision_journals
        (user_id, decision_text, context, is_reviewed, idempotency_key)
       values ($1::uuid, $2, $3, false, $4)
       on conflict do update set decision_text = excluded.decision_text,
         context = excluded.context
       returning ${columns}`,
      [
        context.user.id,
        input.body.decision_text,
        input.body.context ?? null,
        input.body.idempotency_key ?? null,
      ],
    );
    if (!rows[0]) throw SovereignError.unavailable('DECISION_JOURNAL_WRITE_FAILED');
    return mapDecision(rows[0]);
  }),

  markReviewed: impl.markReviewed.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const rows = await queryDatabaseRows<any>(
      `update public.decision_journals set is_reviewed = $2
       where id = $1::uuid and user_id = $3::uuid
       returning ${columns}`,
      [input.params.id, input.body.is_reviewed, context.user.id],
    );
    if (!rows[0]) throw SovereignError.notFound('Decision journal entry');
    return mapDecision(rows[0]);
  }),
});
