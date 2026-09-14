import { createBrowserSupabaseClient } from '../supabase/browser';

export type BurnedJournalEntry = Readonly<{
  id: string;
  content_preview: string;
  created_at: string;
  is_burned: boolean;
}>;

type ORPCResponse<T> = Readonly<{ json?: T }>;

function apiOrigin(): string | null {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  return value ? value.replace(/\/+$/, '') : null;
}

function isBurnedJournalEntry(value: unknown): value is BurnedJournalEntry {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.content_preview === 'string' &&
    typeof entry.created_at === 'string' &&
    typeof entry.is_burned === 'boolean'
  );
}

function decodeORPCResponse<T>(value: unknown, predicate: (value: unknown) => value is T): T {
  const envelope = value as ORPCResponse<unknown> | null;
  if (!envelope || !predicate(envelope.json)) {
    throw new Error('Sanctuary returned an invalid Fire Journal response.');
  }
  return envelope.json;
}

async function authorizedRequest<T>(
  procedure: 'burnJournal' | 'getJournalHistory',
  input: Record<string, unknown>,
  predicate: (value: unknown) => value is T,
): Promise<T> {
  const origin = apiOrigin();
  const supabase = createBrowserSupabaseClient();
  if (!origin || !supabase) throw new Error('Fire Journal is not configured in this browser.');

  const { data, error } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (error || !token) throw new Error('Your secure session has ended. Please sign in again.');

  let response: Response;
  try {
    response = await fetch(`${origin}/api/self/${procedure}`, {
      body: JSON.stringify({ json: input }),
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      method: 'POST',
    });
  } catch {
    throw new Error('We could not reach Sanctuary. Please check your connection and retry.');
  }

  if (response.status === 401 || response.status === 403)
    throw new Error('Your secure session can no longer access Fire Journal. Please sign in again.');
  if (!response.ok) throw new Error('Fire Journal is unavailable right now. Please retry.');

  return decodeORPCResponse(await response.json(), predicate);
}

export function loadBurnedJournalHistory(limit = 12): Promise<readonly BurnedJournalEntry[]> {
  return authorizedRequest(
    'getJournalHistory',
    { limit },
    (value): value is BurnedJournalEntry[] =>
      Array.isArray(value) && value.every(isBurnedJournalEntry),
  );
}

export function burnJournal(content: string): Promise<BurnedJournalEntry> {
  return authorizedRequest('burnJournal', { content }, isBurnedJournalEntry);
}
