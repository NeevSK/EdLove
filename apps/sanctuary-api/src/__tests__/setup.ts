// Direct import of runtimeRegistry to avoid triggering index.ts exports and module-level instantiations
import { coreRuntime } from '../../../../packages/core/src/logic/runtimeRegistry';

// Complete Mock CoreRuntimeEnvironment for backend test runs
const mockStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

const mockDevice = {
  getMetadata: () => ({ modelName: 'NodeServer', osVersion: '1.0.0', platform: 'server' }),
  getTotalMemory: () => null,
};

const mockHaptics = {
  impactLight: () => {},
  impactMedium: () => {},
  impactHeavy: () => {},
  notificationSuccess: () => {},
  notificationWarning: () => {},
  notificationError: () => {},
  selection: () => {},
};

const mockLinking = {
  openURL: async () => {},
  canOpenURL: async () => true,
  addEventListener: () => ({ remove: () => {} }),
  getInitialURL: async () => null,
};

const mockLocation = {
  requestPermissionsAsync: async () => ({ status: 'granted' }),
  watchPositionAsync: async () => ({ remove: () => {} }),
  Accuracy: {},
};

const mockNetwork = {
  fetch: async () => ({ isConnected: true, type: 'wifi' }),
};

const mockShare = {
  share: async () => {},
};

const mockUI = {
  setStatusBarHidden: () => {},
};

const mockClipboard = {
  getStringAsync: async () => '',
  setStringAsync: async () => true,
};

const mockSecureStorage = {
  getItemAsync: async () => null,
  setItemAsync: async () => {},
  deleteItemAsync: async () => {},
};

const mockBackgroundTask = {
  defineTask: () => {},
  registerTaskAsync: async () => {},
  unregisterTaskAsync: async () => {},
  getStatusAsync: async () => 1,
  isTaskRegisteredAsync: async () => false,
};

const mockAsset = {
  loadAsync: async () => {},
};

const mockNotification = {
  getPushTokenAsync: async () => 'mock-push-token',
  getPermissionsAsync: async () => ({ status: 'granted' as const, canAskAgain: true, expires: 'never' as const }),
  requestPermissionsAsync: async () => ({ status: 'granted' as const, canAskAgain: true, expires: 'never' as const }),
  setBadgeCountAsync: async () => {},
  getBadgeCountAsync: async () => 0,
  addPushTokenListener: () => () => {},
  addNotificationReceivedListener: () => () => {},
  addNotificationResponseReceivedListener: () => () => {},
};

// Register mock environment to bypass runtime errors BEFORE index.ts gets evaluated
coreRuntime.register({
  storage: mockStorage,
  device: mockDevice,
  haptics: mockHaptics,
  linking: mockLinking,
  location: mockLocation,
  network: mockNetwork,
  share: mockShare,
  ui: mockUI,
  clipboard: mockClipboard,
  secureStorage: mockSecureStorage,
  backgroundTask: mockBackgroundTask,
  asset: mockAsset,
  notification: mockNotification,
});
