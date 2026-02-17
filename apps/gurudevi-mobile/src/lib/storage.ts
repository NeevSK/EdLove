import AsyncStorage from '@react-native-async-storage/async-storage';

// Standard interface to ensure we can swap implementations
interface StorageInterface {
    set: (key: string, value: string | boolean | number) => void;
    getString: (key: string) => string | undefined;
    getStringAsync: (key: string) => Promise<string | undefined>;
    getBoolean: (key: string) => boolean | undefined;
    getNumber: (key: string) => number | undefined;
    delete: (key: string) => void;
    clearAll: () => void;
    contains: (key: string) => boolean;
}

/**
 * AsyncStorage-based fallback for Expo Go / Web
 * Provides persistence unlike simple MemoryStorage
 */
class PersistentFallbackStorage implements StorageInterface {
    // In-memory cache for synchronous access (getString, getBoolean)
    // Synchronous access is required by many parts of the app
    private cache = new Map<string, any>();
    private initialized = false;

    constructor() {
        this.init();
    }

    private async init() {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const pairs = await AsyncStorage.multiGet(keys);
            pairs.forEach(([key, value]) => {
                if (value !== null) {
                    // Try to parse number/boolean
                    if (value === 'true') this.cache.set(key, true);
                    else if (value === 'false') this.cache.set(key, false);
                    else if (!isNaN(Number(value)) && value.trim() !== '') this.cache.set(key, Number(value));
                    else this.cache.set(key, value);
                }
            });
            this.initialized = true;
            console.log('📦 Storage Fallback: Hydrated cache from AsyncStorage');
        } catch (e) {
            console.error('📦 Storage Fallback Error during hydration:', e);
        }
    }

    set(key: string, value: string | boolean | number) {
        this.cache.set(key, value);
        AsyncStorage.setItem(key, String(value)).catch(e =>
            console.error(`📦 Storage Fallback: Failed to persist ${key}`, e)
        );
    }

    getString(key: string) {
        const val = this.cache.get(key);
        return typeof val === 'string' ? val : undefined;
    }

    async getStringAsync(key: string) {
        if (!this.initialized) await this.init();
        return this.getString(key);
    }

    getBoolean(key: string) {
        const val = this.cache.get(key);
        return typeof val === 'boolean' ? val : undefined;
    }

    getNumber(key: string) {
        const val = this.cache.get(key);
        return typeof val === 'number' ? val : undefined;
    }

    delete(key: string) {
        this.cache.delete(key);
        AsyncStorage.removeItem(key);
    }

    clearAll() {
        this.cache.clear();
        AsyncStorage.clear();
    }

    contains(key: string) {
        return this.cache.has(key);
    }
}

let storageInstance: StorageInterface;

try {
    // Attempt to initialize MMKV
    const { MMKV } = require('react-native-mmkv');

    const mmkv = new MMKV({
        id: 'gurudevi-storage',
        encryptionKey: 'gurudevi-secret-key'
    });

    // Wrap MMKV to match our interface (adding async fallback method)
    storageInstance = {
        set: (k, v) => mmkv.set(k, v),
        getString: (k) => mmkv.getString(k),
        getStringAsync: async (k) => mmkv.getString(k),
        getBoolean: (k) => mmkv.getBoolean(k),
        getNumber: (k) => mmkv.getNumber(k),
        delete: (k) => mmkv.delete(k),
        clearAll: () => mmkv.clearAll(),
        contains: (k) => mmkv.contains(k)
    };

    console.log('✅ MMKV initialized successfully (Persisted Storage)');
} catch (e) {
    console.warn('⚠️ MMKV not available (running in Expo Go?), falling back to AsyncStorage persistence');
    storageInstance = new PersistentFallbackStorage();
}

export const storage = storageInstance;

export const StorageKeys = {
    USER_PREFERENCES: 'user_preferences',
    LAST_SYNC: 'last_sync',
    CACHED_COMMUNITY_POSTS: 'cached_community_posts',
    CACHED_GROUPS: 'cached_groups',
};
