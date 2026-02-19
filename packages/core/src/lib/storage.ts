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
 * Robust AsyncStorage-based storage with in-memory cache for synchronous access.
 * This ensures getString/getBoolean work immediately while persisting in background.
 */
class RobustAsyncStorage implements StorageInterface {
    private cache = new Map<string, any>();
    private initialized = false;
    private initPromise: Promise<void> | null = null;

    constructor() {
        this.initPromise = this.init();
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
            console.log('📦 Storage: Hydrated cache from AsyncStorage');
        } catch (e) {
            console.error('📦 Storage Error during hydration:', e);
        }
    }

    set(key: string, value: string | boolean | number) {
        this.cache.set(key, value);
        AsyncStorage.setItem(key, String(value)).catch(e =>
            console.error(`📦 Storage: Failed to persist ${key}`, e)
        );
    }

    getString(key: string) {
        const val = this.cache.get(key);
        return typeof val === 'string' ? val : undefined;
    }

    async getStringAsync(key: string) {
        if (!this.initialized && this.initPromise) await this.initPromise;
        const val = await AsyncStorage.getItem(key);
        return val || undefined;
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

import Constants, { ExecutionEnvironment } from 'expo-constants';

let storageInstance: StorageInterface;

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (isExpoGo) {
    console.log('⚠️ Running in Expo Go: Defaulting to Robust AsyncStorage');
    storageInstance = new RobustAsyncStorage();
} else {
    try {
        // Attempt to initialize MMKV
        const { MMKV } = require('react-native-mmkv');
        storageInstance = new MMKV({
            id: 'gurudevi-storage',
        });
        console.log('✅ MMKV initialized successfully (Speed Mode)');
    } catch (e) {
        console.warn('⚠️ MMKV failed (Native module missing), using Robust AsyncStorage');
        storageInstance = new RobustAsyncStorage();
    }
}

export const storage = storageInstance;

export const StorageKeys = {
    USER_PREFERENCES: 'user_preferences',
    LAST_SYNC: 'last_sync',
    CACHED_COMMUNITY_POSTS: 'cached_community_posts',
    CACHED_GROUPS: 'cached_groups',
};
