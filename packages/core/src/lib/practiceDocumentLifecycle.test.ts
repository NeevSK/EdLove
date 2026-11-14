import { describe, expect, it } from 'vitest';
import {
  createPracticeDocumentLifecycle,
  PracticeLifecycleError,
} from './practiceDocumentLifecycle';

type Document = { entries: readonly string[] };

function createStorage() {
  const values = new Map<string, string>();
  return {
    values,
    storage: {
      isolation: 'local-only' as const,
      getItem: async (key: string) => values.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        values.set(key, value);
      },
      removeItem: async (key: string) => {
        values.delete(key);
      },
    },
  };
}

function createLifecycle(now: () => Date, storage = createStorage().storage) {
  return createPracticeDocumentLifecycle<Document>({
    storage,
    storageKey: 'safe-try:document',
    indexKey: 'safe-try:index',
    policy: { documentSchemaId: 'test-v1', inactivityDays: 30, maxDocuments: 20, maxBytes: 1024 },
    codec: { parse: JSON.parse, stringify: JSON.stringify },
    createInitialState: () => ({ entries: [] }),
    now,
  });
}

describe('practice document lifecycle (G0)', () => {
  it('envelopes a saved document with expiry metadata without exposing its key in events', async () => {
    const { storage, values } = createStorage();
    const events: string[] = [];
    const lifecycle = createPracticeDocumentLifecycle<Document>({
      storage,
      storageKey: 'safe-try:document',
      indexKey: 'safe-try:index',
      policy: { documentSchemaId: 'test-v1', inactivityDays: 30, maxDocuments: 20, maxBytes: 1024 },
      codec: { parse: JSON.parse, stringify: JSON.stringify },
      createInitialState: () => ({ entries: [] }),
      now: () => new Date('2026-10-11T00:00:00.000Z'),
      onEvent: (event) => events.push(JSON.stringify(event)),
    });

    await lifecycle.save({ entries: ['fictional'] });
    expect(values.get('safe-try:document')).toContain('2026-11-10T00:00:00.000Z');
    expect(events).toEqual([]);
  });

  it('rejects expired data, best-effort removes it, and starts from the fixture', async () => {
    const { storage, values } = createStorage();
    const started = createLifecycle(() => new Date('2026-10-01T00:00:00.000Z'), storage);
    await started.save({ entries: ['old'] });
    const expired = createLifecycle(() => new Date('2026-11-01T00:00:00.000Z'), storage);

    await expect(expired.load()).resolves.toEqual({ entries: [] });
    expect(values.has('safe-try:document')).toBe(false);
  });

  it('rejects a stale revision instead of silently overwriting another lifecycle instance', async () => {
    const { storage } = createStorage();
    const first = createLifecycle(() => new Date('2026-10-11T00:00:00.000Z'), storage);
    const second = createLifecycle(() => new Date('2026-10-11T00:00:00.000Z'), storage);
    await first.save({ entries: ['initial'] });
    await first.load();
    await second.load();
    await first.save({ entries: ['first'] });

    await expect(second.save({ entries: ['second'] })).rejects.toMatchObject<
      Partial<PracticeLifecycleError>
    >({
      code: 'conflict',
    });
  });

  it('enforces the configured document quota before writing', async () => {
    const { storage } = createStorage();
    const lifecycle = createPracticeDocumentLifecycle<Document>({
      storage,
      storageKey: 'safe-try:document',
      indexKey: 'safe-try:index',
      policy: { documentSchemaId: 'test-v1', inactivityDays: 30, maxDocuments: 20, maxBytes: 90 },
      codec: { parse: JSON.parse, stringify: JSON.stringify },
      createInitialState: () => ({ entries: [] }),
    });

    await expect(
      lifecycle.save({ entries: ['this is intentionally too large for the test quota'] }),
    ).rejects.toMatchObject<Partial<PracticeLifecycleError>>({
      code: 'quota-exceeded',
    });
  });
});
