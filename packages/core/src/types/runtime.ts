export interface StorageProvider {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface DeviceMetadata {
  modelName: string | null;
  osVersion: string | null;
  platform: string | null;
}

export interface DeviceProvider {
  getMetadata(): DeviceMetadata;
  getTotalMemory?(): number | null;
}

export interface HapticsProvider {
  impactLight(): void;
  impactMedium(): void;
  impactHeavy(): void;
  notificationSuccess(): void;
  notificationWarning(): void;
  notificationError(): void;
  selection(): void;
}

export interface LinkingProvider {
  openURL(url: string): Promise<void>;
  canOpenURL(url: string): Promise<boolean>;
  addEventListener(type: 'url', handler: (event: { url: string }) => void): { remove: () => void };
  getInitialURL(): Promise<string | null>;
}

export interface LocationProvider {
  requestPermissionsAsync: () => Promise<{ status: string }>;
  watchPositionAsync: (
    options: any,
    callback: (location: any) => void,
  ) => Promise<{ remove: () => void }>;
  Accuracy: Record<string, any>;
}

export interface NetworkProvider {
  fetch(): Promise<{
    isConnected: boolean | null;
    type: string;
    details?: any;
  }>;
}

export interface ShareOptions {
  title?: string;
  message?: string;
  url?: string;
}

export interface ShareProvider {
  share(options: ShareOptions): Promise<void>;
}

export interface UIProvider {
  setStatusBarHidden(hidden: boolean, animation?: 'none' | 'fade' | 'slide'): void;
}

export interface ClipboardProvider {
  getStringAsync(): Promise<string>;
  setStringAsync(content: string): Promise<boolean>;
}

export interface SecureStorageOptions {
  requireAuthentication?: boolean;
}

export interface SecureStorageProvider {
  getItemAsync(key: string, options?: SecureStorageOptions): Promise<string | null>;
  setItemAsync(key: string, value: string, options?: SecureStorageOptions): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

export interface BackgroundTaskOptions {
  minimumInterval?: number;
  stopOnTerminate?: boolean;
  startOnBoot?: boolean;
}

export enum BackgroundTaskResult {
  NewData = 1,
  NoData = 2,
  Failed = 3,
}

export enum BackgroundTaskStatus {
  Available = 1,
  Restricted = 2,
  Denied = 3,
}

export interface BackgroundTaskProvider {
  defineTask(name: string, task: () => Promise<BackgroundTaskResult>): void;
  registerTaskAsync(name: string, options?: BackgroundTaskOptions): Promise<void>;
  unregisterTaskAsync(name: string): Promise<void>;
  getStatusAsync(): Promise<BackgroundTaskStatus>;
  isTaskRegisteredAsync(name: string): Promise<boolean>;
  triggerTaskWorkerForTestingAsync?(name: string): Promise<void>;
}

export interface AssetProvider {
  loadAsync(assets: Record<string, any> | any[]): Promise<void>;
}

export interface NotificationProvider {
  getPushTokenAsync(): Promise<string | null>;
  getPermissionsAsync(): Promise<{ status: string; canAskAgain: boolean; expires: number | 'never' }>;
  requestPermissionsAsync(): Promise<{ status: string; canAskAgain: boolean; expires: number | 'never' }>;
  setBadgeCountAsync(count: number): Promise<boolean>;
  getBadgeCountAsync(): Promise<number>;
}

export interface NotificationPermissionResponse {
  status: 'granted' | 'denied' | 'undetermined';
  canAskAgain: boolean;
  expires: 'never' | number;
}

export interface PushNotificationProvider {
  getPushTokenAsync(): Promise<string | null>;
  getPermissionsAsync(): Promise<NotificationPermissionResponse>;
  requestPermissionsAsync(): Promise<NotificationPermissionResponse>;
  setBadgeCountAsync(count: number): Promise<void>;
  getBadgeCountAsync(): Promise<number>;
  
  // Listeners
  addPushTokenListener(callback: (token: string) => void): () => void;
  addNotificationReceivedListener(callback: (notification: any) => void): () => void;
  addNotificationResponseReceivedListener(callback: (response: any) => void): () => void;
}

export interface CoreRuntimeEnvironment {
  storage: StorageProvider;
  device: DeviceProvider;
  haptics: HapticsProvider;
  linking: LinkingProvider;
  location: LocationProvider;
  network: NetworkProvider;
  share: ShareProvider;
  ui: UIProvider;
  clipboard: ClipboardProvider;
  secureStorage: SecureStorageProvider;
  backgroundTask: BackgroundTaskProvider;
  asset: AssetProvider;
  notification: PushNotificationProvider;
}
