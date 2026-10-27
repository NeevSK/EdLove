import { storage } from '@repo/core/lib/storage';

const AUTH_STORAGE_PREFIX = 'supabase-auth-';

export const supabaseAuthStorage = {
  async getItem(key: string): Promise<string | null> {
    const storageKey = `${AUTH_STORAGE_PREFIX}${key}`;
    try {
      const syncVal = storage.getString(storageKey);
      if (syncVal !== undefined) return syncVal;
      const asyncVal = await storage.getStringAsync(storageKey);
      return asyncVal ?? null;
    } catch {
      throw new Error('Auth credential storage read failed');
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    const storageKey = `${AUTH_STORAGE_PREFIX}${key}`;
    try {
      storage.set(storageKey, value);
    } catch {
      throw new Error('Auth credential storage write failed');
    }
  },

  async removeItem(key: string): Promise<void> {
    const storageKey = `${AUTH_STORAGE_PREFIX}${key}`;
    try {
      storage.delete(storageKey);
    } catch {
      throw new Error('Auth credential storage removal failed');
    }
  },
};
