import { MemoryStorageAdapter } from '@repo/core/adapters/MemoryStorageAdapter';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { storage } from './StorageManager';

describe('StorageManager acknowledged operations', () => {
  afterEach(() => storage.registerAdapter(new MemoryStorageAdapter()));

  it('returns the selected adapter write promise without converting rejection to success', async () => {
    let finishWrite!: () => void;
    const setAsync = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishWrite = resolve;
        }),
    );
    class DeferredAdapter extends MemoryStorageAdapter {
      override setAsync(key: string, value: string | boolean | number) {
        return setAsync(key, value);
      }
    }
    storage.registerAdapter(new DeferredAdapter());

    let settled = false;
    const write = storage.setAsync('key', 'value').then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);
    finishWrite();
    await write;
    expect(setAsync).toHaveBeenCalledWith('key', 'value');
  });

  it('propagates adapter failures to the caller', async () => {
    const error = new Error('persistence unavailable');
    class FailingAdapter extends MemoryStorageAdapter {
      override async setAsync() {
        throw error;
      }
    }
    storage.registerAdapter(new FailingAdapter());

    await expect(storage.setAsync('key', 'value')).rejects.toBe(error);
  });

  it('lets the Zustand adapter return the actual persistence promise', async () => {
    const error = new Error('persistent write failed');
    const report = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const failure = Promise.reject<void>(error);
    class FailingAdapter extends MemoryStorageAdapter {
      override setAsync() {
        return failure;
      }
    }
    storage.registerAdapter(new FailingAdapter());

    const result = SafeZustandStorage.setItem('key', 'value');
    expect(result).toBe(failure);
    await expect(result).rejects.toBe(error);
    expect(report).toHaveBeenCalledWith('Storage: Zustand persistence write failed', error);
    report.mockRestore();
  });

  it('observes only the requested key and releases its listener', async () => {
    storage.registerAdapter(new MemoryStorageAdapter());
    const changed = vi.fn();
    const release = storage.subscribe('appearance', changed);
    await storage.setAsync('unrelated', 'value');
    expect(changed).not.toHaveBeenCalled();
    await storage.setAsync('appearance', 'dark');
    expect(changed).toHaveBeenCalledOnce();
    release();
    await storage.deleteAsync('appearance');
    expect(changed).toHaveBeenCalledOnce();
  });

  it('publishes an acknowledged preference only after its backend completes', async () => {
    const pending = Promise.withResolvers<void>();
    class DeferredAdapter extends MemoryStorageAdapter {
      override async setAsync(key: string, value: string | boolean | number) {
        await pending.promise;
        this.set(key, value);
      }
    }
    storage.registerAdapter(new DeferredAdapter());
    const changed = vi.fn();
    const release = storage.subscribe('appearance', changed);
    try {
      const write = storage.setAsync('appearance', 'auto');
      expect(storage.getString('appearance')).toBeUndefined();
      expect(changed).not.toHaveBeenCalled();
      pending.resolve();
      await write;
      expect(storage.getString('appearance')).toBe('auto');
      expect(changed).toHaveBeenCalledOnce();
    } finally {
      release();
    }
  });
});
