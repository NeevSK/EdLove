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

export async function impactAsync(_style) {
  return Promise.resolve();
}

export async function notificationAsync(_type) {
  return Promise.resolve();
}

export async function selectionAsync() {
  return Promise.resolve();
}
