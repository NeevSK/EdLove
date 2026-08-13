import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { startNetworkBusAdapter } from '@repo/core/adapters/NetworkBusAdapter';
// Adapters
import { AsyncStorageAdapter } from '@repo/core/adapters/native/AsyncStorageAdapter';
import { FallbackMMKVStorageAdapter } from '@repo/core/adapters/native/FallbackMMKVStorageAdapter';
import { NativeCryptoAdapter } from '@repo/core/adapters/native/NativeCryptoAdapter';
import { NativeNetworkAdapter } from '@repo/core/adapters/native/NativeNetworkAdapter';
import { SentryTelemetryAdapter } from '@repo/core/adapters/native/SentryTelemetryAdapter';
import { SimulatorDeviceIdentityAdapter } from '@repo/core/adapters/native/SimulatorDeviceIdentityAdapter';
import { WebCryptoAdapter } from '@repo/core/adapters/WebCryptoAdapter';
import { WebNetworkAdapter } from '@repo/core/adapters/WebNetworkAdapter';
import { cryptoManager } from '@repo/core/logic/managers/CryptoManager';
import { deviceIdentity } from '@repo/core/logic/managers/DeviceIdentityManager';
import { networkManager } from '@repo/core/logic/managers/NetworkManager';
// Managers
import { storage } from '@repo/core/logic/managers/StorageManager';
import { telemetry } from '@repo/core/logic/managers/TelemetryManager';

import { coreRuntime } from '@repo/core/logic/runtimeRegistry';
import { Runtime } from '@repo/core/native/runtime';
import { nativeRuntimeEnvironment, webRuntimeEnvironment } from '@repo/core/native/runtimeAdapter';

/**
 * Sovereign Bootstrap
 * Initializes all platform-specific adapters.
 */
export async function bootstrapPlatform() {
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  const isWeb = Platform.OS === 'web';
  const isReady = Runtime.isReady();

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

  // 1b. Start the Network → SovereignBus bridge
  //     Must run after the network adapter is registered.
  //     Web skips this — it relies on the browser `online`/`offline` events
  //     which can be wired later via a WebNetworkBusAdapter if needed.
  if (!isWeb) {
    startNetworkBusAdapter();
  }

  // 2. Initialize Storage
  if (isExpoGo || isWeb || !isReady) {
    storage.registerAdapter(new AsyncStorageAdapter());
  } else {
    try {
      const { createMMKV } = await import('react-native-mmkv');
      const mmkv = createMMKV({ id: 'gurudevi-store' });
      storage.registerAdapter(new FallbackMMKVStorageAdapter(mmkv));
    } catch (e) {
      console.warn('Boot: MMKV init failed, falling back to AsyncStorage', e);
      storage.registerAdapter(new AsyncStorageAdapter());
    }
  }

  // 3. Register Core Runtime with all providers (asset, haptics, linking, etc.)
  //     This must happen after adapter initialization but before app mount
  coreRuntime.register(isWeb ? webRuntimeEnvironment : nativeRuntimeEnvironment);
}
