declare module 'expo-background-task' {
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

  export function registerTaskAsync(name: string, options?: Record<string, unknown>): Promise<void>;
  export function unregisterTaskAsync(name: string): Promise<void>;
  export function getStatusAsync(): Promise<BackgroundTaskStatus>;
  export function triggerTaskWorkerForTestingAsync(name: string): Promise<void>;
}

declare module 'expo-task-manager' {
  export function defineTask(name: string, task: () => Promise<number> | number): void;
  export function isTaskRegisteredAsync(name: string): Promise<boolean>;
}

declare module 'expo-font' {
  export function loadAsync(assets: Record<string, unknown> | unknown[]): Promise<void>;
  /** Embedded (config plugin) and runtime-loaded font names. */
  export function getLoadedFonts(): string[];
}

declare module 'react-native-keychain' {
  export interface Options {
    service?: string;
    accessible?: string;
    securityLevel?: string;
    authenticationPrompt?: {
      title?: string;
      subtitle?: string;
    };
    accessControl?: string;
  }

  export const ACCESSIBLE: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: string;
  };

  export const SECURITY_LEVEL: {
    SECURE_HARDWARE: string;
  };

  export const ACCESS_CONTROL: {
    BIOMETRY_CURRENT_SET: string;
  };

  export function getSupportedBiometryType(): Promise<string | null>;
  export function hasGenericPassword(options?: Options): Promise<boolean>;
  export function getGenericPassword(
    options?: Options,
  ): Promise<{ username: string; password: string } | false>;
  export function setGenericPassword(
    username: string,
    password: string,
    options?: Options,
  ): Promise<boolean>;
}
