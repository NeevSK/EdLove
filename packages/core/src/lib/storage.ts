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
        } catch (e) {
            // Silently fail during hydration to avoid HMR issues, or defer to a safe time
        }
    }

    set(key: string, value: string | boolean | number) {
        this.cache.set(key, value);
        AsyncStorage.setItem(key, String(value)).catch(e =
            console.error(`\uD83D\uDCE6 Storage: Failed to persist ${key}`, e)
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
import { Platform } from 'react-native';

/**
 * Storage singleton \u2014 lazily initialized on first access.
 *
 * WHY LAZY?
 * react-native-mmkv v4 uses NitroModules (JSI). The native C++ module is
 * registered before JS executes, but importing storage.ts at module-load time
 * (before React mounts) risks hitting initialization-order issues on some
 * devices. Lazy init means MMKV is only created when the first read/write
 * actually happens, safely inside the React lifecycle.
 *
 * ENGINE SELECTION:
 *   Expo Go (storeClient)  \u2192 RobustAsyncStorage (MMKV can't link in Expo Go)
 *   Dev build / standalone \u2192 MMKV native via NitroModules (fast, synchronous)
 *                            Falls back to RobustAsyncStorage if MMKV fails.
 *
 * MMKV BUILD REQUIREMENTS (dev build must have these):
 *   1. react-native-mmkv and react-native-nitro-modules in package.json  \u2713
 *   2. newArchEnabled=true in android/gradle.properties                  \u2713
 *   3. expo prebuild + expo run:android (NOT just expo start)
 *      The native module must be compiled into the dev client APK.
 *      Running `expo start --dev-client` against an OLD APK that predates
 *      MMKV being added will silently fall back to AsyncStorage.
 */
import { Runtime } from './runtime';

let _storageInstance: StorageInterface | null = null;

function createStorage(): StorageInterface {
    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
    // MMKV is a JSI native module - unavailable in Expo Go (JS-only runtime) and on web.
    // ALSO: Defer MMKV init until the runtime is marked ready to avoid Bridgeless context race.
    const shouldUseAsyncStorage = isExpoGo || Platform.OS === 'web' || !Runtime.isReady();

    if (shouldUseAsyncStorage) {
        if (__DEV__) {
            const reason = isExpoGo ? 'Expo Go' : Platform.OS === 'web' ? 'Web' : 'Early Init (Deferring to AsyncStorage)';
            console.log(`\uD83D\uDCE6 Storage: ${reason} - using AsyncStorage fallback`);
        }
        return new RobustAsyncStorage();
    }

    try {
        const { MMKV } = require('react-native-mmkv');
        const mmkv = new MMKV({ id: 'gurudevi-store' });

        // Probe: verify the native instance actually works before committing.
        const PROBE_KEY = '__mmkv_probe__';
        mmkv.set(PROBE_KEY, '1');
        const probeResult = mmkv.getString(PROBE_KEY);
        mmkv.delete(PROBE_KEY);

        if (probeResult !== '1') throw new Error('MMKV probe read/write mismatch');

        if (__DEV__) console.log('\uD83D\uDCE6 Storage: MMKV v4 (NitroModules) initialized \u2713');

        // Wrap native MMKV instance to satisfy StorageInterface fully.
        return {
            set: (key, value) => mmkv.set(key, value),
            getString: (key) => mmkv.getString(key),
            getStringAsync: async (key) => mmkv.getString(key),
            getNumber: (key) => mmkv.getNumber(key),
            getBoolean: (key) => mmkv.getBoolean(key),
            delete: (key) => mmkv.delete(key),
            clearAll: () => mmkv.clearAll(),
            contains: (key) => mmkv.contains(key),
        };
    } catch (e) {
        if (__DEV__) {
            console.warn(
                '\uD83D\uDCE6 Storage: MMKV init failed \u2014 falling back to AsyncStorage.\n' +
                '  If this is unexpected, check:\n' +
                '    1. expo prebuild && expo run:android was run after adding MMKV\n' +
                '    2. newArchEnabled=true in android/gradle.properties\n' +
                '    3. react-native-nitro-modules version compatibility\n' +
                '  Error:', e
            );
        }
        return new RobustAsyncStorage();
    }
}

function getStorage(): StorageInterface {
    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
    const isPermanentFallback = isExpoGo || Platform.OS === 'web';

    // If we have a cached instance, use it.
    if (_storageInstance) return _storageInstance;

    // If we are NOT ready and it's not a permanent fallback, return a TEMPORARY 
    // RobustAsyncStorage but do NOT cache it. This forces the Proxy to keep 
    // checking until Runtime.isReady() enters the MMKV branch.
    if (!Runtime.isReady() && !isPermanentFallback) {
        if (__DEV__) console.log('\uD83D\uDCE6 Storage: Early access - providing temporary AsyncStorage');
        return new RobustAsyncStorage();
    }

    const instance = createStorage();

    // Cache the instance permanently now that we are ready or it's a permanent fallback.
    _storageInstance = instance;
    return instance;
}

/**
 * storage \u2014 the app's unified KV store.
 *
 * Uses a Proxy so that all method calls go through lazy initialization,
 * meaning MMKV is never instantiated until the first actual read/write.
 * This avoids NitroModules JSI timing issues during app startup.
 */
export const storage: StorageInterface = new Proxy({} as StorageInterface, {
    get(_target, prop: string | symbol) {
        const instance = getStorage() as any;
        if (typeof prop === 'symbol') {
            return Reflect.get(instance, prop);
        }
        const value = instance[prop as keyof typeof instance];
        if (typeof value === 'function') {
            return value.bind(instance);
        }
        return value;
    },
});

export const StorageKeys = {
    USER_PREFERENCES: 'user_preferences',
    LAST_SYNC: 'last_sync',
    CACHED_COMMUNITY_POSTS: 'cached_community_posts',
    CACHED_GROUPS: 'cached_groups',
};

/** @internal \u2014 exposed only for testing. Resets the singleton so tests can inject a fresh instance. */
export function _resetStorageForTesting() {
    _storageInstance = null;
}
