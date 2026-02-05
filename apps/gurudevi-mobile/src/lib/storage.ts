import { Platform } from 'react-native';

// Standard interface to ensure we can swap implementations
interface StorageInterface {
    set: (key: string, value: string | boolean | number) => void;
    getString: (key: string) => string | undefined;
    getBoolean: (key: string) => boolean | undefined;
    getNumber: (key: string) => number | undefined;
    delete: (key: string) => void;
    clearAll: () => void;
    contains: (key: string) => boolean;
}

// In-Memory Fallback for Expo Go / Web without native modules
// This allows the app to run without crashing, though data won't persist across reloads
class MemoryStorage implements StorageInterface {
    private cache = new Map<string, any>();

    set(key: string, value: string | boolean | number) {
        this.cache.set(key, value);
    }
    getString(key: string) {
        const val = this.cache.get(key);
        return typeof val === 'string' ? val : undefined;
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
    }
    clearAll() {
        this.cache.clear();
    }
    contains(key: string) {
        return this.cache.has(key);
    }
}

let storageInstance: StorageInterface;

try {
    // Attempt to initialize MMKV
    // We use require() to handle the case where the module might throw on import in Expo Go
    const { MMKV } = require('react-native-mmkv');

    // Check if JSI bindings are actually available (sometimes require works but instantiation fails)
    storageInstance = new MMKV({
        id: 'gurudevi-storage',
        encryptionKey: 'gurudevi-secret-key'
    });

    // Simple smoke test to see if it actually works
    storageInstance.contains('test-key');

    console.log('✅ MMKV initialized successfully (Persisted Storage)');
} catch (e) {
    console.warn('⚠️ MMKV not available (running in Expo Go?), falling back to In-Memory Storage because:', e);
    storageInstance = new MemoryStorage();
}

export const storage = storageInstance;

export const StorageKeys = {
    USER_PREFERENCES: 'user_preferences',
    LAST_SYNC: 'last_sync',
    CACHED_COMMUNITY_POSTS: 'cached_community_posts',
    CACHED_GROUPS: 'cached_groups',
};
