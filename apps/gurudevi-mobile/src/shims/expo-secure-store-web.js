/**
 * Web shim for expo-secure-store
 * Falls back to localStorage (which is NOT secure on web, but satisfies the interface)
 */
export async function setItemAsync(key, value, options) {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
    }
    return Promise.resolve();
}

export async function getItemAsync(key, options) {
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
    }
    return null;
}

export async function deleteItemAsync(key, options) {
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
    }
    return Promise.resolve();
}

export default {
    setItemAsync,
    getItemAsync,
    deleteItemAsync,
};
