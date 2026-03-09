/**
 * Web shim for expo-haptics
 */
export const ImpactFeedbackStyle = {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
};

export const NotificationFeedbackType = {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
};

export async function impactAsync(style) {
    return Promise.resolve();
}

export async function notificationAsync(type) {
    return Promise.resolve();
}

export async function selectionAsync() {
    return Promise.resolve();
}
