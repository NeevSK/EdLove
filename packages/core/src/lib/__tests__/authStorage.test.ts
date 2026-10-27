import { beforeEach, describe, expect, it, vi } from 'vitest';

const persistence = vi.hoisted(() => ({
  getString: vi.fn(),
  getStringAsync: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}));
vi.mock('@repo/core/lib/storage', () => ({ storage: persistence }));

import { supabaseAuthStorage } from '../authStorage';

beforeEach(() => vi.resetAllMocks());

describe('G1 auth credential persistence / substituted storage adapter', () => {
  it('retains synchronous reads and asynchronous fallback without treating errors as absence', async () => {
    persistence.getString.mockReturnValueOnce('sync-fixture');
    expect(await supabaseAuthStorage.getItem('key')).toBe('sync-fixture');
    expect(persistence.getStringAsync).not.toHaveBeenCalled();
    persistence.getStringAsync.mockResolvedValueOnce('async-fixture');
    expect(await supabaseAuthStorage.getItem('key')).toBe('async-fixture');
    persistence.getStringAsync.mockResolvedValueOnce(undefined);
    expect(await supabaseAuthStorage.getItem('key')).toBeNull();
  });

  it.each(['getString', 'getStringAsync', 'set', 'delete'] as const)(
    'surfaces sanitized %s failures',
    async (operation) => {
      const failure = new Error('private credential fixture detail');
      if (operation === 'getStringAsync') persistence[operation].mockRejectedValue(failure);
      else
        persistence[operation].mockImplementation(() => {
          throw failure;
        });
      const pending =
        operation === 'set'
          ? supabaseAuthStorage.setItem('key', 'synthetic-token')
          : operation === 'delete'
            ? supabaseAuthStorage.removeItem('key')
            : supabaseAuthStorage.getItem('key');
      const expected = operation === 'set' ? 'write' : operation === 'delete' ? 'removal' : 'read';
      await expect(pending).rejects.toThrow(`Auth credential storage ${expected} failed`);
    },
  );
});
