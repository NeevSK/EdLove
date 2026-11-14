import { afterEach, describe, expect, it, vi } from 'vitest';
import { BrowserStorageAdapter } from './BrowserStorageAdapter';

function createLocalStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('BrowserStorageAdapter', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('persists typed values through browser localStorage', () => {
    const localStorage = createLocalStorage();
    vi.stubGlobal('window', { localStorage });
    const storage = new BrowserStorageAdapter();

    storage.set('string', 'value');
    storage.set('boolean', true);
    storage.set('number', 42);

    expect(localStorage.getItem('string')).toBe('value');
    expect(storage.getString('string')).toBe('value');
    expect(storage.getBoolean('boolean')).toBe(true);
    expect(storage.getNumber('number')).toBe(42);
  });

  it('keeps local writes usable when browser storage is unavailable', () => {
    const storage = new BrowserStorageAdapter();

    storage.set('draft', '{"local":true}');

    expect(storage.getString('draft')).toBe('{"local":true}');
  });

  it('falls back to memory when a browser blocks individual localStorage reads', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => {
          throw new Error('blocked');
        },
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
    });
    const storage = new BrowserStorageAdapter();

    expect(storage.getString('session')).toBeUndefined();
    storage.set('session', 'in-memory-session');
    expect(storage.getString('session')).toBe('in-memory-session');
  });

  it('reports durable write failure without accepting an in-memory-only value', async () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => null,
        setItem: () => {
          throw new Error('quota exceeded');
        },
        removeItem: () => undefined,
      },
    });
    const storage = new BrowserStorageAdapter();

    await expect(storage.setAsync('saved', 'value')).rejects.toThrow('quota exceeded');
    expect(storage.getString('saved')).toBeUndefined();
  });
});
