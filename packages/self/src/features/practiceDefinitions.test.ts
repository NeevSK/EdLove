import { resolvePracticeSession } from '@repo/core/lib/practiceSessionResolver';
import { describe, expect, it } from 'vitest';
import { FEATURE_CATALOG } from './featureCatalog';
import { SELF_PRACTICE_DEFINITIONS } from './practiceDefinitions';

describe('Self practice definitions (G0)', () => {
  it('keeps Fire Journal schema metadata and the domain definition aligned', () => {
    const definition = SELF_PRACTICE_DEFINITIONS.fire_journal;
    const fireJournalFeature = FEATURE_CATALOG.fire_journal;

    if (!fireJournalFeature) {
      throw new Error('Fire Journal is missing from the feature catalog.');
    }

    expect(definition?.documentSchemaId).toBe(fireJournalFeature.practiceDocument?.schemaId);
    expect(definition?.featureId).toBe('fire_journal');
  });

  it('rejects malformed Fire Journal practice documents', () => {
    const definition = SELF_PRACTICE_DEFINITIONS.fire_journal;
    expect(() => definition?.codec.parse('{"entries":[{}]}')).toThrow(
      'Invalid Fire Journal Safe Try entry.',
    );
  });

  it('composes the actual domain definition with account-local persistence', async () => {
    const values = new Map<string, string>();
    const storage = {
      isolation: 'local-only' as const,
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
      removeItem: (key: string) => {
        values.delete(key);
      },
    };
    const input = {
      accountId: 'account-41',
      featureId: 'fire_journal',
      platform: 'browser' as const,
      hasSelectedScope: true,
      storage,
      definitions: SELF_PRACTICE_DEFINITIONS,
    };
    const first = resolvePracticeSession(input);
    if (!first.available) throw new Error(`Expected practice: ${first.reason}`);
    const draft = {
      entries: [
        {
          id: 'local-release',
          content_preview: 'My local practice',
          created_at: '2026-10-15T00:00:00.000Z',
          is_burned: true,
          source: 'practice',
        },
      ],
    };
    await first.session.runtime.save(draft);

    const reopened = resolvePracticeSession(input);
    if (!reopened.available) throw new Error(`Expected practice: ${reopened.reason}`);
    await expect(reopened.session.runtime.load()).resolves.toEqual(draft);

    const otherAccount = resolvePracticeSession({ ...input, accountId: 'account-42' });
    if (!otherAccount.available) throw new Error(`Expected practice: ${otherAccount.reason}`);
    expect(otherAccount.session.storageKey).not.toBe(first.session.storageKey);
    await expect(otherAccount.session.runtime.load()).resolves.toEqual({
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
    });
    expect(resolvePracticeSession({ ...input, platform: 'native' })).toEqual({
      available: false,
      reason: 'platform-unsupported',
    });
  });

  it('reports local persistence failure and permits retry', async () => {
    const values = new Map<string, string>();
    let unavailable = true;
    const result = resolvePracticeSession({
      accountId: 'account-41',
      featureId: 'fire_journal',
      platform: 'browser',
      hasSelectedScope: true,
      definitions: SELF_PRACTICE_DEFINITIONS,
      storage: {
        isolation: 'local-only',
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => {
          if (unavailable) throw new Error('Local storage unavailable');
          values.set(key, value);
        },
        removeItem: (key) => {
          values.delete(key);
        },
      },
    });
    if (!result.available) throw new Error(`Expected practice: ${result.reason}`);
    const draft = { entries: [] };
    await expect(result.session.runtime.save(draft)).rejects.toThrow('Local storage unavailable');
    expect(values.size).toBe(0);
    unavailable = false;
    await result.session.runtime.save(draft);
    await expect(result.session.runtime.load()).resolves.toEqual(draft);
  });
});
