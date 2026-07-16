/// <reference path="../types/external-modules.d.ts" />

import NetInfo from '@react-native-community/netinfo';
import * as BackgroundTask from 'expo-background-task';
import * as Device from 'expo-device';
import * as Font from 'expo-font';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import * as TaskManager from 'expo-task-manager';
import { Linking, Platform, Share, StatusBar } from 'react-native';
import type {
  BackgroundTaskOptions,
  BackgroundTaskProvider,
  CoreRuntimeEnvironment,
  DeviceMetadata,
  HapticsProvider,
  LinkingProvider,
  LocationProvider,
  NetworkProvider,
  SecureStorageOptions,
  SecureStorageProvider,
  ShareOptions,
  ShareProvider,
  UIProvider,
} from '../types/runtime';
import { BackgroundTaskResult, BackgroundTaskStatus } from '../types/runtime';
import { storage } from './storage';

export const nativeStorageProvider = {
  async getItem(key: string) {
    return storage.getStringAsync(key);
  },
  async setItem(key: string, value: string) {
    storage.set(key, value);
  },
  async removeItem(key: string) {
    storage.delete(key);
  },
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
  impactLight: () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  impactMedium: () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  impactHeavy: () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },
  notificationSuccess: () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  notificationWarning: () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
  notificationError: () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
  selection: () => {
    void Haptics.selectionAsync();
  },
};

export const nativeLinkingProvider: LinkingProvider = {
  openURL: (url: string) => Linking.openURL(url),
  canOpenURL: (url: string) => Linking.canOpenURL(url),
  addEventListener: (type: 'url', handler: (event: { url: string }) => void) =>
    Linking.addEventListener(type, handler),
  getInitialURL: () => Linking.getInitialURL(),
};

export const nativeLocationProvider: LocationProvider = {
  requestPermissionsAsync: () => Location.requestForegroundPermissionsAsync(),
  watchPositionAsync: (options: any, callback: (location: any) => void) =>
    Location.watchPositionAsync(options, callback),
  Accuracy: Location.Accuracy,
};

export const nativeNetworkProvider: NetworkProvider = {
  fetch: () => NetInfo.fetch(),
};

export const nativeShareProvider: ShareProvider = {
  share: async (options: ShareOptions) => {
    await Share.share({
      title: options.title,
      message: options.message ?? '',
      url: options.url,
    });
  },
};

export const nativeUIProvider: UIProvider = {
  setStatusBarHidden: (hidden: boolean, animation?: 'none' | 'fade' | 'slide') =>
    StatusBar.setHidden(hidden, animation),
};

export const nativeSecureStorageProvider: SecureStorageProvider = {
  getItemAsync: (key: string, options?: SecureStorageOptions) =>
    SecureStore.getItemAsync(key, {
      requireAuthentication: options?.requireAuthentication,
    }),
  setItemAsync: (key: string, value: string, options?: SecureStorageOptions) =>
    SecureStore.setItemAsync(key, value, {
      requireAuthentication: options?.requireAuthentication,
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    }),
  deleteItemAsync: (key: string) => SecureStore.deleteItemAsync(key),
};

export const nativeBackgroundTaskProvider: BackgroundTaskProvider = {
  defineTask: (name: string, task: () => Promise<BackgroundTaskResult>) => {
    TaskManager.defineTask(name, async () => {
      const result = await task();
      switch (result) {
        case BackgroundTaskResult.NewData:
          return BackgroundTask.BackgroundTaskResult.NewData;
        case BackgroundTaskResult.NoData:
          return BackgroundTask.BackgroundTaskResult.NoData;
        case BackgroundTaskResult.Failed:
          return BackgroundTask.BackgroundTaskResult.Failed;
        default:
          return BackgroundTask.BackgroundTaskResult.NoData;
      }
    });
  },
  registerTaskAsync: (name: string, options?: BackgroundTaskOptions) =>
    BackgroundTask.registerTaskAsync(name, options),
  unregisterTaskAsync: (name: string) => BackgroundTask.unregisterTaskAsync(name),
  getStatusAsync: async () => {
    const status = await BackgroundTask.getStatusAsync();
    switch (status) {
      case BackgroundTask.BackgroundTaskStatus.Available:
        return BackgroundTaskStatus.Available;
      case BackgroundTask.BackgroundTaskStatus.Restricted:
        return BackgroundTaskStatus.Restricted;
      case BackgroundTask.BackgroundTaskStatus.Denied:
        return BackgroundTaskStatus.Denied;
      default:
        return BackgroundTaskStatus.Denied;
    }
  },
  isTaskRegisteredAsync: (name: string) => TaskManager.isTaskRegisteredAsync(name),
  triggerTaskWorkerForTestingAsync: (name: string) =>
    BackgroundTask.triggerTaskWorkerForTestingAsync(name),
};

