import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
    id: 'gurudevi-storage',
    encryptionKey: 'gurudevi-secret-key' // ideally from env or secure keystore
});

export const StorageKeys = {
    USER_PREFERENCES: 'user_preferences',
    LAST_SYNC: 'last_sync',
    CACHED_COMMUNITY_POSTS: 'cached_community_posts',
    CACHED_GROUPS: 'cached_groups',
};
