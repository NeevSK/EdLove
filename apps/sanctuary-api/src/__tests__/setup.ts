import { vi } from 'vitest';

// Direct import of runtimeRegistry to avoid triggering index.ts exports and module-level instantiations
import { coreRuntime } from '../../../../packages/core/src/logic/runtimeRegistry';

let mockZenStackDbAvailable = true;
let mockActiveBond: any = null;

export function setMockZenStackDbAvailable(available: boolean) {
  mockZenStackDbAvailable = available;
}

export function setMockActiveBond(bond: any) {
  mockActiveBond = bond;
}

function createMockDelegate(name: string): any {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'findUnique') {
          if (name === 'school') {
            return async () => ({
              id: 'mock-school',
              name: 'Mock School',
              _count: { classrooms: 0, bonds: 0 },
            });
          }
          if (name === 'user') {
            return async (args: any = {}) => ({
              id: args?.where?.id ?? 'mock-user-id',
              email: 'mock-user@example.com',
              full_name: 'Mock User',
              onboarding_completed: true,
              onboarding_state: 'COMPLETED',
            });
          }
          return async (args: any = {}) => ({
            id: args?.where?.id ?? `${name}-mock-id`,
          });
        }

        if (prop === 'create' || prop === 'update' || prop === 'upsert') {
          return async (args: any = {}) => ({
            id: `${name}-mock-id`,
            ...(args?.data ?? {}),
          });
        }

        if (prop === 'findMany') return async () => [];
        if (prop === 'findFirst') {
          if (name === 'bond') {
            return async () => mockActiveBond;
          }
          return async () => null;
        }

        if (prop === '$transaction') {
          return async (callback: (tx: any) => Promise<any>) => callback(mockDb);
        }

        return createMockDelegate(`${name}.${String(prop)}`);
      },
    },
  );
}

const mockDb = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === '$transaction') {
        return async (callback: (tx: any) => Promise<any>) => callback(mockDb);
      }
      return createMockDelegate(String(prop));
    },
  },
);

vi.mock('@repo/database', () => ({
  canUseZenStackDb: (dbUrl?: string) => {
    if (dbUrl && dbUrl.includes('offline')) return true;
    return mockZenStackDbAvailable;
  },
  createZenStackDb: (user: any, dbUrl?: string) => {
    if (dbUrl && dbUrl.includes('offline')) {
      throw new Error('Could not connect to database');
    }
    return mockDb;
  },
}));

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
  getPermissionsAsync: async () => ({
    status: 'granted' as const,
    canAskAgain: true,
    expires: 'never' as const,
  }),
  requestPermissionsAsync: async () => ({
    status: 'granted' as const,
    canAskAgain: true,
    expires: 'never' as const,
  }),
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
