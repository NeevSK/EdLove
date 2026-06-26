const AUTH_STORAGE_PREFIX = 'supabase-auth-';

const isWeb = typeof document !== 'undefined';

async function getSecureStore() {
  const { default: SecureStore } = await import('expo-secure-store');
  return SecureStore;
}

export const supabaseAuthStorage = {
  async getItem(key: string): Promise<string | null> {
    const storageKey = `${AUTH_STORAGE_PREFIX}${key}`;
    if (isWeb) {
      return globalThis.localStorage?.getItem(storageKey) ?? null;
    }

    try {
      const SecureStore = await getSecureStore();
      return await SecureStore.getItemAsync(storageKey);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    const storageKey = `${AUTH_STORAGE_PREFIX}${key}`;
    if (isWeb) {
      globalThis.localStorage?.setItem(storageKey, value);
      return;
    }

    try {
      const SecureStore = await getSecureStore();
      await SecureStore.setItemAsync(storageKey, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch {
      // storage not available
    }
  },

  async removeItem(key: string): Promise<void> {
    const storageKey = `${AUTH_STORAGE_PREFIX}${key}`;
    if (isWeb) {
      globalThis.localStorage?.removeItem(storageKey);
      return;
    }

    try {
      const SecureStore = await getSecureStore();
      await SecureStore.deleteItemAsync(storageKey);
    } catch {
      // storage not available
    }
  },
};
