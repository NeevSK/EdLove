/**
 * Web shim for expo-device
 */
export const brand = 'Web';
export const manufacturer = 'Web';
export const modelName = typeof window !== 'undefined' ? window.navigator.userAgent : 'Web';
export const osName = typeof window !== 'undefined' ? 'Web' : 'Unknown';
export const osVersion = '1.0';
export const deviceName = 'Web Browser';
export const deviceType = 1; // 1 = PHONE in Expo DeviceType enum
export const isDevice = true;

export async function getDeviceTypeAsync() {
  return 1;
}

export default {
  brand,
  manufacturer,
  modelName,
  osName,
  osVersion,
  deviceName,
  deviceType,
  isDevice,
  getDeviceTypeAsync,
};
