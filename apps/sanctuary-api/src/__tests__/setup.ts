import { vi } from 'vitest';

// Direct import of runtimeRegistry to avoid triggering index.ts exports and module-level instantiations
import { coreRuntime } from '../../../../packages/core/src/logic/runtimeRegistry';

let mockZenStackDbAvailable = true;
const mockAuthIdentities = new Map<string, string | null>();
const legacyAuthFixtureAccounts: Readonly<Record<string, string>> = {
  'admin-user-1': '123e4567-e89b-12d3-a456-426614174000',
  'teacher-user-1': '123e4567-e89b-12d3-a456-426614174000',
  'student-user-1': '123e4567-e89b-12d3-a456-426614174002',
};
let mockAuthIdentityError: Error | null = null;
let mockAuthIdentityLookup: { query: string; parameters: readonly unknown[] } | null = null;

export function setMockAuthIdentity(subject: string, accountId: string | null) {
  mockAuthIdentities.set(subject, accountId);
}

export function setMockAuthIdentityError(error: Error | null) {
  mockAuthIdentityError = error;
}

export function resetMockAuthIdentities() {
  mockAuthIdentities.clear();
  mockAuthIdentityError = null;
  mockAuthIdentityLookup = null;
}

export function getMockAuthIdentityLookup() {
  return mockAuthIdentityLookup;
}
let mockActiveBond: any = null;
let mockUserData: any = null;
let mockUsers: any[] = [];
let mockDailyContentRows: any[] = [];
let mockLastQueryRawArgs: unknown[] | null = null;
let mockLastExecuteRawArgs: unknown[] | null = null;
let mockLastDatabaseQueryArgs: [string, readonly unknown[]] | null = null;
let mockRawQueryRowsQueue: unknown[][] = [];
let mockQueryRowsQueue: any[][] = [];
let mockLibraryCollectionRead: any = null;
let mockLibraryCollections: any[] = [];
let mockLibraryCollectionFindManyArgs: any = null;
let mockLibraryResources: any[] = [];
let mockCollectionNodeEvents: any[] = [];

// Self handler mocks
let mockMoodLogs: any[] = [];
let mockFireJournalEntries: any[] = [];
let mockThoughtRecords: any[] = [];
let mockUserPreferences: any = null;

// History handler mocks

// Rewards handler mocks
let mockUserRewards: any = null;
let mockUserRewardsVersions: any[] = [];
let mockWhisperedMoments: any[] = [];

// Classroom note mock
let mockClassroomNotes: any[] = [];
let mockClassroomNoteRead: Record<string, unknown> | null | undefined;
export function setMockClassroomNoteRead(row: Record<string, unknown> | null | undefined) {
  mockClassroomNoteRead = row;
}
let mockClassrooms: any[] = [];
let mockClassroomStudents: any[] = [];
const mockEducationalRows = new Map<string, Record<string, unknown>>();
let mockAssignmentSubmissionRead: Record<string, unknown> | null = null;

export function setMockAssignmentSubmissionRead(row: Record<string, unknown> | null) {
  mockAssignmentSubmissionRead = row;
}

export function setMockZenStackDbAvailable(available: boolean) {
  mockZenStackDbAvailable = available;
}

export function setMockActiveBond(bond: any) {
  mockActiveBond = bond
    ? {
        id: bond.id ?? 'bond-mock-id',
        user_id: bond.user_id ?? '123e4567-e89b-12d3-a456-426614174000',
        status: bond.status ?? 'active',
        valid_from: new Date('2020-01-01'),
        valid_until: null,
        metadata: null,
        ...bond,
      }
    : null;
}

export function setMockUserData(data: any) {
  mockUserData = data;
}

export function setMockUsers(rows: any[]) {
  mockUsers = rows;
}

export function setMockDailyContentRows(rows: any[]) {
  mockDailyContentRows = rows;
  mockLastQueryRawArgs = null;
}

export function getMockLastQueryRawArgs(): unknown[] | null {
  return mockLastQueryRawArgs;
}

export function getMockLastDatabaseQueryArgs(): [string, readonly unknown[]] | null {
  return mockLastDatabaseQueryArgs;
}

export function setMockRawQueryRowsQueue(rows: unknown[][]) {
  mockRawQueryRowsQueue = [...rows];
  mockLastQueryRawArgs = null;
  mockLastExecuteRawArgs = null;
}

