import { HttpResponse, http } from 'msw';

const API_ORIGIN = 'https://qzoawolfkuwiuyaoiybz.supabase.co';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function readProcedureInput(request: Request): Promise<Record<string, unknown>> {
  const envelope: unknown = await request.json();
  if (!isRecord(envelope) || !isRecord(envelope.json)) return {};
  return envelope.json;
}

function queryLimit(input: Record<string, unknown>, fallback: number): number {
  const query = isRecord(input.query) ? input.query : null;
  const limit = query?.limit;
  return typeof limit === 'number' && Number.isFinite(limit) && limit >= 0 ? limit : fallback;
}

export const selfJournalHandlers = [
  // GET /api/self/getJournalHistory
  http.post(`${API_ORIGIN}/api/self/getJournalHistory`, async ({ request }) => {
    const input = await readProcedureInput(request);
    const limit = queryLimit(input, 12);

    // Return mock burned journal entries
    const entries = Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
      id: `entry-${i + 1}`,
      content_preview: `Released reflection ${i + 1}: This is a test journal entry that was burned...`,
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
      is_burned: true,
    }));

    return HttpResponse.json({ json: entries });
  }),

  // POST /api/self/burnJournal
  http.post(`${API_ORIGIN}/api/self/burnJournal`, async ({ request }) => {
    const input = await readProcedureInput(request);
    const body = isRecord(input.body) ? input.body : null;
    const content = body?.content;

    if (typeof content !== 'string' || content.trim().length === 0) {
      return HttpResponse.json({ json: { error: 'Content is required' } }, { status: 400 });
    }

    const newEntry = {
      id: `entry-new-${Date.now()}`,
      content_preview: content.slice(0, 100),
      created_at: new Date().toISOString(),
      is_burned: true,
    };

    return HttpResponse.json({ json: newEntry });
  }),

  // POST /api/self/logMood
  http.post(`${API_ORIGIN}/api/self/logMood`, async ({ request }) => {
    const input = await readProcedureInput(request);
    const body = isRecord(input.body) ? input.body : null;
    const mood = body?.mood;
    const mood_score = body?.mood_score;
    const note = body?.note;

    if (!mood || typeof mood_score !== 'number') {
      return HttpResponse.json({ json: { error: 'Invalid mood data' } }, { status: 400 });
    }

    const newEntry = {
      id: `mood-${Date.now()}`,
      user_id: typeof body?.user_id === 'string' ? body.user_id : 'test-user',
      mood,
      mood_score,
      note: note ?? null,
      created_at: new Date().toISOString(),
    };

    return HttpResponse.json({ json: newEntry });
  }),

  // GET /api/self/getMoodHistory
  http.post(`${API_ORIGIN}/api/self/getMoodHistory`, async ({ request }) => {
    const input = await readProcedureInput(request);
    const limit = queryLimit(input, 8);

    const entries = Array.from({ length: Math.min(limit, 2) }, (_, i) => ({
      id: `mood-${i + 1}`,
      user_id: 'test-user',
      mood: i === 0 ? 'calm' : 'energized',
      mood_score: i === 0 ? 7 : 8,
      note: i === 0 ? 'Feeling centered' : null,
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
    }));

    return HttpResponse.json({ json: entries });
  }),
];

// Error handlers for testing failure scenarios
export const selfJournalErrorHandlers = [
  http.post(`${API_ORIGIN}/api/self/getJournalHistory`, () => {
    return HttpResponse.json({ json: { error: 'Service unavailable' } }, { status: 503 });
  }),

  http.post(`${API_ORIGIN}/api/self/burnJournal`, () => {
    return HttpResponse.json({ json: { error: 'Failed to burn journal' } }, { status: 500 });
  }),

  http.post(`${API_ORIGIN}/api/self/logMood`, () => {
    return HttpResponse.json({ json: { error: 'Failed to log mood' } }, { status: 500 });
  }),

  http.post(`${API_ORIGIN}/api/self/getMoodHistory`, () => {
    return HttpResponse.json({ json: { error: 'Failed to load mood history' } }, { status: 503 });
  }),
];

// Empty state handlers
export const selfJournalEmptyHandlers = [
  http.post(`${API_ORIGIN}/api/self/getJournalHistory`, () => {
    return HttpResponse.json({ json: [] });
  }),

  http.post(`${API_ORIGIN}/api/self/getMoodHistory`, () => {
    return HttpResponse.json({ json: [] });
  }),
];
