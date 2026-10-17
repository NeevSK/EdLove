import { describe, expect, it } from 'vitest';
import { createFeatureRuntime } from './featureRuntime';
import { createKeyValueStorageAdapter } from './keyValueStorageAdapter';
import { createAccountPracticeScope } from './practiceBoundary';
import { createPracticeController } from './practiceContract';

describe('feature runtime contracts (G0)', () => {
  it('selects the Safe Try controller instead of the live adapter', () => {
    const calls: string[] = [];
    const practice = createPracticeController({
      scope: createAccountPracticeScope({
        accountId: 'account-17',
        featureId: 'fire_journal',
        workspaceId: 'self',
      }),
      adapter: {
        load: () => ({ value: 'practice' }),
        save: () => {
          calls.push('practice-save');
        },
        reset: () => {
          calls.push('practice-reset');
        },
        discard: () => {
          calls.push('practice-discard');
        },
      },
    });
    const runtime = createFeatureRuntime({
      mode: 'practice',
      practice,
      live: {
        load: () => ({ value: 'live' }),
        save: () => {
          calls.push('live-save');
        },
        reset: () => {
          calls.push('live-reset');
        },
        discard: () => {
          calls.push('live-discard');
        },
      },
    });

    expect(runtime.mode).toBe('practice');
    expect(runtime.load()).toEqual({ value: 'practice' });
    runtime.save({ value: 'changed' });
    runtime.reset();
    runtime.discard();
    expect(calls).toEqual(['practice-save', 'practice-reset', 'practice-discard']);
  });

  it('rejects entry into a mode without a declared adapter', () => {
    expect(() => createFeatureRuntime({ mode: 'practice' })).toThrow('Safe Try is not available');
    expect(() => createFeatureRuntime({ mode: 'live' })).toThrow(
      'Live feature access is not available',
    );
  });

  it('bridges the runtime scalar store to the feature key/value port', async () => {
    const values = new Map<string, string>();
    const storage = createKeyValueStorageAdapter({
      set: (key: string, value: string | boolean | number) => {
        values.set(key, String(value));
      },
      getString: (key: string) => values.get(key),
      getStringAsync: async (key: string) => values.get(key),
      getBoolean: () => undefined,
      getNumber: () => undefined,
      delete: (key: string) => {
        values.delete(key);
      },
      clearAll: () => {
        values.clear();
      },
      contains: (key: string) => values.has(key),
    });

    await storage.setItem('practice:key', 'value');
    expect(await storage.getItem('practice:key')).toBe('value');
    await storage.removeItem('practice:key');
    expect(await storage.getItem('practice:key')).toBeNull();
  });
});
