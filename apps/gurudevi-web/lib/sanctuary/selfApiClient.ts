import {
  createPersistenceIdentity,
  resolvePersistenceWriteDecision,
} from '@repo/core/lib/persistenceBoundary';
import { createBrowserSupabaseClient } from '../supabase/browser';

type ORPCResponse<T> = Readonly<{ json?: T }>;

type AccountSelfProcedureInputs = Readonly<{
  getJournalHistory: Readonly<{ query: Readonly<{ limit: number }> }>;
  burnJournal: Readonly<{ body: Readonly<{ content: string }> }>;
  getMoodHistory: Readonly<{ query: Readonly<{ limit: number }> }>;
  logMood: (authenticatedUserId: string) => Readonly<{
    body: Readonly<{
      user_id: string;
      mood: string;
      mood_score: number;
      note: string | null;
    }>;
  }>;
}>;

function apiOrigin(): string | null {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  return value ? value.replace(/\/+$/, '') : null;
}

function decodeORPCResponse<T>(
  value: unknown,
  predicate: (value: unknown) => value is T,
  invalidResponseMessage: string,
): T {
  const envelope = value as ORPCResponse<unknown> | null;
  if (!envelope || !predicate(envelope.json)) throw new Error(invalidResponseMessage);
  return envelope.json;
}

/**
 * The authenticated browser adapter is deliberately account-only. Explore,
 * sandbox, and demo use their own local adapter; they must never fall through
 * to this bearer-token production path.
 */
export async function requestAccountSelfProcedure<
  T,
  Procedure extends keyof AccountSelfProcedureInputs,
>(
  procedure: Procedure,
  input: AccountSelfProcedureInputs[Procedure],
  predicate: (value: unknown) => value is T,
  invalidResponseMessage: string,
): Promise<T> {
  const origin = apiOrigin();
  const supabase = createBrowserSupabaseClient();
  if (!origin || !supabase)
    throw new Error('This Self practice is not configured in this browser.');

  const { data, error } = await supabase.auth.getSession();
  const session = data.session;
  if (error || !session?.access_token || !session.user.id || session.user.is_anonymous) {
    throw new Error('Your secure session has ended. Please sign in again.');
  }

  const identity = createPersistenceIdentity({
    experience: 'standard',
    principal: { kind: 'account', id: session.user.id },
  });
  if (!resolvePersistenceWriteDecision(identity, 'production').allowed) {
    throw new Error('This Self practice is available only in its local experience.');
  }

  const requestInput = typeof input === 'function' ? input(session.user.id) : input;
  let response: Response;
  try {
    response = await fetch(`${origin}/api/self/${procedure}`, {
      body: JSON.stringify({ json: requestInput }),
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      method: 'POST',
    });
  } catch {
    throw new Error('We could not reach Sanctuary. Please check your connection and retry.');
  }

  if (response.status === 401) {
    throw new Error('Your secure session has ended. Please sign in again.');
  }
  if (response.status === 403)
    throw new Error('Your selected scope cannot access this Self practice.');
  if (!response.ok) throw new Error('This Self practice is unavailable right now. Please retry.');

  return decodeORPCResponse(await response.json(), predicate, invalidResponseMessage);
}
