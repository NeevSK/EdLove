import { vi } from 'vitest';

// Direct import of runtimeRegistry to avoid triggering index.ts exports and module-level instantiations
import { coreRuntime } from '../../../../packages/core/src/logic/runtimeRegistry';

let mockZenStackDbAvailable = true;
let mockActiveBond: any = null;
let mockUserData: any = null;
let mockDailyContentRows: any[] = [];
let mockQueryRowsQueue: any[][] = [];
let mockLibraryCollectionRead: any = null;
let mockLibraryCollections: any[] = [];
let mockLibraryCollectionFindManyArgs: any = null;
let mockLibraryResources: any[] = [];
let mockCollectionNodeEvents: any[] = [];

export function setMockZenStackDbAvailable(available: boolean) {
  mockZenStackDbAvailable = available;
}

export function setMockActiveBond(bond: any) {
  mockActiveBond = bond;
}

export function setMockUserData(data: any) {
  mockUserData = data;
}

export function setMockDailyContentRows(rows: any[]) {
  mockDailyContentRows = rows;
}

export function setMockQueryRowsQueue(rows: any[][]) {
  mockQueryRowsQueue = [...rows];
}

export function setMockLibraryTemporalRead({
  collection,
  resources,
  events,
}: {
  collection: any;
  resources: any[];
  events: any[];
}) {
  mockLibraryCollectionRead = collection;
  mockLibraryResources = resources;
  mockCollectionNodeEvents = events;
}

export function setMockLibraryCollections(rows: any[]) {
  mockLibraryCollections = rows;
  mockLibraryCollectionFindManyArgs = null;
}

export function getMockLibraryCollectionFindManyArgs() {
  return mockLibraryCollectionFindManyArgs;
}