export function getMockLastExecuteRawArgs(): unknown[] | null {
  return mockLastExecuteRawArgs;
}

async function queryMockRawRows(...args: unknown[]): Promise<unknown[]> {
  mockLastQueryRawArgs = args;
  return mockRawQueryRowsQueue.shift() ?? mockDailyContentRows;
}

async function executeMockRaw(...args: unknown[]): Promise<number> {
  mockLastExecuteRawArgs = args;
  return 1;
}

export function setMockQueryRowsQueue(rows: any[][]) {
  mockQueryRowsQueue = [...rows];
  mockLastDatabaseQueryArgs = null;
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

export function setMockMoodLogs(rows: any[]) {
  mockMoodLogs = rows;
}

export function setMockFireJournalEntries(rows: any[]) {
  mockFireJournalEntries = rows;
}

export function setMockThoughtRecords(rows: any[]) {
  mockThoughtRecords = rows;
}

export function setMockUserPreferences(data: any) {
  mockUserPreferences = data;
}

export function setMockCollectionNodeEvents(rows: any[]) {
  mockCollectionNodeEvents = rows;
}

export function setMockUserRewards(data: any) {
  mockUserRewards = data;
}

export function setMockUserRewardsVersions(rows: any[]) {
  mockUserRewardsVersions = rows;
}

export function setMockWhisperedMoments(rows: any[]) {
  mockWhisperedMoments = rows;
}

export function setMockClassroomNotes(rows: any[]) {
  mockClassroomNotes = rows;
}

export function setMockClassroomRelationships({
  classrooms,
  students,
}: {
  classrooms: any[];
  students?: any[];
}) {
  mockClassrooms = classrooms;
  mockClassroomStudents = students ?? [];
  mockEducationalRows.clear();
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
          if (name === 'classroomStudent')
            return async (args: {
              where: { classroom_id_student_id: { classroom_id: string; student_id: string } };
            }) => {
              const key = args.where.classroom_id_student_id;
              return (
                mockClassroomStudents.find(
                  (row) =>
                    row.classroom_id === key.classroom_id && row.student_id === key.student_id,
                ) ?? null
              );
            };
          if (name === 'classroom')
            return async (args: { where: { id: string } }) =>
              mockClassrooms.find((row) => row.id === args.where.id) ?? null;
          if (name === 'material')
            return async (args: { where: { id: string } }) =>
              mockEducationalRows.get(`material:${args.where.id}`) ?? null;
          if (name === 'sanctuaryManifesto') {
            return async () => ({
              id: 'd23e4567-e89b-12d3-a456-426614174000',
              school_id: mockActiveBond?.entity_id ?? '223e4567-e89b-12d3-a456-426614174000',
            });
          }
          if (name === 'gradeClass') {
            return async (args: any = {}) => ({
              id: args?.where?.id ?? '123e4567-e89b-12d3-a456-426614174004',
              school_id: mockActiveBond?.entity_id ?? '123e4567-e89b-12d3-a456-426614174000',
              academic_cycle_id: '123e4567-e89b-12d3-a456-426614174010',
              status: 'active',
            });
          }
          if (name === 'communityCommentUpvote') return async () => null;
          if (name === 'assignmentSubmission') return async () => mockAssignmentSubmissionRead;
          if (name === 'classroomNote')
            return async (args: any = {}) =>
              mockClassroomNoteRead !== undefined
                ? mockClassroomNoteRead
                : {
                    id: args?.where?.id ?? 'mock-note-id',
                    classroom_id: '123e4567-e89b-12d3-a456-426614174001',
                    school_id: 'school-123',
                    author_id: '123e4567-e89b-12d3-a456-426614174000',
                    classroom: { school_id: 'school-123' },
                  };
          if (name === 'assignment')
            return async (args: { where: { id: string } }) => {
              const row = mockEducationalRows.get(`assignment:${args.where.id}`) ?? {
                id: '923e4567-e89b-12d3-a456-426614174000',
                classroom_id: '123e4567-e89b-12d3-a456-426614174001',
              };
              return {
                ...row,
                classroom: mockClassrooms.find((item) => item.id === row.classroom_id),
              };
            };
          if (name === 'principalNote')
            return async (args: any = {}) => ({
              id: args?.where?.id ?? 'principal-note-mock-id',
              school_id: '923e4567-e89b-12d3-a456-426614174000',
              author_id: '123e4567-e89b-12d3-a456-426614174000',
              content: 'Mock note',
              note_type: 'todo',
              is_pinned: false,
              is_done: false,
              created_at: new Date(),
              updated_at: new Date(),
            });
          if (name === 'directConversation')
            return async (args: any = {}) =>
              args?.where?.id
                ? {
                    id: args.where.id,
                    user1_id: '123e4567-e89b-12d3-a456-426614174000',
                    user2_id: '223e4567-e89b-12d3-a456-426614174000',
                  }
                : null;
          if (name === 'school') {
            return async (args: any = {}) => ({
              id: args?.where?.id ?? '123e4567-e89b-12d3-a456-426614174000',
              name: 'Mock School',
              created_by: '123e4567-e89b-12d3-a456-426614174000',
              _count: { classrooms: 0, bonds: 0 },
            });
          }
          if (name === 'user') {
            return async (args: any = {}) => {
              const u = mockUserData ?? {
                id: args?.where?.id ?? 'mock-user-id',
                email: 'mock-user@example.com',
                full_name: 'Mock User',
                first_name: 'Mock',
                last_name: 'User',
                onboarding_completed: true,
                onboarding_state: 'COMPLETED',
              };
              const res = { ...u };
              if (args?.include?.bonds) {
                res.bonds = mockActiveBond
                  ? [
                      mockActiveBond,
                      {
                        id: '123e4567-e89b-12d3-a456-426614174099',
                        user_id: res.id,
                        entity_id: 'pc-mock',
                        entity_type: 'PERSONAL_CLASSROOM',
                        capacity: mockActiveBond.capacity ?? 'teacher',
                        status: 'active',
                        valid_from: new Date('2020-01-01'),
                        valid_until: null,
                      },
                    ]
                  : [];
              }
              if (args?.include?.preferences) {
                res.preferences = {
                  id: 'pref-mock',
                  user_id: res.id,
                  active_bond_id: mockActiveBond?.id ?? null,
                };
              }
              return res;
            };
          }
          if (name === 'userPreferences') {
            return async (args: any = {}) => {
              const base = {
                id: 'preferences-mock-id',
                user_id: args?.where?.user_id ?? 'mock-user-id',
                active_bond_id: mockActiveBond?.id ?? null,
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
              };
              if (mockUserPreferences) return { ...base, ...mockUserPreferences };
              return base;
            };
          }
          if (name === 'libraryCollection' && mockLibraryCollectionRead) {
            return async () => mockLibraryCollectionRead;
          }
          if (name === 'userRewards') {
            return async (args: any = {}) => {
              const where = args?.where;
              if (where?.user_id && mockUserRewards && mockUserRewards.user_id === where.user_id) {
                return mockUserRewards;
              }
              return mockUserRewards;
            };
          }
          if (name === 'moodLog') {
            return async (args: any = {}) => {
              const where = args?.where;
              if (where?.user_id) {
                const userLogs = mockMoodLogs.filter((l: any) => l.user_id === where.user_id);
                if (where?.created_at?.gte) {
                  const cutoff = new Date(where.created_at.gte);
                  return userLogs.find((l: any) => new Date(l.created_at) >= cutoff) || null;
                }
                return userLogs[0] || null;
              }
              return mockMoodLogs[0] || null;
            };
          }
          if (name === 'fireJournalEntry') {
            return async (args: any = {}) => {
              const where = args?.where;
              if (where?.user_id) {
                return mockFireJournalEntries.find((e: any) => e.user_id === where.user_id) || null;
              }
              return mockFireJournalEntries[0] || null;
            };
          }
          if (name === 'thoughtRecord') {
            return async (args: any = {}) => {
              const where = args?.where;
              if (where?.id) {
                return mockThoughtRecords.find((t: any) => t.id === where.id) || null;
              }
              if (where?.user_id) {
                return mockThoughtRecords.find((t: any) => t.user_id === where.user_id) || null;
              }
              return mockThoughtRecords[0] || null;
            };
          }
          if (name === 'collectionNodeEvent') {
            return async (args: any = {}) => {
              const where = args?.where;
              let results = mockCollectionNodeEvents;
              if (where?.collection_id) {
                results = where.collection_id.in
                  ? results.filter((e: any) => where.collection_id.in.includes(e.collection_id))
                  : results.filter((e: any) => e.collection_id === where.collection_id);
              }
              if (where?.node_id) {
                results = results.filter((e: any) => e.node_id === where.node_id);
              }
              if (where?.event_type) {
                results = results.filter((e: any) => e.event_type === where.event_type);
              }
              if (where?.actor_id) {
                results = results.filter((e: any) => e.actor_id === where.actor_id);
              }
              if (where?.occurred_at?.lte) {
                const cutoff = new Date(where.occurred_at.lte);
                results = results.filter((e: any) => new Date(e.occurred_at) <= cutoff);
              }
              if (where?.occurred_at?.gte) {
                const cutoff = new Date(where.occurred_at.gte);
                results = results.filter((e: any) => new Date(e.occurred_at) >= cutoff);
              }
              if (args?.orderBy?.occurred_at === 'desc') {
                results = [...results].sort(
                  (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
                );
              } else if (args?.orderBy?.occurred_at === 'asc') {
                results = [...results].sort(
                  (a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime(),
                );
              }
              if (args?.take) {
                results = results.slice(0, args.take);
              }
              return results;
            };
          }
          if (name === 'userRewards') {
            return async (args: any = {}) => {
              const where = args?.where;
              if (where?.user_id && mockUserRewards && mockUserRewards.user_id === where.user_id) {
                return mockUserRewards;
              }
              return mockUserRewards;
            };
          }
          if (name === 'userRewardsVersions') {
            return async (args: any = {}) => {
              const where = args?.where;
              let results = mockUserRewardsVersions;
              if (where?.user_id) {
                results = results.filter((v: any) => v.user_id === where.user_id);
              }
              if (where?.recorded_at?.lte) {
                const cutoff = new Date(where.recorded_at.lte);
                results = results.filter((v: any) => new Date(v.recorded_at) <= cutoff);
              }
              if (args?.orderBy?.recorded_at === 'desc') {
                results = [...results].sort(
                  (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
                );
              } else if (args?.orderBy?.recorded_at === 'asc') {
                results = [...results].sort(
                  (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
                );
              }
              if (args?.take) {
                results = results.slice(0, args.take);
              }
              return results;
            };
          }
          if (name === 'whisperedMoment') {
            return async (args: any = {}) => {
              const where = args?.where;
              let results = mockWhisperedMoments;
              if (where?.user_id) {
                results = results.filter((w: any) => w.user_id === where.user_id);
              }
              if (args?.orderBy?.created_at === 'desc') {
                results = [...results].sort(
                  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                );
              }
              if (args?.take) {
                results = results.slice(0, args.take);
              }
              return results;
            };
          }
          if (name === 'classroomNote') {
            return async (args: any = {}) => {
              const where = args?.where;
              if (where?.id) {
                return mockClassroomNotes.find((n: any) => n.id === where.id) || null;
              }
              return mockClassroomNotes[0] || null;
            };
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
          if (name === 'libraryCollection' && prop === 'update') {
            return async (args: { where: { id: string }; data: Record<string, unknown> }) => {
              const existing =
                mockLibraryCollectionRead?.id === args.where.id ? mockLibraryCollectionRead : {};
              return {
                id: args.where.id,
                name: 'Test Collection',
                description: null,
                thumbnail_url: null,
                creator_id: '123e4567-e89b-12d3-a456-426614174000',
                visibility: 'public',
                subjects: [],
                topics: [],
                grades: [],
                resource_ids: [],
                sequence_order: [],
                is_official: false,
                forks: 0,
                used_by_count: 0,
                endorsements: 0,
                estimated_duration: null,
                school_id: null,
                original_collection_id: null,
                created_at: new Date('2026-01-01T00:00:00.000Z'),
                updated_at: new Date('2026-01-01T00:00:00.000Z'),
                ...existing,
                ...args.data,
                creator: { full_name: 'Mock User', avatar_url: null },
                collection_nodes: [],
              };
            };
          }
          if (name === 'resourceEngagement' && prop === 'create') {
            return async (args: {
              data: {
                resource_id: string;
                user_id: string;
                engagement_type: string;
                classroom_id?: string | null;
              };
            }) => ({
              id: 'a23e4567-e89b-12d3-a456-426614174000',
              ...args.data,
              classroom_id: args.data.classroom_id ?? null,
              created_at: new Date('2026-01-01T00:00:00.000Z'),
            });
          }
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
          if (name === 'groupMember' && prop === 'create') {
            return async (args: { data: Record<string, unknown> }) => ({
              id: '523e4567-e89b-12d3-a456-426614174000',
              joined_at: null,
              ...args.data,
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
          if (name === 'communityComment' && prop === 'create') {
            return async (args: any = {}) => ({
              id: '423e4567-e89b-12d3-a456-426614174000',
              post_id: args?.data?.post_id ?? '123e4567-e89b-12d3-a456-426614174000',
              author_id: args?.data?.author_id ?? '123e4567-e89b-12d3-a456-426614174000',
              content: args?.data?.content ?? '',
              is_anonymous: Boolean(args?.data?.is_anonymous),
              is_official_answer: false,
              upvote_count: 0,
              created_at: new Date(),
              updated_at: new Date(),
              author: { full_name: 'Mock User', avatar_url: null },
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
          if (name === 'gradeMark' && prop === 'create') {
            return async (args: any = {}) => ({
              id: args?.data?.id ?? crypto.randomUUID(),
              created_at: new Date(),
              updated_at: new Date(),
              publication_state: 'draft',
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
              author: { full_name: 'Mock User', avatar_url: null },
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
          if (name === 'moodLog' && prop === 'create') {
            return async (args: any = {}) => {
              const newLog = {
                id: `mood-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                user_id: args?.data?.user_id ?? 'mock-user-id',
                mood_score: args?.data?.mood_score ?? 0,
                mood: args?.data?.mood ?? null,
                note: args?.data?.note ?? null,
                created_at: new Date(),
              };
              mockMoodLogs.unshift(newLog);
              return newLog;
            };
          }
          if (name === 'fireJournalEntry' && prop === 'create') {
            return async (args: any = {}) => {
              const content = args?.data?.content_preview ?? '';
              const newEntry = {
                id: `journal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                user_id: args?.data?.user_id ?? 'mock-user-id',
                content_preview: content.substring(0, 50),
                is_burned: true,
                created_at: new Date(),
              };
              mockFireJournalEntries.unshift(newEntry);
              return newEntry;
            };
          }
          if (name === 'thoughtRecord' && prop === 'create') {
            return async (args: any = {}) => {
              const newRecord = {
                id: `thought-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                user_id: args?.data?.user_id ?? 'mock-user-id',
                ...args?.data,
                created_at: new Date(),
              };
              mockThoughtRecords.unshift(newRecord);
              return newRecord;
            };
          }
          if (name === 'thoughtRecord' && prop === 'update') {
            return async (args: any = {}) => {
              const where = args?.where;
              const index = mockThoughtRecords.findIndex((t: any) => t.id === where?.id);
              if (index >= 0) {
                mockThoughtRecords[index] = { ...mockThoughtRecords[index], ...args?.data };
                return mockThoughtRecords[index];
              }
              return null;
            };
          }
          if (name === 'userPreferences' && (prop === 'create' || prop === 'update')) {
            return async (args: any = {}) => {
              const updated = {
                ...mockUserPreferences,
                ...args?.data,
                updated_at: new Date(),
              };
              mockUserPreferences = updated;
              return updated;
            };
          }
          if (name === 'userRewards' && (prop === 'create' || prop === 'update')) {
            return async (args: any = {}) => {
              const updated = {
                id: mockUserRewards?.id ?? '823e4567-e89b-12d3-a456-426614174000',
                ...mockUserRewards,
                ...args?.data,
                created_at: mockUserRewards?.created_at ?? new Date(),
                updated_at: new Date(),
              };
              mockUserRewards = updated;
              return updated;
            };
          }
          if (name === 'userRewardsVersions' && prop === 'create') {
            return async (args: any = {}) => {
              const newVersion = {
                id: `vr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                user_id: args?.data?.user_id ?? 'mock-user-id',
                ...args?.data,
                recorded_at: new Date(),
              };
              mockUserRewardsVersions.unshift(newVersion);
              return newVersion;
            };
          }
          if (name === 'whisperedMoment' && prop === 'create') {
            return async (args: any = {}) => {
              const newMoment = {
                id: `wm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                user_id: args?.data?.user_id ?? 'mock-user-id',
                ...args?.data,
                created_at: new Date(),
              };
              mockWhisperedMoments.unshift(newMoment);
              return newMoment;
            };
          }
          if (name === 'classroomNote' && (prop === 'create' || prop === 'update')) {
            return async (args: any = {}) => {
              const where = args?.where;
              const index = mockClassroomNotes.findIndex((n: any) => n.id === where?.id);
              if (prop === 'create' || index < 0) {
                const newNote = {
                  id: `cn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                  ...args?.data,
                  created_at: new Date(),
                  updated_at: new Date(),
                };
                mockClassroomNotes.unshift(newNote);
                return newNote;
              }
              mockClassroomNotes[index] = {
                ...mockClassroomNotes[index],
                ...args?.data,
                updated_at: new Date(),
              };
              return mockClassroomNotes[index];
            };
          }
          if (name === 'collectionNodeEvent' && prop === 'create') {
            return async (args: any = {}) => {
              const newEvent = {
                id: `cne-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                ...args?.data,
                occurred_at: new Date(),
              };
              mockCollectionNodeEvents.unshift(newEvent);
              return newEvent;
            };
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
          if (
            [
              'classroom',
              'classroomStudent',
              'material',
              'assignment',
              'assignmentSubmission',
            ].includes(name)
          ) {
            return async (args: any = {}) => {
              const id = args.where?.id ?? args.data?.id ?? crypto.randomUUID();
              const data = Object.fromEntries(
                Object.entries(args.data ?? {}).filter(([, value]) => value !== undefined),
              );
              const row = {
                id,
                created_at: new Date(),
                updated_at: new Date(),
                ...(name === 'classroom' ? { academic_year: '2026' } : {}),
                ...(name === 'classroomStudent' ? { enrolled_at: new Date() } : {}),
                ...(name === 'assignmentSubmission'
                  ? {
                      submitted_at: new Date(),
                      classroom_id: '123e4567-e89b-12d3-a456-426614174001',
                    }
                  : {}),
                ...mockEducationalRows.get(`${name}:${id}`),
                ...data,
              };
              mockEducationalRows.set(`${name}:${id}`, row);
              return row;
            };
          }
          return async (args: any = {}) => ({
            id: `${name}-mock-id`,
            ...(args?.data ?? {}),
          });
        }

        if (prop === 'findMany') {
          if (name === 'bond') return async () => (mockActiveBond ? [mockActiveBond] : []);
          if (name === 'classroom')
            return async (args: any = {}) => {
              const where = args?.where ?? {};
              let results = mockClassrooms;
              if (where.teacher_id)
                results = results.filter((row) => row.teacher_id === where.teacher_id);
              if (where.school_id)
                results = results.filter((row) => row.school_id === where.school_id);
              if (args?.select) {
                results = results.map((row) => {
                  const selected: any = {};
                  for (const key of Object.keys(args.select)) selected[key] = row[key];
                  return selected;
                });
              }
              return results;
            };
          if (name === 'classroomStudent')
            return async (args: any = {}) => {
              const where = args?.where ?? {};
              let results = mockClassroomStudents;
              if (where.student_id)
                results = results.filter((row) => row.student_id === where.student_id);
              return args?.select
                ? results.map((row) => {
                    const selected: any = {};
                    for (const key of Object.keys(args.select)) selected[key] = row[key];
                    return selected;
                  })
                : results;
            };
          if (name === 'user')
            return async (args: any = {}) => {
              const where = args?.where;
              let results = mockUsers.length > 0 ? mockUsers : mockUserData ? [mockUserData] : [];
              if (where?.id?.in) {
                results = results.filter((u: any) => where.id.in.includes(u.id));
              }
              if (args?.select) {
                results = results.map((u: any) => {
                  const selected: any = {};
                  for (const key of Object.keys(args.select)) {
                    selected[key] = u[key];
                  }
                  return selected;
                });
              }
              return results;
            };
          if (name === 'moodLog')
            return async (args: any = {}) => {
              const where = args?.where;
              let results = mockMoodLogs;
              if (where?.user_id) {
                results = results.filter((l: any) => l.user_id === where.user_id);
              }
              if (where?.created_at?.gte) {
                const cutoff = new Date(where.created_at.gte);
                results = results.filter((l: any) => new Date(l.created_at) >= cutoff);
              }
              if (where?.created_at?.lt) {
                const cutoff = new Date(where.created_at.lt);
                results = results.filter((l: any) => new Date(l.created_at) < cutoff);
              }
              if (args?.orderBy?.created_at === 'desc') {
                results = [...results].sort(
                  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                );
              }
              if (args?.take) {
                results = results.slice(0, args.take);
              }
              return results;
            };
          if (name === 'fireJournalEntry')
            return async (args: any = {}) => {
              const where = args?.where;
              let results = mockFireJournalEntries;
              if (where?.user_id) {
                results = results.filter((e: any) => e.user_id === where.user_id);
              }
              if (where?.created_at?.gte) {
                const cutoff = new Date(where.created_at.gte);
                results = results.filter((e: any) => new Date(e.created_at) >= cutoff);
              }
              if (where?.created_at?.lt) {
                const cutoff = new Date(where.created_at.lt);
                results = results.filter((e: any) => new Date(e.created_at) < cutoff);
              }
              if (args?.orderBy?.created_at === 'desc') {
                results = [...results].sort(
                  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                );
              }
              if (args?.take) {
                results = results.slice(0, args.take);
              }
              return results;
            };
          if (name === 'thoughtRecord')
            return async (args: any = {}) => {
              const where = args?.where;
              let results = mockThoughtRecords;
              if (where?.user_id) {
                results = results.filter((t: any) => t.user_id === where.user_id);
              }
              if (args?.orderBy?.created_at === 'desc') {
                results = [...results].sort(
                  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                );
              }
              if (args?.take) {
                results = results.slice(0, args.take);
              }
              return results;
            };
          if (name === 'libraryCollection')
            return async (args: any = {}) => {
              mockLibraryCollectionFindManyArgs = args;
              return mockLibraryCollections;
            };
          if (name === 'libraryResource') return async () => mockLibraryResources;
          if (name === 'collectionNodeEvent')
            return async (args: any = {}) => {
              const where = args?.where;
              let results = mockCollectionNodeEvents;
              if (where?.collection_id) {
                results = where.collection_id.in
                  ? results.filter((e: any) => where.collection_id.in.includes(e.collection_id))
                  : results.filter((e: any) => e.collection_id === where.collection_id);
              }
              if (where?.node_id) {
                results = results.filter((e: any) => e.node_id === where.node_id);
              }
              if (where?.event_type) {
                results = results.filter((e: any) => e.event_type === where.event_type);
              }
              if (where?.actor_id) {
                results = results.filter((e: any) => e.actor_id === where.actor_id);
              }
              if (where?.occurred_at?.lte) {
                const cutoff = new Date(where.occurred_at.lte);
                results = results.filter((e: any) => new Date(e.occurred_at) <= cutoff);
              }
              if (where?.occurred_at?.gte) {
                const cutoff = new Date(where.occurred_at.gte);
                results = results.filter((e: any) => new Date(e.occurred_at) >= cutoff);
              }
              if (args?.orderBy?.occurred_at === 'desc') {
                results = [...results].sort(
                  (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
                );
              } else if (args?.orderBy?.occurred_at === 'asc') {
                results = [...results].sort(
                  (a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime(),
                );
              }
              if (args?.take) {
                results = results.slice(0, args.take);
              }
              return results;
            };
          if (name === 'userRewards')
            return async (args: any = {}) => {
              const where = args?.where;
              let results = mockUserRewards ? [mockUserRewards] : [];
              if (where?.user_id) {
                results = results.filter((r: any) => r.user_id === where.user_id);
              }
              return results;
            };
          if (name === 'userRewardsVersions')
            return async (args: any = {}) => {
              const where = args?.where;
              let results = mockUserRewardsVersions;
              if (where?.user_id) {
                results = results.filter((v: any) => v.user_id === where.user_id);
              }
              if (where?.recorded_at?.lte) {
                const cutoff = new Date(where.recorded_at.lte);
                results = results.filter((v: any) => new Date(v.recorded_at) <= cutoff);
              }
              if (where?.recorded_at?.gte) {
                const cutoff = new Date(where.recorded_at.gte);
                results = results.filter((v: any) => new Date(v.recorded_at) >= cutoff);
              }
              if (args?.orderBy?.recorded_at === 'desc') {
                results = [...results].sort(
                  (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
                );
              } else if (args?.orderBy?.recorded_at === 'asc') {
                results = [...results].sort(
                  (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
                );
              }
              if (args?.take) {
                results = results.slice(0, args.take);
              }
              return results;
            };
          if (name === 'whisperedMoment')
            return async (args: any = {}) => {
              const where = args?.where;
              let results = mockWhisperedMoments;
              if (where?.user_id) {
                results = results.filter((w: any) => w.user_id === where.user_id);
              }
              if (args?.orderBy?.created_at === 'desc') {
                results = [...results].sort(
                  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                );
              }
              if (args?.take) {
                results = results.slice(0, args.take);
              }
              return results;
            };
          if (name === 'classroomNote')
            return async (args: any = {}) => {
              const where = args?.where;
              let results = mockClassroomNotes;
              if (where?.id) {
                results = results.filter((n: any) => n.id === where.id);
              }
              return results;
            };
          if (name === 'libraryCollection')
            return async (args: any = {}) => {
              mockLibraryCollectionFindManyArgs = args;
              return mockLibraryCollections;
            };
          return async () => [];
        }
        if (prop === 'findFirst') {
          if (name === 'bond') {
            return async (args: any = {}) => {
              if (
                args?.where?.entity_type === 'PERSONAL_CLASSROOM' &&
                mockActiveBond?.entity_type !== 'PERSONAL_CLASSROOM'
              )
                return null;
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
          if (name === 'gradeClassTeacherAssignment') {
            return async (args: any = {}) => ({
              id: 'gcta-mock-1',
              grade_class_id: args?.where?.grade_class_id ?? '123e4567-e89b-12d3-a456-426614174004',
              academic_cycle_id: args?.where?.academic_cycle_id ?? '123e4567-e89b-12d3-a456-426614174010',
              teacher_id: args?.where?.teacher_id ?? '123e4567-e89b-12d3-a456-426614174000',
              status: 'active',
              effective_from: new Date('2020-01-01'),
              effective_to: null,
            });
          }
          if (name === 'moodLog') {
            return async (args: any = {}) => {
              const where = args?.where;
              let results = mockMoodLogs;
              if (where?.user_id) {
                results = results.filter((l: any) => l.user_id === where.user_id);
              }
              if (where?.created_at?.gte) {
                const cutoff = new Date(where.created_at.gte);
                results = results.filter((l: any) => new Date(l.created_at) >= cutoff);
              }
              if (args?.orderBy?.created_at === 'desc') {
                results = [...results].sort(
                  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                );
              }
              return results[0] || null;
            };
          }
          if (name === 'communityPollVote') return async () => null;
          if (name === 'userRewardsVersions') {
            return async (args: any = {}) => {
              const where = args?.where;
              let results = mockUserRewardsVersions;
              if (where?.user_id) {
                results = results.filter((v: any) => v.user_id === where.user_id);
              }
              if (where?.recorded_at?.lte) {
                const cutoff = new Date(where.recorded_at.lte);
                results = results.filter((v: any) => new Date(v.recorded_at) <= cutoff);
              }
              if (args?.orderBy?.recorded_at === 'desc') {
                results = [...results].sort(
                  (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
                );
              }
              return results[0] || null;
            };
          }
          return async () => null;
        }

        if (prop === 'count') return async () => 0;

        if (prop === '$transaction') {
          return async (callback: (tx: any) => Promise<any>) => callback(mockDb);
        }
        if (prop === '$queryRaw') {
          return queryMockRawRows;
        }
        if (prop === '$executeRaw') return executeMockRaw;

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
        return queryMockRawRows;
      }
      if (prop === '$executeRaw') return executeMockRaw;
      if (prop === '$queryRawUnsafe') {
        return async () => [];
      }
      return createMockDelegate(String(prop));
    },
  },
);

vi.mock('@repo/database/client', () => ({
  queryDatabaseRows: async <T>(query: string, parameters: readonly unknown[] = []) => {
    if (query.includes('public.auth_identities')) {
      mockAuthIdentityLookup = { query, parameters };
      if (mockAuthIdentityError) throw mockAuthIdentityError;
      const subject = String(parameters[0]);
      // Existing UUID fixtures model migrated mappings with identical IDs.
      const accountId = mockAuthIdentities.has(subject)
        ? mockAuthIdentities.get(subject)
        : (legacyAuthFixtureAccounts[subject] ?? subject);
      return (accountId ? [{ user_id: accountId }] : []) as T[];
    }
    mockLastDatabaseQueryArgs = [query, parameters];
    return (mockQueryRowsQueue.shift() ?? []) as T[];
  },
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
