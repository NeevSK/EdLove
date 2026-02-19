import { Platform } from 'react-native';
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

// AsyncStorage Fallback for persistence when MMKV (JSI) isn't available
class AsyncStorageFallback implements StorageInterface {
    set(key: string, value: string | boolean | number) {
        AsyncStorage.setItem(key, String(value));
    }
    getString(key: string) {
        // Note: This is a hack because StorageInterface expects synchronous return.
        // We handle the true async nature in the Zustand Storage wrapper.
        return undefined;
    }
    async getStringAsync(key: string) {
        const val = await AsyncStorage.getItem(key);
        return val || undefined;
    }
    getBoolean(key: string) { return undefined; }
    getNumber(key: string) { return undefined; }
    delete(key: string) { AsyncStorage.removeItem(key); }
    clearAll() { AsyncStorage.clear(); }
    contains(key: string) { return false; }
}

import Constants, { ExecutionEnvironment } from 'expo-constants';

let storageInstance: StorageInterface;

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (isExpoGo) {
    console.log('⚠️ Running in Expo Go: Defaulting to AsyncStorage Fallback');
    storageInstance = new AsyncStorageFallback();
} else {
    try {
        // Attempt to initialize MMKV
        const { MMKV } = require('react-native-mmkv');
        storageInstance = new MMKV({
            id: 'gurudevi-storage',
        });
        console.log('✅ MMKV initialized successfully (Speed Mode)');
    } catch (e) {
        console.warn('⚠️ MMKV failed (Native module missing), using AsyncStorage Fallback');
        storageInstance = new AsyncStorageFallback();
    }
}

export const storage = storageInstance;

export const StorageKeys = {
    USER_PREFERENCES: 'user_preferences',
    LAST_SYNC: 'last_sync',
    CACHED_COMMUNITY_POSTS: 'cached_community_posts',
    CACHED_GROUPS: 'cached_groups',
};
