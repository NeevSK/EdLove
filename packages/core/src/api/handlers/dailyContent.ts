import type { Context } from 'hono';

function normalizeDailyContentRow(row: any) {
  if (!row) return null;
  return {
    id: String(row.id),
    type: row.type === 'did_you_know' ? 'did_you_know' : 'motivation',
    content: String(row.content ?? ''),
    author: row.author ? String(row.author) : undefined,
    date: String(row.date ?? ''),
    active: Boolean(row.active),
    created_at: String(row.created_at ?? ''),
  };
}

function escapeSqlLiteral(value: string | undefined) {
  return String(value ?? '').replace(/'/g, "''");
}

async function fetchDailyContentRows(db: any, date: string | undefined, limitDays?: number) {
  const safeDate = escapeSqlLiteral(date);
  const sql = limitDays
    ? `SELECT id, type, content, author, date, active, created_at
       FROM daily_content
       WHERE active = true AND date >= '${safeDate}'
       ORDER BY date DESC, type`
    : `SELECT id, type, content, author, date, active, created_at
       FROM daily_content
       WHERE active = true AND date = '${safeDate}'
       ORDER BY type`;
  const rows = await db.$queryRawUnsafe(sql);
  return Array.isArray(rows) ? rows : [];
}

export const dailyContentHandlers = {
  getToday: async (c: Context) => {
    const db = c.get('db');
    if (!db) return c.json({ error: 'Database context not available' }, 500);

    const today = new Date().toISOString().split('T')[0];
    const rows = await fetchDailyContentRows(db, String(today ?? ''));
    const normalized = rows.map(normalizeDailyContentRow).filter(Boolean);

    const motivation = normalized.find((row: any) => row.type === 'motivation') ?? null;
    const didYouKnow = normalized.find((row: any) => row.type === 'did_you_know') ?? null;

    return c.json({ motivation, didYouKnow }, 200);
  },

  getForDate: async (c: Context) => {
    const db = c.get('db');
    if (!db) return c.json({ error: 'Database context not available' }, 500);

    const params = c.req.param() as Record<string, string | undefined>;
    const rows = await fetchDailyContentRows(db, String(params.date ?? ''));
    return c.json(rows.map(normalizeDailyContentRow).filter(Boolean), 200);
  },

  getRecent: async (c: Context) => {
    const db = c.get('db');
    if (!db) return c.json({ error: 'Database context not available' }, 500);

    const params = c.req.param() as Record<string, string | undefined>;
    const windowDays = Number(params.days ?? 7) || 7;
    const startDate = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const rows = await fetchDailyContentRows(db, String(startDate ?? ''), windowDays);
    return c.json(rows.map(normalizeDailyContentRow).filter(Boolean), 200);
  },
};
