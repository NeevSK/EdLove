import { startNetworkBusAdapter } from '@repo/core/adapters/NetworkBusAdapter';
// Adapters
import { NativeCryptoAdapter } from '@repo/core/adapters/native/NativeCryptoAdapter';
import { NativeNetworkAdapter } from '@repo/core/adapters/native/NativeNetworkAdapter';
import { SentryTelemetryAdapter } from '@repo/core/adapters/native/SentryTelemetryAdapter';
import { SimulatorDeviceIdentityAdapter } from '@repo/core/adapters/native/SimulatorDeviceIdentityAdapter';
import { WebCryptoAdapter } from '@repo/core/adapters/WebCryptoAdapter';
import { WebNetworkAdapter } from '@repo/core/adapters/WebNetworkAdapter';
import { BrowserStorageAdapter } from '@repo/core/adapters/web/BrowserStorageAdapter';
import { cryptoManager } from '@repo/core/logic/managers/CryptoManager';
import { deviceIdentity } from '@repo/core/logic/managers/DeviceIdentityManager';
import { networkManager } from '@repo/core/logic/managers/NetworkManager';
// Managers
import { storage } from '@repo/core/logic/managers/StorageManager';
import { telemetry } from '@repo/core/logic/managers/TelemetryManager';
import { coreRuntime } from '@repo/core/logic/runtimeRegistry';
import { Runtime } from '@repo/core/native/runtime';
import { nativeRuntimeEnvironment, webRuntimeEnvironment } from '@repo/core/native/runtimeAdapter';
import { selectNativeStorageAdapter } from '@repo/core/native/storageBackendSelection';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

let bootstrapPromise: Promise<void> | null = null;

/**
 * Sovereign Bootstrap
 * Initializes all platform-specific adapters.
 */
async function initializePlatform(): Promise<void> {
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  const isWeb = Platform.OS === 'web';
  const isReady = Runtime.isReady();
  // MMKV/Nitro initialization is synchronous and can stall the first render
  // on a physical device while the bridgeless runtime is settling. Keep the
  // reliable AsyncStorage path as the default; opt into MMKV only after it has
  // been validated on the target build/device.
  const useMMKV = process.env.EXPO_PUBLIC_USE_MMKV === 'true';

  // 1. Initialize Crypto & Telemetry (Unified)
  if (!isWeb) {
    cryptoManager.registerAdapter(new NativeCryptoAdapter());
    telemetry.registerAdapter(new SentryTelemetryAdapter());
    networkManager.registerAdapter(new NativeNetworkAdapter());
    deviceIdentity.registerAdapter(new SimulatorDeviceIdentityAdapter());
  } else {
    cryptoManager.registerAdapter(new WebCryptoAdapter());
    const { BrowserSentryTelemetryAdapter } = await import('@repo/core/native/webSentryAdapter');
    telemetry.registerAdapter(new BrowserSentryTelemetryAdapter());
    networkManager.registerAdapter(new WebNetworkAdapter());
  }

  // 1b. Start the shared observation → SovereignBus bridge after adapter setup.
  startNetworkBusAdapter();

  // 2. Initialize Storage
  if (isWeb) {
    storage.registerAdapter(new BrowserStorageAdapter());
  } else {
    const adapter = await selectNativeStorageAdapter({
      useMMKV: !isExpoGo && isReady && useMMKV,
      loadMMKV: () => import('react-native-mmkv'),
    });
    storage.registerAdapter(adapter);
  }

  // 3. Register Core Runtime with all providers (asset, haptics, linking, etc.)
  //     This must happen after adapter initialization but before app mount
  coreRuntime.register(isWeb ? webRuntimeEnvironment : nativeRuntimeEnvironment);
}

/**
 * Registers the platform runtime exactly once per JavaScript execution context.
 *
 * The foreground app and an Expo background worker can both enter through this
 * function. Sharing the promise makes the ordering explicit: consumers can
 * only proceed after every core provider has been registered. A failed attempt
 * is deliberately retryable rather than leaving a rejected promise cached.
 */
export function bootstrapPlatform(): Promise<void> {
  if (coreRuntime.isRegistered()) {
    return Promise.resolve();
  }

  if (!bootstrapPromise) {
    bootstrapPromise = initializePlatform().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }

  return bootstrapPromise;
}
