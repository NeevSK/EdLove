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
}

export interface LocationProvider {
  requestPermissionsAsync: () => Promise<{ status: string }>;
  watchPositionAsync: (options: any, callback: (location: any) => void) => Promise<{ remove: () => void }>;
  Accuracy: Record<string, any>;
}

export interface NetworkProvider {
  fetch(): Promise<{ isConnected: boolean | null; type: string; details?: any }>;
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

export interface CoreRuntimeEnvironment {
  storage: StorageProvider;
  device: DeviceProvider;
  haptics: HapticsProvider;
  linking: LinkingProvider;
  location: LocationProvider;
  network: NetworkProvider;
  share: ShareProvider;
  ui: UIProvider;
}
