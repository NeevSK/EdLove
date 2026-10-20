import {
  createAccountPracticeScope,
  deriveAccountPracticeKey,
} from '@repo/core/lib/practiceBoundary';
import { describe, expect, it } from 'vitest';
import { createInMemoryExploreStorage } from '@/lib/explore/storage';
import { createAccountSafeTrySelfPracticeAdapter } from './selfExplore';

describe('Fire Journal account Safe Try (G1 boundary / local storage adapter)', () => {
  it('keeps fictional practice entries account-scoped and discards them locally', async () => {
    const storage = createInMemoryExploreStorage();
    const first = createAccountSafeTrySelfPracticeAdapter({
      accountId: 'account-17',
      workspaceId: 'self',
      storage,
      now: () => new Date('2026-10-09T12:00:00.000Z'),
      createId: () => 'practice-entry-1',
    });
    const second = createAccountSafeTrySelfPracticeAdapter({
      accountId: 'account-18',
      workspaceId: 'self',
      storage,
      now: () => new Date('2026-10-09T12:00:00.000Z'),
    });

    const entry = await first.burnJournal('A thought for the fictional practice journal.');

    expect(entry.source).toBe('practice');
    await expect(Promise.resolve(first.loadJournal())).resolves.toContainEqual(entry);
    await expect(Promise.resolve(second.loadJournal())).resolves.not.toContainEqual(entry);

    await first.reset();

    await expect(Promise.resolve(first.loadJournal())).resolves.not.toContainEqual(entry);
    await expect(Promise.resolve(second.loadJournal())).resolves.toHaveLength(1);
  });

  it('copies the real legacy self namespace into the catalog-owned document', async () => {
    const storage = createInMemoryExploreStorage();
    const legacyKey = deriveAccountPracticeKey(
      createAccountPracticeScope({
        accountId: 'account-19',
        featureId: 'fire_journal',
        workspaceId: 'self',
      }),
      'self:fire_journal',
    );
    storage.setItem(
      legacyKey,
      JSON.stringify({
        entries: [
          {
            id: 'legacy-release',
            content_preview: 'Saved before the catalog migration.',
            created_at: '2026-10-09T12:00:00.000Z',
            is_burned: true,
            source: 'practice',
          },
        ],
      }),
    );

    const adapter = createAccountSafeTrySelfPracticeAdapter({
      accountId: 'account-19',
      workspaceId: 'self',
      storage,
    });

    expect((await Promise.resolve(adapter.loadJournal()))[0]?.id).toBe('legacy-release');
    expect(storage.getItem(legacyKey)).toContain('legacy-release');
  });

  it('keeps fictional practice mood logs account-scoped and resets cleanly', async () => {
    const storage = createInMemoryExploreStorage();
    const adapter = createAccountSafeTrySelfPracticeAdapter({
      accountId: 'account-mood-safe',
      workspaceId: 'self',
      storage,
      now: () => new Date('2026-10-19T08:00:00.000Z'),
      createId: () => 'mood-safe-1',
    });

    const initialMoods = adapter.loadMoodHistory();
    expect(initialMoods.length).toBeGreaterThan(0); // Sample initial moods

    const newMood = adapter.logMood({ mood: 'calm', note: 'Testing safe try mood' });
    expect(newMood.id).toBe('mood-safe-1');
    expect(newMood.mood).toBe('calm');
    expect(newMood.source).toBe('practice');

    const updatedMoods = adapter.loadMoodHistory();
    expect(updatedMoods[0]?.id).toBe('mood-safe-1');

    const density = await Promise.resolve(adapter.getActivityDensityForDates(['2026-10-19']));
    expect(density['2026-10-19']).toBeGreaterThan(0);

    await adapter.reset();
  });
});
