import type { PracticeDefinition } from '@repo/core/lib/practiceSessionResolver';
import { FEATURE_CATALOG } from '@repo/self/features/featureCatalog';

type FireJournalPracticeDocument = {
  entries: Array<{
    id: string;
    content_preview: string;
    created_at: string;
    is_burned: true;
    source: 'sample' | 'practice';
  }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function parseFireJournalPracticeDocument(value: string): FireJournalPracticeDocument {
  const parsed: unknown = JSON.parse(value);
  if (!isRecord(parsed) || !Array.isArray(parsed.entries)) {
    throw new Error('Invalid Fire Journal Safe Try document.');
  }

  return {
    entries: parsed.entries.map((entry): FireJournalPracticeDocument['entries'][number] => {
      if (!isRecord(entry)) throw new Error('Invalid Fire Journal Safe Try entry.');
      if (
        typeof entry.id !== 'string' ||
        typeof entry.content_preview !== 'string' ||
        typeof entry.created_at !== 'string' ||
        entry.is_burned !== true ||
        (entry.source !== 'sample' && entry.source !== 'practice')
      ) {
        throw new Error('Invalid Fire Journal Safe Try entry.');
      }
      return {
        id: entry.id,
        content_preview: entry.content_preview,
        created_at: entry.created_at,
        is_burned: true,
        source: entry.source,
      };
    }),
  };
}

const fireJournalFeature = FEATURE_CATALOG.fire_journal;
const fireJournalSchemaId = fireJournalFeature?.practiceDocument?.schemaId;
if (typeof fireJournalSchemaId !== 'string') {
  throw new Error('Fire Journal requires a Safe Try document schema.');
}

export const SELF_PRACTICE_DEFINITIONS: Readonly<Record<string, PracticeDefinition>> = {
  fire_journal: {
    featureId: 'fire_journal',
    documentSchemaId: fireJournalSchemaId,
    codec: {
      parse: parseFireJournalPracticeDocument,
      stringify: JSON.stringify,
    },
    createInitialState: () => ({
      entries: [
        {
          id: 'fictional-release',
          content_preview:
            'A fictional release is shown here. Your live journal remains untouched.',
          created_at: '2026-01-01T00:00:00.000Z',
          is_burned: true,
          source: 'sample',
        },
      ],
    }),
  },
};
