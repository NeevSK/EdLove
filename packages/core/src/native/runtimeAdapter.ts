import * as Device from 'expo-device';
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import { storage } from './storage';
import { Platform, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CoreRuntimeEnvironment, DeviceMetadata, HapticsProvider, LinkingProvider, LocationProvider, NetworkProvider } from '../types/runtime';

export const nativeStorageProvider = {
  async getItem(key: string) {
    return storage.getStringAsync(key);
  },
  async setItem(key: string, value: string) {
    storage.set(key, value);
  },
  async removeItem(key: string) {
    storage.delete(key);
  }
};

export const nativeDeviceProvider = {
  getMetadata(): DeviceMetadata {
    const constants = (Platform.constants ?? {}) as Record<string, unknown>;
    const brand = typeof constants.Brand === 'string' ? constants.Brand.trim() : '';
    const model = typeof constants.Model === 'string' ? constants.Model.trim() : '';
    const parts = [brand, model].filter(Boolean);

    return {
      modelName: parts.length > 0 ? parts.join(' ') : Platform.OS,
      osVersion: Platform.Version == null ? null : String(Platform.Version),
      platform: Platform.OS,
    };
  },
  getTotalMemory: () => Device.totalMemory,
};

export const nativeHapticsProvider: HapticsProvider = {
  impactLight: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  impactMedium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  impactHeavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  notificationSuccess: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  notificationWarning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  notificationError: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  selection: () => Haptics.selectionAsync(),
};

export const nativeLinkingProvider: LinkingProvider = {
  openURL: (url: string) => Linking.openURL(url),
  canOpenURL: (url: string) => Linking.canOpenURL(url),
};

export const nativeLocationProvider: LocationProvider = {
  requestPermissionsAsync: () => Location.requestForegroundPermissionsAsync(),
  watchPositionAsync: (options, callback) => Location.watchPositionAsync(options, callback),
  Accuracy: Location.Accuracy,
};

export const nativeNetworkProvider: NetworkProvider = {
  fetch: () => NetInfo.fetch(),
};

export const nativeRuntimeEnvironment: CoreRuntimeEnvironment = {
  storage: nativeStorageProvider,
  device: nativeDeviceProvider,
  haptics: nativeHapticsProvider,
  linking: nativeLinkingProvider,
  location: nativeLocationProvider,
  network: nativeNetworkProvider,
};
