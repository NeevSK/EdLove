import { implement } from '../orpc';
import { dailyContentContract } from '@repo/core/api/server';
import type { ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(dailyContentContract).$context<ORPCContext>();

function normalizeDailyContentRow(row: any) {
  if (!row) return null;
  return {
    id: String(row.id),
    type: row.type === 'did_you_know' ? ('did_you_know' as const) : ('motivation' as const),
    content: String(row.content ?? ''),
    ...(row.author ? { author: String(row.author) } : {}),
    date: String(row.date ?? ''),
    active: Boolean(row.active),
    created_at: String(row.created_at ?? ''),
  };
}

async function fetchRows(db: NonNullable<ORPCContext['db']>, date: string, days?: number) {
  const rows = days
    ? await db.$queryRaw`SELECT id, type, content, author, date, active, created_at
       FROM daily_content WHERE active = true AND date >= ${date}
       ORDER BY date DESC, type`
    : await db.$queryRaw`SELECT id, type, content, author, date, active, created_at
       FROM daily_content WHERE active = true AND date = ${date}
       ORDER BY type`;
  return (Array.isArray(rows) ? rows : [])
    .map(normalizeDailyContentRow)
    .filter((row): row is NonNullable<typeof row> => row !== null);
}

export const dailyContentRouter = impl.router({
  getToday: impl.getToday.use(doubleGateMiddleware).handler(async ({ context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const rows = await fetchRows(context.db, new Date().toISOString().slice(0, 10));
    return {
      motivation: rows.find((row) => row.type === 'motivation') ?? null,
      didYouKnow: rows.find((row) => row.type === 'did_you_know') ?? null,
    };
  }),
  getForDate: impl.getForDate.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    return fetchRows(context.db, input.date);
  }),
  getRecent: impl.getRecent.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const startDate = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    return fetchRows(context.db, startDate, input.days);
  }),
});