export const nativeAssetProvider = {
  async loadAsync(assets: any) {
    return Font.loadAsync(assets);
  },
};

export const nativeNotificationProvider: any = {
  getPushTokenAsync: async () => {
    if (!Device.isDevice) return null;
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  },
  getPermissionsAsync: async () => {
    const { status, canAskAgain, expires } = await Notifications.getPermissionsAsync();
    return { status: status as any, canAskAgain, expires };
  },
  requestPermissionsAsync: async () => {
    const { status, canAskAgain, expires } = await Notifications.requestPermissionsAsync();
    return { status: status as any, canAskAgain, expires };
  },
  setBadgeCountAsync: (count: number) => Notifications.setBadgeCountAsync(count),
  getBadgeCountAsync: () => Notifications.getBadgeCountAsync(),

  addPushTokenListener: (callback: (token: string) => void) => {
    if (Platform.OS === 'web') return () => undefined;
    const subscription = Notifications.addPushTokenListener((token: any) => callback(token.data));
    return () => subscription.remove();
  },

  addNotificationReceivedListener: (callback: (notification: any) => void) => {
    const subscription = Notifications.addNotificationReceivedListener(callback);
    return () => subscription.remove();
  },
  addNotificationResponseReceivedListener: (callback: (response: any) => void) => {
    const subscription = Notifications.addNotificationResponseReceivedListener(callback);
    return () => subscription.remove();
  },
};

export const nativeRuntimeEnvironment: CoreRuntimeEnvironment = {
  storage: nativeStorageProvider as any,
  device: nativeDeviceProvider,
  haptics: nativeHapticsProvider,
  linking: nativeLinkingProvider,
  location: nativeLocationProvider,
  network: nativeNetworkProvider,
  share: nativeShareProvider,
  ui: nativeUIProvider,
  clipboard: {
    getStringAsync: async () => '',
    setStringAsync: async () => false,
  },
  secureStorage: nativeSecureStorageProvider,
  backgroundTask: nativeBackgroundTaskProvider,
  asset: nativeAssetProvider,
  notification: nativeNotificationProvider,
};

const webNoopEventHandle = { remove: () => undefined };

export const webRuntimeEnvironment: CoreRuntimeEnvironment = {
  storage: nativeStorageProvider as any,
  device: {
    getMetadata(): DeviceMetadata {
      return {
        modelName: globalThis.navigator?.userAgent ?? 'web',
        osVersion: globalThis.navigator?.platform ?? null,
        platform: 'web',
      };
    },
    getTotalMemory: () => null,
  },
  haptics: {
    impactLight: () => undefined,
    impactMedium: () => undefined,
    impactHeavy: () => undefined,
    notificationSuccess: () => undefined,
    notificationWarning: () => undefined,
    notificationError: () => undefined,
    selection: () => undefined,
  },
  linking: {
    openURL: async (url: string) => {
      globalThis.open?.(url, '_blank', 'noopener,noreferrer');
    },
    canOpenURL: async () => true,
    addEventListener: () => webNoopEventHandle,
    getInitialURL: async () => null,
  },
  location: {
    requestPermissionsAsync: async () => ({ status: 'denied' }),
    watchPositionAsync: async () => webNoopEventHandle,
    Accuracy: {},
  },
  network: {
    fetch: async () => ({
      isConnected: globalThis.navigator?.onLine ?? null,
      type: globalThis.navigator?.onLine ? 'wifi' : 'none',
    }),
  },
  share: {
    share: async () => undefined,
  },
  ui: {
    setStatusBarHidden: () => undefined,
  },
  clipboard: {
    getStringAsync: async () => '',
    setStringAsync: async () => false,
  },
  secureStorage: {
    getItemAsync: async (key: string) => globalThis.localStorage?.getItem(key) ?? null,
    setItemAsync: async (key: string, value: string) => {
      globalThis.localStorage?.setItem(key, value);
      return;
    },
    deleteItemAsync: async (key: string) => {
      globalThis.localStorage?.removeItem(key);
      return;
    },
  },
  backgroundTask: {
    defineTask: () => undefined,
    registerTaskAsync: async () => undefined,
    unregisterTaskAsync: async () => undefined,
    getStatusAsync: async () => BackgroundTaskStatus.Denied,
    isTaskRegisteredAsync: async () => false,
  },
  asset: {
    loadAsync: async () => undefined,
  },
  notification: {
    getPushTokenAsync: async () => null,
    getPermissionsAsync: async () => ({
      status: 'denied',
      canAskAgain: false,
      expires: 'never',
    }),
    requestPermissionsAsync: async () => ({
      status: 'denied',
      canAskAgain: false,
      expires: 'never',
    }),
    setBadgeCountAsync: async () => undefined,
    getBadgeCountAsync: async () => 0,
    addPushTokenListener: () => () => undefined,
    addNotificationReceivedListener: () => () => undefined,
    addNotificationResponseReceivedListener: () => () => undefined,
  },
};