function createMockDelegate(name: string): any {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'findUnique') {
          if (name === 'sanctuaryManifesto') {
            return async () => ({
              id: 'd23e4567-e89b-12d3-a456-426614174000',
              school_id: mockActiveBond?.entity_id ?? '223e4567-e89b-12d3-a456-426614174000',
            });
          }
          if (name === 'communityCommentUpvote') return async () => null;
          if (name === 'assignmentSubmission') return async () => null;
          if (name === 'directConversation') return async () => null;
          if (name === 'school') {
            return async () => ({
              id: 'mock-school',
              name: 'Mock School',
              created_by: '123e4567-e89b-12d3-a456-426614174000',
              _count: { classrooms: 0, bonds: 0 },
            });
          }
          if (name === 'user') {
            return async (args: any = {}) => {
              if (mockUserData) return mockUserData;
              return {
                id: args?.where?.id ?? 'mock-user-id',
                email: 'mock-user@example.com',
                full_name: 'Mock User',
                onboarding_completed: true,
                onboarding_state: 'COMPLETED',
              };
            };
          }
          if (name === 'userPreferences') {
            return async (args: any = {}) => ({
              id: 'preferences-mock-id',
              user_id: args?.where?.user_id ?? 'mock-user-id',
              favorite_features: [],
              hidden_features: [],
              morning_check_time: null,
              afternoon_check_time: null,
              evening_wind_down_time: null,
              enable_contextual_prompts: true,
              enable_usage_tracking: true,
              notification_settings: null,
              updated_at: new Date(),
              created_at: new Date(),
            });
          }
          if (name === 'libraryCollection' && mockLibraryCollectionRead) {
            return async () => mockLibraryCollectionRead;
          }
          return async (args: any = {}) => ({
            id: args?.where?.id ?? `${name}-mock-id`,
          });
        }

        if (
          prop === 'create' ||
          prop === 'update' ||
          prop === 'upsert' ||
          prop === 'delete' ||
          prop === 'deleteMany' ||
          prop === 'updateMany'
        ) {
          if (name === 'sanctuaryManifesto' && prop === 'create') {
            return async (args: any = {}) => ({
              id: 'd23e4567-e89b-12d3-a456-426614174000',
              ...(args?.data ?? {}),
              created_at: new Date('2026-08-14T00:00:00.000Z'),
              updated_at: new Date('2026-08-14T00:00:00.000Z'),
              _count: { endorsements: 0 },
              endorsements: [],
            });
          }
          if (name === 'userSocialLink' && (prop === 'create' || prop === 'update')) {
            return async (args: any = {}) => ({
              id: '423e4567-e89b-12d3-a456-426614174000',
              created_at: new Date('2026-01-01T00:00:00.000Z'),
              updated_at: new Date('2026-01-01T00:00:00.000Z'),
              ...(args?.data ?? {}),
            });
          }
          if (name === 'groupMember' && prop === 'update') {
            return async (args: any = {}) => ({
              id: '523e4567-e89b-12d3-a456-426614174000',
              group_id: args?.where?.group_id_user_id?.group_id,
              user_id: args?.where?.group_id_user_id?.user_id,
              role: 'member',
              status: 'active',
              joined_at: new Date('2026-01-01T00:00:00.000Z'),
              ...(args?.data ?? {}),
            });
          }
          if (name === 'directConversation' && prop === 'create') {
            return async (args: any = {}) => ({
              id: '623e4567-e89b-12d3-a456-426614174000',
              created_at: new Date(),
              updated_at: new Date(),
              ...(args?.data ?? {}),
            });
          }
          if (name === 'directMessage' && prop === 'create') {
            return async (args: any = {}) => ({
              id: '723e4567-e89b-12d3-a456-426614174000',
              created_at: new Date(),
              ...(args?.data ?? {}),
            });
          }
          if (name === 'announcement' && prop === 'create') {
            return async (args: any = {}) => ({
              id: '823e4567-e89b-12d3-a456-426614174000',
              created_at: new Date(),
              ...(args?.data ?? {}),
            });
          }
          if (name === 'libraryResource' && prop === 'create') {
            return async (args: any = {}) => ({
              id: '923e4567-e89b-12d3-a456-426614174000',
              title: args?.data?.title ?? 'Test Resource',
              description: args?.data?.description ?? null,
              type: args?.data?.type ?? 'lesson',
              format: args?.data?.format ?? 'text',
              url: args?.data?.url ?? null,
              file_path: args?.data?.file_path ?? null,
              subjects: args?.data?.subjects ?? [],
              topics: args?.data?.topics ?? [],
              grades: args?.data?.grades ?? [],
              difficulty: args?.data?.difficulty ?? null,
              language: args?.data?.language ?? [],
              visibility: args?.data?.visibility ?? 'public',
              creator_id: args?.data?.creator_id ?? 'mock-user-id',
              creator_role: args?.data?.creator_role ?? 'teacher',
              verified: false,
              is_community: true,
              views: 0,
              uses_count: 0,
              endorsements: 0,
              bookmarks: 0,
              created_at: new Date(),
              updated_at: new Date(),
              creator: { full_name: 'Mock User', avatar_url: null },
            });
          }
          if (name === 'libraryCollection' && prop === 'create') {
            return async (args: any = {}) => ({
              id: 'a23e4567-e89b-12d3-a456-426614174000',
              name: args?.data?.name ?? 'Test Collection',
              description: args?.data?.description ?? null,
              creator_id: args?.data?.creator_id ?? 'mock-user-id',
              visibility: args?.data?.visibility ?? 'public',
              subjects: args?.data?.subjects ?? [],
              topics: args?.data?.topics ?? [],
              grades: args?.data?.grades ?? [],
              created_at: new Date(),
              updated_at: new Date(),
              creator: { full_name: 'Mock User', avatar_url: null },
              nodes: [],
            });
          }
          if (name === 'bond' && prop === 'create') {
            return async (args: any = {}) => ({
              id: 'b23e4567-e89b-12d3-a456-426614174000',
              created_at: new Date(),
              updated_at: new Date(),
              ...(args?.data ?? {}),
            });
          }
          if (name === 'principalNote' && (prop === 'create' || prop === 'update')) {
            return async (args: any = {}) => ({
              id: 'c23e4567-e89b-12d3-a456-426614174000',
              school_id: args?.data?.school_id ?? '923e4567-e89b-12d3-a456-426614174000',
              author_id: args?.data?.author_id ?? '123e4567-e89b-12d3-a456-426614174000',
              content: args?.data?.content ?? 'Principal note',
              note_type: args?.data?.note_type ?? 'note',
              is_pinned: args?.data?.is_pinned ?? false,
              is_done: args?.data?.is_done ?? false,
              context_teacher_id: args?.data?.context_teacher_id ?? null,
              context_classroom_id: args?.data?.context_classroom_id ?? null,
              target_date: args?.data?.target_date ?? null,
              created_at: new Date(),
              updated_at: new Date(),
            });
          }
          if (name === 'post' && prop === 'update') {
            return async (args: any = {}) => ({
              id: 'a23e4567-e89b-12d3-a456-426614174000',
              group_id: 'b23e4567-e89b-12d3-a456-426614174000',
              author_id: 'c23e4567-e89b-12d3-a456-426614174000',
              content: args?.data?.content ?? 'Updated',
              created_at: new Date(),
              updated_at: new Date(),
              reactions: [],
              author: { full_name: 'Test Author' },
            });
          }
          return async (args: any = {}) => ({
            id: `${name}-mock-id`,
            ...(args?.data ?? {}),
          });
        }

        if (prop === 'findMany') {
          if (name === 'bond') return async () => (mockActiveBond ? [mockActiveBond] : []);
          if (name === 'libraryCollection')
            return async (args: any = {}) => {
              mockLibraryCollectionFindManyArgs = args;
              return mockLibraryCollections;
            };
          if (name === 'libraryResource') return async () => mockLibraryResources;
          if (name === 'collectionNodeEvent') return async () => mockCollectionNodeEvents;
          return async () => [];
        }
        if (prop === 'findFirst') {
          if (name === 'bond') {
            return async (args: any = {}) => {
              if (args?.where?.entity_type === 'SCHOOL' && mockActiveBond?.entity_type !== 'SCHOOL')
                return null;
              if (
                args?.where?.entity_type === 'PLATFORM' &&
                (mockActiveBond?.entity_type !== 'PLATFORM' || mockActiveBond?.capacity !== 'admin')
              )
                return null;
              return mockActiveBond;
            };
          }
          if (name === 'communityPollVote') return async () => null;
          return async () => null;
        }

        if (prop === 'count') return async () => 0;

        if (prop === '$transaction') {
          return async (callback: (tx: any) => Promise<any>) => callback(mockDb);
        }
        if (prop === '$queryRaw') {
          return async () => mockDailyContentRows;
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
      if (prop === '$queryRaw') {
        return async () => mockDailyContentRows;
      }
      if (prop === '$queryRawUnsafe') {
        return async () => [];
      }
      return createMockDelegate(String(prop));
    },
  },
);

vi.mock('@repo/database/client', () => ({
  queryDatabaseRows: async <T>() => (mockQueryRowsQueue.shift() ?? []) as T[],
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
