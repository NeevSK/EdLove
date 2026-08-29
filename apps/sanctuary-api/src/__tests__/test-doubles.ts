import { vi } from 'vitest';

// ============================================
// Test Doubles Architecture
// ============================================
// Clean, type-safe test doubles system. Each model gets its own mock class with a fluent API.

// -----------------------------------------------------------------------------
// Base Types & Utilities
// -----------------------------------------------------------------------------

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type WhereClause<T> = {
  [K in keyof T]?: T[K] | { in?: T[K][]; gte?: T[K]; lte?: T[K] };
};

interface FindManyArgs<T> {
  where?: WhereClause<T>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  take?: number;
  select?: Record<keyof T, true>;
}

interface ModelMock<T> {
  findUnique: (args: { where: WhereClause<T> }) => Promise<T | null>;
  findMany: (args?: FindManyArgs<T>) => Promise<T[]>;
  findFirst: (args?: FindManyArgs<T>) => Promise<T | null>;
  create: (args: { data: DeepPartial<T> }) => Promise<T>;
  update: (args: { where: WhereClause<T>; data: DeepPartial<T> }) => Promise<T | null>;
  upsert: (args: { where: WhereClause<T>; create: DeepPartial<T>; update: DeepPartial<T> }) => Promise<T>;
  delete: (args: { where: WhereClause<T> }) => Promise<T | null>;
  deleteMany: (args: { where?: WhereClause<T> }) => Promise<{ count: number }>;
  count: (args: { where?: WhereClause<T> }) => Promise<number>;
}

// -----------------------------------------------------------------------------
// Model Definitions
// -----------------------------------------------------------------------------

interface MoodLog {
  id: string;
  user_id: string;
  mood_score: number;
  mood: string | null;
  note: string | null;
  created_at: Date | string;
}

interface FireJournalEntry {
  id: string;
  user_id: string;
  content_preview: string;
  is_burned: boolean;
  created_at: Date | string;
}

interface ThoughtRecord {
  id: string;
  user_id: string;
  thought: string;
  situation: string | null;
  emotion: string | null;
  trap_ids: string[] | null;
  evidence_for: string | null;
  evidence_against: string | null;
  reframe: string | null;
  mood_before: number | null;
  mood_after: number | null;
  post_outcome: string | null;
  follow_up: any | null;
  idempotency_key: string | null;
  created_at: Date | string;
}

interface UserPreferences {
  id: string;
  user_id: string;
  favorite_features: string[];
  hidden_features: string[];
  morning_check_time: string | null;
  afternoon_check_time: string | null;
  evening_wind_down_time: string | null;
  enable_contextual_prompts: boolean;
  enable_usage_tracking: boolean;
  notification_settings: any | null;
  created_at: Date | string;
  updated_at: Date | string;
}

interface CollectionNodeEvent {
  id: string;
  collection_id: string;
  node_id: string;
  event_type: 'added' | 'removed' | 'reordered';
  position: number | null;
  occurred_at: Date | string;
  actor_id: string | null;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  onboarding_completed: boolean;
  onboarding_state: string;
}

interface UserRewards {
  id: string;
  user_id: string;
  points: number;
  badges: string[];
  created_at: Date | string;
  updated_at: Date | string;
}

interface UserRewardsVersions {
  id: string;
  user_id: string;
  operation: string;
  recorded_at: Date | string;
  recorded_by: string | null;
  snapshot: any | null;
}

interface WhisperedMoment {
  id: string;
  user_id: string;
  key: string;
  name: string;
  description: string | null;
  stage: string;
  created_at: Date | string;
}

interface ClassroomNote {
  id: string;
  created_at: Date | string;
  updated_at: Date | string;
}

interface Bond {
  id: string;
  user_id: string;
  entity_id: string;
  entity_type: 'SCHOOL' | 'PLATFORM';
  capacity: string;
  status: string;
}

interface SanctuaryManifesto {
  id: string;
  school_id: string;
}

// -----------------------------------------------------------------------------
// Mock Factory - Creates independent, isolated mock instances
// -----------------------------------------------------------------------------

