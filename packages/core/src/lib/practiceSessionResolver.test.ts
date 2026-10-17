import { describe, expect, it } from 'vitest';
import type { PracticeDefinition } from './practiceSessionResolver';
import { resolvePracticeSession } from './practiceSessionResolver';

function createStorage() {
  const values = new Map<string, string>();
  return {
    storage: {
      isolation: 'local-only' as const,
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
      removeItem: (key: string) => {
        values.delete(key);
      },
    },
  };
}

const fireJournalDefinition: PracticeDefinition = {
  featureId: 'fire_journal',
  documentSchemaId: 'fire-journal-practice-v1',
  codec: { parse: JSON.parse, stringify: JSON.stringify },
  createInitialState: () => ({ entries: [{ id: 'fictional-release' }] }),
};

describe('resolvePracticeSession (G0)', () => {
  it('resolves the policy and matching definition by feature identity', async () => {
    const { storage } = createStorage();
    const result = resolvePracticeSession({
      accountId: 'account-41',
      featureId: 'fire_journal',
      platform: 'browser',
      hasSelectedScope: true,
      storage,
      definitions: { fire_journal: fireJournalDefinition },
    });

    expect(result.available).toBe(true);
    if (!result.available) return;
    expect(result.policy.persistence.documentSchemaId).toBe('fire-journal-practice-v1');
    await expect(result.session.runtime.load()).resolves.toEqual({
      entries: [{ id: 'fictional-release' }],
    });
  });

  it('fails closed for missing or mismatched domain definitions', () => {
    const { storage } = createStorage();
    const missing = resolvePracticeSession({
      accountId: 'account-41',
      featureId: 'fire_journal',
      platform: 'browser',
      hasSelectedScope: true,
      storage,
      definitions: {},
    });
    const mismatch = resolvePracticeSession({
      accountId: 'account-41',
      featureId: 'fire_journal',
      platform: 'browser',
      hasSelectedScope: true,
      storage,
      definitions: {
        fire_journal: { ...fireJournalDefinition, documentSchemaId: 'incorrect-v1' },
      },
    });

    expect(missing).toEqual({ available: false, reason: 'definition-missing' });
    expect(mismatch).toEqual({ available: false, reason: 'schema-mismatch' });
  });

  it('keeps undeclared native practice unavailable before definition lookup', () => {
    const { storage } = createStorage();
    expect(
      resolvePracticeSession({
        accountId: 'account-41',
        featureId: 'fire_journal',
        platform: 'native',
        capacity: 'teacher',
        hasSelectedScope: true,
        storage,
        definitions: { fire_journal: fireJournalDefinition },
      }),
    ).toEqual({ available: false, reason: 'platform-unsupported' });
  });
});
