/**
 * Web shim for expo-updates
 */
export const updateId = 'web-update';
export const channel = 'web';

export async function checkForUpdateAsync() {
    return { isAvailable: false };
}

export async function fetchUpdateAsync() {
    return { isNew: false };
}

export async function reloadAsync() {
    if (typeof window !== 'undefined') {
        window.location.reload();
    }
}

export default {
    updateId,
    channel,
    checkForUpdateAsync,
    fetchUpdateAsync,
    reloadAsync,
};
