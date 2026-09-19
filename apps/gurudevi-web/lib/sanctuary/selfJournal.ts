import { requestAccountSelfProcedure } from './selfApiClient';

export type BurnedJournalEntry = Readonly<{
  id: string;
  content_preview: string;
  created_at: string;
  is_burned: boolean;
}>;

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

export function loadBurnedJournalHistory(limit = 12): Promise<readonly BurnedJournalEntry[]> {
  return requestAccountSelfProcedure(
    'getJournalHistory',
    { query: { limit } },
    (value): value is BurnedJournalEntry[] =>
      Array.isArray(value) && value.every(isBurnedJournalEntry),
    'Sanctuary returned an invalid Fire Journal response.',
  );
}

export function burnJournal(content: string): Promise<BurnedJournalEntry> {
  return requestAccountSelfProcedure(
    'burnJournal',
    { body: { content } },
    isBurnedJournalEntry,
    'Sanctuary returned an invalid Fire Journal response.',
  );
}
