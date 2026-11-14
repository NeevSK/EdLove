import { describe, expect, it } from 'vitest';
import { declaredPracticeCapability } from '../logic/registry/capabilityManifest';
import { createCatalogPracticeRuntime, type PracticeDocumentCodec } from './catalogPracticeRuntime';
import { createAccountPracticeScope, deriveAccountPracticeKey } from './practiceBoundary';

type EntryState = { entries: { id: string }[] };
type AttendanceState = { marks: string[] };

const entryCodec: PracticeDocumentCodec<EntryState> = {
  parse(value) {
    const parsed: unknown = JSON.parse(value);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !Array.isArray((parsed as { entries?: unknown }).entries)
    ) {
      throw new Error('Invalid entry practice document.');
    }
    return { entries: (parsed as { entries: { id: string }[] }).entries };
  },
  stringify: JSON.stringify,
};

const attendanceCodec: PracticeDocumentCodec<AttendanceState> = {
  parse(value) {
    const parsed: unknown = JSON.parse(value);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !Array.isArray((parsed as { marks?: unknown }).marks)
    ) {
      throw new Error('Invalid attendance practice document.');
    }
    return { marks: (parsed as { marks: string[] }).marks };
  },
  stringify: JSON.stringify,
};

function createStorage() {
  const values = new Map<string, string>();
  return {
    values,
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

describe('createCatalogPracticeRuntime (G0)', () => {
  it('derives a local workspace from catalog policy instead of feature storage code', async () => {
    const policy = declaredPracticeCapability('fire_journal', 'browser');
    if (!policy)
      throw new Error('Fire Journal browser practice must be declared for this contract.');
    const { storage } = createStorage();
    const practice = createCatalogPracticeRuntime({
      accountId: 'account-41',
      featureId: 'fire_journal',
      policy,
      storage,
      codec: entryCodec,
      createInitialState: () => ({ entries: [{ id: 'fictional-release' }] }),
    });

    expect(practice.runtime.mode).toBe('practice');
    expect(practice.storageKey).toContain('sandbox:account:account-41');
    expect(practice.storageKey).toContain('practice%3Afire_journal%3Afire-journal%3Astate');
    await expect(practice.runtime.load()).resolves.toEqual({
      entries: [{ id: 'fictional-release' }],
    });
  });

  it('centralizes save, reset, discard, and post-discard failure', async () => {
    const policy = declaredPracticeCapability('attendance', 'browser');
    if (!policy) throw new Error('Attendance browser practice must be declared for this contract.');
    const { storage, values } = createStorage();
    const practice = createCatalogPracticeRuntime({
      accountId: 'account-41',
      featureId: 'attendance',
      policy,
      storage,
      codec: attendanceCodec,
      createInitialState: () => ({ marks: [] }),
    });

    await practice.runtime.save({ marks: ['present'] });
    await expect(practice.runtime.load()).resolves.toEqual({ marks: ['present'] });
    await practice.runtime.reset();
    await expect(practice.runtime.load()).resolves.toEqual({ marks: [] });
    await practice.runtime.discard();
    expect(values.has(practice.storageKey)).toBe(false);
    expect(() => practice.runtime.load()).toThrow('workspace has ended');
  });

  it('copies a declared legacy document into the catalog-owned document without deleting recovery data', async () => {
    const policy = declaredPracticeCapability('fire_journal', 'browser');
    if (!policy)
      throw new Error('Fire Journal browser practice must be declared for this contract.');
    const { storage, values } = createStorage();
    const legacyKey = deriveAccountPracticeKey(
      createAccountPracticeScope({
        accountId: 'account-41',
        featureId: 'fire_journal',
        workspaceId: 'self',
      }),
      'self:fire_journal',
    );
    values.set(legacyKey, JSON.stringify({ entries: [{ id: 'legacy-release' }] }));

    const practice = createCatalogPracticeRuntime({
      accountId: 'account-41',
      featureId: 'fire_journal',
      policy,
      storage,
      codec: entryCodec,
      createInitialState: () => ({ entries: [] }),
    });

    await expect(practice.runtime.load()).resolves.toEqual({ entries: [{ id: 'legacy-release' }] });
    expect(values.get(practice.storageKey)).toContain('legacy-release');
    expect(values.get(legacyKey)).toContain('legacy-release');

    await practice.runtime.discard();
    const reopened = createCatalogPracticeRuntime({
      accountId: 'account-41',
      featureId: 'fire_journal',
      policy,
      storage,
      codec: entryCodec,
      createInitialState: () => ({ entries: [] }),
    });
    await expect(reopened.runtime.load()).resolves.toEqual({ entries: [] });
    expect(values.get(legacyKey)).toContain('legacy-release');
  });
});