function createModelMock<T extends { id?: string }>(initialData: T[] = []): ModelMock<T> {
  let data = [...initialData];
  
  const generateId = (prefix: string) => 
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  
  const matches = (item: T, where: WhereClause<T>): boolean => {
    return Object.entries(where).every(([key, value]) => {
      if (value === undefined) return true;
      if (value && typeof value === 'object' && 'in' in value) {
        return (value as any).in.includes(item[key as keyof T]);
      }
      if (value && typeof value === 'object' && 'gte' in value) {
        return new Date(item[key as keyof T] as string) >= new Date((value as any).gte);
      }
      if (value && typeof value === 'object' && 'lte' in value) {
        return new Date(item[key as keyof T] as string) <= new Date((value as any).lte);
      }
      return item[key as keyof T] === value;
    });
  };

  const mock: ModelMock<T> = {
    findUnique: async ({ where }) => {
      const results = data.filter(d => matches(d, where));
      return results[0] || null;
    },
    
    findMany: async (args: FindManyArgs<T> = {}) => {
      const { where, orderBy, take, select } = args;
      let results = data.filter(d => matches(d, where || {}));
      
      if (orderBy) {
        const [field, direction] = Object.entries(orderBy)[0];
        results = [...results].sort((a, b) => {
          const aVal = new Date((a as any)[field] as string).getTime();
          const bVal = new Date((b as any)[field] as string).getTime();
          return direction === 'desc' ? bVal - aVal : aVal - bVal;
        });
      }
      
      if (take) results = results.slice(0, take);
      
      if (select) {
        results = results.map(item => {
          const selected: any = {};
          for (const key of Object.keys(select)) {
            selected[key] = item[key as keyof T];
          }
          return selected;
        });
      }
      
      return results;
    },
    
    findFirst: async (args: FindManyArgs<T> = {}) => {
      const results = await mock.findMany({ ...args, take: 1 });
      return results[0] || null;
    },
    
    create: async ({ data: input }): Promise<T> => {
      const newRecord = { 
        ...input, 
        id: (input as any).id || `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        created_at: (input as any).created_at || new Date(),
        updated_at: (input as any).updated_at || new Date(),
      };
      data.unshift(newRecord as any);
      return newRecord as unknown as T;
    },
    
    update: async ({ where, data: input }) => {
      const index = data.findIndex(d => matches(d, where));
      if (index < 0) return null;
      data[index] = { ...data[index], ...input, updated_at: new Date() };
      return data[index];
    },
    
    upsert: async ({ where, create, update }): Promise<T> => {
      const existing = await mock.findUnique({ where });
      if (existing) {
        const updated = await mock.update({ where, data: update });
        return updated as T;
      }
      return mock.create({ data: create });
    },
    
    delete: async ({ where }) => {
      const index = data.findIndex(d => matches(d, where));
      if (index < 0) return null;
      return data.splice(index, 1)[0];
    },
    
    deleteMany: async ({ where }) => {
      const initialLength = data.length;
      data = data.filter(d => !matches(d, where || {}));
      return { count: initialLength - data.length };
    },
    
    count: async ({ where }) => {
      return (await mock.findMany({ where })).length;
    },
  };
  
  return mock;
}

// -----------------------------------------------------------------------------
// Test Database Context
// -----------------------------------------------------------------------------

interface TestDatabaseContext {
  moodLog: ModelMock<any>;
  fireJournalEntry: ModelMock<any>;
  thoughtRecord: ModelMock<any>;
  userPreferences: ModelMock<any>;
  collectionNodeEvent: ModelMock<any>;
  user: ModelMock<any>;
  userRewards: ModelMock<any>;
  userRewardsVersions: ModelMock<any>;
  whisperedMoment: ModelMock<any>;
  classroomNote: ModelMock<any>;
  bond: ModelMock<any>;
  sanctuaryManifesto: ModelMock<any>;
  $queryRaw: (strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>;
  $transaction: <T>(callback: (tx: TestDatabaseContext) => Promise<any>) => Promise<any>;
}

// -----------------------------------------------------------------------------
// Test Database Factory
// -----------------------------------------------------------------------------

function createTestDatabase(overrides: Partial<Record<keyof TestDatabaseContext, any>> = {}): TestDatabaseContext {
  const db: TestDatabaseContext = {
    moodLog: createModelMock(),
    fireJournalEntry: createModelMock(),
    thoughtRecord: createModelMock(),
    userPreferences: createModelMock(),
    collectionNodeEvent: createModelMock(),
    user: createModelMock(),
    userRewards: createModelMock(),
    userRewardsVersions: createModelMock(),
    whisperedMoment: createModelMock(),
    classroomNote: createModelMock(),
    bond: createModelMock(),
    sanctuaryManifesto: createModelMock(),
    
    $queryRaw: async () => [],
    $transaction: async (callback) => callback(db),
  };
  
  Object.assign(db, overrides);
  return db;
}

// -----------------------------------------------------------------------------
// Test Context Builder - Fluent API
// -----------------------------------------------------------------------------

class TestContextBuilder {
  private db: TestDatabaseContext;
  private activeBond: any = null;
  private zenStackAvailable = true;
  
  constructor() {
    this.db = createTestDatabase();
  }
  
  withZenStackDb(available: boolean): this {
    this.zenStackAvailable = available;
    return this;
  }
  
  withActiveBond(bond: any): this {
    this.activeBond = {
      id: 'bond-test',
      user_id: 'test-user-id',
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
      ...bond,
    };
    return this;
  }
  
  withUser(user: any): this {
    this.db.user = createModelMock([{
      id: 'test-user-id',
      email: 'test@example.com',
      full_name: 'Test User',
      onboarding_completed: true,
      onboarding_state: 'COMPLETED',
      ...user,
    }]);
    return this;
  }
  
  withUsers(users: any[]): this {
    this.db.user = createModelMock(users.map(u => ({
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      email: 'test@example.com',
      full_name: 'Test User',
      onboarding_completed: true,
      onboarding_state: 'COMPLETED',
      ...u,
    })));
    return this;
  }
  
  withCollectionNodeEvents(events: any[]): this {
    this.db.collectionNodeEvent = createModelMock(events.map(e => ({
      id: `cne-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      collection_id: 'test-collection',
      node_id: 'test-node',
      event_type: 'added',
      position: 0,
      occurred_at: new Date(),
      actor_id: null,
      ...e,
    })));
    return this;
  }
  
  withUsersList(users: any[]): this {
    this.db.user = createModelMock(users.map(u => ({
      id: u.id || `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      email: 'test@example.com',
      full_name: 'Test User',
      onboarding_completed: true,
      onboarding_state: 'COMPLETED',
      ...u,
    })));
    return this;
  }
  
  withUserRewards(rewards: any): this {
    this.db.userRewards = createModelMock([{
      id: 'rewards-1',
      user_id: 'test-user-id',
      points: 0,
      badges: [],
      created_at: new Date(),
      updated_at: new Date(),
      ...rewards,
    }]);
    return this;
  }
  
  withUserRewardsVersions(versions: any[]): this {
    this.db.userRewardsVersions = createModelMock(versions.map(v => ({
      id: `vr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      user_id: 'test-user-id',
      operation: 'test',
      recorded_at: new Date(),
      recorded_by: 'test-user-id',
      snapshot: {},
      ...v,
    })));
    return this;
  }
  
  withWhisperedMoments(moments: any[]): this {
    this.db.whisperedMoment = createModelMock(moments.map(m => ({
      id: `wm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      user_id: 'test-user-id',
      key: 'test',
      name: 'Test Moment',
      description: 'Test description',
      stage: 'test',
      created_at: new Date(),
      ...m,
    })));
    return this;
  }
  
  withFeatureUsage(features: string[]): this {
    // Mock queryDatabaseRows for feature_usage_log queries
    // This would need to be implemented in the queryDatabaseRows mock
    // For now, we'll just note it
    return this;
  }
  
  build(): any {
    if (this.activeBond) {
      this.db.bond = createModelMock([this.activeBond]);
    }
    return this.db;
  }
  
  getDatabase() {
    return this.db;
  }
}

// -----------------------------------------------------------------------------
// Test ORPC Client Factory
// -----------------------------------------------------------------------------

let _app: any = null;

function getApp() {
  if (!_app) {
    const mod = require('../core/app');
    _app = mod.app;
  }
  return _app;
}

function createTestORPCClient(headers: Record<string, string> = {}) {
  const { createORPCClient } = require('@orpc/client');
  const { RPCLink } = require('@orpc/client/fetch');
  const app = getApp();
  
  const link = new RPCLink<any>({
    url: 'http://sanctuary.test/api',
    headers,
    fetch: async (request: Request, init: RequestInit) => app.fetch(new Request(request, init)),
  });
  
  return createORPCClient<any>(link);
}

// -----------------------------------------------------------------------------
// Global Test Database (for backward compatibility)
// -----------------------------------------------------------------------------

let _globalTestDb: any = null;

export function getTestDatabase() {
  if (!_globalTestDb) {
    _globalTestDb = new TestContextBuilder().build();
  }
  return _globalTestDb;
}

export function resetTestDatabase(builder?: (b: any) => any): any {
  const builderFn = builder || (b => b);
  _globalTestDb = builderFn(new TestContextBuilder()).build();
  return _globalTestDb;
}

// -----------------------------------------------------------------------------
// Export all utilities
// -----------------------------------------------------------------------------

export {
  createModelMock,
  createTestDatabase,
  TestContextBuilder,
  createTestORPCClient,
};

export type {
  TestDatabaseContext,
  ModelMock,
  WhereClause,
  FindManyArgs,
};

export { vi };